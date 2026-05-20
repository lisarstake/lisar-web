import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CircleQuestionMark,
  Eye,
  EyeOff,
  Info,
  LoaderCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { usePointsContext } from "@/contexts/PointsContext";
import { pointsService } from "@/services/points";
import type {
  PointsHistoryEntry,
  PointsPartner,
  PointsRedemptionRecord,
} from "@/services/points/types";
import toast from "react-hot-toast";

const POINTS_TO_NGN_RATE = 10;

type FlowStep = "overview" | "convert" | "transfer" | "success";

type RedemptionOption = {
  id: string;
  label: string;
  description: string;
  video: string;
  comingSoon?: boolean;
  location?: string;
  partnerKeywords: string[];
};

const REDEMPTION_OPTIONS: RedemptionOption[] = [
  {
    id: "cafeone",
    label: "CafeOne",
    description: "Convert points to discounts on CafeOne purchases.",
    video: "/cafeone1.mp4",
    location: "Port Harcourt",
    partnerKeywords: ["cafe", "cafeone"],
  },
  {
    id: "shuttlers",
    label: "Shuttlers",
    description: "Convert points to ride passes with Shuttlers.",
    video: "/shuttlers.mp4",
    comingSoon: true,
    partnerKeywords: ["shuttlers"],
  },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatHistoryTitle = (entry: PointsHistoryEntry): string => {
  if (entry.description?.trim()) return entry.description.trim();
  return "Perks Points Earned";
};

const formatRedemptionTitle = (record: PointsRedemptionRecord): string =>
  `Points Redeemed (${record.coupon_code})`;

export const PerksPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<FlowStep>("overview");
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [selectedRedemptionOption, setSelectedRedemptionOption] = useState<RedemptionOption | null>(null);
  const [showBalance, setShowBalance] = useState(false);
  const [pointsInput, setPointsInput] = useState("100");
  const [itemCostInput, setItemCostInput] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successRecord, setSuccessRecord] = useState<PointsRedemptionRecord | null>(null);

  const {
    balance,
    loading,
    refetch,
    partners,
    pointsHistory,
    pointsRedemptions,
    historyLoading,
    historyLoadError,
    redemptionsLoadError,
    loadHistoryData,
  } = usePointsContext();

  const totalPoints = balance?.total_points ?? 0;
  const pointsToRedeem = Number(pointsInput) || 0;
  const itemCost = Number(itemCostInput) || 0;

  const activePartner = useMemo<PointsPartner | undefined>(() => {
    if (!selectedRedemptionOption) return undefined;
    return partners.find((partner) => {
      const partnerFields = `${partner.display_name} ${partner.name}`.toLowerCase();
      return selectedRedemptionOption.partnerKeywords.some((keyword) => partnerFields.includes(keyword));
    });
  }, [partners, selectedRedemptionOption]);

  const mergedHistory = useMemo(() => {
    const earned = pointsHistory
    .filter((item) => item.points > 0)
    .map((item) => ({
      id: `earned-${item.id}`,
      createdAt: item.created_at,
      points: `+${item.points}`,
      subtitle: formatHistoryTitle(item),
      title: "Perks Points Earned",
      isEarned: true,
    }));

    const redeemed = pointsRedemptions.map((item) => ({
      id: `redeemed-${item.id}`,
      createdAt: item.created_at,
      points: `-${item.points_spent}`,
      subtitle: `₦${item.discount_value_ngn.toLocaleString()} off`,
      title: formatRedemptionTitle(item),
      isEarned: false,
    }));

    return [...earned, ...redeemed].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [pointsHistory, pointsRedemptions]);

  const pointsShortfall = Math.max(pointsToRedeem - totalPoints, 0);

  const onRedeemStart = () => {
    setError(null);
    setStep("convert");
  };

  const onContinueToTransfer = () => {
    if (!selectedRedemptionOption) {
      toast.error("Select where to convert points");
      return;
    }
    setError(null);
    setStep("transfer");
  };

  const onConfirmTransfer = async () => {
    if (!selectedRedemptionOption) {
      setError("Select where to convert points to continue.");
      return;
    }
    if (!Number.isInteger(pointsToRedeem) || pointsToRedeem < 100) {
      setError("Enter at least 100 points.");
      return;
    }
    if (!activePartner) {
      setError(`No active ${selectedRedemptionOption.label} partner is currently available. Please try again shortly.`);
      return;
    }

    if (itemCost <= 0) {
      setError("Enter the amount you want to buy from the partner.");
      return;
    }

    if (totalPoints < pointsToRedeem) {
      setError(`You need ${pointsShortfall} more points to continue.`);
      return;
    }

    setRedeeming(true);
    setError(null);

    console.log("[Redeem] Calling redeem with:", { partner_id: activePartner.id, points: pointsToRedeem, item_cost: itemCost });
    const response = await pointsService.redeem({ partner_id: activePartner.id, points: pointsToRedeem, item_cost: itemCost });
    console.log("[Redeem] Response:", response);
    setRedeeming(false);

    if (!response.success || !response.data) {
      setError(response.error || response.message || "Could not complete redemption.");
      return;
    }

    setSuccessRecord(response.data);
    await Promise.all([refetch(), loadHistoryData()]);
    setStep("success");
  };

  const headerTitle =
    step === "overview"
      ? "Perks"
      : step === "convert"
        ? "Convert Points"
        : step === "transfer"
          ? "Convert Details"
          : "Completed";

  return (
    <div className="min-h-full bg-[#050505] text-white flex flex-col">
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <button
          type="button"
          onClick={() => {
            if (step === "overview") {
              navigate("/earn");
              return;
            }
            if (step === "convert") {
              setStep("overview");
              return;
            }
            if (step === "transfer") {
              setStep("convert");
              return;
            }
            setStep("overview");
          }}
          className="h-10 w-10 rounded-full bg-[#151515] flex items-center justify-center"
        >
          <ArrowLeft className="text-white/90" size={22} />
        </button>

        <h1 className="text-lg font-semibold tracking-tight">{headerTitle}</h1>

        <button
          type="button"
          onClick={() => setShowHelpDrawer(true)}
          className="h-10 w-10 rounded-full bg-[#151515] flex items-center justify-center"
        >
          <CircleQuestionMark size={22} className="text-white/90" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-40 pt-2">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 w-full rounded-2xl bg-[#151515]" />
            <Skeleton className="h-10 w-full rounded-xl bg-[#151515]" />
            <Skeleton className="h-28 w-full rounded-2xl bg-[#151515]" />
          </div>
        ) : (
          <>
            {step === "overview" && (
              <>
                <Card className="rounded-2xl border-[#151515] bg-[#0f0f0f] text-white py-0 relative overflow-hidden">
                  <img
                    src="/walletbg-2.jpeg"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
                  />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C7EF6B]/5 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#86B3F7]/5 rounded-full blur-2xl" />
                  <CardContent className="p-4 relative z-10">
                    <div className="inline-flex rounded-full bg-black/35 px-2 py-1 text-[12px] font-medium">
                      1 point = ₦{POINTS_TO_NGN_RATE}
                    </div>
                    <p className="mt-4 text-[11px] text-white/80">Point Balance</p>
                    <p className="text-[30px] leading-none font-semibold mt-1 flex items-center gap-3 ml-1">
                      {showBalance ? totalPoints : "••••"}
                      <button type="button" onClick={() => setShowBalance((v) => !v)} className="focus:outline-none">
                        {showBalance ? <Eye size={20} className="text-white/60" /> : <EyeOff size={20} className="text-white/60" />}
                      </button>
                    </p>

                  </CardContent>
                </Card>

                <div className="mt-3 rounded-lg border border-[#2b2b2b] bg-[#151515] px-3 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <img src='/gift.png' className="w-7 h-7 mb-0.5" />
                      <div>
                        <p className="text-[12px] font-semibold text-white/90">Convert points to rewards</p>
                        <p className="text-[12px] mt-0.5 text-white/65">
                          Minimum redeemable: 100 points
                        </p>
                      </div>

                    </div>
                    <span className="text-[11px] text-white/70">
                      {totalPoints < 100 ? `${100 - totalPoints} left` : "Eligible"}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={onRedeemStart}
                  disabled={totalPoints < 100}
                  className="mt-5 h-12 w-full rounded-full bg-[#C7EF6B] text-black text-base font-medium hover:bg-[#B8E55A] disabled:opacity-60"
                >
                  Redeem Points
                </Button>

                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[12px] font-semibold text-white/90">History</h2>
                    {historyLoading && <span className="text-[12px] text-white/50">Loading...</span>}
                  </div>

                  {(historyLoadError || redemptionsLoadError) && (
                    <div className="mt-2 rounded-xl border border-[#5a2222] bg-[#2a1212] p-2.5 text-[12px] text-[#ffc4c4]">
                      Could not fully load history. Showing available records.
                    </div>
                  )}

                  <div className="mt-2 space-y-2">
                    {mergedHistory.length === 0 ? (
                      <div className="rounded-lg border border-[#2b2b2b] bg-[#151515] p-3 text-[12px] text-white/60">
                        No activity yet.
                      </div>
                    ) : (
                      mergedHistory.slice(0, 8).map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg border border-[#2b2b2b] bg-[#151515] px-3 py-4 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-[11px] font-semibold text-white/90">{item.title}</p>
                            <p className="text-[12px] text-white/55">
                              {item.subtitle} • {formatDate(item.createdAt)}
                            </p>
                          </div>
                          <p
                            className={`text-[12px] font-semibold ${item.isEarned ? "text-[#20a472]" : "text-[#d24f4f]"
                              }`}
                          >
                            {item.points}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {step === "convert" && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-[#2b2b2b] bg-[#151515] p-3">
                  <p className="text-[14px] font-semibold text-white/95">Convert Points</p>
                  <p className="mt-1 text-[13px] text-white/65 leading-[1.45]">
                    Convert your accumulated points into partner rewards!
                  </p>

                </div>

                <div className="grid grid-cols-2 gap-2">
                  {REDEMPTION_OPTIONS.map((option) => {
                    const isSelected = selectedRedemptionOption?.id === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setSelectedRedemptionOption(option);
                        }}
                        className={`rounded-xl border p-3 text-left transition-colors overflow-hidden ${isSelected
                          ? "border-gray-300 bg-[#151515]"
                          : "border-[#2b2b2b] bg-[#151515]"
                          }`}
                      >
                        <video
                          src={option.video}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="mb-2 h-24 w-full rounded-lg object-cover"
                        />
                        <div className="flex items-center gap-1 mt-1">
                          <p className="text-[12px] font-semibold text-white/90">{option.label}{option.location ? ` (${option.location})` : ""}</p>
                          {option.comingSoon && (
                            <span className="text-[12px] font-semibold text-[#f2c46a]">Coming soon</span>
                          )}
                        </div>
                        <p className="mt-1 text-[12px] text-white/60">{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === "transfer" && (
              <div className="space-y-3">
                {/* <div className="rounded-2xl border border-[#2b2b2b] bg-[#151515] p-3 space-y-2">
                  <h3 className="text-[12px] font-semibold text-white/90">Account details</h3>
                  <div className="text-[12px] text-white/60 space-y-1">
                    <p>Partner: {selectedRedemptionOption?.label ?? "-"}</p>
                    <p>Points balance: {totalPoints}</p>
                  </div>
                </div> */}

                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-white/70">Account Number</label>
                  <Input
                    value="8681187112"
                    readOnly
                    className="h-auto py-3.5 rounded-lg border-[#2b2b2b] bg-[#111111] text-[12px] text-white/80 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
                  />

                  <label className="text-[12px] font-medium text-white/70">Bank</label>
                  <Input
                    value="Sterling Bank"
                    readOnly
                    className="h-auto py-3.5 rounded-lg border-[#2b2b2b] bg-[#111111] text-[12px] text-white/80 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
                  />

                  <label className="text-[12px] font-medium text-white/70">Account Name</label>
                  <Input
                    value="Cafe One Coffee Port Harcourt"
                    readOnly
                    className="h-auto py-3.5 rounded-lg border-[#2b2b2b] bg-[#111111] text-[12px] text-white/80 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
                  />

                  <label className="text-[12px] font-medium text-white/70">Points balance</label>
                  <Input
                    value={pointsInput}
                    onChange={(e) => setPointsInput(e.target.value.replace(/[^\d]/g, ""))}
                    inputMode="numeric"
                    className="h-auto py-3.5 rounded-lg border-[#2b2b2b] bg-[#151515] text-[12px] text-white outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
                  />

                  <label className="text-[12px] font-medium text-white/70">Amount points converts to</label>
                  <Input
                    value={`₦${(pointsToRedeem * POINTS_TO_NGN_RATE).toLocaleString()}`}
                    readOnly
                    className="h-auto py-3.5 rounded-lg border-[#2b2b2b] bg-[#111111] text-[12px] text-white/80 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
                  />

                  <label className="text-[12px] font-medium text-white/70">Total purchase from {selectedRedemptionOption?.label ?? "partner"} (₦)</label>
                  <Input
                    value={itemCostInput}
                    onChange={(e) => setItemCostInput(e.target.value.replace(/[^\d]/g, ""))}
                    inputMode="numeric"
                    placeholder="e.g. 5000"
                    className="h-auto py-3.5 rounded-lg border-[#2b2b2b] bg-[#151515] text-[12px] text-white outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
                  />

                </div>

              </div>
            )}

            {step === "success" && (
              <div className="min-h-[calc(100vh-260px)] flex items-center">
                <div className="relative rounded-3xl border border-[#2b2b2b] bg-[#111111] text-white overflow-hidden w-full">
                  <div className="absolute -top-14 -right-10 h-44 w-44 rounded-full bg-[#C7EF6B]/10 blur-3xl" />
                  <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-[#86B3F7]/10 blur-3xl" />

                  <div className="relative px-5 pt-6 pb-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">Conversion Receipt</p>
                      <div className="inline-flex items-center gap-1 rounded-full border border-[#2f3d1f] bg-[#1a2212] px-2.5 py-1 text-[12px] text-[#C7EF6B]">
                        <CheckCircle2 size={12} />
                        Successful
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-[#2a2a2a] bg-[#171717] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2b2b2b]">
                          <img src="/gift.png" alt="Gift" className="h-7 w-7 object-contain" />
                        </div>
                        <div>
                          <p className="text-xs text-white/60">Points converted successfully</p>
                          <p className="text-lg font-semibold leading-tight">
                            ₦{(pointsToRedeem * POINTS_TO_NGN_RATE).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="my-4 border-t border-dashed border-white/15" />

                      <div className="space-y-2 text-[12px]">
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Partner</span>
                          <span className="font-medium text-white/90">{selectedRedemptionOption?.label ?? "CafeOne"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Points Used</span>
                          <span className="font-medium text-white/90">{pointsToRedeem}</span>
                        </div>
                       
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Bank</span>
                          <span className="font-medium text-white/90">Sterling Bank</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Account Number</span>
                          <span className="font-medium text-white/90">8681187112</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Account Name</span>
                          <span className="font-medium text-white/90 text-right">Cafe One Coffee Port Harcourt</span>
                        </div>
                        {successRecord?.coupon_code && (
                          <div className="flex items-center justify-between">
                            <span className="text-white/60">Coupon</span>
                            <span className="font-medium text-white/90">{successRecord.coupon_code}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Items purchased</span>
                          <span className="font-medium text-white/90">₦{successRecord?.item_cost?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Discount</span>
                          <span className="font-medium text-white/90">-₦{successRecord?.discount_value_ngn?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Amount to Pay</span>
                          <span className="font-medium text-white/90">₦{successRecord?.amount_to_pay?.toLocaleString()}</span>
                        </div>
                       
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Date</span>
                          <span className="font-medium text-white/90">
                            {new Date().toLocaleDateString("en-US", {
                              month: "short",
                              day: "2-digit",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {!loading && step !== "overview" && (
        <div className="fixed left-4 right-4 bottom-24 z-20">
          {step === "convert" && (
            <Button
              type="button"
              onClick={onContinueToTransfer}
              disabled={!selectedRedemptionOption || !!selectedRedemptionOption.comingSoon}
              className="h-12 w-full rounded-full bg-[#C7EF6B] text-black text-base font-medium hover:bg-[#B8E55A] disabled:opacity-60"
            >
              Continue
            </Button>
          )}

          {step === "transfer" && (
            <Button
              type="button"
              onClick={onConfirmTransfer}
              disabled={redeeming || totalPoints < pointsToRedeem || pointsToRedeem < 100 || itemCost <= 0}
              className="h-12 w-full rounded-full bg-[#C7EF6B] text-black text-base font-medium hover:bg-[#B8E55A] disabled:opacity-60"
            >
              {redeeming ? (
                <span className="inline-flex items-center gap-1.5">
                  <LoaderCircle size={14} className="animate-spin" /> Processing
                </span>
              ) : (
                "Convert"
              )}
            </Button>
          )}

          {step === "success" && (
            <Button
              type="button"
              onClick={() => {
                setStep("overview");
                setSuccessRecord(null);
                setPointsInput("100");
                setItemCostInput("");
                setSelectedRedemptionOption(null);
              }}
              className="h-12 w-full rounded-full bg-[#C7EF6B] text-black hover:bg-[#B8E55A] text-base font-medium"
            >
              Back to points
            </Button>
          )}
        </div>
      )}

      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Perks Guide"
        content={[
          "Convert points to cash rewards. 1 point = ₦10 and minimum redeemable balance is 100 points.",
        ]}
      />

      <BottomNavigation currentPath="/perks" />

      {step === "transfer" && pointsToRedeem > 0 && pointsToRedeem < 100 && (
        <div className="fixed left-4 right-4 bottom-40 rounded-xl border border-[#ffd9d9] bg-[#fff5f5] px-3 py-2 text-[12px] text-[#9a3131] flex items-start gap-2 z-30">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>Minimum redeemable is 100 points.</span>
        </div>
      )}

      {step === "transfer" && pointsToRedeem >= 100 && totalPoints < pointsToRedeem && (
        <div className="fixed left-4 right-4 bottom-40 rounded-xl border border-[#ffd9d9] bg-[#fff5f5] px-3 py-2 text-[12px] text-[#9a3131] flex items-start gap-2 z-30">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>You need {pointsShortfall} more points to continue.</span>
        </div>
      )}

      {step === "transfer" && error && (
        <div className="fixed left-4 right-4 bottom-40 rounded-xl border border-[#ffd9d9] bg-[#fff5f5] px-3 py-2 text-[12px] text-[#9a3131] z-30">
          {error}
        </div>
      )}

      {error && step !== "transfer" && (
        <div className="fixed left-4 right-4 bottom-40 rounded-xl border border-[#ffd9d9] bg-[#fff5f5] px-3 py-2 text-[12px] text-[#9a3131] z-30">
          {error}
        </div>
      )}

      {step === "convert" && selectedRedemptionOption?.id === "cafeone" && (
        <div className="fixed left-4 right-4 bottom-40 rounded-xl border border-[#ffe7b8] bg-[#fff8e9] px-3 py-2 text-[12px] text-[#7a5b22] flex items-start gap-2 z-30">
          <Info size={13} className="mt-0.5 shrink-0" />
          <span>This service is currently available for CafeOne Port Harcourt. Other areas are coming soon.</span>
        </div>
      )}

      {!activePartner && !!selectedRedemptionOption && !loading && (
        <div className="fixed left-4 right-4 bottom-40 rounded-xl border border-[#ffe7b8] bg-[#fff8e9] px-3 py-2 text-[12px] text-[#7a5b22] flex items-start gap-2 z-30">
          <Info size={13} className="mt-0.5 shrink-0" />
          <span>This service is currently not available and is coming soon.</span>
        </div>
      )}
    </div>
  );
};
