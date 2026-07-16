"use client";

import type { PlayerRef } from "@/lib/types";
import { PerformanceGauge } from "@/components/charts/PerformanceGauge";

export function PlayerPanel({
  player,
  gamesPlayed,
  avgScore,
  avgMinutes,
  avgMargin,
  pctAtOrAboveLine,
}: {
  player: PlayerRef | null;
  gamesPlayed: number;
  avgScore: number | null;
  avgMinutes: number | null;
  avgMargin: number | null;
  pctAtOrAboveLine: number | null;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      {player === null ? (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-400">Select a player above</div>
      ) : (
        <div className="flex flex-1 flex-col justify-between gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Games Played" value={String(gamesPlayed)} />
            <Stat label="Avg Score" value={avgScore === null ? "—" : avgScore.toFixed(1)} />
          </div>
          <div className="flex justify-center">
            <PerformanceGauge value={pctAtOrAboveLine} label="% Games Clearing Line" size={124} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Avg Minutes" value={avgMinutes === null ? "—" : avgMinutes.toFixed(0)} />
            <Stat label="Avg Margin" value={avgMargin === null ? "—" : avgMargin.toFixed(1)} />
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-3 text-center dark:bg-gray-800/50">
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}
