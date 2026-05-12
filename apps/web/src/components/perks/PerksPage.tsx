import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  CircleQuestionMark,
  Gift,
  ChevronDown,
  Info,
  LampDesk,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ErrorDrawer } from "@/components/general/ErrorDrawer";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { SuccessDrawer } from "@/components/general/SuccessDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { EmptyState } from "@/components/general/EmptyState";
import toast from "react-hot-toast";
import { pointsService } from "@/services/points";
import { usePointsContext } from "@/contexts/PointsContext";
import type {
  PointsHistoryEntry,
  PointsPartner,
  PointsRedemptionRecord,
} from "@/services/points/types";

const formatDrawerDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const sortByCreatedDesc = <T extends { created_at: string }>(items: T[]) =>
  [...items].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

function formatHistoryLineTitle(entry: PointsHistoryEntry): string {
  if (entry.description?.trim()) return entry.description.trim();
  const t = entry.type || "Points";
  return t
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatRedemptionTitle(record: PointsRedemptionRecord): string {
  return `Redeemed · ${record.coupon_code}`;
}

const CAFE_ONE_PARTNER: PointsPartner = {
  id: "cafe-one",
  name: "Cafe One",
  display_name: "Café One",
  referral_code: "",
  is_active: true,
};

export const PerksPage: React.FC = () => {
  const navigate = useNavigate();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [benefitsExpanded, setBenefitsExpanded] = useState(false);

  const { balance, loading, refetch } = usePointsContext();
  const [redeemingPartnerId, setRedeemingPartnerId] = useState<string | null>(
    null,
  );

  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [pointsHistory, setPointsHistory] = useState<PointsHistoryEntry[]>([]);
  const [pointsRedemptions, setPointsRedemptions] = useState<
    PointsRedemptionRecord[]
  >([]);
  const [historyDrawerLoading, setHistoryDrawerLoading] = useState(false);
  const [historyLoadError, setHistoryLoadError] = useState<string | null>(null);
  const [redemptionsLoadError, setRedemptionsLoadError] = useState<
    string | null
  >(null);

  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successData, setSuccessData] =
    useState<PointsRedemptionRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadHistoryDrawerData = useCallback(async () => {
    setHistoryDrawerLoading(true);
    setHistoryLoadError(null);
    setRedemptionsLoadError(null);

    const [histRes, redRes] = await Promise.all([
      pointsService.getHistory(),
      pointsService.getRedemptions(),
    ]);

    if (histRes.success) {
      const arr = Array.isArray(histRes.data) ? histRes.data : [];
      setPointsHistory(sortByCreatedDesc(arr));
    } else {
      setPointsHistory([]);
      setHistoryLoadError(
        histRes.error || histRes.message || "Could not load points history",
      );
    }

    if (redRes.success) {
      const arr = Array.isArray(redRes.data) ? redRes.data : [];
      setPointsRedemptions(sortByCreatedDesc(arr));
    } else {
      setPointsRedemptions([]);
      setRedemptionsLoadError(
        redRes.error || redRes.message || "Could not load redemptions",
      );
    }

    setHistoryDrawerLoading(false);
  }, []);

  useEffect(() => {
    if (!historyDrawerOpen) return;
    void loadHistoryDrawerData();
  }, [historyDrawerOpen, loadHistoryDrawerData]);

  const totalPoints = balance?.total_points ?? 0;

  const handleBackClick = () => {
    navigate("/earn");
  };

  const handleRedeemPoints = async (partner: PointsPartner) => {
    if (redeemingPartnerId) return;

    if (balance && !balance.can_redeem) {
      const msg =
        balance.points_to_next_redemption > 0
          ? `You need ${balance.points_to_next_redemption} more points before you can redeem.`
          : "You can't redeem yet. Keep saving to earn more points.";
      toast.error(msg);
      return;
    }

    setRedeemingPartnerId(partner.id);
    const res = await pointsService.redeem({ partner_id: partner.id });
    setRedeemingPartnerId(null);

    if (res.success && res.data) {
      setSuccessData(res.data);
      setSuccessMessage(
        `Your coupon code is ${res.data.coupon_code} — and discount amount is ₦${res.data.discount_value_ngn.toLocaleString()} off on your purchase.`,
      );
      setShowSuccessDrawer(true);
      await refetch();
    } else {
      setErrorMessage(
        res.error ||
        res.message ||
        "Could not redeem points. Please try again later.",
      );
      setShowErrorDrawer(true);
    }
  };

  const showHistoryDrawerFatal =
    !historyDrawerLoading &&
    Boolean(historyLoadError) &&
    Boolean(redemptionsLoadError);

  const showHistoryDrawerEmpty =
    !historyDrawerLoading &&
    !historyLoadError &&
    !redemptionsLoadError &&
    pointsHistory.length === 0 &&
    pointsRedemptions.length === 0;

  return (
    <div className="min-h-full bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8">
        <button
          onClick={handleBackClick}
          className="h-10 w-10 rounded-full bg-[#151515] flex items-center justify-center"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>
        <h1 className="text-base font-medium text-white">Perks</h1>
        <button
          onClick={() => setShowHelpDrawer(true)}
          className="w-8 h-8 bg-[#505050] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#fff" size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-20 scrollbar-hide">
        {loading ? (
          <>
            <Skeleton className="w-full h-48 rounded-lg mb-6 bg-white/10" />
            <Skeleton className="w-full h-32 rounded-lg mb-4 bg-white/10" />
            <Skeleton className="w-full h-24 rounded-lg mb-4 bg-white/10" />
            <Skeleton className="w-full h-32 rounded-lg mb-4 bg-white/10" />
            <Skeleton className="w-full h-36 rounded-lg mb-6 bg-white/10" />
          </>
        ) : (
          <>
            <div className="w-full h-48 relative rounded-lg overflow-hidden mb-6">
              <img
                src="/cafeone.jpeg"
                alt="Perks"
                className="w-full h-full object-cover object-top"
              />
            </div>

            <Card className="bg-[#1a1a1a] border-gray-800 py-0 mb-4">
              <CardContent className="px-4 py-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <CardTitle className="text-white text-lg mb-0 flex-1 min-w-0">
                    {CAFE_ONE_PARTNER.display_name}
                  </CardTitle>
                  <button
                    type="button"
                    onClick={() => setHistoryDrawerOpen(true)}
                    className="shrink-0 text-xs font-medium text-[#86B3F7] hover:text-[#96C3F7] underline underline-offset-2 pt-0.5"
                  >
                    Points history
                  </button>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  Save on Lisar and accumulate points redeemable on
                  purchases at {CAFE_ONE_PARTNER.display_name}.
                </p>
                <div className="grid grid-cols-[2fr_1fr] gap-3">
                  <div className="p-2 bg-[#505050] rounded-md">
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs font-semibold text-white/90">
                        {`${totalPoints} points`}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    disabled={redeemingPartnerId !== null}
                    onClick={() => handleRedeemPoints(CAFE_ONE_PARTNER)}
                    className="bg-[#C7EF6B] hover:bg-[#B8E55A] disabled:opacity-40 disabled:pointer-events-none text-black font-medium text-xs px-2 py-1 rounded-full transition-colors"
                  >
                    {redeemingPartnerId === CAFE_ONE_PARTNER.id
                      ? "…"
                      : "Redeem Now"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Benefits Card - Collapsible */}
            <Card className="bg-[#1a1a1a] border-gray-800 py-0 mb-4">
              <CardContent className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setBenefitsExpanded(!benefitsExpanded)}
                  className="flex items-center justify-between w-full mb-0"
                >
                  <CardTitle className="text-white text-sm">
                    Discount Benefits
                  </CardTitle>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${benefitsExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                {benefitsExpanded && (
                  <div className="space-y-3 mt-3">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#505050]">
                      <Gift className="w-4 h-4 text-white/90 shrink-0" />
                      <p className="text-xs text-white/90">
                        Discount on purchases (varies by partner)
                      </p>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#505050]">
                      <LampDesk className="w-4 h-4 text-white/90 shrink-0" />
                      <p className="text-xs text-white/90">
                        Offers may include dining, retail, and workspace perks
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="bg-[#1a1a1a] border-gray-800 py-0 mb-4">
              <CardContent className="px-4 py-4">
                <CardTitle className="text-white text-sm mb-3">
                  How It Works
                </CardTitle>
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">
                    1. Save money on Lisar → Earn points
                  </p>
                  <p className="text-xs text-gray-400">
                    2. Points automatically tracked
                  </p>
                  <p className="text-xs text-gray-400">
                    3. Redeem at participating partner locations
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="p-4 bg-[#1a1a1a] border border-gray-800 rounded-lg mb-6">
              <h3 className="text-white font-semibold mb-1 text-sm">
                Ready to start?
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                Save on Lisar and start accumulating points for partner discounts.
              </p>
              <button
                type="button"
                onClick={() => navigate("/wallet")}
                className="w-full py-2.5 bg-[#C7EF6B] hover:bg-[#B8E55A] text-black font-medium rounded-full transition-colors text-sm"
              >
                Start Saving
              </button>
            </div>
          </>
        )}
      </div>

      <Drawer open={historyDrawerOpen} onOpenChange={setHistoryDrawerOpen}>
        <DrawerContent className="bg-[#050505] border-t border-[#1b1b1b] max-h-[90vh] flex flex-col gap-0 rounded-t-2xl p-0 md:max-w-[390px] md:left-1/2 md:-translate-x-1/2">
          <div className="flex-1 overflow-y-auto px-6 pb-8 pt-4 scrollbar-hide min-h-0">
            {historyDrawerLoading ? (
              <div className="space-y-6">
                {[0, 1].map((sec) => (
                  <div key={`hist-skel-sec-${sec}`}>
                    <div className="h-4 bg-gray-700 rounded w-28 mb-3 animate-pulse" />
                    <div className="space-y-3">
                      {[0, 1].map((row) => (
                        <div
                          key={`hist-skel-row-${sec}-${row}`}
                          className="flex items-center justify-between p-4 bg-[#151515] rounded-xl border border-[#505050]"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse shrink-0" />
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-700 rounded w-32 animate-pulse" />
                              <div className="h-3 bg-gray-700 rounded w-24 animate-pulse" />
                            </div>
                          </div>
                          <div className="h-4 bg-gray-700 rounded w-14 animate-pulse shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : showHistoryDrawerFatal ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-16 h-16 bg-gray-100/10 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Couldn&apos;t load activity
                </h3>
                <p className="text-gray-400 text-center text-sm mb-2 max-w-sm">
                  {historyLoadError}
                </p>
                <p className="text-gray-500 text-center text-xs mb-6 max-w-sm">
                  {redemptionsLoadError}
                </p>
                <button
                  type="button"
                  onClick={() => void loadHistoryDrawerData()}
                  className="flex items-center text-sm space-x-2 px-4 py-2 bg-gray-300 text-black rounded-lg font-normal hover:bg-[#B8E55A] transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry</span>
                </button>
              </div>
            ) : showHistoryDrawerEmpty ? (
              <EmptyState
                icon={Info}
                iconColor="#86B3F7"
                iconBgColor="#505050"
                title="No activity yet"
                description="Earn points by saving on Lisar. Redemptions will appear here after you redeem."
                className="py-8"
              />
            ) : (
              <div className="space-y-8">
                <div>
                  <h2 className="text-gray-400 text-xs font-medium mb-3 uppercase tracking-wide">
                    Inflows
                  </h2>
                  {historyLoadError ? (
                    <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 mb-2">
                      <p className="text-sm text-red-300/95 mb-3">
                        {historyLoadError}
                      </p>
                      <button
                        type="button"
                        onClick={() => void loadHistoryDrawerData()}
                        className="flex items-center text-sm space-x-2 px-4 py-2 bg-gray-300 text-black rounded-lg font-normal hover:bg-[#B8E55A] transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Retry</span>
                      </button>
                    </div>
                  ) : pointsHistory.length > 0 ? (
                    <div className="space-y-3">
                      {pointsHistory.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-4 bg-[#151515] rounded-xl border border-[#505050]"
                        >
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full shrink-0">
                              <ArrowDownLeft
                                size={20}
                                className="text-green-400"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-medium text-sm truncate">
                                {formatHistoryLineTitle(entry)}
                              </p>
                              <p className="text-white/40 text-xs">
                                {formatDrawerDate(entry.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 pl-2">
                            <p className="font-semibold text-[13px] text-[#C7EF6B]/90">
                              +{entry.points} pts
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-white/45 py-2">
                      No points earned yet.
                    </p>
                  )}
                </div>

                <div>
                  <h2 className="text-gray-400 text-xs font-medium mb-3 uppercase tracking-wide">
                    Outflows
                  </h2>
                  {redemptionsLoadError ? (
                    <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 mb-2">
                      <p className="text-sm text-red-300/95 mb-3">
                        {redemptionsLoadError}
                      </p>
                      <button
                        type="button"
                        onClick={() => void loadHistoryDrawerData()}
                        className="flex items-center text-sm space-x-2 px-4 py-2 bg-gray-300 text-black rounded-lg font-normal hover:bg-[#B8E55A] transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Retry</span>
                      </button>
                    </div>
                  ) : pointsRedemptions.length > 0 ? (
                    <div className="space-y-3">
                      {pointsRedemptions.map((record) => (
                        <div
                          key={record.id}
                          className="flex items-center justify-between p-4 bg-[#151515] rounded-xl border border-[#505050]"
                        >
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full shrink-0">
                              <ArrowUpRight
                                size={20}
                                className="text-red-400"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-medium text-sm truncate">
                                {formatRedemptionTitle(record)}
                              </p>
                              <p className="text-white/40 text-xs truncate">
                                ₦
                                {record.discount_value_ngn.toLocaleString()} off
                                · {formatDrawerDate(record.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 pl-2">
                            <p className="font-semibold text-[13px] text-[#FF6B6B]/90">
                              -{record.points_spent} pts
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-white/45 py-2">
                      No redemptions yet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Error Drawer */}
      <ErrorDrawer
        isOpen={showErrorDrawer}
        onClose={() => setShowErrorDrawer(false)}
        title="Redemption Failed"
        message={errorMessage}
      />

      {/* Success Drawer */}
      <SuccessDrawer
        isOpen={showSuccessDrawer}
        onClose={() => {
          setShowSuccessDrawer(false);
          setSuccessData(null);
        }}
        title="Redemption Successful!"
        message={successMessage}
      />

      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Perks Guide"
        content={[
          "Save money on Lisar to earn points automatically.",
          "Points can be redeemed for discounts at participating partners.",
          "Offers and discount types depend on each partner.",
        ]}
      />

      <BottomNavigation currentPath="/perks" />
    </div>
  );
};
