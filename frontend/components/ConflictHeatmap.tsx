"use client";

import { useMemo } from "react";

interface ConflictHeatmapProps {
  matrix: number[][];
  orderIds?: string[];
  maxSize?: number;
  className?: string;
}

export function ConflictHeatmap({
  matrix,
  orderIds = [],
  maxSize = 25,
  className = "",
}: ConflictHeatmapProps) {
  const { cells, size } = useMemo(() => {
    const n = matrix.length;
    if (n === 0) return { cells: [], size: 0 };
    const cap = Math.min(n, maxSize);
    const cells: { i: number; j: number; value: number }[] = [];
    for (let i = 0; i < cap; i++) {
      for (let j = 0; j < cap; j++) {
        cells.push({ i, j, value: matrix[i]?.[j] ?? 0 });
      }
    }
    return { cells, size: cap };
  }, [matrix, maxSize]);

  if (size === 0) return null;

  const cellSize = Math.max(6, Math.min(14, 280 / size));
  const totalSize = size * cellSize;

  return (
    <div className={className}>
      <p className="mb-2 text-sm text-slate-400">
        Conflict matrix (1 = conflict between orders). Showing first {size}×{size}.
      </p>
      <div
        className="inline-grid gap-px rounded border border-slate-700 bg-slate-800 p-1"
        style={{
          gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${size}, ${cellSize}px)`,
        }}
      >
        {cells.map(({ i, j, value }) => (
          <div
            key={`${i}-${j}`}
            title={
              orderIds[i] && orderIds[j]
                ? `${orderIds[i]} vs ${orderIds[j]}: ${value ? "conflict" : "no conflict"}`
                : `${i} vs ${j}: ${value}`
            }
            className="rounded-sm transition hover:ring-2 hover:ring-cyan-400"
            style={{
              width: cellSize,
              height: cellSize,
              backgroundColor: value ? "rgba(99, 102, 241, 0.8)" : "rgba(30, 41, 59, 0.6)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
