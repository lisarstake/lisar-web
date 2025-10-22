import {LisarLines} from "./lisar-lines";

const NewsSection = () => {
  const newsArticles = [
    {
      id: 1,
      title: "Lisar Launches Multi-Chain Staking Infrastructure",
      description:
        "Revolutionary staking platform enables users to stake across multiple blockchain networks with fiat currencies and earn rewards in crypto tokens.",
      featured: true,
    },
    {
      id: 2,
      title: "68% APY Achieved Through Advanced Delegation",
      description:
        "Lisar's non-custodial delegation system delivers industry-leading returns through automated validator selection and optimization.",
      featured: false,
    },
    {
      id: 3,
      title: "New Settlement Options: LPT and USDC",
      description:
        "Users can now receive staking rewards in Livepeer tokens or USDC, providing flexibility in reward distribution.",
      featured: false,
    },
  ];

  return (
    <section className="w-full md:py-20 py-12 relative overflow-hidden">
      {/* Lisar Lines Decorations */}
      <LisarLines position="top-right" />
      {/* <LisarLines position="bottom-left" /> */}

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* Section Title */}
        <h2 className="font-medium text-black mb-6 text-xl text-center">
          News & Articles
        </h2>

        {/* News Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured Article - Large Card */}
          <div className="lg:row-span-2">
            <article className="bg-gray-800 rounded-2xl p-8 h-full flex flex-col justify-between hover:bg-gray-750 transition-colors cursor-pointer">
              <div>
                <h3 className="text-xl font-medium text-white mb-6 leading-tight">
                  {newsArticles[0].title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {newsArticles[0].description}
                </p>
              </div>
              <div className="mt-8">
                <span className="inline-flex items-center text-[#C7EF6B] font-medium">
                  Read More
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </article>
          </div>

          {/* Secondary Articles - Two Smaller Cards */}
          <div className="space-y-8">
            {newsArticles.slice(1).map((article) => (
              <article
                key={article.id}
                className="bg-gray-800 rounded-2xl p-6 hover:bg-gray-750 transition-colors cursor-pointer"
              >
                <h3 className="text-xl font-medium text-white mb-4 leading-tight">
                  {article.title}
                </h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {article.description}
                </p>
                <span className="inline-flex items-center text-[#C7EF6B] font-medium text-sm">
                  Read More
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
