import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import RevealOnScroll from "./reveal-on-scroll";

export const WhyLisarSection = () => {
  const [muted, setMuted] = useState(true);

  return (
    <section id="why-lisar" className="w-full bg-white px-6 py-14 md:px-8 md:py-16">
      <div className="mx-auto w-full max-w-7xl">
        <RevealOnScroll>
          <div className="grid gap-6 md:grid-cols-[auto_1fr]">
            <div>
              <span className="inline-flex items-center rounded-full border border-black px-3 py-1 text-[10px] font-normal uppercase tracking-[0.2em] text-black">
                Why lisar
              </span>
            </div>
            <div>
              <div className="mx-auto sm:max-w-3xl">
              <RevealOnScroll delay={0}>
                <p className="text-xl md:text-2xl leading-snug text-[#5e6660]">
                  The traditional financial system is broken. Banks charge you to access your own money. Inflation silently eats your savings while interest rates barely keep up.
                </p>
              </RevealOnScroll>

              <RevealOnScroll delay={0.05}>
                <p className="mt-6 text-xl md:text-2xl leading-snug text-[#5e6660]">
                  For the vast majority, building wealth feels like a rigged game — reserved for those who already have it. The tools for real financial growth are locked behind gatekeepers, high minimums, and outdated systems.
                </p>
              </RevealOnScroll>

              <RevealOnScroll delay={0.1}>
                <p className="mt-6 text-xl md:text-2xl leading-snug text-[#5e6660]">
                  That's why we built Lisar. To give everyone access to the kind of returns that were once reserved for institutions. Dollar-backed yields. No gatekeepers. No arbitrary limits. Just your money, working harder for you.
                </p>
              </RevealOnScroll>
              </div>
              

              <RevealOnScroll delay={0.15}>
                <div className="relative max-w-4xl mt-10 rounded-xl overflow-hidden bg-black">
                  <video
                    src="/Money-intro.mp4"
                    autoPlay
                    muted={muted}
                    loop
                    playsInline
                    className="w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setMuted(!muted)}
                    className="absolute bottom-4 right-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/50 backdrop-blur-sm transition hover:bg-black/70"
                  >
                    {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

export default WhyLisarSection;
