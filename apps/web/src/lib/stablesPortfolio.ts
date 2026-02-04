/**
 * Savings Portfolio Calculations
 * Utility functions for calculating savings (stables) portfolio metrics
 */

import { TransactionData } from "@/services/transactions/types";
import { Position } from "@/services/maple/types";

export interface SavingsMetrics {
  totalStake: number; // Current active vest (USD* balance + Maple available balance)
  currentStake: number; // Same as totalStake
  lifetimeRewards: number; // Total rewards earned
  lifetimeUnbonded: number; // Total withdrawn
  mapleRewards: number; // Maple-specific rewards
  perenaRewards: number; // Perena-specific rewards
  mapleWithdrawn: number; // Maple-specific withdrawn
  perenaWithdrawn: number; // Perena-specific withdrawn
}

/**
 * Calculate Maple metrics
 */
export async function calculateMapleMetrics(
  positions: Position[],
  transactions: TransactionData[]
): Promise<{
  rewards: number;
  withdrawn: number;
  totalDeposited: number;
}> {
  // Filter Maple deposit transactions (delegation type, USDC token)
  const mapleDeposits = transactions.filter(
    (tx) =>
      tx.transaction_type === "delegation" &&
      tx.token_symbol?.toUpperCase() === "USDC" &&
      tx.status === "confirmed"
  );

  // Calculate total deposited from transactions
  const totalDeposited = mapleDeposits.reduce((sum, tx) => {
    const amount = parseFloat(tx.amount || "0");
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  // Calculate total available balance across all positions
  const totalAvailableBalance = positions.reduce((sum, position) => {
    const balance = parseFloat(position.availableBalance || "0");
    return sum + (isNaN(balance) ? 0 : balance);
  }, 0);

  // Calculate total redeemable shares across all positions
  const totalRedeemableShares = positions.reduce((sum, position) => {
    const shares = parseFloat(position.redeemableShares || "0");
    return sum + (isNaN(shares) ? 0 : shares);
  }, 0);

  // Rewards = redeemableShares - totalDeposited
  const rewards = Math.max(0, totalRedeemableShares - totalDeposited);

  // Withdrawn = totalDeposited - availableBalance
  const withdrawn = Math.max(0, totalDeposited - totalAvailableBalance);

  return { rewards, withdrawn, totalDeposited };
}

export interface PerenaPortfolioData {
  earnings: number;
  usdStarBalance: number;
  currentPrice: number;
  netValue: number;
  netValueFormatted: string;
}

/**
 * Calculate combined savings metrics
 * Perena metrics come from the portfolio API; Maple metrics from positions/transactions
 */
export async function calculateSavingsMetrics(
  perenaBalance: number,
  maplePositions: Position[],
  transactions: TransactionData[],
  perenaPortfolioData?: PerenaPortfolioData | null
): Promise<SavingsMetrics> {
  // Calculate Maple metrics
  const mapleMetrics = await calculateMapleMetrics(
    maplePositions,
    transactions
  );

  // Perena metrics from portfolio API only
  const effectivePerenaBalance = perenaPortfolioData?.usdStarBalance ?? perenaBalance;
  const perenaMetrics = {
    rewards: perenaPortfolioData?.earnings ?? 0,
    withdrawn: 0,
    totalDeposited: 0,
  };

  // Calculate total available balance from Maple positions
  const mapleAvailableBalance = maplePositions.reduce((sum, position) => {
    const balance = parseFloat(position.availableBalance || "0");
    return sum + (isNaN(balance) ? 0 : balance);
  }, 0);

  // Active vest = USD* balance + Maple available balance
  const totalStake = effectivePerenaBalance + mapleAvailableBalance;
  const currentStake = totalStake;

  // Total rewards
  const lifetimeRewards = mapleMetrics.rewards + perenaMetrics.rewards;

  // Total withdrawn
  const lifetimeUnbonded = mapleMetrics.withdrawn + perenaMetrics.withdrawn;

  return {
    totalStake,
    currentStake,
    lifetimeRewards,
    lifetimeUnbonded,
    mapleRewards: mapleMetrics.rewards,
    perenaRewards: perenaMetrics.rewards,
    mapleWithdrawn: mapleMetrics.withdrawn,
    perenaWithdrawn: perenaMetrics.withdrawn,
  };
}

