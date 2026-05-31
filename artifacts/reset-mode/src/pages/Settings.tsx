import { useState } from "react";
import { ArrowLeft, Bell, X } from "lucide-react";
import { useLocation } from "wouter";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useSettings } from "@/lib/storage";

const SAMPLE_NOTIFICATIONS = [
  "Your danger time is coming. Plan your next 2 hours.",
  "Do not open the loop. Tap here for a 2-minute reset.",
  "Check in now. One honest tap keeps your progress alive.",
  "You have already defeated urges before. Do it again.",
];

// TODO: Replace simulated notifications with real browser Notification API calls
// (requestPermission, new Notification('Reset Mode', { body: message }))

export default function Settings() {
  const [, setLocation] = useLocation();
  const [settings, setSettings] = useSettings();
  const [dismissed, setDismissed] = useState<number[]>([]);

  function update<K extends keyof typeof settings>(key: K, value: typeof settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function dismissNotification(index: number) {
    setDismissed((prev) => [...prev, index]);
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-[430px] mx-auto px-4 pt-8">
        <button
          data-testid="button-back-settings"
          onClick={() => setLocation("/")}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>

        <h2 className="text-xl font-black text-foreground mb-6">Reminder Settings</h2>

        <div className="space-y-3 mb-8">
          <Card className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-foreground text-sm">Morning Check-in</div>
                <div className="text-xs text-muted-foreground mt-0.5">Start the day with intention</div>
              </div>
              <Switch
                data-testid="toggle-morning"
                checked={settings.morningEnabled}
                onCheckedChange={(v) => update("morningEnabled", v)}
              />
            </div>
            {settings.morningEnabled && (
              <Input
                data-testid="input-morning-time"
                type="time"
                value={settings.morningTime}
                onChange={(e) => update("morningTime", e.target.value)}
                className="bg-background border-border text-foreground"
              />
            )}
          </Card>

          <Card className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-foreground text-sm">Evening Danger Zone</div>
                <div className="text-xs text-muted-foreground mt-0.5">Pre-emptive evening reminder</div>
              </div>
              <Switch
                data-testid="toggle-evening"
                checked={settings.eveningEnabled}
                onCheckedChange={(v) => update("eveningEnabled", v)}
              />
            </div>
            {settings.eveningEnabled && (
              <Input
                data-testid="input-evening-time"
                type="time"
                value={settings.eveningTime}
                onChange={(e) => update("eveningTime", e.target.value)}
                className="bg-background border-border text-foreground"
              />
            )}
          </Card>

          <Card className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-foreground text-sm">Late-Night Warning</div>
                <div className="text-xs text-muted-foreground mt-0.5">Guard the most dangerous hour</div>
              </div>
              <Switch
                data-testid="toggle-late-night"
                checked={settings.lateNightEnabled}
                onCheckedChange={(v) => update("lateNightEnabled", v)}
              />
            </div>
            {settings.lateNightEnabled && (
              <Input
                data-testid="input-late-night-time"
                type="time"
                value={settings.lateNightTime}
                onChange={(e) => update("lateNightTime", e.target.value)}
                className="bg-background border-border text-foreground"
              />
            )}
          </Card>

          <Card className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-foreground text-sm">Custom Risky Window</div>
                <div className="text-xs text-muted-foreground mt-0.5">Your personal danger time</div>
              </div>
              <Switch
                data-testid="toggle-risky"
                checked={settings.riskyEnabled}
                onCheckedChange={(v) => update("riskyEnabled", v)}
              />
            </div>
            {settings.riskyEnabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">From</Label>
                  <Input
                    data-testid="input-risky-start"
                    type="time"
                    value={settings.riskyStart}
                    onChange={(e) => update("riskyStart", e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Until</Label>
                  <Input
                    data-testid="input-risky-end"
                    type="time"
                    value={settings.riskyEnd}
                    onChange={(e) => update("riskyEnd", e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={14} className="text-primary" />
            <span className="text-xs uppercase tracking-widest text-primary font-semibold">Simulated Reminders</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            These are example reminder messages. Tap to dismiss.
          </p>
          <div className="space-y-2">
            {SAMPLE_NOTIFICATIONS.map((msg, i) => {
              if (dismissed.includes(i)) return null;
              return (
                <div
                  key={i}
                  data-testid={`notification-${i}`}
                  className="flex items-start gap-3 bg-card border border-border rounded-xl p-4"
                >
                  <Bell size={16} className="text-accent mt-0.5 shrink-0" />
                  <p className="flex-1 text-sm text-foreground leading-relaxed">{msg}</p>
                  <button
                    data-testid={`button-dismiss-notification-${i}`}
                    onClick={() => dismissNotification(i)}
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
            {dismissed.length === SAMPLE_NOTIFICATIONS.length && (
              <p className="text-sm text-muted-foreground text-center py-2">All reminders dismissed.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
