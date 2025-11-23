/**
 * 404 Not Found Page
 * Shows an empty state with icon, message, and button to return
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-6">
      <div className="text-center max-w-md w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Large circle background */}
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border-2 border-gray-200">
              {/* 404 text */}
              <span className="text-base font-bold text-[#235538]">404</span>
            </div>
            {/* Decorative rings */}
            <div className="absolute -top-2 -right-2 w-6 h-6 border-2 border-[#235538]/30 rounded-full"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 border-2 border-[#235538]/20 rounded-full"></div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-base md:text-lg font-bold text-gray-900 mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-600 text-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleGoBack}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Go Back</span>
          </button>
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#235538] text-white rounded-lg font-medium hover:bg-[#1a3d2a] transition-colors"
          >
            <Home size={18} />
            <span>Go Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

