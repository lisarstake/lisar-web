import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  campaignService,
  type CampaignStats,
  type CampaignFilters,
  type PaginatedCampaignUsersResponse,
} from "@/services/campaigns";

interface CampaignState {
  campaignStats: CampaignStats | null;
  paginatedUsers: PaginatedCampaignUsersResponse | null;
  isLoading: boolean;
  isLoadingStats: boolean;
  error: string | null;
}

interface CampaignContextValue extends CampaignState {
  getCampaignStats: () => Promise<void>;
  getCampaignUsers: (filters: CampaignFilters) => Promise<void>;
}

const CampaignContext = createContext<CampaignContextValue | undefined>(
  undefined
);

export const CampaignProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<CampaignState>({
    campaignStats: null,
    paginatedUsers: null,
    isLoading: false,
    isLoadingStats: false,
    error: null,
  });

  const getCampaignStats = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoadingStats: true, error: null }));

    try {
      const response = await campaignService.getCampaignStats();

      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          campaignStats: response.data!,
          isLoadingStats: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: response.message || "Failed to fetch campaign stats",
          isLoadingStats: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        isLoadingStats: false,
      }));
    }
  }, []);

  const getCampaignUsers = useCallback(async (filters: CampaignFilters) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await campaignService.getCampaignUsers(filters);

      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          paginatedUsers: response.data!,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: response.message || "Failed to fetch campaign users",
          isLoading: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        isLoading: false,
      }));
    }
  }, []);

  return (
    <CampaignContext.Provider
      value={{
        ...state,
        getCampaignStats,
        getCampaignUsers,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaign = (): CampaignContextValue => {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error("useCampaign must be used within a CampaignProvider");
  }
  return context;
};
