from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    PHAROS_RPC_URL: str = "https://atlantic.ocean.pharos.network"
    REDIS_URL: str = "redis://localhost:6379"
    DATABASE_URL: str = "postgresql+asyncpg://qhda:qhda@localhost:5432/qhda"
    # Comma-separated origins for CORS (e.g. for Vercel: https://your-app.vercel.app)
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    POOL_CACHE_TTL_SECONDS: int = 30

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def cors_origins_list(self) -> list[str]:
        return [x.strip() for x in self.CORS_ORIGINS.split(",") if x.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
