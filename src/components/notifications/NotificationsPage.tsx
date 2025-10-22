import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Info } from "lucide-react";

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/wallet");
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
        {/* Info Icon */}
        <div className="w-16 h-16 bg-[#2a2a2a] rounded-full flex items-center justify-center mb-6">
          <Info size={24} color="#86B3F7" />
        </div>

        {/* No Notifications Message */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-3">
            No notifications yet.
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            You'll see notifications here when you have activity on your
            account.
          </p>
        </div>
      </div>
    </div>
  );
};
