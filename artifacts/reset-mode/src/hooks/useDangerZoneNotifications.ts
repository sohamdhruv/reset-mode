import { useEffect, useRef } from "react";
import { useStorage, DEFAULT_SETTINGS } from "@/lib/storage";
import type { Settings } from "@/lib/storage";
import {
  isInDangerWindow,
  nextDangerMessage,
  nextMorningGoalMessage,
  sendBrowserNotification,
  fireInAppReminder,
  timeToMinutes,
} from "@/lib/notifications";

const INTENSITY_MS: Record<string, number> = {
  light: 30 * 60 * 1000,
  normal: 15 * 60 * 1000,
  strong: 10 * 60 * 1000,
};

export function useDangerZoneNotifications() {
  const [settings] = useStorage<Settings>("resetMode_settings", DEFAULT_SETTINGS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const morningFiredRef = useRef<string | null>(null); // tracks which day the morning reminder fired

  const s = { ...DEFAULT_SETTINGS, ...settings };

  // ── Danger zone interval ────────────────────────────────────────────────────
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!s.dangerZoneEnabled) return;

    const intervalMs = INTENSITY_MS[s.dangerZoneIntensity] ?? INTENSITY_MS.normal;
    const goal = s.dangerZoneGoalReminderEnabled && s.userGoal ? s.userGoal : undefined;

    async function fire() {
      if (!isInDangerWindow(s.dangerZoneStart, s.dangerZoneEnd)) return;
      const message = nextDangerMessage(goal);
      const sent = await sendBrowserNotification(message);
      if (!sent) fireInAppReminder(message);
    }

    fire();
    intervalRef.current = setInterval(fire, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [
    s.dangerZoneEnabled,
    s.dangerZoneStart,
    s.dangerZoneEnd,
    s.dangerZoneIntensity,
    s.dangerZoneGoalReminderEnabled,
    s.userGoal,
  ]);

  // ── Morning goal reminder — polls every minute, fires once per day ──────────
  useEffect(() => {
    if (!s.morningGoalReminderEnabled || !s.userGoal) return;

    const checkMorning = async () => {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      if (morningFiredRef.current === today) return; // already fired today

      const currentMins = now.getHours() * 60 + now.getMinutes();
      const targetMins = timeToMinutes(s.goalReminderTime);

      // Fire when we cross the target minute
      if (currentMins >= targetMins && currentMins < targetMins + 2) {
        morningFiredRef.current = today;
        const message = nextMorningGoalMessage(s.userGoal);
        const sent = await sendBrowserNotification(message);
        if (!sent) fireInAppReminder(message);
      }
    };

    checkMorning(); // check immediately on mount
    const id = setInterval(checkMorning, 60_000); // check every minute
    return () => clearInterval(id);
  }, [s.morningGoalReminderEnabled, s.userGoal, s.goalReminderTime]);
}
