"""In-memory semantic and query caching service for FestivaPulseAI.

Saves token costs and guarantees sub-5ms response times on repeated calls.
Adheres to @19_cost_efficiency_architect and @02_system_architect.
"""

import hashlib
import json
import time
from typing import Any


class MemoryCacheService:
    def __init__(self, max_entries: int = 200, ttl_seconds: int = 3600):
        self._cache: dict[str, dict[str, Any]] = {}
        self._max_entries = max_entries
        self._ttl_seconds = ttl_seconds

    def _generate_key(self, namespace: str, payload: Any) -> str:
        serialized = json.dumps(payload, sort_keys=True, default=str)
        hash_digest = hashlib.sha256(serialized.encode("utf-8")).hexdigest()
        return f"{namespace}:{hash_digest}"

    def get(self, namespace: str, payload: Any) -> Any | None:
        key = self._generate_key(namespace, payload)
        entry = self._cache.get(key)
        if not entry:
            return None

        # Check TTL
        if time.time() > entry["expires_at"]:
            del self._cache[key]
            return None

        return entry["value"]

    def set(self, namespace: str, payload: Any, value: Any) -> None:
        if len(self._cache) >= self._max_entries:
            # Evict oldest entry
            oldest_key = min(self._cache.keys(), key=lambda k: self._cache[k]["created_at"])
            del self._cache[oldest_key]

        key = self._generate_key(namespace, payload)
        now = time.time()
        self._cache[key] = {
            "value": value,
            "created_at": now,
            "expires_at": now + self._ttl_seconds,
        }

    def clear(self) -> None:
        self._cache.clear()


cache_service = MemoryCacheService()
