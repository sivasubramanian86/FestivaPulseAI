"""Tests for Multimodal extraction service and BudgetElasticityAgent."""

import pytest
from backend.app.services.multimodal_service import MultimodalService, PROTECTED_EVENT_GLOSSARY
from backend.app.agents.budget_elasticity_agent import BudgetElasticityAgent
from backend.app.agents.base import ADKTask
from backend.app.models.budget import BudgetLedger, BudgetCategoryItem


@pytest.fixture
def multimodal_service():
    return MultimodalService()


@pytest.fixture
def sample_budget_ledger():
    return BudgetLedger(
        event_id="test_event_123",
        currency="INR",
        approved_total=500000,
        spent_total=200000,
        committed_unpaid_total=180000,
        uncommitted_planned_total=90000,
        contingency_allocation=30000,
        projected_final_cost=470000,
        variance=30000,
        is_in_deficit=False,
        categories=[
            BudgetCategoryItem(
                category_name="Venue & Sacred Rituals",
                approved_budget=100000,
                spent_amount=60000,
                committed_unpaid=40000,
                uncommitted_planned=0,
                is_protected_anchor=True,
                notes="Sacred Anchor - Cannot cut",
            ),
            BudgetCategoryItem(
                category_name="Catering & Beverages",
                approved_budget=250000,
                spent_amount=100000,
                committed_unpaid=100000,
                uncommitted_planned=50000,
                is_protected_anchor=False,
                notes="Food services",
            ),
            BudgetCategoryItem(
                category_name="Decor & Premium Flowers",
                approved_budget=150000,
                spent_amount=40000,
                committed_unpaid=40000,
                uncommitted_planned=40000,
                is_protected_anchor=False,
                notes="Elastic category",
            ),
        ],
    )


def test_quote_ocr_extraction(multimodal_service):
    raw_quote_text = "Vendor invoice: Jasmine stage arch ₹45,000, lighting setup ₹15,000."
    result = multimodal_service.extract_vendor_quote("quote_jasmine.pdf", raw_quote_text)

    assert result is not None
    assert result["document_name"] == "quote_jasmine.pdf"
    assert result["vendor_name"] == "Samskriti Sustainable Florals & Decor"
    assert len(result["extracted_items"]) > 0
    assert result["total_extracted_amount"] > 0
    assert result["requires_human_verification"] is True


def test_voice_memo_intent_detection(multimodal_service):
    # Test guest surge voice memo
    memo_surge = "We have an extra 70 guests arriving at the main hall right now. Please stretch food."
    parsed_surge = multimodal_service.parse_voice_memo(memo_surge)
    assert parsed_surge["detected_incident"] == "ATTENDANCE_SURGE"
    assert parsed_surge["extracted_parameters"]["new_guests"] == 70
    assert parsed_surge["urgency"] == "HIGH"

    # Test vendor delay voice memo
    memo_delay = "The sound team and priest are late by 40 minutes in traffic."
    parsed_delay = multimodal_service.parse_voice_memo(memo_delay)
    assert parsed_delay["detected_incident"] == "TIMELINE_DELAY"
    assert parsed_delay["urgency"] == "MEDIUM"

    # Test food shortage voice memo
    memo_food = "General veg counter is running out of food and trays are short."
    parsed_food = multimodal_service.parse_voice_memo(memo_food)
    assert parsed_food["detected_incident"] == "FOOD_SHORTAGE"
    assert parsed_food["urgency"] == "CRITICAL"


def test_multilingual_glossary_protection(multimodal_service):
    # Verify supported Indian languages
    languages = multimodal_service.get_supported_languages()
    assert "ta" in languages
    assert "hi" in languages
    assert len(languages) >= 10

    # Verify protected glossary tokens are defined
    assert "Muhurtham" in PROTECTED_EVENT_GLOSSARY
    assert "FSSAI" in PROTECTED_EVENT_GLOSSARY


@pytest.mark.asyncio
async def test_budget_elasticity_agent_rebalance(sample_budget_ledger):
    agent = BudgetElasticityAgent()
    task = ADKTask(
        task_id="task_rebalance_1",
        intent="Rebalance budget after unforeseen expense",
        priority=1,
        assigned_agent="BudgetElasticityAgent",
    )

    # Rebalance with a cut to 460000
    context = {
        "ledger": sample_budget_ledger,
        "revised_budget": 460000,
    }

    result = await agent.execute_task(task, context)
    assert result is not None
    assert result["is_feasible"] is True
    assert result["protected_anchor_total"] > 0
    assert result["pruned_elastic_total"] > 0
