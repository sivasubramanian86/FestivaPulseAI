"""Telemetry, GenAI X-Ray, and Decision Ledger models for FestivaPulseAI.

Adheres to @01_memory_manager and @21_hackathon_demo_pipeline.
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class GenAITelemetryTrace(BaseModel):
    trace_id: str
    timestamp: str
    active_agent: str
    purpose: str
    raw_prompt_sent: str
    structured_json_response: dict[str, Any]
    latency_ms: int
    token_usage_estimated: int
    dynamic_diff_summary: str
    is_live_call: bool = True


class DecisionLedgerEntry(BaseModel):
    entry_id: str
    timestamp: str
    event_id: str
    actor: str = "Host / Event Coordinator"
    what_changed: str
    why_it_changed: str
    original_values: dict[str, Any]
    revised_values: dict[str, Any]
    calculations_executed: str
    gemini_recommendation: str
    human_approved: bool = True
    plan_version: int
