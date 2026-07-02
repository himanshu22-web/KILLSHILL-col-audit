import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-signal-down/30 bg-signal-down-dim py-16 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-signal-down/40 bg-base-900">
        <AlertTriangle className="h-5 w-5 text-signal-down" />
      </div>
      <div>
        <p className="text-sm font-medium text-base-100">Couldn&apos;t load KOL data</p>
        <p className="mt-1 text-xs text-base-400">{message ?? "The request failed. Check your connection and try again."}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
