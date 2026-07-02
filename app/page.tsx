"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Leaderboard } from "@/components/Leaderboard";
import { ErrorState } from "@/components/ErrorState";
import { SignalDrawer } from "@/components/SignalDrawer";
import { fetchKols, fetchSignals } from "@/lib/api";
import { Kol, Signal, SortDirection, SortField } from "@/lib/types";
import { useKolAuditStore } from "@/lib/store";

function PageContent() {
  const [kols, setKols] = useState<Kol[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useRef(false);

  const {
    search,
    minAccuracy,
    sortField,
    sortDirection,
    drawerOpen,
    selectedKolId,
    closeDrawer,
    hydrateFromUrl,
  } = useKolAuditStore();

  // Hydrate filter/sort state from URL on first load (stretch goal: URL-synced filters)
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const s = searchParams.get("search") ?? undefined;
    const min = searchParams.get("minAccuracy");
    const field = searchParams.get("sortField") as SortField | null;
    const dir = searchParams.get("sortDirection") as SortDirection | null;
    hydrateFromUrl({
      search: s,
      minAccuracy: min ? Number(min) : undefined,
      sortField: field ?? undefined,
      sortDirection: dir ?? undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync filter/sort state back to the URL
  useEffect(() => {
    if (!hydrated.current) return;
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (minAccuracy > 0) params.set("minAccuracy", String(minAccuracy));
    params.set("sortField", sortField);
    params.set("sortDirection", sortDirection);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [search, minAccuracy, sortField, sortDirection, router]);

  const loadData = useCallback(async (isRefresh: boolean) => {
    if (isRefresh) setIsRefreshing(true);
    setError(null);
    try {
     const [kolsData, signalsData] = await Promise.all([fetchKols(), fetchSignals()]);

const enrichedKols = kolsData.map((kol) => {
  const kolSignals = signalsData
    .filter((s) => s.kolId === kol.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-10)
    .map((s) => s.roi);
  return { ...kol, recentRoi: kolSignals };
});

setKols(enrichedKols);
setSignals(signalsData);
      setLastUpdated(new Date());
      if (isRefresh) toast.success("KOL data refreshed");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      if (isRefresh) toast.error("Refresh failed");
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Stretch goal: keyboard navigation — Escape closes the signal drawer
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && drawerOpen) closeDrawer();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen, closeDrawer]);

  const selectedKol = kols.find((k) => k.id === selectedKolId) ?? null;

  return (
    <main className="min-h-screen">
      <Header
        totalKols={kols.length}
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={() => loadData(true)}
      />

      {error && kols.length === 0 ? (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <ErrorState message={error} onRetry={() => loadData(false)} />
        </div>
      ) : (
        <Leaderboard kols={kols} isLoading={isInitialLoading} />
      )}

      <SignalDrawer open={drawerOpen} onClose={closeDrawer} kol={selectedKol} signals={signals} />
    </main>
  );
}
export default function Page() {
  return (
    <Suspense fallback={null}>
      <PageContent />
    </Suspense>
  );
}
