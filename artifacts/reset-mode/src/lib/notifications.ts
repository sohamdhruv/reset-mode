export const DANGER_MESSAGES = [
  "Your future self is waiting. Don't disappear into the habit.",
  "You are one choice away from protecting your streak.",
  "This is the exact moment Reset Mode was built for.",
  "Don't open the old loop. Open Reset Mode.",
  "The urge is trying to pull you away. Come back.",
  "Before you give in, breathe with the light.",
  "You don't need motivation. You need one clean decision.",
  "Your danger zone has started. Protect your mind now.",
  "Don't trade tomorrow's confidence for tonight's impulse.",
  "Open Reset Mode before the habit controls you.",
];

export const GOAL_DANGER_MESSAGES = (goal: string) => [
  `Protect ${goal}. Open Reset Mode for 2 minutes.`,
  `Do not trade ${goal} for a temporary urge.`,
  `Your future self chose ${goal}. Stay with it.`,
  `You said ${goal} matters. Prove it for 2 minutes.`,
  `Your danger zone has started. ${goal} needs you right now.`,
];

export const GOAL_MORNING_MESSAGES = (goal: string) => [
  `Good morning. Your future self chose ${goal}. Make it count.`,
  `Start strong. Every clean decision builds ${goal}.`,
  `Today is one more step toward ${goal}. Stay with it.`,
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

const NOTIFICATION_ICON = `${import.meta.env.BASE_URL}icon-192.png`;

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/** True when running as an installed PWA (best chance of background delivery). */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Service workers are required for notifications on Android Chrome. */
export function serviceWorkerSupported(): boolean {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator;
}

/** Register the notification service worker. Safe to call multiple times. */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!serviceWorkerSupported()) return null;
  try {
    return await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
      scope: import.meta.env.BASE_URL,
    });
  } catch {
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const result = await Notification.requestPermission();
  // Make sure the SW is registered as soon as the user opts in.
  if (result === "granted") void registerServiceWorker();
  return result;
}

/**
 * Show a system notification. Prefers the service worker registration
 * (the only method that works on Android Chrome), falling back to the
 * Notification constructor on desktop browsers.
 */
export async function sendBrowserNotification(message: string): Promise<boolean> {
  if (!notificationsSupported() || Notification.permission !== "granted") return false;

  const title = "Reset Mode";
  const options = {
    body: message,
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_ICON,
    tag: "reset-mode",
    renotify: true,
  } as NotificationOptions;

  if (serviceWorkerSupported()) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification(title, options);
        return true;
      }
    } catch {
      /* fall through to constructor */
    }
  }

  try {
    new Notification(title, options);
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
