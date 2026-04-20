import { useState } from "react";
import { Plus } from "lucide-react";
import RevealOnScroll from "./reveal-on-scroll";

type TrustItem = {
  icon: string;
  title: string;
  description: string;
};

type FaqItem = {
  question: string;
  answer: string;
};



const faqs: FaqItem[] = [
  {
    question: "Is this crypto?",
    answer:
      "Yes but your experience is entirely naira-based; you deposit naira, earn in dollars and withdraw naira. LISAR uses stablecoin infrastructure in the backend, but you never interact with wallets, seed phrases, or gas fees.",
  },
  {
    question: "Is my money safe?",
    answer:
      "Your funds are deployed into dollar-backed stable assets — not volatile coins. This means your principal isn't exposed to crypto price movements. But like any financial product, there are risks, and we're transparent about them. ",
  },
  {
    question: "What's the minimum deposit?",
    answer:
      "You can start with as little as you have idle. The math on compounding works even on small amounts — the important thing is getting started and staying consistent rather than waiting until you have a large enough amount.",
  },
  {
    question: "Can I withdraw my money anytime?",
    answer:
      "Yes. There are no mandatory lockups. You can withdraw your money back to Naira whenever you choose, subject only to normal network processing times.",
  },
  {
    question: "How does LISAR make money?",
    answer:
      "LISAR deploys pooled user funds into yield-generating strategies and earns on the total. We pass a portion of that yield to you as daily interest and keep the spread. Your returns come from the same strategies institutions use — we just make them accessible to individual savers.",
  },
  {
    question: "What's the difference between LISAR Savings and LISAR Growth?",
    answer:
      "LISAR Savings (up to 15% APY) is the more conservative option — your funds earn yield through stable dollar-backed assets with lower volatility. LISAR Growth (up to 40% APY) generates higher returns through more active yield strategies but carries more variability.",
  },
];

export const TrustFaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="w-full px-6 py-14 md:px-8 md:py-18">
      <div className="mx-auto w-full max-w-7xl">
        <RevealOnScroll>
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f6a43]">
              <span className="h-px w-8 bg-[#2f6a43]" />
              Trust & transparency
            </p>
            <h2 className="mt-5 text-[2.5rem] leading-[0.95] tracking-[-0.03em] text-[#111111] md:text-[3rem]">
              <span className="block font-serif font-semibold">We&apos;ll tell you</span>
              <span className="block font-serif italic text-[#2f6a43]">everything.</span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[#5e6660] md:text-[1.12rem]">
              The only product you should trust is one that tells you exactly how it works — So here it is.
            </p>
          </div>
        </RevealOnScroll>

        <div className="mt-10 max-w-4xl mx-auto">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <RevealOnScroll key={item.question} delay={index * 0.04}>
                <div className="border-b border-[#e1e7e2] py-4">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
                  >
                    <span className="text-base text-black md:text-lg">
                      {item.question}
                    </span>
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d1d8d2] text-[#7f8781]">
                      <Plus
                        className={`h-4 w-4 transition-transform ${isOpen ? "rotate-45" : ""}`}
                      />
                    </span>
                  </button>
                  {isOpen ? (
                    <p className="mt-3 pr-12 text-sm leading-relaxed text-[#6a736d] md:text-base italic">
                      {item.answer}
                    </p>
                  ) : null}
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustFaqSection;
