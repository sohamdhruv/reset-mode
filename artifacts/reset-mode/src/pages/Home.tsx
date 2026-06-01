import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Settings, Zap, CheckCircle, TrendingUp, Clock, DollarSign, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStreakInfo, useUrgesDefeated, useStartDate, useSpendings, useStorage } from "@/lib/storage";
import { OnboardingModal } from "@/components/OnboardingModal";
import type { HabitType } from "@/lib/storage";

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string | number; sub?: string }) {
  return (
    <Card className="bg-card border border-border p-4 flex flex-col gap-1 rounded-xl">
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-widest font-medium">
        <Icon size={13} />
        {label}
      </div>
      <div className="text-2xl font-bold text-foreground leading-none" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </Card>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { currentStreak, bestStreak, cleanDays } = useStreakInfo();
  const [urgesDefeated] = useUrgesDefeated();
  const [startDate, setStartDate] = useStartDate();
  const [spendings] = useSpendings();
  const [habit] = useStorage<HabitType>("resetMode_habit", null);
  const [showOnboarding, setShowOnboarding] = useState(() => !habit);

  const today = new Date().toISOString().split("T")[0];
  const isCleanToday = cleanDays.includes(today);
  const [, setCleanDays] = useStorage<string[]>("resetMode_cleanDays", []);

  useEffect(() => {
    if (!startDate && habit) {
      setStartDate(new Date().toISOString());
    }
  }, [habit, startDate, setStartDate]);

  function markCleanToday() {
    setCleanDays((prev) => {
      if (prev.includes(today)) return prev;
      if (!startDate) setStartDate(new Date().toISOString());
      return [...prev, today];
    });
  }

  const timeSavedHours = Math.floor((urgesDefeated * 30) / 60);
  const timeSavedMins = (urgesDefeated * 30) % 60;

  const totalMonthlySpend = spendings.reduce((sum, s) => sum + s.monthlySub + s.monthlyBoosts, 0);
  const daysSinceStart = startDate
    ? Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000)
    : 0;
  const moneySaved = ((totalMonthlySpend / 30) * daysSinceStart).toFixed(2);

  const habitLabel: Record<NonNullable<HabitType>, string> = {
    porn: "Pornography",
    dating_apps: "Dating Apps",
    social_media: "Social Media",
    all: "All Digital Habits",
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {showOnboarding && (
        <OnboardingModal
          onComplete={() => {
            setShowOnboarding(false);
            setStartDate(new Date().toISOString());
          }}
        />
      )}

      <div className="max-w-[430px] mx-auto px-4 pt-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Reset Mode</h1>
            {habit && (
              <p className="text-sm text-muted-foreground mt-0.5">
                Breaking: <span className="text-primary font-medium">{habitLabel[habit]}</span>
              </p>
            )}
          </div>
          <button
            data-testid="button-settings"
            onClick={() => setLocation("/settings")}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <Settings size={22} />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-2xl p-6 text-center">
            <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">Current Streak</div>
            <div className="text-6xl font-black text-foreground leading-none" data-testid="stat-current-streak">{currentStreak}</div>
            <div className="text-muted-foreground text-sm mt-1">{currentStreak === 1 ? "day" : "days"}</div>
            {currentStreak > 0 && (
              <div className="mt-3 text-xs text-primary/80 font-medium">
                {currentStreak >= 30 ? "You completed the 30-day plan." : `${30 - currentStreak} days left in your reset plan.`}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard icon={Target} label="Best Streak" value={`${bestStreak}d`} />
          <StatCard icon={Zap} label="Urges Defeated" value={urgesDefeated} />
          <StatCard
            icon={Clock}
            label="Time Saved"
            value={timeSavedHours > 0 ? `${timeSavedHours}h ${timeSavedMins}m` : `${timeSavedMins}m`}
            sub="~30 min per urge"
          />
          <StatCard
            icon={DollarSign}
            label="Money Saved"
            value={`$${moneySaved}`}
            sub={daysSinceStart > 0 ? `${daysSinceStart} days in` : "Add spending data"}
          />
        </div>

        <Button
          data-testid="button-urge"
          onClick={() => setLocation("/urge")}
          className="w-full h-16 text-lg font-bold rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground tracking-tight mb-3 shadow-lg"
        >
          <Zap size={22} className="mr-2" />
          I Have an Urge
        </Button>

        {!isCleanToday ? (
          <Button
            data-testid="button-mark-clean"
            variant="outline"
            onClick={markCleanToday}
            className="w-full h-12 rounded-xl border-border text-foreground font-medium"
          >
            <CheckCircle size={18} className="mr-2 text-primary" />
            Mark Today as Clean
          </Button>
        ) : (
          <div className="w-full h-12 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center gap-2 text-primary text-sm font-medium">
            <CheckCircle size={18} />
            Today is marked clean
          </div>
        )}

        <div className="mt-6 p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-accent" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Daily Reminder</span>
          </div>
          <p className="text-sm text-foreground font-medium leading-relaxed">
            {currentStreak === 0
              ? "Every journey starts with a single clean day. This is yours."
              : currentStreak < 7
              ? "Win the next 2 minutes. That is all you need."
              : currentStreak < 14
              ? "You have already defeated urges before. Do it again."
              : "You are not quitting pleasure. You are taking back control."}
          </p>
        </div>
      </div>
    </div>
  );
}
