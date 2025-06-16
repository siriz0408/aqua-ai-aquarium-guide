
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AquariumProvider } from "@/contexts/AquariumContext";
import Index from "./pages/Index";
import TankDetails from "./pages/TankDetails";
import LogParameters from "./pages/LogParameters";
import Equipment from "./pages/Equipment";
import Livestock from "./pages/Livestock";
import SetupPlanner from "./pages/SetupPlanner";
import AquaBot from "./pages/AquaBot";
import Reminders from "./pages/Reminders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AquariumProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-blue-900 dark:to-cyan-900">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/tank/:tankId" element={<TankDetails />} />
                <Route path="/tank/:tankId/log-parameters" element={<LogParameters />} />
                <Route path="/tank/:tankId/equipment" element={<Equipment />} />
                <Route path="/tank/:tankId/livestock" element={<Livestock />} />
                <Route path="/setup-planner" element={<SetupPlanner />} />
                <Route path="/aquabot" element={<AquaBot />} />
                <Route path="/reminders" element={<Reminders />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AquariumProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
