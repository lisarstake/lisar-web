/**
 * OTP Verification Screen
 * Screen wrapper for OTP verification page
 */

import { OTPPage } from "@/components/auth/OTPPage";
import { useLocation, useNavigate } from "react-router-dom";
import { totpService } from "@/services/totp";

export default function OTPScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    action?: string;
    returnTo?: string;
    fromSetup?: boolean;
    [key: string]: any;
  } | null;

  const action = state?.action || "verify";
  const returnTo = state?.returnTo;
  const isSetup = state?.fromSetup === true;

  const handleVerify = async (code: string) => {
    const response = await totpService.verify({ token: code });

    if (response.success) {
      sessionStorage.setItem("otp_verified", Date.now().toString());
      sessionStorage.setItem("otp_action", action);
    }

    return response;
  };

  const handleSuccess = () => {
    if (returnTo) {
      // If returnTo is provided, navigate to it with preserved state
      const { action: _, returnTo: __, ...preservedState } = state || {};
      navigate(returnTo, {
        state: {
          ...preservedState,
          fromOTP: true,
          ...(state?.keepExportDrawerOpen && { keepExportDrawerOpen: true }),
        },
        replace: true,
      });
    } else {
      // If no returnTo, go back in browser history
      navigate(-1);
    }
  };

  return (
    <OTPPage
      onVerify={handleVerify}
      onSuccess={handleSuccess}
      redirectOnSuccess={returnTo}
      redirectOnCancel={returnTo}
      showSuccessDrawer={isSetup}
    />
  );
}
