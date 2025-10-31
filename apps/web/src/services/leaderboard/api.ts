/**
 * Leaderboard API Service Interface
 */

import { EarnerLeaderboardQuery, EarnerLeaderboardResponse, LeaderboardApiResponse } from './types';

export interface ILeaderboardApiService {
  getEarnerLeaderboard(params?: EarnerLeaderboardQuery): Promise<LeaderboardApiResponse<EarnerLeaderboardResponse['data']>>;
}


