"use client";

import { TIME_SLOTS, TIME_SLOT_TOOLTIP } from "@/lib/constants";
import type { TimeSlot } from "@/lib/types";
import { InfoTooltip } from "@/components/layout/InfoTooltip";

export function TimeSlotSelect({
  value,
  onChange,
}: {
  value: TimeSlot | "all";
  onChange: (value: TimeSlot | "all") => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="timeslot-select" className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
        Time Slot
        <InfoTooltip text={TIME_SLOT_TOOLTIP} />
      </label>
      <select
        id="timeslot-select"
        value={value}
        onChange={(e) => onChange(e.target.value as TimeSlot | "all")}
        className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      >
        <option value="all">All</option>
        {TIME_SLOTS.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}
