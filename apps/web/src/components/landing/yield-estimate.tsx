import { useMemo, useState } from "react";
import RevealOnScroll from "./reveal-on-scroll";

type Product = {
  key: "stable" | "staking";
  name: string;
  apy: number;
  subtitle: string;
};

type Currency = "NGN" | "USD" | "GBP";

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

const currencies: Record<Currency, {
  label: string;
  symbol: string;
  min: number;
  max: number;
  step: number;
  default: number;
}> = {
  NGN: { label: "Naira", symbol: "₦", min: 10_000, max: 5_000_000, step: 10_000, default: 100_000 },
  USD: { label: "Dollar", symbol: "$", min: 5, max: 3_500, step: 10, default: 100 },
  GBP: { label: "Pounds", symbol: "£", min: 5, max: 2_500, step: 10, default: 100 },
};

const formatCurrency = (value: number, currency: Currency) => {
  const sym = currencies[currency].symbol;
  return `${sym}${value.toLocaleString()}`;
};

const futureValueFromLumpSum = (
  principal: number,
  annualRatePercent: number,
  months: number,
) => {
  const monthlyRate = annualRatePercent / 100 / 12;
  return principal * (1 + monthlyRate) ** months;
};

export const TimeIsMoneySection = () => {
  const [currency, setCurrency] = useState<Currency>("NGN");
  const [deposit, setDeposit] = useState(100_000);
  const [months, setMonths] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[1]);

  const cur = currencies[currency];

  const handleCurrencyChange = (next: Currency) => {
    setCurrency(next);
    setDeposit(currencies[next].default);
  };

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
          <div className="text-center flex flex-col items-center mx-auto max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-black px-3 py-1 text-[10px] font-normal uppercase tracking-[0.22em] text-black">
              Calculator
            </span>
            <h2 className="mt-5 text-[3rem] leading-[0.95] tracking-[-0.03em] text-[#111111] md:text-[4rem]">
              <span className="block font-sans font-semibold">See what your</span>
              <span className="block font-sans italic text-[#235538]">
                money would earn.
              </span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#5e6660] md:text-lg">
              Enter your deposit and duration. Get a real estimate before you
              commit to anything.
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.06}>
          <div className="mt-10 overflow-hidden rounded-2xl border border-[#e3e8e4] bg-white sm:max-w-3xl mx-auto">
            <div className="border-t border-[#e7ece8] px-6 py-3 md:px-8 md:py-5">
              <div className="flex gap-3 justify-center mb-6">
                {(["NGN", "USD", "GBP"] as Currency[]).map((c) => {
                  const isActive = currency === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleCurrencyChange(c)}
                      className={`rounded-full border-2 border-black px-5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                        isActive
                          ? "bg-[#C7EF6B] text-black"
                          : "bg-transparent text-[#5e6660] hover:bg-[#f3f5f4]"
                      }`}
                    >
                      {currencies[c].symbol} {currencies[c].label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-[#252c27]">
                  Deposit amount
                </p>
                <p className="text-sm text-[#6d6d6d]">
                  {formatCurrency(deposit, currency)}
                </p>
              </div>

              <div className="mt-3 rounded-md border border-[#d2d8d3] bg-[#f3f5f4] px-4 py-3">
                <label className="flex items-center gap-2 text-base text-[#202722]">
                  <span className="text-[#93988f]">{cur.symbol}</span>
                  <input
                    type="text"
                    value={deposit.toLocaleString()}
                    inputMode="numeric"
                    onChange={(event) => {
                      const raw = event.target.value.replace(/[^\d]/g, "");
                      if (raw) {
                        setDeposit(Number(raw));
                      }
                    }}
                    className="w-full bg-transparent text-inherit outline-none"
                    aria-label="Deposit amount"
                  />
                </label>
              </div>

              <input
                type="range"
                min={cur.min}
                max={cur.max}
                step={cur.step}
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
                  min={1}
                  max={12}
                  step={1}
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
                        className={`rounded-lg border px-4 py-3 text-center transition-colors ${
                          isActive
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
                    <p className="mt-1 text-base leading-none font-sans text-[#edf5ef] md:text-xl">
                      {formatCurrency(Math.round(estimate.deposit), currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-[#aac5b3]">
                      Interest earned
                    </p>
                    <p className="mt-1 text-base leading-none font-sans text-[#edf5ef] md:text-xl">
                      {formatCurrency(Math.round(estimate.interest), currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-[#aac5b3]">
                      Balance
                    </p>
                    <p className="mt-1 text-base leading-none font-sans text-[#edf5ef] md:text-xl">
                      {formatCurrency(Math.round(estimate.total), currency)}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-2 text-center text-xs italic text-[#868686]">
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
