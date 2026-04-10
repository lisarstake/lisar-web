import { useNavigate } from "react-router-dom";
import { CornerDownRight } from "lucide-react";
import { LisarLines } from "./lisar-lines";
import RevealOnScroll from "./reveal-on-scroll";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full relative overflow-hidden">
      <LisarLines position="top-right" />
      <div className="hidden md:block">
        <LisarLines position="bottom-left" />
      </div>

      <div className="absolute inset-0 opacity-40 pointer-events-none [background:repeating-linear-gradient(to_right,transparent_0,transparent_28px,rgba(7,21,16,0.05)_29px)]" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-16 pb-0 md:pt-24 md:pb-0 relative z-10">
        <div className="mx-auto max-w-5xl text-center">
          <RevealOnScroll>
            <h1 className="leading-[1.03] font-medium tracking-[-0.04em] text-[#071510] text-[2.8rem] md:text-[4.8rem]">
              Do more
              <br />
              with your money
            </h1>
          </RevealOnScroll>

          <RevealOnScroll delay={0.06}>
            <p className="mx-auto mt-7 max-w-2xl text-base md:text-xl text-[#496255]">
              One app for saving, growing, and managing your money with
              confidence. Deposit, earn daily returns, withdraw anytime.
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={0.1}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-[#C7EF6B] px-7 py-3.5 text-base md:text-lg font-medium text-[#060E0A] transition hover:bg-[#b7e354]"
                onClick={() => navigate("/login")}
              >
                Start building wealth
                <CornerDownRight size={17} />
              </button>
            </div>
          </RevealOnScroll>
        </div>

        <RevealOnScroll delay={0.12}>
          <div className="mt-12 md:mt-14">
            <div className="relative h-[250px] md:h-[410px]">
              <article className="group absolute left-2 top-16 md:left-8 md:top-20 z-10 w-[34%] md:w-[31%] rotate-[-4.6deg] rounded-xl md:rounded-4xl bg-[#10251c] px-4 md:px-8 pt-4 md:pt-8 pb-16 md:pb-28 text-[#d8e8d0] transition-transform duration-300 hover:scale-[1.06]">
                <h3 className="text-[1.1rem] md:text-[2.15rem] leading-[1.05] font-semibold">
                  Invest in real
                  <br />
                  assets
                </h3>
                <img
                  src="/h1.svg"
                  alt="Real asset investing"
                  className="mt-3 md:mt-7 h-28 md:h-64 w-full object-contain"
                />
              </article>

              <article className="group absolute left-1/2 top-5 z-20 w-[38%] md:w-[32%] -translate-x-1/2 rounded-xl md:rounded-4xl bg-[#050505] px-4 md:px-8 pt-4 md:pt-8 pb-16 md:pb-28 text-white transition-transform duration-300 hover:scale-[1.06] hover:z-30">
                <h3 className="text-[1.1rem] md:text-[2.15rem] leading-[1.05] font-semibold">
                  Save in naira or
                  <br />
                  dollars
                </h3>
                <img
                  src="/h2.svg"
                  alt="Naira and dollar savings"
                  className="mt-3 md:mt-7 h-28 md:h-64 w-full object-contain"
                />
              </article>

              <article className="group absolute right-2 top-16 md:right-8 md:top-20 z-10 w-[34%] md:w-[31%] rotate-[4.6deg] rounded-xl md:rounded-4xl border border-[#dce4d7] bg-[#dff2c2] px-4 md:px-8 pt-4 md:pt-8 pb-16 md:pb-28 text-[#071510] transition-transform duration-300 hover:scale-[1.06]">
                <h3 className="text-[1.1rem] md:text-[2.15rem] leading-[1.05] font-semibold">
                  Save with friends
                  <br />
                  and family
                </h3>
                <img
                  src="/h3.svg"
                  alt="Community saving"
                  className="mt-3 md:mt-7 h-28 md:h-64 w-full object-contain"
                />
              </article>

              <div className="pointer-events-none absolute left-1/2 bottom-[-180px] md:bottom-[-250px] z-40 h-[20px] w-[170%] -translate-x-1/2 rounded-t-[100%] bg-[#f7faf5] border-[#e5ecdf]" />
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

export default Hero;
