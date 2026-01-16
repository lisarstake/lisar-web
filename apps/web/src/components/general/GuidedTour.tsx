import React, { useEffect, useState, useCallback, useRef } from "react";
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
  transform?: string;
  width?: number;
}


const isMobileDevice = () => {
  return window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};


const getViewportHeight = () => {

  if (window.visualViewport) {
    return window.visualViewport.height;
  }
  return window.innerHeight;
};


const getViewportWidth = () => {
  if (window.visualViewport) {
    return window.visualViewport.width;
  }
  return window.innerWidth;
};

const getVisibleElement = (selector: string): HTMLElement | null => {
  const elements = document.querySelectorAll<HTMLElement>(selector);
  for (const element of elements) {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const hasSize = rect.width > 0 || rect.height > 0;
    const isHidden =
      style.display === "none" ||
      style.visibility === "hidden" ||
      parseFloat(style.opacity || "1") === 0;
    if (!isHidden && hasSize) {
      return element;
    }
  }
  return null;
};

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
  const rafIdRef = useRef<number | null>(null);
  const scrollContainersRef = useRef<Element[]>([]);

  useEffect(() => {
    setShowSkipConfirmation(false);
  }, [tourState.currentStepIndex, tourState.tourId]);

  const calculatePositions = useCallback((step: TourStep) => {
    const element = getVisibleElement(step.target);
    if (!element) {
      console.warn(`Tour target not found: ${step.target}`);
      return;
    }

    const rect = element.getBoundingClientRect();
    const padding = step.highlightPadding || 8;


    const viewportHeight = getViewportHeight();
    const viewportWidth = getViewportWidth();
    
   
    const viewportOffsetTop = window.visualViewport?.offsetTop || 0;
    const viewportOffsetLeft = window.visualViewport?.offsetLeft || 0;

 
    const spotlight: SpotlightPosition = {
      top: rect.top - padding - viewportOffsetTop,
      left: rect.left - padding - viewportOffsetLeft,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };

    setSpotlightPosition(spotlight);

    // Tooltip position based on preferred position
    const tooltip: TooltipPosition = {};
    const tooltipOffset = 20;
    const isMobile = isMobileDevice();
    const horizontalMargin = isMobile ? 12 : 16;
    const tooltipWidth = isMobile
      ? Math.min(360, viewportWidth - horizontalMargin * 2)
      : 320;
    tooltip.width = tooltipWidth;

    switch (step.position) {
      case "top":
        tooltip.bottom = viewportHeight - (rect.top - viewportOffsetTop) + tooltipOffset;
        tooltip.left = Math.max(
          16,
          Math.min(
            rect.left - viewportOffsetLeft + rect.width / 2 - tooltipWidth / 2,
            viewportWidth - tooltipWidth - 16
          )
        );
        break;
      case "bottom":
        tooltip.top = rect.bottom - viewportOffsetTop + tooltipOffset;
        tooltip.left = Math.max(
          16,
          Math.min(
            rect.left - viewportOffsetLeft + rect.width / 2 - tooltipWidth / 2,
            viewportWidth - tooltipWidth - 16
          )
        );
        break;
      case "left":
        tooltip.top = Math.max(16, rect.top - viewportOffsetTop + rect.height / 2 - 80);
        tooltip.left =
          rect.left -
          viewportOffsetLeft -
          tooltipWidth -
          tooltipOffset;
        break;
      case "right":
        tooltip.top = Math.max(16, rect.top - viewportOffsetTop + rect.height / 2 - 80);
        tooltip.left = rect.right - viewportOffsetLeft + tooltipOffset;
        break;
      default:
        // Default to bottom
        tooltip.top = rect.bottom - viewportOffsetTop + tooltipOffset;
        tooltip.left = Math.max(
          16,
          Math.min(
            rect.left - viewportOffsetLeft + rect.width / 2 - tooltipWidth / 2,
            viewportWidth - tooltipWidth - 16
          )
        );
    }

    if (isMobile) {
      const centeredLeft = viewportWidth / 2 - viewportOffsetLeft;
      tooltip.left = centeredLeft;
      tooltip.transform = "translateX(-50%)";
    } else if (tooltip.left !== undefined) {
      tooltip.left = Math.max(
        horizontalMargin,
        Math.min(tooltip.left, viewportWidth - tooltipWidth - horizontalMargin)
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

    // Small delay to ensure DOM is ready
    let attemptCount = 0;
    const maxAttempts = 15;

    const tryCalculate = () => {
      const element = getVisibleElement(step.target);
      if (element) {
       
        const rect = element.getBoundingClientRect();
        const viewportHeight = getViewportHeight();
        const viewportWidth = getViewportWidth();
        
        // Check if element is outside the visible viewport
        const isOutOfView = 
          rect.bottom < 0 || 
          rect.top > viewportHeight || 
          rect.right < 0 || 
          rect.left > viewportWidth;
        
        if (isOutOfView || isMobileDevice()) {
          // Scroll element into view with smooth behavior
          // Use 'nearest' to minimize scrolling - only scroll if necessary
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
          
          // Wait for scroll to complete before calculating positions
          setTimeout(() => {
            calculatePositions(step);
          }, 350); // Allow time for smooth scroll
        } else {
          calculatePositions(step);
        }
      } else if (attemptCount < maxAttempts) {
        attemptCount++;
        setTimeout(tryCalculate, 100);
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

  // Recalculate on resize, scroll, or viewport changes
  useEffect(() => {
    if (!currentStep) return;

    const handleUpdate = () => {
      // Cancel any pending RAF to avoid duplicate calculations
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(() => {
        calculatePositions(currentStep);
      });
    };

    // Find all scrollable containers in the DOM that might contain tour targets
    const findScrollContainers = () => {
      const containers: Element[] = [];
      
      // Add common scroll containers
      const appMain = document.querySelector('.app-main');
      if (appMain) containers.push(appMain);
      
      // Mobile preview container (desktop view)
      const mobilePreview = document.getElementById('mobile-preview-container');
      if (mobilePreview) {
        containers.push(mobilePreview);
        const mainInPreview = mobilePreview.querySelector('main');
        if (mainInPreview) containers.push(mainInPreview);
      }
      
      // Find the target element and traverse up to find scrollable parents
      const targetElement = getVisibleElement(currentStep.target);
      if (targetElement) {
        let parent = targetElement.parentElement;
        while (parent && parent !== document.body) {
          const style = window.getComputedStyle(parent);
          const overflowY = style.overflowY;
          const overflowX = style.overflowX;
          if (overflowY === 'auto' || overflowY === 'scroll' || 
              overflowX === 'auto' || overflowX === 'scroll') {
            if (!containers.includes(parent)) {
              containers.push(parent);
            }
          }
          parent = parent.parentElement;
        }
      }
      
      return containers;
    };

    // Attach scroll listeners to all scroll containers
    scrollContainersRef.current = findScrollContainers();
    
    // Window events
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);
    
    // Add listeners to all found scroll containers
    scrollContainersRef.current.forEach(container => {
      container.addEventListener("scroll", handleUpdate, { passive: true });
    });

    // Listen to visual viewport changes on mobile (handles keyboard, address bar)
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleUpdate);
      window.visualViewport.addEventListener("scroll", handleUpdate);
    }

    // On mobile, use RAF loop to continuously update positions
    // This catches any edge cases where scroll events might be missed
    let mobileRafId: number | null = null;
    if (isMobileDevice()) {
      let lastTop = 0;
      let lastLeft = 0;
      
      const checkPosition = () => {
        const element = getVisibleElement(currentStep.target);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Only recalculate if position actually changed
          if (Math.abs(rect.top - lastTop) > 1 || Math.abs(rect.left - lastLeft) > 1) {
            lastTop = rect.top;
            lastLeft = rect.left;
            calculatePositions(currentStep);
          }
        }
        mobileRafId = requestAnimationFrame(checkPosition);
      };
      
      mobileRafId = requestAnimationFrame(checkPosition);
    }

    // Initial position calculation
    handleUpdate();

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
      
      scrollContainersRef.current.forEach(container => {
        container.removeEventListener("scroll", handleUpdate);
      });
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleUpdate);
        window.visualViewport.removeEventListener("scroll", handleUpdate);
      }
      
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      
      if (mobileRafId) {
        cancelAnimationFrame(mobileRafId);
      }
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
        // Failed to update onboarding status - user can proceed anyway
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
        className="fixed bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 shadow-2xl transition-all duration-300"
        style={{
          zIndex: 10000,
          ...tooltipPosition,
          pointerEvents: "auto",
          maxWidth:
            tooltipPosition.width !== undefined
              ? undefined
              : isMobileDevice()
              ? "calc(100vw - 24px)"
              : "300px",
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
