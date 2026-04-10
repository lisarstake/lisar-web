import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import RevealOnScroll from "./reveal-on-scroll";
import SectionHeading from "./section-heading";

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const futureValueFromMonthly = (
  monthlyContribution: number,
  annualRatePercent: number,
  years: number,
) => {
  const months = Math.max(0, Math.floor(years * 12));
  const monthlyRate = annualRatePercent / 100 / 12;
  if (months === 0) return 0;
  if (monthlyRate === 0) return monthlyContribution * months;
  return (
    monthlyContribution * (((1 + monthlyRate) ** months - 1) / monthlyRate)
  );
};

const futureValueFromLumpSum = (
  principal: number,
  annualRatePercent: number,
  years: number,
) => {
  const months = Math.max(0, Math.floor(years * 12));
  const monthlyRate = annualRatePercent / 100 / 12;
  if (months === 0) return principal;
  return principal * (1 + monthlyRate) ** months;
};

const formatCurrency = (value: number, symbol: "₦" | "$") =>
  `${symbol}${Math.max(0, value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const formatDigitsWithCommas = (value: string) =>
  value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const TimeIsMoneySection = () => {
  const [amount, setAmount] = useState("1000");
  const [cadence, setCadence] = useState<"monthly" | "weekly" | "once">(
    "monthly",
  );
  const [years, setYears] = useState("1");
  const [displayCurrency, setDisplayCurrency] = useState<"Dollar" | "Naira">(
    "Dollar",
  );
  const lisarRateDollar = "15";
  const lisarRateNaira = "15";
  const bankRateNaira = "3";
  const bankRateDollar = "1.5";

  const baseAmount = toNumber(amount);
  const yearsNum = toNumber(years);
  const lisarRateNum = toNumber(
    displayCurrency === "Dollar" ? lisarRateDollar : lisarRateNaira,
  );
  const bankRateNum = toNumber(
    displayCurrency === "Dollar" ? bankRateDollar : bankRateNaira,
  );
  const currencySymbol = displayCurrency === "Dollar" ? "$" : "₦";

  const stats = useMemo(() => {
    const months = Math.max(0, Math.floor(yearsNum * 12));
    const monthlyContribution =
      cadence === "monthly"
        ? baseAmount
        : cadence === "weekly"
          ? (baseAmount * 52) / 12
          : 0;

    const totalContributed =
      cadence === "once" ? baseAmount : monthlyContribution * months;

    const lisarTotal =
      cadence === "once"
        ? futureValueFromLumpSum(baseAmount, lisarRateNum, yearsNum)
        : futureValueFromMonthly(monthlyContribution, lisarRateNum, yearsNum);

    const bankTotal =
      cadence === "once"
        ? futureValueFromLumpSum(baseAmount, bankRateNum, yearsNum)
        : futureValueFromMonthly(monthlyContribution, bankRateNum, yearsNum);

    return {
      totalContributed,
      lisarTotal,
      bankTotal,
      lisarReturns: Math.max(0, lisarTotal - totalContributed),
      bankReturns: Math.max(0, bankTotal - totalContributed),
    };
  }, [baseAmount, cadence, yearsNum, lisarRateNum, bankRateNum]);

  return (
    <section className="w-full px-6 py-14 md:px-8 md:py-18">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          tag="YIELD"
          supportingText="See how much your money could grow"
        />
        <RevealOnScroll>
          <div className="mt-8 grid gap-4 md:grid-cols-[1fr_1.6fr_0.8fr]">
            <div className="min-h-[180px] md:min-h-[250px] rounded-3xl border border-white/10 bg-[#10251c] p-6 flex flex-col">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-base text-white/75">
                <span className="text-base">If you invested</span>
                <label className="relative text-base flex items-center">
                  <select
                    value={cadence}
                    onChange={(e) =>
                      setCadence(
                        e.target.value as "monthly" | "weekly" | "once",
                      )
                    }
                    className="appearance-none bg-transparent text-white border-b border-white/80 outline-none pr-4"
                  >
                    <option value="monthly">every month</option>
                    <option value="weekly">every week</option>
                    <option value="once">just once</option>
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-white/80 w-3 h-3" />
                </label>
                <span>,</span>
                <label className="relative text-base flex items-center">
                  <select
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    className="appearance-none bg-transparent text-white border-b border-white/80 outline-none"
                  >
                    <option value="1">last year</option>
                    <option value="3">last 3 years</option>
                    <option value="5">last 5 years</option>
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-white/80 w-3 h-3" />
                </label>
              </div>

              <div className="mt-auto grid grid-cols-[1fr_auto] items-end gap-4">
                <div className="min-w-0">
                  <label className="block">
                    <span className="text-white/80 text-xs uppercase tracking-wider">
                      Amount
                    </span>
                    <input
                      value={formatDigitsWithCommas(amount)}
                      onChange={(e) =>
                        setAmount(e.target.value.replace(/[^\d]/g, ""))
                      }
                      inputMode="numeric"
                      className="w-full bg-transparent text-white text-[clamp(1.5rem,2.5vw,2.5rem)] leading-none tracking-tight outline-none"
                    />
                  </label>
                  <div className="h-px bg-white/35" />
                </div>
                <label className="relative shrink-0">
                  <select
                    value={displayCurrency}
                    onChange={(e) =>
                      setDisplayCurrency(e.target.value as "Dollar" | "Naira")
                    }
                    className="appearance-none rounded-2xl border border-white/30 bg-[#10251c] px-5 py-3 text-xl text-white outline-none"
                  >
                    <option value="Dollar">Dollar</option>
                    <option value="Naira">Naira</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="min-h-[220px] md:min-h-[250px] rounded-3xl bg-[#dff2c2] p-6">
              <div className="h-full grid gap-4 md:grid-cols-2">
                <div className="min-w-0 border-b border-[#a6c086] pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-4 flex flex-col">
                  <p className="text-[#3b5a4b] text-sm md:text-base">
                    Today, you'd have
                  </p>
                  <p className="mt-auto text-[#1e4d34] text-[clamp(1.4rem,2.5vw,2.8rem)] leading-[0.95] tracking-tight break-all">
                    {formatCurrency(stats.lisarTotal, currencySymbol)}
                  </p>
                </div>
                <div className="min-w-0 flex flex-col">
                  <p className="text-[#3b5a4b] text-sm md:text-base">
                    ...earned returns on Lisar
                  </p>
                  <p className="mt-auto text-[#1e4d34] text-[clamp(1.4rem,2.5vw,2.8rem)] leading-[0.95] tracking-tight break-all">
                    {formatCurrency(stats.lisarReturns, currencySymbol)}
                  </p>
                </div>
              </div>
            </div>

            <div className="min-h-[180px] md:min-h-[250px] rounded-3xl border border-white/10 bg-[#10251c] p-6 flex flex-col">
              <p className="text-[#a9c2b6] text-sm md:text-base">
                ...earned with your bank
              </p>
              <div className="mt-auto">
                <p className="text-[#6f8f80] text-[clamp(1.4rem,2.2vw,2.6rem)] leading-[0.95] tracking-tight break-all">
                  {formatCurrency(stats.bankReturns, currencySymbol)}
                </p>
              </div>
            </div>
          </div>
        </RevealOnScroll>
        <RevealOnScroll delay={0.08}>
          <div className="mt-8 rounded-3xl border border-[#2a3f34] bg-[#10251c] py-5 px-16">
            <p className="text-[#f4fbe9] text-2xl md:text-[2rem] leading-tight font-semibold text-center flex flex-col gap-y-4">
              <span>
                Get up to{" "}
                <span className="text-[#c7a81f] mr-2">15% yield on USD</span>
                on{" "}
                <span className="bg-[#C7EF6B] text-[#060E0A] px-2 rounded-md">
                  Lisar
                </span>
              </span>

              <span className="hidden md:flex items-center justify-center gap-x-3">
                That's{" "}
                <span className="text-[#c7a81f]">
                  {formatCurrency(stats.lisarReturns, currencySymbol)}
                </span>
                on your
                <span className="bg-[#fff5c5] text-[#071510] px-2 rounded-md">
                  {formatCurrency(stats.totalContributed, currencySymbol)}{" "}
                  deposit
                </span>
              </span>
            </p>
          </div>
        </RevealOnScroll>

        <p className="mt-3 text-[#71857a] text-xs md:text-sm">
          Calculation uses monthly compounding and assume an average market
          performance. This is an estimate, actual returns may vary
        </p>
      </div>
    </section>
  );
};

export default TimeIsMoneySection;
