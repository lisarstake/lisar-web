import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Wallet,
  Trophy,
  TrendingUp,
  CheckCircle2,
  Circle,
  History,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CampaignUser, TopupHistory } from "@/services/campaigns/types";
import { campaignService } from "@/services/campaigns";

export const CampaignUserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<CampaignUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topupDialogOpen, setTopupDialogOpen] = useState(false);
  const [topupHistory, setTopupHistory] = useState<TopupHistory[] | null>(null);
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupError, setTopupError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      navigate("/campaigns");
      return;
    }

    const fetchUserDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await campaignService.getCampaignUserDetail(userId);

        if (response.success && response.data) {
          setUser(response.data);
        } else {
          setError(response.error || "Failed to load user details");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetail();
  }, [userId, navigate]);

  const getInitials = (email: string) => {
    const parts = email.split("@")[0].split(/[._+-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not started";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const fetchTopupHistory = async () => {
    if (!userId) return;
    setTopupLoading(true);
    setTopupError(null);
    try {
      const response = await campaignService.getUserTopups(userId);
      if (response.success && response.data) {
        setTopupHistory(response.data);
      } else {
        setTopupError(response.error || "Failed to load topup history");
      }
    } catch (err) {
      setTopupError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setTopupLoading(false);
    }
  };

  const handleTopupDialogOpenChange = (open: boolean) => {
    setTopupDialogOpen(open);
    if (!open) {
      setTopupHistory(null);
      setTopupError(null);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "active":
        return {
          label: "Active",
          color: "bg-blue-100 text-blue-800",
        };
      case "completed":
        return {
          label: "Completed",
          color: "bg-green-100 text-green-800",
        };
      case "champion":
        return {
          label: "Champion",
          color: "bg-orange-100 text-orange-800",
        };
      case "withdrawn":
        return {
          label: "Withdrawn",
          color: "bg-gray-100 text-gray-800",
        };
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-800",
        };
    }
  };

  const getTierInfo = (tier: number, user: CampaignUser) => {
    switch (tier) {
      case 1:
        return {
          title: "Tier 1 - Early Saver",
          subtitle: "Welcome Bonus",
          reward: "₦1,500",
          timeline: "7 days",
          color: "bg-green-100 text-green-800",
          requirements: [
            // {
            //   label: "KYC Completed",
            //   description: "Complete account verification",
            //   completed: user.milestones_by_tier.tier_1.some(
            //     (m) => m.milestone_type === "kyc_completed"
            //   ),
            // },
            {
              label: "First Deposit",
              description: `Minimum ₦18,000 (Deposited: ₦${formatAmount(user.first_deposit_amount_ngn || 0)})`,
              completed: user.milestones_by_tier.tier_1.some(
                (m) => m.milestone_type === "first_deposit"
              ),
            },
            {
              label: "7 Days of Earning",
              description: "Keep deposit active (no withdrawals)",
              completed: user.tier_1_completed_at !== null,
            },
            {
              label: "Day 8 Bonus Credited",
              description: "Bonus automatically credited after 7 days",
              completed: user.milestones_by_tier.tier_1.some(
                (m) => m.milestone_type === "day_8_bonus_credited"
              ),
            },
          ],
        };
      case 2:
        return {
          title: "Tier 2 - Consistent Saver",
          subtitle: "Growth Bonus",
          reward: "3,000",
          timeline: "30 days",
          color: "bg-blue-100 text-blue-800",
          requirements: [
            {
              label: "A: Consistent Saver",
              description: "Maintain ₦30K+ average balance for 30 days",
              completed: false,
            },
            {
              label: "B: Community Builder",
              description: "Refer 2 friends who deposit minimum amount each",
              completed: false,
            },
            {
              label: "C: UGC / Social",
              description:
                "Share earnings + story on social (50+ words, screenshot, tag @LISAR #LISARWins)",
              completed: false,
            },
          ],
        };
      case 3:
        return {
          title: "Tier 3 - Champion Saver",
          subtitle: "Premium Perks",
          reward: "Brand Merch + Perks",
          timeline: "60 days",
          color: "bg-orange-100 text-orange-800",
          requirements: [
            {
              label: "Deposit Milestone",
              description: "Reach ₦100,000 cumulative deposits",
              completed: false,
            },
            {
              label: "Referral Success",
              description:
                "Bring 2 friends who each deposit ₦20K+ and stay active 30+ days",
              completed: false,
            },
            {
              label: "Account Health",
              description:
                "Active account for 60 days (minimum balance maintained)",
              completed: false,
            },
            {
              label: "Storytelling",
              description:
                "Create detailed testimonial (60-90s video OR 300+ word case study OR 3+ post social series)",
              completed: false,
            },
          ],
        };
      default:
        return {
          title: `Tier ${tier}`,
          subtitle: "",
          reward: "TBD",
          timeline: "TBD",
          color: "bg-gray-100 text-gray-800",
          requirements: [],
        };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-16 text-center">
            <p className="text-gray-500 text-lg">
              {error || "Campaign user not found"}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              This feature is currently in development.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(user.status);
  const tierInfo = getTierInfo(user.current_tier, user);

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card>
        <CardContent className="px-6 sm:py-0">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <Avatar className="w-12 h-12">
              <AvatarImage src={undefined} />
              <AvatarFallback className="text-xl">
                {getInitials(user.user_email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {user.user_email}
                  </h1>
                  <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTopupDialogOpen(true);
                    fetchTopupHistory();
                  }}
                >
                  <History className="w-4 h-4 mr-2" />
                  View topup history
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
                <div className="flex items-center gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Joined Campaign</p>
                    <p className="font-medium">
                      {formatDate(user.enrolled_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Bonus Earned</p>
                    <p className="font-medium">
                      ₦{formatAmount(user.total_bonus_earned_ngn)}
                    </p>
                  </div>
                </div>
                <div className="items-center gap-2 text-sm hidden sm:flex">
                  <div>
                    <p className="text-gray-500 text-xs">Milestones</p>
                    <p className="font-medium">
                      {user.total_milestones_completed}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topup History Dialog */}
      <Dialog open={topupDialogOpen} onOpenChange={handleTopupDialogOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Topup history
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 min-h-0 -mx-2 px-2">
            {topupLoading && (
              <div className="flex flex-col gap-3 py-8">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            )}
            {!topupLoading && topupError && (
              <p className="text-sm text-red-600 py-4">{topupError}</p>
            )}
            {!topupLoading && !topupError && topupHistory && (
              <>
                {topupHistory.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4">
                    No topup history found.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {topupHistory.map((t) => (
                      <div
                        key={t.id}
                        className="rounded-lg border p-4 text-sm space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-medium">
                            {t.amount} {t.transaction_type}
                          </span>
                          <Badge
                            className={
                              t.status === "success"
                                ? "bg-green-100 text-green-800"
                                : t.status === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                            }
                          >
                            {t.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
                          <span>Network</span>
                          <span className="capitalize">{t.network}</span>
                          <span>Date</span>
                          <span>{formatDate(t.created_at)}</span>
                          <span>Wallet</span>
                          <span className="font-mono text-xs truncate" title={t.wallet_address}>
                            {t.wallet_address}
                          </span>
                          {t.transaction_hash && (
                            <>
                              <span>Tx hash</span>
                              <span
                                className="font-mono text-xs truncate"
                                title={t.transaction_hash}
                              >
                                {t.transaction_hash.slice(0, 8)}…
                                {t.transaction_hash.slice(-8)}
                              </span>
                            </>
                          )}
                          {t.error_reason && (
                            <>
                              <span>Error</span>
                              <span className="text-red-600">
                                {t.error_reason}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tier Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            {tierInfo.title}
          </CardTitle>
          <p className="text-sm text-gray-500">{tierInfo.subtitle}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Reward</p>
              <p className="text-lg font-bold text-gray-900">
                {tierInfo.reward}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Timeline</p>
              <p className="text-lg font-bold text-gray-900">
                {tierInfo.timeline}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements & Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Requirements & Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tierInfo.requirements.map((req, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="mt-0.5">
                  {req.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${req.completed ? "text-green-900" : "text-gray-900"}`}
                  >
                    {req.label}
                  </p>
                  {req.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {req.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {user.current_tier === 1 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 font-medium">
                Complete ALL of the activities above to earn the Welcome Bonus
              </p>
            </div>
          )}

          {user.current_tier === 2 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 font-medium">
                Complete ANY 2 of the 3 activities above to earn the Growth
                Bonus
              </p>
            </div>
          )}

          {user.current_tier === 3 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 font-medium">
                Complete ALL requirements to become a Champion and unlock
                premium perks
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
