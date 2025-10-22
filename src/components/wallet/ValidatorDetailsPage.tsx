import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  CircleQuestionMark,
  ArrowUpRight,
  Share,
  ChartSpline,
  SquareMinus,
} from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { ShareDrawer } from "@/components/general/ShareDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { orchestrators } from "@/data/orchestrators";
import { getValidatorDisplayName } from "@/utils/routing";

export const ValidatorDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { validatorId } = useParams<{ validatorId: string }>();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showShareDrawer, setShowShareDrawer] = useState(false);

  // Get validator data from orchestrators using slug
  const validatorName = getValidatorDisplayName(validatorId);
  const currentValidator = orchestrators.find(o => o.name === validatorName) || orchestrators[0];

  const handleBackClick = () => {
    // Check if we came from portfolio or validator page
    if (document.referrer.includes("/portfolio")) {
      navigate("/portfolio");
    } else {
      navigate("/validator");
    }
  };

  const handleStakeClick = () => {
    navigate(`/stake/${currentValidator.slug}`);
  };

  const handleWithdrawClick = () => {
    navigate(`/withdraw-network/${currentValidator.slug}`);
  };

  const handleUnstakeClick = () => {
    navigate(`/unstake-amount/${currentValidator.slug}`);
  };

  const handleShareClick = () => {
    setShowShareDrawer(true);
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

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

        <h1 className="text-lg font-medium text-white">
          {currentValidator.name}
        </h1>

        <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#86B3F7" size={16} />
        </button>
      </div>

      {/* Current Round */}
      <div className="px-6 py-4 text-center">
        <p className="text-white/70 text-sm mb-2">Current round</p>
        <h2 className="text-2xl font-bold text-white">8,000 LPT</h2>
      </div>

      {/* Graph Section */}
      <div className="px-6 py-4">
        <div className="bg-[#1a1a1a] rounded-xl">
          <div className="h-32 bg-[#0a0a0a] rounded-lg relative overflow-hidden">
            {/* Mock graph line */}
            <svg className="w-full h-full" viewBox="0 0 300 100">
              <defs>
                <linearGradient
                  id="lineGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#C7EF6B" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#C7EF6B" stopOpacity="1" />
                </linearGradient>
              </defs>
              <path
                d="M 20 80 Q 60 40 100 50 T 180 30 T 260 40"
                stroke="#C7EF6B"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M 20 80 Q 60 40 100 50 T 180 30 T 260 40 L 260 100 L 20 100 Z"
                fill="url(#lineGradient)"
              />
              {/* Highlight line for Round 2390 */}
              <line
                x1="180"
                y1="0"
                x2="180"
                y2="100"
                stroke="#FFD700"
                strokeWidth="2"
                strokeDasharray="4,4"
              />
              {/* Tooltip */}
              <rect
                x="160"
                y="10"
                width="40"
                height="20"
                fill="#FFD700"
                rx="4"
              />
              <text
                x="180"
                y="22"
                textAnchor="middle"
                fill="#000"
                fontSize="8"
                fontWeight="bold"
              >
                Round 2390
              </text>
            </svg>

            {/* X-axis labels */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-between px-4">
              <span className="text-xs text-gray-400">Round 2378</span>
              <span className="text-xs text-gray-400">Round 2384</span>
              <span className="text-xs text-gray-400">Round 2390</span>
              <span className="text-xs text-gray-400">Round 2396</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-around px-6 py-6">
        <button
          onClick={handleStakeClick}
          className="flex flex-col items-center justify-center space-y-2 w-20 h-20 bg-[#2a2a2a] rounded-xl"
        >
          <ChartSpline size={16} color="#C7EF6B" />
          <span className="text-gray-300 text-xs">Stake</span>
        </button>

        <button
          onClick={handleUnstakeClick}
          className="flex flex-col items-center justify-center space-y-2 w-20 h-20 bg-[#2a2a2a] rounded-xl"
        >
          <SquareMinus size={20} color="#C7EF6B" />
          <span className="text-gray-300 text-xs">Unstake</span>
        </button>

        <button
          onClick={handleWithdrawClick}
          className="flex flex-col items-center justify-center space-y-2 w-20 h-20 bg-[#2a2a2a] rounded-xl"
        >
          <ArrowUpRight size={20} color="#C7EF6B" />
          <span className="text-gray-300 text-xs">Withdraw</span>
        </button>

        <button
          onClick={handleShareClick}
          className="flex flex-col items-center justify-center space-y-2 w-20 h-20 bg-[#2a2a2a] rounded-xl"
        >
          <Share size={20} color="#C7EF6B" />
          <span className="text-gray-300 text-xs">Share</span>
        </button>
      </div>

      {/* About Section */}
      <div
        className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>
          {`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        <h3 className="text-lg font-semibold text-white mb-2">About</h3>

        <div className="space-y-4">
          <p className="text-gray-300 text-xs leading-relaxed">
            NeuralStream.eth is a next-generation Livepeer Orchestrator,
            leveraging cutting-edge Blackwell GPU technology for
            ultra-efficient, high-performance video transcoding.
          </p>

          <div className="space-y-2">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-[#C7EF6B] rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300 text-sm">
                Powered by NVIDIA Blackwell for unparalleled GPU acceleration
              </p>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-[#C7EF6B] rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300 text-sm">
                Optimized for AI and Web3 streaming
              </p>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-[#C7EF6B] rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300 text-sm">
                Reliable & scalable infrastructure for seamless transcoding
              </p>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-[#C7EF6B] rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300 text-sm">
                Built for stakers & decentralization - Join us in shaping the
                future of decentralized video!
              </p>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-[#C7EF6B] rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300 text-sm">
                Stake with NeuralStream.eth and earn rewards while supporting
                the evolution of Web3 streaming!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Validator Guide"
        content={[
          "Review this validator's performance, APY, total stake, and fees before staking.",
          "APY shows your potential earnings, total stake shows community trust, and fees show the validator's charge.",
          "Click 'Stake' to start earning or 'Unstake' to remove your current stake."
        ]}
      />

      {/* Share Drawer */}
      <ShareDrawer
        isOpen={showShareDrawer}
        onClose={() => setShowShareDrawer(false)}
        validatorName={currentValidator.name}
        validatorId={validatorId || ""}
      />

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/validator" />
    </div>
  );
};
