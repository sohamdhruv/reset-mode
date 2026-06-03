import { useState } from "react";
import { ArrowLeft, Bell, MessageSquare, Target, X, ShieldAlert, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/storage";
import { DEFAULT_SETTINGS } from "@/lib/storage";
import type { DangerZonePreset, DangerZoneIntensity } from "@/lib/storage";
import {
  notificationsSupported,
  requestNotificationPermission,
  sendBrowserNotification,
  fireInAppReminder,
  DANGER_MESSAGES,
} from "@/lib/notifications";

const SAMPLE_NOTIFICATIONS = [
  "Your danger time is coming. Plan your next 2 hours.",
  "Do not open the loop. Tap here for a 2-minute reset.",
  "Check in now. One honest tap keeps your progress alive.",
  "You have already defeated urges before. Do it again.",
];

const DANGER_PRESETS: { value: DangerZonePreset; label: string; start: string; end: string }[] = [
  { value: "late_night", label: "Late night (10pm – 2am)", start: "22:00", end: "02:00" },
  { value: "early_morning", label: "Early morning (6am – 9am)", start: "06:00", end: "09:00" },
  { value: "afternoon", label: "Afternoon (12pm – 3pm)", start: "12:00", end: "15:00" },
  { value: "anytime", label: "Anytime (all day)", start: "00:00", end: "23:59" },
  { value: "custom", label: "Custom window", start: "", end: "" },
];

const INTENSITY_OPTIONS: { value: DangerZoneIntensity; label: string; desc: string }[] = [
  { value: "light", label: "Light", desc: "Every 30 minutes" },
  { value: "normal", label: "Normal", desc: "Every 15 minutes" },
  { value: "strong", label: "Strong", desc: "Every 10 minutes" },
];

export default function Settings() {
  const [, setLocation] = useLocation();
  const [settings, setSettings] = useSettings();
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [permStatus, setPermStatus] = useState<NotificationPermission | null>(
    notificationsSupported() ? Notification.permission : null,
  );

  const s = { ...DEFAULT_SETTINGS, ...settings };

  function update<K extends keyof typeof s>(key: K, value: typeof s[K]) {
    setSettings((prev) => ({ ...DEFAULT_SETTINGS, ...prev, [key]: value }));
  }

  function applyPreset(preset: DangerZonePreset) {
    const p = DANGER_PRESETS.find((x) => x.value === preset);
    if (!p) return;
    setSettings((prev) => ({
      ...DEFAULT_SETTINGS,
      ...prev,
      dangerZonePreset: preset,
      ...(preset !== "custom" && { dangerZoneStart: p.start, dangerZoneEnd: p.end }),
    }));
  }

  async function handleRequestPermission() {
    const result = await requestNotificationPermission();
    setPermStatus(result);
  }

  function handleTestNotification() {
    const msg = DANGER_MESSAGES[0];
    const sent = sendBrowserNotification(msg);
    if (!sent) fireInAppReminder(msg);
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

        <h2 className="text-xl font-black text-foreground mb-6">Settings</h2>

        {/* ── Danger Zone Reminders ──────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert size={14} className="text-accent" />
            <span className="text-xs uppercase tracking-widest text-accent font-semibold">Danger Zone Reminders</span>
          </div>

          <Card className="bg-card border border-border rounded-xl p-4 mb-3">
            <div className="flex items-center justify-between mb-1">
              <div>
                <div className="font-semibold text-foreground text-sm">Enable Danger Zone</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Receive alerts during your highest-risk window
                </div>
              </div>
              <Switch
                data-testid="toggle-danger-zone"
                checked={s.dangerZoneEnabled}
                onCheckedChange={async (v) => {
                  if (v && notificationsSupported()) {
                    const result = await requestNotificationPermission();
                    setPermStatus(result);
                  }
                  update("dangerZoneEnabled", v);
                }}
              />
            </div>
          </Card>

          {s.dangerZoneEnabled && (
            <>
              {/* Push permission banner */}
              {permStatus === "granted" && (
                <div className="mb-3 p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-2">
                  <Bell size={14} className="text-primary" />
                  <span className="text-xs text-primary font-medium">Push notifications are active</span>
                </div>
              )}
              {notificationsSupported() && permStatus === "denied" && (
                <div className="mb-3 p-3 bg-card border border-border rounded-xl flex items-start gap-3">
                  <Bell size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Push notifications are blocked in your browser. In-app reminders will still show while the app is open. To enable push, allow notifications in your browser settings.
                  </p>
                </div>
              )}
              {!notificationsSupported() && (
                <div className="mb-3 p-3 bg-card border border-border rounded-xl flex items-start gap-3">
                  <Bell size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Push notifications are not supported in this browser. In-app reminders will show while the app is open.
                  </p>
                </div>
              )}

              {/* Preset selector */}
              <Card className="bg-card border border-border rounded-xl p-4 mb-3">
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                  When do you struggle most?
                </div>
                <div className="flex flex-col gap-2">
                  {DANGER_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      data-testid={`button-preset-${p.value}`}
                      onClick={() => applyPreset(p.value)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                        s.dangerZonePreset === p.value
                          ? "border-accent/60 bg-accent/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-border hover:text-foreground"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Custom or editable time window */}
              <Card className="bg-card border border-border rounded-xl p-4 mb-3">
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                  Time Window
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">From</Label>
                    <Input
                      data-testid="input-danger-start"
                      type="time"
                      value={s.dangerZoneStart}
                      onChange={(e) => {
                        update("dangerZoneStart", e.target.value);
                        update("dangerZonePreset", "custom");
                      }}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Until</Label>
                    <Input
                      data-testid="input-danger-end"
                      type="time"
                      value={s.dangerZoneEnd}
                      onChange={(e) => {
                        update("dangerZoneEnd", e.target.value);
                        update("dangerZonePreset", "custom");
                      }}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>
              </Card>

              {/* Intensity */}
              <Card className="bg-card border border-border rounded-xl p-4 mb-3">
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                  Reminder Intensity
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {INTENSITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      data-testid={`button-intensity-${opt.value}`}
                      onClick={() => update("dangerZoneIntensity", opt.value)}
                      className={`flex flex-col items-center p-3 rounded-lg border text-center transition-all ${
                        s.dangerZoneIntensity === opt.value
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-border hover:text-foreground"
                      }`}
                    >
                      <span className="font-semibold text-sm">{opt.label}</span>
                      <span className="text-xs mt-0.5 leading-tight">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Test button */}
              <Button
                data-testid="button-test-notification"
                variant="outline"
                onClick={handleTestNotification}
                className="w-full h-11 rounded-xl border-border text-sm font-medium mb-1"
              >
                <Zap size={15} className="mr-2" />
                Send a Test Reminder Now
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                {notificationsSupported() && permStatus === "granted"
                  ? "Sends a browser notification."
                  : "Shows an in-app banner (push not enabled)."}
              </p>
            </>
          )}
        </div>

        {/* ── General Reminders ─────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={14} className="text-primary" />
            <span className="text-xs uppercase tracking-widest text-primary font-semibold">General Reminders</span>
          </div>
          <div className="space-y-3">
            <Card className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-foreground text-sm">Morning Check-in</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Start the day with intention</div>
                </div>
                <Switch
                  data-testid="toggle-morning"
                  checked={s.morningEnabled}
                  onCheckedChange={(v) => update("morningEnabled", v)}
                />
              </div>
              {s.morningEnabled && (
                <Input
                  data-testid="input-morning-time"
                  type="time"
                  value={s.morningTime}
                  onChange={(e) => update("morningTime", e.target.value)}
                  className="bg-background border-border text-foreground"
                />
              )}
            </Card>

            <Card className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-foreground text-sm">Evening Reminder</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Pre-emptive evening check-in</div>
                </div>
                <Switch
                  data-testid="toggle-evening"
                  checked={s.eveningEnabled}
                  onCheckedChange={(v) => update("eveningEnabled", v)}
                />
              </div>
              {s.eveningEnabled && (
                <Input
                  data-testid="input-evening-time"
                  type="time"
                  value={s.eveningTime}
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
                  checked={s.lateNightEnabled}
                  onCheckedChange={(v) => update("lateNightEnabled", v)}
                />
              </div>
              {s.lateNightEnabled && (
                <Input
                  data-testid="input-late-night-time"
                  type="time"
                  value={s.lateNightTime}
                  onChange={(e) => update("lateNightTime", e.target.value)}
                  className="bg-background border-border text-foreground"
                />
              )}
            </Card>
          </div>
        </div>

        {/* ── Goal Reminders ───────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Target size={14} className="text-primary" />
            <span className="text-xs uppercase tracking-widest text-primary font-semibold">Goal Reminders</span>
          </div>

          {s.userGoal ? (
            <div className="mb-3 p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-2">
              <Target size={14} className="text-primary shrink-0" />
              <span className="text-xs text-primary font-medium">Your goal: {s.userGoal}</span>
            </div>
          ) : (
            <div className="mb-3 p-3 bg-card border border-border rounded-xl">
              <p className="text-xs text-muted-foreground">
                No goal set. Reset your onboarding in the Danger Zone section or add one below.
              </p>
              <Input
                className="mt-2 bg-background border-border text-foreground text-sm"
                placeholder="e.g. Launch my business"
                maxLength={60}
                defaultValue={s.userGoal}
                onBlur={(e) => update("userGoal", e.target.value.trim())}
              />
            </div>
          )}

          {/* Morning goal reminder */}
          <Card className="bg-card border border-border rounded-xl p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-foreground text-sm">Morning Goal Reminder</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Start the day connected to your why
                </div>
              </div>
              <Switch
                checked={s.morningGoalReminderEnabled}
                onCheckedChange={async (v) => {
                  if (v && notificationsSupported()) {
                    const result = await requestNotificationPermission();
                    setPermStatus(result);
                  }
                  update("morningGoalReminderEnabled", v);
                }}
              />
            </div>
            {s.morningGoalReminderEnabled && (
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Reminder time</Label>
                <Input
                  type="time"
                  value={s.goalReminderTime}
                  onChange={(e) => update("goalReminderTime", e.target.value)}
                  className="bg-background border-border text-foreground max-w-[140px]"
                />
              </div>
            )}
          </Card>

          {/* Danger zone goal reminder */}
          <Card className="bg-card border border-border rounded-xl p-4 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground text-sm">Danger Zone Goal Reminder</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Remind yourself of your goal during high-risk moments
                </div>
              </div>
              <Switch
                checked={s.dangerZoneGoalReminderEnabled}
                onCheckedChange={async (v) => {
                  if (v && notificationsSupported()) {
                    const result = await requestNotificationPermission();
                    setPermStatus(result);
                  }
                  update("dangerZoneGoalReminderEnabled", v);
                }}
              />
            </div>
          </Card>

          {/* Reminder preview */}
          <div className="p-3 bg-card border border-border rounded-xl">
            <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-widest">Message preview</p>
            <p className="text-sm text-foreground leading-relaxed">
              {s.userGoal
                ? `"Remember your goal: ${s.userGoal}. Protect it today."`
                : `"Do not trade your future for a temporary urge."`}
            </p>
          </div>
        </div>

        {/* ── Sample Notifications ─────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={14} className="text-muted-foreground" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Sample Messages</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            These are examples of what you will receive during your danger window.
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
                    onClick={() => setDismissed((prev) => [...prev, i])}
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
            {dismissed.length === SAMPLE_NOTIFICATIONS.length && (
              <p className="text-sm text-muted-foreground text-center py-2">All samples dismissed.</p>
            )}
          </div>
        </div>

        {/* ── Feedback ─────────────────────────────────────── */}
        <div className="mb-8">
          <a
            href="https://forms.gle/hBdoq7LcA7TU1fBY8"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-border bg-card py-3.5 px-4 text-sm font-semibold text-foreground active:opacity-70 transition-opacity"
          >
            <MessageSquare size={16} className="shrink-0" />
            Give Feedback
          </a>
          <p className="mt-2 text-center text-xs text-muted-foreground leading-relaxed">
            Share what helped, what felt confusing, or what you want added next.
          </p>
        </div>
      </div>
    </div>
  );
}
