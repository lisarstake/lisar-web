import { ArrowRight } from "lucide-react";
import RevealOnScroll from "./reveal-on-scroll";

export const HighlightShowcaseSection = () => {
  return (
    <section id="community" className="w-full min-h-[90vh] py-14 md:py-18">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
        <RevealOnScroll>
          <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#235538]">
            <span className="h-px w-8 bg-[#235538]" />
            Community
          </p>
          <h2 className="mt-5 text-[2.5rem] leading-[0.95] tracking-[-0.03em] text-[#111111] md:text-[3rem]">
            <span className="block font-serif font-semibold">Come build</span>
            <span className="block font-serif italic text-[#235538]">
            with the team.
            </span>
          </h2>
        </RevealOnScroll>
        <RevealOnScroll>
          <div className="rounded-xl border border-[#dbe4d7] bg-white p-6 md:p-10 mt-10">
            <div className="grid gap-8 md:grid-cols-[1fr_1.1fr] md:items-center">
              <div className="relative">
                <div className="relative overflow-hidden rounded-2xl border border-[#bfd2ba] bg-[#f7fbf1]">
                  <img
                    src="/comm.png"
                    alt="Community event"
                    className="h-[250px] w-full object-cover object-right md:h-[320px]"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-[#071510] text-xl md:text-3xl leading-[1.02] font-semibold tracking-tight">
                  LISAR OpenBuild
                </h3>
                <p className="mt-4 text-[#4a6256] text-base md:text-lg leading-relaxed">
                  OpenBuild is our global community meetups where we connect with
                  our users in different cities, share product updates, answer questions, and receive
                  direct feedback on our products.
                </p>
                <button className="mt-7 inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#C7EF6B] px-6 py-2.5 text-base font-medium text-black transition hover:bg-[#b7e354]">
                  Register
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

export default HighlightShowcaseSection;
