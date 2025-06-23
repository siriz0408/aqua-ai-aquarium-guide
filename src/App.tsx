
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AquariumProvider } from "./contexts/AquariumContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Layout } from "./components/Layout";
import { LoadingFallback } from "./components/LoadingFallback";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Lazy load components
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Tanks = lazy(() => import("./pages/Tanks"));
const AddTank = lazy(() => import("./pages/AddTank"));
const EditTank = lazy(() => import("./pages/EditTank"));
const TankDetails = lazy(() => import("./pages/TankDetails"));
const LogParameters = lazy(() => import("./pages/LogParameters"));
const AquaBot = lazy(() => import("./pages/AquaBot"));
const SetupPlanner = lazy(() => import("./pages/SetupPlanner"));
const Education = lazy(() => import("./pages/Education"));
const Livestock = lazy(() => import("./pages/Livestock"));
const Equipment = lazy(() => import("./pages/Equipment"));
const Tools = lazy(() => import("./pages/Tools"));
const WaterChangeCalculator = lazy(() => import("./pages/WaterChangeCalculator"));
const Reminders = lazy(() => import("./pages/Reminders"));
const Account = lazy(() => import("./pages/Account"));
const Admin = lazy(() => import("./pages/Admin"));
const Pricing = lazy(() => import("./pages/Pricing"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCancelled = lazy(() => import("./pages/PaymentCancelled"));
const SubscriptionPlans = lazy(() => import("./pages/SubscriptionPlans"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthProvider>
                <AquariumProvider>
                  <Routes>
                    <Route path="/auth" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <Auth />
                      </Suspense>
                    } />
                    <Route path="/payment-success" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <PaymentSuccessPage />
                      </Suspense>
                    } />
                    <Route path="/payment-cancelled" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <PaymentCancelled />
                      </Suspense>
                    } />
                    <Route path="/" element={<Layout />}>
                      <Route index element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <Index />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="tanks" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <Tanks />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="add-tank" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <AddTank />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="edit-tank/:id" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <EditTank />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="tank/:id" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <TankDetails />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="log-parameters/:id" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <LogParameters />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="aquabot" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <AquaBot />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="setup-planner" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <SetupPlanner />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="education" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <Education />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="livestock" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <Livestock />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="equipment" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <Equipment />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="tools" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <Tools />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="water-change-calculator" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <WaterChangeCalculator />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="reminders" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <Reminders />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="account" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <Account />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="admin" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <Admin />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="pricing" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <Pricing />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="subscription-plans" element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <SubscriptionPlans />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="*" element={
                        <Suspense fallback={<LoadingFallback />}>
                          <NotFound />
                        </Suspense>
                      } />
                    </Route>
                  </Routes>
                </AquariumProvider>
              </AuthProvider>
            </BrowserRouter>
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
