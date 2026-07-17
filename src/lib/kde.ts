/** Simple statistics helpers for the score-distribution chart. */

export interface DensityPoint {
  x: number;
  y: number;
}

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function stddev(values: number[]): number {
  const m = mean(values);
  const variance = values.reduce((sum, v) => sum + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function gaussianKernel(u: number): number {
  return Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
}

/**
 * Gaussian kernel density estimate over `values`, evaluated on an evenly
 * spaced grid. Bandwidth via Silverman's rule of thumb. Returns null when
 * there isn't enough data for a meaningful curve.
 */
export function gaussianKDE(values: number[], gridSize = 64): DensityPoint[] | null {
  const n = values.length;
  if (n < 2) return null;

  const sigma = stddev(values);
  // Silverman's rule; guard against a degenerate (zero-spread) sample.
  const bandwidth = sigma > 0 ? 1.06 * sigma * Math.pow(n, -1 / 5) : Math.max(mean(values) * 0.1, 1);

  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const gridMin = Math.max(0, dataMin - 3 * bandwidth);
  const gridMax = dataMax + 3 * bandwidth;
  const step = (gridMax - gridMin) / (gridSize - 1);

  const points: DensityPoint[] = [];
  for (let i = 0; i < gridSize; i++) {
    const x = gridMin + i * step;
    let density = 0;
    for (const v of values) {
      density += gaussianKernel((x - v) / bandwidth);
    }
    density /= n * bandwidth;
    points.push({ x, y: density });
  }
  return points;
}

/** Linear-interpolation percentile (matches numpy's default method). */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 1) return sorted[0];
  const rank = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return sorted[lo];
  const frac = rank - lo;
  return sorted[lo] + (sorted[hi] - sorted[lo]) * frac;
}
