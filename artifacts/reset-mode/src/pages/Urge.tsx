import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, CheckCircle, Lock, PersonStanding, Droplets, Dumbbell, BookOpen } from "lucide-react";
import { useUrgesDefeated, useSettings, DEFAULT_SETTINGS } from "@/lib/storage";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";

const AFFIRMATIONS = [
  "You are stronger than this moment.",
  "This urge will pass. You will stay in control.",
  "Breathe. Your goal is worth more.",
  "Every breath is a vote for your future self.",
  "You have beaten this before. Do it again.",
  "Pause. Breathe. Redirect.",
  "Your future self is watching this choice.",
  "One calm breath can change the next decision.",
];

const QUICK_ACTIONS = [
  { id: "lock", label: "Lock phone away", Icon: Lock },
  { id: "walk", label: "Go for a walk", Icon: PersonStanding },
  { id: "water", label: "Drink water", Icon: Droplets },
  { id: "pushups", label: "Do 10 push-ups", Icon: Dumbbell },
  { id: "journal", label: "Write a journal note", Icon: BookOpen, nav: "/journal" },
];

const PREP_SECS = 5;
const INHALE_SECS = 4;
const HOLD_SECS = 2;
const EXHALE_SECS = 16;
const CYCLE_SECS = INHALE_SECS + HOLD_SECS + EXHALE_SECS; // 22
const SESSION_SECS = 120;

type BreathPhase = "inhale" | "hold" | "exhale";
type AppPhase = "prep" | "breathing" | "result" | "actions" | "complete";

function getBreathPhase(elapsed: number): BreathPhase {
  const pos = elapsed % CYCLE_SECS;
  if (pos < INHALE_SECS) return "inhale";
  if (pos < INHALE_SECS + HOLD_SECS) return "hold";
  return "exhale";
}

function getPhaseLabel(phase: BreathPhase): string {
  if (phase === "inhale") return "Inhale";
  if (phase === "hold") return "Hold";
  return "Exhale";
}

export default function Urge() {
  const [, setLocation] = useLocation();
  const [settings] = useSettings();
  const s = { ...DEFAULT_SETTINGS, ...settings };

  const [appPhase, setAppPhase] = useState<AppPhase>("prep");
  const [countdown, setCountdown] = useState(PREP_SECS);
  const [elapsed, setElapsed] = useState(0);
  const [urgesDefeated, setUrgesDefeated] = useUrgesDefeated();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const controls = useAnimationControls();
  const prevBreathPhase = useRef<BreathPhase | null>(null);

  const breathPhase = getBreathPhase(elapsed);
  const affirmationIndex = Math.floor(elapsed / 20) % AFFIRMATIONS.length;
  const timeLeft = Math.max(0, SESSION_SECS - elapsed);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // ── Prep countdown ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (appPhase !== "prep") return;
    if (countdown <= 0) {
      setAppPhase("breathing");
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [appPhase, countdown]);

  // ── Session timer — starts only when breathing begins ───────────────────────
  useEffect(() => {
    if (appPhase !== "breathing") return;
    const id = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= SESSION_SECS) setAppPhase("result");
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [appPhase]);

  // ── Circle animation — responds to breath phase changes ────────────────────
  useEffect(() => {
    if (prevBreathPhase.current === breathPhase) return;
    prevBreathPhase.current = breathPhase;
    if (breathPhase === "inhale") {
      controls.start({ scale: 1 }, { duration: INHALE_SECS, ease: "easeInOut" });
    } else if (breathPhase === "exhale") {
      controls.start({ scale: 0.28 }, { duration: EXHALE_SECS, ease: "easeInOut" });
    }
    // "hold" — stays at current scale naturally
  }, [breathPhase, controls]);

  // ── First inhale fires when the breathing phase begins ─────────────────────
  useEffect(() => {
    if (appPhase !== "breathing") return;
    controls.start({ scale: 1 }, { duration: INHALE_SECS, ease: "easeInOut" });
    prevBreathPhase.current = "inhale";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appPhase]);

  function endEarly() { setAppPhase("result"); }
  function handleUrgeResult() { setAppPhase("actions"); }

  function handleAction(nav?: string) {
    setUrgesDefeated(urgesDefeated + 1);
    if (nav) { setLocation(nav); }
    else { setAppPhase("complete"); setTimeout(() => setLocation("/"), 2000); }
  }

  function handleSkipActions() {
    setUrgesDefeated(urgesDefeated + 1);
    setAppPhase("complete");
    setTimeout(() => setLocation("/"), 2000);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-4">
      <div className="max-w-[430px] mx-auto w-full px-4 pt-8 flex-1 flex flex-col">

        <AnimatePresence mode="wait">

          {/* ── Prep phase ── */}
          {appPhase === "prep" && (
            <motion.div
              key="prep"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col"
            >
              {/* Back */}
              <button
                onClick={() => setLocation("/")}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <div className="flex-1 flex flex-col items-center justify-center">
                {/* Static dot — give them something to find */}
                <div className="relative flex items-center justify-center w-64 h-64 mb-10">
                  <div className="absolute inset-0 rounded-full border border-primary/10" />
                  <motion.div
                    animate={controls}
                    initial={{ scale: 0.28 }}
                    className="w-48 h-48 rounded-full bg-primary/20 border-2 border-primary/50"
                    style={{
                      boxShadow: "0 0 60px hsl(var(--primary) / 0.25), 0 0 120px hsl(var(--primary) / 0.10)",
                    }}
                  />
                  {s.userGoal && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-[10px] text-primary/70 font-semibold text-center px-6 leading-tight uppercase tracking-wider">
                        {s.userGoal}
                      </p>
                    </div>
                  )}
                </div>

                {/* Preparation message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-center mb-8 px-4"
                >
                  <p className="text-lg text-foreground font-semibold leading-relaxed mb-1">
                    Find the dot.
                  </p>
                  <p className="text-base text-muted-foreground leading-relaxed mb-1">
                    Keep your eyes gently on it.
                  </p>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Breathe only when the guide begins.
                  </p>
                </motion.div>

                {/* Countdown */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={countdown}
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    transition={{ duration: 0.35 }}
                    className="text-center"
                  >
                    <p className="text-muted-foreground text-sm mb-1">Starting in</p>
                    <p className="text-5xl font-black text-primary tabular-nums">{countdown}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ── Breathing session ── */}
          {appPhase === "breathing" && (
            <motion.div
              key="breathing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 flex flex-col"
            >
              {/* Back */}
              <button
                onClick={() => setLocation("/")}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              {/* Affirmation */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={affirmationIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.6 }}
                  className="text-xl font-black text-foreground text-center leading-snug mb-10 px-2"
                >
                  {AFFIRMATIONS[affirmationIndex]}
                </motion.p>
              </AnimatePresence>

              {/* Breathing circle */}
              <div className="flex flex-col items-center flex-1 justify-center">
                <div className="relative flex items-center justify-center w-64 h-64 mb-8">
                  <div className="absolute inset-0 rounded-full border border-primary/10" />
                  <motion.div
                    animate={controls}
                    initial={{ scale: 0.28 }}
                    className="w-48 h-48 rounded-full bg-primary/20 border-2 border-primary/50"
                    style={{
                      boxShadow: "0 0 60px hsl(var(--primary) / 0.25), 0 0 120px hsl(var(--primary) / 0.10)",
                    }}
                  />
                  {s.userGoal && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-[10px] text-primary/70 font-semibold text-center px-6 leading-tight uppercase tracking-wider">
                        {s.userGoal}
                      </p>
                    </div>
                  )}
                </div>

                {/* Phase label */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={breathPhase}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.3 }}
                    className="text-2xl font-black text-primary mb-2 tracking-wide"
                  >
                    {getPhaseLabel(breathPhase)}
                  </motion.div>
                </AnimatePresence>

                {/* Timer */}
                <div className="text-lg font-mono text-muted-foreground mb-8 tabular-nums">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </div>
              </div>

              {/* End early */}
              <button
                onClick={endEarly}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors text-center py-3"
              >
                End session early
              </button>
            </motion.div>
          )}

          {/* ── Did the urge reduce? ── */}
          {appPhase === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <div className="text-center mb-10">
                <div className="text-4xl mb-4">🧘</div>
                <h2 className="text-2xl font-black text-foreground mb-2">Session complete.</h2>
                <p className="text-muted-foreground text-sm">Did the urge reduce?</p>
              </div>

              <div className="flex flex-col gap-3 w-full max-w-[280px]">
                {[
                  { label: "Yes", emoji: "✅" },
                  { label: "A little", emoji: "🤏" },
                  { label: "No", emoji: "😤" },
                ].map(({ label, emoji }) => (
                  <button
                    key={label}
                    onClick={handleUrgeResult}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-foreground font-semibold"
                  >
                    <span className="text-lg">{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Quick actions ── */}
          {appPhase === "actions" && (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <div className="text-center mb-8 pt-8">
                <h2 className="text-xl font-black text-foreground mb-2">Good. Keep the momentum.</h2>
                <p className="text-muted-foreground text-sm">Choose one action right now:</p>
              </div>

              <div className="flex flex-col gap-3 flex-1">
                {QUICK_ACTIONS.map(({ id, label, Icon, nav }) => (
                  <button
                    key={id}
                    onClick={() => { setSelectedAction(id); handleAction(nav); }}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      selectedAction === id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
                    }`}
                  >
                    <Icon size={20} className="text-primary shrink-0" />
                    <span className="font-semibold text-foreground text-sm">{label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleSkipActions}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors text-center py-4"
              >
                Skip — I am fine
              </button>
            </motion.div>
          )}

          {/* ── Complete ── */}
          {appPhase === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <CheckCircle size={72} className="text-primary mb-5" />
              <h2 className="text-2xl font-black text-foreground mb-2">Urge defeated.</h2>
              <p className="text-muted-foreground">One vote for your future self.</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
