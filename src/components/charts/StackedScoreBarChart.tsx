"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { StackedScorePoint } from "@/lib/aggregate";
import { ATTACK_SCORE_COLOR, ATTACK_SCORE_STROKE, BASE_SCORE_COLOR } from "@/lib/constants";

export function StackedScoreBarChart({ data, title }: { data: StackedScorePoint[]; title: string }) {
  const width = Math.max(600, data.length * 36);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
      {data.length === 0 ? (
        <EmptyChart />
      ) : (
        <div className="overflow-x-auto">
          <div style={{ width, minWidth: "100%" }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-100 dark:stroke-gray-800" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-45} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="base" name="Base" stackId="score" fill={BASE_SCORE_COLOR} />
                <Bar
                  dataKey="attack"
                  name="Attack"
                  stackId="score"
                  fill={ATTACK_SCORE_COLOR}
                  stroke={ATTACK_SCORE_STROKE}
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export function EmptyChart() {
  return (
    <div className="flex h-56 items-center justify-center text-sm text-gray-400">
      No games match the current filters.
    </div>
  );
}
