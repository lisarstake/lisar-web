import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Camera,
  ChevronDown,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { Button } from "../ui/button";

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "winnernwakaku123",
    fullName: "winnernwakaku123",
    depositAddress: "0x2E5F9807E033b669dDd4BObE1F1A3F959C02",
    preferredCurrency: "Naira (₦)",
  });

  const handleBackClick = () => {
    navigate("/wallet");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveChanges = () => {
    // Handle save logic here
    // You could show a success message or navigate back
  };

  const handleSignOut = () => {
    // Handle sign out logic here
    navigate("/");
  };

  const handleUploadPhoto = () => {
    // Handle photo upload logic here
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8">
        <button
          onClick={handleBackClick}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ChevronLeft color="#C7EF6B" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-100">User Profile</h1>
          
        </div>
        <div className="w-8"></div> {/* Spacer for centering */}
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-[#1a1a1a] rounded-full border-2 border-[#2a2a2a] flex items-center justify-center mb-4 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-[#C7EF6B] to-[#B8E55A] flex items-center justify-center">
              <span className="text-black text-4xl font-bold">
                {formData.username.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          <button
            onClick={handleUploadPhoto}
            className="bg-[#C7EF6B] text-black px-3 py-1.5 rounded-full font-medium flex items-center space-x-2 hover:bg-[#B8E55A] transition-colors"
          >
            <Camera size={16} />
            <span>Upload</span>
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-gray-100 text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              className="w-full px-4 py-3 bg-[#121212] border border-[#121212] rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#C7EF6B] transition-colors"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-gray-100 text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className="w-full px-4 py-3 bg-[#121212] border border-[#121212] rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#C7EF6B] transition-colors"
            />
          </div>

          {/* Deposit Address */}
          <div>
            <label className="block text-gray-100 text-sm font-medium mb-2">
              Deposit Address
            </label>
            <input
              type="text"
              value={formData.depositAddress}
              onChange={(e) =>
                handleInputChange("depositAddress", e.target.value)
              }
              className="w-full px-4 py-3 bg-[#121212] border border-[#121212] rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#C7EF6B] transition-colors"
            />
          </div>

          {/* Preferred Currency */}
          <div>
            <label className="block text-gray-100 text-sm font-medium mb-2">
              Preferred Currency
            </label>
            <div className="relative">
              <select
                value={formData.preferredCurrency}
                onChange={(e) =>
                  handleInputChange("preferredCurrency", e.target.value)
                }
                className="w-full px-4 py-3 bg-[#121212] border border-[#121212] rounded-lg text-gray-100 focus:outline-none focus:border-[#C7EF6B] transition-colors appearance-none"
              >
                <option value="Naira (₦)" className="text-gray-100 bg-[#121212]">
                  Naira (₦)
                </option>
                <option value="USD ($)" className="text-gray-100 bg-[#121212]">
                  USD ($)
                </option>
                <option value="EUR (€)" className="text-gray-100 bg-[#121212]">
                  EUR (€)
                </option>
                <option value="GBP (£)" className="text-gray-100 bg-[#121212]">
                  GBP (£)
                </option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="mt-8">
          <button
            onClick={handleSaveChanges}
            className="w-full bg-[#C7EF6B] text-black py-3 px-6 rounded-lg font-semibold text-lg hover:bg-[#B8E55A] transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Fixed Sign Out Button at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#050505] border-t border-[#2a2a2a] px-6 py-4">
        <button
          onClick={handleSignOut}
          className="w-full text-red-500 flex items-center justify-center space-x-2 hover:text-red-400 transition-colors py-2"
        >
          <ArrowRight size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
