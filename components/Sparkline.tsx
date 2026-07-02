"use client";

import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

export function Sparkline({ values }: { values: number[] }) {
  if (!values || values.length < 2) {
    return <span className="text-xs text-base-500">—</span>;
  }
  const data = values.map((v, i) => ({ i, v }));
  const lastValue = values[values.length - 1] ?? 0;
  const firstValue = values[0] ?? 0;
  const trendUp = lastValue >= firstValue;
  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, bottom: 4, left: 0, right: 0 }}>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Line
            type="monotone"
            dataKey="v"
            stroke={trendUp ? "var(--color-signal-up)" : "var(--color-signal-down)"}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
