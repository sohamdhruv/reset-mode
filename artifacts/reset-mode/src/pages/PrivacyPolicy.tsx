import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

const SECTIONS: { heading: string; body: string }[] = [
  {
    heading: "Information stored",
    body: "Reset Mode may store your selected habit, goal, streak, journal entries, reminder settings, and app preferences on your device or app storage.",
  },
  {
    heading: "How information is used",
    body: "This information is used only to personalize your Reset Mode experience, such as showing your selected habit, goal reminders, streak progress, journal history, and breathing reset support.",
  },
  {
    heading: "Feedback form",
    body: "If you choose to use the Give Feedback button, you may be taken to a Google Form. Any information you submit there is provided voluntarily and may be used to improve the app.",
  },
  {
    heading: "Notifications",
    body: "If you enable reminders, Reset Mode may use browser or device notifications to send motivational reminders. Notifications are optional and can be turned off.",
  },
  {
    heading: "No medical advice",
    body: "Reset Mode is a self-help tool. It is not medical advice, therapy, diagnosis, or a replacement for professional support.",
  },
];

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-[430px] mx-auto px-4 pt-8">
        <button
          data-testid="button-back-privacy"
          onClick={() => setLocation("/settings")}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
        >
          <ArrowLeft size={16} />
          Back to Settings
        </button>

        <h2 className="text-xl font-black text-foreground mb-3">Privacy Policy</h2>

        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Reset Mode is a self-help app designed to help users build discipline and reduce unwanted digital habits.
        </p>

        <div className="space-y-3">
          {SECTIONS.map((section) => (
            <div
              key={section.heading}
              className="p-4 bg-card border border-border rounded-xl"
            >
              <h3 className="text-sm font-semibold text-foreground mb-1.5">
                {section.heading}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}

          <div className="p-4 bg-card border border-border rounded-xl">
            <h3 className="text-sm font-semibold text-foreground mb-1.5">Contact</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For questions or support, contact:{" "}
              <a
                href="mailto:soham.dhruv@gmail.com"
                className="text-primary underline underline-offset-2 break-all"
              >
                soham.dhruv@gmail.com
              </a>
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground/80 leading-relaxed text-center mt-8 px-2">
          Reset Mode is a self-help tool for building discipline and reducing unwanted digital habits. It is not medical advice, therapy, diagnosis, or a replacement for professional support.
        </p>
      </div>
    </div>
  );
}
