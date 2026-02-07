"""
Pharos Network gateway: pool data, network stats.
Uses real Pharos Testnet (AtlanticOcean) when RPC is available.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from services.pharos_fetcher import get_pharos_fetcher

router = APIRouter()


class PoolInfo(BaseModel):
    address: str
    tokens: list[str]
    reserves: list[float]
    fee: int  # basis points


class NetworkStats(BaseModel):
    block_number: Optional[int] = None
    chain_id: Optional[int] = None
    connected: bool
    message: Optional[str] = None
    gas_price: Optional[int] = None


@router.get("/network")
async def network_status() -> NetworkStats:
    """Return Pharos testnet connection status and basic stats."""
    fetcher = get_pharos_fetcher()
    data = await fetcher.get_network_stats()
    return NetworkStats(**data)


@router.get("/pools")
async def list_pools() -> list[PoolInfo]:
    """Return cached list of DEX pools (from fetcher or fallback demo data)."""
    fetcher = get_pharos_fetcher()
    pools = await fetcher.get_pools()
    return [PoolInfo(**p) for p in pools]
