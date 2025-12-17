import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date relative to now (e.g., "2 hours ago")
 */
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

/**
 * Shorten Ethereum address or hash
 */
export const shortenHash = (hash: string): string => {
  if (hash.length <= 10) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};

/**
 * Get Arbitrum scan URL for transaction
 */
export const getArbitrumScanUrl = (hash: string): string => {
  return `https://arbiscan.io/tx/${hash}`;
};

/**
 * Extract first 6 letters from email (avoiding @, gmail, and numbers)
 */
export const getEmailDisplayName = (email: string | undefined | null): string | null => {
  if (!email || !email.trim()) {
    return null;
  }

  // Extract part before @
  const emailPart = email.split('@')[0];
  // Remove all non-alphabetic characters (numbers, dots, etc.) and "gmail"
  const lettersOnly = emailPart
    .replace(/[^a-zA-Z]/g, '')
    .replace(/gmail/gi, '');
  // Take first 6 letters
  return lettersOnly.slice(0, 6) || emailPart.slice(0, 6);
};

/**
 * Get display name for leaderboard entry (email or fallback to shortened address)
 */
export const getLeaderboardDisplayName = (
  email: string | undefined | null,
  address: string
): string => {
  const emailDisplay = getEmailDisplayName(email);
  if (emailDisplay) {
    return emailDisplay;
  }
  // Fallback to shortened address
  return shortenHash(address);
};

/**
 * Check if the app is running in production mode
 * @returns true if MODE is "production", false otherwise
 */
export const isProduction = (): boolean => {
  return import.meta.env.MODE === "production";
};
