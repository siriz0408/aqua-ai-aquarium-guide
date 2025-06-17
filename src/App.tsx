
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AquariumProvider } from "@/contexts/AquariumContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import TankDetails from "./pages/TankDetails";
import LogParameters from "./pages/LogParameters";
import Equipment from "./pages/Equipment";
import Livestock from "./pages/Livestock";
import SetupPlanner from "./pages/SetupPlanner";
import AquaBot from "./pages/AquaBot";
import Reminders from "./pages/Reminders";
import Education from "./pages/Education";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AquariumProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-blue-900 dark:to-cyan-900">
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    } />
                    <Route path="/tank/:tankId" element={
                      <ProtectedRoute>
                        <TankDetails />
                      </ProtectedRoute>
                    } />
                    <Route path="/tank/:tankId/log-parameters" element={
                      <ProtectedRoute>
                        <LogParameters />
                      </ProtectedRoute>
                    } />
                    <Route path="/tank/:tankId/equipment" element={
                      <ProtectedRoute>
                        <Equipment />
                      </ProtectedRoute>
                    } />
                    <Route path="/tank/:tankId/livestock" element={
                      <ProtectedRoute>
                        <Livestock />
                      </ProtectedRoute>
                    } />
                    <Route path="/setup-planner" element={
                      <ProtectedRoute>
                        <SetupPlanner />
                      </ProtectedRoute>
                    } />
                    <Route path="/aquabot" element={
                      <ProtectedRoute>
                        <AquaBot />
                      </ProtectedRoute>
                    } />
                    <Route path="/reminders" element={
                      <ProtectedRoute>
                        <Reminders />
                      </ProtectedRoute>
                    } />
                    <Route path="/education" element={
                      <ProtectedRoute>
                        <Education />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                      <ProtectedRoute>
                        <AdminProtectedRoute>
                          <Admin />
                        </AdminProtectedRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </BrowserRouter>
            </TotooltipProvider>
          </AquariumProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
