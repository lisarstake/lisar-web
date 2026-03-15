import React from "react";
import { ExternalLink } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { getArbitrumScanUrl } from "@/lib/utils";
import { TransactionData, TransactionType } from "@/services/transactions/types";

interface TransactionDetailsDrawerProps {
  transaction: TransactionData | null;
  isOpen: boolean;
  onClose: () => void;
}

const isPositiveTransaction = (type: TransactionType) =>
  type === "deposit" || type === "delegation" || type === "mint";

const getTransactionLabel = (type: TransactionType) => {
  switch (type) {
    case "deposit":
      return "Deposit";
    case "withdrawal":
      return "Send";
    case "delegation":
      return "Vest";
    case "undelegation":
      return "Redeem";
    case "mint":
      return "Top up";
    case "burn":
      return "Withdraw";
    default:
      return "Transaction";
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const truncateMiddle = (value?: string, head = 8, tail = 8) => {
  if (!value) return "-";
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
};

export const TransactionDetailsDrawer: React.FC<TransactionDetailsDrawerProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  if (!transaction) return null;

  const isPositive = isPositiveTransaction(transaction.transaction_type);
  const amountPrefix = isPositive ? "+" : "-";

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-[#050505] border-[#2a2a2a]">
        <DrawerHeader className="">
          <DrawerTitle className="text-base font-medium text-white text-left">

          </DrawerTitle>
        </DrawerHeader>

        <div className="pb-5">
          <p className="text-white text-lg font-semibold text-center">
            {amountPrefix}
            {parseFloat(transaction.amount).toFixed(2)} {transaction.token_symbol}
          </p>
        </div>

        <div className="rounded-xl bg-[#13170a] p-4 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-base text-white/60">Date</span>
            <span className="text-sm text-white">{formatDate(transaction.created_at)}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-base text-white/60">Status</span>
            <span className="text-sm text-white capitalize">{transaction.status || "-"}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-base text-white/60">Hash</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white">
                {truncateMiddle(transaction.transaction_hash)}
              </span>
              {transaction.transaction_hash ? (
                <a
                  href={getArbitrumScanUrl(transaction.transaction_hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white"
                >
                  <ExternalLink size={14} />
                </a>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-base text-white/60">Wallet</span>
            <span className="text-sm text-white">
              {truncateMiddle(transaction.wallet_address)}
            </span>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
