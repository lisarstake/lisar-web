import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RevealOnScroll from "./reveal-on-scroll";

type GrowthCard = {
  title: string;
  label?: string;
  description: string;
  benefits: string[];
  cta: string;
  featured?: boolean;
  action?: () => void;
};

export const GrowthOptionsSection = () => {
  const navigate = useNavigate();

  const cards: GrowthCard[] = [
    {
      title: "Lisar Savings",
      label: "Stable daily yield",
      description:
        "Your funds are deployed into stablecoin yield strategies — dollar-pegged assets that generate consistent, predictable daily returns up to 15% APY.",
      benefits: [
        "Daily interest, compounding automatically",
        "Dollar-backed yield",
        "Withdraw when you need to",

      ],
      cta: "Open savings account",
      action: () => navigate("/signup"),
    },
    {
      title: "Lisar Growth",
      label: "Higher but variable",
      description:
        "Pick a digital asset — like choosing a stock. Your funds are deployed into staking positions on that asset. Returns are tied to network staking yields.",
      benefits: [
        "Up to 40% annual yield",
        "Daily compounding returns",
        "Returns tied to network yields",

      ],
      cta: "Open growth account",
      featured: true,
      action: () => navigate("/signup"),
    },
    {
      title: "Not sure which to choose?",
      description:
        "Most Lisar users split across both. Savings for stability, growth for upside. The calculator shows you exactly what each option returns.",
      benefits: [
        "Real yield estimates",
        "Compare both products side by side",
        "See actual returns before committing",
      ],
      cta: "Try the calculator",
      action: () => {
        const section = document.getElementById("yield-estimate");
        section?.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    },
  ];

  return (
    <section id="growth-options" className="w-full px-6 py-14 md:px-8 md:py-18">
      <div className="mx-auto w-full max-w-7xl">
        <RevealOnScroll>
          <div className="text-center flex flex-col items-center">
            <span className="inline-flex items-center rounded-full border border-black px-3 py-1 text-[10px] font-normal uppercase tracking-[0.2em] text-black">
              Products
            </span>
            <h2 className="mt-5 text-[3rem] leading-[0.95] tracking-[-0.03em] text-[#111111] md:text-[4rem]">
              <span className="block font-sans font-semibold">Two ways to</span>
              <span className="block font-sans italic text-[#235538]">
                grow your money.
              </span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[#5e6660] md:text-lg">
              Pick one that fits how you think about risk and reward.
            </p>
          </div>
        </RevealOnScroll>

        <div className="mt-11 grid gap-6 lg:grid-cols-3">
          {cards.map((card, index) => {
            const isFeatured = card.featured;
            return (
              <RevealOnScroll key={card.title} delay={index * 0.06}>
                <article
                  className={`relative h-full rounded-[30px] border px-8 py-9 pb-32 ${
                    isFeatured
                      ? "border-[#235538] bg-[#235538] text-[#e9f2ea]"
                      : "border-[#dbe2dd] bg-white text-[#222a24]"
                  }`}
                >
                  <h3
                    className={`mt-4 font-sans text-[1rem] leading-[0.95] md:text-[1.5rem] ${
                      isFeatured ? "text-[#f2f7f2]" : "text-[#222a24]"
                    }`}
                  >
                    {card.title}
                  </h3>
                  <div className="mt-4">
                    <p className={`text-xs uppercase tracking-[0.2em] ${
                      isFeatured ? "text-[#cfe2d3]" : "text-[#5e6660]"
                    }`}>
                      {card.label ?? "Use the calculator"}
                    </p>
                  </div>

                  <p
                    className={`mt-5 text-sm md:text-base leading-relaxed ${
                      isFeatured ? "text-[#cfe2d3]" : "text-[#5e6660]"
                    }`}
                  >
                    {card.description}
                  </p>

                  <ul className="mt-7 space-y-3 text-sm md:text-base">
                    {card.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 text-xs inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                            isFeatured
                              ? "bg-[#4e785d] text-[#d9e9dc]"
                              : "bg-[#eaf1ec] text-[#235538]"
                          }`}
                        >
                          ★
                        </span>
                        <span
                          className={`italic leading-relaxed ${
                            isFeatured ? "text-[#d7e7db]" : "text-[#4c5750]"
                          }`}
                        >
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={card.action}
                    className={`absolute bottom-9 left-8 right-8 inline-flex w-auto items-center justify-center gap-2 rounded-full border-black px-5 py-2.5 text-[1.04rem] font-medium transition-colors ${
                      isFeatured
                        ? "border-white/70 border bg-transparent text-white hover:bg-white/10"
                        : "border-black border-2 bg-[#C7EF6B] text-black hover:bg-[#b7e354]"
                    }`}
                  >
                    {card.cta}
                    <ArrowRight size={18} />
                  </button>

                </article>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GrowthOptionsSection;
