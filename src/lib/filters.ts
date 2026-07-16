import type { Competition, FilterState, PlayerGameRow } from "./types";

/**
 * Shared predicate applied identically to both the player side and the
 * opponent side, so the two are apples-to-apples. Does NOT check
 * `oppositionTeamId` — that's applied separately, only for the opponent panel.
 */
export function matchesGlobalFilters(
  row: PlayerGameRow,
  filters: FilterState,
  competition: Competition
): boolean {
  if (row.competition !== competition) return false;
  if (row.season < filters.seasonRange[0] || row.season > filters.seasonRange[1]) return false;
  if (row.minsPlayed < filters.minsRange[0] || row.minsPlayed > filters.minsRange[1]) return false;
  if (filters.timeSlot !== "all" && row.timeSlot !== filters.timeSlot) return false;
  if (filters.homeAway === "home" && !row.homeTeam) return false;
  if (filters.homeAway === "away" && row.homeTeam) return false;
  if (row.margin < filters.marginRange[0] || row.margin > filters.marginRange[1]) return false;
  if (row.position !== filters.position) return false;
  return true;
}

export function getPlayerPanelRows(
  allRows: PlayerGameRow[],
  filters: FilterState,
  competition: Competition
): PlayerGameRow[] {
  if (filters.playerId === null) return [];
  return allRows.filter(
    (r) => r.playerId === filters.playerId && matchesGlobalFilters(r, filters, competition)
  );
}

export function getOpponentPanelRows(
  allRows: PlayerGameRow[],
  filters: FilterState,
  competition: Competition
): PlayerGameRow[] {
  if (filters.opponentTeamId === null) return [];
  return allRows.filter(
    (r) => r.oppositionTeamId === filters.opponentTeamId && matchesGlobalFilters(r, filters, competition)
  );
}
