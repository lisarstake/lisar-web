import { CircleArrowRight } from "lucide-react";
import RevealOnScroll from "./reveal-on-scroll";
import SectionHeading from "./section-heading";

const growthOptions = [
  {
    title: "Save with USD with instantly withdrawal",
    description:
      "Earn yields in USD while maintaining full liquidity. Your funds stay accessible 24/7 so you can withdraw anytime without penalties or waiting periods.",
    cta: "Learn more about USD savings",
    image: "/h1.svg",
  },
  {
    title: "Explore High-yielding growth opportunities",
    description:
      "Access alternative investment vehicles that deliver higher returns than traditional savings accounts. These volatile opportunities offer greater upside potential but carry additional risk exposure.",
    cta: "What you should know about high-yield",
    image: "/h2.svg",
  },
  {
    title: "Own stocks from top global companies",
    description:
      "Build fractional ownership in world-leading companies like Tesla, Apple, and Nvidia. Start with as little as $1 and track your portfolio's performance in real-time.",
    cta: "Discover companies available",
    image: "/h3.svg",
  },
];

export const GrowthOptionsSection = () => {
  return (
    <section className="w-full px-6 pt-5 pb-12 md:px-8 md:pt-5 md:pb-16">
      <SectionHeading
        tag="GROW"
        supportingText="Explore different pathways to building wealth"
        className="mt-10"
      />
      <div className="mx-auto w-full space-y-6">
        {growthOptions.map((item, index) => {
          const isReversed = index % 2 === 1;
          return (
            <RevealOnScroll key={item.title} delay={index * 0.06}>
              <article
                className={`grid gap-6 bg-white p-6 md:p-8 md:items-center ${
                  isReversed
                    ? "md:grid-cols-[1.1fr_0.9fr]"
                    : "md:grid-cols-[0.9fr_1.1fr]"
                }`}
              >
                <div className={isReversed ? "md:order-2" : ""}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-[250px] md:h-[400px] object-contain rounded-2xl bg-[#f3f7ef]"
                  />
                </div>

                <div className={isReversed ? "md:order-1" : ""}>
                  <h3 className="text-[#071510] text-2xl md:text-4xl leading-tight font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-[#4a6256] text-base md:text-xl leading-relaxed">
                    {item.description}
                  </p>
                  <button className="mt-5 inline-flex items-center gap-2 text-[#b98417] text-sm md:text-base font-medium">
                    {item.cta}
                    <CircleArrowRight size={16} />
                  </button>
                </div>
              </article>
            </RevealOnScroll>
          );
        })}
      </div>
    </section>
  );
};

export default GrowthOptionsSection;
