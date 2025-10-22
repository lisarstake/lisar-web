import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Share2 } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";

interface LearnContent {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  videoUrl: string;
  brief: string;
  fullContent: string;
  category: "mandatory" | "academy";
}

export const LearnPage: React.FC = () => {
  const navigate = useNavigate();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"mandatory" | "academy">("academy");

  const learnContent: LearnContent[] = [
    {
      id: "1",
      title: "What is Lisar?",
      subtitle: "Introduction to Lisar and how it works",
      image: "/placeholder-image.jpg",
      videoUrl:
        "https://drive.google.com/file/d/1V9L49R6_2SjluIFFNEjwtGDeymCn70PL/view?usp=sharing",
      brief:
        "Learn what Lisar is and how it helps you earn extra income securing blockchain networks with zero crypto knowledge required.",
      fullContent:
        "Hello, my name is Lucy nice to have you try out Lisar! Let's quickly get you up to speed so you can navigate easily. What is Lisar? Lisar lets anyone earn extra income by securing blockchain networks. Your earnings depend on your stake — it could be a few dollars or thousands. Why does this matter? Earning can feel unpredictable at times. Some days are great, other times it slows down. Lisar helps balance that out by giving you a steady stream of income in the background. Think of it as setting up a smart salary for yourself that runs 24/7. What makes Lisar special? With Lisar you get all the benefits of crypto staking using your local currency, with zero crypto knowledge required. No gas fees, no complex tokens, no confusing steps. Lisar handles everything behind the scenes while you earn huge returns on your stake as rewards up to 68% APY. Your stake helps secure the blockchain, promoting decentralisation, and you get rewarded. Getting started is simple: Deposit fiat or crypto, pick a validator, stake, and start earning automatically. And your funds? Always accessible to withdraw whenever you want to. Welcome to Lisar—where your money truly works for you.",
      category: "mandatory",
    },
    {
      id: "2",
      title: "Where do the rewards come from?",
      subtitle: "Understanding the legitimacy of staking rewards",
      image: "/placeholder-image.jpg",
      videoUrl:
        "https://drive.google.com/file/d/1V9L49R6_2SjluIFFNEjwtGDeymCn70PL/view?usp=sharing",
      brief:
        "Discover how blockchain rewards work and why staking is a legitimate way to earn income through network security.",
      fullContent:
        "Now I know you're probably asking yourself, where do these rewards come from? Is this legitimate and how does it actually work? These are smart questions, and I'm glad you're asking them. Let's dive right in. Blockchains typically come in two major variants. Proof of Work and Proof of Stake. In POW systems new transactions are validated by doing energy intensive tasks essentially solving complex cryptographic puzzles. This has a major downside as it's incredibly inefficient and energy intensive. We're talking about consuming as much electricity as entire countries! POS systems on the other hand validate transactions by having token holders lock up their tokens otherwise known as staking. This helps secure the network from malicious actors who might seek to corrupt the system and incentivizes validators to do honest work. The greater the staked tokens, the more secure the network becomes. Here's where it gets interesting. To incentivize token holders to stake their tokens and secure the network, POS chains pay out inflationary rewards to these stakers as compensation for their service. The amount of rewards varies significantly from chain to chain. Some offer as low as 6.7% like Solana, while others provide as high as 78% APY. Picture it like how traditional financial systems work. Think of your bank, for example. You save your money with them, they lend it out to generate profits, and give you a small cut as interest. Similarly, when you stake through Lisar, your tokens are helping secure and operate the Livepeer network, and you get rewarded for that contribution. These rewards come directly from the protocol itself. It's built into the blockchain's economics, making it a legitimate and sustainable income source.",
      category: "mandatory",
    },
    {
      id: "3",
      title: "What are the risks of using Lisar?",
      subtitle: "Transparent discussion about potential risks",
      image: "/placeholder-image.jpg",
      videoUrl:
        "https://drive.google.com/file/d/1V9L49R6_2SjluIFFNEjwtGDeymCn70PL/view?usp=sharing",
      brief:
        "Learn about the risks involved with staking and how Lisar works to manage and minimize them for your safety.",
      fullContent:
        "In the last video, we covered where the rewards come from and answered the question of legitimacy. But let's be completely transparent here. No financial system is risk free, including Lisar. In this video, we'll be covering the possible risks involved and, more importantly, how we work to manage them. Counterparty risk. By using Lisar, you're trusting us to operate efficiently, ensuring your funds are secured and always available when you need them. This is the same type of risk you take when using any financial platform whether it's your bank, investment app, or even PayPal. We take this responsibility seriously and have implemented multiple security measures and regular audits to maintain your trust. Volatility risk. LPT the native token on the Livepeer network isn't a stablecoin, meaning its value can fluctuate sometimes going higher, sometimes dropping lower. In a worst case scenario, the value might drop significantly, potentially affecting both your principal capital and the rewards you've earned. However, historically, productive staking assets tend to appreciate over time as the networks they secure grow in value. Orchestrator actions. The rewards you earn on your stake are determined by several factors, including orchestrator reward cuts, fee percentages, and how often they call rewards. Orchestrators operate independently of Lisar and can choose to adjust their parameters, which might affect your final earned rewards. We actively monitor orchestrator performance and can recommend switches if needed. Governance and smart contract risk. Governance on Livepeer happens through self executing smart contracts, with token holders voting on network proposals. A majority vote could potentially change the current reward structure. Additionally, no smart contract is 100% immune to bugs or exploits, and in the rare case of a critical vulnerability, funds might be at risk. We're incredibly serious about user safety and confidence, which is why we believe in complete transparency about every possible risk involved. Knowledge is power, and we want you to make informed decisions about your financial future.",
      category: "mandatory",
    },
    {
      id: "4",
      title: "Crypto for beginners",
      subtitle: "Understanding cryptocurrency fundamentals",
      image: "/placeholder-image.jpg",
      videoUrl:
        "https://drive.google.com/file/d/1V9L49R6_2SjluIFFNEjwtGDeymCn70PL/view?usp=sharing",
      brief:
        "Start from the basics and learn what cryptocurrency is, how blockchains work, and why this matters.",
      fullContent:
        "Welcome to the in depth section! If you're completely new to cryptocurrency, don't worry. We're going to start from the very beginning and build your understanding step by step. What is cryptocurrency? Cryptocurrency is digital money that exists only online, but unlike your online bank account, it's not controlled by any single entity like a bank or government. Instead, it runs on something called a blockchain. Imagine it as a digital ledger that's copied across thousands of computers worldwide, making it virtually impossible to hack or manipulate. Key concepts you need to know. Tokens versus coins. Coins like Bitcoin or Ethereum have their own blockchain, while tokens like LPT which we use are built on top of existing blockchains. Wallets. These aren't physical wallets but digital applications that store your crypto. You have a public address which is like your email address that others can send money to and a private key which is like your password that you must keep secret. The golden rule is never share your private key with anyone. Blockchain networks. Different cryptocurrencies run on different networks. Ethereum is a massive computer that can run applications, while Bitcoin is more like digital gold. Livepeer runs on Ethereum, which is why LPT is an Ethereum based token. Why does this matter for Lisar? Understanding these basics helps you appreciate what's happening behind the scenes. When you stake through Lisar, you're participating in securing the Livepeer network, which processes and validates video streaming transactions. The network rewards you for this service, and Lisar makes the entire process as simple as using any regular app. The blockchain system is trustless. The code itself enforces the rules. This means your rewards are guaranteed by mathematics and code, not corporate promises. Don't feel overwhelmed if this seems complex. Lisar handles all the technical aspects so you can focus on earning. We convert complex blockchain operations into simple, familiar financial actions.",
      category: "academy",
    },
    {
      id: "5",
      title: "What is Lisar? (In-depth)",
      subtitle: "Deep dive into Lisar's mission and technology",
      image: "/placeholder-image.jpg",
      videoUrl:
        "https://drive.google.com/file/d/1V9L49R6_2SjluIFFNEjwtGDeymCn70PL/view?usp=sharing",
      brief:
        "Explore how Lisar makes crypto staking accessible and learn about the Livepeer network that powers your earnings.",
      fullContent:
        "Now that you understand the crypto basics, let's dive a bit deeper into what Lisar actually is and how we make crypto staking accessible to everyone. So we covered the basics earlier but let's get into more detail. Lisar enables anyone to earn recurring income by securing the Livepeer network. The income ranges from small amounts to thousands of dollars, all depending on how much you stake. Here's the thing about traditional investing. Most high yield opportunities are locked away for wealthy investors or institutions. Regular people get stuck with savings accounts that barely beat inflation. Meanwhile, crypto offers these incredible earning opportunities but you need technical knowledge that frankly, most people don't want to deal with. That's exactly why we built Lisar. We handle all the complex crypto stuff so you can focus on earning. You don't need to understand blockchain technology, you don't need to manage wallets or deal with gas fees. You just deposit your money and start earning. Here's how we make it simple. You can deposit regular money, dollars or euros, whatever you're comfortable with. We handle converting it to the right tokens behind the scenes. Instead of you having to research which validators are good or bad, we've already done that work. We pick the reliable, high performing ones to reduce risk. The interface looks and feels like any modern app you're used to. No confusing crypto exchange interfaces or complicated terminology. Now let's talk about Livepeer itself because this matters for your returns. Unlike many crypto projects that are purely speculative, Livepeer solves a real problem in a multi billion dollar industry (video streaming). Think about how much video content gets streamed every day. All those videos need processing power to encode and deliver to viewers. Right now, this is dominated by big centralised companies with expensive infrastructure. Livepeer creates a decentralised network where people can contribute their computing power for video processing and get paid for it. It's already processing real video content with real revenue flowing through the network and as more video platforms adopt decentralised streaming, demand for LPT tokens increases, potentially driving both staking rewards and token appreciation. When you stake through Lisar, your tokens help secure this network. The more tokens staked, the more secure and reliable the network becomes. In return, you get rewarded from the fees that video platforms pay to use the network plus inflationary tokens. Your stake principal stays available for withdrawal anytime with a short un-bonding period (7 days) compared to other chains usually around 20-30 days. When you stake through Lisar, you're not just earning returns, you're contributing to a mission. A mission to make video more accessible and affordable globally.",
      category: "academy",
    },
    {
      id: "6",
      title: "Intro to staking and yields",
      subtitle: "Understanding how staking generates returns",
      image: "/placeholder-image.jpg",
      videoUrl:
        "https://drive.google.com/file/d/1V9L49R6_2SjluIFFNEjwtGDeymCn70PL/view?usp=sharing",
      brief:
        "Learn the mechanics of staking, how yields work, and why staking is a powerful way to generate consistent returns.",
      fullContent:
        "Let's demystify staking and understand how you can generate consistent yields from it. This is where the magic happens, so pay close attention. What exactly is staking? Staking is putting your money to work, but instead of a bank using your money to make loans, your tokens are used to secure and operate a blockchain network. The network pays you rewards for this service. It's that simple. Types of yields in crypto. Staking rewards. Direct payments from the blockchain protocol. This is what Lisar focuses on. Lending yields. Earning interest by lending your crypto to borrowers. Liquidity mining. Providing liquidity to decentralized exchanges. Yield farming. More complex strategies combining multiple yield sources. Why staking yields exist. Blockchain networks need security and decentralization to function properly. Instead of hiring security companies, they incentivize token holders to participate in securing the network. The more people who stake, the more secure the network becomes. It's a beautiful alignment of incentives. Understanding APY or Annual Percentage Yield. When we say 68% APY, that means if you stake $1000, you could earn $680 in rewards over a year, assuming conditions remain constant. However, yields can fluctuate based on network conditions, number of stakers, and validator performance. Compounding magic. Most staking rewards compound automatically. If you earn 1% per week, that compounds to much more than 52% annually due to earning returns on your returns. This is why compound interest is so powerful. Active versus passive staking. With traditional staking, you'd need to actively manage your validator selection, monitor performance, and handle reward claims. Lisar makes it passive. We handle all the active management while you enjoy the returns. Livepeer staking specifics. LPT staking works in rounds approximately every 20 to 24 hours. Each round, orchestrators or validators call rewards, and stakers receive their share. The amount depends on the orchestrator's performance, their fee structure, and network activity. Factors affecting your yields. Orchestrator selection and performance. Network wide staking participation. Overall network growth and adoption. Token price movements affecting USD value of rewards. The key insight here is that staking transforms your idle money into productive capital that contributes to the digital economy while generating returns. Through Lisar, you're becoming a stakeholder in the future of decentralized infrastructure.",
      category: "academy",
    },
    {
      id: "7",
      title: "Risks associated with staking",
      subtitle: "Comprehensive risk analysis for informed decisions",
      image: "/placeholder-image.jpg",
      videoUrl:
        "https://drive.google.com/file/d/1V9L49R6_2SjluIFFNEjwtGDeymCn70PL/view?usp=sharing",
      brief:
        "Deep dive into the four main risks of staking: counterparty, volatility, orchestrator actions, and governance risks.",
      fullContent:
        "We've touched on risks briefly before, but let's dive much deeper into each of the four main risks we mentioned. Understanding these risks isn't meant to scare you away. It's to make you a more informed participant who can make better decisions. Counterparty risk. This is the risk of trusting us to operate correctly. Lisar is non-custodial, so you always control your funds, but you still rely on our systems to function securely and efficiently. We follow strict security best practices, perform third-party audits, and maintain transparent operations to minimise this risk — but like any platform, it can't be removed entirely. Volatility risk. LPT, the native token on the Livepeer network, isn't a stablecoin — its value can move up or down with market conditions. Price swings of around 5–10% can happen during active periods. So while your staking rewards might grow steadily, short-term market changes can still affect the total value of your holdings. For example, you might stake $1,000 and earn consistent rewards for months, but if the market dips slightly, your total value could fluctuate to around $900–$950. Over time, as the network grows and adoption increases, tokens that power real utility often stabilise or appreciate — though this isn't guaranteed. Many long-term stakers focus on accumulating more tokens rather than watching daily price changes. Orchestrator actions. Remember, your rewards come from orchestrators who are independent operators. They can change their settings in ways that affect your earnings. Each orchestrator sets their own reward cut percentage and fee cut percentage. The reward cut is how much of the rewards they keep, and the fee cut is how much of the fees they keep from the work they do. An orchestrator might start with a 5% reward cut to attract stakers, then later raise it to 15%. This directly reduces your rewards. They might also become less active in calling rewards, which means you earn less frequently. Or their technical infrastructure might degrade, causing them to earn fewer fees overall, which means smaller reward pools for everyone. We actively monitor orchestrator performance and can recommend switching if we see problems, but there's always some lag time. Your earnings for that period are still affected. We try to diversify across multiple orchestrators to reduce this risk, but it can't be eliminated entirely. Governance and smart contract risk. Livepeer is governed by token holders who vote on network changes through smart contracts. A majority of token holders could vote to change how rewards work. They might decide to reduce reward rates, change how often rewards are distributed, or modify other parameters that affect your earnings. Smart contracts are also not perfect. They're computer code, and computer code can have bugs. While smart contracts are audited before deployment, bugs can still exist. In extreme cases, a bug could freeze funds or cause them to be lost permanently. The Livepeer protocol has been running for years without major issues, but the risk always exists. These are the four main risks you're taking when you stake through Lisar. We work hard to manage and minimise these risks where possible, but they can't be eliminated entirely. The key is understanding them so you can make informed decisions when staking.",
      category: "academy",
    },
    {
      id: "8",
      title: "Conclusion and community links",
      subtitle: "Next steps and joining the Lisar community",
      image: "/placeholder-image.jpg",
      videoUrl:
        "https://drive.google.com/file/d/1V9L49R6_2SjluIFFNEjwtGDeymCn70PL/view?usp=sharing",
      brief:
        "Wrap up your learning journey and discover how to connect with the Lisar community for ongoing support.",
      fullContent:
        "Congratulations! You've completed the Lisar Academy Course. Let's wrap up everything you've learned and talk about your next steps. You've learnt about the fundamentals of cryptocurrency and blockchain technology. You know how Lisar works and why we built it the way we did. You understand the mechanics of staking, where yields come from, and most importantly, you understand the risks involved and how we try to manage them. You also know why Livepeer is different from other crypto projects. It's solving real problems in video streaming with actual revenue flowing through the network, not just speculation. If you have questions, we've got several ways to get help. Our Discord community is the most active place. You can chat with other Lisar users in real time, get direct access to our support team, and we do weekly sessions where you can ask the founders anything. If you prefer Telegram, we post daily updates there and it's good for quick questions. On Twitter we share product updates and educational content. Our YouTube channel has more detailed content like this course, and our blog covers platform updates and new features. That's it for the course. Now you have all this knowledge, you can dive right into Lisar confidently. See you around friend!",
      category: "academy",
    },
  ];

  const handleContentClick = (contentId: string) => {
    navigate(`/learn-detail/${contentId}`);
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const handleCategoryChange = (category: "mandatory" | "academy") => {
    setSelectedCategory(category);
  };

  const filteredContent = learnContent.filter(content => content.category === selectedCategory);

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Content List - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-28 scrollbar-hide">
        {/* Header - Now scrollable */}
        <div className="flex items-center justify-between py-8">
          <h1 className="text-lg font-medium text-white">Lisar Academy</h1>
        </div>


        {/* Video Content */}
        <div className="space-y-4">
          {filteredContent.map((content) => (
            <div
              key={content.id}
              onClick={() => handleContentClick(content.id)}
              className="bg-[#1a1a1a] rounded-xl overflow-hidden cursor-pointer hover:bg-[#2a2a2a] transition-colors"
            >
              {/* Video Thumbnail */}
              <div className="w-full h-44 bg-gray-600 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="w-16 h-16 bg-[#C7EF6B] rounded-full flex items-center justify-center">
                    <Play size={20} color="#000" fill="#000" />
                  </div>
                </div>
                <span className="text-gray-400 text-sm">Video Content</span>
              </div>

              {/* Content Info */}
              <div className="p-4">
                <h3 className="text-white font-medium text-lg mb-2">
                    {content.title}
                  </h3>

                <p className="text-gray-500 text-xs leading-relaxed">
                  {content.brief}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Category Filter */}
      <div className="fixed bottom-24 left-0 right-0 px-6 z-10">
        <div className="flex items-center justify-center space-x-2">
          <div className="bg-[#1a1a1a] rounded-full p-1 border border-[#2a2a2a]">
            <button
              onClick={() => handleCategoryChange("mandatory")}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === "mandatory"
                  ? "bg-[#C7EF6B] text-black"
                  : "text-white hover:text-[#C7EF6B]"
              }`}
            >
              Onboarding
            </button>
            <button
              onClick={() => handleCategoryChange("academy")}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === "academy"
                  ? "bg-[#C7EF6B] text-black"
                  : "text-white hover:text-[#C7EF6B]"
              }`}
            >
              Academy
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/learn" />
    </div>
  );
};
