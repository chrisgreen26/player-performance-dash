"use client";

export function BookmakerLineInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="bookmaker-line" className="text-xs font-medium text-gray-600 dark:text-gray-300">
        Bookmaker Line
      </label>
      <input
        id="bookmaker-line"
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-24 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      />
    </div>
  );
}
