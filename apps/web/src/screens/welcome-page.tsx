import React from "react";
import { usePageTracking } from "@/hooks/usePageTracking";
import { WelcomePage } from "@/components/onboarding/WelcomePage";

export default function WelcomePageScreen() {
  usePageTracking("Welcome Page", { page_type: "welcome" });

  return <WelcomePage />;
}
