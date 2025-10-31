import React, { useState } from "react";
import { ChevronDown, ArrowUpRight } from "lucide-react";

interface Transaction {
  id: string;
  account: string;
  event: string;
  description: string;
  date: string;
  transaction: string;
}

interface MetricCard {
  title: string;
  value: string;
  currency?: string;
}

export const PublicDashboard: React.FC = () => {
  const [sortBy, setSortBy] = useState<"date" | "account" | "event">("date");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  const metrics: MetricCard[] = [
    {
      title: "Total Fiat Converted",
      value: "1,000,000",
      currency: "₦",
    },
    {
      title: "Total Stakers",
      value: "500",
    },
    {
      title: "Total Staked",
      value: "1,000,000",
      currency: "₦",
    },
    {
      title: "Total Orchestrators",
      value: "20",
    },
  ];

  const transactions: Transaction[] = [
    {
      id: "1",
      account: "ad-astra-video.eth",
      event: "Winning ticket redeemed",
      description: "Received a winning ticket for 0.001 ETH",
      date: "2 hours ago",
      transaction: "0x3f0b...fdec",
    },
    {
      id: "2",
      account: "ad-astra-video.eth",
      event: "Winning ticket redeemed",
      description: "Received a winning ticket for 0.001 ETH",
      date: "2 hours ago",
      transaction: "0x3f0b...fdec",
    },
    {
      id: "3",
      account: "ad-astra-video.eth",
      event: "Winning ticket redeemed",
      description: "Received a winning ticket for 0.001 ETH",
      date: "2 hours ago",
      transaction: "0x3f0b...fdec",
    },
    {
      id: "4",
      account: "ad-astra-video.eth",
      event: "Winning ticket redeemed",
      description: "Received a winning ticket for 0.001 ETH",
      date: "2 hours ago",
      transaction: "0x3f0b...fdec",
    },
    {
      id: "5",
      account: "ad-astra-video.eth",
      event: "Winning ticket redeemed",
      description: "Received a winning ticket for 0.001 ETH",
      date: "2 hours ago",
      transaction: "0x3f0b...fdec",
    },
  ];

  const handleSort = (column: "date" | "account" | "event") => {
    setSortBy(column);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="bg-[#050505] border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#C7EF6B] rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">L</span>
              </div>
              <span className="text-white text-2xl font-bold">LISAR</span>
            </div>

            {/* Launch App Button */}
            <button className="bg-[#C7EF6B] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#B8E55A] transition-colors">
              Launch app
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Overview Section */}
        <section className="mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Overview</h1>
          <p className="text-gray-400 text-lg mb-8 max-w-3xl">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation.
          </p>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]"
              >
                <h3 className="text-gray-400 text-sm font-medium mb-2">
                  {metric.title}
                </h3>
                <div className="flex items-baseline">
                  {metric.currency && (
                    <span className="text-[#C7EF6B] text-2xl font-bold mr-1">
                      {metric.currency}
                    </span>
                  )}
                  <span className="text-[#C7EF6B] text-3xl font-bold">
                    {metric.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Transactions Section */}
        <section>
          <h2 className="text-4xl font-bold text-white mb-8">Transactions</h2>

          {/* Table */}
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
            {/* Table Header */}
            <div className="bg-[#2a2a2a] px-6 py-4">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
                <div className="col-span-3">ACCOUNT</div>
                <div className="col-span-2">EVENT</div>
                <div className="col-span-4">DESCRIPTION</div>
                <div
                  className="col-span-2 flex items-center cursor-pointer"
                  onClick={() => handleSort("date")}
                >
                  DATE
                  <ChevronDown size={16} className="ml-1" />
                </div>
                <div className="col-span-1">TRANSACTION</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-[#2a2a2a]">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="px-6 py-4 hover:bg-[#2a2a2a]/50 transition-colors"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Account */}
                    <div className="col-span-3">
                      <span className="bg-[#C7EF6B] text-black px-3 py-1 rounded-full text-sm font-medium">
                        {transaction.account}
                      </span>
                    </div>

                    {/* Event */}
                    <div className="col-span-2 text-white text-sm">
                      {transaction.event}
                    </div>

                    {/* Description */}
                    <div className="col-span-4 text-white text-sm">
                      {transaction.description
                        .split(" ")
                        .map((word, index, array) => {
                          if (word.includes("ETH") || word.includes("0.001")) {
                            return (
                              <span
                                key={index}
                                className="text-[#C7EF6B] font-medium"
                              >
                                {word}
                                {index < array.length - 1 ? " " : ""}
                              </span>
                            );
                          }
                          return word + (index < array.length - 1 ? " " : "");
                        })}
                    </div>

                    {/* Date */}
                    <div className="col-span-2 text-white text-sm">
                      {transaction.date}
                    </div>

                    {/* Transaction */}
                    <div className="col-span-1 flex items-center">
                      <span className="bg-[#C7EF6B] text-black px-2 py-1 rounded-full text-xs font-medium mr-2">
                        {transaction.transaction}
                      </span>
                      <ArrowUpRight size={14} className="text-[#C7EF6B]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="text-white hover:text-[#C7EF6B] disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                ←
              </button>
              <span className="text-white">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="text-white hover:text-[#C7EF6B] disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
