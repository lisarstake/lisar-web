import React from "react";
import { Search, Bell, ChevronDown, Menu } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { state } = useAuth();
  const user = state.user;

  const displayName = user?.email?.split("@")[0] || "Admin";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("");

  return (
    <div className="h-16 lg:h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
      {/* Left: Menu + Welcome */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-base lg:text-lg font-medium text-gray-800">
            Welcome back, {displayName.split(" ")[0]}!
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 lg:gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Search className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
          <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="hidden sm:flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-gray-200">
          <Avatar className="w-8 h-8">
            {null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col">
            <span className="text-xs lg:text-sm font-medium text-gray-900">
              {displayName}
            </span>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

