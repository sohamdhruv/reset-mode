import { useEffect, useRef } from "react";
import { useStorage } from "@/lib/storage";
import type { Settings } from "@/lib/storage";
import {
  isInDangerWindow,
  nextDangerMessage,
  sendBrowserNotification,
  fireInAppReminder,
} from "@/lib/notifications";

const INTENSITY_MS: Record<string, number> = {
  light: 30 * 60 * 1000,
  normal: 15 * 60 * 1000,
  strong: 10 * 60 * 1000,
};

const DEFAULT_SETTINGS: Settings = {
  morningTime: "08:00",
  eveningTime: "20:00",
  lateNightTime: "22:30",
  riskyStart: "21:00",
  riskyEnd: "23:00",
  morningEnabled: true,
  eveningEnabled: true,
  lateNightEnabled: true,
  riskyEnabled: true,
  dangerZoneEnabled: false,
  dangerZoneStart: "22:00",
  dangerZoneEnd: "02:00",
  dangerZoneIntensity: "normal",
  dangerZonePreset: "late_night",
};

export function useDangerZoneNotifications() {
  const [settings] = useStorage<Settings>("resetMode_settings", DEFAULT_SETTINGS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!settings.dangerZoneEnabled) return;

    const intervalMs = INTENSITY_MS[settings.dangerZoneIntensity] ?? INTENSITY_MS.normal;

    function fire() {
      if (!isInDangerWindow(settings.dangerZoneStart, settings.dangerZoneEnd)) return;
      const message = nextDangerMessage();
      const sent = sendBrowserNotification(message);
      if (!sent) {
        // App is open or push not granted — use in-app reminder instead
        fireInAppReminder(message);
      }
    }

    // Check immediately on mount (in case app opens mid-window)
    fire();

    intervalRef.current = setInterval(fire, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [
    settings.dangerZoneEnabled,
    settings.dangerZoneStart,
    settings.dangerZoneEnd,
    settings.dangerZoneIntensity,
  ]);
}
