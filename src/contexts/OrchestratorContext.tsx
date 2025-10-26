import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  OrchestratorResponse,
  DelegationData,
} from "@/services/delegation/types";
import { delegationService } from "@/services";
import { useAuth } from "./AuthContext";

interface OrchestratorContextType {
  orchestrators: OrchestratorResponse[];
  userDelegation: DelegationData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
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
  const [userDelegation, setUserDelegation] = useState<DelegationData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { state } = useAuth();

  const fetchOrchestrators = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch orchestrators
      const response = await delegationService.getOrchestrators();

      // Handle nested structure: response.data.data
      const responseData = response.data as any;
      const orchestratorData = responseData?.data;

      if (
        response.success &&
        orchestratorData &&
        Array.isArray(orchestratorData)
      ) {
        // Ensure orchestrators is always an array
        const safeOrchestrators = Array.isArray(orchestratorData)
          ? orchestratorData
          : [];

        // Filter out crypto addresses (0x...) and keep only proper ENS names
        const validOrchestrators = safeOrchestrators.filter((orch) => {
          const ensName = orch.ensName || "";
          return (
            !ensName.startsWith("0x") &&
            ensName.includes(".") &&
            ensName.length > 0
          );
        });

        // Sort by total stake (descending) and take top 30
        const topOrchestrators = validOrchestrators
          .sort((a, b) => parseFloat(b.totalStake) - parseFloat(a.totalStake))
          .slice(0, 30);

        setOrchestrators(topOrchestrators);
      } else {
        console.error("Invalid response data:", response.data);
        setError(response.message || "Failed to fetch orchestrators");
      }

      // Fetch user delegation data if user is authenticated
      // if (state.user?.wallet_address) {
      //   try {
      //     const delegationResponse = await delegationService.getDelegations('0x9427535629358a43e240b03bf2e2df0ecc644720');
      //     if (delegationResponse.success) {
      //       setUserDelegation(delegationResponse.data);
      //       console.log('📊 User Delegation Data:', delegationResponse.data);
      //     }
      //   } catch (delegationError) {
      //     console.log('No delegation data found for user');
      //     setUserDelegation(null);
      //   }
      // }

      try {
        const delegationResponse = await delegationService.getDelegations(
          "0x4b7339e599a599dbd7829a8eca0d233ed4f7ea09"
        );
        if (delegationResponse.success) {
          setUserDelegation(delegationResponse.data);
        }
      } catch (delegationError) {
        setUserDelegation(null);
      }
    } catch (err) {
      setError("An error occurred while fetching orchestrators");
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    await fetchOrchestrators();
  };

  // Fetch orchestrators on mount
  useEffect(() => {
    fetchOrchestrators();
  }, []);

  const value: OrchestratorContextType = {
    orchestrators,
    userDelegation,
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
