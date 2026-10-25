"""FestivaPulseAI — Google Cloud Pub/Sub Streaming Service.

Provides asynchronous event stream ingestion for live venue telemetry and incident chaos.
Supports Google Cloud Pub/Sub with in-memory non-blocking event-bus fallback.
Adheres to @02_system_architect and @17_devops_sre_deployer.
"""

import asyncio
import json
import logging
from typing import Any, Callable

from backend.app.config import settings

logger = logging.getLogger(__name__)


class PubSubService:
    """Manages real-time telemetry streaming and chaos event queuing."""

    def __init__(self):
        self._publisher = None
        self._is_cloud_enabled = False
        self._local_bus: dict[str, list[Callable[[dict[str, Any]], Any]]] = {
            settings.PUBSUB_TELEMETRY_TOPIC: [],
            settings.PUBSUB_CHAOS_TOPIC: [],
        }
        self._in_memory_queue: list[dict[str, Any]] = []

        if settings.ENABLE_PUBSUB:
            self._init_cloud_pubsub()

    def _init_cloud_pubsub(self):
        try:
            from google.cloud import pubsub_v1

            self._publisher = pubsub_v1.PublisherClient()
            self._is_cloud_enabled = True
            logger.info(f"[PUBSUB] Connected to Google Cloud Pub/Sub (Project: {settings.GCP_PROJECT_ID})")
        except Exception as e:
            logger.warning(f"[PUBSUB] Cloud Pub/Sub bypassed ({e}). Operating in asynchronous local bus mode.")
            self._publisher = None
            self._is_cloud_enabled = False

    @property
    def is_cloud_enabled(self) -> bool:
        return self._is_cloud_enabled

    async def publish_telemetry(self, event_id: str, data: dict[str, Any]) -> str:
        """Publishes live pulse telemetry (attendance, buffet line flow, sound decibels)."""
        payload = {
            "event_id": event_id,
            "stream_type": "LIVE_PULSE_TELEMETRY",
            "data": data,
        }
        return await self._dispatch_message(settings.PUBSUB_TELEMETRY_TOPIC, payload)

    async def publish_chaos_incident(self, event_id: str, incident_data: dict[str, Any]) -> str:
        """Publishes event chaos/stress scenarios to trigger swarm triage."""
        payload = {
            "event_id": event_id,
            "stream_type": "CHAOS_INJECTION",
            "data": incident_data,
        }
        return await self._dispatch_message(settings.PUBSUB_CHAOS_TOPIC, payload)

    async def _dispatch_message(self, topic_name: str, payload: dict[str, Any]) -> str:
        encoded = json.dumps(payload).encode("utf-8")
        msg_id = f"MSG-{asyncio.get_event_loop().time()}"

        if self._is_cloud_enabled and self._publisher:
            try:
                topic_path = self._publisher.topic_path(settings.GCP_PROJECT_ID, topic_name)
                future = self._publisher.publish(topic_path, encoded)
                cloud_msg_id = future.result()
                logger.info(f"[PUBSUB] Dispatched to Cloud Pub/Sub: {cloud_msg_id}")
                return cloud_msg_id
            except Exception as e:
                logger.error(f"[PUBSUB] Cloud publish failed: {e}. Falling back to in-memory bus.")

        # In-memory local bus dispatch
        self._in_memory_queue.append(payload)
        subscribers = self._local_bus.get(topic_name, [])
        for sub in subscribers:
            try:
                if asyncio.iscoroutinefunction(sub):
                    await sub(payload)
                else:
                    sub(payload)
            except Exception as sub_err:
                logger.error(f"[PUBSUB] Local subscriber error: {sub_err}")

        return msg_id

    def subscribe(self, topic_name: str, callback: Callable[[dict[str, Any]], Any]):
        """Registers a listener for live stream events."""
        if topic_name not in self._local_bus:
            self._local_bus[topic_name] = []
        self._local_bus[topic_name].append(callback)

    def get_buffered_events(self) -> list[dict[str, Any]]:
        """Returns in-memory buffered stream events."""
        return list(self._in_memory_queue)


pubsub_service = PubSubService()
