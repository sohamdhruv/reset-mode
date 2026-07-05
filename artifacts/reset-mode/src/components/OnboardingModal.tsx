import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStorage, DEFAULT_SETTINGS } from "@/lib/storage";
import type { HabitType, DangerZonePreset, GoalDistraction, Settings } from "@/lib/storage";

const HABITS: { value: NonNullable<HabitType>; label: string; desc: string }[] = [
  { value: "scrolling", label: "Endless scrolling", desc: "Reclaim attention and time" },
  { value: "dating_apps", label: "Dating apps", desc: "Break the swipe loop" },
  { value: "spending", label: "Spending on apps", desc: "Stop wasting money on coins, boosts, or paid features" },
  { value: "food", label: "Food cravings", desc: "Stop stress eating and late-night snacking" },
  { value: "porn", label: "Pornography", desc: "Quit compulsive viewing habits" },
  { value: "other", label: "Other unwanted habit", desc: "Reset any habit pulling you away from your goals" },
  { value: "all", label: "Full digital reset", desc: "Reset multiple digital habits at once" },
];

const GOAL_OPTIONS = [
  "Better focus",
  "More confidence",
  "Better relationship",
  "Better discipline",
  "More energy",
  "Spiritual growth",
  "Fitness",
  "Career or business goal",
  "Custom goal",
];

const DISTRACTION_OPTIONS: { value: NonNullable<GoalDistraction>; label: string; desc: string }[] = [
  { value: "yes", label: "Yes", desc: "Every time I open the app" },
  { value: "sometimes", label: "Sometimes", desc: "When I am stressed or bored" },
  { value: "no", label: "No", desc: "It is just a bad habit" },
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

type Step = 1 | 2 | 3 | 4;
const TOTAL_STEPS = 4;

interface OnboardingModalProps {
  onComplete: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedHabit, setSelectedHabit] = useState<NonNullable<HabitType> | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [customGoal, setCustomGoal] = useState("");
  const [selectedDistraction, setSelectedDistraction] = useState<NonNullable<GoalDistraction> | null>(null);
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

  function goToStep3() {
    if (!selectedGoal) return;
    setStep(3);
  }

  function goToStep4() {
    setStep(4);
  }

  async function handleFinish() {
    const goalValue = selectedGoal === "Custom goal" ? customGoal.trim() : (selectedGoal ?? "");
    const preset = DANGER_PRESETS.find((p) => p.value === selectedPreset);
    const start = selectedPreset === "custom" ? customStart : (preset?.start ?? "22:00");
    const end = selectedPreset === "custom" ? customEnd : (preset?.end ?? "02:00");
    const hasDangerZone = !!selectedPreset;

    if (hasDangerZone && typeof window !== "undefined" && "Notification" in window) {
      await Notification.requestPermission();
    }

    setSettings((prev) => ({
      ...DEFAULT_SETTINGS,
      ...prev,
      userGoal: goalValue,
      goalDistraction: selectedDistraction ?? "",
      ...(hasDangerZone && {
        dangerZoneEnabled: true,
        dangerZonePreset: selectedPreset!,
        dangerZoneStart: start,
        dangerZoneEnd: end,
      }),
    }));

    onComplete();
  }

  function skipDangerZone() {
    handleFinish();
  }

  const effectiveGoal = selectedGoal === "Custom goal" ? customGoal.trim() : selectedGoal;

  return (
    <div
      className="fixed inset-0 z-[100] bg-background flex flex-col overflow-y-auto px-6"
      style={{
        paddingTop: "max(2rem, env(safe-area-inset-top))",
        paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="max-w-[380px] w-full mx-auto my-auto">

        {/* Step indicator */}
        <div className="flex items-center gap-2 justify-center mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-colors ${step >= i + 1 ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        {/* ── Step 1: Habit ── */}
        {step === 1 && (
          <>
            <div className="mb-8 text-center">
              <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">
                Step 1 of {TOTAL_STEPS}
              </div>
              <h1 className="text-2xl font-black text-foreground leading-tight mb-3">
                What habit are you trying to reset?
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

        {/* ── Step 2: Goal ── */}
        {step === 2 && (
          <>
            <div className="mb-8 text-center">
              <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">
                Step 2 of {TOTAL_STEPS}
              </div>
              <h1 className="text-2xl font-black text-foreground leading-tight mb-3">
                What goal is this habit distracting you from?
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Knowing your why makes your reset more powerful.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 mb-5">
              {GOAL_OPTIONS.map((goal) => (
                <button
                  key={goal}
                  onClick={() => setSelectedGoal(goal)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedGoal === goal
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                  }`}
                >
                  <div className="font-semibold text-sm">{goal}</div>
                </button>
              ))}
            </div>

            {selectedGoal === "Custom goal" && (
              <div className="mb-5 p-4 bg-card border border-border rounded-xl">
                <Label className="text-xs text-muted-foreground mb-1.5 block">Describe your goal</Label>
                <Input
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="e.g. Launch my business"
                  className="bg-background border-border text-foreground"
                  maxLength={60}
                />
              </div>
            )}

            <Button
              onClick={goToStep3}
              disabled={!effectiveGoal}
              className="w-full h-14 text-base font-bold rounded-xl mb-3"
            >
              Continue
            </Button>
            <button
              onClick={() => { setSelectedGoal(null); setStep(1); }}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Back
            </button>
          </>
        )}

        {/* ── Step 3: Distraction ── */}
        {step === 3 && (
          <>
            <div className="mb-8 text-center">
              <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">
                Step 3 of {TOTAL_STEPS}
              </div>
              <h1 className="text-2xl font-black text-foreground leading-tight mb-3">
                Does this habit distract you from your goal?
              </h1>
              {effectiveGoal && (
                <p className="text-sm text-primary font-medium">
                  Your goal: {effectiveGoal}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 mb-8">
              {DISTRACTION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedDistraction(opt.value)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedDistraction === opt.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                  }`}
                >
                  <div className="font-semibold text-base">{opt.label}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>

            <Button
              onClick={goToStep4}
              disabled={!selectedDistraction}
              className="w-full h-14 text-base font-bold rounded-xl mb-3"
            >
              Continue
            </Button>
            <button
              onClick={() => setStep(2)}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Back
            </button>
          </>
        )}

        {/* ── Step 4: Danger Zone ── */}
        {step === 4 && (
          <>
            <div className="mb-8 text-center">
              <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">
                Step 4 of {TOTAL_STEPS}
              </div>
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
