import { useState, useEffect } from "react";
import { X, ShieldAlert } from "lucide-react";
import { onInAppReminder } from "@/lib/notifications";
import { motion, AnimatePresence } from "framer-motion";

interface ReminderItem {
  id: number;
  message: string;
}

let nextId = 0;

export function InAppReminder() {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);

  useEffect(() => {
    return onInAppReminder((message) => {
      const id = nextId++;
      setReminders((prev) => [...prev, { id, message }]);
      // Auto-dismiss after 8 seconds
      setTimeout(() => {
        setReminders((prev) => prev.filter((r) => r.id !== id));
      }, 8000);
    });
  }, []);

  return (
    <div className="fixed top-4 left-0 right-0 z-[200] flex flex-col items-center gap-2 pointer-events-none px-4">
      <AnimatePresence>
        {reminders.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-auto w-full max-w-[400px] bg-card border border-primary/40 rounded-2xl shadow-xl px-4 py-3 flex items-start gap-3"
          >
            <ShieldAlert size={18} className="text-accent shrink-0 mt-0.5" />
            <p className="flex-1 text-sm text-foreground font-medium leading-snug">{r.message}</p>
            <button
              data-testid={`button-dismiss-reminder-${r.id}`}
              onClick={() => setReminders((prev) => prev.filter((x) => x.id !== r.id))}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <X size={15} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
