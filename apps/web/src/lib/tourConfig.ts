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
      id: "profile-settings",
      target: '[data-tour="all-wallet-profile-icon"]',
      title: "Profile & Settings",
      description:
        "Tap here to open your settings, edit personal details, and export your wallet.",
      position: "bottom",
      highlightPadding: 8,
    },
    {
      id: "notifications",
      target: '[data-tour="all-wallet-notification-icon"]',
      title: "Notifications",
      description:
        "Check messages, alerts, and important updates from Lisar.",
      position: "bottom",
      highlightPadding: 8,
    },
    {
      id: "wallet-actions",
      target: '[data-tour="all-wallet-quick-actions"]',
      title: "Wallet Quick Actions",
      description:
        "Use these shortcuts to deposit, withdraw, and view your asset balances quickly.",
      position: "bottom",
      highlightPadding: 8,
    },
    {
      id: "message-card",
      target: '[data-tour="all-wallet-message-card"]',
      title: "Messages & Announcements",
      description:
        "This card keeps you updated with announcements and important information.",
      position: "bottom",
      highlightPadding: 8,
    },
    {
      id: "quick-deposit",
      target: '[data-tour="all-wallet-quick-deposit"]',
      title: "Quick Deposit",
      description:
        "Add funds to your wallet quickly using preset deposit amounts.",
      position: "bottom",
      highlightPadding: 8,
    },
    {
      id: "yield-section",
      target: '[data-tour="all-wallet-yield-section"]',
      title: "Earn Daily Yields",
      description:
        "Put your assets to work and grow your balance with daily yield opportunities.",
      position: "bottom",
      highlightPadding: 8,
    },
    {
      id: "nav-home",
      target: '[data-tour="nav-wallet"]',
      title: "Home",
      description:
        "Home brings you back to your wallet dashboard and quick actions.",
      position: "top",
      highlightPadding: 8,
    },
    {
      id: "nav-yield",
      target: '[data-tour="nav-yield"]',
      title: "Yield",
      description:
        "Open Yield to create positions and keep your assets earning.",
      position: "top",
      highlightPadding: 8,
    },
    {
      id: "nav-activity",
      target: '[data-tour="nav-activity"]',
      title: "Activity",
      description:
        "Track your transaction history and all recent wallet activity.",
      position: "top",
      highlightPadding: 8,
    },
    {
      id: "nav-explore",
      target: '[data-tour="nav-explore"]',
      title: "Explore",
      description:
        "Discover new opportunities, campaigns, and updates from Lisar.",
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
