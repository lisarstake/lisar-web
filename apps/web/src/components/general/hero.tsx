import { useNavigate } from "react-router-dom";
import { LisarLines } from "./lisar-lines";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-white relative overflow-hidden">
      {/* Lisar Lines Decorations */}
      <LisarLines position="top-right" />
      <div className="hidden md:block">
        <LisarLines position="bottom-left" />
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12 md:py-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Section - Informational */}
          <div className="space-y-8 order-1 md:order-1">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                Earn, Save, and Spend Globally
              </h1>
              <p className="text-lg md:text-xl text-gray-600 italic font-playfair">
                A DeFi Bank Built for Everyone
              </p>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed">
              Earn, save, and spend globally with crypto. Earn competitive returns while keeping full custody of your funds.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4">
              <button
                className="bg-[#C7EF6B] rounded-lg cursor-pointer text-[#060E0A] px-8 py-3 font-semibold transition-colors"
                onClick={() => navigate("/login")}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Right Section - Image */}
          <div className="flex items-center justify-center order-2 md:order-2">
            <img
              src="/home2.svg"
              alt="Hero illustration"
              className="w-full md:max-w-xs object-contain"
              style={{
                imageRendering: 'crisp-edges',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                ...({ WebkitImageRendering: 'crisp-edges' } as React.CSSProperties),
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
