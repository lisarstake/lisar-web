import React from "react";
import { formatEarnings, formatStables } from "@/lib/formatters";

interface IdleBalanceCardProps {
  balance: number;
  tokenSymbol: string;
  isSavings: boolean;
}

export const IdleBalanceCard: React.FC<IdleBalanceCardProps> = ({
  balance,
  tokenSymbol,
  isSavings,
}) => {
  const hasIdleBalance = balance > 0;

  return (
    <div
      className={`rounded-2xl p-4 mb-4 border ${isSavings
        ? "bg-[#0f0f0f]/80 border-[#86B3F7]/20"
        : "bg-[#0f0f0f]/80 border-[#C7EF6B]/20"
        }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-gray-400 text-sm font-medium tracking-wider mb-0.5">
              Idle balance
            </p>
            <p className="text-gray-500 text-xs mb-2 leading-relaxed">
              {hasIdleBalance
                ? "This balance isn't earning yet. Vest it to start earning."
                : "All your balance is currently earning 🎉"}
            </p>
            <p
              className={`text-lg font-semibold ${isSavings ? "text-[#86B3F7]" : "text-[#C7EF6B]"
                }`}
            >
              {isSavings ? formatStables(balance) : formatEarnings(balance)}{" "}
              <span className="text-sm font-normal text-white/70">
                {tokenSymbol}
              </span>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
