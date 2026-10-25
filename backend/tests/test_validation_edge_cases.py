"""Edge case and input validation tests for FestivaPulseAI.

Verifies that invalid numeric inputs, negative budgets, zero guests,
malformed email, and capacity conflicts are caught by Pydantic models.
Adheres to @08_polyglot_tdd_engineer and @10_security_governance.
"""

import pytest
from pydantic import ValidationError
from backend.app.models.event import (
    EventIntakeRequest,
    EventType,
    DietaryRequirement,
    EventPreferences,
)


def test_validation_rejects_negative_budget():
    """Verifies that budget must be positive and >= 1000."""
    with pytest.raises(ValidationError) as exc_info:
        EventIntakeRequest(
            event_name="Diwali Community Gala",
            event_type=EventType.COMMUNITY_EVENT,
            organizer_email="organizer@festivapulse.org",
            target_date="2026-11-12",
            location="Tirunelveli Hall",
            expected_guests=250,
            max_venue_capacity=350,
            total_budget=-5000,  # Invalid negative budget!
        )
    errors = str(exc_info.value)
    assert "greater_than_equal" in errors or "Input should be greater than or equal to 1000" in errors


def test_validation_rejects_zero_guests():
    """Verifies that expected guests must be >= 10."""
    with pytest.raises(ValidationError) as exc_info:
        EventIntakeRequest(
            event_name="Birthday Party",
            event_type=EventType.BIRTHDAY,
            organizer_email="host@party.com",
            target_date="2026-12-05",
            location="Hotel Grand Banquet",
            expected_guests=0,  # Invalid zero guests!
            max_venue_capacity=100,
            total_budget=50000,
        )
    errors = str(exc_info.value)
    assert "greater_than_equal" in errors or "Input should be greater than or equal to 10" in errors


def test_validation_rejects_capacity_less_than_guests():
    """Verifies that approved venue capacity cannot be smaller than invited guests."""
    with pytest.raises(ValidationError) as exc_info:
        EventIntakeRequest(
            event_name="Grand Wedding Reception",
            event_type=EventType.WEDDING,
            organizer_email="planner@weddings.in",
            target_date="2026-10-18",
            location="Royal Palace Lawn",
            expected_guests=500,
            max_venue_capacity=300,  # HSE breach: venue capacity smaller than guests!
            total_budget=1500000,
        )
    errors = str(exc_info.value)
    assert "Venue capacity (300) cannot be less than expected guests (500)" in errors


def test_validation_rejects_invalid_email():
    """Verifies strict RFC email validation."""
    with pytest.raises(ValidationError) as exc_info:
        EventIntakeRequest(
            event_name="Corporate Celebration",
            event_type=EventType.COMMUNITY_EVENT,
            organizer_email="invalid-email-format",  # Malformed email!
            target_date="2026-09-20",
            location="Tech Park Auditorium",
            expected_guests=150,
            max_venue_capacity=200,
            total_budget=300000,
        )
    errors = str(exc_info.value)
    assert "value is not a valid email address" in errors or "valid email" in errors


def test_validation_rejects_dietary_percentages_not_summing_to_100():
    """Verifies dietary breakdown integrity."""
    with pytest.raises(ValidationError) as exc_info:
        DietaryRequirement(
            general_veg_pct=50,
            vegan_pct=20,
            jain_pct=10,
            non_veg_pct=10  # Sums to 90%, NOT 100%!
        )
    errors = str(exc_info.value)
    assert "Dietary percentages must sum to exactly 100%" in errors
