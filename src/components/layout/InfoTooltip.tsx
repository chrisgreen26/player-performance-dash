"use client";

import { useState } from "react";

export function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="More info"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-300 text-[10px] font-bold text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-100"
      >
        i
      </button>
      {open && (
        <span className="absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-md bg-gray-900 p-2 text-xs text-white shadow-lg">
          {text}
        </span>
      )}
    </span>
  );
}
