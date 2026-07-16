"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RoundValuePoint } from "@/lib/aggregate";
import { EmptyChart } from "./StackedScoreBarChart";

export function RoundBarChart({
  data,
  title,
  color = "#3b82f6",
}: {
  data: RoundValuePoint[];
  title: string;
  color?: string;
}) {
  const width = Math.max(600, data.length * 30);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
      {data.length === 0 ? (
        <EmptyChart />
      ) : (
        <div className="overflow-x-auto">
          <div style={{ width, minWidth: "100%" }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-100 dark:stroke-gray-800" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-45} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
