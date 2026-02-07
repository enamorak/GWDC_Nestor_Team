"""
Quantum simulation API: arbitrage, scheduler, liquidation.
All computations use classical simulators (simulated annealing / QUBO) for PoC.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from services.quantum_simulator import (
    solve_arbitrage,
    solve_scheduler,
    solve_liquidation,
)
from models.quantum import (
    ArbitrageRequest,
    ArbitrageResponse,
    SchedulerRequest,
    SchedulerResponse,
    LiquidationRequest,
    LiquidationResponse,
)

router = APIRouter()


@router.get("/status")
async def quantum_status():
    """Simulator status: classical (simulated annealing) for PoC."""
    return {
        "backend": "classical",
        "simulator": "dimod/neal (simulated annealing)",
        "ready": True,
        "message": "Quantum computations are simulated for this prototype.",
    }


@router.post("/arbitrage", response_model=ArbitrageResponse)
async def api_arbitrage(req: ArbitrageRequest):
    """Quantum Arbitrage Pathfinder: find optimal path across pools (QUBO + simulated annealing)."""
    return await solve_arbitrage(req)


@router.post("/scheduler", response_model=SchedulerResponse)
async def api_scheduler(req: SchedulerRequest):
    """Quantum Transaction Scheduler: minimize conflicts (graph coloring QUBO)."""
    return await solve_scheduler(req)


@router.post("/liquidation", response_model=LiquidationResponse)
async def api_liquidation(req: LiquidationRequest):
    """Quantum Liquidation Optimizer: optimal set of positions to liquidate."""
    return await solve_liquidation(req)
