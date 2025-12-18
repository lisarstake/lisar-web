import React, { useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const supportedChains = [
  {
    name: "Livepeer",
    img: "/lpt.svg",
    comingSoon: false,
  },

  {
    name: "Perena",
    img: "/perena-partner.svg",
    comingSoon: false,
  },
  {
    name: "Onramp",
    img: "/onramp-partner.svg",
    comingSoon: false,
  },
  {
    name: "Maple",
    img: "/maple-partner.svg",
    comingSoon: false,
  },
  {
    name: "Solana",
    img: "/sol.svg",
    comingSoon: false,
  },
  // {
  //   name: "Lisk",
  //   img: "/lisk.png",
  //   comingSoon: false,
  // },
];

const PartnerItem = ({ chain }: { chain: (typeof supportedChains)[0] }) => (
  <div className="flex flex-col items-center justify-center" title={chain.name}>
    <div className="flex flex-row items-center justify-center">
      <img
        src={chain.img}
        alt={chain.name}
        className={
          chain.name === "Solana"
            ? "h-3.5 w-auto object-contain"
            : chain.name === "Lisk"
              ? "h-5 w-auto object-contain mb-2"
              : chain.name === "Perena"
                ? "h-5 w-auto object-contain"
                : chain.name === "Onramp"
                  ? "h-5 w-auto object-contain"
                  : chain.name === "Maple"
                    ? "h-5 w-auto object-contain"
                    : "h-3 w-auto object-contain"
        }
      />
      {chain.comingSoon && (
        <div className="bg-[#1F2421] text-white text-[10px] font-medium rounded-full px-2 py-0.5 shadow-lg">
          Coming Soon
        </div>
      )}
    </div>
  </div>
);

export const Currencies = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [api]);

  const duplicatedChains = [
    ...supportedChains,
    ...supportedChains,
    ...supportedChains,
  ];

  return (
    <footer className="w-full mx-auto py-12 px-8 flex-col items-center flex relative overflow-hidden">
      <div className="text-[oklch(0.22_0.13_145)] dark:text-[oklch(0.65_0.18_145)] text-base font-medium mb-6 text-center relative z-10">
        <span className="text-xl text-black font-medium">Our Partners</span>
      </div>

      {/* Mobile Carousel */}
      <div className="w-full md:hidden relative z-10 flex justify-center">
        <Carousel
          setApi={setApi}
          opts={{
            align: "center",
            loop: true,
            skipSnaps: false,
            dragFree: true,
          }}
          className="w-full max-w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {duplicatedChains.map((chain, index) => (
              <CarouselItem
                key={`${chain.name}-${index}`}
                className="pl-2 md:pl-4 basis-auto"
              >
                <div className="px-4">
                  <PartnerItem chain={chain} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:flex flex-row items-center justify-center gap-16 mt-2 relative z-10">
        {supportedChains.map((chain) => (
          <PartnerItem key={chain.name} chain={chain} />
        ))}
      </div>
    </footer>
  );
};

export default Currencies;
