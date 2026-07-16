"use client";

const OPTIONS: { value: "all" | "home" | "away"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "home", label: "Home" },
  { value: "away", label: "Away" },
];

export function HomeAwayToggle({
  value,
  onChange,
}: {
  value: "all" | "home" | "away";
  onChange: (value: "all" | "home" | "away") => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Home/Away</span>
      <div className="inline-flex rounded-md border border-gray-300 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-900">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
              value === opt.value
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
