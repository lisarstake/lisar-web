import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./button";
import { Calculator, Wallet, BadgeCent, Blocks } from "lucide-react";

const LIVEPEER_GRADIENT = "linear-gradient(135deg, #006400 0%, #00EB88 100%)";
const LIVEPEER_GREEN = "#006400";
const ACTION_BUTTONS_HEIGHT = 95;

const actions = [
  {
    label: "Wallet",
    icon: (isActive: boolean) => (
      <Wallet
        className={`w-4 h-4 ${isActive ? "text-white" : "text-[#006400]"}`}
      />
    ),
    path: "/wallet",
  },
  {
    label: "Apps",
    icon: (isActive: boolean) => (
      <Blocks
        className={`w-4 h-4 ${isActive ? "text-white" : "text-[#006400]"}`}
      />
    ),
    path: "/apps",
  },
  // {
  //   label: "Fund",
  //   icon: (isActive: boolean) => (
  //     <Plus
  //       className={`w-4 h-4 ${isActive ? "text-white" : "text-[#006400]"}`}
  //     />
  //   ),
  //   path: "/funding",
  //   // isPrimary: true,
  // },
  {
    label: "Calculator",
    icon: (isActive: boolean) => (
      <Calculator
        className={`w-4 h-4 ${isActive ? "text-white" : "text-[#006400]"}`}
      />
    ),
    path: "/calculator",
  },
  {
    label: "Earn",
    icon: (isActive: boolean) => (
      <BadgeCent
        className={`w-4 h-4 ${isActive ? "text-white" : "text-[#006400]"}`}
      />
    ),
    path: "/earn",
  },
];

const ActionButtons: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div
      className="fixed left-0 right-0 bottom-0 z-20 bg-white"
      style={{
        boxShadow: "none",
        height: `${ACTION_BUTTONS_HEIGHT}px`,
      }}
    >
      <div
        className="w-full overflow-x-auto"
        style={{
          // Hide scrollbars for all browsers
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE 10+
        }}
      >
        <style>
          {`
            /* Hide scrollbar for Chrome, Safari and Opera */
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        <div
          className="flex gap-2 w-full h-[88px] px-2.5 items-center justify-between"
          style={{
            overflowX: "hidden",
            overflowY: "hidden",
          }}
        >
          {actions.map((action) => {
            const isActive = location.pathname.startsWith(action.path);
            // const isPrimary = action.isPrimary;
            return (
              <div
                key={action.path}
                className="relative flex flex-col items-center justify-end flex-1"
                style={{ height: "80px" }}
              >
                <Button
                  className={`group flex flex-col items-center justify-center gap-1.5 rounded-2xl w-full transition-all duration-300 relative overflow-visible ${
                    isActive
                      ? "bg-[#006400] text-white scale-[1]"
                      : "bg-white text-[#006400] hover:scale-[1.01]"
                  }`}
                  style={{
                    border: "none",
                    flex: "0 0 70px",
                    height: "0px",
                    background: isActive ? LIVEPEER_GRADIENT : "white",
                    color: isActive ? "white" : LIVEPEER_GREEN,
                    boxShadow: "none",
                    padding: "0",
                  }}
                  onClick={() => navigate(action.path)}
                  aria-label={action.label}
                >
                  <div className="rounded-lg flex items-center justify-center">
                    {action.icon(Boolean(isActive))}
                  </div>
                  <span className="text-[11px] font-medium mt-0.5">
                    {action.label}
                  </span>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;
