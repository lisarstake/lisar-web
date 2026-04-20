import { useMemo } from "react";
import RevealOnScroll from "./reveal-on-scroll";

const partners = [
  { name: "Nomba", logo: "/nomba.png" },
  { name: "CoinCal", logo: "/coincal.png" },
  { name: "CoinCap", logo: "/coincap.png" },
  { name: "TradingView", logo: "/tradingview.png" },
  { name: "Livepeer", logo: "/lpt.svg" },
  { name: "Perena", logo: "/perena-partner.svg" },
  { name: "Maple", logo: "/maple-partner.svg" },
  { name: "Solana", logo: "/sol.svg" },
];

export const PartnersSection = () => {
  const shuffledPartners = useMemo(() => {
    return [...partners].sort(() => Math.random() - 0.5);
  }, []);

  return (
    <section className="w-full pt-12 sm:pt-0 pb-5 md:pb-10 overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
        <RevealOnScroll>
          <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#235538]">
            <span className="h-px w-8 bg-[#235538]" />
            Trusted by / Featured in
          </p>
        </RevealOnScroll>

        <div className="mt-2">
          <div className="flex w-max gap-6 marquee-partners">
            {[...shuffledPartners, ...shuffledPartners].map((partner, idx) => {
              const links: Record<string, string> = {
                CoinCap: "https://coinmarketcap.com/community/post/368326930",
                CoinCal: "https://coinmarketcal.com/en/",
                TradingView: "https://www.tradingview.com/news/coinmarketcal:0c06ed85b094b:0-livepeer-lpt-lisar-proposal-passes-17-sep-2025/",
              };
              const href = links[partner.name];
              
              return (
                <div
                  key={`${partner.name}-${idx}`}
                  className="flex min-h-[10px] w-[150px] items-center justify-center rounded-xl px-6 py-5"
                >
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full">
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className={`w-auto object-contain ${
                          partner.name === "CoinCal" || partner.name === "CoinCap" ? "h-10 md:h-14" :
                          partner.name === "Maple" ? "h-4 md:h-5" : "h-8 md:h-10"
                        }`}
                      />
                    </a>
                  ) : (
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className={`w-auto object-contain ${
                        partner.name === "CoinCal" || partner.name === "CoinCap" ? "h-20 md:h-32" :
                        partner.name === "Maple" ? "h-4 md:h-5" : "h-8 md:h-10"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marqueePartners {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .marquee-partners {
          animation: marqueePartners 60s linear infinite;
        }
        .marquee-partners:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default PartnersSection;