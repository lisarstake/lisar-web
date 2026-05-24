export interface KycApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: { message: string };
}

export type KycStatus = "not_started" | "pending" | "approved" | "rejected" | "expired";
export type KycTier = "tier_1" | "tier_2" | null;
export type KycProvider = "dojah" | null;

export interface KycStatusData {
  status: KycStatus;
  tier: KycTier;
  provider: KycProvider;
  verificationDate: string | null;
  expiryDate: string | null;
  country: string | null;
  rejectionReason: string | null;
}

export type KycVerifyType = "selfie_nin" | "selfie_bvn";

export interface KycVerifyRequest {
  kycData: {
    type: KycVerifyType;
    bvn?: string;
    nin?: string;
    selfie_image?: string;
  };
}

export interface KycVerifyData {
  status: string;
  tier: string;
}
