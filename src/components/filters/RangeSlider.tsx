"use client";

const THUMB_CLASSES =
  "pointer-events-none absolute inset-0 w-full appearance-none bg-transparent " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none " +
  "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full " +
  "[&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white " +
  "[&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 " +
  "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:border-2 " +
  "[&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow [&::-moz-range-thumb]:cursor-pointer " +
  "[&::-moz-range-thumb]:border-none";

interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatValue?: (value: number) => string;
}

export function RangeSlider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue = (v) => String(v),
}: RangeSliderProps) {
  const [lo, hi] = value;
  const span = Math.max(max - min, 1);
  const loPct = ((lo - min) / span) * 100;
  const hiPct = ((hi - min) / span) * 100;

  function handleLo(next: number) {
    onChange([Math.min(next, hi), hi]);
  }
  function handleHi(next: number) {
    onChange([lo, Math.max(next, lo)]);
  }

  return (
    <div className="flex flex-col gap-1.5 min-w-[180px]">
      <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-300">
        <span>{label}</span>
        <span>
          {formatValue(lo)} – {formatValue(hi)}
        </span>
      </div>
      <div className="relative h-4 flex items-center">
        <div className="absolute h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
        <div
          className="absolute h-1.5 rounded-full bg-blue-500"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(e) => handleLo(Number(e.target.value))}
          className={THUMB_CLASSES}
          style={{ zIndex: lo > max - (max - min) / 2 ? 3 : 2 }}
          aria-label={`${label} minimum`}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(e) => handleHi(Number(e.target.value))}
          className={THUMB_CLASSES}
          style={{ zIndex: 3 }}
          aria-label={`${label} maximum`}
        />
      </div>
    </div>
  );
}
