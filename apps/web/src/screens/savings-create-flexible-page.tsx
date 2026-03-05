import React from "react";
import { usePageTracking } from "@/hooks/usePageTracking";
import { SavingsCreateFlexiblePage } from "@/components/savings/SavingsCreateFlexiblePage";

export default function SavingsCreateFlexiblePageScreen() {
  usePageTracking("Savings Create Flexible Page", {
    page_type: "savings_create_flexible",
  });

  return <SavingsCreateFlexiblePage />;
}
