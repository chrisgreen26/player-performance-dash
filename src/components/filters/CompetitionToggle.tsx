"use client";

import type { Competition } from "@/lib/types";

export function CompetitionToggle({
  value,
  onChange,
}: {
  value: Competition;
  onChange: (value: Competition) => void;
}) {
  const options: Competition[] = ["NRL", "NRLW"];
  return (
    <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-900">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
            value === opt
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
