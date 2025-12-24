/**
 * Dashboard Types
 */

export interface MetricCard {
  title: string;
  value: string;
  currency?: string;
}

export type SortType = "date" | "account" | "event";

