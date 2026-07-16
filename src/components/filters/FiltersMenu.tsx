"use client";

import type { RangeBounds } from "@/lib/aggregate";
import type { FilterState } from "@/lib/types";
import { TimeSlotSelect } from "./TimeSlotSelect";
import { HomeAwayToggle } from "./HomeAwayToggle";
import { RangeSlider } from "./RangeSlider";

export function FiltersMenu({
  filters,
  onFiltersChange,
  bounds,
}: {
  filters: FilterState;
  onFiltersChange: (next: Partial<FilterState>) => void;
  bounds: RangeBounds;
}) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
      <TimeSlotSelect value={filters.timeSlot} onChange={(timeSlot) => onFiltersChange({ timeSlot })} />
      <HomeAwayToggle value={filters.homeAway} onChange={(homeAway) => onFiltersChange({ homeAway })} />
      <RangeSlider
        label="Season"
        min={bounds.seasons.min}
        max={bounds.seasons.max}
        value={filters.seasonRange}
        onChange={(seasonRange) => onFiltersChange({ seasonRange })}
      />
      <RangeSlider
        label="Minutes Played"
        min={bounds.minutes.min}
        max={bounds.minutes.max}
        value={filters.minsRange}
        onChange={(minsRange) => onFiltersChange({ minsRange })}
      />
      <RangeSlider
        label="Winning Margin"
        min={bounds.margin.min}
        max={bounds.margin.max}
        value={filters.marginRange}
        onChange={(marginRange) => onFiltersChange({ marginRange })}
      />
    </div>
  );
}
