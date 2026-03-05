import React from "react";
import { SecuritySettingsPage } from "@/components/profile/SecuritySettingsPage";
import { usePageTracking } from "@/hooks/usePageTracking";

export default function SecuritySettingsPageScreen() {
  usePageTracking("Security Settings Page", { page_type: "security_settings" });

  return <SecuritySettingsPage />;
}
