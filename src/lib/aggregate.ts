import type { PlayerGameRow, Position, TimeSlot } from "./types";

export function sortByRound(rows: PlayerGameRow[]): PlayerGameRow[] {
  return [...rows].sort((a, b) => a.season * 100 + a.round - (b.season * 100 + b.round));
}

export function roundLabel(row: PlayerGameRow): string {
  return `R${row.round} '${String(row.season).slice(-2)}`;
}

/** Fuller "RD{round} '{yy}" form used in tooltips, where there's room to spell it out. */
export function fixtureRoundLabel(row: PlayerGameRow): string {
  return `RD${row.round} '${String(row.season).slice(-2)}`;
}

export function gamesPlayed(rows: PlayerGameRow[]): number {
  return rows.length;
}

function average(rows: PlayerGameRow[], valueFn: (row: PlayerGameRow) => number): number | null {
  if (rows.length === 0) return null;
  return rows.reduce((sum, r) => sum + valueFn(r), 0) / rows.length;
}

export function avgPerformanceScore(rows: PlayerGameRow[]): number | null {
  return average(rows, (r) => r.performanceScore);
}

export function avgMinutes(rows: PlayerGameRow[]): number | null {
  return average(rows, (r) => r.minsPlayed);
}

export function avgMargin(rows: PlayerGameRow[]): number | null {
  return average(rows, (r) => r.margin);
}

export function pctAtOrAboveLine(rows: PlayerGameRow[], line: number): number | null {
  if (rows.length === 0) return null;
  const hits = rows.filter((r) => r.performanceScore >= line).length;
  return (hits / rows.length) * 100;
}

export interface StackedScorePoint {
  key: string;
  label: string;
  fixtureLabel: string;
  base: number;
  attack: number;
  playerId: number;
  teamId: number;
  oppositionTeamId: number;
  homeTeam: boolean;
  timeSlot: TimeSlot;
  teamScore: number;
  oppositionScore: number;
  minsPlayed: number;
}

export function toStackedScoreSeries(rows: PlayerGameRow[]): StackedScorePoint[] {
  return sortByRound(rows).map((r) => ({
    key: `${r.matchId}-${r.playerId}`,
    label: roundLabel(r),
    fixtureLabel: fixtureRoundLabel(r),
    base: r.baseScore,
    attack: r.attackScore,
    playerId: r.playerId,
    teamId: r.teamId,
    oppositionTeamId: r.oppositionTeamId,
    homeTeam: r.homeTeam,
    timeSlot: r.timeSlot,
    teamScore: r.teamScore,
    oppositionScore: r.oppositionScore,
    minsPlayed: r.minsPlayed,
  }));
}

/** Positions actually played across the given rows, most-frequent first. */
export function positionsPlayed(rows: PlayerGameRow[]): Position[] {
  const counts = new Map<Position, number>();
  for (const r of rows) {
    counts.set(r.position, (counts.get(r.position) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([pos]) => pos);
}

export interface RangeBounds {
  seasons: { min: number; max: number };
  minutes: { min: number; max: number };
  margin: { min: number; max: number };
}

/** Season/minutes/margin bounds actually present in the given rows (e.g. a single player's career). */
export function computeRangeBounds(rows: PlayerGameRow[]): RangeBounds | null {
  if (rows.length === 0) return null;
  const seasons = rows.map((r) => r.season);
  const mins = rows.map((r) => r.minsPlayed);
  const margins = rows.map((r) => r.margin);
  return {
    seasons: { min: Math.min(...seasons), max: Math.max(...seasons) },
    minutes: { min: Math.min(...mins), max: Math.max(...mins) },
    margin: { min: Math.min(...margins), max: Math.max(...margins) },
  };
}

/** Clamp a [lo, hi] range so it stays within [min, max] bounds. */
export function clampRange(range: [number, number], bounds: { min: number; max: number }): [number, number] {
  const lo = Math.min(Math.max(range[0], bounds.min), bounds.max);
  const hi = Math.max(Math.min(range[1], bounds.max), bounds.min);
  return [Math.min(lo, hi), Math.max(lo, hi)];
}
