import * as React from "react";

import { cn } from "@/lib/utils";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  centered?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = "top",
  centered = false,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionClasses = centered
    ? "-translate-x-1/2 mt-5 ml-3"
    : {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2",
      }[side];

  const tooltipStyle = centered
    ? {
        position: "fixed" as const,
        zIndex: 9999,
        maxWidth: "280px",
        textAlign: "center" as const,
      }
    : {};

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 whitespace-nowrap text-start rounded-md bg-[#1a1a1a] px-3 py-2 text-xs text-white shadow-lg",
            positionClasses,
          )}
          style={tooltipStyle}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export { Tooltip };
