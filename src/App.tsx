
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AquariumProvider } from "@/contexts/AquariumContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AquaBot from "./pages/AquaBot";
import Profile from "./pages/Profile";
import AddTank from "./pages/AddTank";
import EditTank from "./pages/EditTank";
import TankDetails from "./pages/TankDetails";
import LogParameters from "./pages/LogParameters";
import SetupPlanner from "./pages/SetupPlanner";
import Education from "./pages/Education";
import Livestock from "./pages/Livestock";
import Equipment from "./pages/Equipment";
import Reminders from "./pages/Reminders";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AquariumProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/aquabot" element={<AquaBot />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/add-tank" element={<AddTank />} />
                  <Route path="/edit-tank/:tankId" element={<EditTank />} />
                  <Route path="/tank/:tankId" element={<TankDetails />} />
                  <Route path="/log-parameters/:tankId" element={<LogParameters />} />
                  <Route path="/setup-planner" element={<SetupPlanner />} />
                  <Route path="/education" element={<Education />} />
                  <Route path="/livestock" element={<Livestock />} />
                  <Route path="/equipment" element={<Equipment />} />
                  <Route path="/reminders" element={<Reminders />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AquariumProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
