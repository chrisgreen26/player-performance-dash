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
  "Day, Night, and Twilight reflect the scheduled kickoff window for each match.";

export const BASE_SCORE_COLOR = "#3b82f6"; // blue
// Spec calls this "white" — literal white with a visible stroke so the segment
// doesn't disappear against a light page background (see StackedScoreBarChart).
export const ATTACK_SCORE_COLOR = "#ffffff";
export const ATTACK_SCORE_STROKE = "#94a3b8";

export const REFERENCE_DATA_URL = "/data/reference.json";
export const GAMES_DATA_URL = "/data/player-games.json";
