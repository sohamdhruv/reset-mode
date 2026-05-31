import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUrgesDefeated } from "@/lib/storage";
import { motion, AnimatePresence } from "framer-motion";

const MOODS = [
  { id: "bored", label: "Bored", action: "Go for a 5-minute walk outside. Movement clears the loop." },
  { id: "lonely", label: "Lonely", action: "Message a friend right now. Or journal for 2 minutes about what you need." },
  { id: "stressed", label: "Stressed", action: "Breathe slowly and stretch your shoulders. The urge will pass in 2 minutes." },
  { id: "tired", label: "Tired", action: "Put your phone face-down across the room and sleep. Your body needs rest, not stimulation." },
  { id: "rejected", label: "Rejected", action: "Your value is not based on matches or responses. Write one thing you respect about yourself." },
  { id: "anxious", label: "Anxious", action: "Slow your breath to 4 counts in, 4 counts out. Then write one sentence about what you are feeling." },
];

const TIMER_SECONDS = 120;

export default function Urge() {
  const [, setLocation] = useLocation();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [defeated, setDefeated] = useState(false);
  const [urgesDefeated, setUrgesDefeated] = useUrgesDefeated();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerActive, timeLeft]);

  function selectMood(id: string) {
    setSelectedMood(id);
    setTimerActive(true);
    setTimeLeft(TIMER_SECONDS);
  }

  function handleDefeat() {
    setUrgesDefeated(urgesDefeated + 1);
    setDefeated(true);
    setTimeout(() => setLocation("/"), 1500);
  }

  const progress = (timeLeft / TIMER_SECONDS) * 100;
  const circumference = 2 * Math.PI * 54;
  const strokeDash = (progress / 100) * circumference;

  const mood = MOODS.find((m) => m.id === selectedMood);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <div className="max-w-[430px] mx-auto w-full px-4 pt-8 flex-1 flex flex-col">
        <button
          data-testid="button-back"
          onClick={() => setLocation("/")}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <AnimatePresence mode="wait">
          {defeated ? (
            <motion.div
              key="defeated"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <CheckCircle size={64} className="text-primary mb-4" />
              <h2 className="text-2xl font-black text-foreground mb-2">Urge defeated.</h2>
              <p className="text-muted-foreground">One vote for your future self.</p>
            </motion.div>
          ) : !selectedMood ? (
            <motion.div
              key="mood"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-8">
                <h1 className="text-xl font-black text-foreground leading-tight mb-2">
                  Pause. You only need to win the next 2 minutes.
                </h1>
                <p className="text-muted-foreground text-sm">What are you feeling right now?</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {MOODS.map((mood) => (
                  <button
                    key={mood.id}
                    data-testid={`button-mood-${mood.id}`}
                    onClick={() => selectMood(mood.id)}
                    className="p-4 rounded-xl border border-border bg-card hover:border-primary/60 hover:bg-primary/5 transition-all text-left"
                  >
                    <div className="font-semibold text-foreground text-base">{mood.label}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="timer"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex-1 flex flex-col items-center"
            >
              <div className="w-full mb-6 p-4 bg-card border border-border rounded-xl">
                <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">Your Action</div>
                <p className="text-foreground font-medium leading-relaxed text-sm">{mood?.action}</p>
              </div>

              <div className="relative flex items-center justify-center my-6">
                <svg width="128" height="128" className="-rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth="6"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="54"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${strokeDash} ${circumference}`}
                    style={{ transition: "stroke-dasharray 1s linear" }}
                  />
                </svg>
                <div className="absolute text-center">
                  <div className="text-3xl font-black text-foreground tabular-nums">
                    {minutes}:{seconds.toString().padStart(2, "0")}
                  </div>
                  <div className="text-xs text-muted-foreground">breathe</div>
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground mb-8 px-4">
                Stay with this for {minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`} more. The urge will pass.
              </p>

              <Button
                data-testid="button-defeat-urge"
                onClick={handleDefeat}
                className="w-full h-14 text-base font-bold rounded-xl bg-primary text-primary-foreground"
              >
                <CheckCircle size={20} className="mr-2" />
                I defeated this urge
              </Button>

              <button
                onClick={() => { setSelectedMood(null); setTimerActive(false); setTimeLeft(TIMER_SECONDS); }}
                className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Change mood
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
