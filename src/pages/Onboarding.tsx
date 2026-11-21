// ============================================================================
// /onboarding — the managed-account onboarding page.
//
// A thin shell around OnboardingView so the flow has a shareable URL and the
// checkout success page can send the customer straight here.
// ============================================================================

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OnboardingView from "@/components/OnboardingView";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

const Onboarding = () => {
  useDocumentMeta("onboarding");
  return (
    <div className="min-h-screen bg-[#05070A] text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />
      <div className="container mx-auto px-4 md:px-8 pt-[140px] pb-20">
        <OnboardingView />
      </div>
      <Footer />
    </div>
  );
};

export default Onboarding;
