"""
Pydantic models for quantum module requests/responses.
"""

from pydantic import BaseModel
from typing import Optional


class PoolInput(BaseModel):
    address: str
    tokens: list[str]
    reserves: list[float]
    fee: int = 300  # basis points


class ArbitrageRequest(BaseModel):
    token_in: str
    token_out: str
    pools: list[PoolInput]
    max_hops: int = 3
    amount_in: float = 1000.0


class TransactionRef(BaseModel):
    pool: str
    action: str = "swap"
    amount: float


class ArbitrageResponse(BaseModel):
    optimal_path: list[str]
    expected_profit: float
    transactions: list[TransactionRef]
    simulation_time: float  # ms
    classical_baseline: Optional[float] = None


# --- Scheduler ---


class PendingOrder(BaseModel):
    id: str
    type: str = "swap"
    pair: str
    account: str
    reads: list[str]
    writes: list[str]


class SchedulerRequest(BaseModel):
    pending_orders: list[PendingOrder]
    conflict_matrix: Optional[list[list[int]]] = None  # computed if not provided


class SchedulerResponse(BaseModel):
    schedule: dict[str, list[str]]  # slot_id -> order_ids
    total_slots: int
    conflict_reduction: str
    conflict_matrix: Optional[list[list[int]]] = None  # for heatmap
    total_conflicts: int = 0


# --- Liquidation ---


class PositionToLiquidate(BaseModel):
    position_id: str
    collateral: list[str]
    debt: list[str]
    health_factor: float
    liquidation_bonus: float = 0.1


class LiquidationRequest(BaseModel):
    positions_to_liquidate: list[PositionToLiquidate]
    available_liquidity: Optional[dict] = None
    protocol_constraints: Optional[dict] = None


class LiquidationResponse(BaseModel):
    selected_positions: list[str]
    strategy: list[dict]  # e.g. [{"position": "pos_1", "action": "liquidate", "priority": 1}]
    estimated_recovery: float
    simulation_time: float
