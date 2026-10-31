/**
 * FestivaPulseAI — Domain TypeScript Schema and Type Definitions.
 * Aligns with backend Pydantic models for zero-drift type safety.
 */

export type EventType = 'Wedding' | 'Birthday' | 'Community Event';

export interface DietaryRequirement {
  general_veg_pct: number;
  vegan_pct: number;
  jain_pct: number;
  non_veg_pct: number;
  allergy_specific_count: number;
  children_meals_count: number;
  staff_vendor_meals_count: number;
}

export interface EventPreferences {
  cultural_vibe: string;
  elders_comfort_priority: boolean;
  healthy_lifestyle_focus: boolean;
  kids_activity_zone: boolean;
  sound_curfew_time: string;
  special_notes?: string;
}

export interface EventIntakeRequest {
  event_name: string;
  event_type: EventType;
  organizer_email: string;
  target_date: string;
  location: string;
  expected_guests: number;
  max_venue_capacity: number;
  total_budget: number;
  currency: string;
  dietary: DietaryRequirement;
  preferences: EventPreferences;
}

export interface MilestoneItem {
  phase: string;
  task_name: string;
  owner: string;
  is_completed: boolean;
  deadline: string;
}

export interface VendorSLAItem {
  vendor_type: string;
  vendor_name: string;
  quote_amount: number;
  advance_paid: number;
  pending_amount: number;
  sla_requirement: string;
  backup_vendor_contact: string;
  arrival_time: string;
}

export interface EventBlueprint {
  id: string;
  event_name: string;
  event_type: EventType;
  location: string;
  target_date: string;
  expected_guests: number;
  max_venue_capacity: number;
  total_budget: number;
  currency: string;
  executive_summary: string;
  personalized_themes: string[];
  intergenerational_features: string[];
  milestones: MilestoneItem[];
  vendor_slas: VendorSLAItem[];
  initial_risks_and_contingencies: string[];
  unverified_assumptions: string[];
  created_at: string;
  version: number;
}

export interface CategoryPortionStatus {
  category: string;
  required_portions: number;
  prepared_portions: number;
  served_portions: number;
  available_portions: number;
  reserved_portions: number;
  confirmed_inbound: number;
  net_shortfall_or_surplus: number;
  burn_rate_plates_per_min: number;
  depletion_projected_minutes: number | null;
  supplier_lead_time_minutes: number;
  is_critical_shortage: boolean;
}

export interface FSSAISurplusManifest {
  manifest_id: string;
  timestamp: string;
  event_id: string;
  surplus_kg_total: number;
  hot_holding_temp_celsius: number;
  cold_holding_temp_celsius: number;
  is_temperature_compliant: boolean;
  tamper_evident_packaging_verified: boolean;
  registered_ngo_partner: string;
  ngo_contact_phone: string;
  pickup_window_deadline: string;
  carbon_emissions_prevented_kg: number;
  csr_tax_deduction_inr: number;
  responsible_person_signature: string;
}

export interface FoodSufficiencyRadar {
  event_id: string;
  timestamp: string;
  overall_attendance_expected: number;
  actual_checked_in: number;
  categories: CategoryPortionStatus[];
  total_shortfall_count: number;
  total_surplus_count: number;
  fssai_manifest?: FSSAISurplusManifest;
  stale_data_warning: boolean;
}

export interface BudgetCategoryItem {
  category_name: string;
  approved_budget: number;
  spent_amount: number;
  committed_unpaid: number;
  uncommitted_planned: number;
  is_protected_anchor: boolean;
  notes: string;
}

export interface BudgetLedger {
  event_id: string;
  currency: string;
  approved_total: number;
  spent_total: number;
  committed_unpaid_total: number;
  uncommitted_planned_total: number;
  contingency_allocation: number;
  projected_final_cost: number;
  variance: number;
  is_in_deficit: boolean;
  categories: BudgetCategoryItem[];
}

export interface TimelineNode {
  node_id: string;
  title: string;
  owner: string;
  scheduled_start: string;
  scheduled_end: string;
  duration_minutes: number;
  dependencies: string[];
  is_fixed_contractual_window: boolean;
  curfew_alert: boolean;
  status: string;
}

export interface RecoveryProposal {
  proposal_id: string;
  strategy_type: string;
  summary: string;
  action_items: string[];
  additional_cost: number;
  remaining_budget_projected: number;
  guests_covered: number;
  timeline_impact_minutes: number;
  vendor_dependencies: string[];
  unresolved_constraints: string[];
  actions_requiring_human_approval: string[];
  is_feasible: boolean;
  infeasibility_reason?: string;
}

export interface RescueStudioComparison {
  incident_id: string;
  event_id: string;
  timestamp: string;
  incident_summary: string;
  candidate_lowest_cost: RecoveryProposal;
  candidate_best_experience: RecoveryProposal;
  candidate_lowest_disruption: RecoveryProposal;
  rejected_proposals: RecoveryProposal[];
  system_advisory: string;
}

export interface DecisionLedgerEntry {
  entry_id: string;
  timestamp: string;
  event_id: string;
  actor: string;
  what_changed: string;
  why_it_changed: string;
  original_values: Record<string, any>;
  revised_values: Record<string, any>;
  calculations_executed: string;
  gemini_recommendation: string;
  human_approved: boolean;
  plan_version: number;
}

export interface GenAITelemetryTrace {
  trace_id: string;
  timestamp: string;
  active_agent: string;
  purpose: string;
  raw_prompt_sent: string;
  structured_json_response: Record<string, any>;
  latency_ms: number;
  token_usage_estimated: number;
  dynamic_diff_summary: string;
  is_live_call: boolean;
}

export interface QATestResult {
  id: string;
  name: string;
  category: string;
  status: 'PASS' | 'FAIL';
  duration_ms: number;
  assertion: string;
}

export interface QATestSuiteResponse {
  success: boolean;
  all_passed: boolean;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  total_duration_ms: number;
  results: QATestResult[];
}

export interface ADKAgentTrace {
  id: string;
  name: string;
  role: string;
  model: string;
  is_live: boolean;
  latency: string;
  status: string;
  color: string;
  tools: string[];
  reasoning: string;
}

export interface ADKPredictions {
  crowd_velocity: {
    peak_hour: string;
    bottleneck_risk: string;
    occupancy_rate_pct: number;
    arrival_distribution: Array<{ time: string; arrival_pct: number; description: string }>;
    evacuation_clearance_seconds: number;
  };
  catering_depletion: {
    batch_1_hot_serve_pct: number;
    batch_2_mid_serve_pct: number;
    batch_3_demand_flex_pct: number;
    predicted_surplus_kg: number;
    safe_consumption_window_hours: number;
    fssai_cold_chain_sla_mins: number;
  };
  timeline_risk: {
    curfew_compliance_probability_pct: number;
    critical_path_buffer_minutes: number;
    police_acoustic_limit_dba: number;
    delay_cascade_risk: string;
  };
  budget_elasticity: {
    anchor_protection_pct: number;
    cost_overrun_probability_pct: number;
    emergency_contingency_fund_inr: number;
  };
}

export interface ADKSwarmOutput {
  is_live_gemini: boolean;
  model_name: string;
  orchestration_time: number;
  adk_master_summary: string;
  summary?: string;
  adk_predictions: ADKPredictions;
  agents: ADKAgentTrace[];
  themes?: string[];
  intergenerational_features?: string[];
}
