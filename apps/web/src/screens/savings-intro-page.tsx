import React from "react";
import { usePageTracking } from "@/hooks/usePageTracking";
import { SavingsIntroPage } from "@/components/savings/SavingsIntroPage";

export default function SavingsIntroPageScreen() {
  usePageTracking("Savings Intro Page", { page_type: "savings_intro" });

  return <SavingsIntroPage />;
}
