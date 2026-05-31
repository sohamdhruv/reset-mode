import { useState } from "react";
import { CheckCircle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStreakInfo, useStorage } from "@/lib/storage";

function computeStreakHistory(cleanDays: string[]): { start: string; end: string; length: number }[] {
  if (!cleanDays.length) return [];
  const sorted = Array.from(new Set(cleanDays)).sort();
  const streaks: { start: string; end: string; length: number }[] = [];
  let start = sorted[0];
  let prev = sorted[0];
  let length = 1;

  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i];
    const prevDate = new Date(prev);
    const currDate = new Date(curr);
    const diff = (currDate.getTime() - prevDate.getTime()) / 86400000;
    if (diff === 1) {
      length++;
      prev = curr;
    } else {
      streaks.push({ start, end: prev, length });
      start = curr;
      prev = curr;
      length = 1;
    }
  }
  streaks.push({ start, end: prev, length });
  return streaks.reverse();
}

export default function Tracker() {
  const { currentStreak, bestStreak, cleanDays } = useStreakInfo();
  const [allCleanDays, setCleanDays] = useStorage<string[]>("resetMode_cleanDays", []);
  const [showConfirm, setShowConfirm] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const isCleanToday = allCleanDays.includes(today);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const streakHistory = computeStreakHistory(allCleanDays);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function markCleanToday() {
    if (!isCleanToday) {
      setCleanDays(prev => [...prev, today]);
    }
  }

  function handleRelapse() {
    setCleanDays([]);
    setShowConfirm(false);
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-[430px] mx-auto px-4 pt-10">
        <h2 className="text-xl font-black text-foreground mb-6">Streak Tracker</h2>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-black text-foreground" data-testid="tracker-current-streak">{currentStreak}</div>
            <div className="text-xs uppercase tracking-widest text-primary font-semibold mt-1">Current Streak</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-3xl font-black text-foreground" data-testid="tracker-best-streak">{bestStreak}</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-1">Best Streak</div>
          </div>
        </div>

        <Card className="bg-card border border-border rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} data-testid="button-prev-month" className="text-muted-foreground hover:text-foreground p-1">
              <ChevronLeft size={20} />
            </button>
            <span className="font-semibold text-foreground">{MONTHS[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} data-testid="button-next-month" className="text-muted-foreground hover:text-foreground p-1">
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[11px] text-muted-foreground font-medium py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isClean = allCleanDays.includes(dateStr);
              const isToday = dateStr === today;
              return (
                <div
                  key={day}
                  data-testid={`calendar-day-${dateStr}`}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    isClean
                      ? "bg-primary text-primary-foreground"
                      : isToday
                      ? "border border-primary/60 text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </Card>

        {!isCleanToday ? (
          <Button
            data-testid="button-mark-clean-tracker"
            onClick={markCleanToday}
            className="w-full h-12 rounded-xl font-medium mb-3"
          >
            <CheckCircle size={18} className="mr-2" />
            Mark Today as Clean
          </Button>
        ) : (
          <div className="w-full h-12 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center gap-2 text-primary text-sm font-medium mb-3">
            <CheckCircle size={18} />
            Today is marked clean
          </div>
        )}

        {!showConfirm ? (
          <button
            data-testid="button-relapse"
            onClick={() => setShowConfirm(true)}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            I relapsed today
          </button>
        ) : (
          <Card className="bg-card border border-border rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw size={16} className="text-accent" />
              <span className="font-semibold text-foreground text-sm">Every reset is a new beginning.</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              What matters is that you came back. Your streak will reset, but your commitment does not.
            </p>
            <div className="flex gap-2">
              <Button
                data-testid="button-confirm-relapse"
                variant="outline"
                onClick={handleRelapse}
                className="flex-1 text-sm h-10 border-border"
              >
                Reset My Streak
              </Button>
              <Button
                data-testid="button-cancel-relapse"
                onClick={() => setShowConfirm(false)}
                className="flex-1 text-sm h-10"
              >
                Keep Going
              </Button>
            </div>
          </Card>
        )}

        {streakHistory.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground font-semibold mb-3">Streak History</h3>
            <div className="flex flex-col gap-2">
              {streakHistory.slice(0, 5).map((s, i) => (
                <div key={i} className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
                  <span className="text-sm text-muted-foreground">{s.start} — {s.end}</span>
                  <span className="text-sm font-bold text-foreground">{s.length}d</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
