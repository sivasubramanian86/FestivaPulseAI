import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../../App';
import { api } from '../../services/api';

vi.mock('../../services/api', () => ({
  api: {
    createEvent: vi.fn().mockResolvedValue({
      event_id: 'EVT-APP-E2E',
      blueprint: {
        id: 'EVT-APP-E2E',
        event_name: 'Bengaluru Grand Palace Grounds Royal Celebration',
        event_type: 'Community Event',
        location: 'Palace Grounds Botanical Glasshouse & Lawns, Bengaluru',
        target_date: '2026-11-12',
        expected_guests: 350,
        max_venue_capacity: 500,
        total_budget: 1200000,
        currency: 'INR',
        executive_summary: 'Harmonious eco celebration',
        personalized_themes: ['Heritage'],
        intergenerational_features: ['Kids zone'],
        milestones: [
          {
            phase: 'Day of Event',
            task_name: 'Traditional Feast Service',
            owner: 'Catering Head',
            is_completed: false,
            deadline: '19:45',
          },
        ],
        vendor_slas: [],
        initial_risks_and_contingencies: [],
        unverified_assumptions: [],
        created_at: new Date().toISOString(),
        version: 1,
      },
      ledger: {
        event_id: 'EVT-APP-E2E',
        approved_total_budget: 500000,
        currency: 'INR',
        categories: [],
        total_spent: 100000,
        total_committed_unpaid: 150000,
        total_uncommitted_planned: 250000,
        total_accounted_funds: 500000,
        remaining_unallocated_funds: 0,
        is_balanced: true,
      },
      food_radar: {
        event_id: 'EVT-APP-E2E',
        timestamp: new Date().toISOString(),
        overall_attendance_expected: 250,
        actual_checked_in: 0,
        categories: [],
        total_shortfall_count: 0,
        total_surplus_count: 0,
        fssai_manifest: null,
        stale_data_warning: false,
      },
      timeline: [],
      telemetry: {
        trace_id: 'TEL-123',
        timestamp: new Date().toISOString(),
        task_type: 'BLUEPRINT_SYNTHESIS',
        input_hash: 'abc',
        token_count: 850,
        prompt_tokens: 450,
        completion_tokens: 400,
        estimated_cost_usd: 0.0003,
        latency_ms: 120,
        model_name: 'gemini-2.5-flash',
        is_live_call: true,
        grounding_score: 0.98,
        arithmetic_operations_delegated: 4,
      },
    }),
    updatePulse: vi.fn(),
    proposeRecovery: vi.fn(),
    approveRecovery: vi.fn(),
    searchVenues: vi.fn().mockResolvedValue({
      success: true,
      location: 'Bengaluru',
      count: 1,
      venues: [
        {
          id: 'blr-palace-glasshouse',
          name: 'Palace Grounds Botanical Glasshouse & Lawns',
          city: 'Bengaluru',
          area: 'Vasanth Nagar',
          category: 'Royal Heritage Palace',
          lat: 12.9982,
          lng: 77.5921,
          capacity_min: 300,
          capacity_max: 1500,
          base_rental_inr: 450000,
          per_plate_veg_inr: 950,
          per_plate_nonveg_inr: 1250,
          sound_curfew_time: '22:30',
          parking_cars: 350,
          wheelchair_accessible: true,
          fssai_staging_bay: true,
          rag_grounding_score: 0.98,
          matched_vibe: 'Eco-friendly royal Karnataka heritage',
          highlights: ['Victorian glasshouse', 'Zero-step wheelchair ramps'],
        },
      ],
    }),
    applyVenue: vi.fn().mockResolvedValue({
      success: true,
      message: 'Celebration re-anchored',
      hall: {
        id: 'blr-palace-glasshouse',
        name: 'Palace Grounds Botanical Glasshouse & Lawns',
        city: 'Bengaluru',
        lat: 12.9982,
        lng: 77.5921,
      },
      blueprint: {
        id: 'EVT-APP-E2E',
        event_name: 'Bengaluru Grand Palace Grounds Royal Celebration',
        location: 'Palace Grounds Botanical Glasshouse & Lawns, Bengaluru',
        expected_guests: 350,
        total_budget: 1200000,
      },
      ledger: {
        approved_total: 1200000,
      },
    }),
    runQATestSuite: vi.fn().mockResolvedValue({
      all_passed: true,
      passed_tests: 7,
      failed_tests: 0,
      total_tests: 7,
      total_duration_ms: 10.0,
      results: [],
    }),
  },
}));

describe('App End-to-End User Flow Tests', () => {
  it('initializes default celebration and enables full navigation across all modules', async () => {
    render(<App />);

    // 1. App Header and default Blueprint loaded
    await waitFor(() => {
      expect(screen.getByText('FestivaPulseAI')).toBeInTheDocument();
      expect(api.createEvent).toHaveBeenCalled();
      expect(
        screen.getByText('Bengaluru Grand Palace Grounds Royal Celebration')
      ).toBeInTheDocument();
    });

    // 2. Navigate to Live Pulse tab
    const pulseTab = screen.getByRole('button', { name: /Live Event Pulse/i });
    fireEvent.click(pulseTab);
    expect(screen.getByText(/Event Pulse & Live Field Cockpit/i)).toBeInTheDocument();

    // 3. Navigate to Rescue Studio tab
    const rescueTab = screen.getByRole('button', { name: /Rescue Studio/i });
    fireEvent.click(rescueTab);
    expect(screen.getByText('Rescue Studio Ready')).toBeInTheDocument();

    // 4. Navigate to Decision Ledger tab
    const ledgerTab = screen.getByRole('button', { name: /Decision Ledger/i });
    fireEvent.click(ledgerTab);
    expect(screen.getByText('Decision Ledger Empty')).toBeInTheDocument();

    // 5. Navigate to Scenario Lab tab
    const scenarioTab = screen.getByRole('button', { name: /Stress Lab|Scenario Lab/i });
    fireEvent.click(scenarioTab);
    expect(screen.getByText(/Scenario Lab: Reversible What-If Sandbox/i)).toBeInTheDocument();

    // 6. Open Guided Tour Modal from Navbar
    const tourBtn = screen.getByRole('button', { name: /Guided Tour/i });
    fireEvent.click(tourBtn);
    expect(
      screen.getByText(/4DX Immersive Venue Experience/i)
    ).toBeInTheDocument();

    // Close Tour Modal
    const closeBtn = screen.getByRole('button', { name: 'Close Tour Modal' });
    fireEvent.click(closeBtn);
    expect(
      screen.queryByText(/4DX Immersive Venue Experience/i)
    ).not.toBeInTheDocument();

    // 7. Open QA Verification Modal from footer
    const qaBtn = screen.getByRole('button', { name: /Run Automated QA Suite/i });
    fireEvent.click(qaBtn);
    expect(
      screen.getByText(/Automated Domain Invariant & Edge-Case Test Runner/i)
    ).toBeInTheDocument();

    // Close QA Modal
    const closeQaBtn = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeQaBtn);
    expect(
      screen.queryByText(/Automated Domain Invariant & Edge-Case Test Runner/i)
    ).not.toBeInTheDocument();
  });
});
