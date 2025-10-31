/**
 * Leaderboard Service Index
 */

export * from './types';
export * from './api';
export * from './leaderboardService';

import { LeaderboardService } from './leaderboardService';
export const leaderboardService = new LeaderboardService();


