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
        "Lisar is your DeFi bank. Save your stable coins safely, or stake for higher returns. Think of it like a regular bank, but your money actually grows—and you're in full control.",
    },
    {
      id: 2,
      question: "What's the difference; stables vs high-yield?",
      answer:
        "Stable savings keep your money safe with steady rewards. High-yield staking offers bigger returns but prices can be volatile. Choose what fits your needs.",
    },
    {
      id: 3,
      question: "How do I earn rewards?",
      answer:
        "When you save or stake, your money helps secure blockchain networks. In return, you get paid daily rewards automatically. It's like earning interest, but better—and you see it grow every day.",
    },
    {
      id: 4,
      question: "Do I need crypto to get started?",
      answer:
        "Nope. You can start with your local currency—dollars, euros, whatever you use. We handle the conversion. If you already have crypto, you can use that too. Either way works.",
    },
    {
      id: 5,
      question: "Is my money safe?",
      answer:
        "Yes. We use trusted validators and follow strict security practices. Your funds are always yours, and you can see everything in your account. Like any investment, there are risks, but we're built to keep your money safe.",
    },
    {
      id: 6,
      question: "Can I withdraw my money anytime?",
      answer:
        "Stable savings? Yes, withdraw instantly. High-yield stakes? Usually takes a few days to process. Your money is always yours—we just need a bit of time to unlock staked funds.",
    },
    {
      id: 7,
      question: "How much can I earn?",
      answer:
        "It depends on what you choose. Stable savings offer steady returns around 14.9% APY. High-yield staking can go up to 60% APY or more, depending on the network. The more you put in, the more you earn.",
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
