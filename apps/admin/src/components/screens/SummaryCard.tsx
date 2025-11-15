import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

type CardColor = "green" | "blue" | "lime" | "orange" | "default";

interface SummaryCardProps {
  title: string;
  subtitle?: string;
  value: string | null;
  indicator?: {
    value: string;
    isPositive?: boolean;
  };
  isLoading?: boolean;
  color?: CardColor;
}

const getCardStyles = (color: CardColor = "default") => {
  const colorMap = {
    green: "bg-[#235538]",
    blue: "bg-[#86B3F7]",
    lime: "bg-[#C7EF6B]",
    orange: "bg-[#FFB52E]",
    default: "bg-white",
  };
  return colorMap[color];
};

const getTextColor = (color: CardColor = "default") => {
  if (color === "lime" || color === "orange") {
    return "text-[#060E0A]";
  }
  if (color === "default") {
    return "text-gray-900";
  }
  return "text-white";
};

const getSubtitleColor = (color: CardColor = "default") => {
  if (color === "lime" || color === "orange") {
    return "text-[#060E0A]/80";
  }
  if (color === "default") {
    return "text-gray-500";
  }
  return "text-white/90";
};

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  subtitle,
  value,
  indicator,
  isLoading = false,
  color = "default",
}) => {
  return (
    <Card className={getCardStyles(color)}>
      <CardContent className="relative p-3 sm:p-4">
        {/* Title and Subtitle - Top Left */}
        <div className="mb-2">
          <h3 className={`text-sm font-semibold mb-0.5 ${getTextColor(color)}`}>{title}</h3>
          {subtitle && (
            <p className={`text-xs ${getSubtitleColor(color)}`}>{subtitle}</p>
          )}
        </div>

        {/* Main Figure - Bottom Left */}
        <div className="mt-4">
          {isLoading ? (
            <Skeleton className="h-7 w-32" />
          ) : (
            <p className={`text-xl sm:text-2xl font-bold ${getTextColor(color)}`}>{value || "-"}</p>
          )}
        </div>

        {/* Indicator - Bottom Right - Only show if real trend data is provided */}
        {indicator && indicator.value && !isLoading && (
          <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex items-center gap-1">
            {indicator.isPositive !== false ? (
              <TrendingUp className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-red-600" />
            )}
            <span
              className={`text-xs font-medium ${
                indicator.isPositive !== false
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {indicator.value}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const SummaryCardSkeleton: React.FC<{ color?: CardColor }> = ({ color = "default" }) => {
  const skeletonBgColor = color === "lime" || color === "orange" 
    ? "bg-[#060E0A]/20" 
    : color === "default"
    ? "bg-gray-200"
    : "bg-white/20";
    
  return (
    <Card className={getCardStyles(color)}>
      <CardContent className="p-3 sm:p-4 relative">
        <Skeleton className={`h-4 w-24 mb-0.5 ${skeletonBgColor}`} />
        <Skeleton className={`h-3 w-32 mb-2 ${skeletonBgColor}`} />
        <Skeleton className={`h-7 w-32 mt-2 ${skeletonBgColor}`} />
      </CardContent>
    </Card>
  );
};


