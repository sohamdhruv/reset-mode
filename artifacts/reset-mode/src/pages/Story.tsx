import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, BookOpen, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStorage } from "@/lib/storage";
import {
  STORY_CATEGORIES,
  PROTECTIVE_CHOICES,
  type StoryCategory,
  type ProtectiveChoice,
} from "@/lib/stories";

type Phase = "choose" | "story" | "closing";

export default function Story() {
  const [, setLocation] = useLocation();
  // Per-category rotation counter, persisted so repeat visits show a new story.
  const [rotation, setRotation] = useStorage<Record<string, number>>(
    "resetMode_storyRotation",
    {},
  );

  const [phase, setPhase] = useState<Phase>("choose");
  const [category, setCategory] = useState<StoryCategory | null>(null);
  const [variationIndex, setVariationIndex] = useState(0);
  const [closingChoice, setClosingChoice] = useState<ProtectiveChoice | null>(null);

  function openCategory(cat: StoryCategory) {
    const current = rotation[cat.id] ?? 0;
    const idx = current % cat.stories.length;
    setCategory(cat);
    setVariationIndex(idx);
    setRotation((prev) => ({ ...prev, [cat.id]: current + 1 }));
    setPhase("story");
  }

  function handleChoice(choice: ProtectiveChoice) {
    if (choice.nav) {
      setLocation(choice.nav);
      return;
    }
    setClosingChoice(choice);
    setPhase("closing");
  }

  function goBack() {
    if (phase === "story") {
      setPhase("choose");
      setCategory(null);
    } else {
      setLocation("/");
    }
  }

  const story = category ? category.stories[variationIndex] : null;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-4">
      <div className="max-w-[430px] mx-auto w-full px-4 pt-8 flex-1 flex flex-col">
        <AnimatePresence mode="wait">

          {/* ── Choose a category ── */}
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
                  <BookOpen size={18} className="text-primary" />
                  <span className="text-xs uppercase tracking-widest text-primary font-semibold">
                    Reset Story
                  </span>
                </div>
                <h1 className="text-2xl font-black text-foreground leading-tight mb-1">
                  A short story for a hard moment
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Choose a theme. Each is a small lesson in discipline from the Reset Master.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {STORY_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    data-testid={`story-${cat.id}`}
                    onClick={() => openCategory(cat)}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                  >
                    <cat.Icon size={20} className="text-primary shrink-0" />
                    <span className="font-semibold text-foreground text-sm">{cat.title}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Read the story + protective choice ── */}
          {phase === "story" && category && story && (
            <motion.div
              key="story"
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

              <div className="flex items-center gap-2 mb-4">
                <category.Icon size={18} className="text-primary shrink-0" />
                <h2 className="text-lg font-black text-foreground tracking-tight">{category.title}</h2>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-primary/20 mb-8">
                {story.lines.map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.5, duration: 0.5 }}
                    className="text-base text-foreground leading-relaxed mb-1.5 last:mb-0"
                  >
                    {line}
                  </motion.p>
                ))}
              </div>

              <div className="mb-4">
                <h3 className="text-base font-black text-foreground mb-1">
                  What choice will protect your future right now?
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {PROTECTIVE_CHOICES.map((choice) => (
                  <button
                    key={choice.id}
                    data-testid={`protect-${choice.id}`}
                    onClick={() => handleChoice(choice)}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                  >
                    <choice.Icon size={18} className="text-primary shrink-0" />
                    <span className="font-semibold text-foreground text-sm">{choice.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Closing message for choices without a dedicated screen ── */}
          {phase === "closing" && closingChoice && (
            <motion.div
              key="closing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center pb-24"
            >
              <CheckCircle size={64} className="text-primary mb-6" />
              <p className="text-lg text-foreground leading-relaxed max-w-[320px] mb-10">
                {closingChoice.closing}
              </p>
              <button
                data-testid="button-story-done"
                onClick={() => setLocation("/")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Done
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
