"use client";

import { useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight, Search } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkline } from "@/components/Sparkline";
import { SkeletonCards, SkeletonRows } from "@/components/SkeletonRows";
import { EmptyState } from "@/components/EmptyState";
import { Kol, SortField } from "@/lib/types";
import { useKolAuditStore } from "@/lib/store";
import { cn, formatPct, formatRelativeTime } from "@/lib/utils";

interface LeaderboardProps {
  kols: Kol[];
  isLoading: boolean;
}

function SortIcon({ active, direction }: { active: boolean; direction: "asc" | "desc" }) {
  if (!active) return <ArrowUpDown className="h-3 w-3 text-base-500" />;
  return direction === "desc" ? (
    <ArrowDown className="h-3 w-3 text-accent" />
  ) : (
    <ArrowUp className="h-3 w-3 text-accent" />
  );
}

export function Leaderboard({ kols, isLoading }: LeaderboardProps) {
  const {
    search,
    minAccuracy,
    sortField,
    sortDirection,
    setSearch,
    setMinAccuracy,
    setSort,
    clearFilters,
    openDrawer,
  } = useKolAuditStore();

  const filtered = useMemo(() => {
    let result = kols.filter((k) => k.accuracy >= minAccuracy);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((k) => k.handle.toLowerCase().includes(q));
    }
    result = [...result].sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      return (a[sortField] - b[sortField]) * dir;
    });
    return result;
  }, [kols, search, minAccuracy, sortField, sortDirection]);

  const columns = useMemo<ColumnDef<Kol>[]>(
    () => [
      {
        id: "rank",
        header: "#",
        cell: ({ row }) => (
          <span className="font-mono-tabular text-xs text-base-400">{row.index + 1}</span>
        ),
      },
      {
        id: "handle",
        header: "KOL",
        cell: ({ row }) => {
          const kol = row.original;
          return (
            <div className="flex items-center gap-2.5">
              {kol.avatarUrl ? (
                <Image
                  src={kol.avatarUrl}
                  alt={kol.handle}
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-full border border-base-700 object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-base-700 bg-base-800 text-[10px] font-medium text-base-300">
                  {kol.handle.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium text-base-100">@{kol.handle}</span>
            </div>
          );
        },
      },
      {
        id: "accuracy",
        header: () => (
          <button
            onClick={() => setSort("accuracy")}
            className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-base-400 hover:text-base-100"
          >
            Accuracy <SortIcon active={sortField === "accuracy"} direction={sortDirection} />
          </button>
        ),
        cell: ({ row }) => {
          const val = row.original.accuracy;
          return (
            <span
              className={cn(
                "font-mono-tabular text-sm font-medium",
                val >= 70 ? "text-signal-up" : val >= 50 ? "text-signal-amber" : "text-signal-down"
              )}
            >
              {val.toFixed(1)}%
            </span>
          );
        },
      },
      {
        id: "totalSignals",
        header: () => (
          <button
            onClick={() => setSort("totalSignals")}
            className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-base-400 hover:text-base-100"
          >
            Signals <SortIcon active={sortField === "totalSignals"} direction={sortDirection} />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-mono-tabular text-sm text-base-300">
            {row.original.totalSignals}
          </span>
        ),
      },
      {
        id: "avgRoi",
        header: () => (
          <button
            onClick={() => setSort("avgRoi")}
            className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-base-400 hover:text-base-100"
          >
            Avg ROI <SortIcon active={sortField === "avgRoi"} direction={sortDirection} />
          </button>
        ),
        cell: ({ row }) => (
          <span
            className={cn(
              "font-mono-tabular text-sm font-medium",
              row.original.avgRoi >= 0 ? "text-signal-up" : "text-signal-down"
            )}
          >
            {formatPct(row.original.avgRoi)}
          </span>
        ),
      },
      {
        id: "sparkline",
        header: "Trend",
        cell: ({ row }) => <Sparkline values={row.original.recentRoi ?? []} />,
      },
      {
        id: "lastSignalAt",
        header: "Last Signal",
        cell: ({ row }) => (
          <span className="font-mono-tabular text-xs text-base-400">
            {formatRelativeTime(row.original.lastSignalAt)}
          </span>
        ),
      },
      {
        id: "action",
        header: "",
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => openDrawer(row.original.id)}
            aria-label={`View signals for @${row.original.handle}`}
          >
            View <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        ),
      },
    ],
    [sortField, sortDirection, setSort, openDrawer]
  );

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-base-500" />
          <Input
            placeholder="Search by handle…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
            aria-label="Search KOLs by handle"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="min-accuracy" className="text-xs text-base-400 whitespace-nowrap">
            Min accuracy: <span className="font-mono-tabular text-base-200">{minAccuracy}%</span>
          </label>
          <input
            id="min-accuracy"
            type="range"
            min={0}
            max={100}
            step={5}
            value={minAccuracy}
            onChange={(e) => setMinAccuracy(Number(e.target.value))}
            className="w-32 accent-[var(--color-accent)]"
          />
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-lg border border-base-800 md:block">
        <table className="w-full border-collapse text-left">
          <thead className="bg-base-900">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-base-800">
                {hg.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-xs font-medium text-base-400">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows />
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  tabIndex={0}
                  onClick={() => openDrawer(row.original.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") openDrawer(row.original.id);
                  }}
                  className="cursor-pointer border-b border-base-800 bg-base-950 transition-colors last:border-0 hover:bg-base-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!isLoading && filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState onClearFilters={clearFilters} />
          </div>
        ) : null}
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {isLoading ? (
          <SkeletonCards />
        ) : filtered.length === 0 ? (
          <EmptyState onClearFilters={clearFilters} />
        ) : (
          filtered.map((kol, i) => (
            <button
              key={kol.id}
              onClick={() => openDrawer(kol.id)}
              className="rounded-lg border border-base-800 bg-base-950 p-4 text-left transition-colors active:bg-base-900"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono-tabular text-xs text-base-500">{i + 1}</span>
                  {kol.avatarUrl ? (
                    <Image
                      src={kol.avatarUrl}
                      alt={kol.handle}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full border border-base-700 object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-base-700 bg-base-800 text-[10px] font-medium text-base-300">
                      {kol.handle.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-base-100">@{kol.handle}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-base-500" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-base-900 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-base-500">Accuracy</p>
                  <p
                    className={cn(
                      "font-mono-tabular text-sm font-medium",
                      kol.accuracy >= 70
                        ? "text-signal-up"
                        : kol.accuracy >= 50
                        ? "text-signal-amber"
                        : "text-signal-down"
                    )}
                  >
                    {kol.accuracy.toFixed(1)}%
                  </p>
                </div>
                <div className="rounded-md bg-base-900 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-base-500">Signals</p>
                  <p className="font-mono-tabular text-sm text-base-200">{kol.totalSignals}</p>
                </div>
                <div className="rounded-md bg-base-900 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-base-500">Avg ROI</p>
                  <p
                    className={cn(
                      "font-mono-tabular text-sm font-medium",
                      kol.avgRoi >= 0 ? "text-signal-up" : "text-signal-down"
                    )}
                  >
                    {formatPct(kol.avgRoi)}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  );
}

export function getFieldForSort(field: SortField) {
  return field;
}
