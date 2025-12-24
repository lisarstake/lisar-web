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
        "A platform that lets you Earn, save, and spend globally with crypto.",
    },
    
    {
      id: 3,
      question: "How do I earn rewards?",
      answer:
        "When you vest, your money earns daily rewards automatically. Interest starts accruing once your funds are vested.",
    },
    {
      id: 4,
      question: "Do I need crypto to get started?",
      answer:
        "No. You can deposit your local currency from your bank to your Lisar wallet.",
    },
    {
      id: 5,
      question: "Is my money safe?",
      answer:
        "Yes. Your funds are always yours and fully self-custodial.",
    },
    {
      id: 6,
      question: "Can I withdraw my money anytime?",
      answer:
        "Yes, you can withdraw your money from your Lisar wallet to your bank account at anytime.",
    },
    {
      id: 7,
      question: "How much can I earn?",
      answer:
        "Stables vest up to 15% APY. High-yield vest much higher. Returns depend on your chosen vault.",
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
                  shrink-0
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
