import MarketingPageShell from "@/components/landing/marketing-page-shell";

const TermsOfUsePage = () => {
  return (
    <MarketingPageShell
      title="Terms of Use"
      subtitle="These terms govern your access to and use of Lisar services, products, websites, applications, and associated features."
      updatedAt="April 20, 2026"
      notice="By using Lisar, you agree to these terms"
    >
      <div className="space-y-7 text-[#3a433d]">
        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">1. Acceptance of terms</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            By creating an account or using Lisar services, you agree to these Terms of Use and any related disclosures provided inside the platform.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">2. Eligibility and account responsibility</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            You must provide accurate information and maintain the confidentiality of your credentials. You are responsible for activity on your account unless otherwise required by applicable law.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">3. Service scope</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Lisar provides digital access to savings and growth products, account tools, performance views, and support features. Product availability may vary by location, compliance requirements, and operational readiness.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">4. Returns and risk disclosure</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Displayed returns can be estimates, variable rates, or campaign figures depending on product type. They are not guarantees unless explicitly stated otherwise. Past performance does not guarantee future performance.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">5. Fees, spreads, and limits</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Applicable fees, timing windows, contribution limits, and withdrawal terms are presented in your transaction flow or product screen. By confirming a transaction, you accept the applicable terms shown at that time.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">6. Prohibited activity</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            You agree not to misuse Lisar services, attempt unauthorized access, circumvent security controls, or use the platform for unlawful or fraudulent activity.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">7. Suspension and termination</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Lisar may restrict or suspend access where required for compliance, security, abuse prevention, or operational protection. We may also close inactive or non-compliant accounts in line with applicable policy.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">8. Intellectual property</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            All platform content, brand assets, and product materials are owned by Lisar or licensed to Lisar, except where otherwise indicated. No rights are transferred except limited use rights required to access the service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">9. Communications</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            You consent to receiving service-related communications through email, in-app notices, SMS, or other official channels where appropriate.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">10. Limitation of liability</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            To the fullest extent permitted by law, Lisar is not liable for indirect, incidental, or consequential losses arising from service use, market movements, or third-party infrastructure events.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">11. Changes to terms</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            We may update these terms from time to time. Continued use of Lisar after updates take effect constitutes acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">12. Contact and support</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            For questions about these Terms of Use, contact Lisar through the official support channels provided on our website and dashboard.
          </p>
        </section>
      </div>
    </MarketingPageShell>
  );
};

export default TermsOfUsePage;
