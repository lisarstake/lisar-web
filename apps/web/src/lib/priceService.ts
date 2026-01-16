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

const FALLBACK_PRICES: PriceData = {
  sol: 140,
  lpt: 5,
  usdc: 1,
  ngn: 1450,
  eur: 0.85,
  gbp: 0.75,
};

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
  private readonly CACHE_DURATION = 300000;
  private pendingFetch: Promise<PriceData> | null = null;

  private constructor() {}

  static getInstance(): PriceService {
    if (!PriceService.instance) {
      PriceService.instance = new PriceService();
    }
    return PriceService.instance;
  }

  async getPrices(): Promise<PriceData> {
    const now = Date.now();

    if (this.cache && now - this.lastFetch < this.CACHE_DURATION) {
      return this.cache;
    }

    if (this.pendingFetch) {
      return this.pendingFetch;
    }

    this.pendingFetch = this.fetchPricesFromAPI()
      .then((prices) => {
        this.cache = prices;
        this.lastFetch = now;
        this.pendingFetch = null;
        return prices;
      })
      .catch((error) => {
        this.pendingFetch = null;
        
        if (!this.cache) {
          this.cache = FALLBACK_PRICES;
        }
        return this.cache;
      });

    return this.pendingFetch;
  }

  private async fetchPricesFromAPI(): Promise<PriceData> {
    const [cryptoResponse, fiatResponse] = await Promise.all([
      fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana,livepeer&vs_currencies=usd"
      ),
      fetch("https://api.exchangerate-api.com/v4/latest/USD"),
    ]);

    if (!cryptoResponse.ok || !fiatResponse.ok) {
      throw new Error(`Failed to fetch price data: Crypto=${cryptoResponse.status}, Fiat=${fiatResponse.status}`);
    }

    const [cryptoData, fiatData] = await Promise.all([
      cryptoResponse.json() as Promise<CoinGeckoResponse>,
      fiatResponse.json() as Promise<{ rates: { [key: string]: number } }>,
    ]);

    if (!cryptoData.livepeer?.usd) {
      throw new Error("LPT price not found in API response");
    }

    return {
      sol: cryptoData.solana?.usd || FALLBACK_PRICES.sol,
      lpt: cryptoData.livepeer.usd,
      usdc: 1,
      ngn: fiatData.rates?.NGN || FALLBACK_PRICES.ngn,
      eur: fiatData.rates?.EUR || FALLBACK_PRICES.eur,
      gbp: fiatData.rates?.GBP || FALLBACK_PRICES.gbp,
    };
  }

  clearCache(): void {
    this.cache = null;
    this.lastFetch = 0;
    this.pendingFetch = null;
  }

  getCachedPrices(): PriceData {
    return this.cache || FALLBACK_PRICES;
  }

  async convertLptToFiat(lptAmount: number, fiatCode: string): Promise<number> {
    const prices = await this.getPrices();
    const lptPriceInUsd = prices.lpt;

    switch (fiatCode.toUpperCase()) {
      case "USD":
        return lptAmount * lptPriceInUsd;
      case "NGN":
        return (lptAmount * lptPriceInUsd) * prices.ngn;
      case "EUR":
        return (lptAmount * lptPriceInUsd) * prices.eur;
      case "GBP":
        return (lptAmount * lptPriceInUsd) * prices.gbp;
      default:
        return lptAmount * lptPriceInUsd;
    }
  }

  async convertFiatToLpt(fiatAmount: number, fiatCode: string): Promise<number> {
    const prices = await this.getPrices();
    const lptPriceInUsd = prices.lpt;

    switch (fiatCode.toUpperCase()) {
      case "USD":
        return fiatAmount / lptPriceInUsd;
      case "NGN":
        return fiatAmount / (lptPriceInUsd * prices.ngn);
      case "EUR":
        return fiatAmount / (lptPriceInUsd * prices.eur);
      case "GBP":
        return fiatAmount / (lptPriceInUsd * prices.gbp);
      default:
        return fiatAmount / lptPriceInUsd;
    }
  }

  async convertFiatToUsd(fiatAmount: number, fiatCode: string): Promise<number> {
    const prices = await this.getPrices();

    switch (fiatCode.toUpperCase()) {
      case "USD":
        return fiatAmount;
      case "NGN":
        // prices.ngn is the rate where 1 USD = prices.ngn NGN
        return fiatAmount / prices.ngn;
      case "EUR":
        // prices.eur is the rate where 1 USD = prices.eur EUR
        return fiatAmount / prices.eur;
      case "GBP":
        // prices.gbp is the rate where 1 USD = prices.gbp GBP
        return fiatAmount / prices.gbp;
      default:
        return fiatAmount;
    }
  }

  getCurrencySymbol(fiatCode: string): string {
    const currency = SUPPORTED_CURRENCIES.find(
      (c) => c.code === fiatCode.toUpperCase()
    );
    return currency?.symbol || "$";
  }
}

export const priceService = PriceService.getInstance();
