import type { Position, TimeSlot } from "./types";

export const POSITIONS: Position[] = [
  "Fullback",
  "Winger",
  "Centre",
  "Five-Eighth",
  "Halfback",
  "Hooker",
  "Prop",
  "2nd Row",
  "Lock",
  "Interchange",
  "Replacement",
  "Reserve",
];

export const TIME_SLOTS: { value: TimeSlot; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "night", label: "Night" },
  { value: "twilight", label: "Twilight" },
];

export const TIME_SLOT_TOOLTIP =
  "Based on kickoff time — Day: before 4:05pm. Twilight: 4:05pm–7:00pm. Night: after 7:00pm.";

export const BASE_SCORE_COLOR = "#3b82f6"; // blue
// Spec calls this "white" — literal white with a visible stroke so the segment
// doesn't disappear against a light page background (see StackedScoreBarChart).
export const ATTACK_SCORE_COLOR = "#ffffff";
export const ATTACK_SCORE_STROKE = "#94a3b8";

// Teal base for the opponent side, mirroring the player side's blue base.
// Attack stays white on both sides (easier to read) — only the stroke picks
// up the teal accent so the two charts still read as a matched pair.
export const OPPONENT_BASE_SCORE_COLOR = "#0d9488"; // teal-600
export const OPPONENT_ATTACK_SCORE_COLOR = "#ffffff";
export const OPPONENT_ATTACK_SCORE_STROKE = "#2dd4bf"; // teal-400

export const REFERENCE_DATA_URL = "/data/reference.json";
export const GAMES_DATA_URL = "/data/player-games.json";

/** Player-vs-opponent card theming shared across chart components. */
export type ChartVariant = "player" | "opponent";

export const VARIANT_CARD_CLASSES: Record<ChartVariant, string> = {
  player: "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900",
  opponent: "border-teal-300 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/40",
};

export const VARIANT_TITLE_CLASSES: Record<ChartVariant, string> = {
  player: "text-gray-800 dark:text-gray-100",
  opponent: "text-teal-800 dark:text-teal-200",
};

export const VARIANT_LEGEND_CLASSES: Record<ChartVariant, string> = {
  player: "text-gray-600 dark:text-gray-300",
  opponent: "text-teal-700 dark:text-teal-300",
};

export const VARIANT_ACCENT_COLOR: Record<ChartVariant, string> = {
  player: BASE_SCORE_COLOR,
  opponent: OPPONENT_BASE_SCORE_COLOR,
};

export const BOOKMAKER_LINE_COLOR = "#f59e0b"; // amber-500

/**
 * Clearance-rate gauge coloring. Thresholds are anchored to typical bookmaker
 * breakeven probability (e.g. $1.87 odds ≈ 53.5% breakeven): comfortably above
 * that is green, marginal is blue, below breakeven is red.
 */
export function gaugeColor(value: number | null): string {
  if (value === null) return "#9ca3af"; // gray-400, no data
  if (value > 55) return "#22c55e"; // green-500
  if (value >= 50) return "#3b82f6"; // blue-500
  return "#ef4444"; // red-500
}

const POSITION_PLURAL_OVERRIDES: Partial<Record<Position, string>> = {
  "2nd Row": "2nd Rowers",
  Interchange: "Interchange Players",
};

/** "Fullback" -> "Fullbacks", with a few irregular overrides. */
export function pluralizePosition(position: Position): string {
  return POSITION_PLURAL_OVERRIDES[position] ?? `${position}s`;
}
