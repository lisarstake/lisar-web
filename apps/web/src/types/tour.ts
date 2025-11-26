export interface TourStep {
  id: string;
  target: string; // CSS selector or data-tour-id
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  highlightPadding?: number;
  primaryButtonLabel?: string;
  secondaryButtonLabel?: string;
  hidePreviousButton?: boolean;
  hideSecondaryButton?: boolean;
  disableSkip?: boolean;
}

export interface TourConfig {
  id: string;
  name: string;
  steps: TourStep[];
}

export interface TourState {
  isActive: boolean;
  currentStepIndex: number;
  tourId: string | null;
  completedTours: string[];
}

export interface GuidedTourContextType {
  tourState: TourState;
  startTour: (tourId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  resetTour: (tourId: string) => void;
  isTourCompleted: (tourId: string) => boolean;
}

