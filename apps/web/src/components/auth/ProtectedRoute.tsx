import React, { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/general/LoadingSpinner";
import { authService } from "@/services/auth";
import { Button } from "../ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const MANDATORY_VIDEOS = [
  { slug: "what-is-lisar", title: "What is Lisar?" },
  { slug: "where-do-rewards-come-from", title: "Where do rewards come from?" },
  { slug: "risks-of-using-lisar", title: "What are the risks?" },
];

const getNextIncompleteVideo = (): string => {
  const completedKey = "onboarding_videos_completed";
  const completed = JSON.parse(localStorage.getItem(completedKey) || "[]");

  for (const video of MANDATORY_VIDEOS) {
    if (!completed.includes(video.slug)) {
      return video.slug;
    }
  }

  return MANDATORY_VIDEOS[0].slug;
};

const OnboardingToast: React.FC<{ onSkip: () => Promise<void> }> = ({ onSkip }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleClick = async () => {
    setIsLoading(true);
    await onSkip();
    setIsLoading(false);
    navigate("/wallet");
  };

  return (
    <div className="flex gap-3 items-center">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-gray-800">Complete Onboarding</p>
        <p className="text-xs text-gray-800">
          Please watch the onboarding videos to help you understand Lisar.
        </p>
      </div>

      <Button
        onClick={handleClick}
        className="px-4 py-2 text-sm font-medium rounded-lg"
        disabled={isLoading}
      >
        {isLoading ? "..." : "Later"}
      </Button>
    </div>
  );
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { state, refreshUser } = useAuth();
  const location = useLocation();
  const previousPathRef = useRef<string | null>(null);
  const lastToastTimeRef = useRef<number>(0);

  const handleSkipOnboarding = async (toastId: string) => {
    try {
      if (!state.user?.user_id) return;

      const response = await authService.updateOnboardingStatus(
        state.user.user_id,
        { is_onboarded: true }
      );

      if (response.success) {
        await refreshUser();
        localStorage.removeItem("onboarding_videos_completed");
      
      }
      
      toast.dismiss(toastId);
    } catch (error) {
      console.error("Failed to skip onboarding:", error);
      toast.dismiss(toastId);
    }
  };

  useEffect(() => {
    const wasOnLearnPage = previousPathRef.current?.startsWith("/learn");
    const isOnLearnPage = location.pathname.startsWith("/learn");
    const now = Date.now();
    const timeSinceLastToast = now - lastToastTimeRef.current;

    if (
      wasOnLearnPage &&
      !isOnLearnPage &&
      state.user?.is_onboarded === false &&
      timeSinceLastToast > 5000
    ) {
      const toastId = "onboarding-required";
      toast(
        <OnboardingToast onSkip={() => handleSkipOnboarding(toastId)} />,
        {
          duration: 5000,
          id: toastId,
        }
      );
      lastToastTimeRef.current = now;
    }

    previousPathRef.current = location.pathname;
  }, [location.pathname, state.user?.is_onboarded]);

  if (state.isLoading) {
    return <LoadingSpinner />;
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allow wallet page for non-onboarded users (tour will guide them)
  const isWalletRoute = location.pathname.startsWith("/wallet");
  const isLearnRoute = location.pathname.startsWith("/learn");

  if (!isLearnRoute && !isWalletRoute && state.user?.is_onboarded === false) {
    // Redirect to wallet where tour will start
    return <Navigate to="/wallet" replace />;
  }

  return <>{children}</>;
};
