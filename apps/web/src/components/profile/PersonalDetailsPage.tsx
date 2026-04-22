import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorDrawer } from "@/components/general/ErrorDrawer";
import { SettingsSuccessDrawer } from "@/components/general/SettingsSuccessDrawer";
import { COUNTRIES } from "@/lib/countries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const PersonalDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateProfile, refreshUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);

  const hasLinkedAccount = !!state.user?.linked_account;

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate("/login");
      return;
    }

    if (state.user) {
      setFullName(state.user.full_name);
      setEmail(state.user.email || "");
      setDob(state.user.DOB || "");
      setCountry(state.user.country || "");
      setRegion(state.user.state || "");
    }
  }, [state.user, state.isAuthenticated, navigate]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      setErrorMessage("Full name is required.");
      setShowErrorDrawer(true);
      return;
    }

    try {
      setIsSaving(true);
      const response = await updateProfile({
        full_name: hasLinkedAccount ? undefined : fullName.trim(),
        DOB: dob.trim() || undefined,
        country: country.trim() || undefined,
        state: region.trim() || undefined,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to update details");
      }

      await refreshUser();
      setShowSuccessDrawer(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update details",
      );
      setShowErrorDrawer(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="h-10 w-10 rounded-full bg-[#151515] flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>
        <h1 className="text-lg font-medium text-white">Personal details</h1>
        <div className="w-8 h-8" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-4 scrollbar-hide mt-3">
        <div>
          <label className="mb-2 block text-sm text-white/70">Full name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            readOnly={hasLinkedAccount}
            className={`w-full rounded-lg bg-[#151515] px-4 py-3 text-base outline-none ${hasLinkedAccount ? "text-white/70" : "text-white"
              }`}
            placeholder="Enter full name"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">Email</label>
          <input
            value={email}
            readOnly
            className="w-full rounded-lg bg-[#151515] px-4 py-3 text-base text-white/70 outline-none"
            placeholder="Email"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">
            Date of birth
          </label>
          <input
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full rounded-lg bg-[#151515] px-4 py-3 text-base text-white outline-none"
            placeholder="YYYY-MM-DD"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">Country</label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="w-full rounded-lg bg-[#151515] border-none py-6 text-white">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent className="bg-[#151515] text-white border-none max-h-80">
              {COUNTRIES.map((c) => (
                <SelectItem
                  key={c.code}
                  value={c.name}
                  className="focus:bg-white/10 focus:text-white"
                >
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">
            State / Region
          </label>
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full rounded-lg bg-[#151515] px-4 py-3 text-base text-white outline-none"
            placeholder="Enter state or region"
          />
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 px-6 z-20">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="py-3 w-full rounded-full bg-[#C7EF6B] text-black text-base font-medium disabled:opacity-60"
        >
          {isSaving ? (
            <span className="inline-flex items-center gap-2">
              <LoaderCircle size={15} className="animate-spin" />
              Saving..
            </span>
          ) : (
            "Save details"
          )}
        </button>
      </div>

      <SettingsSuccessDrawer
        isOpen={showSuccessDrawer}
        onClose={() => setShowSuccessDrawer(false)}
        title="Profile updated"
        message="Your personal details have been updated."
      />

      <ErrorDrawer
        isOpen={showErrorDrawer}
        onClose={() => setShowErrorDrawer(false)}
        message={errorMessage}
      />
    </div>
  );
};
