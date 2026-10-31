import {
  EventIntakeRequest,
  EventBlueprint,
  FoodSufficiencyRadar,
  RescueStudioComparison,
  QATestSuiteResponse,
  GenAITelemetryTrace,
  DecisionLedgerEntry,
  ADKSwarmOutput,
} from '../types';

const getApiBase = () => {
  if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null') {
    return `${window.location.origin}/api/v1`;
  }
  return '/api/v1';
};
const API_BASE = getApiBase();

export const api = {
  async health(): Promise<any> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getPresets(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/event/presets/list`);
    if (!res.ok) throw new Error('Failed to load presets');
    return res.json();
  },

  async createEvent(intake: EventIntakeRequest): Promise<{
    event_id: string;
    blueprint: EventBlueprint;
    ledger: any;
    food_radar: FoodSufficiencyRadar;
    timeline: any[];
    telemetry: GenAITelemetryTrace;
    adk_swarm_output?: ADKSwarmOutput;
  }> {
    const res = await fetch(`${API_BASE}/event/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(intake),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to create event');
    }
    return res.json();
  },

  async getEvent(eventId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/event/${eventId}`);
    if (!res.ok) throw new Error(`Event ${eventId} not found`);
    return res.json();
  },

  async updatePulse(eventId: string, data: {
    actual_checked_in: number;
    revised_expected_guests: number;
    category_inventory_update?: Record<string, any>;
    revised_budget?: number;
    delayed_node_id?: string;
    delay_minutes?: number;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/event/${eventId}/pulse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to update pulse');
    }
    return res.json();
  },

  async generateFssaiManifest(eventId: string, data: {
    surplus_kg: number;
    hot_temp_celsius: number;
    cold_temp_celsius: number;
    partner_ngo?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/event/${eventId}/food/fssai-manifest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to generate FSSAI manifest');
    }
    return res.json();
  },

  async proposeRescue(eventId: string, incident: {
    event_id: string;
    incident_type: string;
    entered_values: Record<string, any>;
    source: string;
    observation_time: string;
    is_simulation?: boolean;
  }): Promise<{
    comparison: RescueStudioComparison;
    telemetry: GenAITelemetryTrace;
  }> {
    const res = await fetch(`${API_BASE}/event/${eventId}/rescue/propose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incident),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to propose recovery options');
    }
    return res.json();
  },

  async approveProposal(eventId: string, proposalId: string, reason?: string): Promise<{
    success: boolean;
    decision_entry: DecisionLedgerEntry;
    new_version: number;
    message: string;
  }> {
    const res = await fetch(`${API_BASE}/event/${eventId}/rescue/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proposal_id: proposalId,
        reason_for_approval: reason || 'Approved optimal recovery balance',
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to approve proposal');
    }
    return res.json();
  },

  async runQATestSuite(): Promise<QATestSuiteResponse> {
    const res = await fetch(`${API_BASE}/qa/run-tests`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('QA tests execution failed');
    return res.json();
  },

  async getLanguages(): Promise<Record<string, { name: string; welcome: string }>> {
    const res = await fetch(`${API_BASE}/languages`);
    if (!res.ok) return {};
    const data = await res.json();
    return data.languages || {};
  },

  async searchVenues(location: string = 'Bengaluru', guests: number = 350, budget: number = 1200000): Promise<any> {
    const res = await fetch(`${API_BASE}/event/venues/search?location=${encodeURIComponent(location)}&guests=${guests}&budget=${budget}`);
    if (!res.ok) throw new Error('Failed to retrieve grounded venue halls');
    return res.json();
  },

  async applyVenue(eventId: string, venueId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/event/${eventId}/venues/apply/${venueId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to apply venue selection');
    return res.json();
  },

  async refineBlueprint(eventId: string, userPrompt: string): Promise<any> {
    const res = await fetch(`${API_BASE}/event/${eventId}/refine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_prompt: userPrompt }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to refine celebration blueprint');
    }
    return res.json();
  },

  async generateVisualization(eventId: string | null, prompt: string, lightingMood: string = 'Golden Hour Glow'): Promise<any> {
    const url = eventId ? `${API_BASE}/event/${eventId}/visualize` : `${API_BASE}/event/visualize`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_prompt: prompt,
        lighting_mood: lightingMood,
        aspect_ratio: '16:9',
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to generate celebration visualization');
    }
    return res.json();
  },
};
