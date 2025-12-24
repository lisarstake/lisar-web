/**
 * OTP Verification Screen
 * Screen wrapper for OTP verification page
 */

import { OTPPage } from "@/components/auth/OTPPage";
import { totpService } from "@/services/totp";

export default function OTPScreen() {
  const handleVerify = async (code: string) => {
    return await totpService.verify({ token: code });
  };

  return <OTPPage onVerify={handleVerify} />;
}
