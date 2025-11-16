import { CheckCircle2, XCircle } from "lucide-react";
import React from "react";

// --- Formatters for the admin app ---

export const formatDate = (
  dateString: string | null | undefined,
  options?: {
    includeTime?: boolean;
    includeYear?: boolean;
  }
): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: options?.includeYear !== false ? "numeric" : undefined,
      month: "short",
      day: "numeric",
    };

    if (options?.includeTime) {
      return date.toLocaleString("en-US", {
        ...defaultOptions,
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString("en-US", defaultOptions);
  } catch {
    return "N/A";
  }
};

export const formatAmount = (
  amount: number | null | undefined,
  options?: {
    minDecimals?: number;
    maxDecimals?: number;
    defaultValue?: string;
  }
): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return options?.defaultValue || "0.00";
  }
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: options?.minDecimals ?? 2,
    maximumFractionDigits: options?.maxDecimals ?? 2,
  });
};

export const getStatusColor = (
  status: string | boolean | null | undefined
): string => {
  if (status === null || status === undefined) {
    return "bg-gray-100 text-gray-800 border-0 text-xs";
  }

  if (typeof status === "boolean") {
    return status
      ? "bg-red-100 text-red-800 border-0 text-xs"
      : "bg-green-100 text-green-800 border-0 text-xs";
  }

  const normalized = status.toLowerCase();

  if (normalized === "confirmed") {
    return "bg-green-100 text-green-800 border-0 text-xs";
  } else if (normalized === "pending") {
    return "bg-yellow-100 text-yellow-800 border-0 text-xs";
  } else if (normalized === "failed") {
    return "bg-red-100 text-red-800 border-0 text-xs";
  }

  if (
    normalized === "ok" ||
    normalized === "connected" ||
    normalized === "operational"
  ) {
    return "bg-green-100 text-green-800 border-0 text-xs";
  } else if (normalized === "unknown" || normalized === "degraded") {
    return "bg-yellow-100 text-yellow-800 border-0 text-xs";
  } else if (normalized === "error" || normalized === "disconnected") {
    return "bg-red-100 text-red-800 border-0 text-xs";
  }

  return "bg-gray-100 text-gray-800 border-0 text-xs";
};

export const getStatusIcon = (
  status: string | null | undefined
): React.ReactNode => {
  if (!status) return <XCircle className="w-3 h-3 mr-1" />;

  const normalized = status.toLowerCase();
  if (
    normalized === "confirmed" ||
    normalized === "ok" ||
    normalized === "connected" ||
    normalized === "operational"
  ) {
    return <CheckCircle2 className="w-3 h-3 mr-1" />;
  }
  return <XCircle className="w-3 h-3 mr-1" />;
};

export const formatWalletAddress = (
  address: string | null | undefined,
  options?: {
    startChars?: number;
    endChars?: number;
  }
): string => {
  if (!address) return "N/A";
  try {
    const start = options?.startChars ?? 6;
    const end = options?.endChars ?? 4;
    if (address.length <= start + end) return address;
    return `${address.slice(0, start)}...${address.slice(-end)}`;
  } catch {
    return address;
  }
};

export const formatTransactionType = (
  type: string | null | undefined
): string => {
  if (!type) return "N/A";
  try {
    return type.charAt(0).toUpperCase() + type.slice(1);
  } catch {
    return type;
  }
};

export const getTransactionTypeColor = (
  type:
    | "deposit"
    | "withdrawal"
    | "delegation"
    | "undelegation"
    | string
    | null
    | undefined
): string => {
  if (!type) return "bg-gray-100 text-gray-800 border-0 text-xs";
  const normalized = type.toLowerCase();
  switch (normalized) {
    case "deposit":
      return "bg-green-100 text-green-800 border-0 text-xs";
    case "withdrawal":
      return "bg-red-100 text-red-800 border-0 text-xs";
    case "delegation":
      return "bg-green-100 text-green-800 border-0 text-xs";
    case "undelegation":
      return "bg-red-100 text-red-800 border-0 text-xs";
    default:
      return "bg-gray-100 text-gray-800 border-0 text-xs";
  }
};

export const getInitials = (
  nameOrAddress: string | null | undefined
): string => {
  if (!nameOrAddress) return "U";
  if (nameOrAddress.startsWith("0x") && nameOrAddress.length > 4) {
    return nameOrAddress.slice(2, 4).toUpperCase();
  }
  return (
    nameOrAddress
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  );
};

export const getArbitrumScanUrl = (hash: string): string => {
  return `https://arbiscan.io/tx/${hash}`;
};
