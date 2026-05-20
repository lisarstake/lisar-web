import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "@/components/general/ErrorBoundary";
import { PwaRegister } from "@/components/general/PwaRegister";
import { PwaInstallPrompt } from "@/components/general/PwaInstallPrompt";
import { AuthProvider } from "@/contexts/AuthContext";
import { PricesProvider } from "@/contexts/PricesContext";
import { OrchestratorProvider } from "@/contexts/OrchestratorContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { TransactionProvider } from "@/contexts/TransactionContext";
import { DelegationProvider } from "@/contexts/DelegationContext";
import { LeaderboardProvider } from "@/contexts/LeaderboardContext";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { GuidedTourProvider } from "@/contexts/GuidedTourContext";
import { PortfolioProvider } from "@/contexts/PortfolioContext";
import { WalletCardProvider } from "@/contexts/WalletCardContext";
import { CampaignProvider } from "@/contexts/CampaignContext";
import { PointsProvider } from "@/contexts/PointsContext";
import { GuidedTour } from "@/components/general/GuidedTour";

export default function App() {
  const location = useLocation();

  const useDesktopView =
    location.pathname === "/" || 
    location.pathname === "/lisar-growth" || 
    location.pathname === "/lisar-savings" || 
    /* location.pathname === "/lisar-flex" || */
    location.pathname === "/privacy-policy" || 
    location.pathname === "/terms-of-use" || 
    location.pathname === "/dashboard" ||
    location.pathname.startsWith("/blog");

  const pagesWithBottomNav = [
    "/wallet",
    "/wallet/savings",
    "/wallet/staking",
    /* "/wallet/flex", */
    "/validator",
    "/portfolio",
    "/earn",
    "/learn",
    "/forecast",
    "/history",
    "/unstake-amount",
    "/leaderboard",
    "/leaderboard",
    "/learn-detail",
    "/earn/flex-card", 
    "/perks"
  ];

  const pagesWithoutBottomNavSpacing = ["/wallet/yields/intro", "/signup", "/login"];

  const hasBottomNav =
    !pagesWithoutBottomNavSpacing.some((path) =>
      location.pathname.startsWith(path),
    ) &&
    location.pathname !== "/wallet/returns" &&
    pagesWithBottomNav.some((path) =>
      location.pathname.startsWith(path)
    );

  return (
    <ErrorBoundary>
      <AuthProvider>
        <PricesProvider>
        <GuidedTourProvider>
          <Toaster position="bottom-center" />
          <PwaRegister />
          <PointsProvider>
          <ErrorBoundary>
            <DashboardProvider>
              <ErrorBoundary>
                <OrchestratorProvider>
                  <ErrorBoundary>
                    <WalletProvider>
                      <ErrorBoundary>
                        <TransactionProvider>
                          <ErrorBoundary>
                            <DelegationProvider>
                              <ErrorBoundary>
                                <WalletCardProvider>
                                <PortfolioProvider>
                                  <ErrorBoundary>
                                    <LeaderboardProvider>
                                      <ErrorBoundary>
                                        <CampaignProvider>
                                          <ErrorBoundary>
                                            <NotificationProvider>
                                    <div className="min-h-screen bg-white relative">
                                      {useDesktopView ? (
                                        <main
                                          className={
                                            location.pathname === "/"
                                              ? "min-h-screen overflow-y-auto"
                                              : "app-main"
                                          }
                                        >
                                          <Outlet />
                                        </main>
                                      ) : (
                                        <>
                                          <div className="hidden md:flex md:items-center md:justify-center md:h-screen md:bg-[#0a0a0a]">
                                            <div id="mobile-preview-container" className="relative w-full max-w-[390px] h-full max-h-[99vh] shadow-2xl overflow-hidden">
                                              <main
                                                className={`app-main h-full ${hasBottomNav ? "with-bottom-nav" : ""}`}
                                              >
                                                <Outlet />
                                              </main>
                                            </div>
                                          </div>

                                          <div className="md:hidden">
                                            <main
                                              className={`app-main ${hasBottomNav ? "with-bottom-nav" : ""}`}
                                            >
                                              <Outlet />
                                            </main>
                                          </div>
                                        </>
                                      )}
                                      <GuidedTour />
                                      <PwaInstallPrompt />
                                    </div>
                                            </NotificationProvider>
                                          </ErrorBoundary>
                                        </CampaignProvider>
                                      </ErrorBoundary>
                                    </LeaderboardProvider>
                                  </ErrorBoundary>
                                </PortfolioProvider>
                                </WalletCardProvider>
                              </ErrorBoundary>
                            </DelegationProvider>
                          </ErrorBoundary>
                        </TransactionProvider>
                      </ErrorBoundary>
                    </WalletProvider>
                  </ErrorBoundary>
                </OrchestratorProvider>
              </ErrorBoundary>
            </DashboardProvider>
          </ErrorBoundary>
          </PointsProvider>
        </GuidedTourProvider>
        </PricesProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
