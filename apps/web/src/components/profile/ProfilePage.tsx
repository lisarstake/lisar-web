import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ArrowLeft,
  MessageCircleHeart,
  LogOut,
  LoaderCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth";
import { LoadingSpinner } from "../general/LoadingSpinner";
import { ErrorDrawer } from "../general/ErrorDrawer";
import { SettingsSuccessDrawer } from "@/components/general/SettingsSuccessDrawer";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { state, logout, refreshUser, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isClaimingUsername, setIsClaimingUsername] = useState(false);
  const [showClaimDrawer, setShowClaimDrawer] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
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

  const handleClaimUsername = async () => {
    const username = usernameInput.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      setErrorMessage(
        "Username must be 3-30 characters and contain only letters, numbers, and underscores.",
      );
      setShowErrorDrawer(true);
      return;
    }

    try {
      setIsClaimingUsername(true);
      const response = await updateProfile({ username });
      if (!response.success) {
        throw new Error(response.message || "Could not claim username");
      }
      await refreshUser();
      setShowClaimDrawer(false);
      setUsernameInput("");
      setShowSuccessDrawer(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not claim username",
      );
      setShowErrorDrawer(true);
    } finally {
      setIsClaimingUsername(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  const displayName = (() => {
    if (!formData.fullName) return "User";
  
    const parts = formData.fullName.trim().split(" ");
    if (parts.length <= 2) return formData.fullName;
  
    return `${parts[0]} ${parts[parts.length - 1]}`;
  })();

  const displayUsername = (state.user?.username || "").trim();
  const hasUsername = displayUsername.length > 0;

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex flex-col">
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={handleBackClick}
          className="w-10 h-10 bg-[#13170a] rounded-full flex items-center justify-center"
          aria-label="Close"
        >
          <ArrowLeft size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
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
              className={`w-full h-full bg-linear-to-br from-[#C7EF6B] to-[#B8E55A] flex items-center justify-center ${formData.profileImage ? "hidden" : ""}`}
            >
              <span className="text-black text-4xl font-bold">
                {formData.fullName
                  ? formData.fullName.charAt(0).toUpperCase()
                  : "U"}
              </span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-white text-lg font-medium">
              {displayName}
            </p>
            {hasUsername ? (
              <button className="text-white text-xs bg-[#13170a] px-4 py-1 rounded-full">
                @{displayUsername}
              </button>
            ) : (
              <button
                onClick={() => setShowClaimDrawer(true)}
                className="text-black text-xs bg-white/90 px-4 py-1 rounded-full font-medium"
              >
                Claim @tag
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 mb-6">
          <a
            href="https://t.me/+F0YXOMaiJMxkODVk"
            target="_blank"
            rel="noopener noreferrer"
            className="h-38 rounded-2xl p-4 bg-[#305757] flex flex-col justify-between relative overflow-hidden"
          >
            <MessageCircleHeart size={30} />

            <div>
              <p className="font-semibold text-sm ">Need help?</p>
              <p className="text-xs text-gray-300">Chat with us</p>
            </div>

            <img
              src="/support.png"
              alt="Support"
              className="absolute right-0 top-5 h-44 object-contain pointer-events-none"
            />
          </a>
        </div>

        <div className="space-y-3">
          <div
            onClick={() => navigate("/settings/account")}
            className="bg-[#13170a] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#171717] transition"
          >
            <div>
              <p className="text-white font-medium">Account</p>
              <p className="text-gray-400 text-sm">
                Personal details, invite friends
              </p>
            </div>
            <ChevronLeft className="rotate-180 " size={18} />
          </div>

          <div onClick={() => navigate("/settings/recipients")} className="bg-[#13170a] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#171717] transition">
            <div >
              <p className="text-white font-medium">Linked Account</p>
              <p className="text-gray-400 text-sm">
                linked bank account for withdrawal
              </p>
            </div>
            <ChevronLeft className="rotate-180 " size={18} />
          </div>

          <div
            onClick={() => navigate("/settings/security")}
            className="bg-[#13170a] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#171717] transition"
          >
            <div>
              <p className="text-white font-medium">Security</p>
              <p className="text-gray-400 text-sm">
                2 factor authentication, password reset
              </p>
            </div>
            <ChevronLeft className="rotate-180 " size={18} />
          </div>

          <div
            onClick={() => navigate("/settings/preferences")}
            className="bg-[#13170a] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#171717] transition"
          >
            <div>
              <p className="text-white font-medium">Preferences</p>
              <p className="text-gray-400 text-sm">
                Notifications, display currency
              </p>
            </div>
            <ChevronLeft className="rotate-180" size={18} />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSignOut}
            className="w-full text-red-400 text-sm flex items-center justify-center space-x-2 hover:text-red-400 transition-colors py-2 pt-4 border-[#13170a]"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <ErrorDrawer
        isOpen={showErrorDrawer}
        onClose={() => setShowErrorDrawer(false)}
        message={"Sorry something went wrong and couldn't claim tag, please try again"}
      />

      <SettingsSuccessDrawer
        isOpen={showSuccessDrawer}
        onClose={() => setShowSuccessDrawer(false)}
        title="Unique tag claimed"
        message="Your tag is active. Other users can now send you money via your tag!"
      />

      <Drawer open={showClaimDrawer} onOpenChange={setShowClaimDrawer}>
        <DrawerContent className="bg-[#050505] border-[#2a2a2a]">
          <DrawerHeader>
            <DrawerTitle className="text-left text-base font-medium text-white">
              Claim your Lisar tag
            </DrawerTitle>
          </DrawerHeader>
          <div className="space-y-4 pb-4 mt-1">
            <p className="text-sm text-white/70">
              Your tag is unique. Other Lisar users can send you money directly using your tag.
            </p>
            <div>
              <div className="flex items-center rounded-lg bg-[#13170a] px-4 py-3">
                <span className="text-white/60 text-base">@</span>
                <input
                  value={usernameInput}
                  onChange={(e) =>
                    setUsernameInput(
                      e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase(),
                    )
                  }
                  placeholder="yourtag"
                  className="ml-2 w-full bg-transparent text-base text-white outline-none"
                />
              </div>

            </div>
            <button
              onClick={handleClaimUsername}
              disabled={isClaimingUsername}
              className="py-3 w-full rounded-full bg-[#C7EF6B] text-base font-medium text-black disabled:opacity-60 mt-2"
            >
              {isClaimingUsername ? (
                <span className="inline-flex items-center gap-2">
                  <LoaderCircle size={15} className="animate-spin" />
                  Claiming..
                </span>
              ) : (
                "Claim tag"
              )}
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
