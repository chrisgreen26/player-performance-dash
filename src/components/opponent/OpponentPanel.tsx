"use client";

import { PerformanceGauge } from "@/components/charts/PerformanceGauge";
import { RoundBarChart } from "@/components/charts/RoundBarChart";
import type { RoundValuePoint } from "@/lib/aggregate";
import type { TeamRef } from "@/lib/types";

export function OpponentPanel({
  opponent,
  gamesPlayed,
  avgScoreConceded,
  pctAtOrAboveLine,
  marginByRound,
}: {
  opponent: TeamRef | null;
  gamesPlayed: number;
  avgScoreConceded: number | null;
  pctAtOrAboveLine: number | null;
  marginByRound: RoundValuePoint[];
}) {
  return (
    <div className="rounded-xl border border-teal-300 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-950/40">
      <h2 className="text-sm font-semibold text-teal-800 dark:text-teal-200">
        {opponent ? `${opponent.teamName} (Conceded vs Position)` : "Opponent"}
      </h2>

      {opponent === null ? (
        <div className="flex h-40 items-center justify-center text-sm text-teal-700/60 dark:text-teal-300/60">
          Select an opponent
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-center justify-around">
            <Stat label="Games" value={String(gamesPlayed)} />
            <Stat label="Avg Score Conceded" value={avgScoreConceded === null ? "—" : avgScoreConceded.toFixed(1)} />
          </div>
          <div className="flex justify-center">
            <PerformanceGauge value={pctAtOrAboveLine} label="% Games Conceding Line" accentColor="#0d9488" />
          </div>
          <RoundBarChart data={marginByRound} title="Opponent Margin by Round" color="#0d9488" />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold text-teal-900 dark:text-teal-100">{value}</div>
      <div className="text-xs text-teal-700 dark:text-teal-300">{label}</div>
    </div>
  );
}
