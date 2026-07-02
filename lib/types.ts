export type SignalStatus = "OPEN" | "TARGET_HIT" | "STOPLOSS_HIT" | "EXPIRED";
export type SignalDirection = "BUY" | "SELL";

export interface Kol {
  id: string;
  handle: string;
  avatarUrl: string | null;
  accuracy: number; // percentage 0-100
  totalSignals: number;
  avgRoi: number; // percentage, can be negative
  lastSignalAt: string; // ISO timestamp
  recentRoi?: number[]; // for sparkline, last N ROI values
}

export interface Signal {
  id: string;
  kolId: string;
  symbol: string;
  direction: SignalDirection;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  status: SignalStatus;
  roi: number;
  timestamp: string; // ISO timestamp
}

export type SortField = "accuracy" | "totalSignals" | "avgRoi";
export type SortDirection = "asc" | "desc";
