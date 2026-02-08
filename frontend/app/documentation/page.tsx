"use client";

import { motion } from "framer-motion";

export default function DocumentationPage() {
  return (
    <div className="bg-pharos-dark text-slate-200">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold text-white">
          Quantum algorithms: which conflicts they solve
        </h1>
        <p className="mb-10 text-slate-400">
          This page explains the three problem classes and how quantum-inspired methods address them. All diagrams are in English.
        </p>

        {/* 1. Parallel execution conflicts (scheduler) */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 rounded-xl border border-slate-700 bg-slate-800/40 p-8"
        >
          <h2 className="mb-2 text-xl font-semibold text-white">
            1. Parallel execution conflicts (Transaction Scheduler)
          </h2>
          <p className="mb-6 text-slate-400">
            When multiple orders write to the same pool or account, they conflict and cannot run in the same slot. The problem is equivalent to <strong>graph coloring</strong>: nodes = orders, edge = conflict. Quantum-inspired annealing searches for a coloring with fewer colors (fewer execution slots).
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-600 bg-slate-900/60 p-6">
            <p className="mb-4 text-sm font-medium text-cyan-400">Conflict model (diagram)</p>
            <svg viewBox="0 0 520 220" className="mx-auto w-full max-w-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="10" y="22" fill="#94a3b8" fontSize="11">Orders (write to pool)</text>
              <rect x="20" y="32" width="60" height="28" rx="4" fill="#334155" stroke="#64748b" />
              <text x="35" y="50" fill="#e2e8f0" fontSize="10">Order 1</text>
              <rect x="100" y="32" width="60" height="28" rx="4" fill="#334155" stroke="#64748b" />
              <text x="115" y="50" fill="#e2e8f0" fontSize="10">Order 2</text>
              <rect x="180" y="32" width="60" height="28" rx="4" fill="#334155" stroke="#64748b" />
              <text x="195" y="50" fill="#e2e8f0" fontSize="10">Order 3</text>
              <rect x="260" y="32" width="60" height="28" rx="4" fill="#334155" stroke="#64748b" />
              <text x="275" y="50" fill="#e2e8f0" fontSize="10">Order 4</text>
              <text x="350" y="50" fill="#94a3b8" fontSize="10">→ same pool = CONFLICT</text>
              <path d="M 50 70 L 50 95 L 260 95 L 260 70" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4" fill="none" />
              <text x="10" y="120" fill="#94a3b8" fontSize="11">Conflict graph: edge = conflict</text>
              <circle cx="80" cy="165" r="18" fill="#6366f1" stroke="#22d3ee" strokeWidth="2" />
              <text x="72" y="169" fill="#fff" fontSize="9">1</text>
              <circle cx="180" cy="165" r="18" fill="#6366f1" stroke="#22d3ee" strokeWidth="2" />
              <text x="172" y="169" fill="#fff" fontSize="9">2</text>
              <circle cx="280" cy="165" r="18" fill="#6366f1" stroke="#22d3ee" strokeWidth="2" />
              <text x="272" y="169" fill="#fff" fontSize="9">3</text>
              <circle cx="380" cy="165" r="18" fill="#6366f1" stroke="#22d3ee" strokeWidth="2" />
              <text x="372" y="169" fill="#fff" fontSize="9">4</text>
              <line x1="98" y1="165" x2="162" y2="165" stroke="#f472b6" strokeWidth="2" />
              <line x1="198" y1="165" x2="262" y2="165" stroke="#f472b6" strokeWidth="2" />
              <line x1="298" y1="165" x2="362" y2="165" stroke="#f472b6" strokeWidth="2" />
              <text x="400" y="170" fill="#94a3b8" fontSize="10">Edges = same pool</text>
              <text x="10" y="205" fill="#64748b" fontSize="10">Classical: 1 order/slot (N slots). Quantum: graph coloring → fewer slots (batches).</text>
            </svg>
          </div>
        </motion.section>

        {/* 2. Arbitrage path conflict (local vs global) */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16 rounded-xl border border-slate-700 bg-slate-800/40 p-8"
        >
          <h2 className="mb-2 text-xl font-semibold text-white">
            2. Path search: local vs global optimum (Arbitrage)
          </h2>
          <p className="mb-6 text-slate-400">
            Classical greedy (2-hop only) can settle on a <strong>local optimum</strong>. Quantum full path search finds the <strong>global optimum</strong> on complex graphs (5+ tokens). The conflict here is “which path to take” — the search space grows combinatorially; QUBO + annealing explores it.
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-600 bg-slate-900/60 p-6">
            <p className="mb-4 text-sm font-medium text-cyan-400">Path conflict (diagram)</p>
            <svg viewBox="0 0 480 200" className="mx-auto w-full max-w-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="10" y="20" fill="#94a3b8" fontSize="11">Token graph: nodes = tokens, edges = pools</text>
              <circle cx="80" cy="70" r="22" fill="#22d3ee" stroke="#0e7490" strokeWidth="2" />
              <text x="72" y="75" fill="#0f172a" fontSize="11">A</text>
              <circle cx="200" cy="70" r="22" fill="#6366f1" stroke="#4f46e5" strokeWidth="2" />
              <text x="192" y="75" fontSize="11" fill="#e2e8f0">B</text>
              <circle cx="320" cy="70" r="22" fill="#6366f1" stroke="#4f46e5" strokeWidth="2" />
              <text x="312" y="75" fontSize="11" fill="#e2e8f0">C</text>
              <circle cx="400" cy="130" r="22" fill="#22d3ee" stroke="#0e7490" strokeWidth="2" />
              <text x="392" y="135" fill="#0f172a" fontSize="11">D</text>
              <line x1="102" y1="70" x2="178" y2="70" stroke="#64748b" strokeWidth="2" />
              <line x1="222" y1="70" x2="298" y2="70" stroke="#64748b" strokeWidth="2" />
              <line x1="200" y1="92" x2="380" y2="118" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6" />
              <line x1="80" y1="92" x2="380" y2="118" stroke="#34d399" strokeWidth="2" />
              <text x="240" y="55" fill="#64748b" fontSize="9">Classical 2-hop (local)</text>
              <text x="130" y="110" fill="#34d399" fontSize="9">Quantum path (global)</text>
              <text x="10" y="175" fill="#64748b" fontSize="10">A→B→C→D: classical may choose A→B→C. Quantum evaluates all paths (A→…→D) and picks best output.</text>
            </svg>
          </div>
        </motion.section>

        {/* 3. Liquidation constraints conflict */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16 rounded-xl border border-slate-700 bg-slate-800/40 p-8"
        >
          <h2 className="mb-2 text-xl font-semibold text-white">
            3. Constraint conflict (Liquidation)
          </h2>
          <p className="mb-6 text-slate-400">
            Under <strong>gas</strong> and <strong>liquidity</strong> limits, choosing which positions to liquidate is a knapsack-like problem. Classical (health-order) can violate limits or underuse recovery. Quantum-inspired optimization selects a set that <strong>maximizes recovery within constraints</strong>.
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-600 bg-slate-900/60 p-6">
            <p className="mb-4 text-sm font-medium text-cyan-400">Constraint conflict (diagram)</p>
            <svg viewBox="0 0 500 180" className="mx-auto w-full max-w-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="10" y="22" fill="#94a3b8" fontSize="11">Positions at risk (gas, liquidity limits)</text>
              <rect x="20" y="35" width="70" height="36" rx="4" fill="#334155" stroke="#64748b" />
              <text x="32" y="52" fill="#e2e8f0" fontSize="9">Pos 1</text>
              <text x="28" y="65" fill="#94a3b8" fontSize="8">gas 180k</text>
              <rect x="100" y="35" width="70" height="36" rx="4" fill="#334155" stroke="#64748b" />
              <text x="112" y="52" fill="#e2e8f0" fontSize="9">Pos 2</text>
              <text x="108" y="65" fill="#94a3b8" fontSize="8">gas 220k</text>
              <rect x="180" y="35" width="70" height="36" rx="4" fill="#334155" stroke="#64748b" />
              <text x="192" y="52" fill="#e2e8f0" fontSize="9">Pos 3</text>
              <text x="188" y="65" fill="#94a3b8" fontSize="8">gas 190k</text>
              <rect x="260" y="35" width="70" height="36" rx="4" fill="#334155" stroke="#64748b" />
              <text x="272" y="52" fill="#e2e8f0" fontSize="9">Pos 4</text>
              <text x="268" y="65" fill="#94a3b8" fontSize="8">gas 250k</text>
              <rect x="340" y="30" width="140" height="46" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
              <text x="350" y="48" fill="#f59e0b" fontSize="10">Max gas/block: 400k</text>
              <text x="350" y="62" fill="#94a3b8" fontSize="9">Liquidity: USDC 30k, USDT 25k</text>
              <text x="10" y="105" fill="#94a3b8" fontSize="11">Classical (health order): may pick Pos1+Pos2 → 400k gas OK but lower recovery.</text>
              <text x="10" y="125" fill="#94a3b8" fontSize="11">Quantum (recovery order): picks set that fits 400k and maximizes recovery rate.</text>
              <text x="10" y="155" fill="#64748b" fontSize="10">Conflict = which subset satisfies constraints and maximizes objective.</text>
            </svg>
          </div>
        </motion.section>

        {/* 4. Yield Infra (Asset Management) */}
        <motion.section
          id="yield-infra"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-16 rounded-xl border border-slate-700 bg-slate-800/40 p-8"
        >
          <h2 className="mb-2 text-xl font-semibold text-white">
            4. Yield Infra — Asset management with quantum optimization
          </h2>
          <p className="mb-6 text-slate-400">
            Quantum algorithms act as the &quot;brain&quot; for reinvestment: they evaluate hundreds of parameters at once for scheduling, risk classification, and multi-protocol allocation.
          </p>
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-600 bg-slate-900/60 p-4">
              <p className="mb-2 text-sm font-medium text-cyan-400">Quantum Scheduling (reinvest batching)</p>
              <p className="mb-2 text-slate-300 text-sm">
                Many possible transactions (claim yield, swap, add liquidity) each cost gas. Find the sequence and batching that maximizes profit under a gas limit. Modeled as <strong>QUBO</strong>: each transaction is a variable; the solver finds the optimal batch per block.
              </p>
              <p className="text-xs italic text-amber-200/90">
                Pitch: &quot;We use quantum scheduling for batch execution of yield-strategy actions, reducing gas costs by 20–40% compared to step-by-step execution.&quot;
              </p>
            </div>
            <div className="rounded-lg border border-slate-600 bg-slate-900/60 p-4">
              <p className="mb-2 text-sm font-medium text-cyan-400">Pool risk classification (Quantum ML)</p>
              <p className="mb-2 text-slate-300 text-sm">
                Risk is multi-dimensional (volatility, TVL, concentration, audit). Variational quantum classifiers analyze 10+ factors simultaneously and assign dynamic risk scores.
              </p>
              <p className="text-xs italic text-amber-200/90">
                Pitch: &quot;Our quantum classifier evaluates pool risk on 10+ factors at once, uncovering hidden correlations for a more accurate risk profile.&quot;
              </p>
            </div>
            <div className="rounded-lg border border-slate-600 bg-slate-900/60 p-4">
              <p className="mb-2 text-sm font-medium text-cyan-400">Multi-protocol allocation (DeFi & RWA)</p>
              <p className="mb-2 text-slate-300 text-sm">
                Not a single arbitrage path, but the optimal capital allocation across dozens of protocols, pools, and RWA assets. Modeled as optimization on a graph; quantum annealing finds the global maximum for shares and constraints (risk, liquidity).
              </p>
              <p className="text-xs italic text-amber-200/90">
                Pitch: &quot;Our simulator builds a full capital allocation map across the multi-protocol DeFi universe, maximizing yield for a given risk level.&quot;
              </p>
            </div>
          </div>
        </motion.section>

        {/* 5. Prediction Market */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16 rounded-xl border border-slate-700 bg-slate-800/40 p-8"
        >
          <h2 className="mb-2 text-xl font-semibold text-white">
            5. Decentralized Prediction Market — Liquidity &amp; UX
          </h2>
          <p className="mb-6 text-slate-400">
            Quantum computing addresses liquidity (AMM curve) and fair pricing; optionally fast execution via quantum oracles.
          </p>
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-600 bg-slate-900/60 p-4">
              <p className="mb-2 text-sm font-medium text-cyan-400">Quantum AMM optimization</p>
              <p className="mb-2 text-slate-300 text-sm">
                Classical AMMs (e.g. LMSR) have delays and inaccuracies at scale. Quantum algorithms tune the bonding curve in real time, adapting to the flow of bets to minimize slippage and maximize effective liquidity.
              </p>
              <p className="text-xs italic text-amber-200/90">
                Pitch: &quot;We apply quantum optimization to dynamically tune the prediction market AMM curve. This reduces slippage by 15–30% and attracts more liquidity through more efficient use of capital.&quot;
              </p>
            </div>
            <div className="rounded-lg border border-slate-600 bg-slate-900/60 p-4">
              <p className="mb-2 text-sm font-medium text-cyan-400">Web2-level UX (quantum oracles)</p>
              <p className="mb-2 text-slate-300 text-sm">
                Instead of waiting for external resolution, a pre-computed scenario from a quantum simulator (high probability) can trigger fast payouts; final resolution is confirmed later. This creates the illusion of instant execution.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Summary table */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl border border-slate-700 bg-slate-800/40 p-8"
        >
          <h2 className="mb-4 text-xl font-semibold text-white">Summary: conflicts solved by quantum algorithms</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="pb-3 pr-4 text-left text-slate-400">Module</th>
                  <th className="pb-3 pr-4 text-left text-slate-400">Conflict type</th>
                  <th className="pb-3 pr-4 text-left text-slate-400">Quantum approach</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-slate-700">
                  <td className="py-3 pr-4 font-medium text-white">Scheduler</td>
                  <td className="py-3 pr-4">Write conflicts (same pool/account)</td>
                  <td className="py-3 pr-4">Graph coloring QUBO → fewer execution slots</td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="py-3 pr-4 font-medium text-white">Arbitrage</td>
                  <td className="py-3 pr-4">Path choice (local vs global optimum)</td>
                  <td className="py-3 pr-4">Full path search + QUBO/annealing for complex graphs</td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="py-3 pr-4 font-medium text-white">Liquidation</td>
                  <td className="py-3 pr-4">Gas & liquidity vs recovery</td>
                  <td className="py-3 pr-4">Knapsack-style QUBO → max recovery within limits</td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="py-3 pr-4 font-medium text-white">Yield Infra</td>
                  <td className="py-3 pr-4">Reinvest batch (gas), pool risk, multi-protocol allocation</td>
                  <td className="py-3 pr-4">QUBO scheduling, Quantum ML classifier, graph optimization</td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="py-3 pr-4 font-medium text-white">Prediction Market</td>
                  <td className="py-3 pr-4">AMM curve, liquidity, fast payouts</td>
                  <td className="py-3 pr-4">Quantum AMM tuning, quantum oracles</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
