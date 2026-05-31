import { useState } from "react";
import { Plus, Trash2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useSpendings, useStartDate } from "@/lib/storage";
import type { Spending } from "@/lib/storage";

export default function SpendingPage() {
  const [spendings, setSpendings] = useSpendings();
  const [startDate] = useStartDate();
  const [showForm, setShowForm] = useState(false);
  const [appName, setAppName] = useState("");
  const [monthlySub, setMonthlySub] = useState("");
  const [monthlyBoosts, setMonthlyBoosts] = useState("");

  const totalMonthly = spendings.reduce((s, x) => s + x.monthlySub + x.monthlyBoosts, 0);
  const totalYearly = totalMonthly * 12;
  const totalFiveYear = totalMonthly * 60;

  const daysSinceStart = startDate
    ? Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000)
    : 0;
  const savedSoFar = ((totalMonthly / 30) * daysSinceStart).toFixed(2);

  function addSpending() {
    if (!appName.trim()) return;
    const newEntry: Spending = {
      id: Date.now().toString(),
      appName: appName.trim(),
      monthlySub: parseFloat(monthlySub) || 0,
      monthlyBoosts: parseFloat(monthlyBoosts) || 0,
    };
    setSpendings((prev) => [...prev, newEntry]);
    setAppName("");
    setMonthlySub("");
    setMonthlyBoosts("");
    setShowForm(false);
  }

  function removeSpending(id: string) {
    setSpendings((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-[430px] mx-auto px-4 pt-10">
        <h2 className="text-xl font-black text-foreground mb-2">Spending Tracker</h2>
        <p className="text-muted-foreground text-sm mb-6">
          See exactly what these habits cost you.
        </p>

        {totalMonthly > 0 && (
          <div className="mb-6 space-y-3">
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
              <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">If you quit today</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-lg font-black text-foreground" data-testid="stat-monthly-savings">${totalMonthly.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">per month</div>
                </div>
                <div>
                  <div className="text-lg font-black text-foreground" data-testid="stat-yearly-savings">${totalYearly.toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">per year</div>
                </div>
                <div>
                  <div className="text-lg font-black text-foreground">${totalFiveYear.toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">in 5 years</div>
                </div>
              </div>
            </div>

            {daysSinceStart > 0 && (
              <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <DollarSign size={20} className="text-accent shrink-0" />
                <div>
                  <div className="font-bold text-foreground" data-testid="stat-saved-so-far">${savedSoFar} saved so far</div>
                  <div className="text-xs text-muted-foreground">Over {daysSinceStart} days clean</div>
                </div>
              </div>
            )}

            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm text-foreground font-medium leading-relaxed">
                You are not just saving money. You are taking back control.
              </p>
            </div>
          </div>
        )}

        {spendings.length > 0 && (
          <div className="mb-4 space-y-2">
            {spendings.map((s) => (
              <Card key={s.id} className="bg-card border border-border rounded-xl p-4 flex items-start justify-between">
                <div>
                  <div className="font-semibold text-foreground" data-testid={`spending-app-${s.id}`}>{s.appName}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    ${s.monthlySub.toFixed(2)} sub + ${s.monthlyBoosts.toFixed(2)} boosts
                    <span className="text-foreground font-medium ml-2">= ${(s.monthlySub + s.monthlyBoosts).toFixed(2)}/mo</span>
                  </div>
                </div>
                <button
                  data-testid={`button-delete-spending-${s.id}`}
                  onClick={() => removeSpending(s.id)}
                  className="text-muted-foreground hover:text-destructive-foreground transition-colors p-1 ml-2 mt-0.5"
                >
                  <Trash2 size={16} />
                </button>
              </Card>
            ))}
          </div>
        )}

        {showForm ? (
          <Card className="bg-card border border-border rounded-xl p-4 mb-4">
            <h3 className="font-semibold text-foreground mb-4">Add an App</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-muted-foreground mb-1.5 block">App Name</Label>
                <Input
                  data-testid="input-app-name"
                  placeholder="e.g. Tinder, Hinge, Bumble"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-muted-foreground mb-1.5 block">Monthly Subscription ($)</Label>
                  <Input
                    data-testid="input-monthly-sub"
                    type="number"
                    placeholder="0.00"
                    value={monthlySub}
                    onChange={(e) => setMonthlySub(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground mb-1.5 block">Boosts & Extras ($)</Label>
                  <Input
                    data-testid="input-monthly-boosts"
                    type="number"
                    placeholder="0.00"
                    value={monthlyBoosts}
                    onChange={(e) => setMonthlyBoosts(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  data-testid="button-cancel-spending"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border-border"
                >
                  Cancel
                </Button>
                <Button
                  data-testid="button-save-spending"
                  onClick={addSpending}
                  disabled={!appName.trim()}
                  className="flex-1"
                >
                  Add App
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Button
            data-testid="button-add-spending"
            variant="outline"
            onClick={() => setShowForm(true)}
            className="w-full h-12 rounded-xl border-border border-dashed text-muted-foreground hover:text-foreground"
          >
            <Plus size={18} className="mr-2" />
            Add an App
          </Button>
        )}

        {spendings.length === 0 && !showForm && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            Add the apps you were spending money on to see your projected savings.
          </p>
        )}
      </div>
    </div>
  );
}
