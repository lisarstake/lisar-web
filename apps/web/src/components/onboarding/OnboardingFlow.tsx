import React, { useState, useEffect } from "react";
import { onboardingScreens } from "@/data/onboardingData";
import { OnboardingIllustration } from "./OnboardingIllustration";
import { OnboardingPagination } from "./OnboardingPagination";
import { OnboardingProps, OnboardingState } from "@/types/onboarding";
import {LisarLinesOnboarding} from "../general/lisar-lines";

export const OnboardingFlow: React.FC<OnboardingProps> = ({
  onComplete,
  onSkip,
}) => {
  const [state, setState] = useState<OnboardingState>({
    currentScreen: 0,
    totalScreens: onboardingScreens.length,
    isCompleted: false,
  });

  const currentScreenData = onboardingScreens[state.currentScreen];

  // Handle screen navigation
  const nextScreen = () => {
    if (state.currentScreen < state.totalScreens - 1) {
      setState((prev) => ({
        ...prev,
        currentScreen: prev.currentScreen + 1,
      }));
    } else {
      setState((prev) => ({ ...prev, isCompleted: true }));
      onComplete();
    }
  };

  const prevScreen = () => {
    if (state.currentScreen > 0) {
      setState((prev) => ({
        ...prev,
        currentScreen: prev.currentScreen - 1,
      }));
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        nextScreen();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        prevScreen();
      } else if (event.key === "Escape" && onSkip) {
        event.preventDefault();
        onSkip();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [state.currentScreen, onSkip]);

  // Handle swipe gestures for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextScreen();
    } else if (isRightSwipe) {
      prevScreen();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col ${currentScreenData.backgroundColor} relative overflow-hidden`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Lisar Lines at top right */}
        <LisarLinesOnboarding position="top-right" />

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8 relative z-10">
          <div className="flex flex-col items-start justify-center space-y-4 w-full max-w-md">
            <img src="/Logo.svg" alt="Lisar Logo" className="h-5 w-auto mb-2" />
            <h1
              className={`text-3xl md:text-4xl font-bold leading-tight text-left ${currentScreenData.textColor}`}
            >
              {currentScreenData.title}
            </h1>
            <p
              className={`text-lg md:text-xl leading-relaxed text-left ${currentScreenData.textColor} opacity-90`}
            >
              {currentScreenData.description}
            </p>
             <div className="mt-4 flex items-center justify-end w-full overflow-hidden">
               <OnboardingIllustration
                 svgPath={currentScreenData.illustration.elements[0].svgPath!}
               />
             </div>
             {!currentScreenData.isLastScreen && (
               <div className="mt-10 flex items-center justify-center w-full">
                 <OnboardingPagination
                   currentScreen={state.currentScreen}
                   totalScreens={state.totalScreens}
                 />
               </div>
             )}
             {currentScreenData.isLastScreen && (
               <div className="mt-6 w-full">
                 <button
                   onClick={nextScreen}
                   className="w-full bg-green-800 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors"
                 >
                   Get started
                 </button>
               </div>
             )}
           </div>
         </div>
       </div>
     </div>
  );
};
