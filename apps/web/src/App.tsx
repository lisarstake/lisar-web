import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "@/components/general/ErrorBoundary";
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
import { GuidedTour } from "@/components/general/GuidedTour";

export default function App() {
  const location = useLocation();

  const useDesktopView =
    location.pathname === "/" || 
    location.pathname === "/dashboard" ||
    location.pathname.startsWith("/blog");

  const pagesWithBottomNav = [
    "/wallet",
    "/validator",
    "/portfolio",
    "/earn",
    "/learn",
    "/forecast",
    "/history",
    "/unstake-amount",
    "/transaction-detail",
    "/leaderboard",
    "/learn-detail",
  ];

  const pagesWithoutBottomNavSpacing = ["/wallet/savings/intro"];

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
          <Toaster position="top-right" />
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
        </GuidedTourProvider>
        </PricesProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
