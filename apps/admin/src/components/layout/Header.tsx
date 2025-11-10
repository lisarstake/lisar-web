import React from "react";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const user = state.user;

  const displayName = user?.email?.split("@")[0] || "Admin";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("");

  return (
    <div className="h-17 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
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
        <button
          onClick={() => navigate("/admin")}
          className="hidden sm:flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-gray-200 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <Avatar className="w-8 h-8">
            {null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </div>
    </div>
  );
};
