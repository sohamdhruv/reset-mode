import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useStorage } from "@/lib/storage";
import type { HabitType } from "@/lib/storage";

const HABITS: { value: NonNullable<HabitType>; label: string; desc: string }[] = [
  { value: "porn", label: "Pornography", desc: "Quit compulsive viewing habits" },
  { value: "dating_apps", label: "Dating Apps", desc: "Break the swipe loop" },
  { value: "social_media", label: "Social Media", desc: "Reclaim attention and time" },
  { value: "all", label: "All of the above", desc: "Full digital reset" },
];

interface OnboardingModalProps {
  onComplete: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [selected, setSelected] = useState<NonNullable<HabitType> | null>(null);
  const [, setHabit] = useStorage<HabitType>("resetMode_habit", null);

  function handleStart() {
    if (!selected) return;
    setHabit(selected);
    onComplete();
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center px-6">
      <div className="max-w-[380px] w-full">
        <div className="mb-8 text-center">
          <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">Welcome to Reset Mode</div>
          <h1 className="text-2xl font-black text-foreground leading-tight mb-3">
            What habit do you want to break?
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Choose honestly. No one is watching. This is your private space.
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          {HABITS.map((habit) => (
            <button
              key={habit.value}
              data-testid={`button-habit-${habit.value}`}
              onClick={() => setSelected(habit.value)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selected === habit.value
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/50"
              }`}
            >
              <div className="font-semibold text-base">{habit.label}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{habit.desc}</div>
            </button>
          ))}
        </div>

        <Button
          data-testid="button-start-reset"
          onClick={handleStart}
          disabled={!selected}
          className="w-full h-14 text-base font-bold rounded-xl"
        >
          Start My Reset
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-4 leading-relaxed">
          One urge defeated is one vote for your future self.
        </p>
      </div>
    </div>
  );
}
