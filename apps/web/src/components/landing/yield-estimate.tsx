import { useMemo, useState } from "react";
import RevealOnScroll from "./reveal-on-scroll";

type Product = {
  key: "stable" | "staking";
  name: string;
  apy: number;
  subtitle: string;
};

const products: Product[] = [
  {
    key: "stable",
    name: "LISAR Savings",
    apy: 15,
    subtitle: "Up to 15% APY",
  },
  {
    key: "staking",
    name: "LISAR Growth",
    apy: 40,
    subtitle: "Up to 40% APY",
  },
];

const MIN_DEPOSIT = 10_000;
const MAX_DEPOSIT = 5_000_000;
const DEPOSIT_STEP = 10_000;
const MIN_MONTHS = 1;
const MAX_MONTHS = 12;
const MONTH_STEP = 1;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const formatNaira = (value: number) => `₦${value.toLocaleString()}`;

const futureValueFromLumpSum = (
  principal: number,
  annualRatePercent: number,
  months: number,
) => {
  const monthlyRate = annualRatePercent / 100 / 12;
  return principal * (1 + monthlyRate) ** months;
};

export const TimeIsMoneySection = () => {
  const [deposit, setDeposit] = useState(100_000);
  const [months, setMonths] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[1]);

  const estimate = useMemo(() => {
    const total = futureValueFromLumpSum(deposit, selectedProduct.apy, months);
    const interest = Math.max(0, total - deposit);

    return {
      deposit,
      interest,
      total,
    };
  }, [deposit, months, selectedProduct.apy]);

  return (
    <section id="yield-estimate" className="w-full px-6 py-16 md:px-8 md:py-20">
      <div className="mx-auto w-full max-w-7xl">
        <RevealOnScroll>
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#235538]">
              <span className="h-px w-6 bg-[#235538]" />
              Returns calculator
            </p>
            <h2 className="mt-5 text-[2.5rem] leading-[0.95] tracking-[-0.03em] text-[#111111] md:text-[3rem]">
              <span className="block font-serif font-semibold">See what your</span>
              <span className="block font-serif italic text-[#235538]">
                money would earn.
              </span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[#5e6660] md:text-[1.12rem]">
              Enter your deposit and duration. Get a real estimate before you
              commit to anything.
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.06}>
          <div className="mt-10 overflow-hidden rounded-2xl border border-[#e3e8e4] bg-white max-w-4xl mx-auto">
            <div className="border-t border-[#e7ece8] px-6 py-3 md:px-8 md:py-5">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-[#252c27]">
                  Deposit amount
                </p>
                <p className="text-sm text-[#6d6d6d]">
                  {formatNaira(deposit)}
                </p>
              </div>

              <div className="mt-3 rounded-md border border-[#d2d8d3] bg-[#f3f5f4] px-4 py-3">
                <label className="flex items-center gap-2 text-base text-[#202722]">
                  <span className="text-[#93988f]">₦</span>
                  <input
                    type="text"
                    value={deposit.toLocaleString()}
                    inputMode="numeric"
                    onChange={(event) => {
                      const raw = event.target.value.replace(/[^\d]/g, "");
                      const next = raw ? Number(raw) : MIN_DEPOSIT;
                      const clamped = clamp(next, MIN_DEPOSIT, MAX_DEPOSIT);
                      setDeposit(clamped - (clamped % DEPOSIT_STEP));
                    }}
                    className="w-full bg-transparent text-inherit outline-none"
                    aria-label="Deposit amount"
                  />
                </label>
              </div>

              <input
                type="range"
                min={MIN_DEPOSIT}
                max={MAX_DEPOSIT}
                step={DEPOSIT_STEP}
                value={deposit}
                onChange={(event) => setDeposit(Number(event.target.value))}
                className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e7ebe7] accent-[#235538]"
                aria-label="Deposit slider"
              />

              <div className="mt-5 flex items-center justify-between">
                <p className="text-base font-semibold text-[#252c27]">
                  Duration
                </p>
                <p className="text-sm text-[#6d6d6d]">
                  {months} {months === 1 ? "month" : "months"}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-2">

                <input
                  type="range"
                  min={MIN_MONTHS}
                  max={MAX_MONTHS}
                  step={MONTH_STEP}
                  value={months}
                  onChange={(event) => setMonths(Number(event.target.value))}
                  className="flex-1 h-2 cursor-pointer appearance-none rounded-full bg-[#e7ebe7] accent-[#235538]"
                  aria-label="Duration slider"
                />

              </div>

              <div className="mt-8">
                <p className="text-base font-semibold text-[#252c27]">
                  Product
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {products.map((product) => {
                    const isActive = selectedProduct.key === product.key;

                    return (
                      <button
                        key={product.key}
                        type="button"
                        onClick={() => setSelectedProduct(product)}
                        className={`rounded-lg border px-4 py-3 text-center transition-colors ${isActive
                            ? "border-[#235538] border-2 bg-[#f3f5f4]"
                            : "border-[#d2d8d3] bg-[#f3f5f4] hover:bg-[#f2f6f3]"
                          }`}
                      >
                        <p className="text-sm font-medium text-[#404840]">
                          {product.name}
                        </p>
                        <p className="text-xs italic text-[#404840]">
                          {product.subtitle}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 rounded-xl bg-[#235538] px-5 py-5 md:px-8 md:py-6">
                <div className="grid gap-4 text-center grid-cols-3 md:gap-6">
                  <div>
                    <p className="text-[10px] uppercase text-[#aac5b3]">
                      You deposit
                    </p>
                    <p className="mt-1 text-base leading-none font-serif text-[#edf5ef] md:text-xl">
                      {formatNaira(Math.round(estimate.deposit))}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-[#aac5b3]">
                      Interest earned
                    </p>
                    <p className="mt-1 text-base leading-none font-serif text-[#edf5ef] md:text-xl">
                      {formatNaira(Math.round(estimate.interest))}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-[#aac5b3]">
                      Balance
                    </p>
                    <p className="mt-1 text-base leading-none font-serif text-[#edf5ef] md:text-xl">
                      {formatNaira(Math.round(estimate.total))}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-2 text-center text-xs italic text-[#9aa19b]">
                Estimates are based on current rates. Actual returns may vary.{' '} Learn more about
                <a href="/lisar-savings" className="underline text-[#235538] hover:text-[#235538] font-medium"> LISAR savings</a>
                {' '}and{' '}
                <a href="/lisar-growth" className=" underline text-[#235538] hover:text-[#235538] font-medium">LISAR growth</a>
                {' '}
              </p>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

export default TimeIsMoneySection;
