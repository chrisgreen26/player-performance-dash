export type Position =
  | "2nd Row"
  | "Centre"
  | "Five-Eighth"
  | "Fullback"
  | "Halfback"
  | "Hooker"
  | "Interchange"
  | "Lock"
  | "Prop"
  | "Replacement"
  | "Reserve"
  | "Winger";

export type TimeSlot = "day" | "night" | "twilight";

export type Competition = "NRL" | "NRLW";

export interface PlayerGameRow {
  playerId: number;
  teamId: number;
  oppositionTeamId: number;
  competition: Competition;
  season: number;
  round: number;
  matchId: number;
  matchDate: string; // 'YYYY-MM-DD'
  timeSlot: TimeSlot;
  homeTeam: boolean;
  margin: number;
  teamScore: number;
  oppositionScore: number;
  position: Position;
  minsPlayed: number;
  performanceScore: number;
  baseScore: number;
  attackScore: number;
}

export interface PlayerRef {
  playerId: number;
  fullName: string;
  headImg: string | null;
  /**
   * UI default only — pre-selects a sensible Position toggle when this player is picked.
   * Never used for actual filtering; all filtering goes through matchesGlobalFilters
   * against each row's own `position`.
   */
  primaryPosition: Position;
  /** This week's named opposition, from rl.lineups. Null if not currently listed. */
  defaultOpponentTeamId: number | null;
}

export interface TeamRef {
  teamId: number;
  teamName: string;
  teamShortName: string;
  teamAbb: string;
  competition: Competition;
}

export interface DatasetMeta {
  generatedAt: string;
  rowCount: number;
  seasons: { min: number; max: number };
  minutesRange: { min: number; max: number };
  marginRange: { min: number; max: number };
  defaultPosition: Position;
  medianPerformanceScore: number;
}

export interface ReferenceData {
  players: PlayerRef[];
  teams: TeamRef[];
  meta: DatasetMeta;
  /**
   * Full name lookup for every playerId appearing in player-games.json —
   * deliberately broader than `players` (which is scoped to rl.lineups),
   * so tooltips can name whoever posted a given opponent-conceded score
   * even if that player isn't in the current teamlists.
   */
  playerNames: Record<number, string>;
}

export interface FilterState {
  playerId: number | null;
  opponentTeamId: number | null; // drives Opponent panel ONLY, never the Player panel
  position: Position; // required, always set
  seasonRange: [number, number];
  minsRange: [number, number];
  timeSlot: TimeSlot | "all";
  homeAway: "all" | "home" | "away";
  marginRange: [number, number];
  bookmakerLine: number;
}
