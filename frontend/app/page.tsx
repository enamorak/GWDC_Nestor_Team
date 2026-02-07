"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap,
  GitBranch,
  BarChart3,
  AlertTriangle,
  Cpu,
  Database,
  Layers,
  Wallet,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { addPharosToWallet } from "@/lib/pharos-chain";

export default function HomePage() {
  const [walletError, setWalletError] = useState<string | null>(null);
  const [walletAdding, setWalletAdding] = useState(false);

  const handleAddPharos = async () => {
    setWalletError(null);
    setWalletAdding(true);
    try {
      await addPharosToWallet();
    } catch (e) {
      setWalletError(e instanceof Error ? e.message : "Failed to add network");
    } finally {
      setWalletAdding(false);
    }
  };

  return (
    <div className="bg-pharos-dark text-slate-200">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)]" />
        <div className="container relative mx-auto px-4 py-20 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-cyan-400">
              Pharos Network · Research Prototype
            </p>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="gradient-text">DeFi, Accelerated by Quantum</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-400">
              A hybrid quantum-classical prototype demonstrating the potential of quantum
              computing for DEX: arbitrage pathfinding, transaction scheduling, and
              liquidation optimization.
            </p>
            <motion.div
              className="mt-10 flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link
                href="/demo/arbitrage"
                className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-500"
              >
                View Demo
              </Link>
              <Link
                href="/demo/arbitrage"
                className="rounded-lg border border-slate-600 bg-slate-800/50 px-6 py-3 font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
              >
                Try Simulation
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Architecture */}
      <section className="border-b border-white/5 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-2xl font-semibold text-white">
            System architecture
          </h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl rounded-xl border border-slate-700/50 bg-slate-900/50 p-8 font-mono text-sm text-slate-400"
          >
            <pre className="overflow-x-auto whitespace-pre">
              {`Frontend (Next.js) → Classical Core API (FastAPI)
         ↓                        ↓
  Quantum Adapter          Pharos Gateway
         ↓                        ↓
  Quantum Simulator        Pharos Testnet
  (QUBO / Sim. Annealing)  (AtlanticOcean)`}
            </pre>
          </motion.div>
        </div>
      </section>

      {/* Demo cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-2xl font-semibold text-white">
            Interactive demos
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                title: "Arbitrage Pathfinder",
                desc: "Optimal path across liquidity pools using QUBO and simulated annealing. D3.js pool graph.",
                href: "/demo/arbitrage",
                icon: Zap,
              },
              {
                title: "Transaction Scheduler",
                desc: "Minimize read/write conflicts by scheduling orders into slots. Conflict heatmap.",
                href: "/demo/scheduler",
                icon: GitBranch,
              },
              {
                title: "Liquidation Optimizer",
                desc: "Select optimal positions to liquidate. Simulate market drop and run optimizer.",
                href: "/demo/liquidation",
                icon: BarChart3,
              },
            ].map((item, i) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="block rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 transition hover:border-indigo-500/50 hover:bg-slate-800/50"
                >
                  <item.icon className="mb-4 h-10 w-10 text-cyan-400" />
                  <h3 className="mb-2 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology stack */}
      <section className="border-t border-white/5 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-10 text-center text-2xl font-semibold text-white">
            Technology stack
          </h2>
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Layers, name: "Next.js 14", desc: "App Router, SSR, API routes" },
              { icon: Cpu, name: "FastAPI", desc: "Classical core API, Pydantic" },
              { icon: Zap, name: "dimod / neal", desc: "QUBO, simulated annealing" },
              { icon: Database, name: "Pharos + Redis", desc: "Testnet data, pool cache" },
            ].map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex gap-4 rounded-xl border border-slate-700/50 bg-slate-800/30 p-4"
              >
                <tech.icon className="h-8 w-8 shrink-0 text-indigo-400" />
                <div>
                  <p className="font-medium text-white">{tech.name}</p>
                  <p className="text-sm text-slate-400">{tech.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Connect wallet */}
      <section className="border-t border-white/5 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-xl font-semibold text-white">Connect to Pharos Testnet</h2>
          <p className="mx-auto mb-4 max-w-md text-sm text-slate-400">
            Add Pharos AtlanticOcean to your wallet to use testnet data and faucet.
          </p>
          <button
            onClick={handleAddPharos}
            disabled={walletAdding}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-6 py-3 font-medium text-slate-200 hover:bg-slate-600 disabled:opacity-50"
          >
            <Wallet className="h-5 w-5" />
            {walletAdding ? "Adding…" : "Add Pharos to MetaMask"}
          </button>
          {walletError && (
            <p className="mt-2 text-sm text-red-400">{walletError}</p>
          )}
        </div>
      </section>

      {/* Live Dashboard */}
      <section className="border-t border-white/5 py-12">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-6 py-3 font-medium text-slate-200 hover:bg-slate-700"
          >
            <BarChart3 className="h-5 w-5" />
            Live Dashboard &amp; Metrics
          </Link>
        </div>
      </section>

      {/* Roadmap */}
      <section className="border-t border-white/5 bg-slate-900/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-10 text-center text-2xl font-semibold text-white">Roadmap</h2>
          <div className="mx-auto max-w-2xl space-y-6">
            {[
              { phase: "2024", title: "Classical simulation on GPU", done: true },
              { phase: "2025", title: "Integration with real quantum APIs (Qiskit / D-Wave)", done: false },
              { phase: "2026", title: "Pilot with real transactions on Pharos", done: false },
            ].map((item, i) => (
              <motion.div
                key={item.phase}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-4 rounded-lg border border-slate-700/50 bg-slate-800/30 p-4"
              >
                <MapPin className="h-5 w-5 text-cyan-400" />
                <span className="font-mono text-slate-400">{item.phase}</span>
                <span className="flex-1 text-slate-200">{item.title}</span>
                {item.done && <CheckCircle2 className="h-5 w-5 text-green-400" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="border-t border-white/5 bg-slate-900/50 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-2xl items-start gap-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <AlertTriangle className="h-6 w-6 shrink-0 text-amber-500" />
            <div className="text-sm text-slate-300">
              <strong className="text-amber-400">Important:</strong> This is an
              experimental research prototype, not a production-ready system. Quantum
              computations are simulated; algorithms are for demonstration. Do not use
              for real trading. Integration with Pharos Testnet is for data and
              education only.
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-slate-500">
            QHDA · Quantum-Hybrid DEX Accelerator · Pharos Network
          </p>
        </div>
      </footer>
    </div>
  );
}
