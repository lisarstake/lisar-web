import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, CircleQuestionMark } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { delegationService } from "@/services";
import { Skeleton } from "@/components/ui/skeleton";
import { priceService } from "@/lib/priceService";
import { useAuth } from "@/contexts/AuthContext";
import { formatNumber, parseFormattedNumber } from "@/lib/formatters";

type ForecastOrchestrator = {
  id: string;
  name: string;
  apy: number;
};

type Currency = "USD" | "LPT" | "NGN" | "GBP";

export const ForecastPage: React.FC = () => {
  const { state } = useAuth();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [selectedOrchestrator, setSelectedOrchestrator] =
    useState<ForecastOrchestrator | null>(null);
  const [delegationAmount, setDelegationAmount] = useState("0");
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    (state.user?.fiat_type as Currency) || "USD"
  );
  const [yieldLoading, setYieldLoading] = useState(false);
  const [yieldError, setYieldError] = useState<string | null>(null);
  const [projections, setProjections] = useState<
    Array<{ period: string; projectedReward: number; currency?: string }>
  >([]);
  const { orchestrators, isLoading, error } = useOrchestrators();

  const currencies: Currency[] = ["USD", "LPT", "NGN", "GBP"];

  const getCurrencySymbol = (currency: Currency): string => {
    if (currency === "LPT") return "LPT";
    return priceService.getCurrencySymbol(currency);
  };

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

  useEffect(() => {
    if (!selectedOrchestrator && options.length > 0) {
      setSelectedOrchestrator(options[0]);
    }
  }, [options, selectedOrchestrator]);

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

  const handleOrchestratorSelect = (orchestrator: ForecastOrchestrator) => {
    setSelectedOrchestrator(orchestrator);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = parseFormattedNumber(e.target.value);
    const numericValue = rawValue.replace(/[^0-9.]/g, "");
    setDelegationAmount(numericValue);
  };

  const numericAmount = parseFloat(delegationAmount.replace(/,/g, "")) || 0;
  const apy = selectedOrchestrator?.apy || 0;
  const fallbackDailyYield = (numericAmount * apy) / 100 / 365;
  const fallbackMonthlyYield = fallbackDailyYield * 30;
  const fallbackYearlyYield = (numericAmount * apy) / 100;
  const fallbackYearlyTotal = numericAmount + fallbackYearlyYield;

  useEffect(() => {
    const run = async () => {
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
  }, [numericAmount, apy, selectedOrchestrator, selectedCurrency]);

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
        {/* Header - Scrollable */}
        <div className="flex items-start justify-between py-8">
          <div>
            <h1 className="text-lg font-medium text-white">Yield Calculator</h1>
            <p className="text-xs text-gray-500">
              Calculate your potential rewards
            </p>
          </div>
          <button
            onClick={handleHelpClick}
            className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
          >
            <CircleQuestionMark color="#86B3F7" size={16} />
          </button>
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
          <div className="flex items-center justify-between mb-3">
            <label className="block text-gray-400 text-sm font-medium">
              Delegation amount
            </label>
            <div className="relative pr-0.5" data-currency-dropdown>
              <button
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="flex items-center space-x-1 text-sm font-medium text-white/80 transition-colors"
              >
                <span>({selectedCurrency})</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    showCurrencyDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showCurrencyDropdown && (
                <div className="absolute right-0 mt-2 w-32 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-lg z-10 overflow-hidden">
                  {currencies.map((currency) => (
                    <button
                      key={currency}
                      onClick={() => {
                        setSelectedCurrency(currency);
                        setShowCurrencyDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[#2a2a2a] transition-colors ${
                        selectedCurrency === currency
                          ? "text-[#C7EF6B] bg-[#2a2a2a]"
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
            className="w-full p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white focus:border-[#C7EF6B] focus:outline-none"
            placeholder={`Enter amount in ${selectedCurrency}`}
          />
        </div>

        {/* Total Projected Earnings (Yearly) */}
        <div className="mb-8">
          <div className="bg-[#1a1a1a] rounded-xl p-6 text-center">
            <h2 className="text-gray-400 text-sm font-medium mb-2">
              Projected Annual Earning
            </h2>
            <div className="text-3xl font-bold text-white/90 mb-1">
              {yieldLoading ? (
                <Skeleton className="h-7 w-10 bg-[#2a2a2a] inline-block align-middle rounded-sm mb-2" />
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
                  <Skeleton className="h-5 w-8 bg-[#2a2a2a] inline-block align-middle rounded-sm mb-1" />
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
                  <Skeleton className="h-5 w-8 bg-[#2a2a2a] inline-block align-middle rounded-sm mb-1" />
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
                  <Skeleton className="h-5 w-8 bg-[#2a2a2a] inline-block align-middle rounded-sm mb-1" />
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
            <div className="flex justify-between items-center border-t border-[#2a2a2a] pt-3">
              <span className="text-white font-medium">
                Total Annual Earning
              </span>
              <span className="text-white/90 font-bold">
                {yieldLoading ? (
                  <Skeleton className="h-5 w-8 bg-[#2a2a2a] inline-block align-middle rounded-sm mb-1" />
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
          "Calculate your potential earnings by choosing a validator and entering your stake amount.",
          "You can select your preferred currency (USD, LPT, NGN, GBP) using the dropdown next to the amount field.",
          "Each validator has a different APY that affects your rewards. Higher APY means more earnings.",
          "Results are estimates and may vary based on network performance.",
        ]}
      />

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/forecast" />
    </div>
  );
};
