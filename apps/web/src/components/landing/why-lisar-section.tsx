import RevealOnScroll from "./reveal-on-scroll";

const marketRows: {
  badge: string;
  image?: string;
  title: string;
  subtitle: string;
  value: string;
  note: string;
  tone: string;
}[] = [
  {
    badge: "GTB",
    image: "/gtb.png",
    title: "Traditional banks",
    subtitle: "Normal savings account",
    value: "1-3%",
    note: "Below inflation",
    tone: "text-red-600",
  },
  {
    badge: "OP",
    image: "/monie.jpeg",
    title: "Fintech wallets",
    subtitle: "OPay, PalmPay, Kuda",
    value: "4-6%",
    note: "Low yield",
    tone: "text-[#111111]",
  },
  {
    badge: "PV",
    image: "/piggyvest.jpeg",
    title: "Savings apps",
    subtitle: "PiggyVest, Cowrywise",
    value: "4-6%",
    note: "Dollar yield",
    tone: "text-amber-600",
  },
  {
    badge: "👑",
    image: "/author.png",
    title: "Lisar",
    subtitle: "Dollar yield daily",
    value: "10-15%",
    note: "Up to 40% on growth",
    tone: "text-green-800",
  },
];

const partnerRows: {
  badge: string;
  image?: string;
  title: string;
  subtitle: string;
}[] = [
  {
    badge: "SH",
    image: "/shuttlers.png",
    title: "Shuttlers",
    subtitle: "Enjoy discounts on your daily commute to work on shuttlers",
  },
  {
    badge: "CF",
    image: "/cafeone.svg",
    title: "CafeOne",
    subtitle: "Work from cafe? Save up to 20% on purchases as a saver on Lisar",
  },
  {
    badge: "SP",
    image: "/spotify.png",
    title: "Spotify",
    subtitle: "Pay for your Spotify subscription from your earnings on Lisar for the music lovers",
  },
  {
    badge: "+",
    image: undefined,
    title: "And more",
    subtitle: "Plus more services coming soon",
  },
];

export const WhyLisarSection = () => {
  return (
    <section
      id="why-lisar"
      className="w-full bg-white px-6 py-14 md:px-8 md:py-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:gap-10">
          <div>
            <RevealOnScroll>
              <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f6a43]">
                <span className="h-px w-8 bg-[#2f6a43]" />
                Why lisar
              </p>
              <h2 className="mt-5 text-[2.5rem] leading-[0.95] tracking-[-0.03em] text-[#111111] md:text-[3rem] space-y-2">
                <span className="block font-serif font-semibold">
                  Your money is
                </span>
                <span className="block font-serif italic text-[#235538]">
                  sitting still.
                </span>
                <span className="block font-serif font-semibold">
                  Inflation isn&apos;t.
                </span>
              </h2>
            </RevealOnScroll>

            <RevealOnScroll delay={0.08}>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#5e6660] md:text-[1.12rem]">
                Every day your money sits in a low-yield account is a day it
                slowly loses value. The cost feels invisible but gradually compounds.
                Lisar helps you shift from idle balance to daily growth.
              </p>
            </RevealOnScroll>
          </div>

          <RevealOnScroll delay={0.12}>
            <div className="rounded-xl border border-[#e3e8e2] bg-[#f3f5f4] p-5 md:p-6">
              <div>
                {marketRows.map((row) => (
                  <div
                    key={row.title}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-[#e3e8e2] py-4 last:border-b-0"
                  >
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#e8ece7] overflow-hidden">
                      {row.image ? (
                        <img
                          src={row.image}
                          alt={row.badge}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">{row.badge}</span>
                      )}
                    </div>

                    <div>
                      <p className="text-[1.05rem] font-medium text-[#263830]">
                        {row.title}
                      </p>
                      <p className="text-sm text-[#78817a]">{row.subtitle}</p>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-[1rem] font-medium leading-none ${row.tone}`}
                      >
                        {row.value}
                      </p>
                      <p className="mt-1 text-sm text-[#7a837d] italic">{row.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </div>

        {/* <RevealOnScroll delay={0.16}>
          <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:gap-10">
            <div>
              
              <h2 className="mt-5 text-[2rem] leading-[0.95] tracking-[-0.03em] text-[#111111] md:text-[2.5rem] space-y-2">
                <span className="block font-serif font-semibold">
                  Maximum value
                </span>
                <span className="block font-serif italic text-[#235538]">
                  for your money.
                </span>
                <span className="block font-serif font-semibold">
                  Plus more.
                </span>
              </h2>
              <p className="mt-4 text-base text-[#5e6660] md:text-lg">
                Unlock discounts on different services such as when you save on Lisar
              </p>
            </div>

            <div className="rounded-xl border border-[#e3e8e2] bg-[#f3f5f4] p-5 md:p-6">
              <div>
                {partnerRows.map((row) => (
                  <div
                    key={row.title}
                    className="flex items-center gap-4 border-b border-[#e3e8e2] py-4 last:border-b-0"
                  >
                    <div className="inline-flex h-12 w-12 items-center justify-centeroverflow-hidden shrink-0">
                      {row.image ? (
                        <img
                          src={row.image}
                          alt={row.badge}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-xl font-semibold text-[#235538]">{row.badge}</span>
                      )}
                    </div>

                    <div>
                       <p className="text-[1.05rem] font-medium text-[#263830]">
                        {row.title}
                      </p> 
                      <p className="text-sm text-[#78817a]">{row.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RevealOnScroll> */}
      </div>
    </section>
  );
};

export default WhyLisarSection;