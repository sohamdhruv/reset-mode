import {
  Moon,
  Wind,
  CloudRain,
  HeartCrack,
  BellRing,
  ScrollText,
  CreditCard,
  Flame,
  UtensilsCrossed,
  Cookie,
  type LucideIcon,
} from "lucide-react";

export interface Simulation {
  id: string;
  label: string;
  Icon: LucideIcon;
  scenario: string;
}

export interface SimAction {
  id: string;
  label: string;
}

export interface Reflection {
  id: string;
  label: string;
}

// Common weak moments people practice before they happen for real.
export const SIMULATIONS: Simulation[] = [
  {
    id: "late_night",
    label: "Late night, alone in bed",
    Icon: Moon,
    scenario:
      "It is late. You are alone in bed, the room is dark, and your hand drifts toward your phone. No one would know. The pull is quiet but strong.",
  },
  {
    id: "bored",
    label: "Bored and restless",
    Icon: Wind,
    scenario:
      "You are bored and restless. Nothing feels interesting, and your phone is the easiest escape within reach. Your thumb already knows where to go.",
  },
  {
    id: "stressed",
    label: "Stressed after a hard day",
    Icon: CloudRain,
    scenario:
      "It has been a long, stressful day and you just want to switch your brain off. The old habit promises quick relief and a way to numb out.",
  },
  {
    id: "lonely",
    label: "Lonely, craving attention",
    Icon: HeartCrack,
    scenario:
      "You feel lonely and a little unseen. Opening a dating app or the old habit promises a fast hit of attention and connection right now.",
  },
  {
    id: "notification",
    label: "A notification pulls you in",
    Icon: BellRing,
    scenario:
      "A notification lights up your screen. Before you decide anything, your thumb is already moving toward it, and the loop is starting to open.",
  },
  {
    id: "one_thing",
    label: 'Just "checking one thing"',
    Icon: ScrollText,
    scenario:
      "You unlocked your phone to check one small thing. Now the feed is loading, the scroll is pulling, and five minutes could quietly become an hour.",
  },
  {
    id: "spend",
    label: "Urge to spend for a boost",
    Icon: CreditCard,
    scenario:
      "You feel the pull to spend money on an app, a boost, or a subscription to feel better right now. The checkout is one tap away.",
  },
  {
    id: "trigger",
    label: "Trigger content appeared",
    Icon: Flame,
    scenario:
      "Something on your feed triggered the old craving out of nowhere. Your body reacts before your mind does, and the urge spikes fast.",
  },
  {
    id: "fridge_pull",
    label: "Late night fridge pull",
    Icon: UtensilsCrossed,
    scenario:
      "It is late and the kitchen is quietly calling. You are not really hungry, but the fridge promises comfort. Your feet are already drifting toward it.",
  },
  {
    id: "stress_snack",
    label: "Stress snacking after a hard day",
    Icon: Cookie,
    scenario:
      "The day drained you, and food feels like the fastest way to numb it. The snack promises quick relief, even though the stress will still be waiting after the last bite.",
  },
];

// 6 healthy actions the user can rehearse taking in the moment.
export const SIM_ACTIONS: SimAction[] = [
  { id: "phone_away", label: "Put my phone in another room" },
  { id: "breathe", label: "Do a 2-minute breathing reset" },
  { id: "reach_out", label: "Reach out to someone I trust" },
  { id: "move", label: "Move my body — walk or push-ups" },
  { id: "goal", label: "Redirect to my goal for 5 minutes" },
  { id: "sit", label: "Sit with the urge and let it pass" },
];

// 6 reflection statements the user commits to for the real moment.
export const REFLECTIONS: Reflection[] = [
  { id: "temporary", label: "This urge is temporary. It will pass." },
  { id: "choose_goal", label: "I choose my goal over this moment." },
  { id: "practiced", label: "I have practiced this. I am ready." },
  { id: "not_every_urge", label: "I do not have to act on every urge." },
  { id: "future_self", label: "My future self is counting on me." },
  { id: "in_control", label: "I am in control, not the urge." },
];

export interface GuidanceInput {
  simulation: string;
  action: string;
  goal?: string;
  habit?: string;
}

// Deterministic scripted guidance. This is the primary path anywhere the AI
// backend is unavailable (for example a static-hosted build), and the fallback
// when a request fails. It is intentionally calm, disciplined, and non-shaming.
const ACTION_GUIDANCE: Record<string, string> = {
  phone_away:
    "Putting the phone in another room is a strong choice — you are removing the trigger instead of fighting it with willpower alone. Stand up and do it now, before the urge argues back. The distance buys you the few minutes you need for the wave to pass.",
  breathe:
    "Slowing your breath tells your body it is safe, and the urge loses its grip when your nervous system settles. Give it two quiet minutes and let the wave rise and fall. You do not have to win forever — just win the next two minutes.",
  reach_out:
    "Reaching out breaks the isolation the habit depends on. A short message or call pulls you back into the real world, where you are more than this moment. You are not weak for needing people — you are wise for using them.",
  move:
    "Moving your body burns off the restless energy the urge is feeding on. A short walk or ten push-ups changes your state faster than thinking your way out ever will. Motion first, and the craving quiets on its own.",
  goal:
    "Turning toward your goal is how you starve the habit and feed your future at the same time. Five honest minutes of real work is a vote for the person you are becoming. Start small — the momentum will carry you the rest of the way.",
  sit:
    "Choosing to sit with the urge is quietly powerful — you are proving it cannot force your hand. Watch it rise, notice it, and let it fall without acting. Every urge you outlast makes the next one weaker.",
};

const DEFAULT_GUIDANCE =
  "You noticed the moment and chose a response instead of reacting — that is the whole skill, and you just practiced it. The urge is a wave, not a command; it will pass whether you feed it or not. Stay with your choice, and let this rep make the real moment easier.";

export function scriptedGuidance(input: GuidanceInput): string {
  const base = ACTION_GUIDANCE[input.action] ?? DEFAULT_GUIDANCE;
  const goal = input.goal?.trim();
  if (goal) {
    return `${base} Remember why this matters: ${goal}.`;
  }
  return base;
}

// Robustly fetch AI guidance. Returns null on any failure (network error,
// non-200 status, non-JSON body such as an SPA index.html fallback, or a
// malformed payload) so the caller can fall back to scripted guidance.
export async function fetchResetMasterGuidance(
  input: GuidanceInput,
): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch("/api/reset-master/guidance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(input),
      signal: controller.signal,
    });

    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return null;

    const data: unknown = await res.json();
    if (
      data &&
      typeof data === "object" &&
      "guidance" in data &&
      typeof (data as { guidance: unknown }).guidance === "string"
    ) {
      const guidance = (data as { guidance: string }).guidance.trim();
      return guidance.length > 0 ? guidance : null;
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
