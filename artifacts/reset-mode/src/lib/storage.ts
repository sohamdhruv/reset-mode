import { useState, useEffect, useCallback } from "react";

export type HabitType =
  | "porn"
  | "dating_apps"
  | "scrolling"
  | "spending"
  | "other"
  | "social_media"
  | "all"
  | null;
export type DangerZonePreset = "late_night" | "early_morning" | "afternoon" | "anytime" | "custom";
export type DangerZoneIntensity = "light" | "normal" | "strong";
export type DotColor = "gold" | "green" | "silver";

export const HABIT_LABELS: Record<NonNullable<HabitType>, string> = {
  porn: "Porn",
  dating_apps: "Dating apps",
  scrolling: "Endless scrolling",
  spending: "Spending on apps",
  other: "Other unwanted habit",
  // legacy values mapped to the closest current label
  social_media: "Endless scrolling",
  all: "Other unwanted habit",
};

export function habitLabel(habit: HabitType): string {
  return habit ? HABIT_LABELS[habit] : "";
}

export interface Spending {
  id: string;
  appName: string;
  monthlySub: number;
  monthlyBoosts: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  trigger: string;
  appWanted: string;
  didInstead: string;
}

export type GoalDistraction = "yes" | "sometimes" | "no" | "";

export interface Settings {
  morningTime: string;
  eveningTime: string;
  lateNightTime: string;
  riskyStart: string;
  riskyEnd: string;
  morningEnabled: boolean;
  eveningEnabled: boolean;
  lateNightEnabled: boolean;
  riskyEnabled: boolean;
  // Danger Zone
  dangerZoneEnabled: boolean;
  dangerZoneStart: string;
  dangerZoneEnd: string;
  dangerZoneIntensity: DangerZoneIntensity;
  dangerZonePreset: DangerZonePreset;
  // Goal reminders
  userGoal: string;
  goalDistraction: GoalDistraction;
  morningGoalReminderEnabled: boolean;
  dangerZoneGoalReminderEnabled: boolean;
  goalReminderTime: string;
  // Breathing
  dotColor: DotColor;
}

export const DEFAULT_SETTINGS: Settings = {
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
  userGoal: "",
  goalDistraction: "",
  morningGoalReminderEnabled: false,
  dangerZoneGoalReminderEnabled: false,
  goalReminderTime: "08:00",
  dotColor: "gold",
};

// Event target for cross-tab or cross-component reactivity
const storageEventTarget = new EventTarget();

export function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
}

export function setStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  storageEventTarget.dispatchEvent(new Event(key));
  window.dispatchEvent(new Event("storage"));
}

export function useStorage<T>(key: string, defaultValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => getStorage(key, defaultValue));

  useEffect(() => {
    const handleStorageChange = () => {
      setState(getStorage(key, defaultValue));
    };
    storageEventTarget.addEventListener(key, handleStorageChange);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      storageEventTarget.removeEventListener(key, handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, defaultValue]);

  const setValue = useCallback((val: T | ((prev: T) => T)) => {
    setState((prev) => {
      const nextVal = val instanceof Function ? val(prev) : val;
      setStorage(key, nextVal);
      return nextVal;
    });
  }, [key]);

  return [state, setValue];
}

// Derived helpers
export function useStreakInfo() {
  const [cleanDays] = useStorage<string[]>("resetMode_cleanDays", []);

  let currentStreak = 0;
  let bestStreak = 0;

  const sortedDays = Array.from(new Set(cleanDays)).sort().reverse();

  const today = new Date().toISOString().split("T")[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split("T")[0];

  let tempStreak = 0;
  let expectedNextDay = sortedDays.length > 0 && (sortedDays[0] === today || sortedDays[0] === yesterday) ? sortedDays[0] : null;

  for (let i = 0; i < sortedDays.length; i++) {
    const d = new Date(sortedDays[i]);
    const nextD = expectedNextDay ? new Date(expectedNextDay) : null;

    if (nextD && d.getTime() === nextD.getTime()) {
      tempStreak++;
      if (i === sortedDays.length - 1 || new Date(sortedDays[i + 1]).getTime() !== d.getTime() - 86400000) {
        if (tempStreak > bestStreak) bestStreak = tempStreak;
        if (expectedNextDay === today || expectedNextDay === yesterday) {
          if (i === tempStreak - 1) {
            currentStreak = tempStreak;
          }
        }
        tempStreak = 0;
      }
    }
    expectedNextDay = new Date(d.getTime() - 86400000).toISOString().split("T")[0];
  }

  if (sortedDays.length > 0 && bestStreak === 0) bestStreak = 1;
  if (sortedDays.length > 0 && currentStreak === 0 && (sortedDays[0] === today || sortedDays[0] === yesterday)) {
    currentStreak = 1;
  }

  return { currentStreak, bestStreak, cleanDays };
}

export function useUrgesDefeated() {
  return useStorage<number>("resetMode_urgesDefeated", 0);
}

export function useStartDate() {
  return useStorage<string | null>("resetMode_startDate", null);
}

export function useSpendings() {
  return useStorage<Spending[]>("resetMode_spendings", []);
}

export function useJournalEntries() {
  return useStorage<JournalEntry[]>("resetMode_journalEntries", []);
}

export function usePlanCompleted() {
  return useStorage<number[]>("resetMode_planCompleted", []);
}

export function useSettings() {
  return useStorage<Settings>("resetMode_settings", DEFAULT_SETTINGS);
}
