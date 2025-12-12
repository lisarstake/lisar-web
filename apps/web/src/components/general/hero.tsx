import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LisarLines } from "./lisar-lines";
import { usePrices } from "@/hooks/usePrices";

const Hero = () => {
  const navigate = useNavigate();
  const [stakeAmount, setStakeAmount] = useState(1000);
  const [currencyType] = useState<"LPT" | "USD">("USD");
  const [settlementToken, setSettlementToken] = useState<"LPT" | "USDC">(
    "USDC"
  );
  const [showTooltip, setShowTooltip] = useState(false);

  // Use the price service hook
  const { prices, loading: pricesLoading, error: pricesError } = usePrices();

  const calculateEarnings = (amount: number, apy: number) => {
    return ((amount * apy) / 100).toFixed(1);
  };

  const lptAPY = 68;

  // Calculate earnings based on currency type and settlement token
  const getEarnings = () => {
    let baseAmount = stakeAmount;

    if (currencyType === "LPT") {
      baseAmount = stakeAmount * prices.lpt;
    }

    const annualEarningsUSD = calculateEarnings(baseAmount, lptAPY);

    if (settlementToken === "LPT") {
      return (parseFloat(annualEarningsUSD) / prices.lpt).toFixed(2);
    } else {
      return parseFloat(annualEarningsUSD).toFixed(2);
    }
  };

  const extraEarnings = getEarnings();

  return (
    <section className="w-full bg-white relative overflow-hidden">
      {/* Lisar Lines Decorations */}
      <LisarLines position="top-right" />
      <div className="hidden md:block">
        <LisarLines position="bottom-left" />
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12 md:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Section - Informational */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-4">
                Your Money, Working Harder
              </h1>
              <p className="text-lg md:text-xl text-gray-600 italic font-playfair">
                Earn, save and do more with your assets.
              </p>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed">
              From stable savings to high-yield growth, Lisar makes your money work for you—effortlessly and instantly, without all the fees.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4">
              <button
                className="bg-[#C7EF6B] rounded-lg cursor-pointer text-[#060E0A] px-8 py-3 font-semibold transition-colors"
                onClick={() => navigate("/login")}
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Right Section - Calculator */}
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-2 md:p-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-gray-500 text-sm mb-4">Amount</h3>

              <div className="flex items-center gap-2 mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {currencyType === "USD" ? "$" : ""}
                  {stakeAmount.toLocaleString()}
                  <span className="ml-1">{currencyType}</span>
                </span>
                {currencyType === "LPT" && prices.lpt > 0 && !pricesLoading && (
                  <span className="text-sm text-gray-500">
                    (${(stakeAmount * prices.lpt).toLocaleString()})
                  </span>
                )}
                {pricesLoading && (
                  <span className="text-sm text-gray-400">
                    Loading prices...
                  </span>
                )}
                {pricesError && (
                  <span className="text-sm text-red-500">
                    Price unavailable
                  </span>
                )}
              </div>

              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider mb-6"
                style={
                  {
                    "--progress": `${((stakeAmount - 100) / (10000 - 100)) * 100}%`,
                  } as React.CSSProperties
                }
              />

              <div className="flex items-center gap-2 sm:gap-3 mt-2">
                {/* USDC Option */}
                <div
                  className={`flex flex-col items-center cursor-pointer px-3 py-2.5 rounded-2xl border ${
                    settlementToken === "USDC"
                      ? "border-[#235538] border-2"
                      : "border-gray-200 bg-white"
                  } transition`}
                  onClick={() => setSettlementToken("USDC")}
                >
                  <img src="/usdc.svg" alt="USDC" className="h-10 w-10 mb-1" />
                </div>
                {/* LPT Option */}
                <div
                  className={`flex flex-col items-center cursor-pointer px-3 py-2.5 rounded-2xl border ${
                    settlementToken === "LPT"
                      ? "border-[#235538] border-2"
                      : "border-gray-200 bg-white"
                  } transition`}
                  onClick={() => setSettlementToken("LPT")}
                >
                  <img
                    src="/livepeer.webp"
                    alt="LPT"
                    className="h-10 w-10 mb-1"
                  />
                </div>
                {/* Coming Soon Token Option */}
                {/* <div className="flex flex-col items-center px-3 py-2.5 rounded-2xl border border-gray-200 bg-white opacity-50 cursor-not-allowed relative">
                  <div className="rounded-full mb-1 flex items-center justify-center">
                    <img src="/sol1.svg" alt="SOL" className="h-10 w-10 mt-1" />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-[#235538] text-white font-medium text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full">
                    Soon
                  </div>
                </div> */}
                <div className="flex flex-col items-center px-3 py-2.5 rounded-2xl border border-gray-200 bg-white opacity-50 cursor-not-allowed relative">
                  <div className="rounded-full mb-1 flex items-center justify-center">
                    <img
                      src="/lisk1.png"
                      alt="LISK"
                      className="h-10 w-10 mt-1"
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-[#235538] text-white font-medium text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full">
                    Soon
                  </div>
                </div>
              </div>

              {/* Earnings Forecast */}
              <div className="mt-2">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-900 text-sm md:text-base">
                  <span className="whitespace-pre-line">
                    You would earn extra
                  </span>
                  {pricesLoading ? (
                    <span className="font-bold whitespace-nowrap text-gray-400">
                      Calculating...
                    </span>
                  ) : pricesError ? (
                    <span className="font-bold whitespace-nowrap text-red-500">
                      Unavailable
                    </span>
                  ) : (
                    <span className="font-bold whitespace-nowrap text-[#235538]">
                      +{extraEarnings} {settlementToken}
                    </span>
                  )}
                  <span className="whitespace-pre-line">annually.</span>
                  <div className="relative flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-gray-400 cursor-help"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {showTooltip && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-10">
                        Estimate only, based on today’s APY. returns can be
                        different.
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
