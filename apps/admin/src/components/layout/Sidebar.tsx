import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  CheckCircle2,
  Activity,
  CircleUser,
  LogOut,
  Settings,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    label: "Overview",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    path: "/users",
    icon: Users,
  },
  {
    label: "Transactions",
    path: "/transactions",
    icon: CreditCard,
  },
  {
    label: "Validators",
    path: "/validators",
    icon: CheckCircle2,
  },
  {
    label: "Publications",
    path: "/publications",
    icon: FileText,
  },
  {
    label: "Health",
    path: "/health",
    icon: Activity,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

const toolsItems = [
  {
    label: "Admin",
    path: "/admin",
    icon: CircleUser,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-300 ease-in-out",
          "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <img src="/Logo.svg" alt="Lisar" className="h-4" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 lg:py-6">
          <div className="px-2 lg:px-4 space-y-1.5 lg:space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    // Close sidebar on mobile when navigating
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-[#235538] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm lg:text-base">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Tools Section */}
          {/* <div className="mt-6 lg:mt-8 px-2 lg:px-4">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Tools
            </h3>
            <div className="space-y-1">
              {toolsItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-black text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm lg:text-base">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div> */}
        </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-colors text-red-600 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <LogOut className="w-5 h-5 text-red-600" />
          <span className="font-medium text-sm lg:text-base">Log out</span>
        </button>
      </div>
      </div>
    </>
  );
};
