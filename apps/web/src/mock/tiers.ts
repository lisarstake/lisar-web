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
      "Start your journey with our entry-level tier. Perfect for beginners.",
    isLocked: false,
    bgColor: "bg-transparent border-2 border-[#2a2a2a]",
    buttonBg: "bg-[#a3d039] hover:bg-[#B8E55A]",
    buttonText: "text-black",
    image: "/highyield-1.svg",
    imageClass:
      "absolute bottom-[-5px] right-[-5px] w-16 h-16 object-contain opacity-80",
  },
  {
    id: 2,
    title: "Platinum",
    description:
      "Unlock higher yields. This tier offers enhanced returns for committed members.",
    isLocked: true,
    bgColor: "bg-transparent border-2 border-[#2a2a2a]",
    buttonBg: "bg-[#2a2a2a] cursor-not-allowed opacity-50",
    buttonText: "text-white/50",
    image: "/highyield-2.svg",
    imageClass:
      "absolute bottom-[-15px] right-[0px] w-24 h-24 object-contain opacity-80",
  },
  {
    id: 3,
    title: "Diamond",
    description:
      "Premium tier with maximum benefits and highest APY. Reserved for our most valued members.",
    isLocked: true,
    bgColor: "bg-transparent border-2 border-[#2a2a2a]",
    buttonBg: "bg-[#2a2a2a] cursor-not-allowed opacity-50",
    buttonText: "text-white/50",
    image: "/highyield-4.svg",
    imageClass:
      "absolute bottom-[-15px] right-[-15px] w-24 h-24 object-contain opacity-80",
  },
];

export const stableYieldTiers: YieldTier[] = [
  {
    id: 1,
    title: "USD Base",
    description:
      "Earn stable yields with flexible access to your savings. Up to 6.5% per annum.",
    isLocked: true,
    bgColor: "bg-transparent border-2 border-[#2a2a2a]",
    buttonBg: "bg-[#2a2a2a] cursor-not-allowed opacity-50",
    buttonText: "text-white/50",
    image: "/maple.svg",
    imageClass: "w-16 h-16 object-contain opacity-90",
  },
  {
    id: 2,
    title: "USD Plus",
    description:
      "Higher stable yields with flexible access to your savings. Up to 14% per annum.",
    bgColor: "bg-transparent border-2 border-[#2a2a2a]",
    buttonBg: "bg-[#86B3F7] hover:bg-[#6da7fd]",
    buttonText: "text-black",
    image: "/perena.svg",
    imageClass: "w-16 h-16 object-contain opacity-90",
  },
];


