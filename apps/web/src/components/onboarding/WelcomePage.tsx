import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LoaderCircle, CheckCircle2, XCircle, CameraIcon } from "lucide-react";
import toast from "react-hot-toast";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useAuth } from "@/contexts/AuthContext";
import { campaignService } from "@/services";
import { COUNTRIES } from "@/lib/countries";
import { ErrorDrawer } from "@/components/general/ErrorDrawer";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateProfile, refreshUser } = useAuth();

  const formatDob = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 4) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
  };

  const [address, setAddress] = useState("");
  const [nationality, setNationality] = useState("");
  const [dob, setDob] = useState("");
  const [howDidYouHear, setHowDidYouHear] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const [isValidatingReferral, setIsValidatingReferral] = useState(false);
  const [referralValidation, setReferralValidation] = useState<{
    isValid: boolean | null;
    message: string;
  }>({ isValid: null, message: "" });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<"referral" | "saving" | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    address?: string;
    nationality?: string;
    dob?: string;
  }>({});
  const [errorDrawer, setErrorDrawer] = useState({
    isOpen: false,
    message: "",
  });
  const [showQrScanner, setShowQrScanner] = useState(false);

  const extractCodeFromQr = (data: string): string | null => {
    const trimmed = data.trim();
    const urlMatch = trimmed.match(
      /https?:\/\/(www\.)?lisarstake\.com\/signup\/([A-Za-z0-9]+)/i
    );
    if (urlMatch) return urlMatch[2].slice(0, 6);
    const codeMatch = trimmed.match(/^([A-Za-z0-9]{1,6})$/);
    if (codeMatch) return codeMatch[1];
    return null;
  };

  const validateReferralCode = useCallback(async (code: string) => {
    if (!code) {
      setReferralValidation({ isValid: null, message: "" });
      return;
    }

    setIsValidatingReferral(true);
    try {
      const response = await campaignService.validateReferralCode(code);
      if (response.success && response.data) {
        setReferralValidation({
          isValid: response.data.valid,
          message: response.data.valid
            ? "Valid referral code"
            : "Invalid referral code",
        });
      } else {
        setReferralValidation({
          isValid: false,
          message: "Invalid referral code",
        });
      }
    } catch {
      setReferralValidation({
        isValid: false,
        message: "Failed to validate code",
      });
    } finally {
      setIsValidatingReferral(false);
    }
  }, []);

  useEffect(() => {
    if (referralCode.length === 6) {
      const timer = setTimeout(() => validateReferralCode(referralCode), 500);
      return () => clearTimeout(timer);
    } else {
      setReferralValidation({ isValid: null, message: "" });
    }
  }, [referralCode, validateReferralCode]);

  const isFormValid = !!(address.trim() && nationality.trim() && dob.trim()) &&
    (!referralCode || referralValidation.isValid === true);

  const handleSubmit = async () => {
    const errors: { address?: string; nationality?: string; dob?: string } = {};
    if (!address.trim()) errors.address = "Address is required";
    if (!nationality.trim()) errors.nationality = "Nationality is required";
    if (!dob.trim()) errors.dob = "Date of birth is required";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      if (referralCode && referralValidation.isValid) {
        setSubmitPhase("referral");
        const result = await campaignService.applyReferralCode({
          code: referralCode,
        });
        if (result.success) {
          toast.success("Referral code applied! You've earned some points.");
          window.dispatchEvent(new Event("points:refresh"));
          localStorage.setItem("referred_signup", "true");
        } else {
          toast.error(result.message || "Failed to apply referral code");
          setIsSubmitting(false);
          return;
        }
      }

      setSubmitPhase("saving");
      const profileResponse = await updateProfile({
        state: address.trim() || undefined,
        country: nationality.trim() || undefined,
        DOB: dob.trim() || undefined,
      });

      if (!profileResponse.success) {
        throw new Error(profileResponse.message || "Failed to save details");
      }

      await refreshUser();
      navigate("/wallet", { replace: true });
    } catch (error) {
      setErrorDrawer({
        isOpen: true,
        message:
          error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
      setSubmitPhase(null);
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 scrollbar-hide pb-24">
        <div className="flex items-start justify-start pt-8 pb-1">
          <h1 className="text-lg font-medium text-white">
            Welcome onboard 🎉
          </h1>
        </div>

        <p className="text-sm text-gray-400 mb-8">Welcome to Lisar! Please provide the following information to complete onboarding.</p>
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-white/70">
              Address <span className="text-red-400">*</span>
            </label>
            <input
              value={address}
              onChange={(e) => { setAddress(e.target.value); setFieldErrors((prev) => ({ ...prev, address: undefined })); }}
              className={`w-full rounded-lg bg-[#151515] px-4 py-3 text-base text-white outline-none ${fieldErrors.address ? "ring-1 ring-red-400" : ""}`}
              placeholder="Enter your address"
            />
            {fieldErrors.address && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.address}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">
              Nationality <span className="text-red-400">*</span>
            </label>
            <Select value={nationality} onValueChange={(v) => { setNationality(v); setFieldErrors((prev) => ({ ...prev, nationality: undefined })); }}>
              <SelectTrigger className={`w-full rounded-lg bg-[#151515] border-none py-6 text-white ${fieldErrors.nationality ? "ring-1 ring-red-400" : ""}`}>
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
            {fieldErrors.nationality && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.nationality}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">
              Date of Birth <span className="text-red-400">*</span>
            </label>
            <input
              value={dob}
              onChange={(e) => { setDob(formatDob(e.target.value)); setFieldErrors((prev) => ({ ...prev, dob: undefined })); }}
              className={`w-full rounded-lg bg-[#151515] px-4 py-3 text-base text-white outline-none ${fieldErrors.dob ? "ring-1 ring-red-400" : ""}`}
              placeholder="YYYY-MM-DD"
            />
            {fieldErrors.dob && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.dob}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">
              Referral code{" "}
              <span className="text-white/50">(Optional)</span>
            </label>
            <div className="relative">
              <input
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.slice(0, 6))}
                maxLength={6}
                className="w-full rounded-lg bg-[#151515] px-4 py-3 text-base text-white outline-none pr-12"
                placeholder="Scan QR or enter code"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {referralCode ? (
                  isValidatingReferral ? (
                    <LoaderCircle className="w-5 h-5 text-gray-400 animate-spin" />
                  ) : referralValidation.isValid === true ? (
                    <CheckCircle2 className="w-5 h-5 text-[#C7EF6B]" />
                  ) : referralValidation.isValid === false ? (
                    <XCircle className="w-5 h-5 text-red-400" />
                  ) : null
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowQrScanner(true)}
                    className="text-white/70 mt-1 hover:text-white transition-colors"
                  >
                    <CameraIcon size={18} />
                  </button>
                )}
              </div>
            </div>
            {referralCode &&
              !isValidatingReferral &&
              referralValidation.message && (
                <div
                  className={`flex items-center mt-2 text-sm ${referralValidation.isValid
                    ? "text-[#C7EF6B]"
                    : "text-red-400"
                    }`}
                >
                  {referralValidation.message}
                </div>
              )}
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">
              How did you hear about us?{" "}
              <span className="text-white/50">(Optional)</span>
            </label>
            <input
              value={howDidYouHear}
              onChange={(e) => setHowDidYouHear(e.target.value)}
              className="w-full rounded-lg bg-[#151515] px-4 py-3 text-base text-white outline-none"
              placeholder="e.g. Twitter, Friend, CafeOne"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          className="mt-16 h-12 w-full rounded-full bg-[#C7EF6B] text-black text-base font-semibold disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <LoaderCircle size={18} className="animate-spin" />
              {submitPhase === "referral" ? "Applying referral..." : "Saving..."}
            </span>
          ) : (
            "Save"
          )}
        </button>
      </div>

      <Drawer open={showQrScanner} onOpenChange={(open) => { if (!open) setShowQrScanner(false); }}>
        <DrawerContent className="inset-0 h-dvh max-h-dvh rounded-none p-0 border-0 bg-black">
          <div className="relative w-full h-full">
            <Scanner
              formats={["qr_code"]}
              constraints={{ facingMode: "environment", width: 640, height: 480 }}
              components={{ finder: false }}
              onScan={(detectedCodes) => {
                const raw = detectedCodes[0]?.rawValue;
                if (!raw) return;
                let code = extractCodeFromQr(raw);
                if (!code && raw) {
                  code = raw.trim().split("/").pop() || null;
                }
                const mappedCode = code === "bBHEm3" ? "CAFE01" : code;
                if (mappedCode) {
                  setReferralCode(mappedCode);
                  setShowQrScanner(false);
                } else {
                  toast.error("Invalid QR code, please try again or type the code.");
                }
              }}
              onError={(error) => {
                console.error("QR scanner error:", error);
                setShowQrScanner(false);
                toast.error("Camera error. Please try again or type the code.");
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-64 h-64">
                  <div className="absolute w-8 h-8 border-t-4 border-l-4 border-[#C7EF6B] rounded-tl-lg top-0 left-0" />
                  <div className="absolute w-8 h-8 border-t-4 border-r-4 border-[#C7EF6B] rounded-tr-lg top-0 right-0" />
                  <div className="absolute w-8 h-8 border-b-4 border-l-4 border-[#C7EF6B] rounded-bl-lg bottom-0 left-0" />
                  <div className="absolute w-8 h-8 border-b-4 border-r-4 border-[#C7EF6B] rounded-br-lg bottom-0 right-0" />
                </div>
              </div>
            </Scanner>
            <button
              onClick={() => setShowQrScanner(false)}
              className="absolute top-8 left-4 z-10 h-10 w-10 rounded-full bg-black/50 flex items-center justify-center"
            >
              <ArrowLeft className="text-white" size={22} />
            </button>
            <p className="absolute bottom-12 left-0 right-0 text-center text-white/70 text-sm">
              Align QR code within the frame
            </p>
          </div>
        </DrawerContent>
      </Drawer>

      <ErrorDrawer
        isOpen={errorDrawer.isOpen}
        onClose={() => setErrorDrawer({ ...errorDrawer, isOpen: false })}
        message={errorDrawer.message}
      />
    </div>
  );
};
