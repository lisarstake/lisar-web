/**
 * Utility functions for getting unbonding time remaining from API data
 */

import { DelegatorTransaction } from "@/services/delegation/types";

/**
 * Get the formatted time remaining for a pending unbonding transaction
 * Uses the pre-calculated data from the API
 * 
 * @param pendingTransaction - The pending unbonding transaction
 * @returns Formatted time remaining string from API or fallback
 */
export function getUnbondingTimeRemaining(
  pendingTransaction: DelegatorTransaction
): string | null {
  // Use the pre-formatted time from the API
  if (pendingTransaction.timeRemainingFormatted) {
    return pendingTransaction.timeRemainingFormatted;
  }

  // Fallback: use days remaining if available
  if (pendingTransaction.daysRemaining !== undefined) {
    const days = pendingTransaction.daysRemaining;
    if (days === 0) {
      return "Ready now";
    }
    return `${days} day${days !== 1 ? 's' : ''} remaining`;
  }

  // Fallback: use rounds remaining
  if (pendingTransaction.roundsRemaining !== undefined) {
    const rounds = pendingTransaction.roundsRemaining;
    if (rounds === 0) {
      return "Ready now";
    }
    return `${rounds} round${rounds !== 1 ? 's' : ''} remaining`;
  }

  return null;
}

/**
 * Get time remaining for multiple pending transactions
 * Returns the earliest withdrawal time
 * 
 * @param pendingTransactions - Array of pending unbonding transactions
 * @returns Formatted time remaining string for the earliest transaction
 */
export function getEarliestUnbondingTime(
  pendingTransactions: DelegatorTransaction[]
): string | null {
  if (pendingTransactions.length === 0) {
    return null;
  }

  // Find the transaction with the earliest withdraw round (smallest daysRemaining or roundsRemaining)
  const earliestTx = pendingTransactions.reduce((earliest, current) => {
    // Prefer comparing by daysRemaining if available
    if (current.daysRemaining !== undefined && earliest.daysRemaining !== undefined) {
      return current.daysRemaining < earliest.daysRemaining ? current : earliest;
    }
    
    // Fall back to roundsRemaining
    if (current.roundsRemaining !== undefined && earliest.roundsRemaining !== undefined) {
      return current.roundsRemaining < earliest.roundsRemaining ? current : earliest;
    }
    
    // Fall back to withdrawRound comparison
    if (current.withdrawRound && earliest.withdrawRound) {
      return parseInt(current.withdrawRound) < parseInt(earliest.withdrawRound)
        ? current
        : earliest;
    }
    
    return earliest;
  }, pendingTransactions[0]);

  return getUnbondingTimeRemaining(earliestTx);
}

