"use client";

import type { PlayerRef } from "@/lib/types";
import { PlayerSelector } from "./PlayerSelector";
import { PerformanceGauge } from "@/components/charts/PerformanceGauge";
import { RoundBarChart } from "@/components/charts/RoundBarChart";
import type { RoundValuePoint } from "@/lib/aggregate";

export function PlayerPanel({
  players,
  selectedPlayerId,
  onSelectPlayer,
  gamesPlayed,
  avgScore,
  pctAtOrAboveLine,
  minutesByRound,
  marginByRound,
}: {
  players: PlayerRef[];
  selectedPlayerId: number | null;
  onSelectPlayer: (playerId: number) => void;
  gamesPlayed: number;
  avgScore: number | null;
  pctAtOrAboveLine: number | null;
  minutesByRound: RoundValuePoint[];
  marginByRound: RoundValuePoint[];
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <PlayerSelector players={players} selectedPlayerId={selectedPlayerId} onSelect={onSelectPlayer} />

      {selectedPlayerId === null ? (
        <div className="flex h-40 items-center justify-center text-sm text-gray-400">Select a player</div>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-center justify-around">
            <Stat label="Games Played" value={String(gamesPlayed)} />
            <Stat label="Avg Score" value={avgScore === null ? "—" : avgScore.toFixed(1)} />
          </div>
          <div className="flex justify-center">
            <PerformanceGauge value={pctAtOrAboveLine} label="% Games Clearing Line" />
          </div>
          <RoundBarChart data={minutesByRound} title="Minutes by Round" color="#3b82f6" />
          <RoundBarChart data={marginByRound} title="Margin by Round" color="#6366f1" />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold text-gray-900 dark:text-gray-50">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}
