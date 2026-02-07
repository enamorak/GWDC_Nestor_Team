"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Loader2, TrendingDown, RotateCcw } from "lucide-react";
import {
  runLiquidation,
  type LiquidationResponse,
  type LiquidationPosition,
} from "@/lib/api";

const INITIAL_POSITIONS: LiquidationPosition[] = [
  {
    position_id: "pos_1",
    collateral: ["ETH", "BTC"],
    debt: ["USDC"],
    health_factor: 1.05,
    liquidation_bonus: 0.1,
  },
  {
    position_id: "pos_2",
    collateral: ["ETH"],
    debt: ["USDC", "USDT"],
    health_factor: 1.12,
    liquidation_bonus: 0.08,
  },
  {
    position_id: "pos_3",
    collateral: ["WBTC"],
    debt: ["USDC"],
    health_factor: 1.02,
    liquidation_bonus: 0.12,
  },
  {
    position_id: "pos_4",
    collateral: ["ETH", "USDC"],
    debt: ["USDT"],
    health_factor: 1.18,
    liquidation_bonus: 0.05,
  },
  {
    position_id: "pos_5",
    collateral: ["BTC"],
    debt: ["ETH", "USDC"],
    health_factor: 1.01,
    liquidation_bonus: 0.15,
  },
];

export default function LiquidationDemoPage() {
  const [positions, setPositions] = useState<LiquidationPosition[]>(() =>
    INITIAL_POSITIONS.map((p) => ({ ...p }))
  );
  const [marketDropped, setMarketDropped] = useState(false);
  const [result, setResult] = useState<LiquidationResponse | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulateMarketDrop = useCallback(() => {
    setPositions((prev) =>
      prev.map((p) => ({
        ...p,
        health_factor: Math.max(0.95, p.health_factor * 0.85),
      }))
    );
    setMarketDropped(true);
    setResult(null);
  }, []);

  const resetPositions = useCallback(() => {
    setPositions(INITIAL_POSITIONS.map((p) => ({ ...p })));
    setMarketDropped(false);
    setResult(null);
  }, []);

  const run = useCallback(async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await runLiquidation({
        positions_to_liquidate: positions,
        available_liquidity: { pools: [] },
        protocol_constraints: { max_gas_per_block: 30000000, deadline_blocks: 5 },
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Optimization failed");
    } finally {
      setRunning(false);
    }
  }, [positions]);

  return (
    <div className="min-h-screen bg-pharos-dark text-slate-200">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <h1 className="mb-2 text-3xl font-bold text-white">
          Demo 3: Quantum Liquidation Optimizer
        </h1>
        <p className="mb-8 text-slate-400">
          Select optimal set of positions to liquidate under protocol constraints
          (multi-criteria optimization / knapsack-style QUBO). Simulate a market drop to
          see health factors fall, then run the optimizer.
        </p>

        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={run}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {running ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Play className="h-5 w-5" />
            )}
            Run liquidation optimization
          </button>
          <button
            onClick={simulateMarketDrop}
            className="inline-flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-2 font-medium text-amber-400 hover:bg-amber-500/20"
          >
            <TrendingDown className="h-5 w-5" />
            Simulate market drop (−15%)
          </button>
          <button
            onClick={resetPositions}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-600"
          >
            <RotateCcw className="h-5 w-5" />
            Reset positions
          </button>
        </div>

        {error && (
          <div className="mb-8 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Positions at risk {marketDropped && "(after simulated drop)"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {positions.map((pos) => (
              <div
                key={pos.position_id}
                className={`rounded-xl border p-4 ${
                  pos.health_factor < 1
                    ? "border-red-500/50 bg-red-500/10"
                    : "border-slate-700 bg-slate-800/50"
                }`}
              >
                <p className="font-mono text-cyan-400">{pos.position_id}</p>
                <p className="mt-2 text-sm text-slate-400">
                  Health:{" "}
                  <span
                    className={
                      pos.health_factor < 1 ? "text-red-400" : "text-amber-400"
                    }
                  >
                    {pos.health_factor.toFixed(3)}
                  </span>
                  {pos.health_factor < 1 && " (liquidatable)"}
                </p>
                <p className="text-sm text-slate-400">
                  Collateral: {pos.collateral.join(", ")} · Debt: {pos.debt.join(", ")}
                </p>
                <p className="text-xs text-slate-500">
                  Bonus: {(pos.liquidation_bonus ?? 0) * 100}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-slate-700 bg-slate-800/50 p-6"
          >
            <h2 className="mb-4 text-lg font-semibold text-white">
              Optimal liquidation strategy
            </h2>
            <div className="mb-4 flex flex-wrap gap-6 text-sm">
              <span className="text-slate-400">
                Selected:{" "}
                <strong className="text-white">
                  {result.selected_positions.join(", ")}
                </strong>
              </span>
              <span className="text-slate-400">
                Est. recovery:{" "}
                <strong className="text-green-400">
                  {(result.estimated_recovery * 100).toFixed(2)}%
                </strong>
              </span>
              <span className="text-slate-400">
                Time: <strong className="text-white">{result.simulation_time} ms</strong>
              </span>
            </div>
            <ul className="space-y-2">
              {result.strategy.map((s) => (
                <li key={s.position} className="font-mono text-sm text-slate-300">
                  {s.action} {s.position} (priority {s.priority})
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
}
