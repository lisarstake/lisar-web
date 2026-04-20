import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { YIELD_ASSET_PICKER_PATH } from "@/lib/yieldPaths";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useStablesApy } from "@/hooks/useStablesApy";

interface YieldAssetRowProps {
  title: string;
  subtitle: string;
  apy: string;
  imageSrc: string;
  isComingSoon?: boolean;
  onClick?: () => void;
}

const YieldAssetRow: React.FC<YieldAssetRowProps> = ({
  title,
  subtitle,
  apy,
  imageSrc,
  isComingSoon,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isComingSoon}
      className={`flex w-full items-center justify-between py-3 text-left rounded-xl ${isComingSoon ? "opacity-75" : ""
        }`}
    >
      <div className="flex items-center gap-3">
        <img src={imageSrc} alt="asset" className="h-10 w-10 rounded-full object-contain" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-[#909a95]">{subtitle}</p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-[13px] font-medium italic">{apy}</p>
        <p className="text-xs text-[#909a95]">
          {isComingSoon ? "" : "per annum"}
        </p>
      </div>
    </button>
  );
};

export const YieldAssetPickerPage: React.FC = () => {
  const navigate = useNavigate();
  const { perena: perenaApy, isLoading } = useStablesApy();
  const { orchestrators } = useOrchestrators();

  const stablesApyPercent = useMemo(() => {
    if (!perenaApy) return null;
    return Math.max(0, perenaApy * 100);
  }, [perenaApy]);

  const stakingApyPercent = useMemo(() => {
    if (!orchestrators?.length) return null;
    const maxApy = orchestrators.reduce((acc, orch) => {
      const value =
        typeof orch.apy === "string"
          ? parseFloat(orch.apy.replace("%", "")) || 0
          : typeof orch.apy === "number"
            ? orch.apy
            : 0;
      return Math.max(acc, value);
    }, 0);
    return maxApy > 0 ? maxApy : null;
  }, [orchestrators]);

  const formatApy = (value: number | null) => {
    if (isLoading || value === null) return "...";
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden">
      <div className="shrink-0 flex items-start justify-between px-6 py-6">
        <div>
          <h1 className="text-lg font-medium text-white">Yields</h1>
          <p className="text-xs text-gray-500">
            Choose an asset to start earning daily rewards
          </p>
        </div>
        <div className="w-8 h-8" />
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-20 scrollbar-hide space-y-3">


        <div className="rounded-xl bg-[#2a2a2a] px-4">
          <YieldAssetRow
            title="USDC"
            subtitle="Earn daily, withdraw instantly"
            apy="Up to 12%"
            imageSrc="/usdc.svg"
            onClick={() => navigate("/wallet/savings")}
          />
        </div>
        <div className="rounded-xl bg-[#2a2a2a] px-4">
          <YieldAssetRow
            title="Livepeer"
            subtitle="Earn daily, 7 days unlock period"
            apy="Up to 49%"
            imageSrc="/livepeer.webp"
            onClick={() => navigate("/wallet/staking")}
          />
        </div>
        {/* <div className="rounded-xl bg-[#2a2a2a] px-4">
          <YieldAssetRow
            title="USDT"
            subtitle="Earn daily, withdraw anytime"
            apy="Soon"
            imageSrc="/usdt.svg"
            isComingSoon
          />
        </div> */}
        <div className="rounded-xl bg-[#2a2a2a] px-4">
          <YieldAssetRow
            title="Solana"
            subtitle="Earn daily, 3 days unlock period"
            apy="Soon"
            imageSrc="/sol1.svg"
            isComingSoon
          />
        </div>
      </div>

      <BottomNavigation currentPath={YIELD_ASSET_PICKER_PATH} />
    </div>
  );
};
