import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStorage } from "@/lib/storage";
import { DEFAULT_SETTINGS } from "@/lib/storage";
import type { HabitType, DangerZonePreset, Settings } from "@/lib/storage";

const HABITS: { value: NonNullable<HabitType>; label: string; desc: string }[] = [
  { value: "porn", label: "Pornography", desc: "Quit compulsive viewing habits" },
  { value: "dating_apps", label: "Dating Apps", desc: "Break the swipe loop" },
  { value: "social_media", label: "Social Media", desc: "Reclaim attention and time" },
  { value: "all", label: "All of the above", desc: "Full digital reset" },
];

interface DangerPreset {
  value: DangerZonePreset;
  label: string;
  desc: string;
  start: string;
  end: string;
}

const DANGER_PRESETS: DangerPreset[] = [
  { value: "late_night", label: "Late night", desc: "10pm – 2am", start: "22:00", end: "02:00" },
  { value: "early_morning", label: "Early morning", desc: "6am – 9am", start: "06:00", end: "09:00" },
  { value: "afternoon", label: "Afternoon", desc: "12pm – 3pm", start: "12:00", end: "15:00" },
  { value: "anytime", label: "When I am bored — anytime", desc: "Reminders every day, all day", start: "00:00", end: "23:59" },
  { value: "custom", label: "Custom time", desc: "I will set it myself", start: "", end: "" },
];

interface OnboardingModalProps {
  onComplete: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedHabit, setSelectedHabit] = useState<NonNullable<HabitType> | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<DangerZonePreset | null>(null);
  const [customStart, setCustomStart] = useState("22:00");
  const [customEnd, setCustomEnd] = useState("02:00");

  const [, setHabit] = useStorage<HabitType>("resetMode_habit", null);
  const [, setSettings] = useStorage<Settings>("resetMode_settings", DEFAULT_SETTINGS);

  function goToStep2() {
    if (!selectedHabit) return;
    setHabit(selectedHabit);
    setStep(2);
  }

  function handleFinish() {
    if (!selectedPreset) {
      onComplete();
      return;
    }

    const preset = DANGER_PRESETS.find((p) => p.value === selectedPreset);
    const start = selectedPreset === "custom" ? customStart : (preset?.start ?? "22:00");
    const end = selectedPreset === "custom" ? customEnd : (preset?.end ?? "02:00");

    setSettings((prev) => ({
      ...prev,
      dangerZoneEnabled: true,
      dangerZonePreset: selectedPreset,
      dangerZoneStart: start,
      dangerZoneEnd: end,
    }));

    onComplete();
  }

  function skipDangerZone() {
    onComplete();
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center px-6 overflow-y-auto py-8">
      <div className="max-w-[380px] w-full">

        {/* Step indicator */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className={`h-1.5 w-10 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
          <div className={`h-1.5 w-10 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
        </div>

        {step === 1 && (
          <>
            <div className="mb-8 text-center">
              <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">Step 1 of 2</div>
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
                  onClick={() => setSelectedHabit(habit.value)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedHabit === habit.value
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
              data-testid="button-next-step"
              onClick={goToStep2}
              disabled={!selectedHabit}
              className="w-full h-14 text-base font-bold rounded-xl"
            >
              Continue
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-8 text-center">
              <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">Step 2 of 2</div>
              <h1 className="text-2xl font-black text-foreground leading-tight mb-3">
                When do you struggle most?
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We will send reminders during your danger window to help you stay on track.
              </p>
            </div>

            <div className="flex flex-col gap-3 mb-5">
              {DANGER_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  data-testid={`button-danger-preset-${preset.value}`}
                  onClick={() => setSelectedPreset(preset.value)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedPreset === preset.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                  }`}
                >
                  <div className="font-semibold text-base">{preset.label}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{preset.desc}</div>
                </button>
              ))}
            </div>

            {selectedPreset === "custom" && (
              <div className="grid grid-cols-2 gap-3 mb-5 p-4 bg-card border border-border rounded-xl">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">From</Label>
                  <Input
                    data-testid="input-custom-start"
                    type="time"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Until</Label>
                  <Input
                    data-testid="input-custom-end"
                    type="time"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
            )}

            <Button
              data-testid="button-start-reset"
              onClick={handleFinish}
              disabled={!selectedPreset}
              className="w-full h-14 text-base font-bold rounded-xl mb-3"
            >
              Start My Reset
            </Button>

            <button
              data-testid="button-skip-danger-zone"
              onClick={skipDangerZone}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Skip for now
            </button>
          </>
        )}

        <p className="text-center text-xs text-muted-foreground mt-4 leading-relaxed">
          One urge defeated is one vote for your future self.
        </p>
      </div>
    </div>
  );
}
