import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  OrchestratorResponse,
  DelegatorRewardsData,
  OrchestratorQueryParams,
} from "@/services/delegation/types";
import { delegationService, ensService } from "@/services";
import { useAuth } from "./AuthContext";
import { filterOrchestratorsWithoutNames } from "@/lib/orchestrators";

interface OrchestratorContextType {
  orchestrators: OrchestratorResponse[];
  orchestratorRewards: Record<string, DelegatorRewardsData>;
  isLoading: boolean;
  error: string | null;
  refetch: (params?: OrchestratorQueryParams) => Promise<void>;
}

const OrchestratorContext = createContext<OrchestratorContextType | undefined>(
  undefined
);

interface OrchestratorProviderProps {
  children: ReactNode;
}

export const OrchestratorProvider: React.FC<OrchestratorProviderProps> = ({
  children,
}) => {
  const [orchestrators, setOrchestrators] = useState<OrchestratorResponse[]>(
    []
  );
  const [orchestratorRewards, setOrchestratorRewards] = useState<
    Record<string, DelegatorRewardsData>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { state } = useAuth();

  const fetchOrchestrators = async (params?: OrchestratorQueryParams) => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams: OrchestratorQueryParams = params || {
        page: 1,
        limit: 12,
        sortBy: "apy",
        sortOrder: "desc",
        active: true,
      };

      const response = await delegationService.getOrchestrators(queryParams);

      let fetchedOrchestrators: OrchestratorResponse[] = [];
      if (response.success && response.data && Array.isArray(response.data)) {
        fetchedOrchestrators = response.data;

        // Filter out orchestrators whose names start with "0x"
        fetchedOrchestrators =
          filterOrchestratorsWithoutNames(fetchedOrchestrators);

        setOrchestrators(fetchedOrchestrators);
      } else {
        setError(response.message || "Failed to fetch orchestrators");
      }

      // Fetch rewards for all orchestrators
      if (fetchedOrchestrators.length > 0) {
        try {
          const rewardsPromises = fetchedOrchestrators.map(
            async (orchestrator) => {
              try {
                const rewardsResponse =
                  await delegationService.getDelegatorRewards(
                    orchestrator.address
                  );
                if (rewardsResponse.success) {
                  return {
                    address: orchestrator.address,
                    rewards: rewardsResponse.data,
                  };
                }
                return null;
              } catch (error) {
                return null;
              }
            }
          );

          const rewardsResults = await Promise.all(rewardsPromises);
          const rewardsMap: Record<string, DelegatorRewardsData> = {};

          rewardsResults.forEach((result) => {
            if (result) {
              rewardsMap[result.address] = result.rewards;
            }
          });

          setOrchestratorRewards(rewardsMap);
        } catch (rewardsError) {
          setOrchestratorRewards({});
        }
      }
    } catch (err) {
      setError("An error occurred while fetching orchestrators");
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async (params?: OrchestratorQueryParams) => {
    await fetchOrchestrators(params);
  };

  // Fetch orchestrators when user is authenticated
  useEffect(() => {
    if (state.user?.wallet_id) {
      fetchOrchestrators();
    }
  }, [state.user?.wallet_id]);

  const value: OrchestratorContextType = {
    orchestrators,
    orchestratorRewards,
    isLoading,
    error,
    refetch,
  };

  return (
    <OrchestratorContext.Provider value={value}>
      {children}
    </OrchestratorContext.Provider>
  );
};

export const useOrchestrators = (): OrchestratorContextType => {
  const context = useContext(OrchestratorContext);
  if (context === undefined) {
    throw new Error(
      "useOrchestrators must be used within an OrchestratorProvider"
    );
  }
  return context;
};
