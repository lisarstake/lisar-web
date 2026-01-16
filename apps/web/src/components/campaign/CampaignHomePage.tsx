import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  CircleQuestionMark,
  CheckCircle2,
  Circle,
  Copy,
  Trophy,
  Users,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { SuccessDrawer } from "@/components/ui/SuccessDrawer";
import { ErrorDrawer } from "@/components/ui/ErrorDrawer";
import { ActivitySelectionDrawer } from "@/components/ui/ActivitySelectionDrawer";
import { useCampaign } from "@/contexts/CampaignContext";
import { Button } from "../ui/button";
import { campaignService } from "@/services";

interface TierRequirement {
  label: string;
  description: string;
  completed: boolean;
}

export const CampaignHomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    campaignStatus,
    referralCode,
    referralStats,
    isLoading,
    copySuccess,
    handleCopyReferralCode,
    handleGenerateReferralCode,
    isGenerating,
  } = useCampaign();

  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [requirementsExpanded, setRequirementsExpanded] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showActivityDrawer, setShowActivityDrawer] = useState(false);
  const [isSubmittingActivities, setIsSubmittingActivities] = useState(false);

  // Get tier information based on current tier
  const getTierInfo = (
    tier: number = 1
  ): {
    title: string;
    subtitle: string;
    reward: string;
    timeline: string;
    color: string;
    requirements: TierRequirement[];
  } => {
    switch (tier) {
      case 1:
        return {
          title: "Early Saver (1/3)",
          subtitle: "Welcome Bonus",
          reward: "₦1,500",
          timeline: "7 days",
          color: "bg-blue-100 text-blue-950",
          requirements: [
            {
              label: "Make a Deposit",
              description: "Minimum ₦18,000",
              completed: false,
            },
            {
              label: "7 Days of Earning",
              description: "Keep deposit active (no withdrawals)",
              completed: false,
            },
            {
              label: "Day 8 Bonus Credited",
              description: "Bonus automatically credited after 7 days",
              completed: false,
            },
          ],
        };
      case 2:
        return {
          title: "Consistent Saver (2/3)",
          subtitle: "Growth Bonus",
          reward: "₦3,000",
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
                "Share earnings + story on social, tag @LISAR #LISARWins",
              completed: false,
            },
          ],
        };
      case 3:
        return {
          title: "Champion Saver (3/3)",
          subtitle: "Premium Perks",
          reward: "Merch + Perks",
          timeline: "60 days",
          color: "bg-blue-100 text-blue-800",
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
                "Share a testimonial (60-90s video)",
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

  const handleBackClick = () => {
    navigate("/earn");
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const handleSaveActivities = async (selectedActivities: string[]) => {
    setIsSubmittingActivities(true);
    try {
      const response = await campaignService.setTier2Milestones({
        activities: selectedActivities,
      });

      if (response.success) {
        setShowActivityDrawer(false);
        setSuccessMessage("Your activity selection has been saved successfully!");
        setShowSuccessDrawer(true);
      } else {
        setShowActivityDrawer(false);
        setErrorMessage("Sorry, couldn't complete action. Please try again.");
        setShowErrorDrawer(true);
      }
    } catch (error) {
      setShowActivityDrawer(false);
      setErrorMessage("Sorry, couldn't complete action. Please try again.");
      setShowErrorDrawer(true);
    } finally {
      setIsSubmittingActivities(false);
    }
  };

  // Tier 2 activities 
  const tier2Activities = [
    {
      id: "consistent_saver",
      label: "A: Consistent Saver",
      description: "Maintain ₦30K+ average balance for 30 days",
    },
    {
      id: "community_builder",
      label: "B: Community Builder",
      description: "Refer 2 friends who deposit minimum amount each",
    },
    {
      id: "social_proof",
      label: "C: UGC / Social",
      description:
        "Share earnings + story on social, tag @LISAR #LISARWins",
    },
  ];

  if (isLoading) {
    return (
      <div className="h-screen bg-[#050505] text-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-8">
          <button
            onClick={handleBackClick}
            className="w-8 h-8 flex items-center justify-center"
          >
            <ChevronLeft color="#C7EF6B" />
          </button>

          <h1 className="text-lg font-medium text-white">Campaign</h1>

          <button
            onClick={handleHelpClick}
            className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
          >
            <CircleQuestionMark color="#86B3F7" size={16} />
          </button>
        </div>

        {/* Loading Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
          <Skeleton className="h-64 w-full bg-gray-600 mb-6" />
         
          <Skeleton className="h-48 w-full bg-gray-600" />
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation currentPath="/campaign" />
      </div>
    );
  }

  // Extract tier from campaign status or default to 1
  const currentTier: number = (campaignStatus as any)?.current_tier || 1;
  const tierInfo = getTierInfo(currentTier);

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8">
        <button
          onClick={handleBackClick}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ChevronLeft color="#C7EF6B" />
        </button>

        <h1 className="text-lg font-medium text-white">Campaign</h1>

        <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#86B3F7" size={16} />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
        {/* Campaign Title */}
        {/* <div className="mb-4">
          <h2 className="text-xl font-bold text-white mb-1">
            Early Savers Campaign 🎯⚡
          </h2>
          <p className="text-xs text-gray-400">
            Build healthy savings habits and earn rewards!
          </p>
        </div> */}

        <div className="space-y-4">
          {/* Campaign Image */}
          <div className="w-full h-48 relative rounded-lg overflow-hidden">
            <img
              src="/1.png"
              alt="Early Savers Campaign"
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Current Tier Card */}
          <Card className="bg-[#1a1a1a] border-gray-800 py-0">
            <CardContent className="px-4 py-4">
              <div className="flex items-center justify-between gap-2 mb-4">
                <CardTitle className="flex items-center gap-2 text-white text-base">
                  <Trophy className="w-4 h-4 text-[#C7EF6B]" />
                  {tierInfo.title}
                </CardTitle>
                <Badge
                  className={`${tierInfo.color} text-xs px-2 py-0.5 rounded-full`}
                >
                  {tierInfo.subtitle}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 bg-[#2a2a2a] rounded-md">
                  <p className="text-xs text-gray-400 mb-0.5">Reward</p>
                  <p className="text-sm font-semibold text-white/90">
                    {tierInfo.reward}
                  </p>
                </div>
                <div className="p-2 bg-[#2a2a2a] rounded-md">
                  <p className="text-xs text-gray-400 mb-0.5">Timeline</p>
                  <p className="text-sm font-semibold text-white/90">
                    {tierInfo.timeline}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements Card - Collapsible */}
          <Card className="bg-[#1a1a1a] border-gray-800 py-0">
            <CardContent className="px-4 py-3">
              {/* Collapsible Header */}
              <button
                onClick={() => setRequirementsExpanded(!requirementsExpanded)}
                className="flex items-center justify-between w-full mb-0"
              >
                <CardTitle className="text-white text-sm">
                  Requirements
                </CardTitle>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    requirementsExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Collapsible Content */}
              {requirementsExpanded && (
                <div>
                  <div className="space-y-2">
                    {tierInfo.requirements.map((req, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-2 p-2 rounded-lg transition-colors mt-3 ${
                          req.completed
                            ? "bg-[#C7EF6B]/10 hover:bg-[#C7EF6B]/20 border border-[#C7EF6B]/30"
                            : "bg-[#2a2a2a] hover:bg-[#333333]"
                        }`}
                      >
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${req.completed ? "text-[#C7EF6B]" : "text-white/90"}`}
                          >
                            {req.label}
                          </p>
                          {req.description && (
                            <p
                              className={`text-xs mt-0.5 ${req.completed ? "text-[#C7EF6B]/90" : "text-gray-400"}`}
                            >
                              {req.description}
                            </p>
                          )}
                        </div>
                        <div className="self-center">
                          {req.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-[#C7EF6B]" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {currentTier === 1 && (
                    <div className={`mt-3 p-2 ${tierInfo.color} rounded-md`}>
                      <p className="text-xs font-medium">
                        Complete the activities above to claim the Welcome Bonus
                      </p>
                    </div>
                  )}

                  {currentTier === 2 && (
                    <div className={`mt-3 p-2 ${tierInfo.color} rounded-md`}>
                      <p className="text-xs font-medium">
                        Complete ANY 2 of the 3 activities above to claim the
                        Growth Bonus
                      </p>
                    </div>
                  )}

                  {currentTier === 3 && (
                    <div className={`mt-3 p-2 ${tierInfo.color} rounded-md`}>
                      <p className="text-xs font-medium">
                        Complete ALL activities to become a Champion and unlock
                        premium perks
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Referral Code Card */}
          <Card className="bg-[#1a1a1a] border-gray-800 py-0">
            <CardContent className="px-4 py-3">
              <div className="mb-3">
                <CardTitle className="flex items-center gap-1 text-white text-sm">
                  <Users className="w-4 h-4 text-[#C7EF6B]" />
                   Referral Code
                </CardTitle>
                <p className="text-xs text-gray-400">
                  Share your code and earn rewards when friends join
                </p>
              </div>
              {referralCode ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 py-2 px-3.5 bg-[#2a2a2a] rounded-md">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#C7EF6B] tracking-wider">
                        {referralCode}
                      </p>
                    </div>
                    <button
                      onClick={handleCopyReferralCode}
                      className="p-1.5 bg-[#C7EF6B] hover:bg-[#B8E55A] text-black rounded-md transition-colors"
                    >
                      {copySuccess ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">
                    You currently have {referralStats?.totalReferrals || 0} referral(s)
                    {referralStats && referralStats.totalReferrals > 0 && " 🎉"}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 py-2 px-3.5 bg-[#2a2a2a] rounded-md">
                    <p className="text-sm font-medium text-gray-400">
                      No referral code yet
                    </p>
                  </div>
                  <Button
                    onClick={async () => {
                      const result = await handleGenerateReferralCode();
                      if (result.success) {
                        setSuccessMessage(result.message);
                        setShowSuccessDrawer(true);
                      } else {
                        setErrorMessage(result.message);
                        setShowErrorDrawer(true);
                      }
                    }}
                    disabled={isGenerating}
                    className="bg-[#C7EF6B] hover:bg-[#B8E55A] text-black rounded-md transition-colors px-4"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Generate"
                    )}
                  </Button>
                  
                </div>
              )}
            </CardContent>
          </Card>

          {/* Call to Action */}
          {currentTier === 1 && (
            <div className="p-4 bg-linear-to-r from-[#C7EF6B]/20 to-[#86B3F7]/20 border border-[#C7EF6B]/30 rounded-lg mb-6">
              <h3 className="text-white font-semibold mb-1 text-sm">
                Ready to begin?
              </h3>
              <p className="text-xs text-gray-300 mb-3">
                Make your first deposit of ₦18,000 or more to begin your journey
                to claiming the Welcome Bonus.
              </p>
              <button
                onClick={() =>
                  navigate("/deposit", {
                    state: {
                      walletType: "savings",
                      provider: "perena",
                      tierNumber: 2,
                      tierTitle: "USD Plus",
                    },
                  })
                }
                className="w-full py-2.5 bg-[#C7EF6B] hover:bg-[#B8E55A] text-black font-medium rounded-lg transition-colors text-sm"
              >
                Make a Deposit
              </button>
            </div>
          )}

          {currentTier === 2 && (
            <div className="p-4 bg-linear-to-r from-[#C7EF6B]/20 to-[#86B3F7]/20 border border-[#C7EF6B]/30 rounded-lg mb-6">
              <h3 className="text-white font-semibold mb-1 text-sm">
                Choose Your Path 
              </h3>
              <p className="text-xs text-gray-300 mb-3">
                Select 2 out of 3 activities to complete in order to earn the Growth Bonus.
              </p>
              <button
                onClick={() => setShowActivityDrawer(true)}
                className="w-full py-2.5 bg-[#C7EF6B] hover:bg-[#B8E55A] text-black font-medium rounded-lg transition-colors text-sm"
              >
                Choose Your Activities
              </button>
            </div>
          )}

          {currentTier === 3 && (
            <div className="p-4 bg-gradient-to-r from-[#C7EF6B]/20 to-[#86B3F7]/20 border border-[#C7EF6B]/30 rounded-lg mb-6">
              <h3 className="text-white font-semibold mb-1 text-sm">
                Champion Level Challenge
              </h3>
              <p className="text-xs text-gray-300 mb-3">
                Complete all activities to unlock premium perks and brand merchandise.
              </p>
              <button
                onClick={() =>
                  navigate("/deposit", {
                    state: {
                      walletType: "savings",
                      provider: "perena",
                      tierNumber: 2,
                      tierTitle: "USD Plus",
                    },
                  })
                }
                className="w-full py-2.5 bg-[#C7EF6B] hover:bg-[#B8E55A] text-black font-medium rounded-lg transition-colors text-sm"
              >
                Make a Deposit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Campaign Guide"
        content={[
          "Join the Early Savers Campaign to earn rewards by building healthy savings habits.",
          "Complete tier requirements to unlock bonuses and perks.",
          "Share your referral code with friends to earn additional rewards.",
        ]}
      />

      {/* Success Drawer */}
      <SuccessDrawer
        isOpen={showSuccessDrawer}
        onClose={() => setShowSuccessDrawer(false)}
        message={successMessage}
      />

      {/* Error Drawer */}
      <ErrorDrawer
        isOpen={showErrorDrawer}
        onClose={() => setShowErrorDrawer(false)}
        message={errorMessage}
      />

      {/* Activity Selection Drawer */}
      <ActivitySelectionDrawer
        isOpen={showActivityDrawer}
        onClose={() => setShowActivityDrawer(false)}
        onSave={handleSaveActivities}
        activities={tier2Activities}
        isSubmitting={isSubmittingActivities}
      />

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/campaign" />
    </div>
  );
};
