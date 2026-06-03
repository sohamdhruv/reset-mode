export const DANGER_MESSAGES = [
  "Your danger zone is starting. Lock your phone away.",
  "You have beaten this before. Do it again right now.",
  "Open Reset Mode instead. 2 minutes is all you need.",
  "What would your future self choose right now?",
  "You are stronger than this urge. Prove it.",
  "Pause. Breathe. Redirect.",
  "Do not negotiate with the urge. Change your environment.",
];

export const GOAL_DANGER_MESSAGES = (goal: string) => [
  `Remember your goal: ${goal}. Protect it today.`,
  `Do not trade your future for a temporary urge.`,
  `Your danger zone is starting. Stay close to your goal.`,
  `Open Reset Mode for 2 minutes and protect ${goal}.`,
  `Your future self is built by this choice.`,
];

export const GOAL_MORNING_MESSAGES = (goal: string) => [
  `Good morning. Your goal today: ${goal}. Make it count.`,
  `Start strong. Remember what you are building: ${goal}.`,
  `Today is another step toward ${goal}. Stay on track.`,
];

let messageIndex = 0;
let goalMessageIndex = 0;

export function nextDangerMessage(goal?: string): string {
  if (goal) {
    const messages = GOAL_DANGER_MESSAGES(goal);
    const msg = messages[goalMessageIndex % messages.length];
    goalMessageIndex++;
    return msg;
  }
  const msg = DANGER_MESSAGES[messageIndex % DANGER_MESSAGES.length];
  messageIndex++;
  return msg;
}

export function nextMorningGoalMessage(goal: string): string {
  const messages = GOAL_MORNING_MESSAGES(goal);
  return messages[Math.floor(Math.random() * messages.length)];
}

// ─── Browser Notification API ────────────────────────────────────────────────

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export function sendBrowserNotification(message: string): boolean {
  if (!notificationsSupported() || Notification.permission !== "granted") return false;
  try {
    new Notification("Reset Mode", {
      body: message,
      icon: "/favicon.ico",
      tag: "danger-zone",
      renotify: true,
    });
    return true;
  } catch {
    return false;
  }
}

// ─── In-app event bus (fallback when push not granted) ────────────────────────

const IN_APP_EVENT = "resetMode:inAppReminder";

export function fireInAppReminder(message: string) {
  window.dispatchEvent(new CustomEvent(IN_APP_EVENT, { detail: { message } }));
}

export function onInAppReminder(handler: (message: string) => void): () => void {
  const listener = (e: Event) => {
    handler((e as CustomEvent<{ message: string }>).detail.message);
  };
  window.addEventListener(IN_APP_EVENT, listener);
  return () => window.removeEventListener(IN_APP_EVENT, listener);
}

// ─── Time window helpers ──────────────────────────────────────────────────────

/** Convert "HH:MM" to total minutes since midnight */
export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Returns true if the current time is within [start, end).
 * Handles overnight windows (e.g. 22:00 – 02:00).
 */
export function isInDangerWindow(start: string, end: string): boolean {
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const startMins = timeToMinutes(start);
  const endMins = timeToMinutes(end);

  if (startMins <= endMins) {
    // Normal window, e.g. 06:00 – 09:00
    return currentMins >= startMins && currentMins < endMins;
  } else {
    // Overnight window, e.g. 22:00 – 02:00
    return currentMins >= startMins || currentMins < endMins;
  }
}
