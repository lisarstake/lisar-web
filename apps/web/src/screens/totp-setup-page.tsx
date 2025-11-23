/**
 * TOTP Setup Screen
 * Screen wrapper for TOTP setup page
 */

import { TOTPSetupPage } from "@/components/auth/TOTPSetupPage";
import { useLocation } from "react-router-dom";

export default function TOTPSetupScreen() {
  const location = useLocation();
  const state = location.state as {
    returnTo?: string;
    keepExportDrawerOpen?: boolean;
    [key: string]: any;
  } | null;

  return (
    <TOTPSetupPage
      redirectOnComplete={state?.returnTo || "/verify-otp"}
      preserveState={state}
    />
  );
}

