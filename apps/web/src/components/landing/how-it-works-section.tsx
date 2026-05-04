import RevealOnScroll from "./reveal-on-scroll";

type Step = {
  marker: string;
  eyebrow: string;
  title: string;
  description: string;
  note: string;
  noteIcon: string;
};

const steps: Step[] = [
  {
    marker: "1",
    eyebrow: "Start",
    title: "Create your account",
    description:
      "Sign up in under two minutes. Just your email and a password. ",
    note: "No crypto wallet required. No seed phrase. You sign up the same way you would for any fintech app.",
    noteIcon: "💡",
  },
  {
    marker: "2",
    eyebrow: "Verify",
    title: "Complete KYC",
    description:
      "Complete a quick identity check. Takes under five minutes and is required once. ",
    note: "Transfer from any bank account or mobile wallet into your LISAR stash. No minimums. No hidden fees. Your money lands instantly.",
    noteIcon: "🔒",
  },
  {
    marker: "3",
    eyebrow: "Fund",
    title: "Deposit to your stash",
    description:
      "Transfer funds from any bank account or mobile wallet into your LISAR stash. No minimums. No hidden fees.",
    note: "Daily compounding means your interest earns interest. The longer you stay in, the faster the curve bends upward.",
    noteIcon: "📈",
  },
  {
    marker: "4",
    eyebrow: "Earn",
    title: "Choose your product and earn daily",
    description:
      "Select LISAR Savings and your funds are deployed into positions with dollar-backed returns. Select LISAR Growth, pick your digital asset, and your funds are deployed into staking positions. Yield accrues daily.",
    note: "Withdraw to your linked account when you need liquidity. No long lock-ins for stable savings.",
    noteIcon: "✅",
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="w-full px-6 py-16 md:px-8 md:py-20">
      <div className="mx-auto w-full max-w-7xl">
        <RevealOnScroll>
          <div className="text-center flex flex-col items-center">
            <span className="inline-flex items-center rounded-full border border-black px-3 py-1 text-[10px] font-normal uppercase tracking-[0.2em] text-black">
              How it works
            </span>
            <h2 className="mt-5 text-[3rem] leading-[0.95] tracking-[-0.03em] text-[#111111] md:text-[4rem]">
              <span className="block font-sans font-semibold">Four steps</span>
              <span className="block font-sans italic text-[#235538]">
                To start earning
              </span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5e6660] md:text-lg">
              From signup to earning in minutes. That's it.
            </p>
          </div>
        </RevealOnScroll>

        <div className="mt-12 grid gap-12 md:grid-cols-[1fr_1fr] md:gap-16 lg:grid-cols-[1.3fr_1fr]">
          <div className="order-2 md:order-1 space-y-4 md:space-y-6 md:mt-0">
            {steps.map((step, index) => (
              <RevealOnScroll key={step.marker} delay={index * 0.06}>
                <article className="grid grid-cols-[54px_1fr] gap-4 md:grid-cols-[90px_1fr] md:gap-3">
                  <div className="relative flex justify-center">
                    <div className="z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#dbe8de] bg-[#235538] text-lg font-sans text-white md:h-12 md:w-12 md:text-xl">
                      {step.marker}
                    </div>
                    {index < steps.length - 1 ? (
                      <span className="absolute top-12 -bottom-12 w-px bg-[#8ab296] md:top-[66px] md:bottom-[-3.4rem]" />
                    ) : null}
                  </div>

                  <div className="pb-1 md:pb-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#235538]">
                      {step.eyebrow}
                    </p>
                    <h3 className="mt-2 font-sans text-base font-semibold leading-tight text-[#202722] md:text-lg">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-4xl text-sm text-[#808481] md:text-base">
                      {step.description}
                    </p>
                  </div>
                </article>
              </RevealOnScroll>
            ))}
          </div>

          <div className="order-1 md:order-2">
            <RevealOnScroll>
              <img
                src="/how-to.png"
                alt="How it works"
                className="w-full rounded-2xl"
              />
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
