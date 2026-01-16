/**
 * Savings Portfolio Calculations
 * Utility functions for calculating savings (stables) portfolio metrics
 */

import { TransactionData } from "@/services/transactions/types";
import { Position } from "@/services/maple/types";
import { perenaService } from "@/services";

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

/**
 * Calculate Perena (USD*) metrics
 */
export async function calculatePerenaMetrics(
  currentBalance: number,
  transactions: TransactionData[]
): Promise<{
  rewards: number;
  withdrawn: number;
  totalDeposited: number;
}> {
  // Filter Perena deposit transactions (delegation type, USD* token)
  const perenaDeposits = transactions.filter(
    (tx) =>
      tx.transaction_type === "delegation" &&
      (tx.token_symbol?.toUpperCase() === "USD*" ||
        tx.token_symbol?.toUpperCase() === "USDSTAR") &&
      tx.status === "confirmed"
  );

  if (perenaDeposits.length === 0) {
    return { rewards: 0, withdrawn: 0, totalDeposited: 0 };
  }

  // Calculate total deposited
  const totalDeposited = perenaDeposits.reduce((sum, tx) => {
    const amount = parseFloat(tx.amount || "0");
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  // Calculate rewards based on price gain
  let totalRewards = 0;

  for (const tx of perenaDeposits) {
    const depositAmount = parseFloat(tx.amount || "0");
    if (isNaN(depositAmount) || depositAmount === 0) continue;

    // Get USD* price at the time of deposit
    try {
      const depositTime = new Date(tx.created_at).toISOString();
      const historicalPriceResp = await perenaService.getPriceApi(depositTime);

      // Get current USD* price
      const currentTime = new Date().toISOString();
      const currentPriceResp = await perenaService.getPriceApi(currentTime);

      if (
        historicalPriceResp.success &&
        historicalPriceResp.data &&
        currentPriceResp.success &&
        currentPriceResp.data
      ) {
        const depositPrice = historicalPriceResp.data.price;
        const currentPrice = currentPriceResp.data.price;

        // Calculate the number of USD* tokens purchased at deposit
        const tokensOwned = depositAmount / depositPrice;

        // Current value of those tokens
        const currentValue = tokensOwned * currentPrice;

        // Rewards = current value - original deposit
        const rewardForThisTx = currentValue - depositAmount;
        totalRewards += Math.max(0, rewardForThisTx);
      }
    } catch (err) {
      // Continue with other transactions if calculation fails
    }
  }

  // Withdrawn = totalDeposited - currentBalance
  const withdrawn = Math.max(0, totalDeposited - currentBalance);

  return { rewards: totalRewards, withdrawn, totalDeposited };
}

/**
 * Calculate combined savings metrics
 */
export async function calculateSavingsMetrics(
  perenaBalance: number,
  maplePositions: Position[],
  transactions: TransactionData[]
): Promise<SavingsMetrics> {
  // Calculate Maple metrics
  const mapleMetrics = await calculateMapleMetrics(
    maplePositions,
    transactions
  );

  // Calculate Perena metrics
  const perenaMetrics = await calculatePerenaMetrics(
    perenaBalance,
    transactions
  );

  // Calculate total available balance from Maple positions
  const mapleAvailableBalance = maplePositions.reduce((sum, position) => {
    const balance = parseFloat(position.availableBalance || "0");
    return sum + (isNaN(balance) ? 0 : balance);
  }, 0);

  // Active vest = USD* balance + Maple available balance
  const totalStake = perenaBalance + mapleAvailableBalance;
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

