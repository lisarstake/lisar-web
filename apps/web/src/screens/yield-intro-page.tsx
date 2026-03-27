import React from "react";
import { usePageTracking } from "@/hooks/usePageTracking";
import { YieldIntroPage } from "@/components/savings/YieldIntroPage";

export default function YieldIntroPageScreen() {
  usePageTracking("Yield Intro Page", { page_type: "yield_intro" });

  return <YieldIntroPage />;
}
