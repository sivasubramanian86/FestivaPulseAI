"""Unit tests for Grounded Venue RAG Service.

Validates semantic and spatial grounded retrieval of celebration halls,
fallback mechanisms, ID lookup, and deterministic investment calculations.
"""

import pytest

from backend.app.services.venue_rag_service import (
    VenueHallItem,
    VenueRAGService,
)


@pytest.mark.unit
class TestVenueRAGService:
    """Test suite for Venue R A G Service."""

    def test_registry_populated(self) -> None:
        """Verifies registry populated."""
        service = VenueRAGService()
        assert len(service.registry) >= 10
        for hall in service.registry:
            assert isinstance(hall, VenueHallItem)
            assert hall.capacity_max >= hall.capacity_min
            assert hall.rag_grounding_score >= 0.90
            assert hall.per_plate_veg_inr > 0

    def test_search_halls_city_match(self) -> None:
        """Verifies search halls city match."""
        service = VenueRAGService()
        results = service.search_halls(location="Chennai, Tamil Nadu", expected_guests=300, budget=1000000)
        assert len(results) > 0
        assert any("chennai" in h.city.lower() for h in results)

    def test_search_halls_area_and_name_match(self) -> None:
        """Verifies search halls area and name match."""
        service = VenueRAGService()
        results = service.search_halls(location="Palace Grounds", expected_guests=400, budget=1500000)
        assert len(results) > 0
        assert results[0].city.lower() == "bengaluru"

    def test_search_halls_fallback_to_bengaluru(self) -> None:
        """Verifies search halls fallback to bengaluru."""
        service = VenueRAGService()
        # Query with completely unindexed location token
        results = service.search_halls(location="zzzzzzzzzz", expected_guests=200, budget=800000)
        assert len(results) > 0
        assert all(h.city.lower() == "bengaluru" for h in results)

    def test_get_hall_by_id_found_and_not_found(self) -> None:
        """Verifies get hall by id found and not found."""
        service = VenueRAGService()
        hall = service.get_hall_by_id("blr-palace-glasshouse")
        assert hall is not None
        assert hall.name == "Palace Grounds Botanical Glasshouse & Lawns"

        missing = service.get_hall_by_id("non-existent-hall-id")
        assert missing is None

    def test_calculate_hall_investment_plan(self) -> None:
        """Verifies calculate hall investment plan."""
        service = VenueRAGService()
        hall = service.get_hall_by_id("blr-palace-glasshouse")
        assert hall is not None

        plan = service.calculate_hall_investment_plan(hall, guests=350, currency="INR")
        assert plan["venue_id"] == "blr-palace-glasshouse"
        assert plan["base_rental_inr"] == hall.base_rental_inr
        assert plan["catering_cost_inr"] == 350 * hall.per_plate_veg_inr
        assert plan["decor_cost_inr"] == int(hall.base_rental_inr * 0.6)
        assert plan["av_sound_cost_inr"] == int(hall.base_rental_inr * 0.35)
        expected_total = (
            hall.base_rental_inr
            + (350 * hall.per_plate_veg_inr)
            + int(hall.base_rental_inr * 0.6)
            + int(hall.base_rental_inr * 0.35)
        )
        assert plan["total_estimated_inr"] == expected_total
