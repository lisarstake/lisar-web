import React from "react";
import { PreferencesSettingsPage } from "@/components/profile/PreferencesSettingsPage";
import { usePageTracking } from "@/hooks/usePageTracking";

export default function PreferencesSettingsPageScreen() {
  usePageTracking("Preferences Settings Page", {
    page_type: "preferences_settings",
  });

  return <PreferencesSettingsPage />;
}
