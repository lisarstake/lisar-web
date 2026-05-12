/**
 * Points API Service Interface
 */

import type {
  PointsApiResponse,
  PointsBalanceData,
  PointsHistoryEntry,
  RedeemPointsRequest,
  PointsRedemptionRecord,
  PointsMilestone,
  PointsPartner,
} from "./types";

export interface IPointsApiService {
  getBalance(): Promise<PointsApiResponse<PointsBalanceData>>;
  getHistory(): Promise<PointsApiResponse<PointsHistoryEntry[]>>;
  redeem(
    request: RedeemPointsRequest,
  ): Promise<PointsApiResponse<PointsRedemptionRecord>>;
  getRedemptions(): Promise<PointsApiResponse<PointsRedemptionRecord[]>>;
  getMilestones(): Promise<PointsApiResponse<PointsMilestone[]>>;
  getPartners(): Promise<PointsApiResponse<PointsPartner[]>>;
}
