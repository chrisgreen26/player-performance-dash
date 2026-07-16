"use client";

import { useMemo } from "react";
import type { Competition, FilterState, PlayerGameRow } from "@/lib/types";
import { getOpponentPanelRows, getPlayerPanelRows } from "@/lib/filters";
import {
  avgPerformanceScore,
  gamesPlayed,
  pctAtOrAboveLine,
  toRoundValueSeries,
  toStackedScoreSeries,
} from "@/lib/aggregate";

export function useFilteredData(
  games: PlayerGameRow[],
  filters: FilterState,
  competition: Competition
) {
  const playerRows = useMemo(
    () => getPlayerPanelRows(games, filters, competition),
    [games, filters, competition]
  );
  const opponentRows = useMemo(
    () => getOpponentPanelRows(games, filters, competition),
    [games, filters, competition]
  );

  const player = useMemo(
    () => ({
      rows: playerRows,
      gamesPlayed: gamesPlayed(playerRows),
      avgScore: avgPerformanceScore(playerRows),
      pctAtOrAboveLine: pctAtOrAboveLine(playerRows, filters.bookmakerLine),
      minutesByRound: toRoundValueSeries(playerRows, (r) => r.minsPlayed),
      marginByRound: toRoundValueSeries(playerRows, (r) => r.margin),
      stackedScoreByRound: toStackedScoreSeries(playerRows),
    }),
    [playerRows, filters.bookmakerLine]
  );

  const opponent = useMemo(
    () => ({
      rows: opponentRows,
      gamesPlayed: gamesPlayed(opponentRows),
      avgScoreConceded: avgPerformanceScore(opponentRows),
      pctAtOrAboveLine: pctAtOrAboveLine(opponentRows, filters.bookmakerLine),
      marginByRound: toRoundValueSeries(opponentRows, (r) => r.margin),
      stackedScoreByRound: toStackedScoreSeries(opponentRows),
    }),
    [opponentRows, filters.bookmakerLine]
  );

  return { player, opponent };
}
