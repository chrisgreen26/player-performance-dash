"use client";

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
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="opponent-select" className="text-xs font-medium text-gray-600 dark:text-gray-300">
        Opponent
      </label>
      <select
        id="opponent-select"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      >
        <option value="">Select opponent…</option>
        {teams.map((t) => (
          <option key={t.teamId} value={t.teamId}>
            {t.teamName}
          </option>
        ))}
      </select>
    </div>
  );
}
