"""Base Google ADK Agent Primitives and Vertex AI / GenAI Integration.

Defines ADKTask, ADKMemory, and FestivaAgent base class with dynamic tool injection,
structured output validation, and telemetry tracing.
Adheres to @03_agentic_framework_architect and @05_vertex_model_registry.
"""

from __future__ import annotations

import logging
import time
from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

from backend.app.config import settings

logger = logging.getLogger(__name__)


@dataclass
class ADKTask:
    """ADK Primitive representing a discrete agent task execution context."""

    task_id: str
    intent: str
    priority: int = 1  # 1 = Critical, 2 = High, 3 = Standard
    assigned_agent: str = "FestivaAgent"
    status: str = "PENDING"  # PENDING, IN_PROGRESS, COMPLETED, FAILED
    result: dict[str, Any] | None = None
    created_at: float = field(default_factory=time.time)


class ADKMemory:
    """ADK Memory interface supporting short-term active state scratchpad and long-term audit trail."""

    def __init__(self) -> None:
        self.short_term: dict[str, Any] = {}
        self.long_term: list[dict[str, Any]] = []

    def remember(self, key: str, value: Any) -> None:
        """Stores key-value pair in active session memory."""
        self.short_term[key] = value

    def recall(self, key: str) -> Any | None:
        """Recalls state from active session memory."""
        return self.short_term.get(key)

    def log_long_term(self, entry: dict[str, Any]) -> None:
        """Appends audited state mutation to immutable long-term history."""
        self.long_term.append(entry)

    def clear(self) -> None:
        """Clears memory banks."""
        self.short_term.clear()
        self.long_term.clear()


class FestivaAgent:
    """Base class for all FestivaPulseAI ADK specialist agents.

    Provides model gateway routing, dynamic MCP tool binding, and telemetry.
    """

    def __init__(
        self,
        name: str,
        role: str,
        instruction: str = "Perform domain tasks with maximum precision",
        model_name: str = "gemini-2.5-flash",
    ) -> None:
        self.name = name
        self.role = role
        self.instruction = instruction
        self.model_name = model_name
        self.memory = ADKMemory()
        self.tools: list[Callable[..., Any]] = []
        self._client = None
        self._init_client()

    def _init_client(self) -> None:
        api_key = settings.GEMINI_API_KEY
        if api_key and api_key != "demo_mode_key" and not settings.DEMO_MODE:
            try:
                from google import genai

                self._client = genai.Client(api_key=api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize GenAI client for agent {self.name}: {e}")
                self._client = None

    def register_tool(self, tool_fn: Callable[..., Any]) -> None:
        """Registers a callable tool (MCP or Agentic RAG) into the agent's capability bank."""
        self.tools.append(tool_fn)

    async def execute_task(self, task: ADKTask, context: dict[str, Any]) -> dict[str, Any]:
        """Executes the assigned task using either live Gemini inference or deterministic synthesis."""
        task.status = "IN_PROGRESS"
        start_time = time.time()

        try:
            output = await self._run_logic(task, context)
            task.status = "COMPLETED"
            task.result = output
            latency_ms = int((time.time() - start_time) * 1000)
            output["_meta"] = {
                "agent": self.name,
                "latency_ms": latency_ms,
                "task_id": task.task_id,
                "is_live_model": self._client is not None,
            }
            return output
        except Exception as e:
            logger.error(f"Error in agent {self.name} on task {task.task_id}: {e}")
            task.status = "FAILED"
            return {"error": str(e), "agent": self.name}

    async def _run_logic(self, task: ADKTask, context: dict[str, Any]) -> dict[str, Any]:
        """Sub-classes must implement specific domain reasoning."""
        raise NotImplementedError("Sub-classes must implement _run_logic")
