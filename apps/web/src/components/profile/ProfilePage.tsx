import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Users,
  MessagesSquare,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth";
import { LoadingSpinner } from "../general/LoadingSpinner";
import { LisarLines } from "../general/lisar-lines";

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { state, logout, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    profileImage: "",
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (state.isLoading) {
          return;
        }

        if (state.user) {
          setFormData({
            fullName: state.user.full_name || "",
            username: state.user.username || "",
            profileImage: state.user.img || "",
          });
          setIsLoading(false);
        } else if (state.isAuthenticated) {
          await refreshUser();
          setIsLoading(false);
        } else {
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

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      navigate("/");
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
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={handleBackClick}
          className="w-10 h-10 bg-[#13170a] rounded-full flex items-center justify-center"
          aria-label="Close"
        >
          <ArrowLeft size={22} />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-8">
          <div
            onClick={handleUploadPhoto}
            className="w-18 h-18 bg-[#1a1a1a] rounded-full border-2 border-[#2a2a2a] flex items-center justify-center mb-3 overflow-hidden cursor-pointer"
          >
            {formData.profileImage ? (
              <img
                src={formData.profileImage}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden",
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
                  : "U"}
              </span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-white text-lg font-medium">
              {formData.fullName || "User"}
            </p>
            <button className="text-white text-sm bg-[#13170a] px-4 py-1 rounded-full">
              @{formData.username || "username"}
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 gap-5 mb-6">
          {/* Join Tribe */}
          <a
            href="https://x.com/lisarstake"
            target="_blank"
            rel="noopener noreferrer"
            className="h-38 rounded-2xl p-4 bg-[#D8F6B1] text-black flex flex-col justify-between"
          >
            <Users size={30} />

            <div>
              <p className="font-semibold text-sm">Join Lisar Tribe</p>
              <p className="text-xs text-black/70">For exclusive updates</p>
            </div>
          </a>

          {/* Need Help */}
          <a
            href="https://t.me/+F0YXOMaiJMxkODVk"
            target="_blank"
            rel="noopener noreferrer"
            className="h-38 rounded-2xl p-4 bg-[#1b1b1b] text-white flex flex-col justify-between relative overflow-hidden"
          >
            <LisarLines position="top-right" className="" width="140px" height="140px" />

            <MessagesSquare size={30} />

            <div>
              <p className="font-semibold text-sm">Need help?</p>
              <p className="text-xs text-gray-400">Chat with us</p>
            </div>
          </a>
        </div>

        {/* Settings Section */}
        <div className="space-y-3">
          {/* Account */}
          <div
            onClick={() => navigate("/settings/account")}
            className="bg-[#13170a] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#171717] transition"
          >
            <div>
              <p className="text-white font-medium">Account</p>
              <p className="text-gray-400 text-sm">
                Personal details, invite friends, account limits
              </p>
            </div>
            <ChevronLeft className="rotate-180 " size={18} />
          </div>

          {/* Recipients */}
          <div onClick={() => navigate("/settings/recipients")} className="bg-[#13170a] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#171717] transition">
            <div >
              <p className="text-white font-medium">Recipients</p>
              <p className="text-gray-400 text-sm">
                Bank accounts, Mobile money
              </p>
            </div>
            <ChevronLeft className="rotate-180 " size={18} />
          </div>

          {/* Security */}
          <div
            onClick={() => navigate("/settings/security")}
            className="bg-[#13170a] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#171717] transition"
          >
            <div>
              <p className="text-white font-medium">Security</p>
              <p className="text-gray-400 text-sm">
                2FA, app lock, passcode, biometrics
              </p>
            </div>
            <ChevronLeft className="rotate-180 " size={18} />
          </div>

          {/* Preferences */}
          <div
            onClick={() => navigate("/settings/preferences")}
            className="bg-[#13170a] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#171717] transition"
          >
            <div>
              <p className="text-white font-medium">Preferences</p>
              <p className="text-gray-400 text-sm">
                Notifications, display currency & app themes
              </p>
            </div>
            <ChevronLeft className="rotate-180" size={18} />
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="mt-6">
          <button
            onClick={handleSignOut}
            className="w-full text-red-400 flex items-center justify-center space-x-2 hover:text-red-400 transition-colors py-2 border-t pt-4 border-[#13170a]"
          >
            <Users size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
