import { TourConfig } from "@/types/tour";

export const LEARN_TOUR_ID = "learn-tour";
export const ALL_WALLET_TOUR_ID = "all-wallet-tour";
export const WALLET_PAGE_TOUR_ID = "wallet-page-tour";

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

export const allWalletTourConfig: TourConfig = {
  id: ALL_WALLET_TOUR_ID,
  name: "All Wallets Tour",
  steps: [
    {
      id: "welcome",
      target: '[data-tour="all-wallet-balance-card"]',
      title: "Welcome to Lisar 👋",
      description:
        "Swipe through the cards to see your other wallets and their balances.",
      position: "bottom",
      highlightPadding: 10,
    },
    {
      id: "wallet-help",
      target: '[data-tour="all-wallet-help-icon"]',
      title: "Need Help?",
      description:
        "Tap the help icon on any card to learn more about that wallet type and how it works.",
      position: "bottom",
      highlightPadding: 5,
    },

    {
      id: "stables-card",
      target: '[data-tour="all-wallet-stables-card"]',
      title: "Stables",
      description:
        "Explore different account types. The stable account earns stable yields with low risk.",
      position: "top",
      highlightPadding: 8,
    },
    {
      id: "high-yield-card",
      target: '[data-tour="all-wallet-high-yield-card"]',
      title: "High Yield",
      description:
        "The high yield account maximizes your returns with higher APY. Perfect for long-term investment goals.",
      position: "top",
      highlightPadding: 8,
    },
    {
      id: "nav-wallet",
      target: '[data-tour="nav-wallet"]',
      title: "Home Navigation",
      description:
        "Access your wallet anytime from this tab. View different wallets and their balance.",
      position: "top",
      highlightPadding: 8,
    },
    {
      id: "nav-forecast",
      target: '[data-tour="nav-forecast"]',
      title: "Yields",
      description: "Calculate potential returns for different account types.",
      position: "top",
      highlightPadding: 8,
    },
    {
      id: "nav-learn",
      target: '[data-tour="nav-learn"]',
      title: "Learn More",
      description:
        "Discover educational content about Lisar and guides to help you get started.",
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

export const walletPageTourConfig: TourConfig = {
  id: WALLET_PAGE_TOUR_ID,
  name: "Wallet Page Tour",
  steps: [
    {
      id: "welcome",
      target: '[data-tour="wallet-page-balance"]',
      title: "Your Wallet Balance",
      description:
        "This shows your current balance for this wallet. Tap the eye icon to show or hide your balance.",
      position: "bottom",
      highlightPadding: 10,
    },
    {
      id: "wallet-help",
      target: '[data-tour="wallet-page-help-icon"]',
      title: "Need Help?",
      description:
        "Tap here to learn more about this wallet type, how it works, and important information.",
      position: "bottom",
      highlightPadding: 5,
    },
    {
      id: "top-up",
      target: '[data-tour="wallet-page-deposit-button"]',
      title: "Top Up",
      description:
        "Add funds to this wallet. You can deposit tokens to start earning rewards.",
      position: "top",
      highlightPadding: 8,
    },
    {
      id: "vest",
      target: '[data-tour="wallet-page-stake-button"]',
      title: "Vest Your Tokens",
      description:
        "Vest your tokens to start earning rewards. Your tokens will begin accruing interest immediately.",
      position: "top",
      highlightPadding: 8,
    },
    {
      id: "portfolio",
      target: '[data-tour="wallet-page-portfolio-button"]',
      title: "View Portfolio",
      description:
        "Check your current vests, earned rewards, and transaction history all in one place.",
      position: "top",
      highlightPadding: 8,
    },
    {
      id: "withdraw",
      target: '[data-tour="wallet-page-withdraw-button"]',
      title: "Withdraw",
      description:
        "Withdraw tokens from this wallet to your bank account or external wallet.",
      position: "top",
      highlightPadding: 8,
    },
  ],
};

export const tourConfigs: Record<string, TourConfig> = {
  [LEARN_TOUR_ID]: learnTourConfig,
  [ALL_WALLET_TOUR_ID]: allWalletTourConfig,
  [WALLET_PAGE_TOUR_ID]: walletPageTourConfig,
};

export const getTourConfig = (tourId: string): TourConfig | undefined => {
  return tourConfigs[tourId];
};
