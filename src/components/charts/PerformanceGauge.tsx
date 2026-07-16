"use client";

import { RadialBar, RadialBarChart, PolarAngleAxis, ResponsiveContainer } from "recharts";

export function PerformanceGauge({
  value,
  label,
  accentColor = "#3b82f6",
}: {
  value: number | null;
  label: string;
  accentColor?: string;
}) {
  const pct = value === null ? 0 : Math.max(0, Math.min(100, value));
  const data = [{ name: label, value: pct, fill: accentColor }];

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-36 w-36">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar dataKey="value" background={{ fill: "#e5e7eb" }} cornerRadius={8} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            {value === null ? "—" : `${Math.round(value)}%`}
          </span>
        </div>
      </div>
      <span className="mt-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300">{label}</span>
    </div>
  );
}
