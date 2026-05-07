import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RevealOnScroll from "./reveal-on-scroll";

export const FutureCtaSection = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-white py-10 md:py-14 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06]" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v1H0zM0 0v60h1V0z' fill='%23235538' fill-opacity='1'/%3E%3C/svg%3E")`}} />
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8 relative z-10">
        <RevealOnScroll>
          <div className="px-6 py-14 text-center md:px-10 md:py-20">


            <h2 className="mt-5 space-y-2 text-[2rem] leading-[0.95] tracking-[-0.03em] text-[#111111] md:text-[3rem]">
              <span className="block font-sans font-semibold">Your money has been</span>
              <span className="block font-sans italic">Idle long enough.</span>
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="mt-4 inline-block rounded-full border-2 border-black bg-[#C7EF6B] px-8 py-2.5 text-xl md:text-3xl font-medium text-black transition hover:bg-[#b7e354] cursor-pointer"
              >
                Start today
                <ArrowRight size={30} className="ml-2 inline" />
              </button>
            </h2>

            {/* <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#5e6660] md:text-[1.06rem]">
              Deposit naira. Earn dollar-backed interest daily. 
            </p> */}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const section = document.getElementById("yield-estimate");
                  section?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="underline bg-white px-8 py-3 text-base text-[#232b26] transition cursor-pointer"
              >
                Calculate my returns first
              </button>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

export default FutureCtaSection;
