import {
  Moon,
  Hourglass,
  Smartphone,
  RotateCcw,
  Sunrise,
  Wind,
  Lock,
  Target,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

export interface Story {
  // 6–10 short lines, revealed one at a time.
  lines: string[];
}

export interface StoryCategory {
  id: string;
  title: string;
  Icon: LucideIcon;
  stories: Story[];
}

// Scripted Reset Master stories. Calm, disciplined, non-shaming — focused on
// self-control and choosing the future self over the old habit. Each category
// has 2–3 variations; the Story page rotates through them so repeat visits feel
// fresh. (Real AI storytelling can be layered on later without changing this.)
export const STORY_CATEGORIES: StoryCategory[] = [
  {
    id: "late_night_test",
    title: "The Late Night Test",
    Icon: Moon,
    stories: [
      {
        lines: [
          "The student sat alone at night.",
          'The old habit whispered, "Just once."',
          "The Reset Master pointed to the light.",
          '"Do not fight the shadow," he said.',
          '"Choose the light long enough, and the shadow loses power."',
          "The student breathed.",
          "The urge passed.",
          "The future remained.",
        ],
      },
      {
        lines: [
          "Midnight came, and with it the familiar pull.",
          '"Everyone is asleep," the habit said. "No one will know."',
          '"You will know," the Reset Master answered.',
          '"And the person you are becoming is watching."',
          "The student set the phone face down.",
          "He closed his eyes and counted his breath.",
          "By the tenth breath, the night was quiet again.",
        ],
      },
      {
        lines: [
          "The room was dark and the hour was late.",
          "The student reached for the screen out of habit, not desire.",
          '"Notice the reach," said the Reset Master.',
          '"The hand moves before the mind decides."',
          "The student paused, his hand in the air.",
          "He chose to lower it.",
          "Nothing was lost. Something was won.",
        ],
      },
    ],
  },
  {
    id: "boredom_trap",
    title: "The Boredom Trap",
    Icon: Hourglass,
    stories: [
      {
        lines: [
          "The student was restless and bored.",
          '"There is nothing to do," he said.',
          '"Boredom is not empty," the Reset Master replied.',
          '"It is space waiting for a better choice."',
          '"The old habit fills it fast and leaves you emptier."',
          "The student stood and gave the space to something real.",
          "The boredom passed without a trace.",
        ],
      },
      {
        lines: [
          "Nothing felt interesting, so the thumb went searching.",
          '"Just something to pass the time," the habit offered.',
          '"Time is not meant to be passed," said the Reset Master.',
          '"It is meant to be spent on what you value."',
          "The student asked himself one honest question:",
          '"What would my future self do with these ten minutes?"',
          "He already knew the answer, and he began.",
        ],
      },
    ],
  },
  {
    id: "phone_beside_bed",
    title: "The Phone Beside the Bed",
    Icon: Smartphone,
    stories: [
      {
        lines: [
          "The phone rested beside the pillow, glowing softly.",
          '"Keep me close," it seemed to say. "Just in case."',
          '"What is close is what wins," warned the Reset Master.',
          '"A trigger within reach will always find its moment."',
          "The student stood and walked the phone across the room.",
          "He returned to bed lighter than before.",
          "The distance did what willpower could not.",
        ],
      },
      {
        lines: [
          "Every night the phone slept an arm's length away.",
          "Every morning the student wondered where his hours went.",
          '"You are not weak," said the Reset Master.',
          '"You are simply too close to the thing that pulls you."',
          "So the student moved the charger to the far wall.",
          "The reach became too long to be worth it.",
          "His mornings slowly returned to him.",
        ],
      },
    ],
  },
  {
    id: "old_habit_returns",
    title: "The Old Habit Returns",
    Icon: RotateCcw,
    stories: [
      {
        lines: [
          "After many clean days, the old habit came knocking.",
          '"You missed me," it said, wearing a friendly face.',
          '"Relapse is not the enemy," said the Reset Master.',
          '"Believing you have failed is."',
          '"One slip does not erase the road you have walked."',
          "The student took a breath and started again.",
          "The streak was gone, but the strength was not.",
          "He was not beginning. He was continuing.",
        ],
      },
      {
        lines: [
          "The habit returned on a hard, tired day.",
          '"See, you never really changed," it whispered.',
          '"Change is not never falling," the Reset Master said.',
          '"It is how quickly you choose to rise."',
          "The student did not argue with the voice.",
          "He simply did the next right thing.",
          "And the next. And the one after that.",
          "The habit lost its grip in the doing.",
        ],
      },
    ],
  },
  {
    id: "future_self_waits",
    title: "The Future Self Waits",
    Icon: Sunrise,
    stories: [
      {
        lines: [
          "The Reset Master showed the student a door.",
          '"Behind it stands the person you are becoming."',
          '"He is calm. He is focused. He is free."',
          '"Every choice walks toward him or away from him."',
          "The student looked at the urge in his hand.",
          "It suddenly seemed very small.",
          "He took one step toward the door.",
          "The future self smiled and waited.",
        ],
      },
      {
        lines: [
          '"Who are you doing this for?" asked the Reset Master.',
          "The student pictured the person he wanted to be.",
          '"He is patient where I am rushed."',
          '"He is steady where I am pulled."',
          '"Then give him this moment," said the Reset Master.',
          '"Discipline now is a gift to him later."',
          "The student chose the future over the feeling.",
        ],
      },
    ],
  },
];

export interface ProtectiveChoice {
  id: string;
  label: string;
  Icon: LucideIcon;
  // Where the choice leads, when a matching screen exists.
  nav?: string;
  // Calm closing message for choices without a dedicated screen.
  closing?: string;
}

// The single question shown after every story, and the actions it can lead to.
export const PROTECTIVE_CHOICES: ProtectiveChoice[] = [
  { id: "breathe", label: "Breathe for 2 minutes", Icon: Wind, nav: "/urge" },
  {
    id: "phone_away",
    label: "Put phone away",
    Icon: Lock,
    closing:
      "The phone is away. The pull fades with the distance. Well chosen.",
  },
  { id: "goal", label: "Work on my goal", Icon: Target, nav: "/plan" },
  { id: "journal", label: "Journal", Icon: BookOpen, nav: "/journal" },
  {
    id: "sleep",
    label: "Sleep",
    Icon: Moon,
    closing:
      "Rest is a decision too. Let the day end here. Your future self wakes up grateful.",
  },
];

// Late night runs from 10pm to 5am — the classic weak-moment window.
export function isLateNight(date: Date = new Date()): boolean {
  const h = date.getHours();
  return h >= 22 || h < 5;
}

// Picks a Reset Story for the post-breathing urge flow. Prefers "The Late Night
// Test" when it is late; otherwise rotates through categories not shown recently,
// only resetting once every category has been seen (so stories do not repeat
// until all have appeared). The variation within a category reuses the shared
// rotation counter so repeats stay fresh. Pure function — the caller persists the
// returned `nextSeen` / `nextRotation`.
export function pickUrgeStory(
  seen: string[],
  rotation: Record<string, number>,
  now: Date = new Date(),
): {
  category: StoryCategory;
  variationIndex: number;
  nextSeen: string[];
  nextRotation: Record<string, number>;
} {
  let pool = STORY_CATEGORIES.filter((c) => !seen.includes(c.id));
  if (pool.length === 0) pool = STORY_CATEGORIES;

  let category: StoryCategory;
  if (isLateNight(now)) {
    category =
      pool.find((c) => c.id === "late_night_test") ??
      STORY_CATEGORIES.find((c) => c.id === "late_night_test") ??
      pool[0];
  } else {
    category = pool[0];
  }

  const current = rotation[category.id] ?? 0;
  const variationIndex = current % category.stories.length;
  const nextRotation = { ...rotation, [category.id]: current + 1 };

  let nextSeen = seen.includes(category.id) ? seen : [...seen, category.id];
  if (nextSeen.length >= STORY_CATEGORIES.length) nextSeen = [category.id];

  return { category, variationIndex, nextSeen, nextRotation };
}
