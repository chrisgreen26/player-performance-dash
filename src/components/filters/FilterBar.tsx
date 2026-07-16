"use client";

import type { Competition, DatasetMeta, FilterState, TeamRef } from "@/lib/types";
import { CompetitionToggle } from "./CompetitionToggle";
import { PositionSelect } from "./PositionSelect";
import { OpponentSelect } from "./OpponentSelect";
import { TimeSlotSelect } from "./TimeSlotSelect";
import { HomeAwayToggle } from "./HomeAwayToggle";
import { RangeSlider } from "./RangeSlider";
import { BookmakerLineInput } from "./BookmakerLineInput";

export function FilterBar({
  competition,
  onCompetitionChange,
  filters,
  onFiltersChange,
  teams,
  meta,
}: {
  competition: Competition;
  onCompetitionChange: (c: Competition) => void;
  filters: FilterState;
  onFiltersChange: (next: Partial<FilterState>) => void;
  teams: TeamRef[];
  meta: DatasetMeta;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-50">Player Performance Dashboard</h1>
        <CompetitionToggle value={competition} onChange={onCompetitionChange} />
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <OpponentSelect
          teams={teams}
          value={filters.opponentTeamId}
          onChange={(opponentTeamId) => onFiltersChange({ opponentTeamId })}
        />
        <TimeSlotSelect value={filters.timeSlot} onChange={(timeSlot) => onFiltersChange({ timeSlot })} />
        <HomeAwayToggle value={filters.homeAway} onChange={(homeAway) => onFiltersChange({ homeAway })} />
        <BookmakerLineInput
          value={filters.bookmakerLine}
          onChange={(bookmakerLine) => onFiltersChange({ bookmakerLine })}
        />
        <RangeSlider
          label="Season"
          min={meta.seasons.min}
          max={meta.seasons.max}
          value={filters.seasonRange}
          onChange={(seasonRange) => onFiltersChange({ seasonRange })}
        />
        <RangeSlider
          label="Minutes Played"
          min={meta.minutesRange.min}
          max={meta.minutesRange.max}
          value={filters.minsRange}
          onChange={(minsRange) => onFiltersChange({ minsRange })}
        />
        <RangeSlider
          label="Winning Margin"
          min={meta.marginRange.min}
          max={meta.marginRange.max}
          value={filters.marginRange}
          onChange={(marginRange) => onFiltersChange({ marginRange })}
        />
      </div>
      <PositionSelect value={filters.position} onChange={(position) => onFiltersChange({ position })} />
    </div>
  );
}
