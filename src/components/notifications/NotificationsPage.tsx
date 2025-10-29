import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Info } from "lucide-react";
import { EmptyState } from "@/components/general/EmptyState";

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8">
        <button
          onClick={handleBackClick}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ChevronLeft color="#C7EF6B" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-white">Notifications</h1>
        </div>
        <div className="w-8"></div> {/* Spacer for centering */}
      </div>

      {/* Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 mb-32">
        <EmptyState
          icon={Info}
          iconColor="#86B3F7"
          iconBgColor="#2a2a2a"
          title="No notifications yet."
          description="You'll see notifications here when you have activity on your account."
        />
      </div>
    </div>
  );
};
