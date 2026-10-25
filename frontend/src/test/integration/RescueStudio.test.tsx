import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RescueStudio } from '../../components/RescueStudio';
import { RescueStudioComparison } from '../../types';

describe('RescueStudio Integration Tests', () => {
  it('renders simulation trigger buttons in empty ready state', () => {
    const handleTrigger = vi.fn();
    const handleApprove = vi.fn().mockResolvedValue(undefined);

    render(
      <RescueStudio
        comparison={null}
        onApproveProposal={handleApprove}
        onTriggerTestIncident={handleTrigger}
        loading={false}
      />
    );

    expect(screen.getByText('Rescue Studio Ready')).toBeInTheDocument();
    const foodShortageBtn = screen.getByRole('button', {
      name: /Simulate 40-Plate Food Shortage/i,
    });
    fireEvent.click(foodShortageBtn);
    expect(handleTrigger).toHaveBeenCalledWith('Food Shortage', {
      shortage_count: 40,
      category: 'General Vegetarian',
    });
  });

  it('renders 3 comparative recovery strategies and handles proposal approval', async () => {
    const handleTrigger = vi.fn();
    const handleApprove = vi.fn().mockResolvedValue(undefined);

    const mockComparison: RescueStudioComparison = {
      incident_id: 'COMP-1234',
      event_id: 'EVT-TEST',
      timestamp: new Date().toISOString(),
      incident_summary: '40 plates short in General Vegetarian section',
      candidate_lowest_cost: {
        proposal_id: 'PROP-A',
        strategy_type: 'Lowest Additional Cost',
        summary: 'Rapid kitchen batch stretch with local vendor backup',
        action_items: ['Increase batch rice prep', 'Dispatch runner for vegetable trays'],
        additional_cost: 8000,
        remaining_budget_projected: 792000,
        guests_covered: 40,
        timeline_impact_minutes: 15,
        vendor_dependencies: ['Head Chef'],
        unresolved_constraints: [],
        actions_requiring_human_approval: ['Authorize ₹8,000 spot purchase'],
        is_feasible: true,
      },
      candidate_best_experience: {
        proposal_id: 'PROP-B',
        strategy_type: 'Best Guest Experience',
        summary: 'Emergency hot banquet delivery from 5-star kitchen',
        action_items: ['Order 40 premium gourmet thalis'],
        additional_cost: 24000,
        remaining_budget_projected: 776000,
        guests_covered: 40,
        timeline_impact_minutes: 0,
        vendor_dependencies: ['External Hotel'],
        unresolved_constraints: [],
        actions_requiring_human_approval: ['Authorize ₹24,000 gourmet order'],
        is_feasible: true,
      },
      candidate_lowest_disruption: {
        proposal_id: 'PROP-C',
        strategy_type: 'Lowest Operational Disruption',
        summary: 'Re-route 40 portions from staff & vendor buffer reserve',
        action_items: ['Re-allocate staff reserve', 'Order evening pizza for vendor crew'],
        additional_cost: 4000,
        remaining_budget_projected: 796000,
        guests_covered: 40,
        timeline_impact_minutes: 0,
        vendor_dependencies: ['Catering Lead'],
        unresolved_constraints: [],
        actions_requiring_human_approval: ['Approve staff buffer swap'],
        is_feasible: true,
      },
      rejected_proposals: [],
      system_advisory: 'ZERO-STOCKOUT: Rapid batch stretch resolves shortfall safely.',
    };

    render(
      <RescueStudio
        comparison={mockComparison}
        onApproveProposal={handleApprove}
        onTriggerTestIncident={handleTrigger}
        loading={false}
      />
    );

    expect(screen.getByText('Live Incident Triage')).toBeInTheDocument();
    expect(screen.getByText(/ZERO-STOCKOUT/i)).toBeInTheDocument();

    // Verify all 3 options are rendered
    expect(screen.getByText('Lowest Additional Cost')).toBeInTheDocument();
    expect(screen.getByText('Best Guest Experience')).toBeInTheDocument();
    expect(screen.getByText('Lowest Operational Disruption')).toBeInTheDocument();

    // Click Approve button for candidate A
    const approveButtons = screen.getAllByRole('button', { name: /Approve & Apply Plan Revision/i });
    expect(approveButtons.length).toBe(3);
    fireEvent.click(approveButtons[0]);

    expect(handleApprove).toHaveBeenCalledWith(
      'PROP-A',
      'Selected optimal balance of cost and guest comfort'
    );
  });
});
