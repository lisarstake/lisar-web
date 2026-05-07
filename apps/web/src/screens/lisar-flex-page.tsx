import MarketingPageShell from "@/components/landing/marketing-page-shell";

const LisarFlexPage = () => {
  return (
    <MarketingPageShell
      title="Lisar Flex"
      subtitle="Save on subscriptions you love — Claude, Spotify, Adobe, Canva, and more. Lisar Flex earns yield while covering your monthly bills."
      updatedAt="May 2026"
      notice="Product overview and user guide"
    >
      <div className="space-y-7 text-[#3a433d]">
        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">1. Overview</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Lisar Flex is designed for users who want to cover their favorite monthly subscriptions effortlessly. Instead of paying for each service separately, you fund your Flex wallet once and let your savings earn yield while covering bills like Claude, Spotify, Adobe, Canva, and more.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">2. How Flex works</h2>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed md:text-base">
            <li>Create and fund your Lisar Flex wallet with naira or crypto.</li>
            <li>Select the subscriptions you want covered monthly.</li>
            <li>Your balance earns daily yield while subscription costs are reserved.</li>
            <li>Lisar handles the payments automatically — uninterrupted access, zero hassle.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">3. What makes Flex different</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed md:text-base">
            <li>Your money works for you — earning yield while covering bills you already pay.</li>
            <li>Set it once, enjoy uninterrupted access month over month.</li>
            <li>No need to top up manually for each subscription.</li>
            <li>Flexible spending with the benefit of daily interest on your savings.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">4. Supported subscriptions</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Lisar Flex supports a wide range of digital tools and services, including but not limited to Claude Code, Spotify, Adobe Creative Cloud, Canva Pro, Lovable, YouTube Premium, and more. The list of supported subscriptions is updated regularly based on user demand.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">5. Returns and yield</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Your Flex balance earns daily interest at the live rate shown in your dashboard. The yield helps offset your subscription costs over time. Returns are variable and based on prevailing market conditions and strategy performance.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">6. Deposits, withdrawals, and timing</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Funding and withdrawals are initiated from your Lisar account. Processing times can vary depending on partner rails, network conditions, and compliance checks. Any applicable windows or limits are shown in-app before confirmation.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">7. Risk disclosure</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Lisar Flex is not a bank deposit account and is not covered by deposit insurance. Capital preservation is a product objective but not a guarantee. Operational, market, and counterparty risks may affect outcomes. Subscription coverage depends on sufficient wallet balance.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">8. Who Flex is best for</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Lisar Flex is ideal for users who pay for multiple subscriptions monthly, want to earn yield on funds that would otherwise sit idle, and prefer a hands-off approach to managing recurring digital payments.
          </p>
        </section>
      </div>
    </MarketingPageShell>
  );
};

export default LisarFlexPage;
