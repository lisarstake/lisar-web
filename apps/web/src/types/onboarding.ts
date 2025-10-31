// TypeScript interfaces for onboarding screens

export interface OnboardingScreen {
  id: number;
  title: string;
  description: string;
  backgroundColor: string;
  textColor: string;
  illustration: {
    type: "trophy" | "coins" | "stack";
    position: "left" | "center" | "right";
    elements: IllustrationElement[];
  };
  isLastScreen: boolean;
}

export interface IllustrationElement {
  type: "trophy" | "coin" | "stack";
  size: "small" | "medium" | "large";
  color: string;
  shadow?: boolean;
  animation?: "spin" | "float" | "none";
  svgPath?: string;
}

export interface OnboardingState {
  currentScreen: number;
  totalScreens: number;
  isCompleted: boolean;
}

export interface OnboardingProps {
  onComplete: () => void;
  onSkip?: () => void;
}
