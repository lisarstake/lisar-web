import React from "react";
import { usePageTracking } from "@/hooks/usePageTracking";
import { SavingsCreatePlanPage } from "@/components/savings/SavingsCreatePlanPage";

export default function SavingsCreatePlanPageScreen() {
  usePageTracking("Savings Create Plan Page", { page_type: "savings_create_plan" });

  return <SavingsCreatePlanPage />;
}
