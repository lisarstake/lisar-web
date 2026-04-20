import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown, Info } from "lucide-react";
import RevealOnScroll from "./reveal-on-scroll";

type CompareOption = {
  name: string;
  apy: string;
  iconSrc: string;
  note: string;
  interestType: string;
  withdraw: string;
  yieldType: string;
};

const compareOptions: CompareOption[] = [
  {
    name: "Traditional banks",
    apy: "5.79% APY",
    iconSrc: "/sol.svg",
    note: "Liquid staking benchmark",
    interestType: "Daily",
    withdraw: "Anytime",
    yieldType: "Naira yield",
  },
  {
    name: "Fintech wallets",
    apy: "4.31% APY",
    iconSrc: "/usdc.svg",
    note: "Stablecoin savings benchmark",
    interestType: "Daily",
    withdraw: "Anytime",
    yieldType: "USD-backed yield",
  },
  {
    name: "Savings apps",
    apy: "4.15% APY",
    iconSrc: "/usdt.svg",
    note: "Alternative stable benchmark",
    interestType: "Daily",
    withdraw: "Anytime",
    yieldType: "USD-backed yield",
  },

];

const Hero = () => {
  const navigate = useNavigate();
  const [openCompare, setOpenCompare] = useState(false);
  const [selectedCompare, setSelectedCompare] = useState<CompareOption>(compareOptions[0]);
  const comparisonRows = [
    { label: "Returns", lisar: "10-15% APY", compare: selectedCompare.apy },
    { label: "Interest", lisar: "Daily", compare: selectedCompare.interestType },
    { label: "Withdraw", lisar: "Anytime", compare: selectedCompare.withdraw },
    { label: "Yield", lisar: "USD yield", compare: selectedCompare.yieldType },
  ];

  return (
    <section className="w-full overflow-visible bg-white min-h-[90vh] flex items-center">
      <div className="mx-auto w-full max-w-7xl px-6 pt-14 md:px-10 md:pt-14">
        <div className="grid items-center gap-8 md:grid-cols-[1.3fr_1fr] md:gap-10">
          <div>
            <RevealOnScroll>
              <h1 className="text-[#111111] text-[2.7rem] leading-[0.98] tracking-[-0.03em] md:text-[4.5rem]">
                <span className="font-serif font-bold">The better way to</span>
                <br />
                <span className="font-serif italic font-bold text-[#235538]">save and invest.</span>
              </h1>
            </RevealOnScroll>

            <RevealOnScroll delay={0.08}>
              <p className="mt-6 max-w-xl text-base text-[#5f6762] md:text-[1.1rem]">
                Lisar helps millions of customers achieve their financial goals by helping them save and invest with ease. <span className="hidden md:inline">Deposit with naira, earn dollar-backed yield daily on your savings.</span>
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={0.12}>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="rounded-full border-2 border-black bg-[#C7EF6B] px-4 py-3 md:px-8 text-lg font-medium text-black transition hover:bg-[#C7EF6B] cursor-pointer"
                >
                  Create a free account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const section = document.getElementById("why-lisar");
                    section?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="rounded-full border border-[#d5dcd6] bg-white px-4 py-3 md:px-8 text-lg font-medium text-[#2a332d] transition hover:bg-[#f3f5f4] cursor-pointer"
                >
                  Learn more
                </button>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.16}>
              <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-[#707872] md:text-sm">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#235538] text-[10px] text-[#C7EF6B]">
                   <Check size={12} />
                  </span>
                  Naira deposits
                </span>
                <span className="hidden h-4 w-px bg-[#d9dfdb] md:block" />
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#235538] text-[10px] text-[#C7EF6B]">
                   <Check size={12} />
                  </span>
                  Dollar-backed yield
                </span>
                <span className="hidden h-4 w-px bg-[#d9dfdb] md:block" />
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#235538] text-[10px] text-[#C7EF6B]">
                   <Check size={12} />
                  </span>
                  Daily interest
                </span>
              </div>
            </RevealOnScroll>
          </div>

          <RevealOnScroll delay={0.12}>
            <img src="/hero.svg" className="rounded-xl w-[450px]" />
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
};

export default Hero;
