import { type ReactNode } from "react";
import Navbar from "./nav-bar";
import FutureCtaSection from "./future-cta-section";
import Footer from "./footer";

type MarketingPageShellProps = {
  title: string;
  subtitle: string;
  updatedAt?: string;
  notice?: string;
  children: ReactNode;
};

export const MarketingPageShell = ({
  title,
  subtitle,
  updatedAt,
  notice,
  children,
}: MarketingPageShellProps) => {
  return (
    <div className="w-full bg-white md:px-16 lg:px-24">
      <Navbar />

      <main className="w-full">
        {/* HERO */}
        <section className="relative w-full border-b border-[#dce4d7] bg-[#f3f5f4] px-6 md:px-8 min-h-[72svh] md:min-h-[80vh] flex items-center justify-center">
          {/* Background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.25]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 12% 18%, #dcebe3 0, transparent 34%), radial-gradient(circle at 88% 12%, #e3efe8 0, transparent 30%), radial-gradient(circle at 78% 86%, #d9e9df 0, transparent 28%)",
            }}
          />

          {/* Center content */}
          <div className="relative mx-auto w-full max-w-5xl text-center py-12">
            <h1 className="font-sans text-[1.5rem] leading-[0.94] tracking-[-0.02em] text-[#111111] md:text-[3rem]">
              {title}
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#5f6762] md:text-[1.12rem]">
              {subtitle}
            </p>
          </div>

          {/* Bottom meta */}
          {updatedAt || notice ? (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
              {updatedAt ? (
                <p className="text-xs uppercase tracking-[0.18em] text-[#6f7d74]">
                  Updated {updatedAt}
                </p>
              ) : null}

              {notice ? (
                <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#6f7d74]">
                  {notice}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>

        {/* CONTENT */}
        <section className="w-full border-b border-[#dce4d7] px-6 py-10 md:px-8 md:py-14">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </section>

        {/* CTA */}
        <div className="w-full border-b border-[#dce4d7]">
          <FutureCtaSection />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MarketingPageShell;