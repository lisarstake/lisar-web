import { OnboardingScreen } from "@/types/onboarding";

// Onboarding screens
export const onboardingScreens: OnboardingScreen[] = [
  {
    id: 1,
    title: "Stake to earn daily rewards.",
    description: "Stake with LISAR and enjoy reliable income year-round",
    backgroundColor: "bg-[#235538]",
    textColor: "text-white",
    illustration: {
      type: "trophy",
      position: "left",
      elements: [
        {
          type: "trophy",
          size: "large",
          color: "#C7EF6B",
          shadow: true,
          animation: "none",
          svgPath: "/h1.svg",
        },
      ],
    },
    isLastScreen: false,
  },
  {
    id: 2,
    title: "Turn irregular earnings into steady cashflow",

    description:
      "your money fuels decentralisation while you enjoy steady, real returns.",
    backgroundColor: "bg-[#86B3F7]",
    textColor: "text-white",
    illustration: {
      type: "coins",
      position: "center",
      elements: [
        {
          type: "stack",
          size: "large",
          color: "#000000",
          shadow: true,
          animation: "none",
          svgPath: "/h2.svg",
        },
      ],
    },
    isLastScreen: false,
  },
  {
    id: 3,
    title: "Your money working for you!",
    description:
      "Got tokens or capital just sitting? Put them to work earning a steady stream of rewards.",
    backgroundColor: "bg-[#C7EF6B]",
    textColor: "text-[#235538]",
    illustration: {
      type: "stack",
      position: "center",
      elements: [
        {
          type: "stack",
          size: "large",
          color: "#C7EF6B",
          shadow: true,
          animation: "none",
          svgPath: "/h3.svg",
        },
      ],
    },
    isLastScreen: true,
  },
];
