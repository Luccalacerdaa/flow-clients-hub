import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClientsProvider } from "@/contexts/ClientsContext";
import { SubscriptionsProvider } from "@/contexts/SubscriptionsContext";
import Index from "./pages/Index";
import ClientProfile from "./pages/ClientProfile";
import Subscriptions from "./pages/Subscriptions";
import SubscriptionDetails from "./pages/SubscriptionDetails";
import FinancialReports from "./pages/FinancialReports";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ClientsProvider>
        <SubscriptionsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<Index />} />
              <Route path="/clients/:id" element={<ClientProfile />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/subscriptions/:id" element={<SubscriptionDetails />} />
              <Route path="/reports" element={<FinancialReports />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SubscriptionsProvider>
      </ClientsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
