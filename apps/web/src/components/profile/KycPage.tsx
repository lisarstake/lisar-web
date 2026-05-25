import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import {
  ArrowLeft,
  Camera,
  ChevronDown,
  ChevronUp,
  Fingerprint,
  Landmark,
  LoaderCircle,
  Lock,
  Timer,
  X,
} from "lucide-react";
import { kycService } from "@/services";
import type { KycStatus, KycStatusData, KycVerifyType } from "@/services";
import { useKyc } from "@/contexts/KycContext";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import toast from "react-hot-toast";

type SelfieStep = "idle" | "uploading" | "done";

interface SelfieState {
  step: SelfieStep;
  capturedBase64: string | null;
  selfieUrl: string | null;
  error: string | null;
}

const INITIAL_SELFIE: SelfieState = {
  step: "idle",
  capturedBase64: null,
  selfieUrl: null,
  error: null,
};

const uploadSelfie = async (base64: string): Promise<string> => {
  const blob = await fetch(base64).then((r) => r.blob());
  const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "lisar_profiles");
  formData.append("folder", "lisar-kyc");

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dgz4c3ahz/image/upload",
    { method: "POST", body: formData },
  );

  const data = await response.json();
  if (data.secure_url) return data.secure_url;
  throw new Error(data.error?.message || "Upload failed");
};

const STATUS_CFG: Record<KycStatus, { label: string }> = {
  not_started: { label: "Not started" },
  approved: { label: "Verified" },
  rejected: { label: "Rejected" },
  pending: { label: "Pending" },
  expired: { label: "Expired" },
};

function getTier1Status(kyc: KycStatusData): KycStatus {
  if (kyc.tier === "tier_2") return "approved";
  if (kyc.tier === "tier_1") return kyc.status;
  return "not_started";
}

function getTier2Status(kyc: KycStatusData): KycStatus {
  if (kyc.tier === "tier_2") return kyc.status;
  return "not_started";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const SelfieCapture: React.FC<{
  selfieState: SelfieState;
  setSelfieState: React.Dispatch<React.SetStateAction<SelfieState>>;
  onOpenCamera: () => void;
}> = ({ selfieState, setSelfieState, onOpenCamera }) => {
  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-white/70 mb-2">Selfie</p>

      {selfieState.step === "idle" && (
        <>
          <button
            type="button"
            onClick={onOpenCamera}
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#1a1a1a] border border-dashed border-[#505050] text-white/70 hover:border-[#C7EF6B] hover:text-[#C7EF6B] transition-colors w-full"
          >
            <Camera size={18} />
            <span className="text-sm">Take a selfie</span>
          </button>

          {selfieState.error && (
            <div className="mt-2 p-3 rounded-lg bg-[#1a1a1a] border border-[#505050]">
              <p className="text-xs text-white/50 mb-2">{selfieState.error}</p>
              <input
                type="file"
                accept="image/*"
                className="text-xs text-white/70 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:cursor-pointer file:bg-[#2a2a2a] file:text-white file:text-xs hover:file:bg-[#3a3a3a]"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setSelfieState((prev) => ({ ...prev, step: "uploading", error: null }));
                  try {
                    const reader = new FileReader();
                    reader.onload = async () => {
                      const base64 = reader.result as string;
                      const url = await uploadSelfie(base64);
                      setSelfieState((prev) => ({
                        ...prev,
                        step: "done",
                        selfieUrl: url,
                        capturedBase64: base64,
                      }));
                    };
                    reader.readAsDataURL(file);
                  } catch {
                    setSelfieState((prev) => ({
                      ...prev,
                      step: "idle",
                      error: "Failed to upload file.",
                    }));
                  }
                }}
              />
            </div>
          )}
        </>
      )}

      {selfieState.step === "uploading" && (
        <div className="flex items-center gap-2 py-3 text-white/70">
          <LoaderCircle size={16} className="animate-spin" />
          <span className="text-sm">Preparing image...</span>
        </div>
      )}

      {selfieState.step === "done" && selfieState.selfieUrl && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-[#505050]">
          {selfieState.capturedBase64 && (
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-black shrink-0">
              <img
                src={selfieState.capturedBase64}
                alt="Selfie"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm text-white font-medium">Selfie captured</p>
            <p className="text-xs text-white/50">Photo captured successfully</p>
          </div>
        </div>
      )}
    </div>
  );
};

const VerifiedCard: React.FC<{
  verificationDate: string | null;
  icon: React.ReactNode;
}> = ({ verificationDate, icon }) => (
  <div className="flex items-center gap-3 p-4 rounded-xl bg-[#1a1a1a] border border-[#505050]">
    <div className="shrink-0 text-[#C7EF6B]">{icon}</div>
    <div>
      <p className="text-sm font-medium text-white">Verified</p>
      {verificationDate && (
        <p className="text-xs text-white/50 mt-0.5">
          Verified on {formatDate(verificationDate)}
        </p>
      )}
    </div>
  </div>
);

const StatusBadge: React.FC<{
  status: KycStatus;
  isLoading: boolean;
}> = ({ status, isLoading }) => {
  if (isLoading) {
    return (
      <LoaderCircle size={14} className="animate-spin text-white/40 mt-1" />
    );
  }
  return (
    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
      {STATUS_CFG[status].label}
    </span>
  );
};

export const KycPage: React.FC = () => {
  const navigate = useNavigate();
  const { kycStatus, isLoading, refreshKycStatus } = useKyc();
  const [expandedTier, setExpandedTier] = useState<"tier_1" | "tier_2" | null>(null);
  const [ninValue, setNinValue] = useState("");
  const [bvnValue, setBvnValue] = useState("");
  const [tier1Selfie, setTier1Selfie] = useState<SelfieState>(INITIAL_SELFIE);
  const [tier2Selfie, setTier2Selfie] = useState<SelfieState>(INITIAL_SELFIE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const [showCameraDrawer, setShowCameraDrawer] = useState(false);
  const [cameraTargetTier, setCameraTargetTier] = useState<"tier_1" | "tier_2">("tier_1");
  const [cameraStep, setCameraStep] = useState<"camera" | "preview">("camera");
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);

  const handleExpand = (tier: "tier_1" | "tier_2") => {
    setExpandedTier((prev) => (prev === tier ? null : tier));
  };

  const openCamera = () => {
    if (!expandedTier) return;
    setCameraTargetTier(expandedTier);
    setCameraStep("camera");
    setCapturedBase64(null);
    setShowCameraDrawer(true);
  };

  const closeCameraDrawer = () => {
    setShowCameraDrawer(false);
    setCameraStep("camera");
    setCapturedBase64(null);
  };

  const handleDrawerCapture = () => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (screenshot) {
      setCapturedBase64(screenshot);
      setCameraStep("preview");
    }
  };

  const handleDrawerRetake = () => {
    setCameraStep("camera");
    setCapturedBase64(null);
  };

  const handleDrawerConfirm = async () => {
    if (!capturedBase64) return;
    setShowCameraDrawer(false);
    setCameraStep("camera");
    setCapturedBase64(null);

    const update = cameraTargetTier === "tier_1" ? setTier1Selfie : setTier2Selfie;
    update((prev) => ({ ...prev, step: "uploading", error: null }));

    try {
      const url = await uploadSelfie(capturedBase64);
      update((prev) => ({ ...prev, step: "done", selfieUrl: url, capturedBase64: capturedBase64 }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      update((prev) => ({ ...prev, step: "idle", error: msg }));
    }
  };

  const handleCameraError = () => {
    setShowCameraDrawer(false);
    const update = cameraTargetTier === "tier_1" ? setTier1Selfie : setTier2Selfie;
    update((prev) => ({
      ...prev,
      error: "Camera access denied or unavailable. You can upload a photo instead.",
    }));
  };

  const handleVerify = async () => {
    if (!kycStatus || !expandedTier) return;

    const isTier1 = expandedTier === "tier_1";
    const selfieState = isTier1 ? tier1Selfie : tier2Selfie;

    if (!selfieState.selfieUrl) {
      toast.error("Please take and upload a selfie first.");
      return;
    }

    const idValue = (isTier1 ? ninValue : bvnValue).trim();
    if (!idValue) {
      toast.error(isTier1 ? "Please enter your NIN." : "Please enter your BVN.");
      return;
    }
    if (idValue.length < 10) {
      toast.error(isTier1 ? "NIN must be 11 digits." : "BVN must be 10 digits.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = isTier1
        ? {
          kycData: {
            type: "selfie_nin" as KycVerifyType,
            nin: idValue,
            selfie_image: selfieState.selfieUrl,
          },
        }
        : {
          kycData: {
            type: "selfie_bvn" as KycVerifyType,
            bvn: idValue,
            selfie_image: selfieState.selfieUrl,
          },
        };

      const response = await kycService.verify(payload);

      if (response.success) {
        toast.success("Verification successful. Your identity has been verified.");
        if (isTier1) {
          setTier1Selfie(INITIAL_SELFIE);
          setNinValue("");
        } else {
          setTier2Selfie(INITIAL_SELFIE);
          setBvnValue("");
        }
        setExpandedTier(null);
        await refreshKycStatus();
      } else {
        toast.error(response.error?.message || "Verification failed. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tier1Status = kycStatus ? getTier1Status(kycStatus) : "not_started";
  const tier2Status = kycStatus ? getTier2Status(kycStatus) : "not_started";
  const tier2Locked = tier1Status !== "approved";

  const renderCameraDrawer = () => (
    <Drawer open={showCameraDrawer} onOpenChange={(open) => { if (!open) closeCameraDrawer(); }}>
      <DrawerContent className="inset-0 h-dvh max-h-dvh rounded-none p-0 border-0 bg-black">
        <div className="relative w-full h-full">
          {cameraStep === "camera" ? (
            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored
              screenshotFormat="image/jpeg"
              screenshotQuality={0.8}
              videoConstraints={{ facingMode: "user", width: 640, height: 480 }}
              className="absolute inset-0 w-full h-full object-cover"
              onUserMediaError={handleCameraError}
            />
          ) : (
            capturedBase64 && (
              <img
                src={capturedBase64}
                alt="Selfie preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )
          )}

          <button
            onClick={closeCameraDrawer}
            className="absolute top-8 left-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center z-10"
            aria-label="Close camera"
          >
            <X size={22} className="text-white" />
          </button>

          <div className="absolute bottom-12 left-0 right-0 flex justify-center z-10">
            {cameraStep === "camera" ? (
              <button
                onClick={handleDrawerCapture}
                className="w-16 h-16 rounded-full border-4 border-white bg-transparent hover:bg-white/10 transition-colors"
                aria-label="Capture photo"
              />
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={handleDrawerRetake}
                  className="px-6 py-3 rounded-full bg-white/20 text-white text-sm font-medium"
                >
                  Retake
                </button>
                <button
                  onClick={handleDrawerConfirm}
                  className="px-6 py-3 rounded-full bg-[#C7EF6B] text-black text-sm font-medium"
                >
                  Use photo
                </button>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {renderCameraDrawer()}

      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="h-10 w-10 rounded-full bg-[#151515] flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>
        <h1 className="text-lg font-medium text-white">KYC Verification</h1>
        <div className="w-8 h-8" />
      </div>

      <div className="flex-1 px-6 pb-24 space-y-4 scrollbar-hide">
        {/* Tier 1: NIN */}
        <div className="rounded-xl bg-[#151515] overflow-hidden">
          <button
            type="button"
            onClick={() => handleExpand("tier_1")}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <div className="flex items-center gap-3">
              <Fingerprint size={20} className="text-[#C7EF6B] shrink-0" />
              <div>
                <p className="text-base font-medium text-white">
                  Tier 1: NIN Verification
                </p>
                <StatusBadge status={tier1Status} isLoading={isLoading} />
              </div>
            </div>
            {expandedTier === "tier_1" ? (
              <ChevronUp size={18} className="text-white/60" />
            ) : (
              <ChevronDown size={18} className="text-white/60" />
            )}
          </button>

          {expandedTier === "tier_1" && (
            <div className="px-5 pb-5 space-y-4 border-t border-white/10 pt-4">
              {tier1Status === "approved" ? (
                <VerifiedCard
                  verificationDate={kycStatus?.verificationDate ?? null}
                  icon={<Fingerprint size={22} />}
                />
              ) : tier1Status === "rejected" && kycStatus?.rejectionReason ? (
                <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#505050]">
                  <p className="text-xs text-white/50 font-medium">Rejection reason:</p>
                  <p className="text-sm text-white/70 mt-1">
                    {kycStatus.rejectionReason}
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm text-white/70">
                      National Identification Number (NIN)
                    </label>
                    <input
                      value={ninValue}
                      onChange={(e) => setNinValue(e.target.value.replace(/\D/g, ""))}
                      className="w-full rounded-lg bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none border border-[#505050] focus:border-[#C7EF6B]"
                      placeholder="Enter your 11-digit NIN"
                      maxLength={11}
                      inputMode="numeric"
                    />
                  </div>

                  <SelfieCapture
                    selfieState={tier1Selfie}
                    setSelfieState={setTier1Selfie}
                    onOpenCamera={openCamera}
                  />

                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={isSubmitting || tier1Selfie.step !== "done" || ninValue.trim().length < 11}
                    className="w-full py-3 rounded-full bg-[#C7EF6B] text-black text-sm font-medium disabled:opacity-50 mt-2"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2 justify-center">
                        <LoaderCircle size={15} className="animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      "Verify NIN"
                    )}
                  </button>
                  {tier1Status === "not_started" && (
                    <div className="flex gap-1 items-center justify-center">
                      <Timer className="text-gray-400" size={16} />
                      <p className="text-[11px] text-white/40 text-center mt-0.5">Takes less than 2 minutes</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Tier 2: BVN */}
        <div
          className={`rounded-xl bg-[#151515] overflow-hidden ${tier2Locked ? "opacity-60" : ""}`}
        >
          <button
            type="button"
            onClick={() => !tier2Locked && handleExpand("tier_2")}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
            disabled={tier2Locked}
          >
            <div className="flex items-center gap-3">
              {tier2Locked ? (
                <Lock size={20} className="text-white/40 shrink-0" />
              ) : (
                <Landmark size={20} className="text-[#C7EF6B] shrink-0" />
              )}
              <div>
                <p className="text-base font-medium text-white">
                  Tier 2: BVN Verification
                </p>
                <StatusBadge status={tier2Status} isLoading={isLoading} />
              </div>
            </div>

            {!tier2Locked &&
              (expandedTier === "tier_2" ? (
                <ChevronUp size={18} className="text-white/60" />
              ) : (
                <ChevronDown size={18} className="text-white/60" />
              ))}
          </button>

          {expandedTier === "tier_2" && !tier2Locked && (
            <div className="px-5 pb-5 space-y-4 border-t border-white/10 pt-4">
              {tier2Status === "approved" ? (
                <VerifiedCard
                  verificationDate={kycStatus?.verificationDate ?? null}
                  icon={<Landmark size={22} />}
                />
              ) : tier2Status === "rejected" && kycStatus?.rejectionReason ? (
                <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#505050]">
                  <p className="text-xs text-white/50 font-medium">Rejection reason:</p>
                  <p className="text-sm text-white/70 mt-1">
                    {kycStatus.rejectionReason}
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm text-white/70">
                      Bank Verification Number (BVN)
                    </label>
                    <input
                      value={bvnValue}
                      onChange={(e) => setBvnValue(e.target.value.replace(/\D/g, ""))}
                      className="w-full rounded-lg bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none border border-[#505050] focus:border-[#C7EF6B]"
                      placeholder="Enter your 10-digit BVN"
                      maxLength={11}
                      inputMode="numeric"
                    />
                  </div>

                  <SelfieCapture
                    selfieState={tier2Selfie}
                    setSelfieState={setTier2Selfie}
                    onOpenCamera={openCamera}
                  />

                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={isSubmitting || tier2Selfie.step !== "done" || bvnValue.trim().length < 10}
                    className="w-full py-3 rounded-full bg-[#C7EF6B] text-black text-sm font-medium disabled:opacity-50 mt-2"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2 justify-center">
                        <LoaderCircle size={15} className="animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      "Verify BVN"
                    )}
                  </button>
                  {tier2Status === "not_started" && (
                    <div className="flex gap-1 items-center justify-center">
                      <Timer className="text-gray-400" size={16} />
                      <p className="text-[11px] text-white/40 text-center mt-0.5">Takes less than 2 minutes</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
