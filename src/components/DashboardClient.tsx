"use client";

import { useMemo, useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useFilteredData } from "@/hooks/useFilteredData";
import type { Competition, FilterState, PlayerGameRow, PlayerRef, TeamRef } from "@/lib/types";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FilterBar } from "@/components/filters/FilterBar";
import { PlayerPanel } from "@/components/player/PlayerPanel";
import { OpponentPanel } from "@/components/opponent/OpponentPanel";
import { StackedScoreBarChart } from "@/components/charts/StackedScoreBarChart";

const EMPTY_GAMES: PlayerGameRow[] = [];
const EMPTY_MAP = new Map<number, PlayerGameRow[]>();
const EMPTY_PLAYERS: PlayerRef[] = [];
const EMPTY_TEAMS: TeamRef[] = [];

const FALLBACK_FILTERS: FilterState = {
  playerId: null,
  opponentTeamId: null,
  position: "Fullback",
  seasonRange: [2023, 2026],
  minsRange: [0, 80],
  timeSlot: "all",
  homeAway: "all",
  marginRange: [-80, 80],
  bookmakerLine: 35,
};

export function DashboardClient() {
  const dataState = useDashboardData();
  const [competition, setCompetition] = useState<Competition>("NRL");
  // Only user-driven overrides live in state; unset fields fall back to
  // dataset-derived defaults computed below, so no effect is needed to
  // "initialize" filters once the async data arrives.
  const [overrides, setOverrides] = useState<Partial<FilterState>>({});

  const ready = dataState.status === "ready";
  const games = ready ? dataState.data.games : EMPTY_GAMES;
  const gamesByPlayer = ready ? dataState.data.gamesByPlayer : EMPTY_MAP;
  const allPlayers = ready ? dataState.data.reference.players : EMPTY_PLAYERS;
  const allTeams = ready ? dataState.data.reference.teams : EMPTY_TEAMS;

  const defaultFilters: FilterState = useMemo(() => {
    if (!ready) return FALLBACK_FILTERS;
    const meta = dataState.data.reference.meta;
    return {
      playerId: null,
      opponentTeamId: null,
      position: meta.defaultPosition,
      seasonRange: [meta.seasons.min, meta.seasons.max],
      minsRange: [meta.minutesRange.min, meta.minutesRange.max],
      timeSlot: "all",
      homeAway: "all",
      marginRange: [meta.marginRange.min, meta.marginRange.max],
      bookmakerLine: meta.medianPerformanceScore,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const filters: FilterState = { ...defaultFilters, ...overrides };

  const playersInCompetition = useMemo(
    () => allPlayers.filter((p) => gamesByPlayer.get(p.playerId)?.some((r) => r.competition === competition)),
    [allPlayers, gamesByPlayer, competition]
  );
  const teamsInCompetition = useMemo(
    () => allTeams.filter((t) => t.competition === competition),
    [allTeams, competition]
  );

  const { player, opponent } = useFilteredData(games, filters, competition);

  function handleFiltersChange(patch: Partial<FilterState>) {
    setOverrides((o) => ({ ...o, ...patch }));
  }

  function handleCompetitionChange(next: Competition) {
    setCompetition(next);
    const playerValid =
      filters.playerId !== null && gamesByPlayer.get(filters.playerId)?.some((r) => r.competition === next);
    const opponentValid =
      filters.opponentTeamId !== null &&
      allTeams.some((t) => t.teamId === filters.opponentTeamId && t.competition === next);
    setOverrides((o) => ({
      ...o,
      playerId: playerValid ? filters.playerId : null,
      opponentTeamId: opponentValid ? filters.opponentTeamId : null,
    }));
  }

  if (dataState.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">Loading data…</div>
    );
  }

  if (dataState.status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-600">
        Failed to load dashboard data: {dataState.message}
      </div>
    );
  }

  const meta = dataState.data.reference.meta;
  const selectedOpponentTeam = teamsInCompetition.find((t) => t.teamId === filters.opponentTeamId) ?? null;

  return (
    <DashboardLayout
      filters={
        <FilterBar
          competition={competition}
          onCompetitionChange={handleCompetitionChange}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          teams={teamsInCompetition}
          meta={meta}
        />
      }
      panels={
        <>
          <PlayerPanel
            players={playersInCompetition}
            selectedPlayerId={filters.playerId}
            onSelectPlayer={(playerId) => handleFiltersChange({ playerId })}
            gamesPlayed={player.gamesPlayed}
            avgScore={player.avgScore}
            pctAtOrAboveLine={player.pctAtOrAboveLine}
            minutesByRound={player.minutesByRound}
            marginByRound={player.marginByRound}
          />
          <OpponentPanel
            opponent={selectedOpponentTeam}
            gamesPlayed={opponent.gamesPlayed}
            avgScoreConceded={opponent.avgScoreConceded}
            pctAtOrAboveLine={opponent.pctAtOrAboveLine}
            marginByRound={opponent.marginByRound}
          />
        </>
      }
      charts={
        <>
          <StackedScoreBarChart data={player.stackedScoreByRound} title="Player Performance Score Breakdown" />
          <StackedScoreBarChart
            data={opponent.stackedScoreByRound}
            title={`Opponent Conceded Score Breakdown vs ${filters.position}`}
          />
        </>
      }
    />
  );
}
