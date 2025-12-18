import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  description: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  iconColor = "#86B3F7",
  iconBgColor = "#2a2a2a",
  title,
  description,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 py-12 ${className}`}
    >
      {/* Icon */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: iconBgColor }}
      >
        <Icon size={24} color={iconColor} />
      </div>

      {/* Title and Description */}
      <div className="text-center">
        <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
        <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
          {description}
        </p>
      </div>
    </div>
  );
};

