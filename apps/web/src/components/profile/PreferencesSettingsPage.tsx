import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Banknote,
  ArrowLeft,
  Check,
  LoaderCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "../general/LoadingSpinner";
import { BottomNavigation } from "../general/BottomNavigation";
import { ErrorDrawer } from "@/components/general/ErrorDrawer";
import { SettingsSuccessDrawer } from "@/components/general/SettingsSuccessDrawer";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const rowClass =
  "flex w-full items-center rounded-xl bg-[#2a2a2a] px-4 py-4 text-left";

export const PreferencesSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, refreshUser, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCurrencyDrawer, setShowCurrencyDrawer] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<"NGN" | "USD">(
    "NGN",
  );
  const [errorDrawer, setErrorDrawer] = useState({
    isOpen: false,
    message: "",
  });
  const [successDrawer, setSuccessDrawer] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (state.isLoading) return;

        if (state.user) {
          const userCurrency = (state.user.fiat_type || "NGN").toUpperCase();
          setSelectedCurrency(userCurrency === "USD" ? "USD" : "NGN");
          setIsLoading(false);
        } else if (state.isAuthenticated) {
          await refreshUser();
          setIsLoading(false);
        } else {
          navigate("/login");
        }
      } catch {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [state.user, state.isAuthenticated, state.isLoading, refreshUser, navigate]);

  if (isLoading) {
    return <LoadingSpinner message="Loading preferences..." />;
  }

  const handleCurrencyUpdate = async (currency: "NGN" | "USD") => {
    if (currency === selectedCurrency) return;

    try {
      setSaving(true);
      const response = await updateProfile({
        fiat_type: currency,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to update currency");
      }

      setSelectedCurrency(currency);
      await refreshUser();
      setSuccessDrawer(true);
    } catch (error) {
      setErrorDrawer({
        isOpen: true,
        message:
          error instanceof Error ? error.message : "Failed to update currency",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="h-10 w-10 rounded-full bg-[#2a2a2a] flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>

        <h1 className="text-lg font-medium text-white">Preferences</h1>

        <div className="w-8 h-8" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-3 scrollbar-hide">
        <button className={rowClass} onClick={() => setShowCurrencyDrawer(true)}>
          <Banknote size={20} className="text-[#27bde6]" strokeWidth={2.1} />
          <div className="ml-4">
            <p className="text-base font-medium">Display Currency</p>
            <p className="text-sm text-[#c4cdc9]">
              {selectedCurrency === "NGN" ? "Nigerian Naira" : "US Dollar"}
            </p>
          </div>
        </button>
      </div>

      <BottomNavigation currentPath="/wallet" />

      <Drawer open={showCurrencyDrawer} onOpenChange={setShowCurrencyDrawer}>
        <DrawerContent className="bg-[#050505] border-[#505050]">
          <DrawerHeader>
            <DrawerTitle className="text-base font-medium text-white text-left">
              Display currency
            </DrawerTitle>
          </DrawerHeader>

          <div className="space-y-3 mt-3">
            <button
              onClick={() => handleCurrencyUpdate("NGN")}
              disabled={saving}
              className="flex w-full items-center justify-between rounded-xl bg-[#2a2a2a] px-4 py-3 text-left disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <img src="/ng_flag.png" alt="NGN flag" className="h-5 w-5 rounded-full" />
                <div>
                  <p className="text-base font-medium text-white">NGN</p>
                  <p className="text-sm text-white/60">Use Naira as display currency</p>
                </div>
              </div>
              {selectedCurrency === "NGN" && (
                <Check size={18} className="text-[#C7EF6B]" />
              )}
            </button>

            <button
              onClick={() => handleCurrencyUpdate("USD")}
              disabled={saving}
              className="flex w-full items-center justify-between rounded-xl bg-[#2a2a2a] px-4 py-3 text-left disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <img src="/us_flag.png" alt="USD flag" className="h-5 w-5 rounded-full" />
                <div>
                  <p className="text-base font-medium text-white">USD</p>
                  <p className="text-sm text-white/60">Use Dollar as display currency</p>
                </div>
              </div>
              {selectedCurrency === "USD" ? (
                <Check size={18} className="text-[#C7EF6B]" />
              ) : null}
            </button>

            {saving ? (
              <div className="flex items-center gap-2 text-sm text-white/70">
                <LoaderCircle size={15} className="animate-spin" />
                Updating preferences...
              </div>
            ) : null}
          </div>
        </DrawerContent>
      </Drawer>

      <SettingsSuccessDrawer
        isOpen={successDrawer}
        onClose={() => {
          setSuccessDrawer(false);
          setShowCurrencyDrawer(false);
        }}
        title="Preference updated"
        message="Display currency updated."
      />

      <ErrorDrawer
        isOpen={errorDrawer.isOpen}
        onClose={() => setErrorDrawer({ isOpen: false, message: "" })}
        message={errorDrawer.message}
      />
    </div>
  );
};
