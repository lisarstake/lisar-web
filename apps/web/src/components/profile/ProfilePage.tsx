import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  Camera,
  ChevronDown,
  ArrowRight,
  CircleArrowOutUpRight,
  Copy,
  Check,
} from "lucide-react";
import { SuccessDrawer } from "../ui/SuccessDrawer";
import { ErrorDrawer } from "../ui/ErrorDrawer";
import { ExportWalletDrawer } from "../general/ExportWalletDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth";
import { LoadingSpinner } from "../general/LoadingSpinner";

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, logout, updateProfile, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    // username: "",
    fullName: "",
    depositAddress: "",
    preferredCurrency: "USD",
    profileImage: "",
    dateOfBirth: "",
    country: "",
    state: "",
    is_totp_enabled: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showExportDrawer, setShowExportDrawer] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const [isHoveringCopy, setIsHoveringCopy] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (state.isLoading) {
          return;
        }

        if (state.user) {
          setFormData({
            // username: state.user.username || "",
            fullName: state.user.full_name || "",
            depositAddress: state.user.wallet_address || "",
            preferredCurrency: state.user.fiat_type || "USD",
            profileImage: state.user.img || "",
            dateOfBirth: state.user.DOB || "",
            country: state.user.country || "",
            state: state.user.state || "",
            is_totp_enabled: state.user.is_totp_enabled || false,
          });
          setIsLoading(false);
        } else if (state.isAuthenticated) {
          // If authenticated but no user data, refresh
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
    navigate(-1);
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
        // username: formData.username,
        DOB: formData.dateOfBirth,
        country: formData.country,
        state: formData.state,
        fiat_type: formData.preferredCurrency,
      });

      if (response.success) {
        setShowSuccessDrawer(true);
        await refreshUser();
      } else {
        setErrorMessage(
          response.message || "Failed to update profile. Please try again."
        );
        setShowErrorDrawer(true);
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.";
      setErrorMessage(errorMsg);
      setShowErrorDrawer(true);
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

  const handleCopyAddress = async () => {
    if (!formData.depositAddress) return;

    try {
      await navigator.clipboard.writeText(formData.depositAddress);
      setAddressCopied(true);
      setTimeout(() => {
        setAddressCopied(false);
      }, 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = formData.depositAddress;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setAddressCopied(true);
        setTimeout(() => {
          setAddressCopied(false);
        }, 2000);
      } catch (err) {
        // Copy failed - silent fail
      }
      document.body.removeChild(textArea);
    }
  };

  const handleUploadPhoto = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          setIsUploadingImage(true);
          const response = await authService.uploadProfileImage(file);

          if (response.success && response.data) {
            handleInputChange("profileImage", response.data.imageUrl);
          } else {
            setErrorMessage(response.message || "Failed to upload image");
            setShowErrorDrawer(true);
          }
        } catch (error) {
          const errorMsg =
            error instanceof Error
              ? error.message
              : "An unexpected error occurred";
          setErrorMessage(errorMsg);
          setShowErrorDrawer(true);
        } finally {
          setIsUploadingImage(false);
        }
      }
    };
    input.click();
  };

  if (isLoading) {
    return <LoadingSpinner message="Setting up authenticator..." />;
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
        <button
          onClick={() => setShowExportDrawer(true)}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
          aria-label="Help & Export"
        >
          <CircleArrowOutUpRight color="#86B3F7" size={16} />
        </button>
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
                  : "User"}
              </span>
            </div>
          </div>

          <button
            onClick={handleUploadPhoto}
            disabled={isUploadingImage}
            className={`bg-[#C7EF6B] text-black px-3 py-1.5 rounded-full font-medium flex items-center space-x-2 hover:bg-[#B8E55A] transition-colors ${
              isUploadingImage ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Camera size={16} />
            <span>{isUploadingImage ? "Uploading..." : "Upload"}</span>
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Username */}
          {/* <div>
            <label className="block text-gray-100 text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              className="w-full px-4 py-3 bg-[#121212] border border-[#121212] rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#C7EF6B] transition-colors"
            />
          </div> */}

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
            <div className="relative">
              <input
                type="text"
                value={formData.depositAddress}
                readOnly
                className="w-full px-4 py-3 pr-12 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-gray-400 cursor-not-allowed"
              />
              <button
                onClick={handleCopyAddress}
                onMouseEnter={() => setIsHoveringCopy(true)}
                onMouseLeave={() => setIsHoveringCopy(false)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-[#2a2a2a] rounded transition-all"
                aria-label="Copy address"
              >
                {addressCopied ? (
                  <Check size={18} color="#C7EF6B" className="transition-all" />
                ) : (
                  <Copy
                    size={18}
                    color={isHoveringCopy ? "#C7EF6B" : "#636363"}
                    className="transition-all"
                  />
                )}
              </button>
            </div>
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

            {/* 2 FA Status  */}
            {!formData.is_totp_enabled && (
              <div
                onClick={() => navigate("/setup-otp")}
                className="text-[#C7EF6B] text-[13px] font-normal my-3 cursor-pointer hover:underline"
              >
                2 factor authentication is not setup. Click to setup 2FA to make
                your account more secure.
              </div>
            )}
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
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
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

      {/* Success Drawer */}
      <SuccessDrawer
        isOpen={showSuccessDrawer}
        onClose={() => setShowSuccessDrawer(false)}
        title="Profile Updated!"
        message="Your profile has been successfully updated."
        onAction={() => setShowSuccessDrawer(false)}
        actionText="Continue"
      />

      {/* Error Drawer */}
      <ErrorDrawer
        isOpen={showErrorDrawer}
        onClose={() => setShowErrorDrawer(false)}
        title="Something went wrong"
        message={errorMessage}
        details="Please check your connection and try again. If the problem persists, contact support."
      />

      {/* Export Wallet Drawer */}
      <ExportWalletDrawer
        isOpen={showExportDrawer}
        onClose={() => setShowExportDrawer(false)}
      />
    </div>
  );
};
