import { CircleArrowRight } from "lucide-react";
import RevealOnScroll from "./reveal-on-scroll";

export const FutureCtaSection = () => {
  return (
    <section className="w-full py-12 md:py-14">
      <div className="mx-auto w-full max-w-7xl px-6 text-center md:px-8">
        <RevealOnScroll>
          <p className="text-[#768b82] text-3xl md:text-4xl leading-tight">
            Your future won&apos;t wait.
          </p>
          <p className="mt-1 flex items-center justify-center gap-2 text-[#071510] text-4xl md:text-5xl leading-[1.05] font-medium tracking-tight">
            Start growing today
            <CircleArrowRight size={30} className="mt-2.5" />
          </p>
        </RevealOnScroll>
      </div>
    </section>
  );
};

export default FutureCtaSection;
