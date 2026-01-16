/**
 * Campaign Service Index
 * Centralized export for campaign services
 */

export * from './types';
export * from './api';
export * from './campaignService';

// Export the service instance
import { CampaignService } from './campaignService';
export const campaignService = new CampaignService();
