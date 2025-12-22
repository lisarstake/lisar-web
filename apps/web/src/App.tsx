import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "@/components/general/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrchestratorProvider } from "@/contexts/OrchestratorContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { TransactionProvider } from "@/contexts/TransactionContext";
import { DelegationProvider } from "@/contexts/DelegationContext";
import { LeaderboardProvider } from "@/contexts/LeaderboardContext";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { GuidedTourProvider } from "@/contexts/GuidedTourContext";
import { PortfolioProvider } from "@/contexts/PortfolioContext";
import { GrowProvider } from "@/contexts/GrowContext";
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
    "/cards",
    "/portfolio",
    "/account",
    "/learn",
    "/forecast",
    "/history",
    "/stake",
    "/unstake-amount",
    "/confirm-unstake",
    "/withdraw-network",
    "/confirm-withdrawal",
    "/deposit",
    "/transaction-detail",
    "/leaderboard",
    "/learn-detail",
  ];

  const hasBottomNav = pagesWithBottomNav.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <ErrorBoundary>
      <AuthProvider>
        <GuidedTourProvider>
          <GrowProvider>
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
                                  <PortfolioProvider>
                                    <ErrorBoundary>
                                      <LeaderboardProvider>
                                        <ErrorBoundary>
                                          <NotificationProvider>
                                    <div className="min-h-screen bg-white relative">
                                      {useDesktopView ? (
                                        <main className="app-main">
                                          <Outlet />
                                        </main>
                                      ) : (
                                        <>
                                          <div className="hidden md:flex md:items-center md:justify-center md:h-screen md:bg-[#0a0a0a]">
                                            <div id="mobile-preview-container" className="relative w-full max-w-[390px] h-full max-h-[99vh] shadow-2xl overflow-hidden">
                                              <main
                                                className={`app-main h-full overflow-y-auto ${hasBottomNav ? "with-bottom-nav" : ""}`}
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
                                      </LeaderboardProvider>
                                    </ErrorBoundary>
                                  </PortfolioProvider>
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
          </GrowProvider>
        </GuidedTourProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
