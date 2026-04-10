import RevealOnScroll from "./reveal-on-scroll";
import SectionHeading from "./section-heading";

const testimonials = [
  {
    name: "unahh evm/aco",
    handle: "@0xunahh",
    avatar: "https://i.pravatar.cc/80?img=12",
    text: "I used Lisar to move funds fast and it was smooth all the way. Clean flow and no stress.",
    date: "9:46 AM · Aug 27, 2025",
    views: "3,666 Views",
  },
  {
    name: "Yagazie || Designer",
    handle: "@yagazieweb",
    avatar: "https://i.pravatar.cc/80?img=16",
    text: "Nothing beats how easy it is to swap and withdraw. It feels like chatting a friend.",
    date: "11:37 AM · Aug 21, 2025",
    views: "402 Views",
  },
  {
    name: "CDGhost",
    handle: "@ChiefDaddyGhost",
    avatar: "https://i.pravatar.cc/80?img=20",
    text: "I withdrew my urgent cash and setup happened quickly. Interface is clear and fast.",
    date: "1:32 PM · Aug 14, 2025",
    views: "740 Views",
  },
  {
    name: "JoshDairo",
    handle: "@aushoj",
    avatar: "https://i.pravatar.cc/80?img=31",
    text: "Ever since I got to know Lisar, using it has been amazing. Trading and off-ramp feel simple.",
    date: "12:04 PM · Aug 21, 2025",
    views: "365 Views",
  },
  {
    name: "Temionchain",
    handle: "@_temio",
    avatar: "https://i.pravatar.cc/80?img=45",
    text: "Thanks team, we need more of this. Converted and withdrew with no drama.",
    date: "10:30 AM · Aug 21, 2025",
    views: "852 Views",
  },
];

const TestimonialCard = ({ item }: { item: (typeof testimonials)[number] }) => (
  <article className="w-[520px] max-w-[92vw] shrink-0 rounded-3xl bg-[#050505] p-5 text-white">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src={item.avatar}
          alt={item.name}
          className="h-10 w-10 rounded-full object-cover"
          loading="lazy"
        />
        <div>
          <p className="text-base md:text-lg font-semibold leading-tight">
            {item.name}
          </p>
          <p className="text-white/60 text-sm">{item.handle}</p>
        </div>
      </div>
      <img
        src="/x-logo.png"
        alt="X"
        className="h-6 w-6 object-contain invert"
      />
    </div>
    <p className="mt-4 text-sm md:text-base text-white/90 leading-relaxed">
      {item.text}
    </p>
    <p className="mt-5 text-xs md:text-sm text-white/55">
      {item.date} · {item.views}
    </p>
  </article>
);

export const TestimonialsSection = () => {
  const firstRow = testimonials.slice(0, 3);
  const secondRow = testimonials.slice(2);

  return (
    <section className="w-fulL md:px-8 py-14 md:py-18 overflow-hidden">
      <div className="mx-auto w-full max-w-7xl">
        <div className="px-6 md:px-8">
          <SectionHeading
            tag="TESTIMONIALS"
            supportingText="What our users say about us"
          />
        </div>

        <RevealOnScroll>
          <div className="space-y-4">
            <div className="relative">
              <div className="flex w-max gap-4 marquee-left">
                {[...firstRow, ...firstRow, ...firstRow].map((item, idx) => (
                  <TestimonialCard
                    key={`top-${item.handle}-${idx}`}
                    item={item}
                  />
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="flex w-max gap-4 marquee-right">
                {[...secondRow, ...secondRow, ...secondRow].map((item, idx) => (
                  <TestimonialCard
                    key={`bottom-${item.handle}-${idx}`}
                    item={item}
                  />
                ))}
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>

      <style>{`
        @keyframes marqueeLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
        @keyframes marqueeRight {
          from { transform: translateX(-33.333%); }
          to { transform: translateX(0); }
        }
        .marquee-left {
          animation: marqueeLeft 50s linear infinite;
        }
        .marquee-left:hover {
          animation-play-state: paused;
        }
        .marquee-right {
          animation: marqueeRight 50s linear infinite;
        }
        .marquee-right:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;
