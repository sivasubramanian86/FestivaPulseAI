"""Inventory and Catering models for FestivaPulseAI.

Implements category-level tracking and FSSAI surplus compliance
adhering to @04_responsible_ai_ethics and domain invariants.
"""

from __future__ import annotations
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class MealCategory(str, Enum):
    GENERAL_VEG = "General Vegetarian"
    VEGAN = "Vegan"
    JAIN = "Jain (Satvik)"
    NON_VEG = "Non-Vegetarian"
    ALLERGY_SAFE = "Allergy Safe"
    CHILDREN = "Children's Meals"
    STAFF_VENDOR = "Staff & Vendor Meals"


class MealInventoryState(str, Enum):
    AVAILABLE = "Available"
    RESERVED = "Reserved"
    SERVED = "Served"
    WASTED_DISPOSED = "Wasted/Disposed"
    CONFIRMED_INBOUND = "Confirmed Inbound"


class CategoryPortionStatus(BaseModel):
    category: MealCategory
    required_portions: int
    prepared_portions: int
    served_portions: int
    available_portions: int
    reserved_portions: int
    confirmed_inbound: int
    net_shortfall_or_surplus: int  # Negative = Shortfall, Positive = Surplus
    burn_rate_plates_per_min: float = 0.0
    depletion_projected_minutes: Optional[int] = None
    supplier_lead_time_minutes: int = 30
    is_critical_shortage: bool = False


class FSSAISurplusManifest(BaseModel):
    manifest_id: str
    timestamp: str
    event_id: str
    surplus_kg_total: float
    hot_holding_temp_celsius: float = Field(..., description="FSSAI standard: must be >= 63°C")
    cold_holding_temp_celsius: float = Field(..., description="FSSAI standard: must be <= 5°C")
    is_temperature_compliant: bool
    tamper_evident_packaging_verified: bool
    registered_ngo_partner: str  # e.g., "Feeding India" or "Robin Hood Army"
    ngo_contact_phone: str
    pickup_window_deadline: str
    carbon_emissions_prevented_kg: float
    csr_tax_deduction_inr: float
    responsible_person_signature: str


class FoodSufficiencyRadar(BaseModel):
    event_id: str
    timestamp: str
    overall_attendance_expected: int
    actual_checked_in: int
    categories: List[CategoryPortionStatus]
    total_shortfall_count: int
    total_surplus_count: int
    fssai_manifest: Optional[FSSAISurplusManifest] = None
    stale_data_warning: bool = False
