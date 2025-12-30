/**
 * Perena API Service Interface
 * Defines the contract for perena-related API operations
 */

import {
  GetPriceResponse,
  QuoteResponse,
  GetStatsResponse,
  MintResponse,
  BurnResponse,
  MintQuoteRequest,
  BurnQuoteRequest,
  MintRequest,
  BurnRequest,
  GetApyResponse,
  GetPriceApiResponse
} from './types';

export interface IPerenaApiService {
  // Get current USD* price
  getPrice(): Promise<GetPriceResponse>;

  // Get USDStar price from Perena API (with timestamp)
  getPriceApi(time?: string): Promise<GetPriceApiResponse>;

  // Get USDStar APY from Perena API
  getApy(time?: string): Promise<GetApyResponse>;

  // Get quote for minting USD*
  getMintQuote(request: MintQuoteRequest): Promise<QuoteResponse>;

  // Get quote for burning USD*
  getBurnQuote(request: BurnQuoteRequest): Promise<QuoteResponse>;

  // Get protocol statistics
  getStats(): Promise<GetStatsResponse>;

  // Mint USD* from USDC
  mint(request: MintRequest): Promise<MintResponse>;

  // Burn USD* for USDC
  burn(request: BurnRequest): Promise<BurnResponse>;
}

