import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrchestratorProvider } from "@/contexts/OrchestratorContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { TransactionProvider } from "@/contexts/TransactionContext";
import { DelegationProvider } from "@/contexts/DelegationContext";
import { LeaderboardProvider } from "@/contexts/LeaderboardContext";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

export default function App() {
  const location = useLocation();

  const useDesktopView =
    location.pathname === "/" || location.pathname === "/dashboard";

  const pagesWithBottomNav = [
    "/wallet",
    "/validator",
    "/portfolio",
    "/earn",
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
    <AuthProvider>
      <Toaster position="top-right" />
      <DashboardProvider>
        <OrchestratorProvider>
          <WalletProvider>
            <TransactionProvider>
              <DelegationProvider>
                <LeaderboardProvider>
                  <NotificationProvider>
                    <div className="min-h-screen bg-white">
                    {useDesktopView ? (
                      <main className="app-main">
                        <Outlet />
                      </main>
                    ) : (
                      <>
                        <div className="hidden md:flex md:items-center md:justify-center md:h-screen md:bg-[#0a0a0a]">
                          <div className="relative w-full max-w-[390px] h-full max-h-[99vh] shadow-2xl overflow-hidden">
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
                  </div>
                  </NotificationProvider>
                </LeaderboardProvider>
              </DelegationProvider>
            </TransactionProvider>
          </WalletProvider>
        </OrchestratorProvider>
      </DashboardProvider>
    </AuthProvider>
  );
}
