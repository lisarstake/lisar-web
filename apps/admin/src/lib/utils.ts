import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge class names
 * Combines clsx and tailwind-merge for conditional class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if the app is running in production mode
 * @returns true if MODE is "production", false otherwise
 */
export const isProduction = (): boolean => {
  return import.meta.env.MODE === "production";
};
