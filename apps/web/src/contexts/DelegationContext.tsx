import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  DelegationData,
  DelegatorTransactionsData,
  DelegatorStakeProfile,
  ProtocolStatusData,
} from "@/services/delegation/types";
import { delegationService } from "@/services";
import { useAuth } from "./AuthContext";

interface DelegationContextType {
  userDelegation: DelegationData | null;
  delegatorTransactions: DelegatorTransactionsData | null;
  delegatorStakeProfile: DelegatorStakeProfile | null;
  protocolStatus: ProtocolStatusData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const DelegationContext = createContext<DelegationContextType | undefined>(
  undefined
);

interface DelegationProviderProps {
  children: ReactNode;
}

export const DelegationProvider: React.FC<DelegationProviderProps> = ({
  children,
}) => {
  const [userDelegation, setUserDelegation] = useState<DelegationData | null>(
    null
  );
  const [delegatorTransactions, setDelegatorTransactions] =
    useState<DelegatorTransactionsData | null>(null);
  const [delegatorStakeProfile, setDelegatorStakeProfile] =
    useState<DelegatorStakeProfile | null>(null);
  const [protocolStatus, setProtocolStatus] =
    useState<ProtocolStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { state } = useAuth();

  const fetchDelegationData = async () => {
    if (!state.user?.wallet_address) {
      setUserDelegation(null);
      setDelegatorTransactions(null);
      setDelegatorStakeProfile(null);
      setProtocolStatus(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const delegatorAddress = state.user?.wallet_address;
      // const delegatorAddress = "0x20B5ba0c3221700a83B4d74d32240e496C3EcAc7";

      // Fetch user delegation data (current stakes for portfolio)
      try {
        const delegationResponse =
          await delegationService.getDelegations(delegatorAddress);
        if (delegationResponse.success) {
          setUserDelegation(delegationResponse.data);
        }
      } catch (delegationError) {
        setUserDelegation(null);
      }

      // Fetch delegator transactions (checking unbonding and completed unbonding process)
      try {
        const transactionsResponse =
          await delegationService.getDelegatorTransactions(delegatorAddress);
        if (transactionsResponse.success) {
          setDelegatorTransactions(transactionsResponse.data);
        }
      } catch (transactionsError) {
        setDelegatorTransactions(null);
      }

      // Fetch delegator stake profile (total stake in portfolio)
      try {
        const stakeProfileResponse =
          await delegationService.getDelegatorStakeProfile(delegatorAddress);
        if (stakeProfileResponse.success) {
          setDelegatorStakeProfile(stakeProfileResponse.data);
        }
      } catch (stakeProfileError) {
        setDelegatorStakeProfile(null);
      }

      // Fetch protocol status
      try {
        const protocolStatusResponse =
          await delegationService.getProtocolStatus();
        if (protocolStatusResponse.success) {
          setProtocolStatus(protocolStatusResponse.data);
        }
      } catch (protocolError) {
        setProtocolStatus(null);
      }
    } catch (err) {
      setError("An error occurred while fetching delegation data");
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    await fetchDelegationData();
  };

  // Fetch delegation data when user is authenticated
  useEffect(() => {
    if (state.user?.wallet_id) {
      fetchDelegationData();
    }
  }, [state.user?.wallet_id]);

  const value: DelegationContextType = {
    userDelegation,
    delegatorTransactions,
    delegatorStakeProfile,
    protocolStatus,
    isLoading,
    error,
    refetch,
  };

  return (
    <DelegationContext.Provider value={value}>
      {children}
    </DelegationContext.Provider>
  );
};

export const useDelegation = (): DelegationContextType => {
  const context = useContext(DelegationContext);
  if (context === undefined) {
    throw new Error("useDelegation must be used within a DelegationProvider");
  }
  return context;
};
