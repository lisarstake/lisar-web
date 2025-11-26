import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TourState, GuidedTourContextType } from '@/types/tour';
import { getTourConfig } from '@/lib/tourConfig';

const defaultTourState: TourState = {
  isActive: false,
  currentStepIndex: 0,
  tourId: null,
  completedTours: [],
};

const GuidedTourContext = createContext<GuidedTourContextType | undefined>(undefined);

interface GuidedTourProviderProps {
  children: ReactNode;
}

export const GuidedTourProvider: React.FC<GuidedTourProviderProps> = ({ children }) => {
  const [tourState, setTourState] = useState<TourState>(defaultTourState);

  const startTour = (tourId: string) => {
    const tourConfig = getTourConfig(tourId);
    if (!tourConfig) {
      console.error(`Tour config not found for ${tourId}`);
      return;
    }

    setTourState((prevState) => ({
      ...prevState,
      isActive: true,
      currentStepIndex: 0,
      tourId,
    }));
  };

  const nextStep = () => {
    setTourState((prevState) => {
      if (!prevState.tourId || !prevState.isActive) return prevState;

      const tourConfig = getTourConfig(prevState.tourId);
      if (!tourConfig) return prevState;

      const nextIndex = prevState.currentStepIndex + 1;

      if (nextIndex >= tourConfig.steps.length) {
        // Tour completed - mark as complete
        return {
          ...prevState,
          isActive: false,
          currentStepIndex: 0,
          tourId: null,
          completedTours: prevState.completedTours.includes(prevState.tourId)
            ? prevState.completedTours
            : [...prevState.completedTours, prevState.tourId],
        };
      }

      return {
        ...prevState,
        currentStepIndex: nextIndex,
      };
    });
  };

  const previousStep = () => {
    setTourState((prevState) => {
      if (prevState.currentStepIndex > 0) {
        return {
          ...prevState,
          currentStepIndex: prevState.currentStepIndex - 1,
        };
      }
      return prevState;
    });
  };

  const skipTour = () => {
    setTourState((prevState) => ({
      ...prevState,
      isActive: false,
      currentStepIndex: 0,
      tourId: null,
    }));
  };

  const completeTour = () => {
    setTourState((prevState) => {
      if (!prevState.tourId) return prevState;

      return {
        ...prevState,
        isActive: false,
        currentStepIndex: 0,
        tourId: null,
        completedTours: prevState.completedTours.includes(prevState.tourId)
          ? prevState.completedTours
          : [...prevState.completedTours, prevState.tourId],
      };
    });
  };

  const resetTour = (tourId: string) => {
    setTourState((prevState) => ({
      ...prevState,
      completedTours: prevState.completedTours.filter((id) => id !== tourId),
    }));
  };

  const isTourCompleted = (tourId: string): boolean => {
    return tourState.completedTours.includes(tourId);
  };

  const value: GuidedTourContextType = {
    tourState,
    startTour,
    nextStep,
    previousStep,
    skipTour,
    completeTour,
    resetTour,
    isTourCompleted,
  };

  return (
    <GuidedTourContext.Provider value={value}>
      {children}
    </GuidedTourContext.Provider>
  );
};

export const useGuidedTourContext = (): GuidedTourContextType => {
  const context = useContext(GuidedTourContext);
  if (!context) {
    throw new Error('useGuidedTourContext must be used within a GuidedTourProvider');
  }
  return context;
};

