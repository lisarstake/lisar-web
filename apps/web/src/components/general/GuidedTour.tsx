import React, { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGuidedTourContext } from "@/contexts/GuidedTourContext";
import { getTourConfig, LEARN_TOUR_ID } from "@/lib/tourConfig";
import { TourStep } from "@/types/tour";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth";

interface SpotlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TooltipPosition {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export const GuidedTour: React.FC = () => {
  const navigate = useNavigate();
  const { state: authState, refreshUser } = useAuth();
  const { tourState, nextStep, previousStep, skipTour, completeTour } =
    useGuidedTourContext();
  const [spotlightPosition, setSpotlightPosition] =
    useState<SpotlightPosition | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({});
  const [currentStep, setCurrentStep] = useState<TourStep | null>(null);
  const [showSkipConfirmation, setShowSkipConfirmation] = useState(false);

  useEffect(() => {
    setShowSkipConfirmation(false);
  }, [tourState.currentStepIndex, tourState.tourId]);

  const calculatePositions = useCallback((step: TourStep) => {
    const element = document.querySelector(step.target);
    if (!element) {
      console.warn(`Tour target not found: ${step.target}`);
      return;
    }

    const rect = element.getBoundingClientRect();
    const padding = step.highlightPadding || 8;

    // Add scroll offset
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    // Spotlight position (fixed to viewport)
    const spotlight: SpotlightPosition = {
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };

    setSpotlightPosition(spotlight);

    // Tooltip position based on preferred position
    const tooltip: TooltipPosition = {};
    const tooltipOffset = 20;
    const tooltipWidth = 300;

    switch (step.position) {
      case "top":
        tooltip.bottom = window.innerHeight - rect.top + tooltipOffset;
        tooltip.left = Math.max(
          16,
          Math.min(
            rect.left + rect.width / 2 - tooltipWidth / 2,
            window.innerWidth - tooltipWidth - 16
          )
        );
        break;
      case "bottom":
        tooltip.top = rect.bottom + tooltipOffset;
        tooltip.left = Math.max(
          16,
          Math.min(
            rect.left + rect.width / 2 - tooltipWidth / 2,
            window.innerWidth - tooltipWidth - 16
          )
        );
        break;
      case "left":
        tooltip.top = Math.max(16, rect.top + rect.height / 2 - 80);
        tooltip.right = window.innerWidth - rect.left + tooltipOffset;
        break;
      case "right":
        tooltip.top = Math.max(16, rect.top + rect.height / 2 - 80);
        tooltip.left = rect.right + tooltipOffset;
        break;
      default:
        // Default to bottom
        tooltip.top = rect.bottom + tooltipOffset;
        tooltip.left = Math.max(
          16,
          Math.min(
            rect.left + rect.width / 2 - tooltipWidth / 2,
            window.innerWidth - tooltipWidth - 16
          )
        );
    }

    setTooltipPosition(tooltip);
  }, []);

  useEffect(() => {
    if (!tourState.isActive || !tourState.tourId) {
      setCurrentStep(null);
      setSpotlightPosition(null);
      return;
    }

    const tourConfig = getTourConfig(tourState.tourId);
    if (!tourConfig) return;

    const step = tourConfig.steps[tourState.currentStepIndex];
    setCurrentStep(step);

    // Small delay to ensure DOM is ready, then try multiple times to find element
    let attemptCount = 0;
    const maxAttempts = 10;

    const tryCalculate = () => {
      const element = document.querySelector(step.target);
      if (element) {
        calculatePositions(step);
      } else if (attemptCount < maxAttempts) {
        attemptCount++;
        setTimeout(tryCalculate, 100);
      } else {
        console.error(
          `Could not find element: ${step.target} after ${maxAttempts} attempts`
        );
      }
    };

    const timer = setTimeout(tryCalculate, 50);

    return () => clearTimeout(timer);
  }, [
    tourState.isActive,
    tourState.tourId,
    tourState.currentStepIndex,
    calculatePositions,
  ]);

  // Recalculate on resize or scroll
  useEffect(() => {
    if (!currentStep) return;

    const handleResize = () => calculatePositions(currentStep);
    const handleScroll = () => calculatePositions(currentStep);

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [currentStep, calculatePositions]);

  const handleSkipClick = () => {
    if (currentStep?.disableSkip) return;
    setShowSkipConfirmation(true);
  };

  const handleConfirmSkip = () => {
    skipTour();
    setShowSkipConfirmation(false);
    navigate("/learn");
  };

  const handleCancelSkip = () => {
    setShowSkipConfirmation(false);
  };

  const handleNextStep = async () => {
    const tourConfig = getTourConfig(tourState.tourId!);
    if (!tourConfig) return;

    const isLastStep =
      tourState.currentStepIndex === tourConfig.steps.length - 1;

    // Special handling for learn tour "Watch" button
    if (tourState.tourId === LEARN_TOUR_ID && currentStep?.id === "learn-onboarding") {
      // Mark user as onboarded
      try {
        if (authState.user?.user_id && authState.user?.is_onboarded === false) {
          await authService.updateOnboardingStatus(authState.user.user_id, {
            is_onboarded: true,
          });
          await refreshUser();
        }
      } catch (error) {
        console.error("Failed to update onboarding status:", error);
      }
      
      // Complete the tour and navigate to first video
      completeTour();
      const firstVideo = document.querySelector('[data-tour="learn-video-card"]');
      if (firstVideo) {
        (firstVideo as HTMLElement).click();
      }
      return;
    }

    if (isLastStep) {
      completeTour();
      navigate("/learn");
    } else {
      nextStep();
    }
  };

  if (!tourState.isActive || !currentStep || !spotlightPosition) {
    return null;
  }

  const tourConfig = getTourConfig(tourState.tourId!);
  if (!tourConfig) return null;

  const totalSteps = tourConfig.steps.length;
  const currentStepNumber = tourState.currentStepIndex + 1;
  const isFirstStep = tourState.currentStepIndex === 0;
  const isLastStep = tourState.currentStepIndex === totalSteps - 1;

  const canSkipCurrentStep = !currentStep.disableSkip;
  const primaryActionLabel = showSkipConfirmation
    ? "Yes, Skip"
    : currentStep.primaryButtonLabel || (isLastStep ? "Next" : "Next");
  const secondaryActionLabel = showSkipConfirmation
    ? "Continue"
    : currentStep.secondaryButtonLabel || "Prev";
  const shouldShowPrevButton =
    !showSkipConfirmation && !currentStep.hidePreviousButton && !isFirstStep;

  return (
    <>
      {/* Overlay with spotlight effect - blocks clicks */}
      <div
        className="fixed inset-0"
        style={{
          zIndex: 9998,
          background: `
            radial-gradient(
              circle at ${spotlightPosition.left + spotlightPosition.width / 2}px 
              ${spotlightPosition.top + spotlightPosition.height / 2}px,
              transparent ${Math.max(spotlightPosition.width, spotlightPosition.height) / 2 + 10}px,
              rgba(0, 0, 0, 0.65) ${Math.max(spotlightPosition.width, spotlightPosition.height) / 2 + 60}px
            )
          `,
          pointerEvents: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Highlight border */}
      <div
        className="fixed pointer-events-none border-2 border-[#C7EF6B] rounded-xl transition-all duration-300"
        style={{
          zIndex: 9999,
          top: `${spotlightPosition.top}px`,
          left: `${spotlightPosition.left}px`,
          width: `${spotlightPosition.width}px`,
          height: `${spotlightPosition.height}px`,
          boxShadow: "0 0 0 2px rgba(199, 239, 107, 0.1)",
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 shadow-2xl max-w-[300px] transition-all duration-300"
        style={{
          zIndex: 10000,
          ...tooltipPosition,
          pointerEvents: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-white font-semibold text-lg pr-6">
            {showSkipConfirmation ? "Skip Guide?" : currentStep.title}
          </h3>
          {canSkipCurrentStep && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSkipClick();
              }}
              className="text-gray-400 hover:text-white transition-colors shrink-0"
              aria-label="Skip tour"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Description or skip prompt */}
        <p className="text-gray-300 text-sm mb-4 leading-relaxed">
          {showSkipConfirmation
            ? "Are you sure you want to skip the onboarding guide? It explains how to navigate the app effectively."
            : currentStep.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2">
          {(showSkipConfirmation || shouldShowPrevButton) && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (showSkipConfirmation) {
                  handleCancelSkip();
                } else {
                  previousStep();
                }
              }}
              className="px-3 py-1.5 text-gray-300 border border-[#2a2a2a] rounded-lg hover:border-[#3a3a3a] transition-colors text-sm"
            >
              {secondaryActionLabel}
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (showSkipConfirmation) {
                handleConfirmSkip();
              } else {
                handleNextStep();
              }
            }}
            className="px-4 py-1.5 bg-[#C7EF6B] text-black rounded-lg hover:bg-[#d4f57b] transition-colors text-sm font-medium"
          >
            {primaryActionLabel}
          </button>
        </div>
      </div>
    </>
  );
};
