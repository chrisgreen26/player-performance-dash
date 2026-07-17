"use client";

import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { StackedScorePoint } from "@/lib/aggregate";
import {
  ATTACK_SCORE_COLOR,
  ATTACK_SCORE_STROKE,
  BASE_SCORE_COLOR,
  BOOKMAKER_LINE_COLOR,
  type ChartVariant,
  OPPONENT_ATTACK_SCORE_COLOR,
  OPPONENT_ATTACK_SCORE_STROKE,
  OPPONENT_BASE_SCORE_COLOR,
  VARIANT_CARD_CLASSES,
  VARIANT_LEGEND_CLASSES,
  VARIANT_TITLE_CLASSES,
} from "@/lib/constants";

type Variant = ChartVariant;

interface BarShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
}

const VARIANT_COLORS: Record<Variant, { base: string; attack: string; attackStroke: string }> = {
  player: { base: BASE_SCORE_COLOR, attack: ATTACK_SCORE_COLOR, attackStroke: ATTACK_SCORE_STROKE },
  opponent: { base: OPPONENT_BASE_SCORE_COLOR, attack: OPPONENT_ATTACK_SCORE_COLOR, attackStroke: OPPONENT_ATTACK_SCORE_STROKE },
};

interface ScoreTooltipProps {
  active?: boolean;
  payload?: { payload: StackedScorePoint }[];
  teamAbbById: Map<number, string>;
  playerNames?: Record<number, string>;
  colors: { base: string; attack: string; attackStroke: string };
}

function ScoreTooltip({ active, payload, teamAbbById, playerNames, colors }: ScoreTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  const ownAbb = teamAbbById.get(point.teamId) ?? "???";
  const oppAbb = teamAbbById.get(point.oppositionTeamId) ?? "???";
  const separator = point.homeTeam ? "vs" : "@";
  const playerName = playerNames?.[point.playerId];

  return (
    <div className="rounded-md border border-gray-200 bg-white p-2.5 text-xs shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <div className="font-semibold text-gray-900 dark:text-gray-100">
        {point.fixtureLabel} {ownAbb} {separator} {oppAbb} ({point.timeSlot.toUpperCase()})
      </div>
      {playerName && <div className="text-gray-600 dark:text-gray-300">{playerName}</div>}
      <div className="mb-1.5 text-gray-500 dark:text-gray-400">
        {point.teamScore}-{point.oppositionScore} · {Math.round(point.minsPlayed)} mins
      </div>
      <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-200">
        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: colors.base }} />
        Base: {point.base}
      </div>
      <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-200">
        <span
          className="inline-block h-2 w-2 rounded-full border"
          style={{ backgroundColor: colors.attack, borderColor: colors.attackStroke }}
        />
        Attack: {point.attack}
      </div>
    </div>
  );
}

function ChartLegend({ colors, className }: { colors: { base: string; attack: string; attackStroke: string }; className: string }) {
  return (
    <div className={`flex items-center gap-3 text-xs ${className}`}>
      <span className="flex items-center gap-1">
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors.base }} />
        Base
      </span>
      <span className="flex items-center gap-1">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full border"
          style={{ backgroundColor: colors.attack, borderColor: colors.attackStroke }}
        />
        Attack
      </span>
    </div>
  );
}

export function StackedScoreBarChart({
  data,
  title,
  teamAbbById,
  playerNames,
  variant = "player",
  bookmakerLine,
  emptyMessage = "No games match the current filters.",
}: {
  data: StackedScorePoint[];
  title: string;
  teamAbbById: Map<number, string>;
  playerNames?: Record<number, string>;
  variant?: Variant;
  bookmakerLine?: number;
  emptyMessage?: string;
}) {
  const width = Math.max(600, data.length * 36);
  const colors = VARIANT_COLORS[variant];

  // SVG strokes straddle the path edge (half in, half out), so a naive
  // stroke on the attack segment renders it visibly wider than the
  // unstroked base segment beneath it. Inset the rect by half the stroke
  // width first so the stroke's outer edge lines up with the true bar width.
  const attackStrokeWidth = 1;
  function AttackBarShape({ x = 0, y = 0, width: w = 0, height: h = 0, fill }: BarShapeProps) {
    const inset = attackStrokeWidth / 2;
    return (
      <rect
        x={x + inset}
        y={y + inset}
        width={Math.max(w - attackStrokeWidth, 0)}
        height={Math.max(h - attackStrokeWidth, 0)}
        fill={fill}
        stroke={colors.attackStroke}
        strokeWidth={attackStrokeWidth}
      />
    );
  }

  return (
    <div className={`flex h-full flex-col rounded-xl border p-4 ${VARIANT_CARD_CLASSES[variant]}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`text-sm font-semibold ${VARIANT_TITLE_CLASSES[variant]}`}>{title}</h3>
        {data.length > 0 && <ChartLegend colors={colors} className={VARIANT_LEGEND_CLASSES[variant]} />}
      </div>
      {data.length === 0 ? (
        <EmptyChart message={emptyMessage} />
      ) : (
        <div className="flex-1 overflow-x-auto" style={{ minHeight: 280 }}>
          <div style={{ width, minWidth: "100%", height: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-100 dark:stroke-gray-800" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-45} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<ScoreTooltip teamAbbById={teamAbbById} playerNames={playerNames} colors={colors} />} />
                {bookmakerLine !== undefined && (
                  <ReferenceLine y={bookmakerLine} stroke={BOOKMAKER_LINE_COLOR} strokeDasharray="6 4" strokeWidth={1.5} />
                )}
                <Bar dataKey="base" name="Base" stackId="score" fill={colors.base} isAnimationActive={false} />
                <Bar
                  dataKey="attack"
                  name="Attack"
                  stackId="score"
                  fill={colors.attack}
                  shape={AttackBarShape}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export function EmptyChart({ message = "No games match the current filters." }: { message?: string }) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-gray-400" style={{ minHeight: 280 }}>
      {message}
    </div>
  );
}
