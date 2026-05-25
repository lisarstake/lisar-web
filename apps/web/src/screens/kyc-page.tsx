import React from "react";
import { KycPage } from "@/components/profile/KycPage";
import { usePageTracking } from "@/hooks/usePageTracking";

export default function KycPageScreen() {
  usePageTracking("KYC Page", { page_type: "kyc" });

  return <KycPage />;
}
