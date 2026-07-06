import { useState } from "react";
import { Plus, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useJournalEntries, useStorage } from "@/lib/storage";
import { habitJournalCopy } from "@/lib/habitContent";
import type { JournalEntry, HabitType } from "@/lib/storage";

const MOODS = ["Bored", "Lonely", "Stressed", "Tired", "Rejected", "Anxious"];

function mostCommon(arr: string[]): string {
  if (!arr.length) return "—";
  const freq: Record<string, number> = {};
  arr.forEach((v) => { freq[v] = (freq[v] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
}

function dangerHour(entries: JournalEntry[]): string {
  if (!entries.length) return "—";
  const hours: number[] = entries.map((e) => new Date(e.date).getHours());
  const freq: Record<number, number> = {};
  hours.forEach((h) => { freq[h] = (freq[h] || 0) + 1; });
  const topHour = Number(Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]);
  const fmt = (h: number) => `${h % 12 || 12} ${h < 12 ? "AM" : "PM"}`;
  return `${fmt(topHour)} – ${fmt(topHour + 1)}`;
}

export default function Journal() {
  const [entries, setEntries] = useJournalEntries();
  const [habit] = useStorage<HabitType>("resetMode_habit", null);
  const journalCopy = habitJournalCopy(habit);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [mood, setMood] = useState("");
  const [trigger, setTrigger] = useState("");
  const [appWanted, setAppWanted] = useState("");
  const [didInstead, setDidInstead] = useState("");

  function addEntry() {
    if (!mood) return;
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mood,
      trigger,
      appWanted,
      didInstead,
    };
    setEntries((prev) => [newEntry, ...prev]);
    setMood("");
    setTrigger("");
    setAppWanted("");
    setDidInstead("");
    setShowForm(false);
  }

  // Reflection entries share this list but should not skew the urge insights,
  // so patterns are computed from manually logged urges only.
  const manualEntries = entries.filter((e) => e.kind !== "reflection");
  const commonMood = mostCommon(manualEntries.map((e) => e.mood));
  const commonTrigger = mostCommon(manualEntries.map((e) => e.trigger).filter(Boolean));
  const dangerTime = dangerHour(manualEntries);

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-[430px] mx-auto px-4 pt-10">
        <h2 className="text-xl font-black text-foreground mb-2">Trigger Journal</h2>
        <p className="text-muted-foreground text-sm mb-6">Understand your patterns to break them.</p>

        {manualEntries.length >= 3 && (
          <Card className="bg-card border border-border rounded-xl p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-primary" />
              <span className="text-xs uppercase tracking-widest text-primary font-semibold">Your Patterns</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-sm font-bold text-foreground" data-testid="insight-common-mood">{commonMood}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Common mood</div>
              </div>
              <div>
                <div className="text-sm font-bold text-foreground truncate" data-testid="insight-common-trigger">{commonTrigger}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Common trigger</div>
              </div>
              <div>
                <div className="text-sm font-bold text-foreground" data-testid="insight-danger-time">{dangerTime}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Danger time</div>
              </div>
            </div>
          </Card>
        )}

        {showForm ? (
          <Card className="bg-card border border-border rounded-xl p-4 mb-4">
            <h3 className="font-semibold text-foreground mb-4">Log an Urge</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-muted-foreground mb-1.5 block">How were you feeling?</Label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger data-testid="select-mood" className="bg-background border-border">
                    <SelectValue placeholder="Select a mood" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOODS.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1.5 block">What triggered it?</Label>
                <Input
                  data-testid="input-trigger"
                  placeholder={journalCopy?.triggerPlaceholder ?? "e.g. Sitting alone, late night, bored..."}
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1.5 block">{journalCopy?.calledByLabel ?? "Which app / habit called you?"}</Label>
                <Input
                  data-testid="input-app-wanted"
                  placeholder={journalCopy?.calledByPlaceholder ?? "e.g. Tinder, Instagram..."}
                  value={appWanted}
                  onChange={(e) => setAppWanted(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1.5 block">What did you do instead?</Label>
                <Textarea
                  data-testid="input-did-instead"
                  placeholder="e.g. Went for a walk, called a friend..."
                  value={didInstead}
                  onChange={(e) => setDidInstead(e.target.value)}
                  className="bg-background border-border resize-none"
                  rows={2}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  data-testid="button-cancel-journal"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border-border"
                >
                  Cancel
                </Button>
                <Button
                  data-testid="button-save-journal"
                  onClick={addEntry}
                  disabled={!mood}
                  className="flex-1"
                >
                  Save Entry
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Button
            data-testid="button-add-journal"
            variant="outline"
            onClick={() => setShowForm(true)}
            className="w-full h-12 rounded-xl border-dashed border-border text-muted-foreground hover:text-foreground mb-4"
          >
            <Plus size={18} className="mr-2" />
            Log an Urge
          </Button>
        )}

        {entries.length === 0 && !showForm && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            Log your first urge to start seeing patterns.
          </p>
        )}

        <div className="space-y-2">
          {entries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const date = new Date(entry.date);
            const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const timeStr = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
            const isReflection = entry.kind === "reflection";
            return (
              <Card
                key={entry.id}
                data-testid={`journal-entry-${entry.id}`}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="w-full flex items-center justify-between gap-2 p-4 text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">
                      {isReflection ? (entry.trigger || "Reflection") : entry.mood}
                    </div>
                    {isReflection && (
                      <span className="shrink-0 text-[10px] uppercase tracking-wider font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
                        Reflection
                      </span>
                    )}
                    <div className="text-xs text-muted-foreground shrink-0">{dateStr} · {timeStr}</div>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-2">
                    {isReflection ? (
                      <>
                        {entry.trigger && <div className="text-sm"><span className="text-muted-foreground">Trigger: </span>{entry.trigger}</div>}
                        {entry.betterChoice && <div className="text-sm"><span className="text-muted-foreground">Better choice: </span>{entry.betterChoice}</div>}
                        {entry.lesson && <div className="text-sm"><span className="text-muted-foreground">Learned: </span>{entry.lesson}</div>}
                        {entry.nextAction && <div className="text-sm"><span className="text-muted-foreground">Next time: </span>{entry.nextAction}</div>}
                        {!entry.betterChoice && !entry.lesson && !entry.nextAction && (
                          <div className="text-sm text-muted-foreground">No extra notes added.</div>
                        )}
                      </>
                    ) : (
                      <>
                        {entry.trigger && <div className="text-sm"><span className="text-muted-foreground">Trigger: </span>{entry.trigger}</div>}
                        {entry.appWanted && <div className="text-sm"><span className="text-muted-foreground">Called by: </span>{entry.appWanted}</div>}
                        {entry.didInstead && <div className="text-sm"><span className="text-muted-foreground">Did instead: </span>{entry.didInstead}</div>}
                      </>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
