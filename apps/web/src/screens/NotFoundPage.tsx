/**
 * 404 Not Found Page
 * Shows an empty state with icon, message, and button to return
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFoundPage() {
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
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6">
      <div className="text-center max-w-md w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Large circle background */}
            <div className="w-24 h-24 bg-[#1a1a1a] rounded-full flex items-center justify-center border-2 border-[#2a2a2a]">
              {/* 404 text */}
              <span className="text-3xl font-bold text-[#C7EF6B]">404</span>
            </div>
            {/* Decorative rings */}
            <div className="absolute -top-2 -right-2 w-6 h-6 border-2 border-[#C7EF6B]/30 rounded-full"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 border-2 border-[#C7EF6B]/20 rounded-full"></div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-400 text-base mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleGoBack}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-lg font-medium hover:bg-[#2a2a2a] transition-colors"
          >
            Return Back
          </button>
        </div>
      </div>
    </div>
  );
}
