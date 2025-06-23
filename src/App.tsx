
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AquariumProvider } from "@/contexts/AquariumContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingFallback } from "@/components/LoadingFallback";

// Lazy-loaded components
const Admin = lazy(() => import("./pages/Admin"));
const SetupPlanner = lazy(() => import("./pages/SetupPlanner"));
const AquaBot = lazy(() => import("./pages/AquaBot"));
const Education = lazy(() => import("./pages/Education"));
const Equipment = lazy(() => import("./pages/Equipment"));
const Livestock = lazy(() => import("./pages/Livestock"));
const WaterChangeCalculator = lazy(() => import("./pages/WaterChangeCalculator"));

// Regular imports for components that should load immediately
import Index from "./pages/Index";
import TankDetails from "./pages/TankDetails";
import LogParameters from "./pages/LogParameters";
import Reminders from "./pages/Reminders";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Tanks from "./pages/Tanks";
import AddTank from "./pages/AddTank";
import EditTank from "./pages/EditTank";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import Pricing from "./pages/Pricing";
import Account from "./pages/Account";
import Tools from "./pages/Tools";

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
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/payment-cancelled" element={<PaymentCancelled />} />
                    <Route path="/pricing" element={
                      <ProtectedRoute>
                        <Pricing />
                      </ProtectedRoute>
                    } />
                    <Route path="/account" element={
                      <ProtectedRoute>
                        <Account />
                      </ProtectedRoute>
                    } />
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    } />
                    <Route path="/tanks" element={
                      <ProtectedRoute>
                        <Tanks />
                      </ProtectedRoute>
                    } />
                    <Route path="/add-tank" element={
                      <ProtectedRoute>
                        <AddTank />
                      </ProtectedRoute>
                    } />
                    <Route path="/tank/:tankId" element={
                      <ProtectedRoute>
                        <TankDetails />
                      </ProtectedRoute>
                    } />
                    <Route path="/tank/:tankId/edit" element={
                      <ProtectedRoute>
                        <EditTank />
                      </ProtectedRoute>
                    } />
                    <Route path="/tank/:tankId/log-parameters" element={
                      <ProtectedRoute>
                        <LogParameters />
                      </ProtectedRoute>
                    } />
                    <Route path="/tank/:tankId/equipment" element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <Equipment />
                        </Suspense>
                      </ProtectedRoute>
                    } />
                    <Route path="/tank/:tankId/livestock" element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <Livestock />
                        </Suspense>
                      </ProtectedRoute>
                    } />
                    <Route path="/tools" element={
                      <ProtectedRoute>
                        <Tools />
                      </ProtectedRoute>
                    } />
                    <Route path="/setup-planner" element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <SetupPlanner />
                        </Suspense>
                      </ProtectedRoute>
                    } />
                    <Route path="/water-change-calculator" element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <WaterChangeCalculator />
                        </Suspense>
                      </ProtectedRoute>
                    } />
                    <Route path="/aquabot" element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <AquaBot />
                        </Suspense>
                      </ProtectedRoute>
                    } />
                    <Route path="/reminders" element={
                      <ProtectedRoute>
                        <Reminders />
                      </ProtectedRoute>
                    } />
                    <Route path="/education" element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <Education />
                        </Suspense>
                      </ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                      <ProtectedRoute>
                        <AdminProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <Admin />
                          </Suspense>
                        </AdminProtectedRoute>
                      </ProtectedRoute>
                    } />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </AquariumProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
