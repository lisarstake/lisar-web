

const supportedChains = [
  {
    name: "Livepeer",
    img: "/lpt.svg",
    comingSoon: false,
  },
  {
    name: "Solana",
    img: "/sol.svg",
    comingSoon: true,
  },
  {
    name: "Lisk",
    img: "/lisk.png",
    comingSoon: true,
  },
 
];

export const Currencies = () => {
  return (
    <footer className="w-full mx-auto py-12 px-8 flex-col items-center hidden md:flex relative overflow-hidden">
     
      
      <div className="text-[oklch(0.22_0.13_145)] dark:text-[oklch(0.65_0.18_145)] text-base font-medium mb-6 text-center relative z-10">
        <span className="text-xl text-black font-medium">Supported Chains</span>
      </div>
      <div className="flex flex-row items-center justify-center gap-10 md:gap-20 mt-2 relative z-10">
        {supportedChains.map((chain) => (
          <div
            key={chain.name}
            className="flex flex-col items-center"
            title={chain.name}
          >
            <div className="flex flex-row items-center gap-2">
              <img
                src={chain.img}
                alt={chain.name}
                className={
                  chain.name === "Solana"
                    ? "h-5 w-auto object-contain mb-2"
                    : chain.name === "Lisk"
                    ? "h-7 w-auto object-contain mb-4"
                    : "h-4 w-auto object-contain mb-2"
                }
              />
              {chain.comingSoon && (
                <div className="bg-[#1F2421] text-[#fff] text-[10px] font-medium rounded-full px-2 py-0.5 shadow-lg mb-2">
                  Coming Soon
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
};

export default Currencies;
