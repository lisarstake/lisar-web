import Navbar from "../components/general/nav-bar";
import Hero from "../components/general/hero";
import Footer from "../components/general/footer";
import { UseCasesSection } from "../components/general/usecases";
import { Currencies } from "../components/general/chains";
import FAQ from "../components/general/faq";
import NewsSection from "../components/general/news-section";
import { usePageTracking } from "../hooks/usePageTracking";

function HomePage() {
  // Track landing page visit
  usePageTracking('Landing Page', { page_type: 'home' });
  return (
    <div className="lg:px-24">
      <Navbar />
      <Hero />
      <Currencies />
      <UseCasesSection />
      <NewsSection />
      <FAQ/>
      <Footer/>
    </div>
  );
}

export default HomePage;
