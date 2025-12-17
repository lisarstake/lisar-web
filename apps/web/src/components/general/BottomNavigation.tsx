import {
  Calculator,
  CircleDollarSign,
  LayoutGrid,
  TvMinimalPlay,
  Wallet2,
} from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";

interface BottomNavigationProps {
  currentPath?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentPath,
}) => {
  const location = useLocation();
  const isActive = (path: string) => {
    if (currentPath) return currentPath === path;
    return location.pathname === path;
  };

  return (
    <div className="fixed md:absolute bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#2a2a2a] px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        {/* Home */}
        <Link
          to="/wallet"
          data-tour="nav-wallet"
          className={`flex flex-col items-center py-2 px-3 ${
            isActive("/wallet") ? "text-[#C7EF6B]" : "text-gray-400"
          }`}
        >
          <Wallet2 size={22} className="mb-1" />

          <span className="text-xs">Wallet</span>
          {isActive("/wallet") && (
            <div className="w-6 h-0.5 bg-[#C7EF6B] mt-1 rounded-full"></div>
          )}
        </Link>


        {/* Forecast */}
        <Link
          to="/forecast"
          data-tour="nav-forecast"
          className={`flex flex-col items-center py-2 px-3 ${
            isActive("/forecast") ? "text-[#C7EF6B]" : "text-gray-400"
          }`}
        >
          <Calculator size={22} className="mb-1" />
          <span className="text-xs">Yield</span>
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


        {/* Earn */}
        <Link
          to="/earn"
          data-tour="nav-earn"
          className={`flex flex-col items-center py-2 px-3 ${
            isActive("/earn") ? "text-[#C7EF6B]" : "text-gray-400"
          }`}
        >
          <CircleDollarSign size={22} className="mb-1" />
          <span className="text-xs">Earn</span>
          {isActive("/earn") && (
            <div className="w-6 h-0.5 bg-[#C7EF6B] mt-1 rounded-full"></div>
          )}
        </Link>
      </div>
    </div>
  );
};
