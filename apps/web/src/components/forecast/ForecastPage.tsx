import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, CircleQuestionMark } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { delegationService } from "@/services";
import { Skeleton } from "@/components/ui/skeleton";
import { priceService } from "@/lib/priceService";
import { useAuth } from "@/contexts/AuthContext";
import { useStablesApy } from "@/hooks/useStablesApy";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { formatNumber, parseFormattedNumber } from "@/lib/formatters";

type AccountPlan = {
  id: "savings" | "growth";
  name: string;
  apy: number;
};

type Currency = "USD" | "LPT" | "NGN" | "GBP";

export const ForecastPage: React.FC = () => {
  const { state } = useAuth();
  const { perena: perenaApy, growth: growthApy, isLoading: apyLoading } = useStablesApy();
  const { orchestrators } = useOrchestrators();

  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<AccountPlan>({
    id: "savings",
    name: "Savings",
    apy: 14,
  });
  const [delegationAmount, setDelegationAmount] = useState("0");
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    (state.user?.fiat_type as Currency) || "USD"
  );
  const [yieldLoading, setYieldLoading] = useState(false);
  const [yieldError, setYieldError] = useState<string | null>(null);
  const [projections, setProjections] = useState<
    Array<{ period: string; projectedReward: number; currency?: string }>
  >([]);

  const currencies: Currency[] = ["USD", "LPT", "NGN", "GBP"];

  // Real APYs: Perena for Savings, LPT/Growth for Growth. Fallback growth from top orchestrator when not vested.
  const effectiveSavingsApy = (perenaApy ?? 0.14) * 100;
  const effectiveGrowthApy = useMemo(() => {
    if (growthApy !== null) return growthApy * 100;
    if (orchestrators.length > 0) {
      const top = orchestrators[0];
      const apyVal = top?.apy;
      const parsed = typeof apyVal === "string" ? parseFloat(apyVal.replace("%", "")) : typeof apyVal === "number" ? apyVal : 0;
      return parsed || 68;
    }
    return 68;
  }, [growthApy, orchestrators]);

  const accountPlans: AccountPlan[] = useMemo(
    () => [
      { id: "savings" as const, name: "Savings", apy: effectiveSavingsApy },
      { id: "growth" as const, name: "Growth", apy: effectiveGrowthApy },
    ],
    [effectiveSavingsApy, effectiveGrowthApy]
  );

  const apy = accountPlans.find((p) => p.id === selectedPlan.id)?.apy ?? selectedPlan.apy ?? 0;

  const getCurrencySymbol = (currency: Currency): string => {
    if (currency === "LPT") return "LPT";
    return priceService.getCurrencySymbol(currency);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-currency-dropdown]")) {
        setShowCurrencyDropdown(false);
      }
    };

    if (showCurrencyDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showCurrencyDropdown]);

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const handlePlanSelect = (plan: AccountPlan) => {
    setSelectedPlan(plan);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = parseFormattedNumber(e.target.value);
    const numericValue = rawValue.replace(/[^0-9.]/g, "");
    setDelegationAmount(numericValue);
  };

  const numericAmount = parseFloat(delegationAmount.replace(/,/g, "")) || 0;
  const fallbackDailyYield = (numericAmount * apy) / 100 / 365;
  const fallbackMonthlyYield = fallbackDailyYield * 30;
  const fallbackYearlyYield = (numericAmount * apy) / 100;
  const fallbackYearlyTotal = numericAmount + fallbackYearlyYield;

  useEffect(() => {
    const run = async () => {
      if (
        !selectedPlan ||
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
          period: "",
          includeCurrencyConversion: selectedCurrency !== "LPT",
          currency: selectedCurrency,
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
            projectedReward: Number(p.projectedReward ?? 0) + numericAmount,
            currency: p.currency ?? "USD",
          }));
        } else if (serverProjections && typeof serverProjections === "object") {
          next = Object.keys(serverProjections).map((k) => ({
            period: k,
            projectedReward:
              Number(
                serverProjections[k]?.projectedReward ??
                serverProjections[k] ??
                0
              ) + numericAmount,
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
  }, [numericAmount, apy, selectedPlan, selectedCurrency]);

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
        {/* Header - Scrollable */}
        <div className="flex items-start justify-between py-8">
          <div>
            <h1 className="text-lg font-medium text-white">Interest Calculator</h1>
            <p className="text-xs text-gray-500">
              Calculate your potential earnings
            </p>
          </div>
          <button
            onClick={handleHelpClick}
            className="w-8 h-8 bg-[#505050] rounded-full flex items-center justify-center"
          >
            <CircleQuestionMark color="#86B3F7" size={16} />
          </button>
        </div>

        {/* Select Savings Plan */}
        <div className="mb-6">
          <label className="block text-gray-400 text-sm font-medium mb-3">
            Select Account
          </label>
          <div className="relative">
            <select
              value={selectedPlan?.id || ""}
              onChange={(e) => {
                const selected = accountPlans.find((p) => p.id === e.target.value);
                if (selected) handlePlanSelect(selected);
              }}
              className="w-full p-4 bg-[#1a1a1a] border border-[#505050] rounded-lg text-white appearance-none focus:border-[#C7EF6B] focus:outline-none"
            >
              {accountPlans.map((plan) => (
                <option className="font-medium" key={plan.id} value={plan.id}>
                  {plan.name} - APY: {plan.apy}%
                </option>
              ))}
            </select>
            <ChevronDown
              size={20}
              color="#C7EF6B"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none"
            />
          </div>
        </div>

        {/* Amount */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-gray-400 text-sm font-medium">
              Amount
            </label>
            <div className="relative pr-0.5" data-currency-dropdown>
              <button
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="flex items-center space-x-1 text-sm font-medium text-white/80 transition-colors"
              >
                <span>({selectedCurrency})</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${showCurrencyDropdown ? "rotate-180" : ""
                    }`}
                />
              </button>
              {showCurrencyDropdown && (
                <div className="absolute right-0 mt-2 w-32 bg-[#1a1a1a] border border-[#505050] rounded-lg shadow-lg z-10 overflow-hidden">
                  {currencies.map((currency) => (
                    <button
                      key={currency}
                      onClick={() => {
                        setSelectedCurrency(currency);
                        setShowCurrencyDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[#505050] transition-colors ${selectedCurrency === currency
                          ? "text-[#C7EF6B] bg-[#505050]"
                          : "text-white"
                        }`}
                    >
                      {currency}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <input
            type="text"
            value={delegationAmount ? formatNumber(delegationAmount) : ""}
            onChange={handleAmountChange}
            className="w-full p-4 bg-[#1a1a1a] border border-[#505050] rounded-lg text-white focus:border-[#C7EF6B] focus:outline-none"
            placeholder={`Enter amount in ${selectedCurrency}`}
          />
        </div>

        {/* Total Projected Earnings (Yearly) */}
        <div className="mb-8">
          <div className="bg-[#1a1a1a] rounded-lg p-6 text-center">
            <h2 className="text-gray-400 text-sm font-normal mb-2">
              Projected Annual Earning
            </h2>
            <div className="text-xl font-bold text-white/90 mb-1">
              {yieldLoading ? (
                <Skeleton className="h-7 w-10 bg-[#505050] inline-block align-middle rounded-sm mb-2" />
              ) : (
                formatNumber(
                  projections.find((p) =>
                    p.period.toLowerCase().includes("year")
                  )?.projectedReward ?? fallbackYearlyTotal,
                  2
                )
              )}{" "}
              {selectedCurrency}
            </div>
            <div className="text-[#C7EF6B] text-xs">= {apy}% APY</div>
          </div>
        </div>

        {/* Return Breakdown */}
        <div className="mb-4">
          <h3 className="text-white font-medium mb-4">Projected Returns</h3>
          <div className="bg-[#1a1a1a] rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Daily</span>
              <span className="text-white/90 font-medium">
                {yieldLoading ? (
                  <Skeleton className="h-5 w-8 bg-[#505050] inline-block align-middle rounded-sm mb-1" />
                ) : (
                  formatNumber(
                    (projections.find((p) =>
                      p.period.toLowerCase().includes("day")
                    )?.projectedReward ?? numericAmount + fallbackDailyYield) -
                    numericAmount,
                    2
                  )
                )}{" "}
                {selectedCurrency}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Monthly</span>
              <span className="text-white/90 font-medium">
                {yieldLoading ? (
                  <Skeleton className="h-5 w-8 bg-[#505050] inline-block align-middle rounded-sm mb-1" />
                ) : (
                  formatNumber(
                    (projections.find((p) =>
                      p.period.toLowerCase().includes("month")
                    )?.projectedReward ??
                      numericAmount + fallbackMonthlyYield) - numericAmount,
                    2
                  )
                )}{" "}
                {selectedCurrency}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Yearly Return</span>
              <span className="text-white/90 font-medium">
                {yieldLoading ? (
                  <Skeleton className="h-5 w-8 bg-[#505050] inline-block align-middle rounded-sm mb-1" />
                ) : (
                  formatNumber(
                    (projections.find((p) =>
                      p.period.toLowerCase().includes("year")
                    )?.projectedReward ?? fallbackYearlyTotal) - numericAmount,
                    2
                  )
                )}{" "}
                {selectedCurrency}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-[#505050] pt-3">
              <span className="text-white font-medium">
                Total Annual Earning
              </span>
              <span className="text-white/90 font-bold">
                {yieldLoading ? (
                  <Skeleton className="h-5 w-8 bg-[#505050] inline-block align-middle rounded-sm mb-1" />
                ) : (
                  formatNumber(
                    projections.find((p) =>
                      p.period.toLowerCase().includes("year")
                    )?.projectedReward ?? fallbackYearlyTotal,
                    2
                  )
                )}{" "}
                {selectedCurrency}
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
          "Calculate your potential earnings by choosing an account and entering your stake amount.",
          "Savings uses Perena APY for stable, low-risk returns. Growth uses LPT staking APY for higher potential returns.",
          "Results are estimates and may vary based on network performance.",
        ]}
      />

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/forecast" />
    </div>
  );
};
