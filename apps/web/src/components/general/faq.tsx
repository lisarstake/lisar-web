import { useState } from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { LisarLines } from "./lisar-lines";

const FAQ = () => {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  type TextPart = { start: number; end: number; text: string } & (
    | { type: "bold" }
    | { type: "link"; url: string }
  );

  const renderAnswer = (text: string) => {
    const boldRegex = /\*\*([^\*]+)\*\*/g;
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    const parts: TextPart[] = [];

    let match;
    while ((match = boldRegex.exec(text)) !== null) {
      parts.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[1],
        type: "bold",
      });
    }

    while ((match = linkRegex.exec(text)) !== null) {
      parts.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[1],
        url: match[2],
        type: "link",
      });
    }

    parts.sort((a, b) => a.start - b.start);

    const result: React.ReactNode[] = [];
    let pos = 0;

    for (const part of parts) {
      if (part.start > pos) {
        result.push(text.slice(pos, part.start));
      }

      if (part.type === "link") {
        result.push(
          <a
            key={part.start}
            href={part.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            {part.text}
          </a>,
        );
      } else {
        result.push(
          <strong key={part.start} className="font-semibold text-white">
            {part.text}
          </strong>,
        );
      }

      pos = part.end;
    }

    if (pos < text.length) {
      result.push(text.slice(pos));
    }

    return result.length > 0 ? result : text;
  };

  const faqData = [
    {
      id: 1,
      question: "What is Lisar?",
      answer:
        "Lisar is a platform that helps you earn on idle crypto assets without giving up control of your funds. Deposit supported tokens, earn automatically, and withdraw whenever you need.",
    },

    {
      id: 3,
      question: "How do I earn rewards?",
      answer:
        "Your assets are put to work across established staking and yield networks. Rewards accumulate automatically while your funds remain in your account.",
    },
    {
      id: 4,
      question: "Do I need crypto to get started?",
      answer:
        "No. You can deposit your local currency from your bank to your Lisar wallet or use your existing crypto assets if you already have one",
    },
    {
      id: 5,
      question: "Is my money safe?",
      answer:
        "Your assets remain yours at all times. Lisar does not lock your funds or require you to hand over custody, and you export your wallet at anytime.",
    },
    {
      id: 6,
      question: "Can I withdraw my money anytime?",
      answer:
        "Yes. There are no mandatory lockups. You can withdraw your assets whenever you choose, subject only to normal network processing times.",
    },
    {
      id: 7,
      question: "How much can I earn?",
      answer:
        "Returns vary depending on the asset and network conditions. Stable assets typically earn steady yields, while proof-of-stake tokens may earn based on staking rewards.",
    },
    {
      id: 8,
      question: "I would like to learn more",
      answer:
        "Absolutely! You can send us a DM on [X](https://x.com/lisarstake) or join our community on [Telegram](https://t.me/+F0YXOMaiJMxkODVk) to learn more about Lisar.",
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
