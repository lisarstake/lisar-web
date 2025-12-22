/**
 * Dashboard Header Component
 */

import React from "react";
import { useNavigate } from "react-router-dom";

export const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-[#181818] border-b border-[#2a2a2a]">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img
              src="/Logo2.svg"
              alt="Lisar Logo"
              className="h-5 md:h-6 w-auto"
            />
          </div>

          {/* Launch App Button */}
          <button
            onClick={() => navigate("/login")}
            className="bg-[#C7EF6B] text-black p-2 md:p-3 rounded-md text-sm font-medium hover:bg-[#B8E55A] transition-colors"
          >
            Launch app
          </button>
        </div>
      </div>
    </header>
  );
};

