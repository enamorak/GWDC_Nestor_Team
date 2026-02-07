# Quantum-Hybrid DEX Accelerator (QHDA)

**Proof-of-concept:** hybrid quantum-classical system for accelerating DEX on [Pharos Network](https://pharos.network) (AtlanticOcean testnet). Research prototype for hackathons and investors.

---

## What Has Been Implemented

### Backend (FastAPI)

- **Health & readiness**
  - `GET /api/health` — service status
  - `GET /api/ready` — dependency readiness

- **Pharos integration**
  - `GET /api/pharos/network` — connection status, block number, chain ID, gas price (from RPC when available)
  - `GET /api/pharos/pools` — list of DEX pools (from cache or demo fallback; cache TTL 30s)
  - Background task refreshes pool cache every 30 seconds
  - Graceful fallback to demo pool data when Pharos RPC is unavailable or not configured

- **Quantum simulation API (classical simulators)**
  - `GET /api/quantum/status` — simulator backend type and readiness
  - `POST /api/quantum/arbitrage` — optimal swap path across pools (NetworkX graph + QUBO-style; simulated annealing via dimod/neal)
  - `POST /api/quantum/scheduler` — transaction schedule to minimize read/write conflicts (graph coloring; returns schedule + conflict matrix + total conflicts)
  - `POST /api/quantum/liquidation` — optimal set of positions to liquidate (knapsack-style heuristic)

- **Stack:** FastAPI, Pydantic, web3.py, Redis (optional), dimod, neal, NetworkX, NumPy

### Frontend (Next.js 14, App Router)

- **Landing (`/`)**
  - Hero with “DeFi, Accelerated by Quantum” and CTA buttons
  - System architecture diagram
  - Three demo cards (Arbitrage, Scheduler, Liquidation) with links
  - **Technology stack** section (Next.js, FastAPI, dimod/neal, Pharos/Redis)
  - **Connect to Pharos Testnet** — “Add Pharos to MetaMask” (injects chain via `wallet_addEthereumChain`)
  - Link to Live Dashboard
  - **Roadmap** (2024 classical sim ✅, 2025 quantum APIs, 2026 pilot)
  - Disclaimer: experimental prototype, not for real trading

- **Demo 1: Arbitrage Pathfinder (`/demo/arbitrage`)**
  - Load pools from API on mount (Pharos or demo)
  - **D3.js force-directed graph** of tokens (nodes) and pools (edges); draggable nodes
  - Select token in, token out, amount; “Run simulation” calls backend
  - Result: optimal path, expected profit, simulation time, classical baseline (demo)
  - Optimal path highlighted in cyan on the graph

- **Demo 2: Transaction Scheduler (`/demo/scheduler`)**
  - Configurable number of random orders (5–100); “New random orders” to reshuffle
  - “Run scheduler” → backend returns schedule + **conflict matrix**
  - **Conflict heatmap** (first 30×30): 1 = conflict between order pairs
  - Schedule: slots with order IDs and conflict reduction metric

- **Demo 3: Liquidation Optimizer (`/demo/liquidation`)**
  - Dashboard of positions (health factor, collateral, debt, liquidation bonus)
  - **“Simulate market drop”** — reduces all health factors by 15%; positions can become liquidatable
  - “Reset positions” restores initial state
  - “Run liquidation optimization” → selected positions, strategy (priority order), estimated recovery, timing

- **Live Dashboard (`/dashboard`)**
  - API health
  - Pharos Network: connected, block number, chain ID, message (or error)
  - **Gas:** gas price (Gwei) when RPC provides it
  - **Quantum Simulator:** status from `GET /api/quantum/status` (backend type, ready, simulator name)
  - Cached pools count and short description

- **Stack:** Next.js 14, Tailwind CSS, Framer Motion, D3.js, TypeScript, ethers/viem-ready (Pharos chain params in `lib/pharos-chain.ts`)

### DevOps & Config

- **Docker Compose:** backend (FastAPI), frontend (Next.js), Redis, PostgreSQL (optional)
- **.env.example:** `PHAROS_RPC_URL`, `REDIS_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_PHAROS_RPC`, `NEXT_PUBLIC_PHAROS_CHAIN_ID`
- **README** (this file): full description of implemented features in English

---

## Quick Start

1. **Run with Docker**
   ```bash
   cp .env.example .env
   docker-compose up -d
   ```
2. Open **http://localhost:3000** (frontend) and **http://localhost:8000/docs** (API).
3. Use **“Add Pharos to MetaMask”** on the homepage to add Pharos Testnet (RPC and chain ID from env). Get testnet tokens from [Pharos Faucet](https://faucet.pharos.network) if needed.

---

## What This Project Is

QHDA is a **research prototype** that shows how quantum-inspired optimization could support DEX:

- **Quantum Arbitrage Pathfinder** — optimal swap paths across many pools (NP-hard).
- **Quantum Transaction Scheduler** — order batching to reduce read/write conflicts (graph coloring).
- **Quantum Liquidation Optimizer** — which positions to liquidate under constraints (knapsack-style).

All “quantum” steps currently run on **classical simulators** (simulated annealing, graph algorithms). The design allows swapping in real quantum backends (e.g. Qiskit, D-Wave) later.

---

## Important Disclaimer

**This is not a production-ready system.**

- Quantum computations are **simulated** (classical algorithms).
- Algorithms are **experimental** and for demonstration only.
- Pharos integration is for **data and education**.
- **Do not use for real trading or financial decisions.**

*“На сегодня это направление находится на стыке теоретической информатики и экспериментальной физики.”*

---

## Architecture

```
Frontend (Next.js 14)  →  Classical Core API (FastAPI)
        ↓                            ↓
  Quantum Adapter              Pharos Gateway
        ↓                            ↓
  Quantum Simulator            Pharos Testnet
  (QUBO / Sim. Annealing)      (AtlanticOcean)
```

---

## Tech Stack

| Layer     | Technologies |
|----------|--------------|
| Frontend | Next.js 14 (App Router), Tailwind, Framer Motion, D3.js, TypeScript |
| Backend  | FastAPI, Pydantic, uvicorn |
| Quantum  | dimod, neal (simulated annealing), NetworkX |
| Blockchain | web3.py, Pharos RPC; frontend: wallet_addEthereumChain for Pharos |
| Data     | Redis (pool cache), PostgreSQL (optional in Compose) |
| Deploy   | Docker, Docker Compose |

---

## Development

### Backend (Python)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8000` (e.g. in `.env`).

### Environment (.env)

See `.env.example`. Main variables:

- `PHAROS_RPC_URL` — Pharos testnet RPC (e.g. `https://atlantic.ocean.pharos.network`).
- `REDIS_URL` — Redis for pool cache (optional; backend works without it).
- `NEXT_PUBLIC_API_URL` — Backend URL for the frontend.
- `NEXT_PUBLIC_PHAROS_RPC` — Same RPC for “Add Pharos to MetaMask”.
- `NEXT_PUBLIC_PHAROS_CHAIN_ID` — Chain ID in hex (e.g. `0x1f95`); adjust per Pharos docs.

---

## Roadmap (Hackathon / Research)

- **Week 1:** Docker, Pharos connection, landing, FastAPI, pool fetcher ✅
- **Week 2:** Quantum modules (arbitrage, scheduler, liquidation), QUBO, Redis cache ✅
- **Week 3:** Full frontend–backend integration, interactive demos (D3 graph, heatmap, market drop), dashboard ✅
- **Week 4:** Polish, documentation, pitch, optional deploy (e.g. demo.pharos-quantum.xyz)

---

## API Docs & Pitch

- **API:** http://localhost:8000/docs  
- **Pitch structure:** Problem (NP-hard in DeFi) → Solution (quantum co-processor) → Architecture → Live demos → Pharos integration → Roadmap → Team & ask

---

## License

MIT (or as specified by the team).
