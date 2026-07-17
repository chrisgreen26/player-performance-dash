"use client";

import type { Position } from "@/lib/types";

export function PositionSelect({
  options,
  value,
  onChange,
}: {
  options: Position[];
  value: Position;
  onChange: (value: Position) => void;
}) {
  return (
    <div className="inline-flex flex-wrap items-center gap-0.5 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-900">
      {options.map((pos) => (
        <button
          key={pos}
          type="button"
          onClick={() => onChange(pos)}
          className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            value === pos
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          {pos}
        </button>
      ))}
    </div>
  );
}
