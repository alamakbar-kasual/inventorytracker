import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { LanguageProvider } from "@/contexts/language-context";
import NotFound from "@/pages/not-found";
import Inventory from "@/pages/inventory";
import Analytics from "@/pages/analytics";
import Finance from "@/pages/finance";
import Settings from "@/pages/settings";
import Predictions from "@/pages/predictions";
import UserManagement from "@/pages/user-management";
import Wiki from "@/pages/wiki";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Inventory} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/finance" component={Finance} />
      <Route path="/predictions" component={Predictions} />
      <Route path="/settings" component={Settings} />
      <Route path="/users" component={UserManagement} />
      <Route path="/help" component={Wiki} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
