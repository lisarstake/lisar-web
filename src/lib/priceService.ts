// Price service for fetching cryptocurrency prices
// This service handles all external price API calls

export interface PriceData {
  sol: number;
  lpt: number;
  usdc: number; // Always 1
}

export interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
  };
}

// Fallback prices in case API fails
const FALLBACK_PRICES: PriceData = {
  sol: 230,
  lpt: 6.5,
  usdc: 1,
};

class PriceService {
  private static instance: PriceService;
  private cache: PriceData | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  private constructor() {}

  static getInstance(): PriceService {
    if (!PriceService.instance) {
      PriceService.instance = new PriceService();
    }
    return PriceService.instance;
  }

  /**
   * Fetch current cryptocurrency prices
   * Uses caching to avoid excessive API calls
   */
  async getPrices(): Promise<PriceData> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cache && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cache;
    }

    try {
      const prices = await this.fetchPricesFromAPI();
      this.cache = prices;
      this.lastFetch = now;
      return prices;
    } catch (error) {
      console.error('Error fetching prices:', error);
      
      // Return fallback prices if API fails
      if (!this.cache) {
        this.cache = FALLBACK_PRICES;
      }
      return this.cache;
    }
  }

  /**
   * Fetch prices from CoinGecko API
   * @private
   */
  private async fetchPricesFromAPI(): Promise<PriceData> {
    const [solResponse, lptResponse] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'),
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=livepeer&vs_currencies=usd')
    ]);

    if (!solResponse.ok || !lptResponse.ok) {
      throw new Error('Failed to fetch price data');
    }

    const [solData, lptData] = await Promise.all([
      solResponse.json() as Promise<CoinGeckoResponse>,
      lptResponse.json() as Promise<CoinGeckoResponse>
    ]);

    return {
      sol: solData.solana?.usd || FALLBACK_PRICES.sol,
      lpt: lptData.livepeer?.usd || FALLBACK_PRICES.lpt,
      usdc: 1, // USDC is always $1
    };
  }

  /**
   * Clear cache to force fresh data on next request
   */
  clearCache(): void {
    this.cache = null;
    this.lastFetch = 0;
  }

  /**
   * Get cached prices without making API calls
   * Returns null if no cached data available
   */
  getCachedPrices(): PriceData | null {
    return this.cache;
  }
}

// Export singleton instance
export const priceService = PriceService.getInstance();
