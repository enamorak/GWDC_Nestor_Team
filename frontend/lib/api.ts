const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export type NetworkStats = {
  block_number: number | null;
  chain_id: number | null;
  connected: boolean;
  message: string | null;
  gas_price?: number | null;
};

export async function fetchPharosNetwork(): Promise<NetworkStats> {
  const res = await fetch(`${API_BASE}/api/pharos/network`);
  if (!res.ok) throw new Error("Pharos network request failed");
  return res.json();
}

export async function fetchPharosPools() {
  const res = await fetch(`${API_BASE}/api/pharos/pools`);
  if (!res.ok) throw new Error("Pharos pools request failed");
  return res.json();
}

export type ArbitrageRequest = {
  token_in: string;
  token_out: string;
  pools: { address: string; tokens: string[]; reserves: number[]; fee: number }[];
  max_hops?: number;
  amount_in?: number;
};

export type ArbitrageResponse = {
  optimal_path: string[];
  expected_profit: number;
  transactions: { pool: string; action: string; amount: number }[];
  simulation_time: number;
  classical_baseline?: number;
};

export async function runArbitrage(body: ArbitrageRequest): Promise<ArbitrageResponse> {
  const res = await fetch(`${API_BASE}/api/quantum/arbitrage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export type SchedulerOrder = {
  id: string;
  type?: string;
  pair: string;
  account: string;
  reads: string[];
  writes: string[];
};

export type SchedulerRequest = {
  pending_orders: SchedulerOrder[];
  conflict_matrix?: number[][];
};

export type SchedulerResponse = {
  schedule: Record<string, string[]>;
  total_slots: number;
  conflict_reduction: string;
  conflict_matrix?: number[][];
  total_conflicts?: number;
};

export async function fetchQuantumStatus(): Promise<{
  backend: string;
  simulator: string;
  ready: boolean;
  message: string;
}> {
  const res = await fetch(`${API_BASE}/api/quantum/status`);
  if (!res.ok) throw new Error("Quantum status failed");
  return res.json();
}

export async function runScheduler(body: SchedulerRequest): Promise<SchedulerResponse> {
  const res = await fetch(`${API_BASE}/api/quantum/scheduler`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export type LiquidationPosition = {
  position_id: string;
  collateral: string[];
  debt: string[];
  health_factor: number;
  liquidation_bonus?: number;
};

export type LiquidationRequest = {
  positions_to_liquidate: LiquidationPosition[];
  available_liquidity?: Record<string, unknown>;
  protocol_constraints?: Record<string, unknown>;
};

export type LiquidationResponse = {
  selected_positions: string[];
  strategy: { position: string; action: string; priority: number }[];
  estimated_recovery: number;
  simulation_time: number;
};

export async function runLiquidation(
  body: LiquidationRequest
): Promise<LiquidationResponse> {
  const res = await fetch(`${API_BASE}/api/quantum/liquidation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
