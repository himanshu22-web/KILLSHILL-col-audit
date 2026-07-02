import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-base-700 py-16 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-base-800">
        <SearchX className="h-5 w-5 text-base-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-base-100">No KOLs match these filters</p>
        <p className="mt-1 text-xs text-base-400">Try a different handle or lower the accuracy threshold.</p>
      </div>
      <Button variant="outline" size="sm" onClick={onClearFilters}>
        Clear filters
      </Button>
    </div>
  );
}
