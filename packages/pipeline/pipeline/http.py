import httpx
from loguru import logger

from pipeline.config import settings


def client(timeout: float = 30.0, follow_redirects: bool = True) -> httpx.Client:
    return httpx.Client(
        headers={"User-Agent": settings.user_agent, "Accept-Language": "nb,en"},
        timeout=timeout,
        follow_redirects=follow_redirects,
    )


def get_json(url: str, **params) -> dict:
    with client() as c:
        r = c.get(url, params=params)
        r.raise_for_status()
        logger.debug("GET {} -> {}", url, r.status_code)
        return r.json()


def get_bytes(url: str) -> bytes:
    with client() as c:
        r = c.get(url)
        r.raise_for_status()
        logger.debug("GET {} -> {} ({} bytes)", url, r.status_code, len(r.content))
        return r.content
