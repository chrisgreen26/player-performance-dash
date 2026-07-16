"use client";

export function BookmakerLineInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 dark:border-gray-700 dark:bg-gray-900">
      <label htmlFor="bookmaker-line" className="whitespace-nowrap text-sm font-bold text-gray-700 dark:text-gray-200">
        Line
      </label>
      <input
        id="bookmaker-line"
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-14 bg-transparent text-sm text-gray-900 outline-none dark:text-gray-100 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  );
}
