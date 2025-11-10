import { CheckCircle2, XCircle } from "lucide-react";
import React from "react";

// Formatter utilities for admin app

/**
 * Format a date string to a readable format
 * @param dateString - Date string to format
 * @param options - Formatting options
 * @returns Formatted date string or 'N/A' if invalid
 */
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

/**
 * Format a number as currency/amount
 * @param amount - Amount to format
 * @param options - Formatting options
 * @returns Formatted amount string or 'N/A' if invalid
 */
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

/**
 * Get status color class for badges
 * @param status - Status string or boolean
 * @returns Tailwind CSS classes for status badge
 */
export const getStatusColor = (
  status: string | boolean | null | undefined
): string => {
  if (status === null || status === undefined) {
    return "bg-gray-100 text-gray-800 border-0 text-xs";
  }

  // Handle boolean status (e.g., is_suspended)
  if (typeof status === "boolean") {
    return status
      ? "bg-red-100 text-red-800 border-0 text-xs"
      : "bg-green-100 text-green-800 border-0 text-xs";
  }

  const normalized = status.toLowerCase();

  // Transaction statuses
  if (normalized === "confirmed") {
    return "bg-green-100 text-green-800 border-0 text-xs";
  } else if (normalized === "pending") {
    return "bg-yellow-100 text-yellow-800 border-0 text-xs";
  } else if (normalized === "failed") {
    return "bg-red-100 text-red-800 border-0 text-xs";
  }

  // Health/System statuses
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

  // Default
  return "bg-gray-100 text-gray-800 border-0 text-xs";
};

/**
 * Get status icon component
 * @param status - Status string
 * @returns React component for status icon
 */
export const getStatusIcon = (
  status: string | null | undefined
): React.ReactNode => {
  if (!status) return <XCircle className="w-3 h-3 mr-1" />;

  const normalized = status.toLowerCase();
  if (normalized === "confirmed" || normalized === "ok" || normalized === "connected" || normalized === "operational") {
    return <CheckCircle2 className="w-3 h-3 mr-1" />;
  }
  return <XCircle className="w-3 h-3 mr-1" />;
};

/**
 * Format wallet address to shortened version
 * @param address - Wallet address to format
 * @param options - Formatting options
 * @returns Formatted address or 'N/A' if invalid
 */
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

/**
 * Format transaction type to capitalized string
 * @param type - Transaction type string
 * @returns Capitalized type or 'N/A' if invalid
 */
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

/**
 * Get user initials from name or wallet address
 * @param nameOrAddress - Name or wallet address
 * @returns Initials string
 */
export const getInitials = (nameOrAddress: string | null | undefined): string => {
  if (!nameOrAddress) return "U";
  
  // If it's a wallet address (starts with 0x), use the next 2 chars
  if (nameOrAddress.startsWith("0x") && nameOrAddress.length > 4) {
    return nameOrAddress.slice(2, 4).toUpperCase();
  }
  
  // Otherwise, use first letters of words
  return nameOrAddress
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";
};

