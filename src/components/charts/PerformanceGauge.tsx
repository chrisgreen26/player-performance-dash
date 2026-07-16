"use client";

import { RadialBar, RadialBarChart, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { gaugeColor } from "@/lib/constants";

export function PerformanceGauge({
  value,
  label,
  size = 144,
}: {
  value: number | null;
  label: string;
  /** Diameter in pixels. Defaults to 144 (h-36 w-36); pass a smaller value for compact layouts. */
  size?: number;
}) {
  const pct = value === null ? 0 : Math.max(0, Math.min(100, value));
  const color = gaugeColor(value);
  const data = [{ name: label, value: pct, fill: color }];
  const fontSizeClass = size < 120 ? "text-lg" : "text-2xl";

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar dataKey="value" background={{ fill: "#e5e7eb" }} cornerRadius={8} isAnimationActive={false} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${fontSizeClass} font-bold text-gray-900 dark:text-gray-50`}>
            {value === null ? "—" : `${Math.round(value)}%`}
          </span>
        </div>
      </div>
      <span className="mt-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300">{label}</span>
    </div>
  );
}
