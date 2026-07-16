/**
 * Local-only data export: Postgres (rl schema) -> static JSON consumed by the app.
 * Never runs on Vercel. Run weekly after scraping: `npm run export-data`.
 */
import { Client, types } from "pg";
import dotenv from "dotenv";
import { writeFileSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// pg returns BIGINT/NUMERIC as strings by default to avoid precision loss.
// Every bigint/numeric column we touch here fits comfortably in a JS number.
types.setTypeParser(20 /* int8 */, (v) => parseInt(v, 10));
types.setTypeParser(1700 /* numeric */, (v) => parseFloat(v));

const KNOWN_POSITIONS = new Set([
  "2nd Row", "Centre", "Five-Eighth", "Fullback", "Halfback",
  "Hooker", "Interchange", "Lock", "Prop", "Replacement", "Reserve", "Winger",
]);
const KNOWN_TIME_SLOTS = new Set(["day", "night", "twilight"]);
const SEASON_FLOOR = 2023;

type Competition = "NRL" | "NRLW";

interface PlayerGameRow {
  playerId: number;
  teamId: number;
  oppositionTeamId: number;
  competition: Competition;
  season: number;
  round: number;
  matchId: number;
  matchDate: string;
  timeSlot: string;
  homeTeam: boolean;
  margin: number;
  teamScore: number;
  oppositionScore: number;
  position: string;
  minsPlayed: number;
  performanceScore: number;
  baseScore: number;
  attackScore: number;
}

async function main() {
  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    options: process.env.PGOPTIONS,
  });
  await client.connect();

  console.log("=== Filter funnel (player_stats rows) ===");
  const funnel = await client.query(`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE LEFT(ps.team_log::text,1) IN ('1','6')) AS after_competition,
      COUNT(*) FILTER (WHERE LEFT(ps.team_log::text,1) IN ('1','6') AND ms.season >= $1) AS after_season,
      COUNT(*) FILTER (WHERE LEFT(ps.team_log::text,1) IN ('1','6') AND ms.season >= $1 AND ps.mins_played > 0) AS after_mins
    FROM rl.player_stats ps
    JOIN rl.team_stats ts ON ts.team_log = ps.team_log
    JOIN rl.match_stats ms ON ms.match_id = ts.match_id
  `, [SEASON_FLOOR]);
  const f = funnel.rows[0];
  console.log(`  total rows:                 ${f.total}`);
  console.log(`  after NRL+NRLW filter:      ${f.after_competition}`);
  console.log(`  after season>=${SEASON_FLOOR} filter:   ${f.after_season}`);
  console.log(`  after mins_played>0 filter: ${f.after_mins}  <- final row count`);

  console.log("\n=== Fetching player-game rows ===");
  const gamesResult = await client.query(`
    SELECT
      ps.playerid AS player_id,
      ts.team AS team_id,
      ts.opposition AS opposition_team_id,
      CASE WHEN LEFT(ps.team_log::text,1) = '1' THEN 'NRL' ELSE 'NRLW' END AS competition,
      ms.season,
      ms.match_round AS round,
      ms.match_id,
      ms.match_date::text AS match_date,
      ms.match_timeslot AS time_slot,
      ts.home_team,
      ts.margin,
      ts.score AS team_score,
      ps.position,
      ps.mins_played,
      ps.performance_score,
      ps.base_score,
      ps.attack_score
    FROM rl.player_stats ps
    JOIN rl.team_stats ts ON ts.team_log = ps.team_log
    JOIN rl.match_stats ms ON ms.match_id = ts.match_id
    WHERE LEFT(ps.team_log::text,1) IN ('1','6')
      AND ms.season >= $1
      AND ps.mins_played > 0
    ORDER BY ms.season, ms.match_round, ps.playerid
  `, [SEASON_FLOOR]);

  const games: PlayerGameRow[] = gamesResult.rows.map((r) => ({
    playerId: r.player_id,
    teamId: r.team_id,
    oppositionTeamId: r.opposition_team_id,
    competition: r.competition as Competition,
    season: r.season,
    round: r.round,
    matchId: r.match_id,
    matchDate: r.match_date,
    timeSlot: r.time_slot,
    homeTeam: r.home_team,
    margin: r.margin,
    teamScore: r.team_score,
    oppositionScore: r.team_score - r.margin,
    position: r.position,
    minsPlayed: r.mins_played,
    performanceScore: r.performance_score,
    baseScore: r.base_score,
    attackScore: r.attack_score,
  }));
  console.log(`  fetched ${games.length} rows`);

  // Sanity-check that live data still matches the assumptions this script encodes.
  const badPositions = new Set(games.filter((g) => !KNOWN_POSITIONS.has(g.position)).map((g) => g.position));
  if (badPositions.size > 0) {
    console.warn(`  WARNING: unexpected position value(s) found: ${[...badPositions].join(", ")}`);
  }
  const badTimeSlots = new Set(games.filter((g) => !KNOWN_TIME_SLOTS.has(g.timeSlot)).map((g) => g.timeSlot));
  if (badTimeSlots.size > 0) {
    console.warn(`  WARNING: unexpected match_timeslot value(s) found: ${[...badTimeSlots].join(", ")}`);
  }

  const nrlCount = games.filter((g) => g.competition === "NRL").length;
  const nrlwCount = games.filter((g) => g.competition === "NRLW").length;
  console.log(`  NRL rows: ${nrlCount}  NRLW rows: ${nrlwCount}`);

  // The player *selector* is scoped to rl.lineups — the current/most recent
  // named teamlists — rather than every player who's ever appeared in
  // player_stats. This keeps the dropdown to currently-relevant players
  // instead of 1,100+ historical names. player-games.json itself stays
  // un-scoped (full history for every player) since the Opponent side needs
  // the complete sample regardless of who's selectable in the dropdown.
  console.log("\n=== Fetching lineup-relevant player ids (rl.lineups) ===");
  const lineupsResult = await client.query(`SELECT DISTINCT playerid FROM rl.lineups`);
  const lineupPlayerIds: number[] = lineupsResult.rows.map((r) => r.playerid);
  console.log(`  ${lineupPlayerIds.length} distinct playerids in rl.lineups`);

  console.log("\n=== Fetching player reference data ===");
  const playersResult = await client.query(`
    SELECT playerid AS player_id, player_fullname AS full_name, head_img AS head_img
    FROM rl.players
    WHERE playerid = ANY($1::bigint[])
  `, [lineupPlayerIds]);
  console.log(`  ${playersResult.rows.length} distinct players (of ${lineupPlayerIds.length} lineup ids requested)`);
  const unmatchedLineupIds = lineupPlayerIds.length - playersResult.rows.length;
  if (unmatchedLineupIds > 0) {
    console.log(`  ${unmatchedLineupIds} lineup id(s) had no matching rl.players row (skipped — no name to show)`);
  }
  const malformedImgCount = playersResult.rows.filter((r) => r.head_img && /^https?:https?:/.test(r.head_img)).length;
  if (malformedImgCount > 0) {
    console.log(`  normalized ${malformedImgCount} malformed double-protocol head_img URL(s)`);
  }

  // primaryPosition = UI-default-only convenience field (mode of a player's positions).
  // Never used for actual filtering — see src/lib/types.ts.
  const positionCountsByPlayer = new Map<number, Map<string, number>>();
  for (const g of games) {
    if (!positionCountsByPlayer.has(g.playerId)) positionCountsByPlayer.set(g.playerId, new Map());
    const counts = positionCountsByPlayer.get(g.playerId)!;
    counts.set(g.position, (counts.get(g.position) ?? 0) + 1);
  }
  function modePosition(counts: Map<string, number> | undefined): string {
    if (!counts || counts.size === 0) return "Interchange";
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }
  const lineupPlayersWithNoHistory = playersResult.rows.filter((r) => !positionCountsByPlayer.has(r.player_id)).length;
  if (lineupPlayersWithNoHistory > 0) {
    console.log(`  ${lineupPlayersWithNoHistory} lineup player(s) have no game history in the exported window (likely debutants)`);
  }

  // Source data has a recurring double-protocol bug (e.g. "https:http://host/...")
  // affecting ~48% of head_img values — normalize to a single https:// scheme.
  //
  // Separately, club-website-hosted headshots (Sitecore CMS, e.g. contentassets/
  // SysSiteAssets paths on *.com.au club domains) only render correctly with a
  // preset=player-profile-small param appended — without it the image 404s/fails.
  // rugbyimages.statsperform.com (the majority host) doesn't need or use this.
  function normalizeImgUrl(url: string | null): string | null {
    if (!url) return null;
    let normalized = url.replace(/^https?:(?:https?:)?\/\//, "https://");
    if (!normalized.includes("statsperform.com") && !normalized.includes("preset=")) {
      normalized += (normalized.includes("?") ? "&" : "?") + "preset=player-profile-small";
    }
    return normalized;
  }

  const players = playersResult.rows.map((r) => ({
    playerId: r.player_id,
    fullName: r.full_name,
    headImg: normalizeImgUrl(r.head_img),
    primaryPosition: modePosition(positionCountsByPlayer.get(r.player_id)),
  }));

  console.log("\n=== Fetching team reference data (NRL + NRLW only) ===");
  const teamsResult = await client.query(`
    SELECT team_id, team_name, team_shortname, team_abb, comp_id
    FROM rl.teams_colours_logos
    WHERE comp_id IN (111, 161)
    ORDER BY team_name
  `);
  const teams = teamsResult.rows.map((r) => ({
    teamId: r.team_id,
    teamName: r.team_name,
    teamShortName: r.team_shortname,
    teamAbb: r.team_abb,
    competition: (r.comp_id === 111 ? "NRL" : "NRLW") as Competition,
  }));
  console.log(`  ${teams.length} teams (NRL: ${teams.filter((t) => t.competition === "NRL").length}, NRLW: ${teams.filter((t) => t.competition === "NRLW").length})`);

  console.log("\n=== Computing dataset meta ===");
  const seasons = games.map((g) => g.season);
  const mins = games.map((g) => g.minsPlayed);
  const margins = games.map((g) => g.margin);
  const scores = games.map((g) => g.performanceScore).sort((a, b) => a - b);
  const median = scores.length % 2 === 1
    ? scores[(scores.length - 1) / 2]
    : (scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2;

  // Default position for first page load: mode among REAL on-field positions only.
  // Interchange/Replacement/Reserve are bench designations, not positions — even
  // though they're the literal statistical mode across all rows, defaulting to one
  // would show a meaningless "vs Interchange" chart title on first load.
  const BENCH_DESIGNATIONS = new Set(["Interchange", "Replacement", "Reserve"]);
  const realPositionCounts = new Map<string, number>();
  for (const g of games) {
    if (BENCH_DESIGNATIONS.has(g.position)) continue;
    realPositionCounts.set(g.position, (realPositionCounts.get(g.position) ?? 0) + 1);
  }
  const defaultPosition = modePosition(realPositionCounts);

  const meta = {
    generatedAt: new Date().toISOString(),
    rowCount: games.length,
    seasons: { min: Math.min(...seasons), max: Math.max(...seasons) },
    minutesRange: { min: Math.min(...mins), max: Math.max(...mins) },
    marginRange: { min: Math.min(...margins), max: Math.max(...margins) },
    defaultPosition,
    medianPerformanceScore: median,
  };
  console.log("  ", meta);

  const outDir = path.resolve(process.cwd(), "public", "data");
  mkdirSync(outDir, { recursive: true });

  const gamesPath = path.join(outDir, "player-games.json");
  const referencePath = path.join(outDir, "reference.json");

  writeFileSync(gamesPath, JSON.stringify(games));
  writeFileSync(referencePath, JSON.stringify({ players, teams, meta }, null, 2));

  const sizeMb = (p: string) => (statSync(p).size / (1024 * 1024)).toFixed(2);
  console.log(`\n=== Wrote files ===`);
  console.log(`  ${gamesPath} (${sizeMb(gamesPath)} MB)`);
  console.log(`  ${referencePath} (${sizeMb(referencePath)} MB)`);

  await client.end();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
