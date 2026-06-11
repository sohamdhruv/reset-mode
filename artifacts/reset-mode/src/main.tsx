import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker } from "@/lib/notifications";

createRoot(document.getElementById("root")!).render(<App />);

// Register the notification service worker (no-op where unsupported).
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    void registerServiceWorker();
  });
}
