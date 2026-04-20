import MarketingPageShell from "@/components/landing/marketing-page-shell";

const LisarGrowthPage = () => {
  return (
    <MarketingPageShell
      title="Lisar Growth"
      subtitle="A higher-yield product path for users seeking stronger upside and who understand the trade-off of higher variability."
      updatedAt="April 20, 2026"
      notice="Product overview and risk summary"
    >
      <div className="space-y-7 text-[#3a433d]">
        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">1. Overview</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Lisar Growth is designed for users aiming for higher returns than standard savings products. It uses managed strategy execution so you do not need to trade, rebalance, or monitor the market daily.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">2. How Growth works</h2>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed md:text-base">
            <li>Fund your account in naira.</li>
            <li>Select Lisar Growth and confirm your contribution.</li>
            <li>Lisar deploys capital into eligible higher-yield strategies.</li>
            <li>Track portfolio performance and accrued returns in-app.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">3. Return profile</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Growth products can deliver stronger yield potential, especially over longer holding periods. However, returns are more sensitive to market conditions and may be less stable than Savings outcomes.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">4. Key risks</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed md:text-base">
            <li>Market risk: yield opportunities can tighten or reverse.</li>
            <li>Liquidity risk: specific exits may take longer under stress.</li>
            <li>Operational risk: outages or network events can affect timing.</li>
            <li>Counterparty risk: third-party failure can impact performance.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">5. Suitability</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Growth is better for users with moderate-to-high risk tolerance, users with longer time horizons, and users who understand that higher expected return comes with higher uncertainty.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">6. Funding and withdrawals</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Deposits are accepted in naira. Withdrawal timing depends on the active product window and strategy liquidity profile. Live timelines are always shown before final submission.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">7. Fees and net yield</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Any applicable fees, spreads, or campaign terms are disclosed before you confirm. Yield shown in-app is intended to help you understand expected net outcomes under current conditions.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">8. Important disclaimer</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Lisar Growth does not guarantee profit or principal protection. Historical or projected returns are not promises of future performance.
          </p>
        </section>
      </div>
    </MarketingPageShell>
  );
};

export default LisarGrowthPage;
