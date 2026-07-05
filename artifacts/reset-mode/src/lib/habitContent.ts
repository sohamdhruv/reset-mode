import type { HabitType } from "./storage";

// Per-habit content overrides. Any habit without an entry falls back to the
// existing generic copy, so this module is purely additive — it never changes
// behavior for habits it does not explicitly cover.

// Reminder lines used during the danger zone, tailored to the habit.
const DANGER_MESSAGES: Partial<Record<NonNullable<HabitType>, string[]>> = {
  food: [
    "The craving is loud right now. Drink a glass of water and let it pass.",
    "You are not hungry — you are triggered. Breathe before the kitchen.",
    "This late-night pull will fade. Protect tomorrow's version of you.",
    "You don't need the snack. You need one calm decision.",
    "Stress is not hunger. Reset before you reach for food.",
    "Ride the craving — don't feed it. It passes in minutes.",
    "Don't trade tomorrow's progress for tonight's snack.",
    "Your danger zone has started. Step away from the fridge and breathe.",
  ],
};

export function habitDangerMessages(habit: HabitType): string[] | undefined {
  return habit ? DANGER_MESSAGES[habit] : undefined;
}

// Motivational "daily reminder" copy shown on the dashboard, bucketed by streak.
// Returns null when the habit has no override so the caller keeps its default.
export function habitDailyReminder(habit: HabitType, streak: number): string | null {
  if (habit === "food") {
    if (streak === 0) return "Every reset starts with one clean day. Today you choose control over the craving.";
    if (streak < 7) return "Win the next craving. Water, wait ten minutes, and it passes.";
    if (streak < 14) return "You have ridden out cravings before. Do it again.";
    return "You are not giving up food. You are taking back control of when and why you eat.";
  }
  return null;
}

// Journal copy tailored to what the urge pulls the user toward.
export interface JournalCopy {
  calledByLabel: string;
  calledByPlaceholder: string;
  triggerPlaceholder: string;
}

export function habitJournalCopy(habit: HabitType): JournalCopy | null {
  if (habit === "food") {
    return {
      calledByLabel: "What food did you crave?",
      calledByPlaceholder: "e.g. Chips, ice cream, leftovers...",
      triggerPlaceholder: "e.g. Stress, boredom, late night, walked past the kitchen...",
    };
  }
  return null;
}
