import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Wallet,
} from "lucide-react";
import { formatDate, formatAmount, getInitials } from "@/lib/formatters";
import type { CampaignUser, CampaignTier } from "@/services/campaigns/types";

// TODO: Replace with real API call when endpoint is ready
const fetchCampaignUserDetail = async (
  userId: string
): Promise<CampaignUser | null> => {
  // Dummy data for preview
  const dummyUsers: Record<string, CampaignUser> = {
    user_tier1_001: {
      user_id: "user_tier1_001",
      full_name: "Chioma Adewale",
      email: "chioma.adewale@example.com",
      img: null,
      joined_campaign: "2026-01-05T10:30:00.000Z",
      wallet_balance: 25000,
      tier: "tier_1",
      status: "in_progress",
    },
    user_tier2_001: {
      user_id: "user_tier2_001",
      full_name: "Emeka Okonkwo",
      email: "emeka.okonkwo@example.com",
      img: null,
      joined_campaign: "2025-12-10T14:20:00.000Z",
      wallet_balance: 45000,
      tier: "tier_2",
      status: "completed",
    },
    user_tier3_001: {
      user_id: "user_tier3_001",
      full_name: "Aisha Bello",
      email: "aisha.bello@example.com",
      img: null,
      joined_campaign: "2025-11-15T09:15:00.000Z",
      wallet_balance: 120000,
      tier: "tier_3",
      status: "in_progress",
    },
  };

  // Return dummy user if exists, otherwise null
  return Promise.resolve(dummyUsers[userId] || null);
};

interface TierRequirement {
  label: string;
  description: string;
  completed: boolean;
  details?: string;
}

const getTierInfo = (tier: CampaignTier) => {
  switch (tier) {
    case "tier_1":
      return {
        name: "Tier 1: Welcome Bonus",
        subtitle: "Early Saver",
        reward: "₦1,500",
        timeline: "7 days",
        color: "bg-green-100 text-green-800",
        requirements: [
          {
            label: "Account Verification",
            description: "Complete KYC",
            completed: false,
          },
          {
            label: "First Deposit & Savings",
            description: "Minimum ₦18,000",
            completed: false,
          },
          {
            label: "7 Days of Earning",
            description: "Keep deposit active (no withdrawals)",
            completed: false,
          },
          {
            label: "Feedback",
            description: "Share what works and what doesn't work",
            completed: false,
          },
        ],
      };
    case "tier_2":
      return {
        name: "Tier 2: Growth Bonus",
        subtitle: "Consistent Saver",
        reward: "TBD",
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
            description: "Refer 2 friends who deposit minimum amount",
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
    case "tier_3":
      return {
        name: "Tier 3: Champion Bonus",
        subtitle: "Champion Saver",
        reward: "Premium Perks",
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
            description: "Active account for 60 days with minimum balance",
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
  }
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case "in_progress":
      return {
        label: "In Progress",
        color: "bg-blue-100 text-blue-800",
        icon: Clock,
      };
    case "completed":
      return {
        label: "Completed",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle2,
      };
    case "failed":
      return {
        label: "Failed",
        color: "bg-red-100 text-red-800",
        icon: XCircle,
      };
    default:
      return {
        label: status,
        color: "bg-gray-100 text-gray-800",
        icon: Clock,
      };
  }
};

export const CampaignUserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<CampaignUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!userId) return;
      setIsLoading(true);
      const data = await fetchCampaignUserDetail(userId);
      setUser(data);
      setIsLoading(false);
    };

    loadUser();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-16 text-center">
            <p className="text-gray-500 text-lg">Campaign user not found</p>
            <p className="text-sm text-gray-400 mt-2">
              This feature is currently in development.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tierInfo = getTierInfo(user.tier);
  const statusInfo = getStatusInfo(user.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.img || undefined} />
              <AvatarFallback className="text-2xl">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.full_name}
                  </h1>
                  <p className="text-gray-500">{user.email}</p>
                </div>
                <Badge className={statusInfo.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusInfo.label}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Joined Campaign</p>
                    <p className="font-medium">
                      {formatDate(user.joined_campaign)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Wallet className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Wallet Balance</p>
                    <p className="font-medium">
                      {formatAmount(user.wallet_balance)} USDC
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Current Tier</p>
                    <p className="font-medium">{tierInfo.subtitle}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            {tierInfo.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Requirements / Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Requirements & Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tierInfo.requirements.map((req, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg"
              >
                <div className="mt-0.5">
                  {req.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
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

          {user.tier === "tier_1" && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 font-medium">
                Complete ALL of the activities above to earn the Welcome Bonus
              </p>
            </div>
          )}

          {user.tier === "tier_2" && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 font-medium">
                Complete ANY 2 of the 3 activities above to earn the Growth
                Bonus
              </p>
            </div>
          )}

          {user.tier === "tier_3" && (
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
