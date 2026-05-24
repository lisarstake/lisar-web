import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { kycService } from "@/services";
import type { KycStatusData } from "@/services";
import { useAuth } from "./AuthContext";

interface KycContextType {
  kycStatus: KycStatusData | null;
  isLoading: boolean;
  refreshKycStatus: () => Promise<void>;
}

const KycContext = createContext<KycContextType | undefined>(undefined);

interface KycProviderProps {
  children: ReactNode;
}

export const KycProvider: React.FC<KycProviderProps> = ({ children }) => {
  const { state } = useAuth();
  const [kycStatus, setKycStatus] = useState<KycStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchedRef = useRef(false);

  const fetchKycStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await kycService.getStatus();
      if (response.success && response.data) {
        setKycStatus(response.data);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshKycStatus = useCallback(async () => {
    await fetchKycStatus();
  }, [fetchKycStatus]);

  useEffect(() => {
    if (state.isAuthenticated && !state.isLoading && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchKycStatus();
    } else if (!state.isAuthenticated) {
      fetchedRef.current = false;
      setKycStatus(null);
      setIsLoading(true);
    }
  }, [state.isAuthenticated, state.isLoading, fetchKycStatus]);

  return (
    <KycContext.Provider value={{ kycStatus, isLoading, refreshKycStatus }}>
      {children}
    </KycContext.Provider>
  );
};

export const useKyc = (): KycContextType => {
  const context = useContext(KycContext);
  if (context === undefined) {
    throw new Error("useKyc must be used within a KycProvider");
  }
  return context;
};
