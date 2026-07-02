"use client";

import { RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";

interface HeaderProps {
  totalKols: number;
  lastUpdated: Date | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function Header({ totalKols, lastUpdated, isRefreshing, onRefresh }: HeaderProps) {
  return (
    <header className="border-b border-base-700 bg-base-950/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-signal-up/30 bg-signal-up-dim">
            <ShieldCheck className="h-4.5 w-4.5 text-signal-up" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-base-100">KOL Audit</h1>
            <p className="text-xs text-base-400">
              <span className="font-mono-tabular text-base-300">{totalKols}</span> influencers
              tracked
              {lastUpdated ? (
                <>
                  {" "}
                  · updated{" "}
                  <span className="font-mono-tabular">{formatRelativeTime(lastUpdated.toISOString())}</span>
                </>
              ) : null}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isRefreshing ? (
            <span className="flex items-center gap-1.5 text-xs text-base-400">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent" />
              Refreshing…
            </span>
          ) : null}
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>
    </header>
  );
}
