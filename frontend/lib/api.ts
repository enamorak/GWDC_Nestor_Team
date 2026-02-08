const API_BASE = 'http://localhost:8000';

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
  use_extended_demo?: boolean;
};

export type ArbitrageComparison = {
  classical_path: string[];
  classical_profit: number;
  classical_time_ms: number;
  quantum_path: string[];
  quantum_profit: number;
  quantum_time_ms: number;
  improvement_pct: number;
  winner: string;
};

export type ArbitrageResponse = {
  optimal_path: string[];
  expected_profit: number;
  transactions: { pool: string; action: string; amount: number }[];
  simulation_time: number;
  classical_baseline?: number;
  comparison?: ArbitrageComparison;
  quantum_metrics?: { paths_evaluated?: number; max_hops?: number; solver_ms?: number; qubo_approx_vars?: number; annealing_reads?: number };
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

export type SchedulerComparison = {
  classical_slots: number;
  classical_conflicts_remaining: number;
  quantum_slots: number;
  quantum_conflicts_remaining: number;
  slots_reduction_pct: number;
  winner: string;
};

export type SchedulerResponse = {
  schedule: Record<string, string[]>;
  total_slots: number;
  conflict_reduction: string;
  conflict_matrix?: number[][];
  total_conflicts?: number;
  comparison?: SchedulerComparison;
  quantum_metrics?: { graph_nodes?: number; graph_edges?: number; conflict_pairs?: number; coloring_slots?: number; classical_slots_baseline?: number };
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
  gas_estimate?: number;
  debt_amounts?: Record<string, number>;
};

export type LiquidationRequest = {
  positions_to_liquidate: LiquidationPosition[];
  available_liquidity?: Record<string, number>;
  protocol_constraints?: { max_gas_per_block?: number };
};

export type LiquidationComparison = {
  classical_recovery: number;
  classical_selected: string[];
  classical_gas_used?: number;
  classical_constraint_violation?: string;
  quantum_recovery: number;
  quantum_selected: string[];
  quantum_gas_used?: number;
  improvement_pct: number;
  winner: string;
};

export type LiquidationResponse = {
  selected_positions: string[];
  strategy: { position: string; action: string; priority: number }[];
  estimated_recovery: number;
  simulation_time: number;
  comparison?: LiquidationComparison;
  quantum_metrics?: { positions_evaluated?: number; positions_selected?: number; solver_ms?: number; constraints_checked?: string };
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

// --- Quantum Vision: Yield Infra & Prediction Market ---

export type YieldTxRef = { tx_id: string; gas_estimate?: number; protocol?: string };
export type YieldSchedulingRequest = {
  transactions: YieldTxRef[];
  gas_limit?: number;
  gas_per_tx?: number;
};
export type YieldSchedulingComparison = {
  classical_total_gas: number;
  classical_txs_executed: number;
  quantum_total_gas: number;
  quantum_txs_executed: number;
  gas_savings_pct: number;
  winner: string;
};
export type YieldSchedulingResponse = {
  recommended_batches: Record<string, string[]>;
  total_gas_used: number;
  txs_batched: number;
  simulation_time: number;
  comparison?: YieldSchedulingComparison;
  quantum_metrics?: { qubo_vars?: number; gas_limit?: number; solver_ms?: number; batches?: number };
};

export async function runYieldScheduling(
  body: YieldSchedulingRequest
): Promise<YieldSchedulingResponse> {
  const res = await fetch(`${API_BASE}/api/quantum/yield-scheduling`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export type PoolRiskInput = {
  pool_id: string;
  volatility?: number;
  tvl_usd?: number;
  concentration?: number;
  audit_score?: number;
};
export type PoolRiskRequest = { pools: PoolRiskInput[] };
export type PoolRiskComparison = {
  classical_avg_score: number;
  quantum_avg_score: number;
  factors_classical: number;
  factors_quantum: number;
  winner: string;
};
export type PoolRiskScore = {
  pool_id: string;
  classical_score: number;
  quantum_score: number;
  risk_band: string;
};
export type PoolRiskResponse = {
  pool_scores: PoolRiskScore[];
  simulation_time: number;
  comparison?: PoolRiskComparison;
  quantum_metrics?: { pools_evaluated?: number; factors_used?: number; solver_ms?: number };
};

export async function runPoolRisk(
  body: PoolRiskRequest
): Promise<PoolRiskResponse> {
  const res = await fetch(`${API_BASE}/api/quantum/pool-risk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export type PredictionMarketRequest = {
  outcomes?: string[];
  liquidity?: number;
  bet_amount?: number;
};
export type PredictionMarketComparison = {
  classical_slippage_pct: number;
  quantum_slippage_pct: number;
  slippage_reduction_pct: number;
  winner: string;
};
export type PredictionMarketResponse = {
  recommended_curve_params: Record<string, number>;
  execution_price: number;
  slippage_pct: number;
  simulation_time: number;
  comparison?: PredictionMarketComparison;
  quantum_metrics?: { outcomes?: number; solver_ms?: number; curve_updates?: number };
};

export async function runPredictionMarket(
  body: PredictionMarketRequest
): Promise<PredictionMarketResponse> {
  const res = await fetch(`${API_BASE}/api/quantum/prediction-market`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
