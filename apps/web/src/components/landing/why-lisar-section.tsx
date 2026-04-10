import RevealOnScroll from "./reveal-on-scroll";

export const WhyLisarSection = () => {
  return (
    <section id="why-lisar" className="w-full px-6 py-14 md:px-8 md:py-18">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-start">
          <div>
            <span className="inline-flex rounded-full border border-[#5b645c] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#323933]">
              WHY LISAR
            </span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-[220px_1fr]">
          <div />
          <div className="max-w-4xl">
            <RevealOnScroll delay={0.08} lightOnScroll>
              <p className="text-[#202821] text-lg md:text-[1.9rem] leading-[1.24] font-serif">
                Not everyone is ready for change. But you are.
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={0.1} lightOnScroll>
              <p className="mt-3 text-[#202821] text-lg md:text-[1.9rem] leading-[1.24] font-serif">
                Too much idle cash sits in bank accounts doing nothing while
                inflation eats value. Lisar helps you put that cash to work and
                earn real yields, without adding friction to your day.
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={0.12} lightOnScroll>
              <p className="mt-3 text-[#202821] text-lg md:text-[1.9rem] leading-[1.24] font-serif">
                Built for the smart degen who wants upside, speed, and control.
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={0.15}>
              <div className="mt-12 overflow-hidden rounded-2xl border border-[#d7ddd3] bg-[#e9ede4]">
                <img
                  src="/campaign.jpg"
                  alt="Lisar community members"
                  className="h-[350px] w-full object-cover md:h-[450px]"
                />
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyLisarSection;
