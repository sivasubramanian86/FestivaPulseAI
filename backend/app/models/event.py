"""Event data models and contracts for FestivaPulseAI.

Strict Pydantic v2 validation adhering to @07_modern_polyglot_standards
and @10_security_governance.
"""

from __future__ import annotations
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr, field_validator
import re


class EventType(str, Enum):
    WEDDING = "Wedding"
    BIRTHDAY = "Birthday"
    COMMUNITY_EVENT = "Community Event"


class DietaryRequirement(BaseModel):
    general_veg_pct: int = Field(default=60, ge=0, le=100)
    vegan_pct: int = Field(default=10, ge=0, le=100)
    jain_pct: int = Field(default=10, ge=0, le=100)
    non_veg_pct: int = Field(default=20, ge=0, le=100)
    allergy_specific_count: int = Field(default=0, ge=0)
    children_meals_count: int = Field(default=15, ge=0)
    staff_vendor_meals_count: int = Field(default=20, ge=0)

    @field_validator("non_veg_pct")
    @classmethod
    def validate_sum(cls, v: int, info) -> int:
        data = info.data
        total = data.get("general_veg_pct", 0) + data.get("vegan_pct", 0) + data.get("jain_pct", 0) + v
        if total != 100:
            raise ValueError(f"Dietary percentages must sum to exactly 100% (currently {total}%)")
        return v


class EventPreferences(BaseModel):
    cultural_vibe: str = Field(
        default="Traditional South Indian with classical fusion and sustainable decor",
        min_length=3,
        max_length=300
    )
    elders_comfort_priority: bool = Field(default=True, description="Wheelchair routes, seating near dais, quiet dining")
    healthy_lifestyle_focus: bool = Field(default=True, description="Low-sugar, steamed options, millets, organic produce")
    kids_activity_zone: bool = Field(default=True, description="Dedicated play area, craft tables, child-safe menu")
    sound_curfew_time: str = Field(default="22:00", description="Strict police acoustic limit cutoff")
    special_notes: Optional[str] = Field(default=None, max_length=500)


class EventIntakeRequest(BaseModel):
    event_name: str = Field(..., min_length=3, max_length=120, description="Title of the celebration")
    event_type: EventType = Field(..., description="Wedding, Birthday, or Community Event")
    organizer_email: EmailStr = Field(..., description="RFC-compliant organizer email")
    target_date: str = Field(..., description="ISO Date string YYYY-MM-DD")
    location: str = Field(..., min_length=2, max_length=150, description="City / Venue Name")
    expected_guests: int = Field(..., ge=10, le=10000, description="Expected guest attendance (10 to 10,000)")
    max_venue_capacity: int = Field(..., ge=10, le=15000, description="Approved HSE venue fire capacity")
    total_budget: int = Field(..., ge=1000, le=500000000, description="Total budget in integer currency units (₹ or $)")
    currency: str = Field(default="INR", min_length=3, max_length=3)
    dietary: DietaryRequirement = Field(default_factory=DietaryRequirement)
    preferences: EventPreferences = Field(default_factory=EventPreferences)

    @field_validator("target_date")
    @classmethod
    def validate_date_format(cls, v: str) -> str:
        date_regex = r"^\d{4}-\d{2}-\d{2}$"
        if not re.match(date_regex, v):
            raise ValueError("Target date must be in YYYY-MM-DD format")
        year = int(v.split("-")[0])
        if year < 2024 or year > 2035:
            raise ValueError("Target date year must be between 2024 and 2035")
        return v

    @field_validator("max_venue_capacity")
    @classmethod
    def validate_capacity_vs_guests(cls, v: int, info) -> int:
        guests = info.data.get("expected_guests")
        if guests and v < guests:
            raise ValueError(f"Venue capacity ({v}) cannot be less than expected guests ({guests})")
        return v


class MilestoneItem(BaseModel):
    phase: str  # e.g., "T-30 Days", "T-7 Days", "Day of Event"
    task_name: str
    owner: str
    is_completed: bool = False
    deadline: str


class VendorSLAItem(BaseModel):
    vendor_type: str  # e.g., "Caterer", "AV & Acoustics", "Decor", "Priest/Officiant"
    vendor_name: str
    quote_amount: int
    advance_paid: int
    pending_amount: int
    sla_requirement: str
    backup_vendor_contact: str
    arrival_time: str


class EventBlueprint(BaseModel):
    id: str
    event_name: str
    event_type: EventType
    location: str
    target_date: str
    expected_guests: int
    max_venue_capacity: int = 350
    total_budget: int
    currency: str
    executive_summary: str
    personalized_themes: List[str]
    intergenerational_features: List[str]  # Elders, young adults, children specific arrangements
    milestones: List[MilestoneItem]
    vendor_slas: List[VendorSLAItem]
    initial_risks_and_contingencies: List[str]
    unverified_assumptions: List[str]
    created_at: str
    version: int = 1
