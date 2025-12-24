import { useEffect, useRef } from "react";
import { useGuidedTourContext } from "@/contexts/GuidedTourContext";

interface UseGuidedTourOptions {
  tourId: string;
  autoStart?: boolean;
  onComplete?: () => void;
}

export const useGuidedTour = (options: UseGuidedTourOptions) => {
  const { tourId, autoStart = false, onComplete } = options;
  const {
    tourState,
    startTour,
    nextStep,
    previousStep,
    skipTour,
    completeTour,
    resetTour,
    isTourCompleted,
  } = useGuidedTourContext();

  const isThisTourActive = tourState.isActive && tourState.tourId === tourId;
  const isCompleted = isTourCompleted(tourId);
  const autoStartTriggeredRef = useRef(false);

  // Auto-start: only trigger once per mount
  useEffect(() => {
    if (autoStart && !autoStartTriggeredRef.current && !isCompleted) {
      autoStartTriggeredRef.current = true;
      startTour(tourId);
    }
  }, []);

  useEffect(() => {
    if (onComplete && !tourState.isActive && isCompleted) {
      onComplete();
    }
  }, [tourState.isActive, isCompleted, onComplete]);

  const handleStartTour = () => {
    startTour(tourId);
  };

  const handleResetTour = () => {
    resetTour(tourId);
    startTour(tourId);
  };

  return {
    isActive: isThisTourActive,
    isCompleted,
    currentStep: tourState.currentStepIndex,
    startTour: handleStartTour,
    resetTour: handleResetTour,
    nextStep,
    previousStep,
    skipTour,
    completeTour,
  };
};
