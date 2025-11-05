// Price service for fetching cryptocurrency prices
// This service handles all external price API calls

export interface PriceData {
  sol: number;
  lpt: number;
  usdc: number;
  ngn: number;
  eur: number;
  gbp: number;
}

export interface FiatCurrency {
  code: string;
  symbol: string;
  name: string;
}

export interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
  };
}

// Fallback prices
const FALLBACK_PRICES: PriceData = {
  sol: 230,
  lpt: 6.5,
  usdc: 1,
  ngn: 1500, // 1 USD = 1500 NGN
  eur: 0.85, // 1 USD = 0.85 EUR
  gbp: 0.75, // 1 USD = 0.75 GBP
};

// Supported fiat currencies
export const SUPPORTED_CURRENCIES: FiatCurrency[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
];

class PriceService {
  private static instance: PriceService;
  private cache: PriceData | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 1800000; // 30 minutes
  private pendingFetch: Promise<PriceData> | null = null;

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
    if (this.cache && now - this.lastFetch < this.CACHE_DURATION) {
      return this.cache;
    }

    // If there's already a pending fetch, return that promise
    if (this.pendingFetch) {
      return this.pendingFetch;
    }

    // Start a new fetch
    this.pendingFetch = this.fetchPricesFromAPI()
      .then((prices) => {
        this.cache = prices;
        this.lastFetch = now;
        this.pendingFetch = null;
        return prices;
      })
      .catch((error) => {
        console.error("Error fetching prices:", error);
        this.pendingFetch = null;
        
        if (!this.cache) {
          this.cache = FALLBACK_PRICES;
        }
        return this.cache;
      });

    return this.pendingFetch;
  }

  /**
   * Fetch prices from CoinGecko API and exchange rates
   * @private
   */
  private async fetchPricesFromAPI(): Promise<PriceData> {
    const [cryptoResponse, fiatResponse] = await Promise.all([
      // Fetch crypto prices
      fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana,livepeer&vs_currencies=usd"
      ),
      // Fetch fiat exchange rates
      fetch("https://api.exchangerate-api.com/v4/latest/USD"),
    ]);

    if (!cryptoResponse.ok || !fiatResponse.ok) {
      throw new Error("Failed to fetch price data");
    }

    const [cryptoData, fiatData] = await Promise.all([
      cryptoResponse.json() as Promise<CoinGeckoResponse>,
      fiatResponse.json() as Promise<{ rates: { [key: string]: number } }>,
    ]);

    return {
      sol: cryptoData.solana?.usd || FALLBACK_PRICES.sol,
      lpt: cryptoData.livepeer?.usd || FALLBACK_PRICES.lpt,
      usdc: 1,
      ngn: fiatData.rates?.NGN || FALLBACK_PRICES.ngn,
      eur: fiatData.rates?.EUR || FALLBACK_PRICES.eur,
      gbp: fiatData.rates?.GBP || FALLBACK_PRICES.gbp,
    };
  }

  /**
   * Clear cache to force fresh data on next request
   */
  clearCache(): void {
    this.cache = null;
    this.lastFetch = 0;
    this.pendingFetch = null;
  }

  /**
   * Get cached prices without making API calls
   * Returns fallback prices if no cached data available
   */
  getCachedPrices(): PriceData {
    return this.cache || FALLBACK_PRICES;
  }

  /**
   * Convert LPT amount to fiat currency
   * Uses cached prices to avoid API calls
   */
  convertLptToFiat(lptAmount: number, fiatCode: string): number {
    const prices = this.getCachedPrices();
    const lptPrice = prices.lpt;

    switch (fiatCode.toUpperCase()) {
      case "USD":
        return lptAmount * lptPrice;
      case "NGN":
        return lptAmount * lptPrice * prices.ngn;
      case "EUR":
        return lptAmount * lptPrice * prices.eur;
      case "GBP":
        return lptAmount * lptPrice * prices.gbp;
      default:
        return lptAmount * lptPrice; // Default to USD
    }
  }

  /**
   * Convert fiat amount to LPT
   * Uses cached prices to avoid API calls
   */
  convertFiatToLpt(fiatAmount: number, fiatCode: string): number {
    const prices = this.getCachedPrices();
    const lptPrice = prices.lpt;

    switch (fiatCode.toUpperCase()) {
      case "USD":
        return fiatAmount / lptPrice;
      case "NGN":
        return fiatAmount / (lptPrice * prices.ngn);
      case "EUR":
        return fiatAmount / (lptPrice * prices.eur);
      case "GBP":
        return fiatAmount / (lptPrice * prices.gbp);
      default:
        return fiatAmount / lptPrice; // Default to USD
    }
  }

  /**
   * Get currency symbol for fiat code
   */
  getCurrencySymbol(fiatCode: string): string {
    const currency = SUPPORTED_CURRENCIES.find(
      (c) => c.code === fiatCode.toUpperCase()
    );
    return currency?.symbol || "$";
  }
}

export const priceService = PriceService.getInstance();
