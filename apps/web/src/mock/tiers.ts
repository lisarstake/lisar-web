export interface YieldTier {
  id: number;
  title: string;
  description: string;
  bgColor: string;
  buttonBg: string;
  buttonText: string;
  image: string;
  imageClass: string;
  isLocked?: boolean;
}

export const highYieldTiers: YieldTier[] = [
  {
    id: 1,
    title: "Flexible",
    description:
      "Lock up up your balance for a period of time and earn rewards. Up to 35% APY.",
    isLocked: false,
    bgColor: "bg-transparent border-2 border-[#2a2a2a]",
    buttonBg: "bg-[#C7EF6B] hover:bg-[#B8E55A]",
    buttonText: "text-black",
    image: "/highyield-1.svg",
    imageClass:
      "absolute bottom-[-5px] right-[-5px] w-16 h-16 object-contain opacity-80",
  },
  {
    id: 2,
    title: "Platinum",
    description:
      "Access even higher yields with up to 45% APY. Perform more activities to unlock.",
    isLocked: true,
    bgColor: "bg-transparent border-2 border-[#2a2a2a]",
    buttonBg: "bg-[#2a2a2a] cursor-not-allowed opacity-50",
    buttonText: "text-white/50",
    image: "/highyield-2.svg",
    imageClass:
      "absolute bottom-[-15px] right-[0px] w-24 h-24 object-contain opacity-80",
  },
  // {
  //   id: 3,
  //   title: "Diamond",
  //   description:
  //     "Premium tier with maximum benefits and highest APY. Reserved for our most valued members.",
  //   isLocked: true,
  //   bgColor: "bg-transparent border-2 border-[#2a2a2a]",
  //   buttonBg: "bg-[#2a2a2a] cursor-not-allowed opacity-50",
  //   buttonText: "text-white/50",
  //   image: "/highyield-4.svg",
  //   imageClass:
  //     "absolute bottom-[-15px] right-[-15px] w-24 h-24 object-contain opacity-80",
  // },
];

export const stableYieldTiers: YieldTier[] = [
  // {
  //   id: 1,
  //   title: "USD Base",
  //   description:
  //     "Earn stable yields with flexible access to your savings. Up to 6.5% per annum.",
  //   bgColor: "bg-transparent border-2 border-[#2a2a2a]",
  //   buttonBg: "bg-[#C7EF6B] hover:bg-[#6da7fd]",
  //   buttonText: "text-black",
  //   image: "/maple.svg",
  //   imageClass: "w-14 h-14 object-contain opacity-90",
  // },
  {
    id: 2,
    title: "USD Plus",
    description:
      "Earn yields on your balance with up to 14% per annum with instant redemption",
    bgColor: "bg-transparent border-2 border-[#2a2a2a]",
    buttonBg: "bg-[#C7EF6B] hover:bg-[#6da7fd]",
    buttonText: "text-black",
    image: "/perena2.png",
    imageClass: "w-16 h-16 object-contain opacity-90",
  },
];
