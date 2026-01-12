import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { campaignService } from "@/services";
import type {
  CampaignStatusData,
  ReferralStatsData,
} from "@/services/campaign/types";

interface CampaignContextType {
  campaignStatus: CampaignStatusData | null;
  referralCode: string | null;
  referralStats: ReferralStatsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  copySuccess: boolean;
  handleCopyReferralCode: () => Promise<void>;
  handleGenerateReferralCode: () => Promise<{
    success: boolean;
    message: string;
  }>;
  isGenerating: boolean;
}

const CampaignContext = createContext<CampaignContextType | undefined>(
  undefined
);

interface CampaignProviderProps {
  children: ReactNode;
}

export const CampaignProvider: React.FC<CampaignProviderProps> = ({
  children,
}) => {
  const [campaignStatus, setCampaignStatus] =
    useState<CampaignStatusData | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStatsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchCampaignData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch campaign status, referral code, and referral stats in parallel
      const [statusResponse, referralResponse, statsResponse] =
        await Promise.all([
          campaignService.getCampaignStatus(),
          campaignService.getReferralCode(),
          campaignService.getReferralStats(),
        ]);

      // If user is enrolled, use their campaign status
      if (statusResponse.success && statusResponse.data) {
        setCampaignStatus(statusResponse.data);
      }
    

      if (referralResponse.success && referralResponse.data) {
        setReferralCode(referralResponse.data.referralCode);
      }

      if (statsResponse.success && statsResponse.data) {
        setReferralStats(statsResponse.data);
      }
    } catch (err) {
      console.error("Error fetching campaign data:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    await fetchCampaignData();
  };

  const handleCopyReferralCode = async () => {
    if (!referralCode) return;

    try {
      await navigator.clipboard.writeText(referralCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy referral code:", err);
    }
  };

  const handleGenerateReferralCode = async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    setIsGenerating(true);
    try {
      const response = await campaignService.getReferralCode();
      if (response.success && response.data) {
        setReferralCode(response.data.referralCode);
        return {
          success: true,
          message: "Referral code generated successfully!",
        };
      }
      return {
        success: false,
        message: response.error || "Failed to generate referral code",
      };
    } catch (err) {
      console.error("Failed to generate referral code:", err);
      return {
        success: false,
        message: err instanceof Error ? err.message : "An error occurred",
      };
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchCampaignData();
  }, []);

  const value: CampaignContextType = {
    campaignStatus,
    referralCode,
    referralStats,
    isLoading,
    error,
    refetch,
    copySuccess,
    handleCopyReferralCode,
    handleGenerateReferralCode,
    isGenerating,
  };

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaign = (): CampaignContextType => {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error("useCampaign must be used within a CampaignProvider");
  }
  return context;
};
