
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
import Tanks from "./pages/Tanks";
import AddTank from "./pages/AddTank";
import EditTank from "./pages/EditTank";
import TankDetails from "./pages/TankDetails";
import LogParameters from "./pages/LogParameters";
import AquaBot from "./pages/AquaBot";
import Education from "./pages/Education";
import Equipment from "./pages/Equipment";
import Livestock from "./pages/Livestock";
import SetupPlanner from "./pages/SetupPlanner";
import SavedPlansPage from "./pages/SavedPlans";
import Reminders from "./pages/Reminders";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <AquariumProvider>
              <TooltipProvider>
                <ErrorBoundary>
                  <div className="min-h-screen bg-background font-sans antialiased">
                    <Routes>
                      <Route path="/auth" element={<Auth />} />
                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <Index />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/tanks"
                        element={
                          <ProtectedRoute>
                            <Tanks />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/add-tank"
                        element={
                          <ProtectedRoute>
                            <AddTank />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/tank/:id/edit"
                        element={
                          <ProtectedRoute>
                            <EditTank />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/tank/:id"
                        element={
                          <ProtectedRoute>
                            <TankDetails />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/tank/:id/log-parameters"
                        element={
                          <ProtectedRoute>
                            <LogParameters />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/aquabot"
                        element={
                          <ProtectedRoute>
                            <AquaBot />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/education"
                        element={
                          <ProtectedRoute>
                            <Education />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/equipment"
                        element={
                          <ProtectedRoute>
                            <Equipment />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/livestock"
                        element={
                          <ProtectedRoute>
                            <Livestock />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/setup-planner"
                        element={
                          <ProtectedRoute>
                            <SetupPlanner />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/saved-plans"
                        element={
                          <ProtectedRoute>
                            <SavedPlansPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/reminders"
                        element={
                          <ProtectedRoute>
                            <Reminders />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin"
                        element={
                          <AdminProtectedRoute>
                            <Admin />
                          </AdminProtectedRoute>
                        }
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                  <Toaster />
                  <Sonner />
                </ErrorBoundary>
              </TooltipProvider>
            </AquariumProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
