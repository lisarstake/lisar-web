import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";

interface GrowContextValue {
  isInGrowMode: boolean;
  setGrowMode: (value: boolean) => void;
  isLoading: boolean;
  setLoading: (value: boolean) => void;
}

const GrowContext = createContext<GrowContextValue | undefined>(undefined);

export const GrowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInGrowMode, setIsInGrowMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const setGrowMode = useCallback((value: boolean) => {
    setIsInGrowMode(value);
  }, []);

  const setLoading = useCallback((value: boolean) => {
    setIsLoading(value);
  }, []);

  const value = useMemo(
    () => ({
      isInGrowMode,
      setGrowMode,
      isLoading,
      setLoading,
    }),
    [isInGrowMode, isLoading, setGrowMode, setLoading]
  );

  return (
    <GrowContext.Provider value={value}>
      {children}
    </GrowContext.Provider>
  );
};

export const useGrow = (): GrowContextValue => {
  const context = useContext(GrowContext);
  if (!context) {
    throw new Error("useGrow must be used within a GrowProvider");
  }
  return context;
};

