"use client";

import { useMemo, useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useFilteredData } from "@/hooks/useFilteredData";
import type { Competition, DatasetMeta, FilterState, PlayerGameRow, PlayerRef, TeamRef } from "@/lib/types";
import { computeRangeBounds, positionsPlayed, type RangeBounds } from "@/lib/aggregate";
import { pluralizePosition, POSITIONS } from "@/lib/constants";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardSection } from "@/components/layout/DashboardSection";
import { PositionSelect } from "@/components/filters/PositionSelect";
import { OpponentSelect } from "@/components/filters/OpponentSelect";
import { BookmakerLineInput } from "@/components/filters/BookmakerLineInput";
import { FiltersMenu } from "@/components/filters/FiltersMenu";
import { PlayerSelector } from "@/components/player/PlayerSelector";
import { PlayerPanel } from "@/components/player/PlayerPanel";
import { OpponentPanel } from "@/components/opponent/OpponentPanel";
import { StackedScoreBarChart } from "@/components/charts/StackedScoreBarChart";
import { ScoreDistributionChart } from "@/components/charts/ScoreDistributionChart";

const EMPTY_GAMES: PlayerGameRow[] = [];
const EMPTY_MAP = new Map<number, PlayerGameRow[]>();
const EMPTY_PLAYERS: PlayerRef[] = [];
const EMPTY_TEAMS: TeamRef[] = [];
const EMPTY_PLAYER_NAMES: Record<number, string> = {};
const DEFAULT_COMPETITION: Competition = "NRL";

const FALLBACK_META: DatasetMeta = {
  generatedAt: "",
  rowCount: 0,
  seasons: { min: 2023, max: 2026 },
  minutesRange: { min: 0, max: 80 },
  marginRange: { min: -80, max: 80 },
  defaultPosition: "Fullback",
  medianPerformanceScore: 35,
};

export function DashboardClient() {
  const dataState = useDashboardData();
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Only user-driven overrides live in state; unset fields fall back to
  // dataset-derived defaults computed below, so no effect is needed to
  // "initialize" filters once the async data arrives.
  const [overrides, setOverrides] = useState<Partial<FilterState>>({});

  const ready = dataState.status === "ready";
  const games = ready ? dataState.data.games : EMPTY_GAMES;
  const gamesByPlayer = ready ? dataState.data.gamesByPlayer : EMPTY_MAP;
  const allPlayers = ready ? dataState.data.reference.players : EMPTY_PLAYERS;
  const allTeams = ready ? dataState.data.reference.teams : EMPTY_TEAMS;
  const meta = ready ? dataState.data.reference.meta : FALLBACK_META;
  const playerNames = ready ? dataState.data.reference.playerNames : EMPTY_PLAYER_NAMES;

  const defaultFilters: FilterState = useMemo(
    () => ({
      playerId: null,
      opponentTeamId: null,
      position: meta.defaultPosition,
      seasonRange: [meta.seasons.min, meta.seasons.max],
      minsRange: [meta.minutesRange.min, meta.minutesRange.max],
      timeSlot: "all",
      homeAway: "all",
      marginRange: [meta.marginRange.min, meta.marginRange.max],
      bookmakerLine: meta.medianPerformanceScore,
    }),
    [meta]
  );

  const filters: FilterState = { ...defaultFilters, ...overrides };

  // No visible NRL/NRLW toggle — competition is derived from whichever
  // player is selected (a player only ever appears in one competition),
  // defaulting to NRL when no player is picked yet.
  const competition: Competition = useMemo(() => {
    if (filters.playerId !== null) {
      const rows = gamesByPlayer.get(filters.playerId);
      if (rows && rows.length > 0) return rows[0].competition;
    }
    return DEFAULT_COMPETITION;
  }, [filters.playerId, gamesByPlayer]);

  const teamsInCompetition = useMemo(
    () => allTeams.filter((t) => t.competition === competition),
    [allTeams, competition]
  );
  const teamAbbById = useMemo(() => new Map(allTeams.map((t) => [t.teamId, t.teamAbb])), [allTeams]);

  // Position options narrow to what the selected player has actually played
  // (in their competition) — no point offering "Prop" for a halfback.
  const availablePositions = useMemo(() => {
    if (filters.playerId === null) return POSITIONS;
    const rows = gamesByPlayer.get(filters.playerId) ?? [];
    const played = positionsPlayed(rows);
    return played.length > 0 ? played : POSITIONS;
  }, [filters.playerId, gamesByPlayer]);

  // Season/minutes/margin slider bounds narrow to the selected player's own
  // career span — no point showing a 2023 floor for someone who debuted in 2025.
  const activeBounds: RangeBounds = useMemo(() => {
    if (filters.playerId !== null) {
      const rows = gamesByPlayer.get(filters.playerId) ?? [];
      const playerBounds = computeRangeBounds(rows);
      if (playerBounds) return playerBounds;
    }
    return { seasons: meta.seasons, minutes: meta.minutesRange, margin: meta.marginRange };
  }, [filters.playerId, gamesByPlayer, meta]);

  const { player, opponent } = useFilteredData(games, filters, competition);

  function handleFiltersChange(patch: Partial<FilterState>) {
    setOverrides((o) => ({ ...o, ...patch }));
  }

  // Switching players resets every filter back to that player's own defaults
  // rather than carrying the previous player's selections over — stats
  // scoped to the wrong opponent/season/time-slot are easy to misread as
  // this player's real numbers, so a clean slate per player is safer.
  // Bookmaker line is preserved: it's a manual comparison threshold, not a
  // filter, and staying fixed while browsing players is the whole point of it.
  function handleSelectPlayer(playerId: number) {
    const rows = gamesByPlayer.get(playerId) ?? [];
    const topPosition = positionsPlayed(rows)[0] ?? defaultFilters.position;
    const bounds = computeRangeBounds(rows);
    // Pre-fill the Opponent panel with this week's named opposition
    // (rl.lineups), when the player is currently rostered and that team is
    // one we recognize — otherwise leave it for the user to pick.
    const player = allPlayers.find((p) => p.playerId === playerId);
    const lineupOpponent = player?.defaultOpponentTeamId ?? null;
    const opponentTeamId =
      lineupOpponent !== null && allTeams.some((t) => t.teamId === lineupOpponent) ? lineupOpponent : null;
    setOverrides((o) => ({
      playerId,
      position: topPosition,
      opponentTeamId,
      timeSlot: "all",
      homeAway: "all",
      ...(bounds && {
        seasonRange: [bounds.seasons.min, bounds.seasons.max] as [number, number],
        minsRange: [bounds.minutes.min, bounds.minutes.max] as [number, number],
        marginRange: [bounds.margin.min, bounds.margin.max] as [number, number],
      }),
      ...(o.bookmakerLine !== undefined && { bookmakerLine: o.bookmakerLine }),
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

  const selectedOpponentTeam = teamsInCompetition.find((t) => t.teamId === filters.opponentTeamId) ?? null;
  const selectedPlayer = allPlayers.find((p) => p.playerId === filters.playerId) ?? null;
  const hasPlayer = filters.playerId !== null;

  return (
    <DashboardLayout
      controls={
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-72">
            <PlayerSelector players={allPlayers} selectedPlayerId={filters.playerId} onSelect={handleSelectPlayer} />
          </div>
          {hasPlayer && (
            <PositionSelect
              options={availablePositions}
              value={filters.position}
              onChange={(position) => handleFiltersChange({ position })}
            />
          )}
          <OpponentSelect
            teams={teamsInCompetition}
            value={filters.opponentTeamId}
            onChange={(opponentTeamId) => handleFiltersChange({ opponentTeamId })}
          />
          <BookmakerLineInput
            value={filters.bookmakerLine}
            onChange={(bookmakerLine) => handleFiltersChange({ bookmakerLine })}
          />
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Filters {filtersOpen ? "▴" : "▾"}
          </button>
        </div>
      }
      filtersPanel={
        filtersOpen ? (
          <FiltersMenu filters={filters} onFiltersChange={handleFiltersChange} bounds={activeBounds} />
        ) : null
      }
    >
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ScoreDistributionChart
          scores={player.rows.map((r) => r.performanceScore)}
          bookmakerLine={filters.bookmakerLine}
          variant="player"
          title="Score Distribution"
        />
        <ScoreDistributionChart
          scores={opponent.rows.map((r) => r.performanceScore)}
          bookmakerLine={filters.bookmakerLine}
          variant="opponent"
          title="Conceded Distribution"
        />
      </section>
      <DashboardSection
        panel={
          <PlayerPanel
            player={selectedPlayer}
            gamesPlayed={player.gamesPlayed}
            avgScore={player.avgScore}
            avgMinutes={player.avgMinutes}
            avgMargin={player.avgMargin}
            pctAtOrAboveLine={player.pctAtOrAboveLine}
          />
        }
        chart={
          <StackedScoreBarChart
            data={player.stackedScoreByRound}
            title="Player Performance Score Breakdown"
            teamAbbById={teamAbbById}
            bookmakerLine={filters.bookmakerLine}
            emptyMessage={
              filters.playerId === null
                ? "Select a player above to see their score breakdown."
                : "No games match the current filters."
            }
          />
        }
      />
      <DashboardSection
        panel={
          <OpponentPanel
            opponent={selectedOpponentTeam}
            position={filters.position}
            gamesPlayed={opponent.gamesPlayed}
            avgScoreConceded={opponent.avgScoreConceded}
            avgMinutes={opponent.avgMinutes}
            avgMargin={opponent.avgMargin}
            pctAtOrAboveLine={opponent.pctAtOrAboveLine}
          />
        }
        chart={
          <StackedScoreBarChart
            data={opponent.stackedScoreByRound}
            title={`${selectedOpponentTeam?.teamShortName ?? "Opponent"} Conceded v ${pluralizePosition(filters.position)}`}
            teamAbbById={teamAbbById}
            playerNames={playerNames}
            variant="opponent"
            bookmakerLine={filters.bookmakerLine}
            emptyMessage={
              filters.opponentTeamId === null
                ? "Select an opponent to see their conceded score breakdown."
                : "No games match the current filters."
            }
          />
        }
      />
    </DashboardLayout>
  );
}
