import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Sparkles, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useReflections, type ReflectionEntry } from "@/lib/storage";

const TRIGGERS = [
  "Late night",
  "Boredom",
  "Stress",
  "Loneliness",
  "Social media",
  "Dating apps",
  "Tiredness",
  "Avoiding work or goals",
  "Other",
];

const BETTER_CHOICES = [
  "Breathed with the light",
  "Put phone away",
  "Journaled",
  "Worked on my goal",
  "Delayed the urge",
  "Went for a walk",
  "Other",
];

const MASTER_FEEDBACK =
  "You did not waste the moment. You learned from it. Every reflection makes the next choice stronger.";

type Phase = "trigger" | "choice" | "write" | "done";

export default function Reflection() {
  const [, setLocation] = useLocation();
  const [, setReflections] = useReflections();

  const [phase, setPhase] = useState<Phase>("trigger");
  const [trigger, setTrigger] = useState("");
  const [betterChoice, setBetterChoice] = useState("");
  const [lesson, setLesson] = useState("");
  const [nextAction, setNextAction] = useState("");

  function selectTrigger(value: string) {
    setTrigger(value);
    setPhase("choice");
  }

  function selectChoice(value: string) {
    setBetterChoice(value);
    setPhase("write");
  }

  function save() {
    const entry: ReflectionEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
      trigger,
      betterChoice,
      lesson: lesson.trim(),
      nextAction: nextAction.trim(),
    };
    setReflections((prev) => [entry, ...prev]);
    setPhase("done");
  }

  function goBack() {
    if (phase === "choice") setPhase("trigger");
    else if (phase === "write") setPhase("choice");
    else setLocation("/");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-4">
      <div className="max-w-[430px] mx-auto w-full px-4 pt-8 flex-1 flex flex-col">
        <AnimatePresence mode="wait">

          {/* ── Question 1: trigger ── */}
          {phase === "trigger" && (
            <motion.div
              key="trigger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex-1 flex flex-col pb-24"
            >
              <button
                onClick={() => setLocation("/")}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={18} className="text-primary" />
                  <span className="text-xs uppercase tracking-widest text-primary font-semibold">
                    Self-Reflection
                  </span>
                </div>
                <h1 className="text-2xl font-black text-foreground leading-tight mb-1">
                  What triggered the weak moment?
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Name it honestly. Understanding the trigger is how you stay ahead of it.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {TRIGGERS.map((t) => (
                  <button
                    key={t}
                    data-testid={`trigger-${t}`}
                    onClick={() => selectTrigger(t)}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                  >
                    <span className="font-semibold text-foreground text-sm">{t}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Question 2: better choice ── */}
          {phase === "choice" && (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col pb-24"
            >
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <div className="mb-6">
                <h2 className="text-2xl font-black text-foreground leading-tight mb-1">
                  What did you choose instead?
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Give yourself credit for the better move you made.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {BETTER_CHOICES.map((c) => (
                  <button
                    key={c}
                    data-testid={`choice-${c}`}
                    onClick={() => selectChoice(c)}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                  >
                    <span className="font-semibold text-foreground text-sm">{c}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Questions 3 & 4: lesson + next action ── */}
          {phase === "write" && (
            <motion.div
              key="write"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col pb-24"
            >
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <div className="mb-6">
                <label className="block mb-2">
                  <span className="text-base font-black text-foreground">What did you learn?</span>
                </label>
                <textarea
                  data-testid="input-lesson"
                  value={lesson}
                  onChange={(e) => setLesson(e.target.value)}
                  maxLength={280}
                  rows={3}
                  placeholder="A short, honest note to yourself..."
                  className="w-full rounded-xl border border-border bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="mb-8">
                <label className="block mb-2">
                  <span className="text-base font-black text-foreground">What will you do next time?</span>
                </label>
                <textarea
                  data-testid="input-next-action"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  maxLength={280}
                  rows={3}
                  placeholder="One clear move for the next weak moment..."
                  className="w-full rounded-xl border border-border bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:border-primary/50"
                />
              </div>

              <button
                data-testid="button-save-reflection"
                onClick={save}
                className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold tracking-tight hover:bg-primary/90 transition-colors"
              >
                Save reflection
              </button>
            </motion.div>
          )}

          {/* ── Done: Reset Master feedback ── */}
          {phase === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col pb-24"
            >
              <div className="flex items-center gap-2 mb-6 pt-2">
                <Sparkles size={18} className="text-primary" />
                <span className="text-sm font-black text-foreground tracking-tight">Reset Master</span>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <div className="flex flex-col items-center text-center mb-6">
                  <CheckCircle size={56} className="text-primary mb-5" />
                  <div className="p-5 rounded-2xl bg-card border border-primary/20">
                    <p className="text-base text-foreground leading-relaxed">{MASTER_FEEDBACK}</p>
                  </div>
                </div>
              </div>

              <button
                data-testid="button-reflection-done"
                onClick={() => setLocation("/")}
                className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold tracking-tight hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
