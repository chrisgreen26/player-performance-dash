"use client";

import { useMemo } from "react";
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { gaussianKDE, percentile } from "@/lib/kde";
import {
  BOOKMAKER_LINE_COLOR,
  type ChartVariant,
  VARIANT_ACCENT_COLOR,
  VARIANT_CARD_CLASSES,
  VARIANT_TITLE_CLASSES,
} from "@/lib/constants";

export function ScoreDistributionChart({
  scores,
  bookmakerLine,
  variant,
  title,
}: {
  scores: number[];
  bookmakerLine: number;
  variant: ChartVariant;
  title: string;
}) {
  const accent = VARIANT_ACCENT_COLOR[variant];

  const kde = useMemo(() => gaussianKDE(scores, 48), [scores]);
  const p75 = useMemo(() => (scores.length > 0 ? percentile(scores, 75) : null), [scores]);

  return (
    <div className={`flex flex-col rounded-xl border p-3 ${VARIANT_CARD_CLASSES[variant]}`}>
      <div className="mb-1 flex items-center justify-between">
        <h3 className={`text-xs font-semibold ${VARIANT_TITLE_CLASSES[variant]}`}>{title}</h3>
        {kde && p75 !== null && (
          <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
              P75: {Math.round(p75)}
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-0.5 w-3" style={{ backgroundColor: BOOKMAKER_LINE_COLOR }} />
              Line: {bookmakerLine}
            </span>
          </div>
        )}
      </div>
      {!kde || p75 === null ? (
        <div className="flex h-[90px] items-center justify-center text-xs text-gray-400">
          Not enough games for a distribution.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={90}>
          <AreaChart data={kde} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <XAxis
              dataKey="x"
              type="number"
              domain={["dataMin", "dataMax"]}
              tick={{ fontSize: 10 }}
              tickCount={6}
              tickFormatter={(v: number) => Math.round(v).toString()}
            />
            <YAxis hide domain={[0, "dataMax"]} />
            <ReferenceLine x={p75} stroke={accent} strokeWidth={1.5} />
            <ReferenceLine x={bookmakerLine} stroke={BOOKMAKER_LINE_COLOR} strokeDasharray="4 3" strokeWidth={1.5} />
            <Area
              type="monotone"
              dataKey="y"
              stroke={accent}
              strokeWidth={1.5}
              fill={accent}
              fillOpacity={0.15}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
