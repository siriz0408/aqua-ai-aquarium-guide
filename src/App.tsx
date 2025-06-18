
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AquariumProvider } from "@/contexts/AquariumContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Layout } from "@/components/Layout";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import AquaBot from "@/pages/AquaBot";
import Tanks from "@/pages/Tanks";
import AddTank from "@/pages/AddTank";
import EditTank from "@/pages/EditTank";
import TankDetails from "@/pages/TankDetails";
import LogParameters from "@/pages/LogParameters";
import Reminders from "@/pages/Reminders";
import SetupPlanner from "@/pages/SetupPlanner";
import Equipment from "@/pages/Equipment";
import Livestock from "@/pages/Livestock";
import Education from "@/pages/Education";
import Admin from "@/pages/Admin";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { useSubscriptionSuccess } from "@/hooks/useSubscriptionSuccess";

const queryClient = new QueryClient();

const AppContent = () => {
  // Initialize subscription success handler
  useSubscriptionSuccess();

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Index />} />
        <Route path="aquabot" element={
          <ProtectedRoute>
            <AquaBot />
          </ProtectedRoute>
        } />
        <Route path="tanks" element={
          <ProtectedRoute>
            <Tanks />
          </ProtectedRoute>
        } />
        <Route path="tanks/add" element={
          <ProtectedRoute>
            <AddTank />
          </ProtectedRoute>
        } />
        <Route path="tanks/:tankId" element={
          <ProtectedRoute>
            <TankDetails />
          </ProtectedRoute>
        } />
        <Route path="tanks/:tankId/edit" element={
          <ProtectedRoute>
            <EditTank />
          </ProtectedRoute>
        } />
        <Route path="tanks/:tankId/log" element={
          <ProtectedRoute>
            <LogParameters />
          </ProtectedRoute>
        } />
        <Route path="reminders" element={
          <ProtectedRoute>
            <Reminders />
          </ProtectedRoute>
        } />
        <Route path="setup-planner" element={
          <ProtectedRoute>
            <SetupPlanner />
          </ProtectedRoute>
        } />
        <Route path="equipment" element={<Equipment />} />
        <Route path="livestock" element={<Livestock />} />
        <Route path="education" element={<Education />} />
        <Route path="settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="admin" element={
          <AdminProtectedRoute>
            <Admin />
          </AdminProtectedRoute>
        } />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <BrowserRouter>
            <AuthProvider>
              <AquariumProvider>
                <AppContent />
                <Toaster />
                <Sonner />
              </AquariumProvider>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
