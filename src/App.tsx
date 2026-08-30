import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { CurrencyProvider } from "./hooks/useCurrency";

const queryClient = new QueryClient();

// Lazy load page components
const Index = lazy(() => import("./pages/Index"));
const Pricing = lazy(() => import("./pages/Pricing"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Checkout = lazy(() => import("./pages/Checkout"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CurrencyProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Suspense fallback={<div>Loading...</div>}><Index /></Suspense />} />
            <Route path="/pricing" element={<Suspense fallback={<div>Loading...</div>}><Pricing /></Suspense />} />
            <Route path="/how-it-works" element={<Suspense fallback={<div>Loading...</div>}><HowItWorks /></Suspense />} />
            <Route path="/about" element={<Suspense fallback={<div>Loading...</div>}><About /></Suspense />} />
            <Route path="/contact" element={<Suspense fallback={<div>Loading...</div>}><Contact /></Suspense />} />
            <Route path="/login" element={<Suspense fallback={<div>Loading...</div>}><Login /></Suspense />} />
            <Route path="/register" element={<Suspense fallback={<div>Loading...</div>}><Register /></Suspense />} />
            <Route path="/auth-callback" element={<Suspense fallback={<div>Loading...</div>}><AuthCallback /></Suspense />} />
            <Route path="/terms" element={<Suspense fallback={<div>Loading...</div>}><Terms /></Suspense />} />
            <Route path="/privacy" element={<Suspense fallback={<div>Loading...</div>}><Privacy /></Suspense />} />
            <Route path="/disclaimer" element={<Suspense fallback={<div>Loading...</div>}><Disclaimer /></Suspense />} />
            <Route path="/dashboard" element={<Suspense fallback={<div>Loading...</div>}><Dashboard /></Suspense />} />
            <Route path="/checkout" element={<Suspense fallback={<div>Loading...</div>}><Checkout /></Suspense />} />
            <Route path="*" element={<Suspense fallback={<div>Loading...</div>}><NotFound /></Suspense />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CurrencyProvider>
  </QueryClientProvider>
);

export default App;