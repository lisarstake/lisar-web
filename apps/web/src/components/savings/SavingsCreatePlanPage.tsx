import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";

interface PlanRowProps {
  title: string;
  subtitle: string;
  apy: string;
  imageSrc: string;
  onClick?: () => void;
}

const PlanRow: React.FC<PlanRowProps> = ({
  title,
  subtitle,
  apy,
  imageSrc,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between py-3 text-left rounded-xl"
    >
      <div className="flex items-center gap-3">
        <img src={imageSrc} alt="asset" className="h-10 w-10 rounded-full object-cover" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-[#909a95]">{subtitle}</p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm font-semibold">{apy}</p>
        <p className="text-xs text-[#909a95]">per annum</p>
      </div>
    </button>
  );
};

export const SavingsCreatePlanPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="h-10 w-10 rounded-full bg-[#13170a] flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>

        <h1 className="text-lg font-medium text-white">Create plan</h1>

        <div className="w-8 h-8" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide">
        <h2 className="mt-6 text-base font-semibold">USD Savings</h2>
        <div className="mt-3 rounded-xl bg-[#13170a] px-4">
          <PlanRow
            title="Flexible Savings"
            subtitle="Earn daily, withdraw anytime"
            apy="Up to 10%"
            imageSrc="/usdc.svg"
            onClick={() => navigate("/wallet/savings/create-flexible?asset=usd")}
          />
        </div>

        <h2 className="mt-6 text-base font-semibold">Crypto Savings</h2>
        <div className="mt-3 rounded-xl bg-[#13170a] px-4">
          <PlanRow
            title="Flexible Savings"
            subtitle="Earn daily, withdraw anytime"
            apy="Up to 49%"
            imageSrc="/livepeer.webp"
            onClick={() => navigate("/wallet/savings/create-flexible?asset=crypto")}
          />
        </div>
      </div>

      <BottomNavigation currentPath="/wallet" />
    </div>
  );
};
