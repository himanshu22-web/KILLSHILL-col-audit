# KOL Audit — Killshill Frontend Intern Assignment

A leaderboard and signal-audit page for Killshill's tracked financial influencers (KOLs), built with Next.js 16 (App Router), React 19, and TypeScript.

## Live Demo

- **Live deployment:** _add your Vercel/Netlify/Cloudflare URL here after deploying_
- **Loom walkthrough:** _add your Loom link here_

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript (strict mode)
- Tailwind CSS v4 (CSS-based `@theme` config, no `tailwind.config.js`)
- shadcn-style primitives (Button, Input, Badge, Skeleton, Sheet) built on Radix + CVA
- TanStack Table for the leaderboard
- Zustand for client state (filters, sort, drawer)
- vaul for the side drawer
- sonner for toasts
- Recharts for the ROI sparkline
- Lucide for icons

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What's Implemented

**Header** — page title, total KOL count, relative "last updated" timestamp, refresh button with spinner + toast.

**Leaderboard** — rank, avatar/handle, accuracy, total signals, avg ROI, ROI sparkline, last signal time, action button. Sortable by accuracy, total signals, and avg ROI (click column header, click again to flip direction). Search by handle. Minimum-accuracy range filter.

**States** — skeleton rows on initial load, subtle "Refreshing…" indicator on manual refresh, dedicated error state with retry, and an empty state with "Clear filters" when a search/filter combination returns nothing.

**Signal Detail Drawer** — right-side sheet (vaul) showing the KOL's latest 10 signals: symbol, direction badge, entry/target/stop-loss, status badge, and ROI. Escape closes it.

**Responsive design** — true breakpoints for desktop (table), tablet, and mobile (dedicated card layout, not a squeezed table).

**Theme** — dark-only, trading-terminal aesthetic: near-black surfaces, monospace numerals for all data values (tabular-nums), green/red/amber semantic colors for accuracy, ROI, and signal status.

### Stretch goals implemented

1. **Sparkline column** — last-10 ROI values per KOL rendered as a tiny Recharts line, colored by trend direction.
2. **URL-synced filters** — search, min accuracy, and sort state are written to the query string and re-hydrated on load, so a filtered/sorted view is shareable and survives a refresh.
3. **Live Binance price for OPEN signals** — when a signal's symbol resolves to `BTCUSDT`/`ETHUSDT`, the drawer fetches the live price from Binance and recalculates ROI in real time (with a pulsing "live" indicator), falling back to the static ROI if the request fails.
4. **Escape to close** the drawer (partial keyboard navigation).

### Data layer note

The brief's mock endpoints don't pin down exact JSON key casing. `lib/api.ts` normalizes a handful of likely shapes (`camelCase`, `snake_case`, nested `stats`/`metrics` objects) into the app's internal `Kol`/`Signal` types, so the UI stays correct even if the mock data's exact field names differ slightly from what's assumed. If a field is genuinely missing, verify the real response shape against the endpoint and adjust the `pick(...)` key lists in `normalizeKol`/`normalizeSignal` accordingly — that's the one spot that may need a quick tweak once you can see the live payload.

## Deploying

**Vercel (recommended):**
```bash
npm install -g vercel
vercel
```
Or connect the GitHub repo directly at [vercel.com/new](https://vercel.com/new) — zero config needed.

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --build
```

## AI Usage Disclosure

- **Generated with AI:** the shadcn-style primitive components (`Button`, `Badge`, `Input`, `Skeleton`, `Sheet`) and the initial Tailwind v4 dark-theme token set in `globals.css`, since these are boilerplate patterns with well-established conventions and not where the interesting product decisions live.
- **Written/decided manually:** the data-normalization layer in `lib/api.ts` (to defend against unknown JSON key casing), the state architecture split between Zustand (filters/sort/drawer) and local component state (fetch lifecycle), the URL-sync approach, and the visual/interaction design — monospace tabular numerals for financial data, the accuracy/ROI color thresholds, and the mobile card layout — because these required judgment calls specific to what this product needed to communicate (trust signals for a credibility-tracking tool).
- **Why:** the goal was to spend the limited time budget on the decisions that shape how trustworthy and legible the product feels, not on re-deriving generic UI primitives.

## One thing I'd improve with 4 more hours

Add proper keyboard row navigation (arrow keys to move focus between leaderboard rows, not just Enter/Escape), and swap the naive in-memory Binance polling for a shared interval-based price cache so multiple OPEN signals for the same symbol don't each fire their own fetch.
