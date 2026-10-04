import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import { CurrencyProvider } from "./hooks/useCurrency";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Lazy load page components with no suspense delay
const Index = lazy(() => import("./pages/Index"));
const Pricing = lazy(() => import("./pages/Pricing"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const RegisterApplication = lazy(() => import("./pages/RegisterApplication"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Instant page transition wrapper - no loading delay
const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <div className="page-enter">
    {children}
  </div>
);

// Themed fallback shown while a lazy page chunk is fetched. It matches the
// app's black background so a slow network never flashes an unstyled screen.
const RouteFallback = () => (
  <div className="min-h-screen bg-[#05070A] flex items-center justify-center">
    <Loader2 className="animate-spin text-[#C5A059]" size={40} />
  </div>
);

// Each route is wrapped in its own ErrorBoundary so a failing page — or a
// failed dynamic-import chunk — is contained instead of unmounting the whole
// app into a black screen.
const RouteView = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<RouteFallback />}>
      <PageTransition>{children}</PageTransition>
    </Suspense>
  </ErrorBoundary>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CurrencyProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<RouteView><Index /></RouteView>} />
            <Route path="/pricing" element={<RouteView><Pricing /></RouteView>} />
            <Route path="/how-it-works" element={<RouteView><HowItWorks /></RouteView>} />
            <Route path="/about" element={<RouteView><About /></RouteView>} />
            <Route path="/contact" element={<RouteView><Contact /></RouteView>} />
            <Route path="/login" element={<RouteView><Login /></RouteView>} />
            <Route path="/register" element={<RouteView><Register /></RouteView>} />
            <Route path="/register-application" element={<RouteView><RegisterApplication /></RouteView>} />
            <Route path="/auth-callback" element={<RouteView><AuthCallback /></RouteView>} />
            <Route path="/terms" element={<RouteView><Terms /></RouteView>} />
            <Route path="/privacy" element={<RouteView><Privacy /></RouteView>} />
            <Route path="/disclaimer" element={<RouteView><Disclaimer /></RouteView>} />
            <Route path="/dashboard" element={<RouteView><Dashboard /></RouteView>} />
            <Route path="/checkout" element={<RouteView><Checkout /></RouteView>} />
            <Route path="/checkout/success" element={<RouteView><CheckoutSuccess /></RouteView>} />
            <Route path="*" element={<RouteView><NotFound /></RouteView>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CurrencyProvider>
  </QueryClientProvider>
);

export default App;