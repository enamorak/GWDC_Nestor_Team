"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Loader2, Shuffle } from "lucide-react";
import { runScheduler, type SchedulerResponse, type SchedulerOrder } from "@/lib/api";
import { ConflictHeatmap } from "@/components/ConflictHeatmap";

function generateRandomOrders(count: number): SchedulerOrder[] {
  const pairs = ["ETH/USDC", "ETH/USDT", "BTC/USDC", "WBTC/ETH"];
  const pools = ["pool_ETH_USDC", "pool_ETH_USDT", "pool_BTC_USDC", "pool_WBTC_ETH"];
  const orders: SchedulerOrder[] = [];
  for (let i = 0; i < count; i++) {
    const pair = pairs[i % pairs.length];
    const pool = pools[i % pools.length];
    orders.push({
      id: `order_${i + 1}`,
      type: "swap",
      pair,
      account: `0x${(i + 1).toString(16).padStart(40, "0")}`,
      reads: [pool],
      writes: [pool, `account_${i + 1}`],
    });
  }
  return orders;
}

export default function SchedulerDemoPage() {
  const [orderCount, setOrderCount] = useState(20);
  const [orders, setOrders] = useState<SchedulerOrder[]>(() => generateRandomOrders(20));
  const [result, setResult] = useState<SchedulerResponse | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shuffle = useCallback(() => {
    setOrders(generateRandomOrders(orderCount));
    setResult(null);
  }, [orderCount]);

  const run = useCallback(async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await runScheduler({ pending_orders: orders });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scheduling failed");
    } finally {
      setRunning(false);
    }
  }, [orders]);

  return (
    <div className="bg-pharos-dark text-slate-200">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold text-white">
          Demo 2: Quantum Transaction Scheduler
        </h1>
        <p className="mb-8 text-slate-400">
          Minimize read/write conflicts by assigning orders to execution slots (graph
          coloring QUBO). Heatmap shows which order pairs conflict.
        </p>

        <div className="mb-8 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Orders</span>
            <input
              type="number"
              min={5}
              max={100}
              value={orderCount}
              onChange={(e) => {
                const n = Number(e.target.value);
                setOrderCount(n);
                setOrders(generateRandomOrders(n));
                setResult(null);
              }}
              className="w-20 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-white"
            />
          </label>
          <button
            onClick={shuffle}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-600"
          >
            <Shuffle className="h-4 w-4" /> New random orders
          </button>
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
            Run scheduler
          </button>
        </div>

        {error && (
          <div className="mb-8 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {result && result.conflict_matrix && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-xl border border-slate-700 bg-slate-800/50 p-6"
          >
            <h2 className="mb-4 text-lg font-semibold text-white">Conflict matrix</h2>
            <ConflictHeatmap
              matrix={result.conflict_matrix}
              orderIds={orders.map((o) => o.id)}
              maxSize={30}
            />
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-xl border border-slate-700 bg-slate-800/50 p-6"
          >
            <h2 className="mb-4 text-lg font-semibold text-white">Schedule</h2>
            <div className="mb-4 flex gap-4 text-sm">
              <span className="text-slate-400">
                Total slots: <strong className="text-white">{result.total_slots}</strong>
              </span>
              <span className="text-slate-400">
                Conflict reduction:{" "}
                <strong className="text-cyan-400">{result.conflict_reduction}</strong>
              </span>
              {result.total_conflicts != null && (
                <span className="text-slate-400">
                  Total conflicts:{" "}
                  <strong className="text-white">{result.total_conflicts}</strong>
                </span>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(result.schedule).map(([slot, orderIds]) => (
                <div
                  key={slot}
                  className="rounded-lg border border-slate-600 bg-slate-900/50 p-4"
                >
                  <p className="mb-2 font-mono text-cyan-400">{slot}</p>
                  <ul className="list-inside list-disc text-sm text-slate-400">
                    {orderIds.slice(0, 5).map((id) => (
                      <li key={id}>{id}</li>
                    ))}
                    {orderIds.length > 5 && (
                      <li className="text-slate-500">+{orderIds.length - 5} more</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4">
          <h3 className="mb-2 text-sm font-medium text-slate-400">Sample orders (first 5)</h3>
          <pre className="overflow-x-auto text-xs text-slate-500">
            {JSON.stringify(orders.slice(0, 5), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
