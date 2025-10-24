import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Camera,
  ChevronDown,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { state, logout, updateProfile, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    depositAddress: "",
    preferredCurrency: "USD",
    profileImage: "",
    dateOfBirth: "",
    country: "",
    state: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (state.isLoading) {
          // Wait for auth to finish loading
          return;
        }

        if (state.user) {
          setFormData({
            username: state.user.email ? state.user.email.split("@")[0] : "", // Use email prefix as username
            fullName: state.user.user_metadata?.full_name || "",
            depositAddress: state.user.user_metadata?.wallet_address || "",
            preferredCurrency: state.user.user_metadata?.fiat_type || "USD",
            profileImage: state.user.user_metadata?.img || "",
            dateOfBirth: state.user.user_metadata?.DOB || "",
            country: state.user.user_metadata?.country || "",
            state: state.user.user_metadata?.state || "",
          });
          setIsLoading(false);
        } else if (state.isAuthenticated) {
          // If authenticated but no user data, try to refresh
          await refreshUser();
          setIsLoading(false);
        } else {
          // Not authenticated, redirect to login
          navigate("/login");
        }
      } catch (error) {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [
    state.user,
    state.isAuthenticated,
    state.isLoading,
    refreshUser,
    navigate,
  ]);

  const handleBackClick = () => {
    navigate("/wallet");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveChanges = async () => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      const response = await updateProfile({
        full_name: formData.fullName,
        img: formData.profileImage,
        DOB: formData.dateOfBirth,
        country: formData.country,
        state: formData.state,
        fiat_type: formData.preferredCurrency,
      });

      if (response.success) {
        // Refresh user data to get updated information
        await refreshUser();
        // Show success message or navigate back
        navigate("/wallet");
      }
    } catch (error) {
      // Handle error silently or show user-friendly message
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      // Still navigate to home even if logout fails
      navigate("/");
    }
  };

  const handleUploadPhoto = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        handleInputChange("profileImage", imageUrl);
      }
    };
    input.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C7EF6B] mx-auto mb-4"></div>
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

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
      <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-[#1a1a1a] rounded-full border-2 border-[#2a2a2a] flex items-center justify-center mb-4 overflow-hidden">
            {formData.profileImage ? (
              <img
                src={formData.profileImage}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden"
                  );
                }}
              />
            ) : null}
            <div
              className={`w-full h-full bg-gradient-to-br from-[#C7EF6B] to-[#B8E55A] flex items-center justify-center ${formData.profileImage ? "hidden" : ""}`}
            >
              <span className="text-black text-4xl font-bold">
                {formData.fullName
                  ? formData.fullName.charAt(0).toUpperCase()
                  : formData.username.charAt(0).toUpperCase()}
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

          {/* Date of Birth */}
          <div>
            <label className="block text-gray-100 text-sm font-medium mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              className="w-full px-4 py-3 bg-[#121212] border border-[#121212] rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#C7EF6B] transition-colors"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-gray-100 text-sm font-medium mb-2">
              Country
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              placeholder="e.g., USA, Nigeria, UK"
              className="w-full px-4 py-3 bg-[#121212] border border-[#121212] rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#C7EF6B] transition-colors"
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-gray-100 text-sm font-medium mb-2">
              State/Province
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              placeholder="e.g., California, Lagos, London"
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
              readOnly
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-gray-400 cursor-not-allowed"
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
                <option value="NGN" className="text-gray-100 bg-[#121212]">
                  Naira (₦)
                </option>
                <option value="USD" className="text-gray-100 bg-[#121212]">
                  USD ($)
                </option>
                <option value="EUR" className="text-gray-100 bg-[#121212]">
                  EUR (€)
                </option>
                <option value="GBP" className="text-gray-100 bg-[#121212]">
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
            disabled={isSaving}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
              isSaving
                ? "bg-[#636363] text-white cursor-not-allowed"
                : "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
            }`}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Sign Out Button */}
        <div className="mt-6">
          <button
            onClick={handleSignOut}
            className="w-full text-red-500 flex items-center justify-center space-x-2 hover:text-red-400 transition-colors py-2 border-t pt-6 border-gray-800"
          >
            <ArrowRight size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
