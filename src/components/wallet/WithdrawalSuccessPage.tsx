import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, CircleQuestionMark } from "lucide-react";
import { orchestrators } from "@/data/orchestrators";
import { getValidatorDisplayName } from "@/utils/routing";

export const WithdrawalSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { validatorId } = useParams<{ validatorId: string }>();

  // Get validator data
  const validatorName = getValidatorDisplayName(validatorId);
  const currentValidator = orchestrators.find(o => o.name === validatorName) || orchestrators[0];

  const handleBackClick = () => {
    navigate(`/validator-details/${currentValidator.slug}`);
  };

  const handleGoToHome = () => {
    navigate("/wallet");
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

        <h1 className="text-lg font-medium text-white">Confirm Withdrawal</h1>

        <div className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center">
          <CircleQuestionMark color="#86B3F7" size={16} />
        </div>
      </div>

      {/* Faded Amount (Background Element) */}
      <div className="text-center px-6 py-8">
        <h2 className="text-4xl font-bold text-white/20">800,000 LPT</h2>
      </div>

      {/* Success Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <h2 className="text-4xl font-bold text-white mb-4">Success!</h2>
        <p className="text-white text-center text-lg">
          Your withdrawal has been processed successfully
        </p>
      </div>

      {/* Go to Home Button */}
      <div className="px-6 pb-6">
        <button
          onClick={handleGoToHome}
          className="w-full py-4 rounded-xl font-semibold text-lg bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors"
        >
          Go to home page
        </button>
      </div>
    </div>
  );
};
