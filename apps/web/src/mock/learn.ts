export interface LearnContent {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  videoUrl: string;
  brief: string;
  fullContent: string;
  s_factor: number;
  duration: number;
  category: "mandatory" | "academy";
}

export const mockLearnContent: LearnContent[] = [
  {
    id: "1",
    slug: "what-is-lisar",
    title: "What is Lisar?",
    subtitle: "Introduction to Lisar and how it works",
    videoUrl: "https://vimeo.com/1131302750?share=copy&fl=sv&fe=ci",
    brief:
      "Learn what Lisar is and how it helps you earn extra income securing blockchain networks with zero crypto knowledge required.",
    fullContent:
      "Hello, my name is Jude and it's nice to have you try out Lisar! So let's quickly get you up to speed so you can navigate easily. Lisar lets anyone earn extra income by securing blockchain networks. Your earnings depend on your stake, it could be a few dollars or thousands. Now why does this matter? Earning can feel unpredictable at times. Some days it's great, other times it slows down. Lisar helps balance that out by giving you a steady source of income in the background. Think of it as setting up a smart salary for yourself that runs 24/7. Now what makes Lisar special? With Lisar you get all the benefits of crypto staking using your local currency with zero crypto knowledge required. No gas fees, no complex tokens, no confusing steps. Lisar handles everything behind the scenes while you earn massive rewards on your stakes, rewards up to 68% APY. Your stake helps secure the blockchain, promoting decentralisation, and you get rewarded. Getting started is simple: Deposit fiat or crypto, pick a validator, stake, and start earning automatically. And your funds are always available to withdraw whenever you want to. Welcome to Lisar where money truly works for you.",
    s_factor: 1.05,
    duration: 69,
    category: "mandatory",
  },
  {
    id: "2",
    slug: "where-do-rewards-come-from",
    title: "Where do the rewards come from?",
    subtitle: "Understanding the legitimacy of staking rewards",
    videoUrl: "https://vimeo.com/1131306496?fl=ip&fe=ec",
    brief:
      "Discover how blockchain rewards work and why staking is a legitimate way to earn income through network security.",
    fullContent:
      "I know you're probably asking yourself, where do these rewards come from? Is this legitimate and how does it actually work? These are smart questions, and I'm glad you're asking them. Now let's dive right in. Blockchains typically come in two major variants. Proof of Work and Proof of Stake. In POW new transactions are validated by doing energy intensive tasks essentially solving complex cryptographic puzzles. This has a major downside because it is energy intensive and most time inefficient. POS systems on the other hand validate transactions by having token holders lock up their tokens otherwise known as staking. This helps secure the network and protect it from malicious actors who might seek to corrupt the system and incentivize validators to do honest work. The greater the staked tokens, the more secure the network becomes. Now here's where it gets interesting. To incentivize token holders to stake their tokens and secure the network, POS chains pay out inflationary rewards to these stakers as compensation for their service. The rewards varies significantly from chain to chain. Some offer 6.7% APY, while others provide as high as 78% APY. Picture it like how traditional financial systems work. Think of your bank, You save your money with them, they lend it out to generate profits, and give you a small cut as interest afterwards. Similarly, when you stake through Lisar, your tokens are helping operate and secure the Livepeer network, and in returns you're getting rewarded for that contribution. These rewards come directly from the protocol itself. It's built into the blockchain's economics, making it a legitimate and sustainable income source.",
    s_factor: 1,
    duration: 86,
    category: "mandatory",
  },
  {
    id: "3",
    slug: "risks-of-using-lisar",
    title: "What are the risks of using Lisar?",
    subtitle: "Transparent discussion about potential risks",
    videoUrl: "https://vimeo.com/1131320308?fl=ip&fe=ec",
    brief:
      "Learn about the risks involved with staking and how Lisar works to manage and minimize them for your safety.",
    fullContent:
      "In the last video, we covered where rewards come from and we answered the question of legitimacy. But let's be completely honest here. No financial system is completely risk free, and that includes Lisar. In this video, we'll be covering the possible risks involved and, more importantly, how we work to manage those risks. Counterparty risk. By using Lisar, you're trusting us to operate efficiently, ensuring your funds are secured and always available when you need them. This is the same type of risk you take while using any financial platform including your bank, investment app, even PayPal. We take this responsibility very seriously and have implemented various security measures and audits to maintain your trust. Volatility risk. LPT the native token on the Livepeer network is not a stablecoin, meaning its value can fluctuate anytime, going higher sometimes dropping lower other times. In a worst case scenario, it's value might drop significantly, potentially affecting your principal capital and the rewards you've earned. However, historically, productive staking assets tend to appreciate over time as the networks they secure grow in value. Orchestrator actions. The rewards you earn on your stake are determined by several factors, including orchestrator reward cuts, fee percentages, and how often they call rewards. Orchestrators operate independently of Lisar and can choose to modify their parameters, which might affect your final earned rewards. We actively monitor orchestrator performance and can recommend switches where necessary. Governance and smart contract risk. Governance on Livepeer network happens through self executing smart contracts, with token holders voting on network proposals. A majority vote could potentially change the current reward structure. Additionally, no smart contract is 100% immune to bugs or exploits, and in the rare case of a critical vulnerability, funds might be at risk. We're incredibly serious about user safety and confidence, which is why we believe in complete transparency about every possible risk involved. Knowledge is power, and we want you to make informed decisions concerning your financial future.",
    s_factor: 1.03,
    duration: 128,
    category: "mandatory",
  },
  {
    id: "4",
    slug: "crypto-for-beginners",
    title: "Crypto for beginners",
    subtitle: "Understanding cryptocurrency fundamentals",

    videoUrl: "https://vimeo.com/1131330938?fl=ip&fe=ec",

    brief:
      "Start from the basics and learn what cryptocurrency is, how blockchains work, and why this matters.",
    fullContent:
      "Hi there! My name is lucy and welcome to Lisar, if you're new to cryptocurrency, don't worry. We're going to start from the very beginning and build understanding step by step. To start with, What exactly is cryptocurrency? Cryptocurrency is a digital money that exists only online, but unlike your online bank account, it's not controlled by any single entity like a bank or government. Rather, it runs on something called the blockchain. You can imagine like a digital ledger that's copied across thousands of computers worldwide, making it virtually impossible to hack or manipulate. Now let's get into some key concepts you should know. Number One coins versus tokens. Coins like Bitcoin or Ethereum have their own blockchain, while tokens like LPT and others are built on top of existing blockchains. 2. Wallets, and no, we are not talking of physical wallets like this but rather digital applications that store your crypto. You have a public address which is like your email address or bank account that you can send to others to recieve funds and your private key which is like your password. The golden rule however is never to share your private key with anyone. 3. Blockchain networks. Different cryptocurrencies run on different networks. Ethereum is like a massive computer that can run applications, while Bitcoin is seen more like digital gold. In conclusion the blockchain is trustless and could itself enforces the rules. This means your rewards are guaranteed by mathematics and code, not corporate promises. Now you don't need to feel overwhelmed if this seems complex. Lisar handles all the technical aspects so you can focus on earning. Lisar convert complex blockchain operations into simple, familiar financial transactions.",
    s_factor: 0.85,
    duration: 90,
    category: "academy",
  },
  {
    id: "5",
    slug: "what-is-lisar-in-depth",
    title: "What is Lisar? (In-depth)",
    subtitle: "Deep dive into Lisar's mission and technology",
    videoUrl: "https://vimeo.com/1131343545?share=copy&fl=sv&fe=ci",
    brief:
      "Explore how Lisar makes crypto staking accessible and learn about the Livepeer network that powers your earnings.",
    fullContent:
      "Now that you know crypto basics, let's dive a bit deeper into what Lisar actually is and how we make crypto staking accessible to you and I. Lisar enables anyone to earn recurring income by securing the Livepeer network. The income ranges from small amounts to thousands of dollars, depending on how much you stake. Here's the thing about traditional investing. Most high yield opportunities are locked away for wealthy investors or institutions. Regular people get stuck with savings accounts that barely beat inflation. Meanwhile, crypto offers incredible earning opportunities but you need technical knowledge that frankly, most people don't want to deal with. That's exactly why we built Lisar. We handle all the complex crypto stuff so you can focus on earning. You don't need to understand blockchain technology, wallets or deal with gas fees. You just deposit your money and start earning. Here's how we make it simple. You can deposit regular money, dollars or euros, whatever you're comfortable with. We handle converting it to the right tokens behind the scenes. Instead of you having to research which validators are good or bad, we've already done that work. We pick the reliable, high performing ones to reduce risk. The interface looks and feels like any modern app you're used to. No confusing crypto exchange interfaces or complicated terminology. Now let's talk about Livepeer itself because this matters for your returns. Unlike many crypto projects that are purely speculative, Livepeer solves a real problem in a multi billion dollar industry (video streaming). Think about how much video content gets streamed every day. All those videos need processing power to encode and deliver to viewers. Right now, this is dominated by big centralised companies with expensive infrastructure. Livepeer creates a decentralised network where people can contribute their computing power for video processing and get paid for it. It's already processing real video content with real revenue flowing through the network and as more video platforms adopt decentralised streaming, demand for LPT tokens increases, potentially driving both staking rewards and token appreciation. When you stake through Lisar, your tokens help secure this network. The more tokens staked, the more secure and reliable the network becomes. In return, you get rewarded from the fees that video platforms pay to use the network plus inflationary tokens. Your stake principal stays available for withdrawal anytime with a short un-bonding period (7 days) compared to other chains usually around 20-30 days. When you stake through Lisar, you're not just earning returns, you're contributing to a mission. A mission to make video more accessible and affordable globally.",
    s_factor: 1,
    duration: 155,
    category: "academy",
  },
  {
    id: "6",
    slug: "intro-to-staking-and-yields",
    title: "Intro to staking and yields",
    subtitle: "Understanding how staking generates returns",
    videoUrl: "https://vimeo.com/1131333997?fl=ip&fe=ec",
    brief:
      "Learn the mechanics of staking, how yields work, and why staking is a powerful way to generate consistent returns.",
    fullContent:
      "Let's demystify staking and how it helps you earn consistent yields. This is where the magic happens What exactly is staking? is like putting your money to work, but instead of a bank using your money to make loans, your tokens helps secure and operate a blockchain network and in return you earn rewards, simple. Now there are different types of crypto yields. You have the staking rewards. Which is what Lisar focuses on. You have lending yields, liquidity mining and yield farming but staking is the most direct and reliable. So why do this rewards exist. Blockchains need security to function properly. Instead of hiring security companies, they rewards token holders to do that. The more people who stake, the more secure the network becomes. APY means annual percentage yield,  if you stake $1000 at 68% APY, you could earn $680 in rewards over a year, though it can fluctuate based on network activity, and here's the magic. Compounding, as your rewards grow they earn even more rewards automatically. That's exactly how staking multiples over time. With Lisar it's fully passive. We handle validator selection and management while you earn, on Livepeer rewards are roughly distributed every 20 to 24 hours. The amount depends on orchestrator's performance and network growth. Bottomline staking turns idle tokens into productive capital helping secure decentralised networks while you earn, through Lisar you're not just investing, you're owing a part of the future.",
    s_factor: 1.1,
    duration: 90,
    category: "academy",
  },
  {
    id: "7",
    slug: "risks-associated-with-staking",
    title: "Risks associated with staking",
    subtitle: "Comprehensive risk analysis for informed decisions",
    videoUrl: "https://vimeo.com/1131317928?fl=ip&fe=ec",
    brief:
      "Deep dive into the four main risks of staking: counterparty, volatility, orchestrator actions, and governance risks.",
    fullContent:
      "Let's talk about the real risks of staking and this is not to scare you but to make you smarter about your decisions. First counterparty risk. You're trusting us Lisar to run smoothly. we are non-custodial, meaning you always control your funds, but our systems will have to perform securely. We use strict audits, and transparent practises to keep the risk as low as possible — though it cannot be zero. Second volatility risk. LPT is not a stablecoin so it price moves with the market sometimes 5–10% swings. You might stake $1,000, earn rewards, but still see your balance drop during dips. Long term holders focus on accumulating tokens not chasing short term prices. Third orchestrator risk. Your rewards come from independent operators if they raise their fees, slow down or go inactive your earnings will drop. We monitor them and diversify to reduce this but it's never fully gone. Finally governance and smart contract risk. The Livepeer network runs on codes & community votes, rules can change, bugs can happen it's rare but it's possible. At Lisar we cannot remove these risk but we manage them transparently so you can stake with confidence.",
    s_factor: 1.02,
    duration: 78,
    category: "academy",
  },
  {
    id: "8",
    slug: "conclusion-and-community-links",
    title: "Conclusion and community links",
    subtitle: "Next steps and joining the Lisar community",
    videoUrl: "https://vimeo.com/1131329056?fl=ip&fe=ec",
    brief:
      "Wrap up your learning journey and discover how to connect with the Lisar community for ongoing support.",
    fullContent:
      "Congratulations! You've completed the Lisar Academy Course well done. Now let's wrap up everything you've learned and talk about your next steps. You've learnt about cryptocurrency and blockchain technology. You've learnt how Lisar works and why we built it the way we did. You've understood the mechanics behind staking, where yields come from, and most importantly, the risks involved and how we manage them. You also know why Livepeer is different from other crypto projects. It's solving real problem in video streaming with actual revenue flowing through the network, not just speculations. If you have questions, we've got several ways to get help. Our Discord community is the most active place where you can chat with other Lisar users, support team, and also have a chat with our founders. We post updates on Telegram and also share product and educational content on X. Our YouTube channel has more detailed content like this course, and our blog covers platform updates and new features. Now you have this knowledge and you can dive right into Lisar confidently. See you around friend!",
    s_factor: 1.02,
    duration: 63,
    category: "academy",
  },
];
