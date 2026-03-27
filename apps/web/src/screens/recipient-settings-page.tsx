import React from "react";
import { usePageTracking } from "@/hooks/usePageTracking";
import { RecipientSettingsPage } from "@/components/profile/RecipientSettings";

export default function SecuritySettingsPageScreen() {
  usePageTracking("Recipients Settings Page", { page_type: "recipient_settings" });

  return <RecipientSettingsPage />;
}
