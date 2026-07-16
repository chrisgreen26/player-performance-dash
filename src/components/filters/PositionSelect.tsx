"use client";

import { POSITIONS } from "@/lib/constants";
import type { Position } from "@/lib/types";

export function PositionSelect({
  value,
  onChange,
}: {
  value: Position;
  onChange: (value: Position) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Position</span>
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-6">
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            type="button"
            onClick={() => onChange(pos)}
            className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
              value === pos
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            }`}
          >
            {pos}
          </button>
        ))}
      </div>
    </div>
  );
}
