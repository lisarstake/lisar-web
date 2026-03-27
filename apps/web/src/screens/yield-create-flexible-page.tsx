import React from "react";
import { usePageTracking } from "@/hooks/usePageTracking";
import { YieldCreateFlexiblePage } from "@/components/savings/YieldCreateFlexiblePage";

export default function YieldCreateFlexiblePageScreen() {
  usePageTracking("Yield Create Flexible Page", {
    page_type: "yield_create_flexible",
  });

  return <YieldCreateFlexiblePage />;
}
