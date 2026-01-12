import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nProvider } from "@/lib/i18n/context";
import Layout from "@/components/Layout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Chatbot from "./pages/Chatbot";
import HealthVault from "./pages/HealthVault";
import EmergencyQR from "./pages/EmergencyQR";
import MoodTracker from "./pages/MoodTracker";
import Reminders from "./pages/Reminders";
import Insights from "./pages/Insights";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <I18nProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Routes with Layout */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/chatbot" element={<Layout><Chatbot /></Layout>} />
            <Route path="/vault" element={<Layout><HealthVault /></Layout>} />
            <Route path="/emergency" element={<Layout><EmergencyQR /></Layout>} />
            <Route path="/mood" element={<Layout><MoodTracker /></Layout>} />
            <Route path="/reminders" element={<Layout><Reminders /></Layout>} />
            <Route path="/insights" element={<Layout><Insights /></Layout>} />
            
            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </I18nProvider>
);

export default App;
