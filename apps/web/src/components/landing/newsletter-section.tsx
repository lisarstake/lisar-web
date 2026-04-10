import { ArrowRight } from "lucide-react";
import RevealOnScroll from "./reveal-on-scroll";

export const NewsletterDisclaimerSection = () => {
  return (
    <section className="w-full border-b border-[#dce4d7]">
      <div className="mx-auto w-full max-w-7xl px-6 py-10 md:px-8 md:py-10">
        <RevealOnScroll>
          <div className="rounded-[2rem] bg-[#10251c] px-6 py-10 text-white md:px-10 md:py-14">
            <p className="text-center text-base text-white/80">
              Growth starts here
            </p>
            <h3 className="mt-2 text-center text-4xl font-semibold tracking-tight md:text-6xl">
              Sign up for our Newsletter
            </h3>
            <p className="mt-3 text-center text-base text-white/90 md:text-lg">
              Sign up for our weekly newsletter for finance, crypto, and product
              updates.
            </p>

            <div className="mx-auto mt-8 flex w-full max-w-2xl flex-col gap-3 md:flex-row md:items-center md:rounded-full md:bg-white md:p-2">
              <input
                type="email"
                placeholder="Enter your email address"
                className="h-12 w-full rounded-full bg-white px-5 text-base text-[#0d2931] outline-none md:flex-1"
              />
              <button
                type="submit"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#C7EF6B] px-6 text-base font-medium text-[#060E0A] transition hover:bg-[#b7e354] md:bg-[#10251c] md:text-white"
              >
                Subscribe
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

export default NewsletterDisclaimerSection;
