"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Loader2 } from "lucide-react";
import { fetchPharosPools, runArbitrage, type ArbitrageResponse } from "@/lib/api";
import { QuantumGraph, type Pool } from "@/components/QuantumGraph";

const TOKEN_LABELS: Record<string, string> = {
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": "USDC",
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": "WETH",
  "0xdAC17F958D2ee523a2206206994597C13D831ec7": "USDT",
};

function tokenLabel(addr: string) {
  return TOKEN_LABELS[addr] || addr.slice(0, 6) + "…";
}

export default function ArbitrageDemoPage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loadingPools, setLoadingPools] = useState(true);
  const [tokenIn, setTokenIn] = useState("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
  const [tokenOut, setTokenOut] = useState("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
  const [amountIn, setAmountIn] = useState(1000);
  const [result, setResult] = useState<ArbitrageResponse | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPools = useCallback(async () => {
    setLoadingPools(true);
    setError(null);
    try {
      const data = await fetchPharosPools();
      setPools(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load pools");
      setPools([]);
    } finally {
      setLoadingPools(false);
    }
  }, []);

  useEffect(() => {
    loadPools();
  }, [loadPools]);

  const run = useCallback(async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const poolsToUse = pools.length ? pools : await fetchPharosPools();
      if (poolsToUse.length && !pools.length) setPools(poolsToUse as Pool[]);
      const res = await runArbitrage({
        token_in: tokenIn,
        token_out: tokenOut,
        pools: (poolsToUse as Pool[]).map((p) => ({
          address: p.address,
          tokens: p.tokens,
          reserves: p.reserves,
          fee: p.fee ?? 300,
        })),
        max_hops: 3,
        amount_in: amountIn,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Simulation failed");
    } finally {
      setRunning(false);
    }
  }, [pools, tokenIn, tokenOut, amountIn]);

  const tokens = Array.from(new Set(pools.flatMap((p) => p.tokens))).filter(Boolean);
  if (tokens.length === 0) {
    tokens.push(
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "0xdAC17F958D2ee523a2206206994597C13D831ec7"
    );
  }

  return (
    <div className="bg-pharos-dark text-slate-200">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold text-white">
          Demo 1: Quantum Arbitrage Pathfinder
        </h1>
        <p className="mb-8 text-slate-400">
          Find optimal swap path across pools (QUBO + simulated annealing). Graph shows
          tokens as nodes and pools as edges; optimal path is highlighted in cyan.
        </p>

        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={loadPools}
            disabled={loadingPools}
            className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-600 disabled:opacity-50"
          >
            {loadingPools ? "Loading…" : "Refresh pools"}
          </button>
        </div>

        {pools.length > 0 && (
          <div className="mb-8 rounded-xl border border-slate-700 bg-slate-900/50 p-4">
            <h3 className="mb-4 text-sm font-medium text-slate-400">Pool graph (D3.js)</h3>
            <QuantumGraph
              pools={pools}
              optimalPath={result?.optimal_path ?? null}
              width={640}
              height={360}
            />
          </div>
        )}

        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm text-slate-400">Token In</label>
            <select
              value={tokenIn}
              onChange={(e) => setTokenIn(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white"
            >
              {tokens.map((t) => (
                <option key={t} value={t}>
                  {tokenLabel(t)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-400">Token Out</label>
            <select
              value={tokenOut}
              onChange={(e) => setTokenOut(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white"
            >
              {tokens.map((t) => (
                <option key={t} value={t}>
                  {tokenLabel(t)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-400">Amount In</label>
            <input
              type="number"
              value={amountIn}
              onChange={(e) => setAmountIn(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={run}
              disabled={running}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {running ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Play className="h-5 w-5" />
              )}
              Run simulation
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {result && (
          <>
            {result.comparison && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-6"
              >
                <h2 className="mb-4 text-lg font-semibold text-white">
                  Classical vs Quantum — сравнение
                </h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-600 bg-slate-800/50 p-4">
                    <p className="mb-2 text-sm font-medium text-slate-400">Classical (greedy / direct path)</p>
                    <p className="font-mono text-sm text-slate-300">
                      Path: {result.comparison.classical_path.map(tokenLabel).join(" → ")}
                    </p>
                    <p className="mt-2 text-slate-400">Output amount: <span className="text-white">{result.comparison.classical_profit.toFixed(2)}</span></p>
                    <p className="text-slate-400">Time: <span className="text-white">{result.comparison.classical_time_ms.toFixed(2)} ms</span></p>
                  </div>
                  <div className="rounded-lg border border-cyan-500/50 bg-cyan-500/10 p-4">
                    <p className="mb-2 text-sm font-medium text-cyan-400">Quantum (full path search + QUBO)</p>
                    <p className="font-mono text-sm text-slate-300">
                      Path: {result.comparison.quantum_path.map(tokenLabel).join(" → ")}
                    </p>
                    <p className="mt-2 text-slate-400">Output amount: <span className="text-green-400 font-semibold">{result.comparison.quantum_profit.toFixed(2)}</span></p>
                    <p className="text-slate-400">Time: <span className="text-white">{result.comparison.quantum_time_ms.toFixed(2)} ms</span></p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <span className="rounded-full bg-green-500/20 px-4 py-2 text-sm font-medium text-green-400">
                    {result.comparison.winner === "quantum" ? "Quantum лучше" : "Classical лучше"}
                  </span>
                  {result.comparison.improvement_pct !== 0 && (
                    <span className="text-slate-400">
                      Улучшение выхода: <strong className="text-white">{result.comparison.improvement_pct > 0 ? "+" : ""}{result.comparison.improvement_pct}%</strong>
                    </span>
                  )}
                </div>
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-slate-700 bg-slate-800/50 p-6"
            >
              <h2 className="mb-4 text-lg font-semibold text-white">Результат (оптимальный путь)</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-400">Optimal path</p>
                  <p className="font-mono text-cyan-400">
                    {result.optimal_path.map(tokenLabel).join(" → ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Expected profit</p>
                  <p className="text-lg font-semibold text-green-400">
                    {result.expected_profit.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Simulation time</p>
                  <p className="font-mono">{result.simulation_time} ms</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
