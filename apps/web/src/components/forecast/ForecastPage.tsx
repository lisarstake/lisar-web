import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, CircleQuestionMark } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { delegationService } from "@/services";
import { Skeleton } from "@/components/ui/skeleton";

type ForecastOrchestrator = {
  id: string;
  name: string;
  apy: number;
};

export const ForecastPage: React.FC = () => {
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [selectedOrchestrator, setSelectedOrchestrator] =
    useState<ForecastOrchestrator | null>(null);
  const [delegationAmount, setDelegationAmount] = useState("0");
  const [yieldLoading, setYieldLoading] = useState(false);
  const [yieldError, setYieldError] = useState<string | null>(null);
  const [projections, setProjections] = useState<
    Array<{ period: string; projectedReward: number; currency?: string }>
  >([]);
  const { orchestrators, isLoading, error } = useOrchestrators();

  const options: ForecastOrchestrator[] = useMemo(() => {
    const list = Array.isArray(orchestrators) ? orchestrators : [];
    const valid = list.filter((o: any) => {
      const ens = o.ensName || o.name || "";
      return ens && !ens.startsWith("0x") && ens.includes(".");
    });
    return valid
      .map((o: any) => {
        const rawApy = o.apy ?? o.apyPercentage ?? o.APY ?? 0;
        const apyNum =
          typeof rawApy === "string"
            ? parseFloat(rawApy.replace("%", ""))
            : Number(rawApy) || 0;
        return {
          id: o.address || o.id || (o.ensName ?? o.name),
          name: o.ensName || o.name,
          apy: apyNum,
        } as ForecastOrchestrator;
      })
      .sort((a, b) => b.apy - a.apy)
      .slice(0, 30);
  }, [orchestrators]);

  // Initialize default selection when data loads
  useEffect(() => {
    if (!selectedOrchestrator && options.length > 0) {
      setSelectedOrchestrator(options[0]);
    }
  }, [options, selectedOrchestrator]);

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const handleOrchestratorSelect = (orchestrator: ForecastOrchestrator) => {
    setSelectedOrchestrator(orchestrator);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDelegationAmount(e.target.value);
  };

  // Calculate returns based on delegation amount and APY (fallback)
  const numericAmount = parseFloat(delegationAmount.replace(/,/g, "")) || 0;
  const apy = selectedOrchestrator?.apy || 0;
  const fallbackDaily = (numericAmount * apy) / 100 / 365;
  const fallbackMonthly = fallbackDaily * 30;
  const fallbackYearly = (numericAmount * apy) / 100;

  // Fetch projected yields from API whenever inputs change
  useEffect(() => {
    const run = async () => {
      // Guard: require selected orchestrator, positive amount, and positive APY
      if (
        !selectedOrchestrator ||
        numericAmount <= 0 ||
        !Number.isFinite(apy) ||
        apy <= 0
      ) {
        setProjections([]);
        setYieldLoading(false);
        setYieldError(null);
        return;
      }
      setYieldLoading(true);
      setYieldError(null);
      try {
        const res = await delegationService.calculateYield({
          amount: numericAmount,
          apy: `${apy}%`,
          period: "", // fetch all time periods
          includeCurrencyConversion: true,
          currency: "USD",
        });
        let next: Array<{
          period: string;
          projectedReward: number;
          currency?: string;
        }> = [];
        const data = (res as any)?.data ?? res;
        const serverProjections = (data && (data.projections || data)) as any;
        if (Array.isArray(serverProjections)) {
          next = serverProjections.map((p: any) => ({
            period: String(p.period ?? ""),
            projectedReward: Number(p.projectedReward ?? 0),
            currency: p.currency ?? "USD",
          }));
        } else if (serverProjections && typeof serverProjections === "object") {
          next = Object.keys(serverProjections).map((k) => ({
            period: k,
            projectedReward: Number(
              serverProjections[k]?.projectedReward ?? serverProjections[k] ?? 0
            ),
            currency: serverProjections[k]?.currency ?? "USD",
          }));
        }
        setProjections(next);
      } catch (e: any) {
        setYieldError("Failed to fetch yield projections");
        setProjections([]);
      } finally {
        setYieldLoading(false);
      }
    };
    run();
  }, [numericAmount, apy, selectedOrchestrator]);

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
        {/* Header - Scrollable */}
        <div className="flex items-center justify-between py-8">
          <h1 className="text-lg font-medium text-white">Yield Calculator</h1>
        </div>

        {/* Select Orchestrator */}
        <div className="mb-6">
          <label className="block text-gray-400 text-sm font-medium mb-3">
            Select Validator
          </label>
          <div className="relative">
            {isLoading ? (
              <div className="h-12 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl animate-pulse" />
            ) : error ? (
              <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-red-400">
                Failed to load validators. Please try again later.
              </div>
            ) : (
              <select
                value={selectedOrchestrator?.id || ""}
                onChange={(e) => {
                  const selected = options.find((o) => o.id === e.target.value);
                  if (selected) handleOrchestratorSelect(selected);
                }}
                className="w-full p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white appearance-none focus:border-[#C7EF6B] focus:outline-none"
              >
                {options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name.length > 14
                      ? `${o.name.substring(0, 20)}..`
                      : o.name}{" "}
                    - APY: {o.apy}%
                  </option>
                ))}
              </select>
            )}
            <ChevronDown
              size={20}
              color="#C7EF6B"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none"
            />
          </div>
        </div>

        {/* Delegation Amount */}
        <div className="mb-8">
          <label className="block text-gray-400 text-sm font-medium mb-3">
            Delegation amount (USD)
          </label>
          <input
            type="text"
            value={delegationAmount}
            onChange={handleAmountChange}
            className="w-full p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white focus:border-[#C7EF6B] focus:outline-none"
            placeholder="Enter amount in USD"
          />
        </div>

        {/* Total Projected Earnings (Yearly) */}
        <div className="mb-8">
          <div className="bg-[#1a1a1a] rounded-xl p-6 text-center">
            <h2 className="text-gray-400 text-sm font-medium mb-2">
              Projected Annual Earnings
            </h2>
            <div className="text-3xl font-bold text-white/90 mb-1">
              {yieldLoading ? (
                <Skeleton className="h-7 w-10 bg-[#2a2a2a] inline-block align-middle rounded-sm mb-2" />
              ) : (
                (
                  projections.find((p) =>
                    p.period.toLowerCase().includes("year")
                  )?.projectedReward ?? fallbackYearly
                ).toFixed(2)
              )}{" "}
              USD
            </div>
            <div className="text-[#C7EF6B] text-sm">= {apy}% APY</div>
          </div>
        </div>

        {/* Return Breakdown */}
        <div className="mb-8">
          <h3 className="text-white font-medium mb-4">Projected Returns</h3>
          <div className="bg-[#1a1a1a] rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Daily</span>
              <span className="text-white/90 font-medium">
                {yieldLoading ? (
                  <Skeleton className="h-4 w-8 bg-[#2a2a2a] inline-block align-middle rounded-sm mb-1" />
                ) : (
                  (
                    projections.find((p) =>
                      p.period.toLowerCase().includes("day")
                    )?.projectedReward ?? fallbackDaily
                  ).toFixed(2)
                )}{" "}
                USD
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Monthly</span>
              <span className="text-white/90 font-medium">
                {yieldLoading ? (
                  <Skeleton className="h-4 w-8 bg-[#2a2a2a] inline-block align-middle rounded-sm mb-1" />
                ) : (
                  (
                    projections.find((p) =>
                      p.period.toLowerCase().includes("month")
                    )?.projectedReward ?? fallbackMonthly
                  ).toFixed(2)
                )}{" "}
                USD
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Yearly Return</span>
              <span className="text-white/90 font-medium">
                {yieldLoading ? (
                  <Skeleton className="h-4 w-8 bg-[#2a2a2a] inline-block align-middle rounded-sm mb-1" />
                ) : (
                  (
                    projections.find((p) =>
                      p.period.toLowerCase().includes("year")
                    )?.projectedReward ?? fallbackYearly
                  ).toFixed(2)
                )}{" "}
                USD
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-[#2a2a2a] pt-3">
              <span className="text-white font-medium">
                Total Annual Earnings
              </span>
              <span className="text-white/90 font-bold">
                {yieldLoading ? (
                  <Skeleton className="h-5 w-8 bg-[#2a2a2a] inline-block align-middle rounded-sm mb-1" />
                ) : (
                  (
                    projections.find((p) =>
                      p.period.toLowerCase().includes("year")
                    )?.projectedReward ?? fallbackYearly
                  ).toFixed(2)
                )}{" "}
                USD
              </span>
            </div>
          </div>
        </div>

        {/* Important Disclaimer */}
        <div className="mb-6">
          <p className="text-orange-400 text-xs leading-relaxed">
            These calculations are estimates based on current APY. Actual
            returns may vary based on network performance and market conditions.
          </p>
        </div>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Yield Calculator Guide"
        content={[
          "Calculate your potential earnings by choosing a validator and entering your stake amount in USD.",
          "Each validator has a different APY that affects your rewards. Higher APY means more earnings.",
          "Results are estimates and may vary based on network performance.",
        ]}
      />

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/forecast" />
    </div>
  );
};
