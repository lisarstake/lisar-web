import { BlogPost, BlogCategory } from "@/types/blog";

export const mockBlogCategories: BlogCategory[] = [
  {
    id: "1",
    name: "Getting Started",
    slug: "getting-started",
    description: "Learn the basics of staking and Lisar",
  },
  {
    id: "2",
    name: "Announcements",
    slug: "announcements",
    description: "Latest news and announcements from Lisar",
  },
  {
    id: "3",
    name: "Community",
    slug: "community",
    description: "Community highlights and stories",
  },
];

export const mockBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Welcome to Lisar: Your Gateway to Simplified Staking",
    slug: "welcome-to-lisar",
    excerpt:
      "Discover how Lisar makes cryptocurrency staking accessible, secure, and rewarding for everyone. Learn about our mission to democratize DeFi.",
    content: `
# Welcome to Lisar: Your Gateway to Simplified Staking

We're thrilled to welcome you to Lisar, a platform designed to make cryptocurrency staking accessible, secure, and rewarding for everyone. Whether you're a seasoned crypto enthusiast or just starting your journey, Lisar provides the tools and support you need to grow your digital assets.

Lisar is a next-generation staking platform that simplifies the complex world of cryptocurrency staking. We aggregate the best validators across multiple blockchain networks, allowing you to stake your assets with confidence and earn competitive rewards.

Our platform is built on the principle that staking shouldn't require a PhD in blockchain technology. Our intuitive interface guides you through every step, from depositing funds to tracking your rewards. You can stake across various blockchain networks including Ethereum, Solana, Base, BNB Chain, and more, all from a single unified dashboard.

We partner with trusted, high-performance validators to ensure your staked assets are secure and generating optimal rewards. Our comprehensive dashboard lets you track your earnings in real-time with complete transparency—no hidden fees, no surprises.

Getting started with Lisar is straightforward. Simply create your account, complete verification, deposit your cryptocurrency, choose from our curated list of top validators, and start earning rewards. The entire process takes just minutes.

Security is at the heart of everything we do at Lisar. We employ bank-level encryption, two-factor authentication, and cold storage for the majority of user funds. Our platform undergoes regular security audits by leading firms to ensure your assets are always protected.

Staking is better together. Join our growing community on Discord, Twitter, and Telegram where you can connect with fellow stakers, get real-time support, and stay updated with the latest news and announcements.

This is just the beginning. We're constantly working on new features and improvements to enhance your staking experience, including advanced analytics, automated staking strategies, and enhanced portfolio management features.

Thank you for choosing Lisar as your staking partner. Together, we're making DeFi accessible to everyone.
    `,
    author: {
      name: "Lisar Team",
      avatar: "/Logo.svg",
      role: "Product Team",
    },
    coverImage: "/lisk1.png",
    category: "Getting Started",
    tags: ["Introduction", "Getting Started", "Staking"],
    publishedAt: "2024-11-15T10:00:00Z",
    readingTime: 3,
    featured: true,
  },
  {
    id: "2",
    title: "Understanding Staking Rewards: How to Maximize Your Earnings",
    slug: "understanding-staking-rewards",
    excerpt:
      "Learn how staking rewards work and discover strategies to maximize your returns while minimizing risk.",
    content: `
# Understanding Staking Rewards: How to Maximize Your Earnings

Staking has become one of the most popular ways to earn passive income in the cryptocurrency space. Staking rewards are the incentives distributed to users who lock up their cryptocurrency to support a blockchain network's operations. Think of it as earning interest on your crypto holdings, similar to a savings account.

Several factors influence your staking rewards. The Annual Percentage Yield (APY) represents the annual return you can expect from staking, and it varies by network. Ethereum typically offers 3-5% APY, Solana ranges from 6-8%, while Cosmos can provide 10-15% APY. The more you stake, the more rewards you earn, though it's important to only stake what you can afford to lock up.

Network conditions also play a crucial role. Higher transaction volumes can increase rewards, and the percentage of the network's total supply that's staked affects individual rewards. Your chosen validator's uptime and effectiveness directly impact your earnings. Many platforms allow you to compound your rewards by automatically re-staking them, leading to exponential growth over time.

To maximize your returns, consider diversifying across multiple blockchain networks. This approach reduces risk while allowing you to take advantage of different APY rates and hedge against any single network's volatility. On Lisar, we curate top validators based on uptime, commission rates, and reputation to help you make informed decisions.

Reinvesting your staking rewards can significantly boost long-term returns through compound interest. For example, staking 1000 tokens at 10% APY without compounding yields 1100 tokens after one year, but with monthly compounding, you'd have 1104.71 tokens. Over longer periods, this difference compounds dramatically.

It's also important to understand lock-up periods. Different networks have different unstaking periods—Ethereum withdrawals take 1-2 days, Solana offers immediate unstaking, while Cosmos requires a 21-day unbonding period. Plan your liquidity needs accordingly and consider keeping some assets liquid.

Avoid common pitfalls like chasing extremely high APY rates blindly, as they often come with higher risks. Always research the network's fundamentals. Don't ignore fees—network transaction fees, validator commission rates, and platform fees can eat into your profits. Lisar displays all fees transparently so you can make informed decisions.

Regularly monitor your validator's performance. A validator with increasing downtime or slashing events can reduce your rewards or even result in losses. Also remember that staking rewards are typically taxable events, so keep records of your earnings for tax purposes.

For experienced stakers, consider liquid staking solutions that give you a derivative token representing your staked assets, allowing you to maintain liquidity while earning rewards. Some networks also offer additional rewards for participating in governance decisions.

Staking rewards compound over time, making patience a valuable strategy. For instance, 10,000 tokens staked at 8% APY grows to 10,800 tokens after one year, 12,597 tokens after three years, and 21,589 tokens after ten years.

Maximizing staking rewards is about finding the right balance between yield, security, and liquidity. By diversifying your portfolio, choosing reliable validators, compounding your rewards, and staying informed about network developments, you can build a robust passive income stream through staking.
    `,
    author: {
      name: "Sarah Chen",
      role: "DeFi Analyst",
    },
    coverImage: "/earn1.jpeg",
    category: "Getting Started",
    tags: ["Rewards", "Strategy", "APY", "Passive Income"],
    publishedAt: "2024-11-20T14:30:00Z",
    readingTime: 5,
    featured: true,
  },
  {
    id: "3",
    title: "Introducing Multi-Chain Portfolio View",
    slug: "multi-chain-portfolio-view",
    excerpt:
      "Manage all your staking positions across different blockchains in one unified dashboard. See how our new portfolio view simplifies multi-chain staking.",
    content: `
# Introducing Multi-Chain Portfolio View

We're excited to announce a game-changing feature for Lisar users: the Multi-Chain Portfolio View. Managing multiple staking positions across different blockchains has never been easier.

As the blockchain ecosystem grows, many users stake across multiple networks to diversify their portfolio. However, this often means juggling multiple wallets and platforms, tracking rewards in different currencies, and missing opportunities due to fragmented information.

The new Portfolio View brings everything together in one place. You can see all your staking positions across Ethereum, Solana, Base, BNB Chain, and more in a single, clean interface. The dashboard provides real-time aggregation of your total portfolio value in USD, combined rewards across all networks, performance tracking over time, and network-by-network breakdowns.

Our smart analytics feature allows you to compare APY across networks, identify your best-performing validators, view reward projections, and analyze historical performance charts. This gives you a bird's-eye view of your entire staking portfolio, including total staked value, total rewards earned, weighted average APY, and overall portfolio performance.

You can drill down into specific networks to see staked amounts per network, individual validator performance, network-specific APY rates, and pending rewards. The performance tracking feature lets you monitor your portfolio's growth with daily, weekly, and monthly views, historical reward charts, ROI calculations, and comparisons against network averages.

The portfolio view also includes smart alerts that keep you informed with customizable notifications for reward milestones, validator performance changes, opportunity alerts for high-performing networks, and important network updates.

Using the Portfolio View is simple. Navigate to the Portfolio page from the main menu, and your dashboard will automatically populate with all your active staking positions. You can choose from different visualization options including grid view for detailed analysis, chart view for performance tracking, and list view for quick scanning.

Click on any network or validator to see detailed metrics including staking timeline, reward history, performance comparisons, and projected earnings. Directly from the portfolio view, you can add more stakes, claim rewards, switch validators, and rebalance your portfolio.

We've also included advanced features like portfolio rebalancing suggestions. Our algorithm analyzes your portfolio and suggests optimal allocations based on your risk tolerance, reward goals, market conditions, and network performance. For tax purposes, you can export detailed staking reports with all rewards earned by date, network-by-network breakdowns, USD values at time of earning, and CSV export for accountants.

The Multi-Chain Portfolio View is now available to all Lisar users. Simply log in to your Lisar account, navigate to Portfolio from the main menu, and explore your unified staking dashboard. We're committed to building features that serve our community, so if you have suggestions for improving the Portfolio View, please share your feedback in our Discord or through the app.
    `,
    author: {
      name: "Michael Torres",
      role: "Product Manager",
    },
    coverImage: "/o10.png",
    category: "Announcements",
    tags: ["Product", "Portfolio", "Features", "Multi-Chain"],
    publishedAt: "2024-11-22T09:00:00Z",
    readingTime: 4,
    featured: true,
  },
  {
    id: "4",
    title: "Ethereum Staking After the Merge: What You Need to Know",
    slug: "ethereum-staking-post-merge",
    excerpt:
      "A comprehensive guide to Ethereum staking in the post-merge era, including opportunities, risks, and best practices.",
    content: `
# Ethereum Staking After the Merge: What You Need to Know

The Ethereum Merge was one of the most significant events in cryptocurrency history. Now that Ethereum has transitioned to Proof of Stake, let's explore what this means for stakers.

The transition from Proof of Work to Proof of Stake has fundamentally changed Ethereum. The network reduced energy consumption by 99.95%, introduced new reward mechanisms for validators, and enhanced overall network security. This has opened up new opportunities for retail stakers with lower barriers to entry, more predictable rewards, liquid staking solutions, and enhanced yield opportunities.

As of November 2024, over 30 million ETH is staked across more than 500,000 validators, with current APY ranging from 3.5% to 5% and an average validator uptime of 99.2%. These metrics demonstrate the maturity and stability of Ethereum staking post-merge.

On Lisar, you can stake your ETH in two ways. Direct staking allows you to stake your ETH directly with top-performing validators with a minimum stake of 0.01 ETH. You can choose from our curated validators, earn competitive rewards, and withdraw anytime. Alternatively, liquid staking gives you stETH tokens representing your staked ETH, allowing you to maintain liquidity, use stETH in DeFi, earn staking rewards, and avoid lock-up periods.

To maximize your ETH staking returns, choose validators based on their performance track record, commission rates (typically 5-15%), and community reputation. Consider network congestion when timing your stakes to minimize gas fees, and use a dollar-cost averaging approach to reduce timing risk. Mitigate risks by diversifying across multiple validators, starting with smaller amounts, regularly monitoring validator performance, and keeping some ETH liquid.

ETH staking rewards come from two main sources: consensus layer rewards providing base staking rewards around 4% APY, and execution layer rewards from transaction fees and MEV. The combined APY typically ranges from 3.5% to 5%. Factors affecting your rewards include the total ETH staked (more staking means lower individual yields), validator performance in terms of uptime and attestation accuracy, network activity levels, and potential penalties from slashing for validator misbehavior.

Rewards begin accruing within 1-2 days after your stake is activated. While you can unstake anytime, withdrawals may take 1-2 days to process depending on the queue. The main risks include slashing (rare but validators can be penalized for misbehavior), smart contract risk (mitigated by using audited platforms like Lisar), and market risk from ETH price volatility.

For advanced strategies, some validators offer MEV-boost which can potentially increase rewards by 0.5-1% APY. Restaking protocols that allow you to restake your staked ETH for additional yield are coming soon to Lisar. For tax efficiency, track all rewards for tax reporting, consider tax-loss harvesting, and consult with crypto-savvy tax professionals.

Looking ahead, Ethereum staking is expected to remain attractive due to the growing DeFi ecosystem, increasing network adoption, ongoing protocol improvements, and growing institutional interest. Upcoming changes include Verkle Trees to reduce validator requirements, Single Secret Leader Election for enhanced security, and increased blob space for more throughput and potentially higher rewards.

Ethereum staking post-merge represents one of the most compelling opportunities in crypto, offering sustainable rewards, network participation, enhanced security, and a growing ecosystem. With Lisar, staking ETH is simple, secure, and rewarding.
    `,
    author: {
      name: "Dr. Emma Wilson",
      role: "Blockchain Researcher",
    },
    coverImage: "/lisk2.png",
    category: "Getting Started",
    tags: ["Ethereum", "ETH", "Proof of Stake", "Merge"],
    publishedAt: "2024-11-18T11:15:00Z",
    readingTime: 6,
  },
  {
    id: "5",
    title: "November Market Insights: Staking Trends and Analysis",
    slug: "november-market-insights-2024",
    excerpt:
      "Our monthly analysis of staking trends, APY movements, and opportunities across major blockchain networks.",
    content: `
# November Market Insights: Staking Trends and Analysis

Welcome to our monthly market insights report. This November, we've seen interesting developments across the staking landscape with over $150 billion staked across all networks, average APY at 6.5% (up 0.3% from October), and more than 250,000 new stakers joining major networks.

Ethereum staking continues to grow steadily post-merge, with 30.5 million ETH staked worth approximately $52 billion. The recent increase in network activity has boosted execution layer rewards, and we're seeing liquid staking solutions gain significant traction. MEV-boost adoption is increasing validator rewards, and restaking protocols are emerging as a new trend.

Solana has recovered strongly from past challenges, with 390 million SOL staked worth $28 billion. Network stability and growing DeFi activity are driving renewed interest. The platform is seeing mobile integration expand, new DeFi protocols launching, and improved validator infrastructure.

Cosmos continues its expansion with 210 million ATOM staked worth $1.8 billion. The ecosystem is seeing new app-chains launch regularly, with interchain security creating new staking opportunities. The network offers high APY at 14.5% compared to other major networks, and the ecosystem of connected chains continues growing.

BNB Chain maintains strong performance with 38 million BNB staked worth $9.5 billion. The network has a consistent validator set and growing DeFi ecosystem, with expanding GameFi integration, new liquidity mining programs, and cross-chain bridge development.

Liquid staking has become a dominant trend, now representing 40% of all staking on major networks. Lido holds 29% of staked ETH, Rocket Pool has 3.5%, and other platforms make up 7.5%. This trend is providing stakers with increased flexibility, better capital efficiency, and new DeFi opportunities.

Institutional adoption has grown 45% year-over-year, with major funds entering the space, custodial solutions expanding, and regulatory clarity improving in some jurisdictions. We're also seeing real-world asset integration where staking rewards are being used as collateral in lending protocols, yield sources for RWA tokens, and treasury management.

Restaking innovation is creating new possibilities, allowing users to restake their already-staked assets for additional yield layers and enhanced network security. This represents a significant evolution in the staking ecosystem.

When considering risk-adjusted returns, Ethereum offers the best risk-adjusted returns for conservative stakers, Solana provides a good balance of risk and reward, while Cosmos offers higher risk but excellent yields. For portfolio recommendations, a conservative approach might allocate 60% to Ethereum, 30% to Solana, and 10% to BNB Chain, expecting 4.5-5.5% APY. A balanced portfolio could allocate 40% Ethereum, 30% Solana, 20% Cosmos, and 10% BNB Chain for 7-8.5% APY.

November has been a strong month for staking across the board. Key takeaways include increasing institutional adoption, growing liquid staking solutions, stable to improving APY rates, and expanding ecosystem opportunities. The staking landscape continues to mature, offering more sophisticated tools and opportunities for both retail and institutional participants.
    `,
    author: {
      name: "Robert Martinez",
      role: "Market Analyst",
    },
    coverImage: "/earn2.jpeg",
    category: "Announcements",
    tags: ["Market Analysis", "Trends", "APY", "Research"],
    publishedAt: "2024-11-29T08:00:00Z",
    readingTime: 5,
  },
  {
    id: "6",
    title: "Community Spotlight: Meet Top Staker of the Month",
    slug: "community-spotlight-november",
    excerpt:
      "This month we sit down with Lisa, who turned $1,000 into $50,000 through strategic staking. Learn her secrets and strategies.",
    content: `
# Community Spotlight: Meet Top Staker of the Month

Every month, we highlight members of the Lisar community who are making waves with their staking strategies. This November, meet Lisa Chen, a 32-year-old software engineer from San Francisco who transformed $1,000 into over $50,000 in just 18 months through strategic staking.

Lisa started her crypto journey in 2022 with minimal knowledge but a commitment to learning. Today, she manages a six-figure staking portfolio and mentors newcomers in our Discord community. "I was terrified at first," Lisa admits. "I spent three weeks just reading and learning before I made my first stake. The Lisar platform made it feel safer because everything was explained clearly."

Her journey began in May 2023 with a conservative approach, staking just 0.5 ETH on Ethereum. After gaining confidence, she expanded her holdings, splitting them 70/30 between ETH and SOL and began reinvesting rewards monthly. By month three, she had achieved a 12% return.

By month six, Lisa discovered the power of diversification, expanding to four networks (ETH, SOL, ATOM, AVAX), implementing automated compounding, and following validator performance closely. Her portfolio value reached $2,800, representing a 180% gain.

"This is when things got interesting," Lisa says of month twelve. She began using liquid staking to maintain flexibility, using staked assets as DeFi collateral, taking advantage of network-specific opportunities, and following market trends for rebalancing. Her portfolio value grew to $18,500, a 1,750% gain.

Today, Lisa's portfolio includes seven different networks, fifteen validator relationships, automated compounding and rebalancing, and active community participation. Her portfolio value stands at $52,300, representing a 5,130% gain from her initial $1,000 investment.

Lisa's success comes from five key strategies. First, she started small and learned fast, beginning with just $1,000 and gradually increasing stakes as confidence grew. Second, she diversified intelligently, allocating 35% to Ethereum for stability, 25% to Solana for growth, 20% to Cosmos for high yield, 15% to emerging networks for calculated risk, and 5% as cash reserve for opportunities.

Third, she compounds religiously. "The difference between compounding and not compounding is staggering over time," she explains. Without compounding, her $1,000 would have grown to $15,000, but with compounding, it reached $52,300. Fourth, she follows the community closely, crediting the Lisar Discord as her "crypto MBA" where she learned more than from any course.

Fifth, she stays disciplined during volatility. "There were times when my portfolio was down 40%," she recalls. "I stuck to my strategy and it paid off." Her mental framework focuses on total tokens rather than USD value, trusts in quality validators, maintains regular review without daily checking, and keeps a long-term perspective.

Lisa's daily routine is surprisingly simple. She spends 15 minutes in the morning checking her dashboard and reviewing overnight rewards, 5 minutes in the afternoon for a quick market check, 20 minutes in the evening for deep dives and community engagement, and one hour weekly for detailed portfolio review and rebalancing.

She faced several challenges along the way. Information overload was solved by finding trusted sources. Emotional decisions during market drops were managed by writing down her strategy and committing to it. Technical complexity was overcome by building a personal glossary and asking questions. Time management was improved by setting specific times for checking and automating processes.

Lisa's current goals include growing her portfolio to $100,000 in six months, exploring restaking protocols, helping ten newcomers get started, and creating educational content. Long-term, she aims for a $500,000 portfolio, living partially off staking income, launching a staking education platform, and building a community of strategic stakers.

For beginners, Lisa recommends spending the first week on education without investing, then starting small with $100-500 on one well-established network. By month two, expand gradually by adding a second network and comparing validators. By month three, develop your own strategy based on risk tolerance and clear goals.

Lisa credits much of her success to the Lisar community. "Being surrounded by people on the same journey keeps you motivated and informed," she says. "Some of my best strategies came from casual Discord conversations." She now gives back by answering 10+ questions weekly, sharing monthly portfolio updates, hosting newbie Q&A sessions, and creating educational resources.

Her ROI breakdown shows that 35% of growth came from staking rewards, 40% from market appreciation, 15% from compound interest, and 10% from strategic rebalancing. This demonstrates the power of combining multiple strategies rather than relying on a single approach.

Lisa's story shows what's possible with commitment to learning, strategic thinking, discipline, community engagement, and a long-term perspective. Her journey from $1,000 to $52,300 in 18 months proves that with the right approach and platform, anyone can achieve significant returns through staking.
    `,
    author: {
      name: "Jennifer Lopez",
      role: "Community Manager",
    },
    coverImage: "/lisk.png",
    category: "Community",
    tags: ["Community", "Success Story", "Strategy", "Interview"],
    publishedAt: "2024-11-28T10:00:00Z",
    readingTime: 8,
  },
];

//get posts by category
export const getPostsByCategory = (category: string): BlogPost[] => {
  return mockBlogPosts.filter(
    (post) => post.category.toLowerCase() === category.toLowerCase()
  );
};

//get featured posts
export const getFeaturedPosts = (): BlogPost[] => {
  return mockBlogPosts.filter((post) => post.featured);
};

// search posts
export const searchPosts = (query: string): BlogPost[] => {
  const lowerQuery = query.toLowerCase();
  return mockBlogPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.excerpt.toLowerCase().includes(lowerQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
};
