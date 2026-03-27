import React from "react";
import { AccountSettingsPage } from "@/components/profile/AccountSettingsPage";
import { usePageTracking } from "@/hooks/usePageTracking";

export default function AccountSettingsPageScreen() {
  usePageTracking("Account Settings Page", { page_type: "account_settings" });

  return <AccountSettingsPage />;
}
