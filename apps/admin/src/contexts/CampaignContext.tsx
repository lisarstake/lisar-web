import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  campaignService,
  type CampaignOverview,
  type CampaignSearchFilters,
  type PaginatedCampaignUsersResponse,
} from "@/services/campaigns";

interface CampaignState {
  campaignOverview: CampaignOverview | null;
  paginatedUsers: PaginatedCampaignUsersResponse | null;
  isLoading: boolean;
  isLoadingOverview: boolean;
  error: string | null;
}

interface CampaignContextValue extends CampaignState {
  getCampaignOverview: () => Promise<void>;
  getCampaignUsers: (page?: number, limit?: number) => Promise<void>;
  searchCampaignUsers: (filters: CampaignSearchFilters) => Promise<void>;
}

const CampaignContext = createContext<CampaignContextValue | undefined>(
  undefined
);

export const CampaignProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<CampaignState>({
    campaignOverview: null,
    paginatedUsers: null,
    isLoading: false,
    isLoadingOverview: false,
    error: null,
  });

  const getCampaignOverview = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoadingOverview: true, error: null }));

    try {
      const response = await campaignService.getCampaignOverview();

      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          campaignOverview: response.data!,
          isLoadingOverview: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: response.error || "Failed to fetch campaign overview",
          isLoadingOverview: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        isLoadingOverview: false,
      }));
    }
  }, []);

  const getCampaignUsers = useCallback(async (page: number = 1, limit: number = 20) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await campaignService.getCampaignUsers(page, limit);

      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          paginatedUsers: response.data!,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: response.error || "Failed to fetch campaign users",
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

  const searchCampaignUsers = useCallback(async (filters: CampaignSearchFilters) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await campaignService.searchCampaignUsers(filters);

      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          paginatedUsers: response.data!,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: response.error || "Failed to search campaign users",
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
        getCampaignOverview,
        getCampaignUsers,
        searchCampaignUsers,
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
