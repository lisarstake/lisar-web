import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Wallet,
  Trophy,
  TrendingUp,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CampaignUser } from "@/services/campaigns/types";
import { campaignService } from "@/services/campaigns";

export const CampaignUserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<CampaignUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
