import { BadgeCheck } from "lucide-react";
import RevealOnScroll from "./reveal-on-scroll";

const testimonials = [
  {
    name: "JohnnE",
    handle: "@0xJohnnE",
    avatar: "/fb1.jpg",
    text: "Lisar offers juicy APY, Up to 60% Got hands-on experience, tested the product myself, and honestly… this is how saving should feel.",
    date: "2:31 PM · Jan 23, 2026",
    views: "339 Views",
  },
  {
    name: "Pluto Dev🪐(💙,🧡)",
    handle: "@ekelemefavour1",
    avatar: "/fb2.jpg",
    text: "Seeing people use lisar was a real reminder: good infra is nothing without real-world onboarding. This is what the community needs!",
    date: "4:10 PM · Jan 24, 2026",
    views: "402 Views",
  },
  {
    name: "Cillatech",
    handle: "@Cilla_Tech_",
    avatar: "/fb3.jpg",
    text: "Had a great time today at the @lisarstake event. Thanks for having me.",
    date: "5:56 PM · Jan 24, 2026",
    views: "418 Views",
  },
  {
    name: "𝕺𝖜𝖊𝖎 𝖊𝖇𝖎𝖕𝖆𝖘𝖚 𝖕𝖊𝖙𝖊𝖗",
    handle: "@Her_programmer",
    avatar: "/fb4.jpg",
    text: "This year started with investment. Next time you see me call me Investor 😎😎",
    date: "2:42 PM · Jan 24, 2026",
    views: "365 Views",
  },
  {
    name: "Serial Winner",
    handle: "@seriawinner",
    avatar: "/fb5.jpg",
    text: "Thanks team, we need more of this. Now I can do more with my cash!",
    date: "10:30 AM · Feb 22, 2026",
    views: "852 Views",
  },
];

const TestimonialCard = ({ item }: { item: (typeof testimonials)[number] }) => (
  <article className="w-[380px] max-w-[92vw] shrink-0 rounded-lg border border-[#dbe2dd] bg-white p-4 text-[#222a24]">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src={item.avatar}
          alt={item.name}
          className="h-7 w-7 rounded-full object-cover"
        />
        <div>
          <p className="text-sm md:text-base font-semibold leading-tight flex items-center gap-1">
            {item.name}
            <BadgeCheck className="text-white" size={18} fill="#3b82f6"/>
          </p>
          <p className="text-[#5e6660] text-sm">{item.handle}</p>
        </div>
      </div>
      <img
        src="/x-logo.png"
        alt="X"
        className="h-6 w-6 object-contain"
      />
    </div>
    <p className="mt-4 text-xs md:text-sm text-[#5e6660]">
      {item.text}
    </p>
    <p className="mt-4 text-xs md:text-sm text-[#8a938d]">
      {item.date} 
    </p>
  
  </article>
);

export const TestimonialsSection = () => {
  const firstRow = testimonials.slice(0, 3);
  const secondRow = testimonials.slice(2);

  return (
    <section className="w-full md:px-8 py-14 md:py-18 overflow-hidden">
      <div className="mx-auto w-full max-w-7xl">
        <div className="px-6 md:px-8">
          <RevealOnScroll>
            <div className="text-center flex flex-col items-center">
              <span className="inline-flex items-center rounded-full border border-black px-3 py-1 text-[10px] font-normal uppercase tracking-[0.2em] text-black">
                Testimonials
              </span>
              <h2 className="mt-5 text-[3rem] leading-[0.95] tracking-[-0.03em] text-[#111111] md:text-[4rem]">
                <span className="block font-sans font-semibold">What our users</span>
                <span className="block font-sans italic text-[#235538]">
                  say about us.
                </span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#5e6660] md:text-lg">
                Don't take our word for it. Hear it from real people.
              </p>
            </div>
          </RevealOnScroll>
        </div>

        <RevealOnScroll>
          <div className="space-y-4 mt-10">
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
