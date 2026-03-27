import React from "react";
import { AccountsPage } from "@/components/profile/AccountsPage";
import { usePageTracking } from "@/hooks/usePageTracking";

export default function AccountsPageScreen() {
  usePageTracking("Accounts Page", { page_type: "accounts" });

  return <AccountsPage />;
}
