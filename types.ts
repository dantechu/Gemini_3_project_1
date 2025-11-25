export type SentimentSignal = 'BUY' | 'SELL' | 'HOLD' | 'UNKNOWN';
export type MarketItemType = 'SECTOR' | 'STOCK';
export type ImpactLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type EventCategory = 'ECONOMIC' | 'POLITICAL' | 'EARNINGS' | 'GENERAL';

export interface NewsItem {
  title: string;
  url: string;
  source?: string;
}

export interface GeneralNewsData {
  summary: string;
  news: NewsItem[];
}

export interface ImpactEvent {
  title: string;
  date: string;
  impact: ImpactLevel;
  category: EventCategory;
  description: string;
}

export interface EarningsEvent {
  ticker: string;
  name: string;
  date: string; // e.g., "Monday, Nov 15"
  time: 'Pre-Market' | 'After-Close' | 'During-Day' | 'Unknown';
  estimate?: string;
}

export interface MarketCalendarData {
  economic: ImpactEvent[];
  earnings: EarningsEvent[];
}

export interface StockRecommendation {
  symbol: string;
  name: string;
  reason: string;
}

export interface SectorData {
  id: string;
  name: string;
  type: MarketItemType;
  icon: string;
  signal: SentimentSignal;
  score: number;
  lastUpdated: number | null;
  isLoading: boolean;
  error?: string;
  summary: string;
  catalysts: {
    positive: string[];
    negative: string[];
  };
  topStocks: {
    buy: StockRecommendation[];
    sell: StockRecommendation[];
  };
  news: NewsItem[];
}

export interface GeminiAnalysisResult {
  signal: SentimentSignal;
  score: number;
  summary: string;
  catalysts: {
    positive: string[];
    negative: string[];
  };
  topStocks: {
    buy: StockRecommendation[];
    sell: StockRecommendation[];
  };
  news: NewsItem[];
}