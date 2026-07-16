import type { PlayerGameRow } from "./types";

export function sortByRound(rows: PlayerGameRow[]): PlayerGameRow[] {
  return [...rows].sort((a, b) => a.season * 100 + a.round - (b.season * 100 + b.round));
}

export function roundLabel(row: PlayerGameRow): string {
  return `R${row.round} '${String(row.season).slice(-2)}`;
}

export function gamesPlayed(rows: PlayerGameRow[]): number {
  return rows.length;
}

export function avgPerformanceScore(rows: PlayerGameRow[]): number | null {
  if (rows.length === 0) return null;
  return rows.reduce((sum, r) => sum + r.performanceScore, 0) / rows.length;
}

export function pctAtOrAboveLine(rows: PlayerGameRow[], line: number): number | null {
  if (rows.length === 0) return null;
  const hits = rows.filter((r) => r.performanceScore >= line).length;
  return (hits / rows.length) * 100;
}

export interface RoundValuePoint {
  key: string;
  label: string;
  value: number;
}

export function toRoundValueSeries(
  rows: PlayerGameRow[],
  valueFn: (row: PlayerGameRow) => number
): RoundValuePoint[] {
  return sortByRound(rows).map((r) => ({
    key: `${r.matchId}-${r.playerId}`,
    label: roundLabel(r),
    value: valueFn(r),
  }));
}

export interface StackedScorePoint {
  key: string;
  label: string;
  base: number;
  attack: number;
}

export function toStackedScoreSeries(rows: PlayerGameRow[]): StackedScorePoint[] {
  return sortByRound(rows).map((r) => ({
    key: `${r.matchId}-${r.playerId}`,
    label: roundLabel(r),
    base: r.baseScore,
    attack: r.attackScore,
  }));
}
