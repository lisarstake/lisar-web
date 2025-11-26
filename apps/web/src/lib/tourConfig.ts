import { TourConfig } from "@/types/tour";

export const WALLET_TOUR_ID = "wallet-tour";
export const LEARN_TOUR_ID = "learn-tour";

export const walletTourConfig: TourConfig = {
  id: WALLET_TOUR_ID,
  name: "Wallet Tour",
  steps: [
    {
      id: "welcome",
      target: '[data-tour="wallet-balance"]',
      title: "Welcome to Lisar 👋",
      description:
        "Your wallet shows your total balance including both unstaked and staked tokens. Let's explore other sections.",
      position: "bottom",
      highlightPadding: -5,
    },
    {
      id: "wallet-help",
      target: '[data-tour="wallet-help-icon"]',
      title: "Need Help?",
      description:
        "Use the help icon on any screen to access quick guides about the page you're on.",
      position: "bottom",
      highlightPadding: 5,
    },
    {
      id: "deposit",
      target: '[data-tour="deposit-button"]',
      title: "Deposit",
      description:
        "Tap here to add funds to your wallet. You can deposit tokens to start staking and earning rewards.",
      position: "bottom",
      highlightPadding: 8,
    },
    {
      id: "stake",
      target: '[data-tour="stake-button"]',
      title: "Stake Your Tokens",
      description:
        "Stake your LPT tokens with validators to earn rewards. Choose from a list of trusted validators.",
      position: "bottom",
      highlightPadding: 8,
    },
    {
      id: "portfolio",
      target: '[data-tour="portfolio-button"]',
      title: "View Your Portfolio",
      description:
        "Check your current stakes, earned rewards and more all in one place.",
      position: "bottom",
      highlightPadding: 8,
    },
    {
      id: "withdraw",
      target: '[data-tour="withdraw-button"]',
      title: "Withdraw",
      description: "Withdraw tokens from your wallet to your bank account.",
      position: "bottom",
      highlightPadding: 8,
    },
    {
      id: "orchestrators",
      target: '[data-tour="orchestrator-highlight"]',
      title: "Explore validators",
      description:
        "Review validators, compare their APY and fees, and choose who to stake with.",
      position: "bottom",
      highlightPadding: 10,
    },
    {
      id: "nav-wallet",
      target: '[data-tour="nav-wallet"]',
      title: "Wallet Navigation",
      description:
        "Access your wallet anytime from this tab. View balances, stake, and manage your tokens.",
      position: "top",
      highlightPadding: 8,
    },
    {
      id: "nav-forecast",
      target: '[data-tour="nav-forecast"]',
      title: "Forecast Calculator",
      description:
        "Calculate potential earnings and plan your staking strategy with our forecast tool.",
      position: "top",
      highlightPadding: 8,
    },
    {
      id: "nav-learn",
      target: '[data-tour="nav-learn"]',
      title: "Learn More",
      description:
        "Discover educational content about staking, Livepeer, and how to maximize your rewards.",
      position: "top",
      highlightPadding: 8,
    },
    {
      id: "nav-earn",
      target: '[data-tour="nav-earn"]',
      title: "Earn Rewards",
      description:
        "Explore earning opportunities and other perks for being a Lisar user.",
      position: "top",
      highlightPadding: 8,
    },
  ],
};

export const learnTourConfig: TourConfig = {
  id: LEARN_TOUR_ID,
  name: "Learn Tour",
  steps: [
    {
      id: "learn-onboarding",
      target: '[data-tour="learn-video-card"]',
      title: "Watch onboarding video",
      description:
        "Watch at least one onboarding video to understand how Lisar works. Tap Watch to open the video.",
      position: "bottom",
      highlightPadding: 10,
      primaryButtonLabel: "Watch",
      hidePreviousButton: true,
      disableSkip: true,
    },
  ],
};

export const tourConfigs: Record<string, TourConfig> = {
  [WALLET_TOUR_ID]: walletTourConfig,
  [LEARN_TOUR_ID]: learnTourConfig,
};

export const getTourConfig = (tourId: string): TourConfig | undefined => {
  return tourConfigs[tourId];
};
