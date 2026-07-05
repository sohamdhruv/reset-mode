import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Sparkles, CheckCircle, Loader2, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import {
  useSettings,
  useSimulations,
  useStorage,
  habitLabel,
  DEFAULT_SETTINGS,
} from "@/lib/storage";
import type { DotColor, HabitType, SimulationResult } from "@/lib/storage";
import {
  SIMULATIONS,
  SIM_ACTIONS,
  REFLECTIONS,
  scriptedGuidance,
  fetchResetMasterGuidance,
  type Simulation as Sim,
  type SimAction,
  type Reflection,
} from "@/lib/simulation";

const DOT_STYLES: Record<DotColor, { gradient: string; shadow: string; ring: string; label: string }> = {
  gold: {
    gradient: "radial-gradient(circle at 38% 36%, #fde68a 0%, #f59e0b 55%, #b45309 100%)",
    shadow: "0 0 48px 8px rgba(251,191,36,0.28), 0 0 100px 20px rgba(245,158,11,0.13)",
    ring: "border-yellow-500/15",
    label: "text-amber-400",
  },
  green: {
    gradient: "radial-gradient(circle at 38% 36%, #bbf7d0 0%, #22c55e 55%, #15803d 100%)",
    shadow: "0 0 48px 8px rgba(34,197,94,0.28), 0 0 100px 20px rgba(22,163,74,0.13)",
    ring: "border-green-500/15",
    label: "text-green-400",
  },
  silver: {
    gradient: "radial-gradient(circle at 38% 36%, #f8fafc 0%, #cbd5e1 55%, #64748b 100%)",
    shadow: "0 0 48px 8px rgba(226,232,240,0.30), 0 0 100px 20px rgba(148,163,184,0.15)",
    ring: "border-slate-300/20",
    label: "text-slate-200",
  },
};

const INHALE_SECS = 4;
const HOLD_SECS = 2;
const EXHALE_SECS = 16;
const CYCLE_SECS = INHALE_SECS + HOLD_SECS + EXHALE_SECS; // 22
const SESSION_SECS = 66; // 3 gentle cycles

type BreathPhase = "inhale" | "hold" | "exhale";
type Phase = "choose" | "scenario" | "action" | "guidance" | "breathing" | "reflection" | "done";

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

export default function Simulation() {
  const [, setLocation] = useLocation();
  const [settings] = useSettings();
  const s = { ...DEFAULT_SETTINGS, ...settings };
  const [habit] = useStorage<HabitType>("resetMode_habit", null);
  const [, setSimulations] = useSimulations();

  const [phase, setPhase] = useState<Phase>("choose");
  const [selectedSim, setSelectedSim] = useState<Sim | null>(null);
  const [selectedAction, setSelectedAction] = useState<SimAction | null>(null);
  const [guidance, setGuidance] = useState("");
  const [usedAI, setUsedAI] = useState(false);
  const [loadingGuidance, setLoadingGuidance] = useState(false);

  const [elapsed, setElapsed] = useState(0);
  const controls = useAnimationControls();
  const prevBreathPhase = useRef<BreathPhase | null>(null);

  const dot = DOT_STYLES[s.dotColor] ?? DOT_STYLES.gold;
  const breathPhase = getBreathPhase(elapsed);

  // ── Fetch guidance when the action is chosen ────────────────────────────────
  async function handleSelectAction(action: SimAction) {
    if (!selectedSim) return;
    setSelectedAction(action);
    setPhase("guidance");
    setLoadingGuidance(true);

    const input = {
      simulation: selectedSim.label,
      action: action.label,
      goal: s.userGoal || undefined,
      habit: habit ? habitLabel(habit) : undefined,
    };

    const ai = await fetchResetMasterGuidance(input);
    if (ai) {
      setGuidance(ai);
      setUsedAI(true);
    } else {
      setGuidance(scriptedGuidance(input));
      setUsedAI(false);
    }
    setLoadingGuidance(false);
  }

  // ── Breathing timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "breathing") return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // ── Auto-advance once the session completes ─────────────────────────────────
  useEffect(() => {
    if (phase === "breathing" && elapsed >= SESSION_SECS) setPhase("reflection");
  }, [phase, elapsed]);

  // ── Circle animation responds to breath phase ──────────────────────────────
  useEffect(() => {
    if (phase !== "breathing") return;
    if (prevBreathPhase.current === breathPhase) return;
    prevBreathPhase.current = breathPhase;
    if (breathPhase === "inhale") {
      controls.start({ scale: 1 }, { duration: INHALE_SECS, ease: "easeInOut" });
    } else if (breathPhase === "exhale") {
      controls.start({ scale: 0.28 }, { duration: EXHALE_SECS, ease: "easeInOut" });
    }
  }, [breathPhase, controls, phase]);

  function handleSelectReflection(reflection: Reflection) {
    if (!selectedSim || !selectedAction) return;
    const entry: SimulationResult = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
      simulation: selectedSim.label,
      action: selectedAction.label,
      guidance,
      reflection: reflection.label,
      usedAI,
    };
    setSimulations((prev) => [entry, ...prev]);
    setPhase("done");
    setTimeout(() => setLocation("/"), 2600);
  }

  function goBack() {
    if (phase === "scenario") setPhase("choose");
    else if (phase === "action") setPhase("scenario");
    else setLocation("/");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-4">
      <div className="max-w-[430px] mx-auto w-full px-4 pt-8 flex-1 flex flex-col">
        <AnimatePresence mode="wait">

          {/* ── Choose a simulation ── */}
          {phase === "choose" && (
            <motion.div
              key="choose"
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
                  <span className="text-xs uppercase tracking-widest text-primary font-semibold">Simulation Mode</span>
                </div>
                <h1 className="text-2xl font-black text-foreground leading-tight mb-1">Practice a weak moment</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Rehearse the hard moments while you are calm, so you are ready when they come for real.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {SIMULATIONS.map((sim) => (
                  <button
                    key={sim.id}
                    data-testid={`sim-${sim.id}`}
                    onClick={() => { setSelectedSim(sim); setPhase("scenario"); }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                  >
                    <sim.Icon size={20} className="text-primary shrink-0" />
                    <span className="font-semibold text-foreground text-sm">{sim.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Scenario ── */}
          {phase === "scenario" && selectedSim && (
            <motion.div
              key="scenario"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col pb-24"
            >
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                  <selectedSim.Icon size={30} className="text-primary" />
                </div>
                <h2 className="text-xl font-black text-foreground mb-4">{selectedSim.label}</h2>
                <p className="text-base text-muted-foreground leading-relaxed max-w-[330px] mb-2">
                  {selectedSim.scenario}
                </p>
              </div>

              <button
                data-testid="button-in-the-moment"
                onClick={() => setPhase("action")}
                className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold tracking-tight hover:bg-primary/90 transition-colors"
              >
                I am in this moment
              </button>
            </motion.div>
          )}

          {/* ── Choose an action ── */}
          {phase === "action" && (
            <motion.div
              key="action"
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
                <h2 className="text-xl font-black text-foreground mb-1">What do you choose to do?</h2>
                <p className="text-sm text-muted-foreground">Pick the response you want to build into a habit.</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {SIM_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    data-testid={`action-${action.id}`}
                    onClick={() => handleSelectAction(action)}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                  >
                    <span className="font-semibold text-foreground text-sm">{action.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Reset Master guidance ── */}
          {phase === "guidance" && (
            <motion.div
              key="guidance"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col pb-24"
            >
              <div className="flex items-center gap-2 mb-6 pt-2">
                <Sparkles size={18} className="text-primary" />
                <span className="text-sm font-black text-foreground tracking-tight">Reset Master</span>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {loadingGuidance ? (
                  <div className="flex flex-col items-center justify-center text-center py-10">
                    <Loader2 size={28} className="text-primary animate-spin mb-4" />
                    <p className="text-sm text-muted-foreground">Reset Master is thinking...</p>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="p-5 rounded-2xl bg-card border border-primary/20 mb-4">
                      <p className="text-base text-foreground leading-relaxed whitespace-pre-line">{guidance}</p>
                    </div>
                    <div className="flex items-start gap-2 px-1">
                      <ShieldCheck size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        AI guidance is for self-help only and is not medical advice.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {!loadingGuidance && (
                <button
                  data-testid="button-to-breathing"
                  onClick={() => { setElapsed(0); prevBreathPhase.current = null; setPhase("breathing"); }}
                  className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold tracking-tight hover:bg-primary/90 transition-colors"
                >
                  Breathe through it
                </button>
              )}
            </motion.div>
          )}

          {/* ── Breathing ── */}
          {phase === "breathing" && (
            <motion.div
              key="breathing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col pb-24"
            >
              <p className="text-center text-sm text-muted-foreground mb-6 pt-2">Ride the wave. It always passes.</p>

              <div className="flex flex-col items-center flex-1 justify-center">
                <div className="relative flex items-center justify-center w-52 h-52 sm:w-64 sm:h-64 mb-8">
                  <div className={`absolute inset-0 rounded-full border ${dot.ring}`} />
                  <motion.div
                    animate={controls}
                    initial={{ scale: 0.28 }}
                    className="w-40 h-40 sm:w-48 sm:h-48 rounded-full"
                    style={{ background: dot.gradient, boxShadow: dot.shadow }}
                  />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={breathPhase}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.3 }}
                    className={`text-3xl font-black ${dot.label} tracking-wide`}
                  >
                    {getPhaseLabel(breathPhase)}
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                data-testid="button-skip-breathing"
                onClick={() => setPhase("reflection")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors text-center py-3"
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* ── Reflection ── */}
          {phase === "reflection" && (
            <motion.div
              key="reflection"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col pb-24"
            >
              <div className="mb-6 pt-2">
                <h2 className="text-xl font-black text-foreground mb-1">What will you tell yourself?</h2>
                <p className="text-sm text-muted-foreground">Choose the reminder to carry into the real moment.</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {REFLECTIONS.map((r) => (
                  <button
                    key={r.id}
                    data-testid={`reflection-${r.id}`}
                    onClick={() => handleSelectReflection(r)}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                  >
                    <span className="font-semibold text-foreground text-sm leading-snug">{r.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Done ── */}
          {phase === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <CheckCircle size={72} className="text-primary mb-5" />
              <h2 className="text-2xl font-black text-foreground mb-2">Rep complete.</h2>
              <p className="text-muted-foreground max-w-[300px]">
                You practiced the moment before it happened. That is how you get ready.
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
