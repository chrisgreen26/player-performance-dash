"use client";

import { PerformanceGauge } from "@/components/charts/PerformanceGauge";
import { pluralizePosition } from "@/lib/constants";
import type { Position, TeamRef } from "@/lib/types";

export function OpponentPanel({
  opponent,
  position,
  gamesPlayed,
  avgScoreConceded,
  avgMinutes,
  avgMargin,
  pctAtOrAboveLine,
}: {
  opponent: TeamRef | null;
  position: Position;
  gamesPlayed: number;
  avgScoreConceded: number | null;
  avgMinutes: number | null;
  avgMargin: number | null;
  pctAtOrAboveLine: number | null;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-teal-300 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-950/40">
      {opponent === null ? (
        <div className="flex flex-1 items-center justify-center text-sm text-teal-700/60 dark:text-teal-300/60">
          Select an opponent above
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-between gap-4">
          <h2 className="text-center text-sm font-semibold text-teal-800 dark:text-teal-200">
            {opponent.teamShortName} vs {pluralizePosition(position)}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Games" value={String(gamesPlayed)} />
            <Stat label="Avg Score Conceded" value={avgScoreConceded === null ? "—" : avgScoreConceded.toFixed(1)} />
          </div>
          <div className="flex justify-center">
            <PerformanceGauge value={pctAtOrAboveLine} label="% Games Conceding Line" size={124} />
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
    <div className="rounded-lg bg-white/60 px-3 py-3 text-center dark:bg-teal-900/30">
      <div className="text-2xl font-bold text-teal-900 dark:text-teal-100">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-teal-700 dark:text-teal-300">{label}</div>
    </div>
  );
}
