/**
 * FestivaPulseAI — FestivaPulseAI module.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CelebrationBlueprint } from '../../components/CelebrationBlueprint';
import { EventBlueprint } from '../../types';

describe('CelebrationBlueprint Integration Tests', () => {
  it('displays validation error alerts when invalid input preset is triggered', () => {
    render(
      <CelebrationBlueprint
        blueprint={null}
        onGenerateBlueprint={vi.fn().mockResolvedValue(undefined)}
        loading={false}
      />
    );

    const errorPresetBtn = screen.getByRole('button', { name: /Test Error State/i });
    fireEvent.click(errorPresetBtn);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText(/Organizer email "bad-email-format" is invalid/i)).toBeInTheDocument();
  });

  it('populates fields and submits intake request on preset selection', () => {
    const handleGenerate = vi.fn().mockResolvedValue(undefined);

    render(
      <CelebrationBlueprint
        blueprint={null}
        onGenerateBlueprint={handleGenerate}
        loading={false}
      />
    );

    const presetBtn = screen.getByRole('button', { name: /Wedding \(₹18L\)/i });
    fireEvent.click(presetBtn);

    expect(
      screen.getByDisplayValue(/Kalyana Mandapam Traditional Wedding/i)
    ).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Generate Celebration Blueprint/i });
    fireEvent.click(submitBtn);

    expect(handleGenerate).toHaveBeenCalled();
  });

  it('renders synthesized blueprint milestones and vendor SLAs when blueprint is provided', () => {
    const mockBlueprint: EventBlueprint = {
      id: 'EVT-TEST-1',
      event_name: 'Dr. Ananya Royal Wedding',
      event_type: 'Wedding',
      location: 'Coimbatore Heritage Hall',
      target_date: '2026-11-20',
      expected_guests: 300,
      max_venue_capacity: 400,
      total_budget: 800000,
      currency: 'INR',
      executive_summary: 'Harmonious Kongu Nadu celebration with strict eco-protocols.',
      personalized_themes: ['Brass & Marigold', 'Eco-acoustic'],
      intergenerational_features: ['Elder golf cart transport', 'Diabetic dessert bar'],
      milestones: [
        {
          phase: 'Day of Event',
          task_name: 'Main Muhurtham Ceremony',
          owner: 'Priest',
          is_completed: false,
          deadline: '09:30',
        },
      ],
      vendor_slas: [
        {
          vendor_type: 'Caterer',
          vendor_name: 'Aachi Catering Services',
          quote_amount: 320000,
          advance_paid: 160000,
          pending_amount: 160000,
          sla_requirement: '40/30/30 batch hot serving',
          backup_vendor_contact: '+91-98401-11223',
          arrival_time: '06:00',
        },
      ],
      initial_risks_and_contingencies: ['Afternoon rain contingency'],
      unverified_assumptions: ['Sound permit valid until 22:00'],
      created_at: new Date().toISOString(),
      version: 1,
    };

    render(
      <CelebrationBlueprint
        blueprint={mockBlueprint}
        onGenerateBlueprint={vi.fn()}
        loading={false}
      />
    );

    expect(screen.getByText('Dr. Ananya Royal Wedding')).toBeInTheDocument();
    expect(screen.getByText(/Harmonious Kongu Nadu celebration/i)).toBeInTheDocument();
    expect(screen.getByText('Main Muhurtham Ceremony')).toBeInTheDocument();
    expect(screen.getByText('Aachi Catering Services')).toBeInTheDocument();
  });

  it('renders Google ADK Swarm Orchestrator and inspects agent reasoning stream and predictions', () => {
    const mockBlueprint: EventBlueprint = {
      id: 'EVT-TEST-ADK',
      event_name: 'Dr. Ananya Royal Wedding',
      event_type: 'Wedding',
      location: 'Coimbatore Heritage Hall',
      target_date: '2026-11-20',
      expected_guests: 300,
      max_venue_capacity: 400,
      total_budget: 800000,
      currency: 'INR',
      executive_summary: 'Harmonious Kongu celebration.',
      personalized_themes: ['Rajput Grandeur', 'Temple Sadya'],
      intergenerational_features: ['Elder golf cart transport'],
      milestones: [],
      vendor_slas: [],
      initial_risks_and_contingencies: [],
      unverified_assumptions: [],
      created_at: new Date().toISOString(),
      version: 1,
    };

    const mockAdkSwarm = {
      is_live_gemini: true,
      model_name: 'gemini-2.5-flash',
      orchestration_time: 1234567,
      adk_master_summary: 'Consensus verified with 100% adherence to zero hallucination.',
      adk_predictions: {
        crowd_velocity: {
          peak_hour: '19:30 - 20:30',
          bottleneck_risk: 'Low',
          occupancy_rate_pct: 75.0,
          arrival_distribution: [
            { time: '17:00', arrival_pct: 15, description: 'VIP Welcome' },
            { time: '18:00', arrival_pct: 45, description: 'Core Family' },
          ],
          evacuation_clearance_seconds: 135,
        },
        catering_depletion: {
          batch_1_hot_serve_pct: 40,
          batch_2_mid_serve_pct: 30,
          batch_3_demand_flex_pct: 30,
          predicted_surplus_kg: 16.5,
          safe_consumption_window_hours: 4.0,
          fssai_cold_chain_sla_mins: 40,
        },
        timeline_risk: {
          curfew_compliance_probability_pct: 98.4,
          critical_path_buffer_minutes: 25,
          police_acoustic_limit_dba: 75,
          delay_cascade_risk: 'Low',
        },
        budget_elasticity: {
          anchor_protection_pct: 65,
          cost_overrun_probability_pct: 1.2,
          emergency_contingency_fund_inr: 64000,
        },
      },
      agents: [
        {
          id: 'EventSupervisorAgent',
          name: 'Supervisor',
          role: 'Swarm Coordinator',
          model: 'Gemini 2.5 Flash',
          is_live: true,
          latency: '220ms',
          status: 'Active',
          color: 'indigo',
          tools: ['coordinate_plan_generation'],
          reasoning: 'Coordinated parallel specialist execution.',
        },
        {
          id: 'BlueprintSpecialistAgent',
          name: 'Blueprint Agent',
          role: 'Cultural Synthesizer',
          model: 'Gemini 2.5 Flash',
          is_live: true,
          latency: '180ms',
          status: 'Synced',
          color: 'amber',
          tools: ['generate_cultural_themes'],
          reasoning: 'Synthesized Kongu Nadu brass decor and elder access ramps.',
        },
      ],
    };

    render(
      <CelebrationBlueprint
        blueprint={mockBlueprint}
        onGenerateBlueprint={vi.fn()}
        loading={false}
        adkSwarmOutput={mockAdkSwarm}
      />
    );

    // Verify engine badge
    expect(screen.getByText(/LIVE GOOGLE GENAI \/ ADK SWARM/i)).toBeInTheDocument();

    // Verify agents
    expect(screen.getByText('Supervisor')).toBeInTheDocument();
    expect(screen.getByText('Blueprint Agent')).toBeInTheDocument();

    // Click on Blueprint Agent to inspect thought stream
    const bpAgentBtn = screen.getByRole('button', { name: /Blueprint Agent/i });
    fireEvent.click(bpAgentBtn);

    expect(screen.getByText(/ADK Inspector: Blueprint Agent/i)).toBeInTheDocument();
    expect(screen.getByText(/Synthesized Kongu Nadu brass decor/i)).toBeInTheDocument();

    // Switch to ADK Predictions tab
    const predictionsTabBtn = screen.getByRole('button', { name: /ADK Predictions/i });
    fireEvent.click(predictionsTabBtn);

    expect(screen.getByText(/Crowd Arrival Curve/i)).toBeInTheDocument();
    expect(screen.getByText(/Catering Depletion/i)).toBeInTheDocument();
    expect(screen.getByText(/16.5 kg/i)).toBeInTheDocument();
  });

  it('triggers natural language AI blueprint refinement copilot submission', () => {
    const handleRefine = vi.fn().mockResolvedValue(undefined);
    const mockBlueprint: EventBlueprint = {
      id: 'EVT-REFINE-1',
      event_name: 'Dr. Ananya Royal Wedding',
      event_type: 'Wedding',
      location: 'Coimbatore Heritage Hall',
      target_date: '2026-11-20',
      expected_guests: 300,
      max_venue_capacity: 400,
      total_budget: 800000,
      currency: 'INR',
      executive_summary: 'Harmonious Kongu celebration.',
      personalized_themes: ['Rajput Grandeur'],
      intergenerational_features: ['Elder access'],
      milestones: [],
      vendor_slas: [],
      initial_risks_and_contingencies: [],
      unverified_assumptions: [],
      created_at: new Date().toISOString(),
      version: 1,
    };

    render(
      <CelebrationBlueprint
        blueprint={mockBlueprint}
        onGenerateBlueprint={vi.fn()}
        onRefineBlueprint={handleRefine}
        loading={false}
      />
    );

    const input = screen.getByPlaceholderText(/Add 50 guests & recalculate/i);
    fireEvent.change(input, { target: { value: 'Add 50 guests and push curfew to 22:30' } });

    const submitBtn = screen.getByRole('button', { name: /Refine Plan via ADK/i });
    fireEvent.click(submitBtn);

    expect(handleRefine).toHaveBeenCalledWith('Add 50 guests and push curfew to 22:30');
  });

  it('renders pre-event countdown itinerary checklist and post-event settlement hub', () => {
    const mockBlueprint: EventBlueprint = {
      id: 'EVT-COUNTDOWN-1',
      event_name: 'Dr. Ananya Royal Wedding',
      event_type: 'Wedding',
      location: 'Coimbatore Heritage Hall',
      target_date: '2026-11-20',
      expected_guests: 300,
      max_venue_capacity: 400,
      total_budget: 800000,
      currency: 'INR',
      executive_summary: 'Harmonious Kongu celebration.',
      personalized_themes: ['Rajput Grandeur'],
      intergenerational_features: ['Elder access'],
      milestones: [
        {
          phase: 'T-30 Days',
          task_name: 'T-30 Days: Venue Contract & Municipal Curfew Lock',
          owner: 'Lead Coordinator',
          deadline: '2026-10-20',
          is_completed: false,
        },
        {
          phase: 'T-0 Muhurtham',
          task_name: 'T-0 Muhurtham: Live Swarm Dispatch & 40/30/30 Kitchen Batch Fire',
          owner: 'ADK Swarm',
          deadline: '2026-11-20',
          is_completed: false,
        },
      ],
      vendor_slas: [
        {
          vendor_type: 'Catering',
          vendor_name: 'Aachi Grand Catering',
          sla_requirement: '40/30/30 batch staging and FSSAI cold chain compliance',
          arrival_time: '06:00',
          quote_amount: 320000,
          advance_paid: 160000,
          pending_amount: 160000,
          backup_vendor_contact: '+91 94431 00000',
        },
      ],
      initial_risks_and_contingencies: [],
      unverified_assumptions: [],
      created_at: new Date().toISOString(),
      version: 1,
    };

    render(
      <CelebrationBlueprint
        blueprint={mockBlueprint}
        onGenerateBlueprint={vi.fn()}
        loading={false}
      />
    );

    // Verify Pre-Event Countdown Checklist
    expect(screen.getByText(/Pre-Event Planning & Countdown Itinerary Checklist/i)).toBeInTheDocument();
    expect(screen.getByText(/T-30 Days: Venue Contract & Municipal Curfew Lock/i)).toBeInTheDocument();
    expect(screen.getByText(/T-0 Muhurtham: Live Swarm Dispatch & 40\/30\/30 Kitchen Batch Fire/i)).toBeInTheDocument();

    // Verify Post-Event Settlement Hub
    expect(screen.getByText(/Post-Event Settlement & Sustainability Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/FSSAI Food Rescue Dispatch/i)).toBeInTheDocument();
    expect(screen.getByText(/ESG & Carbon Offset Certificate/i)).toBeInTheDocument();
    expect(screen.getByText(/Final Vendor Settlement/i)).toBeInTheDocument();
  });
});
