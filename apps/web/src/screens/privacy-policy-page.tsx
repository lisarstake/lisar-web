import MarketingPageShell from "@/components/landing/marketing-page-shell";

const PrivacyPolicyPage = () => {
  return (
    <MarketingPageShell
      title="Privacy Policy"
      subtitle="How Lisar collects, uses, stores, shares, and protects personal information across our website, apps, and support channels."
      updatedAt="April 20, 2026"
      notice="Please read this policy carefully before using Lisar"
    >
      <div className="space-y-7 text-[#3a433d]">
        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">1. Introduction</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            This Privacy Policy explains how Lisar handles personal data when you use our platform. By using Lisar, you acknowledge this policy and consent to processing needed to provide services, comply with law, and maintain platform security.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">2. Information we collect</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed md:text-base">
            <li>Identity and profile data: name, email, phone, and account preferences.</li>
            <li>Financial and transaction data: deposits, withdrawals, balances, and product activity.</li>
            <li>Technical data: device type, browser, IP address, and app diagnostics.</li>
            <li>Support data: messages, feedback, and customer service interactions.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">3. How we use information</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed md:text-base">
            <li>To open and operate your account.</li>
            <li>To process product actions and transaction requests.</li>
            <li>To detect abuse, fraud, and security events.</li>
            <li>To improve platform performance and user experience.</li>
            <li>To deliver regulatory and service communications.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">4. Legal basis and compliance</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Lisar processes personal data under one or more lawful grounds: performance of service contracts, legitimate business interest, compliance obligations, and user consent where required.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">5. Sharing of information</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            We share information only with vetted service providers and partners necessary for infrastructure, payments, analytics, customer support, and compliance. We may also disclose data where legally required by a valid request.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">6. Data retention</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            We retain personal data for as long as needed to deliver services, resolve disputes, investigate abuse, and satisfy legal or regulatory obligations. Retention timelines may vary by data type and jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">7. Cookies and similar technologies</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            We use cookies and related technologies to authenticate sessions, understand product usage, and improve reliability. You can control certain cookie settings through your browser configuration.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">8. Security safeguards</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Lisar uses layered security controls to reduce unauthorized access risk, including access restrictions, encrypted transport, monitoring, and internal process controls. No system is perfectly secure, but we continuously improve our defenses.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">9. Your rights and choices</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Depending on applicable law, you may request access, correction, deletion, export, or restriction of eligible personal data. You may also opt out of non-essential communications while still receiving critical account notices.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">10. Children and minors</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            Lisar services are intended for eligible users under applicable law. We do not knowingly collect personal information from minors where prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">11. Policy updates</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            We may revise this policy periodically. If changes are material, we will provide a visible notice through email, in-app messaging, or website updates before or when the update takes effect.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1f2621] md:text-lg">12. Contact</h2>
          <p className="mt-2 text-sm leading-relaxed md:text-base">
            For privacy questions or data requests, please contact Lisar through official support channels listed on the website and inside your account dashboard.
          </p>
        </section>
      </div>
    </MarketingPageShell>
  );
};

export default PrivacyPolicyPage;
