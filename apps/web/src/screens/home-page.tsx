import Navbar from "../components/general/nav-bar";
import Hero from "../components/general/hero";
import Footer from "../components/general/footer";
import { UseCasesSection } from "../components/general/usecases";
import { Currencies } from "../components/general/chains";
import FAQ from "../components/general/faq";
import NewsSection from "../components/general/news-section";

function HomePage() {
  return (
    <div className="lg:px-20">
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
