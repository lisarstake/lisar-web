import Navbar from "../components/landing/nav-bar";
import Hero from "../components/landing/hero";
import Footer from "../components/landing/footer";
import { TimeIsMoneySection } from "../components/landing/yield-estimate";
import { TestimonialsSection } from "../components/landing/testimonials-section";
import { usePageTracking } from "../hooks/usePageTracking";
import GrowthOptionsSection from "@/components/landing/growth-options-section";
import HighlightShowcaseSection from "@/components/landing/community";
import WhyLisarSection from "@/components/landing/why-lisar-section";
import NewsletterDisclaimerSection from "@/components/landing/newsletter-section";
import PartnersSection from "@/components/landing/partners-section";
import FutureCtaSection from "@/components/landing/future-cta-section";

function HomePage() {
  // Track landing page visit
  usePageTracking('Landing Page', { page_type: 'home' });

  const sectionFrame =
    "w-full border-b border-[#dce4d7] flex items-center justify-center";
  const heroSectionFrame =
    "w-full border-b border-[#dce4d7] flex items-start justify-center";

  return (
    <div className="w-full bg-[#f7faf5] md:px-16 lg:px-24">
      <Navbar />
      <main className="w-full">
        <div className={heroSectionFrame}>
          <div className="w-full">
            <Hero />
          </div>
        </div>

        <div className="w-full border-b border-[#dce4d7] flex items-start justify-center">
          <div className="w-full">
            <WhyLisarSection />
          </div>
        </div>

        <div className={`${sectionFrame} min-h-[88svh] md:min-h-[95svh]`}>
          <div className="w-full">
            <GrowthOptionsSection />
          </div>
        </div>

        <div className={`${sectionFrame} min-h-[88svh] md:min-h-[94svh]`}>
          <div className="w-full">
            <TimeIsMoneySection />
          </div>
        </div>

        <div className={`${sectionFrame} min-h-[75svh] md:min-h-[82svh]`}>
          <div className="w-full">
            <TestimonialsSection />
          </div>
        </div>

        <div className={`${sectionFrame} min-h-[85svh] md:min-h-[92svh]`}>
          <div className="w-full">
            <HighlightShowcaseSection />
          </div>
        </div>

        <div className="w-full border-b border-[#dce4d7]">
          <PartnersSection />
        </div>

        <div className={`${sectionFrame} min-h-[60svh] md:min-h-[70svh]`}>
          <div className="w-full">
            <FutureCtaSection />
          </div>
        </div>

        <NewsletterDisclaimerSection />
      </main>

      <Footer/>
    </div>
  );
}

export default HomePage;
