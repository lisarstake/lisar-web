import MarketingPageShell from "@/components/landing/marketing-page-shell";

const LisarSavingsPage = () => {
  return (
    <MarketingPageShell
      title="Lisar Savings"
      subtitle="Save in naira, earn dollar-backed yield daily, and keep your experience simple from deposit to withdrawal."
      updatedAt="April 20, 2026"
      notice="Product overview and user guide"
    >
      <div className="space-y-7 text-[#3a433d]">
        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">1. Overview</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Lisar Savings is our lower-risk product track for users who want consistency over complexity. You fund your wallet in naira, select Savings, and your balance starts accruing yield at the live product rate shown in your dashboard.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">2. How it works</h2>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed md:text-base">
            <li>Create and verify your Lisar account.</li>
            <li>Deposit naira from your bank or supported funding rails.</li>
            <li>Choose Lisar Savings and confirm amount.</li>
            <li>Track accrued yield and request withdrawal when needed.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">3. What makes Savings different</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed md:text-base">
            <li>Designed for steadier return behavior compared with Growth products.</li>
            <li>Dollar-denominated strategy exposure in the background.</li>
            <li>No active trading decisions required from you.</li>
            <li>Simple progress view with deposit, accrued interest, and total balance.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">4. Returns and compounding</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Savings returns are variable and based on prevailing market conditions and strategy performance. Yield may accrue daily and compound over time. Displayed rates are indicative and can change without notice.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">5. Deposits, withdrawals, and timing</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Funding and withdrawals are initiated from your Lisar account. Processing times can vary depending on partner rails, network conditions, and compliance checks. Any applicable windows or limits are shown in-app before confirmation.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">6. Risk disclosure</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Lisar Savings is not a bank deposit account and is not covered by deposit insurance. Capital preservation is a product objective but not a guarantee. Operational, market, and counterparty risks may affect outcomes.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">7. Fees and charges</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Where fees apply, they are disclosed before you proceed. Some costs may be embedded in pricing or reflected in net yield. Always review the transaction breakdown in your confirmation screen.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">8. Who Savings is best for</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Lisar Savings is suitable for users focused on consistency, users building emergency buffers, and users who prefer a simpler yield experience over aggressive growth targeting.
          </p>
        </section>
      </div>
    </MarketingPageShell>
  );
};

export default LisarSavingsPage;
