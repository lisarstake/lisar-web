import RevealOnScroll from "./reveal-on-scroll";
import SectionHeading from "./section-heading";

const partners = [
  { name: "Livepeer", logo: "/lpt.svg" },
  { name: "Perena", logo: "/perena-partner.svg" },
  { name: "Maple", logo: "/maple-partner.svg" },
  { name: "Solana", logo: "/sol.svg" },
];

export const PartnersSection = () => {
  return (
    <section className="w-full py-14 md:py-18">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
        <SectionHeading tag="PARTNERS" supportingText="Backed by" />
        <RevealOnScroll>
          <div className="mt-2 mb-12 grid grid-cols-2 gap-3 md:grid-cols-4">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="flex min-h-[20px] items-center justify-center rounded-xl px-6 py-3"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-5 w-auto object-contain md:h-6"
                />
              </div>
            ))}
          </div>
        </RevealOnScroll>
        <SectionHeading supportingText="As seen in" />
        <RevealOnScroll>
          <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="flex min-h-[20px] items-center justify-center rounded-xl px-6 py-3"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-5 w-auto object-contain md:h-6"
                />
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

export default PartnersSection;
