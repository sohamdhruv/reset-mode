import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/BottomNav";
import { InAppReminder } from "@/components/InAppReminder";
import { useDangerZoneNotifications } from "@/hooks/useDangerZoneNotifications";
import Home from "@/pages/Home";
import Urge from "@/pages/Urge";
import Simulation from "@/pages/Simulation";
import Tracker from "@/pages/Tracker";
import SpendingPage from "@/pages/Spending";
import Journal from "@/pages/Journal";
import Plan from "@/pages/Plan";
import Settings from "@/pages/Settings";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function AppShell() {
  useDangerZoneNotifications();

  return (
    <div className="min-h-screen bg-background">
      <InAppReminder />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/urge" component={Urge} />
        <Route path="/simulation" component={Simulation} />
        <Route path="/tracker" component={Tracker} />
        <Route path="/spending" component={SpendingPage} />
        <Route path="/journal" component={Journal} />
        <Route path="/plan" component={Plan} />
        <Route path="/settings" component={Settings} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
    </div>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppShell />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
