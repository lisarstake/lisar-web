import { ArrowRight } from "lucide-react";
import RevealOnScroll from "./reveal-on-scroll";
import SectionHeading from "./section-heading";

export const HighlightShowcaseSection = () => {
  return (
    <section className="w-full min-h-[90vh] py-14 md:py-18">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
        <SectionHeading tag="COMMUNITY" supportingText="Connect with other users and the team" />
        <RevealOnScroll>
          <div className="rounded-4xl border border-[#dbe4d7] bg-white p-6 md:p-10">
          <div className="grid gap-8 md:grid-cols-[1fr_1.1fr] md:items-center">
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl border border-[#bfd2ba] bg-[#f7fbf1]">
                <img
                  src="/home2.png"
                  alt="Community event"
                  className="h-[300px] w-full object-cover md:h-[400px]"
                />
              </div>
            </div>

            <div>
              <h3 className="text-[#071510] text-4xl md:text-6xl leading-[1.02] font-semibold tracking-tight">
                Lisar IRl
              </h3>
              <p className="mt-4 text-[#4a6256] text-base md:text-xl leading-relaxed">
                Lisar IRL is our community meetups where we
                connect with users, share product updates, answer questions, and
                receive real-time feedback on our products.
              </p>
              <button className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#C7EF6B] px-6 py-3 text-[#060E0A] text-base md:text-lg font-semibold">
                Apply to join
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
