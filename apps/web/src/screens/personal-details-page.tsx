import React from "react";
import { PersonalDetailsPage } from "@/components/profile/PersonalDetailsPage";
import { usePageTracking } from "@/hooks/usePageTracking";

export default function PersonalDetailsPageScreen() {
  usePageTracking("Personal Details Page", { page_type: "personal_details" });
  return <PersonalDetailsPage />;
}
