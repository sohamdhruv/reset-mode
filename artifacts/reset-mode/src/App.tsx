import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/BottomNav";
import Home from "@/pages/Home";
import Urge from "@/pages/Urge";
import Tracker from "@/pages/Tracker";
import SpendingPage from "@/pages/Spending";
import Journal from "@/pages/Journal";
import Plan from "@/pages/Plan";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

const SETTINGS_ROUTES = ["/settings"];

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/urge" component={Urge} />
      <Route path="/tracker" component={Tracker} />
      <Route path="/spending" component={SpendingPage} />
      <Route path="/journal" component={Journal} />
      <Route path="/plan" component={Plan} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <Router />
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
