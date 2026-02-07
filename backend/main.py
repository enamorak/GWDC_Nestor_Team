"""
Quantum-Hybrid DEX Accelerator (QHDA) - Classical Core API
Proof-of-concept backend for quantum simulation and Pharos integration.
"""

import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import health, quantum, pharos
from core.config import settings

_background_task: asyncio.Task | None = None


async def _pool_refresh_loop():
    """Refresh pool cache every 30 seconds (TTL aligned)."""
    from services.pharos_fetcher import get_pharos_fetcher
    fetcher = get_pharos_fetcher()
    while True:
        try:
            await asyncio.sleep(settings.POOL_CACHE_TTL_SECONDS)
            await fetcher.get_pools()
        except asyncio.CancelledError:
            break
        except Exception:
            pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _background_task
    _background_task = asyncio.create_task(_pool_refresh_loop())
    yield
    if _background_task:
        _background_task.cancel()
        try:
            await _background_task
        except asyncio.CancelledError:
            pass


app = FastAPI(
    title="QHDA API",
    description="Classical Core API for Quantum-Hybrid DEX Accelerator prototype",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(quantum.router, prefix="/api/quantum", tags=["Quantum"])
app.include_router(pharos.router, prefix="/api/pharos", tags=["Pharos"])


@app.get("/")
async def root():
    return {
        "service": "QHDA Classical Core API",
        "docs": "/docs",
        "status": "experimental",
        "disclaimer": "This is a research prototype. Not production-ready.",
    }
