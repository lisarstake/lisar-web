import { Outlet, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrchestratorProvider } from "@/contexts/OrchestratorContext";

export default function App() {
  const location = useLocation();

  const isLandingPage = location.pathname === "/";

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
      <OrchestratorProvider>
        <div className="min-h-screen bg-white">
          {isLandingPage ? (
            <main className="app-main">
              <Outlet />
            </main>
          ) : (
            <>
              {/* Desktop: Center mobile-like UI */}
              <div className="hidden md:flex md:items-center md:justify-center md:h-screen md:bg-[#0a0a0a]">
                <div className="relative w-full max-w-[390px] h-full max-h-[99vh] shadow-2xl overflow-hidden">
                  <main
                    className={`app-main h-full overflow-y-auto ${hasBottomNav ? "with-bottom-nav" : ""}`}
                  >
                    <Outlet />
                  </main>
                </div>
              </div>

              {/* Mobile: Full width */}
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
      </OrchestratorProvider>
    </AuthProvider>
  );
}
