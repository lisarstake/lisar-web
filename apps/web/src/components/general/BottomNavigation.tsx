import {
  CircleDollarSign,
  House,
  TvMinimalPlay,
  ListMinus,
  CreditCard,
  Calculator,
  CircleEllipsis,
} from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useGrow } from "@/contexts/GrowContext";

interface BottomNavigationProps {
  currentPath?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentPath,
}) => {
  const location = useLocation();
  const { isInGrowMode } = useGrow();

  const getCurrentPath = () => {
    return currentPath || location.pathname;
  };

  const isActive = (path: string) => {
    const pathname = getCurrentPath();

    return pathname === path;
  };

  const isEarnPage = isInGrowMode;

  return (
    <div className="fixed md:absolute bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#2a2a2a] px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        {isEarnPage ? (
          <>
            {/* Home (Grow Page) */}
            <Link
              to="/grow"
              data-tour="nav-wallet"
              className={`flex flex-col items-center py-2 px-3 ${
                isActive("/grow") ? "text-[#C7EF6B]" : "text-gray-400"
              }`}
            >
              <House size={22} className="mb-1" />
              <span className="text-xs">Home</span>
              {isActive("/grow") && (
                <div className="w-6 h-0.5 bg-[#C7EF6B] mt-1 rounded-full"></div>
              )}
            </Link>

            {/* Yields */}
            <Link
              to="/forecast"
              data-tour="nav-yields"
              className={`flex flex-col items-center py-2 px-3 ${
                isActive("/forecast") ? "text-[#C7EF6B]" : "text-gray-400"
              }`}
            >
              <Calculator size={22} className="mb-1" />
              <span className="text-xs">Yields</span>
              {isActive("/forecast") && (
                <div className="w-6 h-0.5 bg-[#C7EF6B] mt-1 rounded-full"></div>
              )}
            </Link>

            {/* Learn */}
            <Link
              to="/learn"
              data-tour="nav-learn"
              className={`flex flex-col items-center py-2 px-3 ${
                isActive("/learn") ? "text-[#C7EF6B]" : "text-gray-400"
              }`}
            >
              <TvMinimalPlay size={22} className="mb-1" />
              <span className="text-xs">Learn</span>
              {isActive("/learn") && (
                <div className="w-6 h-0.5 bg-[#C7EF6B] mt-1 rounded-full"></div>
              )}
            </Link>

            {/* Account */}
            <Link
              to="/account"
              data-tour="nav-account"
              className={`flex flex-col items-center py-2 px-3 ${
                isActive("/account") ? "text-[#C7EF6B]" : "text-gray-400"
              }`}
            >
              <CircleEllipsis size={22} className="mb-1" />
              <span className="text-xs">More</span>
              {isActive("/account") && (
                <div className="w-6 h-0.5 bg-[#C7EF6B] mt-1 rounded-full"></div>
              )}
            </Link>
          </>
        ) : (
          <>
            {/* Home (AllWalletPage) */}
            <Link
              to="/wallet"
              data-tour="nav-wallet"
              className={`flex flex-col items-center py-2 px-3 ${
                isActive("/wallet") ? "text-[#C7EF6B]" : "text-gray-400"
              }`}
            >
              <House size={22} className="mb-1" />
              <span className="text-xs">Home</span>
              {isActive("/wallet") && (
                <div className="w-6 h-0.5 bg-[#C7EF6B] mt-1 rounded-full"></div>
              )}
            </Link>

         

            {/* Cards */}
            <Link
              to="/cards"
              data-tour="nav-cards"
              className={`flex flex-col items-center py-2 px-3 ${
                isActive("/cards") ? "text-[#C7EF6B]" : "text-gray-400"
              }`}
            >
              <CreditCard size={22} className="mb-1" />
              <span className="text-xs">Cards</span>
              {isActive("/cards") && (
                <div className="w-6 h-0.5 bg-[#C7EF6B] mt-1 rounded-full"></div>
              )}
            </Link>

               {/* Transfers */}
               <Link
              to="/history"
              data-tour="nav-transactions"
              className={`flex flex-col items-center py-2 px-3 ${
                isActive("/history") ? "text-[#C7EF6B]" : "text-gray-400"
              }`}
            >
              <ListMinus size={22} className="mb-1" />
              <span className="text-xs">Transfers</span>
              {isActive("/history") && (
                <div className="w-6 h-0.5 bg-[#C7EF6B] mt-1 rounded-full"></div>
              )}
            </Link>

            {/* Account */}
            <Link
              to="/account"
              data-tour="nav-account"
              className={`flex flex-col items-center py-2 px-3 ${
                isActive("/account") ? "text-[#C7EF6B]" : "text-gray-400"
              }`}
            >
              <CircleEllipsis size={22} className="mb-1" />
              <span className="text-xs">More</span>
              {isActive("/account") && (
                <div className="w-6 h-0.5 bg-[#C7EF6B] mt-1 rounded-full"></div>
              )}
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
