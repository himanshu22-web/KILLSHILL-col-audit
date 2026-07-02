import { Kol, Signal, SignalDirection, SignalStatus } from "./types";

const KOLS_URL =
  "https://gist.githubusercontent.com/Sandeepsorout01/4fef48fa4ddaa7551ad9fdeb5a0087e1/raw/kols.json";
const SIGNALS_URL =
  "https://gist.githubusercontent.com/Sandeepsorout01/4fef48fa4ddaa7551ad9fdeb5a0087e1/raw/signals.json";

/**
 * The brief doesn't pin down exact JSON key casing, so these normalizers
 * accept a handful of likely shapes (camelCase, snake_case, nested `stats`)
 * and coerce them into the app's internal types. This keeps the UI resilient
 * if the mock data shape shifts slightly.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pick<T = unknown>(obj: any, keys: string[], fallback: T): T {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null) return obj[key] as T;
  }
  return fallback;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeKol(raw: any, index: number): Kol {
  const stats = raw?.stats ?? raw?.metrics ?? raw;
  return {
    id: String(pick(raw, ["id", "kolId", "_id"], `kol-${index}`)),
    handle: String(pick(raw, ["handle", "username", "name"], "unknown")),
    avatarUrl: pick(raw, ["avatarUrl", "avatar", "avatar_url", "image"], null),
    accuracy: Number(pick(stats, ["accuracy_pct", "accuracy", "accuracyPct"], 0)),
    totalSignals: Number(pick(stats, ["totalSignals", "total_signals", "signalCount"], 0)),
    avgRoi: Number(pick(stats, ["avg_roi_pct", "avgRoi", "avgRoiPct", "avg_roi", "averageRoi"], 0)),
    lastSignalAt: String(
      pick(stats, ["lastSignalAt", "last_signal_at", "lastSignalTimestamp"], new Date().toISOString())
    ),
    recentRoi: pick(stats, ["recentRoi", "roiHistory", "recent_roi"], undefined),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeSignal(raw: any, index: number): Signal {
  const direction = String(
    pick(raw, ["direction", "side", "type"], "BUY")
  ).toUpperCase() as SignalDirection;
  const status = String(
    pick(raw, ["status", "state"], "OPEN")
  ).toUpperCase() as SignalStatus;

  return {
    id: String(pick(raw, ["id", "_id"], `signal-${index}`)),
    kolId: String(pick(raw, ["kolId", "kol_id", "userId"], "")),
    symbol: String(pick(raw, ["symbol", "pair", "ticker"], "—")),
    direction: direction === "SELL" ? "SELL" : "BUY",
    entryPrice: Number(pick(raw, ["entryPrice", "entry_price", "entry"], 0)),
    targetPrice: Number(pick(raw, ["targetPrice", "target_price", "target"], 0)),
    stopLoss: Number(pick(raw, ["stopLoss", "stop_loss", "sl"], 0)),
    status: (["OPEN", "TARGET_HIT", "STOPLOSS_HIT", "EXPIRED"].includes(status)
      ? status
      : "OPEN") as SignalStatus,
    roi: Number(pick(raw, ["roi", "roiPct", "roi_percent"], 0)),
    timestamp: String(pick(raw, ["timestamp", "createdAt", "created_at"], new Date().toISOString())),
  };
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function fetchKols(): Promise<Kol[]> {
  const data = await fetchJson(KOLS_URL);
  const list = Array.isArray(data) ? data : (data as { kols?: unknown[] })?.kols ?? [];
  return list.map((item, i) => normalizeKol(item, i));
}

export async function fetchSignals(): Promise<Signal[]> {
  const data = await fetchJson(SIGNALS_URL);
  const list = Array.isArray(data) ? data : (data as { signals?: unknown[] })?.signals ?? [];
  return list.map((item, i) => normalizeSignal(item, i));
}

export async function fetchLivePrice(symbol: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    const price = Number(data?.price);
    return Number.isFinite(price) ? price : null;
  } catch {
    return null;
  }
}
