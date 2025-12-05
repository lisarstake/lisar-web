import { useState } from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import {LisarLines} from "./lisar-lines";

const FAQ = () => {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  // To support bold in answers (for chain names)
  const renderAnswer = (text: string) => {
    // Replace **text** with <strong>
    const boldRegex = /\*\*([^\*]+)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(
        <strong key={match.index} className="font-semibold text-white">
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  };

  const faqData = [
    {
      id: 1,
      question: "What is Lisar?",
      answer:
        "Lisar is a simple platform that lets you earn staking rewards across multiple blockchains using your local currency. You don’t need prior crypto knowledge — Lisar handles everything behind the scenes while you earn.",
    },
    {
      id: 2,
      question: "Where do the rewards come from?",
      answer:
        "Rewards are built into the economics of Proof-of-Stake blockchains. When you stake tokens, you help secure the network, and in return, the protocol pays you inflationary rewards and transaction fees. Lisar gives you access to these yields without the complexity.",
    },
    {
      id: 3,
      question: "Which chains are supported?",
      answer:
        "We’re currently live on Livepeer, with BNB and Solana launching soon. More networks will be added to expand your earning opportunities.",
    },
    {
      id: 4,
      question: "Do I need crypto to get started?",
      answer:
        "No. You can deposit with your local currency, and Lisar handles the conversion into the right staking assets. If you already hold crypto, you can also stake directly.",
    },
    {
      id: 5,
      question: "How safe is Lisar?",
      answer:
        "We follow strict security practices and stake only with trusted validators. While risks like price volatility and governance changes exist, we design Lisar to keep your funds safe and transparent.",
    },
    {
      id: 6,
      question: "Can I withdraw anytime?",
      answer:
        "Yes. Your funds remain yours and are available for withdrawal. Note: each chain has its own unbonding period (eg. 7 days for Livepeer). Once unbonded, you can withdraw fully.",
    },
    {
      id: 7,
      question: "How much can I earn?",
      answer:
        "It depends on the network and how much you stake. For example, Livepeer currently offers up to 68% APY. Other chains like Solana or BNB may offer different reward rates.",
    },
  ];

  const toggleQuestion = (id: number) => {
    setExpandedQuestion(expandedQuestion === id ? null : id);
  };

  return (
    <section className="flex flex-col items-center justify-center mx-auto py-12 px-8 sm:px-0 relative overflow-hidden mb-8">
      {/* Lisar Lines Decorations */}
      <LisarLines position="top-right" />
      <div className="hidden md:block">
         <LisarLines position="bottom-left" />
      </div>
     
      
      <div className="text-center mb-8 sm:mb-10 relative z-10">
        <span className="text-xl text-black font-medium">
          Frequently Asked Questions
        </span>
      </div>
      <div className="w-full space-y-3 sm:space-y-4 sm:px-10 relative z-10 max-w-4xl">
        {faqData.map((faq) => (
          <div
            key={faq.id}
            className="border border-gray-200 rounded-lg bg-white shadow-sm transition-shadow duration-200"
          >
            <Button
              variant="ghost"
              onClick={() => toggleQuestion(faq.id)}
              className={`
                w-full 
                px-4 sm:px-6 
                py-5 sm:py-7
                text-left 
                flex 
                justify-between 
                items-center 
                bg-transparent 
                focus:outline-none 
                focus:ring-0 
                active:bg-transparent 
                rounded-lg
                cursor-pointer
                text-gray-800
              `}
            >
              <span className="font-medium text-gray-800 text-sm sm:text-base pr-4">
                {faq.question}
              </span>
              <Plus
                className={`
                  w-4 h-4 sm:w-5 sm:h-5 
                  transform 
                  transition-transform 
                  duration-200 
                  flex-shrink-0
                  ${expandedQuestion === faq.id ? "rotate-45" : ""}
                `}
                color="#235538"
              />
            </Button>
            <div
              className={`
                overflow-hidden 
                transition-all 
                duration-300 
                ease-in-out 
                ${
                  expandedQuestion === faq.id
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }
              `}
            >
              <div className="px-3 pb-4 sm:pb-6 text-gray-700 text-sm leading-relaxed">
                {renderAnswer(faq.answer)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
