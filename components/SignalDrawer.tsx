"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetBody, SheetHeader } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Kol, Signal, SignalStatus } from "@/lib/types";
import { fetchLivePrice } from "@/lib/api";
import { cn, formatPct, formatPrice, formatRelativeTime } from "@/lib/utils";

interface SignalDrawerProps {
  open: boolean;
  onClose: () => void;
  kol: Kol | null;
  signals: Signal[];
}

const STATUS_VARIANT: Record<SignalStatus, "neutral" | "up" | "down" | "amber"> = {
  OPEN: "amber",
  TARGET_HIT: "up",
  STOPLOSS_HIT: "down",
  EXPIRED: "neutral",
};

function isBinanceSymbol(symbol: string) {
  return /^(BTC|ETH)USDT$/i.test(symbol.replace(/[^A-Z]/gi, ""));
}

function SignalRow({ signal }: { signal: Signal }) {
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const isOpen = signal.status === "OPEN";
  const symbolKey = signal.symbol.replace(/[^A-Z]/gi, "").toUpperCase();

  useEffect(() => {
    if (!isOpen || !isBinanceSymbol(symbolKey)) return;
    let cancelled = false;
    fetchLivePrice(symbolKey).then((price) => {
      if (!cancelled) setLivePrice(price);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, symbolKey]);

  const liveRoi =
    isOpen && livePrice !== null && signal.entryPrice
      ? ((livePrice - signal.entryPrice) / signal.entryPrice) *
        100 *
        (signal.direction === "SELL" ? -1 : 1)
      : null;

  const displayRoi = liveRoi ?? signal.roi;

  return (
    <div className="rounded-lg border border-base-800 bg-base-900 p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-base-100">{signal.symbol}</span>
          <Badge variant={signal.direction === "BUY" ? "up" : "down"}>{signal.direction}</Badge>
        </div>
        <Badge variant={STATUS_VARIANT[signal.status]}>{signal.status.replace("_", " ")}</Badge>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-base-500">Entry</p>
          <p className="font-mono-tabular text-xs text-base-200">{formatPrice(signal.entryPrice)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-base-500">Target</p>
          <p className="font-mono-tabular text-xs text-signal-up">{formatPrice(signal.targetPrice)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-base-500">Stop Loss</p>
          <p className="font-mono-tabular text-xs text-signal-down">{formatPrice(signal.stopLoss)}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-base-800 pt-2.5">
        <span className="text-[11px] text-base-500">{formatRelativeTime(signal.timestamp)}</span>
        <span className="flex items-center gap-1.5">
          {isOpen && liveRoi !== null ? (
            <span className="flex h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent" title="Live price" />
          ) : null}
          <span
            className={cn(
              "font-mono-tabular text-xs font-medium",
              displayRoi >= 0 ? "text-signal-up" : "text-signal-down"
            )}
          >
            {formatPct(displayRoi)}
          </span>
        </span>
      </div>
    </div>
  );
}

export function SignalDrawer({ open, onClose, kol, signals }: SignalDrawerProps) {
  const latestSignals = signals
    .filter((s) => s.kolId === kol?.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetHeader
        title={kol ? `@${kol.handle}` : "Signal history"}
        subtitle={kol ? `${kol.totalSignals} total signals · ${kol.accuracy.toFixed(1)}% accuracy` : undefined}
        onClose={onClose}
      />
      <SheetBody>
        {!kol ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : latestSignals.length === 0 ? (
          <p className="py-8 text-center text-sm text-base-400">No signals recorded for this KOL yet.</p>
        ) : (
          <div className="space-y-3">
            {latestSignals.map((signal) => (
              <SignalRow key={signal.id} signal={signal} />
            ))}
          </div>
        )}
      </SheetBody>
    </Sheet>
  );
}
