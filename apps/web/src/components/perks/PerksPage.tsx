import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
} from "@/components/ui/drawer";
import { ErrorDrawer } from "@/components/general/ErrorDrawer";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { SuccessDrawer } from "@/components/general/SuccessDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
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

const PARTNER_CARDS = [
  {
    partner: {
      id: "cafe-one",
      name: "Cafe One",
      display_name: "Café One",
      referral_code: "",
      is_active: true,
    } as PointsPartner,
    video: "/cafeone1.mp4",
    description: "Save on Lisar and accumulate points redeemable as discounts on all purchases at Café One.",
    benefits: [
      { icon: Gift, text: "Enjoy discount on different select items" },
      { icon: LampDesk, text: "Offers include snacks, drinks, and co-working space" },
    ],
  },
  {
    partner: {
      id: "shuttlers",
      name: "Shuttlers",
      display_name: "Shuttlers",
      referral_code: "",
      is_active: true,
    } as PointsPartner,
    video: "/shuttlers.mp4",
    description: "Save on Lisar and accumulate points redeemable as rides on Shuttlers.",
    benefits: [
      { icon: Gift, text: "Enjoy discount on booked rides" },
      { icon: LampDesk, text: "Offers include both one way and return trips" },
    ],
  },
];

export const PerksPage: React.FC = () => {
  const navigate = useNavigate();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [benefitsExpanded, setBenefitsExpanded] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const CARD_WIDTH_RATIO = 0.92;

  const {
    balance,
    loading,
    refetch,
    pointsHistory,
    pointsRedemptions,
    historyLoading,
    historyLoadError,
    redemptionsLoadError,
    loadHistoryData,
  } = usePointsContext();
  const [redeemingPartnerId, setRedeemingPartnerId] = useState<string | null>(
    null,
  );

  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successData, setSuccessData] =
    useState<PointsRedemptionRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!historyDrawerOpen) return;
    loadHistoryData();
  }, [historyDrawerOpen, loadHistoryData]);

  const totalPoints = balance?.total_points ?? 0;

  const handleCarouselScroll = useCallback(() => {
    if (!carouselRef.current) return;
    const { scrollLeft, offsetWidth } = carouselRef.current;
    const cardWidth = offsetWidth * CARD_WIDTH_RATIO + 12;
    const index = Math.round(scrollLeft / cardWidth);
    const clamped = Math.min(Math.max(index, 0), PARTNER_CARDS.length - 1);
    setCarouselIndex(clamped);
  }, []);

  const scrollToPartner = useCallback((index: number) => {
    if (!carouselRef.current) return;
    const clamped = Math.min(Math.max(index, 0), PARTNER_CARDS.length - 1);
    const { offsetWidth } = carouselRef.current;
    const cardWidth = offsetWidth * CARD_WIDTH_RATIO + 12;
    carouselRef.current.scrollTo({
      left: clamped * cardWidth,
      behavior: "smooth",
    });
    setCarouselIndex(clamped);
  }, []);

  const handleBackClick = () => {
    navigate("/earn");
  };

  const handleRedeemPoints = async (partner: PointsPartner) => {
    if (redeemingPartnerId) return;

    if (totalPoints < 100) {
      const needed = 100 - totalPoints;
      toast.error(`Not enough points to redeem, you need ${needed} more points.`);
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
    !historyLoading &&
    Boolean(historyLoadError) &&
    Boolean(redemptionsLoadError);

  type HistoryItem =
    | { type: "earned"; data: PointsHistoryEntry }
    | { type: "redeemed"; data: PointsRedemptionRecord };

  const mergedHistory = useMemo<HistoryItem[]>(() => {
    const items: HistoryItem[] = [
      ...pointsHistory.map((h) => ({ type: "earned" as const, data: h })),
      ...pointsRedemptions.map((r) => ({ type: "redeemed" as const, data: r })),
    ];
    items.sort(
      (a, b) =>
        new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime(),
    );
    return items;
  }, [pointsHistory, pointsRedemptions]);

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
              <video
                key={carouselIndex}
                src={PARTNER_CARDS[carouselIndex].video}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mb-2">
              <div
                ref={carouselRef}
                onScroll={handleCarouselScroll}
                className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
              {PARTNER_CARDS.map((pc, i) => (
                <div
                  key={pc.partner.id}
                  className="flex-[0_0_100%] shrink-0 snap-center min-w-0"
                >
                  <Card className="bg-[#151515] border-[#2a2a2a] py-0 rounded-2xl">
                    <CardContent className="px-4 py-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <CardTitle className="text-white/90 text-lg mb-0 flex-1 min-w-0">
                          {pc.partner.display_name}
                        </CardTitle>
                        <button
                          type="button"
                          onClick={() => setHistoryDrawerOpen(true)}
                          className="shrink-0 text-[13px] font-medium text-[#86B3F7] hover:text-[#96C3F7] underline underline-offset-2 pt-0.5"
                        >
                          Points history
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mb-4">
                        {pc.description}
                      </p>
                      <div className="grid grid-cols-[2.5fr_1fr] gap-3">
                        <div className="p-2 bg-[#505050] rounded-md">
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs font-semibold text-white/90">
                             My Balance: {`${totalPoints} point(s)`}
                            </p>
                          </div>
                        </div>
                        {pc.partner.id === "shuttlers" ? (
                          <span className="inline-flex text-nowrap items-center justify-center bg-[#505050] text-white/60 font-medium text-xs px-2 py-1 rounded-full cursor-not-allowed">
                            Coming Soon
                          </span>
                        ) : (
                          <Button
                            type="button"
                            disabled={redeemingPartnerId !== null}
                            onClick={() => handleRedeemPoints(pc.partner)}
                            className="bg-[#C7EF6B] hover:bg-[#B8E55A] disabled:opacity-40 disabled:pointer-events-none text-black font-medium text-xs px-2 py-1 rounded-full transition-colors"
                          >
                            {redeemingPartnerId === pc.partner.id
                              ? "…"
                              : "Redeem"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
            </div>

            <div className="flex justify-center gap-1.5 mb-4">
              {PARTNER_CARDS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === carouselIndex ? "w-2.5 bg-[#86B3F7]" : "w-1.5 bg-white/30"
                  }`}
                />
              ))}
            </div>

            {/* Benefits Card - Collapsible */}
            <Card className="bg-[#1a1a1a] border-gray-800 py-0 mb-4">
              <CardContent className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setBenefitsExpanded(!benefitsExpanded)}
                  className="flex items-center justify-between w-full mb-0"
                >
                  <CardTitle className="text-white/90 text-sm">
                    Discount Benefits
                  </CardTitle>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${benefitsExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                {benefitsExpanded && (
                  <div className="space-y-3 mt-3">
                    {PARTNER_CARDS[carouselIndex].benefits.map((benefit, bi) => (
                      <div
                        key={bi}
                        className="flex items-center gap-2 p-2 rounded-lg bg-[#505050]"
                      >
                        <benefit.icon className="w-4 h-4 text-white/90 shrink-0" />
                        <p className="text-xs text-white/90">
                          {benefit.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="bg-[#1a1a1a] border-gray-800 py-0 mb-4">
              <CardContent className="px-4 py-4">
                <CardTitle className="text-white/90 text-sm mb-3">
                  How Perks Works
                </CardTitle>
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">
                    1. Save money on Lisar and earn points
                  </p>
                  <p className="text-xs text-gray-400">
                    2. Earned points are automatically tracked
                  </p>
                  <p className="text-xs text-gray-400">
                    3. Redeem points at different participating partners
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="p-4 bg-[#1a1a1a] border border-gray-800 rounded-lg mb-6">
              <h3 className="text-white/90 font-semibold mb-1 text-sm">
                Want points?
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                Save on Lisar and start accumulating points redeemable as discounts across different services!
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
            <h2 className="text-lg font-medium text-white mb-4">Activity</h2>
            {historyLoading ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={`skel-${i}`}
                    className="flex items-center justify-between p-4 bg-[#151515] rounded-xl border border-[#505050] animate-pulse"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 bg-gray-700 rounded-full shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-700 rounded w-3/5" />
                        <div className="h-3 bg-gray-700 rounded w-2/5" />
                      </div>
                    </div>
                    <div className="h-4 bg-gray-700 rounded w-16 shrink-0 ml-2" />
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
                  onClick={() => void loadHistoryData()}
                  className="flex items-center text-sm space-x-2 px-4 py-2 bg-gray-300 text-black rounded-lg font-normal hover:bg-[#B8E55A] transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry</span>
                </button>
              </div>
            ) : mergedHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-16 h-16 bg-gray-100/10 rounded-full flex items-center justify-center mb-6">
                  <Info className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  No activity yet
                </h3>
                <p className="text-gray-400 text-center text-sm max-w-sm">
                  Earn points by saving on Lisar. Redemptions will appear after you redeem.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {mergedHistory.map((item) => (
                  <div
                    key={`${item.type}-${item.data.id}`}
                    className="flex items-center justify-between p-4 bg-[#151515] rounded-xl border border-[#505050]"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full shrink-0">
                        {item.type === "earned" ? (
                          <ArrowDownLeft size={20} className="text-green-400" />
                        ) : (
                          <ArrowUpRight size={20} className="text-red-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white/80 text-sm truncate">
                          {item.type === "earned"
                            ? formatHistoryLineTitle(item.data)
                            : formatRedemptionTitle(item.data)}
                        </p>
                        <p className="text-white/40 text-xs">
                          {item.type === "earned"
                            ? formatDrawerDate(item.data.created_at)
                            : `₦${item.data.discount_value_ngn.toLocaleString()} off · ${formatDrawerDate(item.data.created_at)}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <p className={`font-semibold text-[13px] text-white/80`}>
                        {item.type === "earned" ? `+${item.data.points} pts` : `-${item.data.points_spent} pts`}
                      </p>
                    </div>
                  </div>
                ))}
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
