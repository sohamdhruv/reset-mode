import { CheckCircle, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { usePlanCompleted } from "@/lib/storage";

const PLAN_DAYS = [
  { day: 1, task: "Choose your reason", desc: "Write down why you are doing this. Be specific." },
  { day: 2, task: "Delete saved triggers", desc: "Remove accounts, apps, or bookmarks that pull you back." },
  { day: 3, task: "Set danger time reminders", desc: "Go to Settings and configure your reminder times." },
  { day: 4, task: "Replace late-night phone use", desc: "Put your phone across the room when you sleep." },
  { day: 5, task: "Track your spending", desc: "Log what you have been spending on these habits." },
  { day: 6, task: "Log your first urge", desc: "Use the Trigger Journal to record an urge." },
  { day: 7, task: "Reach 7 days clean", desc: "Celebrate quietly. This is real." },
  { day: 8, task: "Find your danger pattern", desc: "Check your Journal insights — when is your hardest hour?" },
  { day: 9, task: "Tell someone you trust", desc: "Accountability doubles your chance of success." },
  { day: 10, task: "Do something hard today", desc: "Cold shower, heavy lift, or a long walk. Earn your discipline." },
  { day: 11, task: "Notice what triggers loneliness", desc: "Write it down. Awareness is the first defense." },
  { day: 12, task: "Replace one evening habit", desc: "Read a book, go for a run, or call someone instead." },
  { day: 13, task: "Check your streak", desc: "You are building something real. Look at the numbers." },
  { day: 14, task: "Two weeks in", desc: "Note how you feel compared to Day 1. Write one sentence." },
  { day: 15, task: "Halfway. Reflect and recommit", desc: "Read your Day 1 reason. Is it still your why?" },
  { day: 16, task: "Tackle boredom proactively", desc: "Plan your evenings this week before the urge appears." },
  { day: 17, task: "Identify your riskiest hour", desc: "Build a specific ritual around it — not willpower." },
  { day: 18, task: "Gratitude practice", desc: "Write 3 things you are proud of since Day 1." },
  { day: 19, task: "Upgrade your environment", desc: "Remove triggers from sight: physical and digital." },
  { day: 20, task: "Check in with your body", desc: "Are you sleeping better? Has your energy shifted?" },
  { day: 21, task: "Three weeks clean", desc: "You have rewired something. This is not small." },
  { day: 22, task: "Revisit your reason", desc: "Update your why if it has evolved. Clarity matters." },
  { day: 23, task: "Help someone else", desc: "Share what has been working. Teaching strengthens the habit." },
  { day: 24, task: "Audit your phone apps", desc: "Delete or move anything that still pulls you back." },
  { day: 25, task: "Set a 60-day goal", desc: "What does freedom look like at 60 days? Write it." },
  { day: 26, task: "Notice the mental clarity", desc: "Write one sentence about how your mind feels differently." },
  { day: 27, task: "Plan your reward", desc: "Something real, earned, and not digital." },
  { day: 28, task: "Almost there", desc: "One urge at a time. You know how to do this now." },
  { day: 29, task: "Visualize Day 30", desc: "You made it. See it clearly before it happens." },
  { day: 30, task: "You completed the plan", desc: "Start again with a new goal, or set your 60-day target." },
];

export default function Plan() {
  const [completed, setCompleted] = usePlanCompleted();

  function toggleDay(day: number) {
    setCompleted((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  const completedCount = completed.length;

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-[430px] mx-auto px-4 pt-10">
        <h2 className="text-xl font-black text-foreground mb-1">30-Day Reset Plan</h2>
        <p className="text-muted-foreground text-sm mb-2">
          One task per day. Small actions build real change.
        </p>
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / 30) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium tabular-nums">{completedCount}/30</span>
        </div>

        <div className="space-y-2">
          {PLAN_DAYS.map(({ day, task, desc }) => {
            const isDone = completed.includes(day);
            return (
              <Card
                key={day}
                data-testid={`plan-day-${day}`}
                className={`border rounded-xl transition-all ${isDone ? "bg-primary/5 border-primary/20" : "bg-card border-border"}`}
              >
                <button
                  onClick={() => toggleDay(day)}
                  className="w-full flex items-start gap-3 p-4 text-left"
                  data-testid={`button-plan-day-${day}`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckCircle size={20} className="text-primary" />
                    ) : (
                      <Circle size={20} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`flex items-center gap-2 ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      <span className="text-xs font-bold tabular-nums text-primary/60 shrink-0">Day {day}</span>
                      <span className="font-semibold text-sm">{task}</span>
                    </div>
                    {!isDone && (
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                    )}
                  </div>
                </button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
