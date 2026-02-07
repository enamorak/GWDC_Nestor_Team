# Quantum-Hybrid DEX Accelerator (QHDA)

**Proof-of-concept:** hybrid quantum-classical system for accelerating DEX on [Pharos Network](https://pharos.network) (AtlanticOcean testnet). Research prototype for hackathons and investors.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Site Navigation](#site-navigation)
3. [Deployment (Free Hosting)](#deployment-free-hosting)
4. [Functions and Algorithms (Detailed)](#functions-and-algorithms-detailed)
5. [API Reference](#api-reference)
6. [What Has Been Implemented](#what-has-been-implemented)
7. [Architecture](#architecture)
8. [Tech Stack](#tech-stack)
9. [Development](#development)
10. [Disclaimer](#important-disclaimer)

---

## Quick Start

```bash
cp .env.example .env
docker-compose up -d
```

- **Frontend:** http://localhost:3000  
- **API docs:** http://localhost:8000/docs  

Use **"Add Pharos to MetaMask"** on the homepage to add Pharos Testnet. Get testnet tokens from [Pharos Faucet](https://faucet.pharos.network) if needed.

---

## Site Navigation

The site has a **fixed top navigation bar** on every page:

- **Home** — Landing: hero, architecture, demo cards, tech stack, “Add Pharos to MetaMask”, roadmap, disclaimer.
- **Demos** (dropdown):
  - **Arbitrage** — Optimal swap path across pools (D3 graph, token/amount, run simulation).
  - **Scheduler** — Transaction schedule (orders, conflict heatmap, slots).
  - **Liquidation** — Liquidation optimizer (positions, “Simulate market drop”, run optimizer).
- **Dashboard** — API health, Pharos network (block, chain ID, gas), quantum simulator status, cached pools count.

On **mobile**, the menu collapses into a hamburger; tapping it opens the same links (Home, Demos submenu, Dashboard). The active page is highlighted in the nav. No “Back” buttons: use the menu to switch between sections.

---

## Deployment (Free Hosting)

You can host the **frontend** and **backend** for free using **Vercel** (frontend) and **Render** (backend).

### 1. Backend on Render.com

1. Push the repo to GitHub (if not already).
2. Go to [Render](https://render.com) → Sign up / Log in → **New** → **Web Service**.
3. Connect your GitHub repo. Choose the **root** of the repo.
4. **Root Directory:** set to `backend` (so Render runs from the `backend` folder).
5. **Runtime:** Python 3.
6. **Build Command:** `pip install -r requirements.txt`
7. **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
8. **Plan:** Free.
9. Add **Environment Variables:**
   - `PHAROS_RPC_URL` = `https://atlantic.ocean.pharos.network` (optional).
   - `CORS_ORIGINS` = your Vercel frontend URL (e.g. `https://your-app.vercel.app`) so the API accepts requests from the deployed site. You can add it after the first deploy when you have the Vercel URL.
10. Click **Create Web Service**. Wait for the first deploy.
11. Copy the service URL (e.g. `https://qhda-api.onrender.com`). You will use it as the API URL for the frontend.

Alternatively, use the `backend/render.yaml` blueprint: in Render dashboard, **New** → **Blueprint**, connect the repo, and select `backend/render.yaml`.

### 2. Frontend on Vercel

1. Go to [Vercel](https://vercel.com) → Sign up / Log in (e.g. with GitHub).
2. **Add New** → **Project** → Import your GitHub repo.
3. **Root Directory:** set to `frontend` (or leave empty if the frontend is the repo root; if the repo contains both `frontend` and `backend`, set **Root Directory** to `frontend`).
4. **Framework Preset:** Next.js (auto-detected).
5. **Environment Variables:** add:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL (e.g. `https://qhda-api.onrender.com`)  
   Without this, the frontend will call `http://localhost:8000` and demos will fail in production.
6. **Deploy**. Vercel will build and give you a URL (e.g. `https://qhda-frontend.vercel.app`).

### 3. After deployment

- **Frontend URL:** e.g. `https://your-project.vercel.app` — open it in a browser; use the nav (Home, Demos, Dashboard).
- **Backend URL:** e.g. `https://qhda-api.onrender.com` — open `/docs` for API docs (e.g. `https://qhda-api.onrender.com/docs`).

**Note:** On Render’s free tier, the backend may spin down after inactivity; the first request after idle can be slow. For always-on backend, use a paid plan or another host (e.g. Railway, Fly.io).

---

## Functions and Algorithms (Detailed)

This section explains **what each module does**, **what problem it solves**, **what algorithm is used**, and **what the API expects and returns**. All “quantum” steps in this prototype run on **classical simulators** (same math that could later run on a quantum annealer).

---

### 1. Arbitrage Pathfinder

**What it does:** Finds the **best swap path** from token A to token B across multiple liquidity pools (e.g. A→B directly, or A→C→B, or A→C→D→B) so that the **output amount is maximized** (or profit vs direct swap).

**Problem in practice:**  
On a DEX there are many pools (e.g. USDC/WETH, WETH/USDT, USDC/USDT). Swapping 1000 USDC for USDT can be done in one pool or via several hops (USDC → WETH → USDT). The number of possible paths grows quickly with pools and tokens; finding the best path is a **shortest-path / best-path** problem on a graph and, in full generality with many pools, is **NP-hard**. Quantum annealing (QUBO) is one candidate to search large spaces faster.

**Input (request body):**

| Field       | Type   | Description |
|------------|--------|-------------|
| `token_in` | string | Contract address of the token you send (e.g. WETH). |
| `token_out` | string | Contract address of the token you want (e.g. USDC). |
| `pools`    | array  | List of pools. Each pool: `address`, `tokens` (pair of addresses), `reserves` (two numbers), `fee` (basis points, e.g. 300 = 0.3%). |
| `max_hops` | int    | Maximum path length (default 3). |
| `amount_in` | number | Amount of `token_in` to swap. |

**Output (response):**

| Field               | Description |
|---------------------|-------------|
| `optimal_path`      | List of token addresses forming the best path (e.g. `[WETH, USDC, USDT]`). |
| `expected_profit`   | Profit vs a direct swap (or total output if no direct pool). |
| `transactions`      | List of swaps: which pool, action `"swap"`, amount. |
| `simulation_time`   | Backend computation time (ms). |
| `classical_baseline` | Demo comparison value (simulated “classical” result). |

**Algorithm (current implementation):**

1. **Build a directed graph:**  
   - **Vertices** = token addresses.  
   - **Edges** = pools. Each pool connects two tokens; we store reserves and fee for both directions (A→B and B→A).

2. **Enumerate simple paths:**  
   From `token_in` to `token_out` with length ≤ `max_hops` (e.g. using NetworkX `all_simple_paths`).

3. **AMM formula (constant-product / Uniswap-style):**  
   For each path, simulate a sequence of swaps. For one hop:  
   `amount_out = (amount_in * reserve_out * (1 - fee)) / (reserve_in + amount_in * (1 - fee))`.  
   Apply this hop-by-hop along the path.

4. **Choose best path:**  
   The path that gives the **largest** `amount_out` is the “optimal path”.  
   **Profit** = this output minus the output of a direct swap (if a direct pool exists).

5. **Optional (for demo):**  
   A small QUBO is built and solved with **simulated annealing** (dimod/neal) to illustrate the same type of optimization that a quantum annealer would do. The actual path in this prototype comes from the graph search above.

**Why “quantum”:**  
Searching over many paths and pools can be cast as a **QUBO** (Quadratic Unconstrained Binary Optimization). Quantum annealers (e.g. D-Wave) minimize such objectives; in a full system, the pathfinder could offload this search to a quantum backend.

**Endpoint:** `POST /api/quantum/arbitrage`

---

### 2. Transaction Scheduler

**What it does:** Given a list of **pending orders** (e.g. swaps), assigns each order to an **execution slot** so that **orders that conflict** (e.g. write to the same pool or account) **do not run in the same slot**. The goal is to **minimize read/write conflicts** and allow maximum parallel execution.

**Problem in practice:**  
In a parallel execution environment (e.g. optimistic rollups, parallel EVM), two transactions that write to the same state (e.g. same liquidity pool) cannot be executed in the same “slot” without a conflict. Deciding how to partition N orders into the minimum number of conflict-free slots is equivalent to **graph coloring**: vertices = orders, edge = conflict. Graph coloring is **NP-complete**; quantum annealing can be used to search for good colorings.

**Input (request body):**

| Field             | Type   | Description |
|-------------------|--------|-------------|
| `pending_orders`  | array  | Each order: `id`, `type` (e.g. `"swap"`), `pair`, `account`, `reads` (list of resource IDs), `writes` (list of resource IDs). |
| `conflict_matrix` | matrix | Optional. If omitted, the backend builds it from `writes`: two orders conflict if they share at least one write. |

**Output (response):**

| Field                | Description |
|----------------------|-------------|
| `schedule`           | Map `slot_1`, `slot_2`, … → list of order IDs in that slot. |
| `total_slots`        | Number of slots. |
| `conflict_reduction` | Metric describing how conflicts are resolved (e.g. “67%”). |
| `conflict_matrix`    | N×N matrix: 1 = conflict between order i and j (for heatmap). |
| `total_conflicts`    | Total number of conflicting pairs. |

**Algorithm (current implementation):**

1. **Conflict matrix:**  
   For each pair of orders (i, j): if they share at least one **write** resource (e.g. same pool or account), set `M[i][j] = M[j][i] = 1`. Otherwise 0.

2. **Graph coloring (greedy):**  
   - Graph: vertices = orders, edge between i and j iff `M[i][j] == 1`.  
   - Assign each vertex a “color” (slot index): for each vertex, choose the smallest color not used by any adjacent (conflicting) vertex.  
   - Result: each color = one slot; orders in the same slot have no conflicts.

3. **Schedule:**  
   Build the map `slot_k` → list of order IDs with color k.

**Why “quantum”:**  
Minimum graph coloring can be written as a **QUBO**. A quantum annealer could search for a coloring with fewer colors (fewer slots) or better balance. This prototype uses a fast classical greedy algorithm; the same problem structure is what would be sent to a quantum backend.

**Endpoint:** `POST /api/quantum/scheduler`

---

### 3. Liquidation Optimizer

**What it does:** Given a list of **positions at risk** (e.g. collateralized debt with health factor close to or below 1), selects **which positions to liquidate first** and in what **priority order** to **maximize protocol recovery** (or minimize loss) under constraints (e.g. gas, liquidity).

**Problem in practice:**  
Lending/borrowing protocols must liquidate undercollateralized positions. With limited gas or liquidity, the protocol cannot liquidate everyone at once. Choosing **which set of positions** to liquidate and **in what order** is a **multi-criteria optimization** (recovery, market impact, gas). It can be modeled as a **knapsack-like** or **combinatorial** problem; such problems are **NP-hard** and are natural candidates for QUBO and quantum annealing.

**Input (request body):**

| Field                     | Type   | Description |
|---------------------------|--------|-------------|
| `positions_to_liquidate`  | array  | Each position: `position_id`, `collateral` (e.g. `["ETH","BTC"]`), `debt` (e.g. `["USDC"]`), `health_factor` (e.g. 1.05), `liquidation_bonus` (e.g. 0.1). |
| `available_liquidity`     | object | Optional. Pools / liquidity available for liquidation. |
| `protocol_constraints`   | object | Optional. E.g. `max_gas_per_block`, `deadline_blocks`. |

**Output (response):**

| Field                 | Description |
|-----------------------|-------------|
| `selected_positions`  | List of position IDs to liquidate (e.g. top 5 most at risk). |
| `strategy`            | List of `{ position, action: "liquidate", priority }` in execution order. |
| `estimated_recovery`  | Estimated recovery rate (0–1 scale; higher = better for protocol). |
| `simulation_time`    | Backend computation time (ms). |

**Algorithm (current implementation):**

1. **Sort by risk:**  
   Sort positions by **health factor ascending** (lowest first = most at risk).

2. **Select top positions:**  
   Take the first K positions (e.g. K=5) as the liquidation set. In a full system, K would be chosen by gas/liquidity constraints.

3. **Strategy and recovery:**  
   - Strategy = list of selected positions with priority 1, 2, …  
   - Estimated recovery = average of `(0.9 + liquidation_bonus)` over selected positions (simplified metric).

**Why “quantum”:**  
The full problem (choose subset of positions and order to maximize recovery under constraints) is a **knapsack / combinatorial optimization** and can be formulated as **QUBO**. A quantum annealer could search for a better set and order. This prototype uses a simple risk-based heuristic; the API and data model are ready for a QUBO backend.

**Endpoint:** `POST /api/quantum/liquidation`

---

### Summary Table: Problems and Algorithms

| Module   | Problem                     | Classical algorithm (this prototype)     | Quantum-style formulation |
|----------|-----------------------------|------------------------------------------|----------------------------|
| Arbitrage| Best swap path across pools | Graph + enumerate paths + AMM formula    | QUBO (path selection)     |
| Scheduler| Assign orders to slots      | Conflict graph + greedy graph coloring  | QUBO (graph coloring)     |
| Liquidation | Which positions to liquidate | Sort by health, take top K            | QUBO (knapsack-like)      |

All three are **NP-hard or NP-complete** in full form; the prototype uses **fast classical heuristics** that mimic the structure of the problems a quantum backend would solve.

---

### Glossary (Concepts Used)

| Term | Meaning |
|------|---------|
| **QUBO** | Quadratic Unconstrained Binary Optimization. A form of optimization problem where variables are binary (0/1) and the objective is a quadratic function. Quantum annealers (e.g. D-Wave) minimize such objectives. |
| **Simulated annealing** | A classical optimization method that mimics cooling of a metal: it explores the solution space and can escape local minima. Used here (via dimod/neal) as a classical stand-in for quantum annealing. |
| **AMM (Automated Market Maker)** | A pool-based DEX model (e.g. Uniswap). Reserves and fee define the swap: `amount_out = (amount_in * reserve_out * (1 - fee)) / (reserve_in + amount_in * (1 - fee))`. |
| **Health factor** | In lending protocols: ratio of collateral value to debt; if &lt; 1 the position is undercollateralized and can be liquidated. |
| **Conflict matrix** | N×N matrix: entry (i, j) = 1 if order i and order j conflict (e.g. write to the same resource); 0 otherwise. |
| **Graph coloring** | Assigning “colors” (here: execution slots) to vertices (orders) so that adjacent vertices (conflicting orders) have different colors. Minimum number of colors = minimum number of slots. |
| **Knapsack-style** | Optimization problem: choose a subset of items (e.g. positions to liquidate) under capacity (e.g. gas) to maximize value (e.g. recovery). NP-hard. |

---

## API Reference

### Health and status

| Method | Path                 | Description |
|--------|----------------------|-------------|
| GET    | `/api/health`       | Service status (`status: "ok"`). |
| GET    | `/api/ready`        | Readiness (dependencies). |
| GET    | `/api/quantum/status` | Simulator backend type and readiness. |

### Pharos (blockchain data)

| Method | Path                 | Description |
|--------|----------------------|-------------|
| GET    | `/api/pharos/network` | Pharos RPC connection, block number, chain ID, gas price. |
| GET    | `/api/pharos/pools`  | List of DEX pools (cached or demo). |

### Quantum modules (optimization)

| Method | Path                      | Description |
|--------|---------------------------|-------------|
| POST   | `/api/quantum/arbitrage`  | Optimal swap path (see [Arbitrage Pathfinder](#1-arbitrage-pathfinder)). |
| POST   | `/api/quantum/scheduler`  | Transaction schedule (see [Transaction Scheduler](#2-transaction-scheduler)). |
| POST   | `/api/quantum/liquidation`| Liquidation strategy (see [Liquidation Optimizer](#3-liquidation-optimizer)). |

Request/response schemas are in **OpenAPI**: http://localhost:8000/docs .

---

## What Has Been Implemented

### Backend (FastAPI)

- Health and readiness endpoints; quantum simulator status.
- Pharos: network stats (block, chain ID, gas), pools list; background pool refresh every 30s; fallback to demo pools.
- Three optimization endpoints: arbitrage (graph + AMM + optional neal), scheduler (conflict matrix + greedy coloring), liquidation (sort by health + top-K).
- Stack: FastAPI, Pydantic, web3.py, Redis (optional), dimod, dwave-neal, NetworkX.

### Frontend (Next.js 14)

- **Navigation:** Sticky top navbar on all pages: **Home**, **Demos** (dropdown: Arbitrage, Scheduler, Liquidation), **Dashboard**. Mobile: hamburger menu with the same links. Active page highlighted.
- **Landing (Home):** Hero, architecture, demo cards, tech stack, “Add Pharos to MetaMask”, dashboard link, roadmap, disclaimer.
- **Demo Arbitrage:** Pool graph (D3.js), token/amount inputs, run simulation. **Classical vs Quantum:** classical = direct or 2-hop only; quantum = full path search; shows improvement % and winner.
- **Demo Scheduler:** Random orders (5–100), conflict heatmap, schedule. **Comparison:** classical = sequential (N slots); quantum = graph coloring (fewer slots); shows slots reduction % and winner.
- **Demo Liquidation:** Positions list, “Simulate market drop” (reduce health), “Reset”, run optimizer, selected positions and strategy. **Comparison:** classical = first K by list order; quantum = sort by health factor; shows recovery improvement % and winner.
- **Dashboard:** API health, Pharos (block, chain ID, gas), quantum simulator status, cached pools count.

### DevOps and config

- Docker Compose: backend, frontend, Redis, PostgreSQL (optional).
- `.env.example`: `PHAROS_RPC_URL`, `REDIS_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_PHAROS_RPC`, `NEXT_PUBLIC_PHAROS_CHAIN_ID`.
- **Deployment:** Frontend: Vercel (see [Deployment](#deployment-free-hosting)). Backend: Render (`backend/render.yaml` or manual Web Service). Set `NEXT_PUBLIC_API_URL` to the deployed backend URL when deploying the frontend.

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
|-----------|---------------|
| Frontend  | Next.js 14 (App Router), Tailwind, Framer Motion, D3.js, TypeScript |
| Backend   | FastAPI, Pydantic, uvicorn |
| Quantum   | dimod, dwave-neal (simulated annealing), NetworkX |
| Blockchain| web3.py, Pharos RPC; frontend: wallet_addEthereumChain for Pharos |
| Data      | Redis (pool cache), PostgreSQL (optional in Compose) |
| Deploy    | Docker, Docker Compose |

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

- `PHAROS_RPC_URL` — Pharos testnet RPC.
- `REDIS_URL` — Redis for pool cache (optional).
- `NEXT_PUBLIC_API_URL` — Backend URL for the frontend.
- `NEXT_PUBLIC_PHAROS_RPC`, `NEXT_PUBLIC_PHAROS_CHAIN_ID` — For “Add Pharos to MetaMask”.

---

## Important Disclaimer

**This is not a production-ready system.**

- Quantum computations are **simulated** (classical algorithms).
- Algorithms are **experimental** and for demonstration only.
- Pharos integration is for **data and education**.
- **Do not use for real trading or financial decisions.**

*“На сегодня это направление находится на стыке теоретической информатики и экспериментальной физики.”*

---

## Roadmap (Hackathon / Research)

- **Week 1:** Docker, Pharos connection, landing, FastAPI, pool fetcher ✅  
- **Week 2:** Quantum modules (arbitrage, scheduler, liquidation), QUBO, Redis cache ✅  
- **Week 3:** Full frontend–backend integration, demos (D3 graph, heatmap, market drop), dashboard ✅  
- **Week 4:** Polish, documentation, pitch, optional deploy  

---

## License

MIT (or as specified by the team).
