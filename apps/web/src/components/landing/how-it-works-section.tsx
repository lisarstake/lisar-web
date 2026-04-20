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
    note: "No crypto wallet required. No seed phrase. You sign up the same way you would for any Nigerian fintech app.",
    noteIcon: "💡",
  },
  {
    marker: "2",
    eyebrow: "Verify",
    title: "Complete KYC",
    description:
      "Complete a quick identity check. Takes under five minutes and is required once. ",
    note: "Transfer from any Nigerian bank account or mobile wallet into your LISAR stash. No minimums. No hidden fees. Your money lands instantly.",
    noteIcon: "🔒",
  },
  {
    marker: "3",
    eyebrow: "Fund",
    title: "Deposit to your stash",
    description:
      "Transfer naira from any Nigerian bank account or mobile wallet into your LISAR stash. No minimums. No hidden fees. Your money lands instantly.",
    note: "Daily compounding means your interest earns interest. The longer you stay in, the faster the curve bends upward.",
    noteIcon: "📈",
  },
  {
    marker: "4",
    eyebrow: "Earn",
    title: "Choose your product and earn daily",
    description:
      "Select LISAR Savings and your naira is deployed into positions with dollar-backed returns. Select LISAR Growth, pick your digital asset, and your naira is deployed into staking positions. Yield accrues daily.",
    note: "Withdraw to your linked account when you need liquidity. No long lock-ins for stable savings.",
    noteIcon: "✅",
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="w-full px-6 py-16 md:px-8 md:py-20">
      <div className="mx-auto w-full max-w-7xl">
        <RevealOnScroll>
          <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#235538]">
            <span className="h-px w-8 bg-[#235538]" />
            How it works
          </p>
          <h2 className="mt-5 text-[2.5rem] leading-[0.95] tracking-[-0.03em] text-[#111111] md:text-[3rem]">
            <span className="block font-serif font-semibold">Four steps</span>
            <span className="block font-serif italic text-[#235538]">
              To start earning
            </span>
          </h2>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[#5e6660] md:text-[1.12rem]">
           
          </p>
        </RevealOnScroll>

        <div className="mt-12 grid gap-12 md:grid-cols-[1fr_1fr] md:gap-16 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-6 md:space-y-8 md:mt-0">
            {steps.map((step, index) => (
              <RevealOnScroll key={step.marker} delay={index * 0.06}>
                <article className="grid grid-cols-[54px_1fr] gap-4 md:grid-cols-[90px_1fr] md:gap-3">
                  <div className="relative flex justify-center">
                    <div className="z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#dbe8de] bg-[#235538] text-lg font-serif text-white md:h-12 md:w-12 md:text-xl">
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
                    <h3 className="mt-2 font-serif text-base font-semibold leading-tight text-[#202722] md:text-lg">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-4xl text-sm leading-relaxed text-[#5e6660] md:text-base italic">
                      {step.description}
                    </p>
                  </div>
                </article>
              </RevealOnScroll>
            ))}
          </div>

          <div className="order-1 md:order-3">
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
