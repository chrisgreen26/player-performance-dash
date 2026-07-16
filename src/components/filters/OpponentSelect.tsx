"use client";

import { useMemo } from "react";
import type { TeamRef } from "@/lib/types";

export function OpponentSelect({
  teams,
  value,
  onChange,
}: {
  teams: TeamRef[];
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const sortedTeams = useMemo(
    () => [...teams].sort((a, b) => a.teamShortName.localeCompare(b.teamShortName)),
    [teams]
  );

  return (
    <div className="flex flex-col gap-1.5">
      <select
        id="opponent-select"
        aria-label="Opponent"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="w-auto min-w-[150px] rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      >
        <option value="">Select opponent…</option>
        {sortedTeams.map((t) => (
          <option key={t.teamId} value={t.teamId}>
            {t.teamShortName}
          </option>
        ))}
      </select>
    </div>
  );
}
