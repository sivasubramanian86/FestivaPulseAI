/**
 * FestivaPulseAI — FestivaPulseAI module.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DecisionLedger } from '../../components/DecisionLedger';
import { DecisionLedgerEntry } from '../../types';

describe('DecisionLedger Component Unit Tests', () => {
  it('renders empty state when no decisions have been approved yet', () => {
    render(<DecisionLedger entries={[]} />);
    expect(screen.getByText('Decision Ledger Empty')).toBeInTheDocument();
    expect(
      screen.getByText(/Every time a host or event coordinator approves a recovery proposal/i)
    ).toBeInTheDocument();
  });

  it('renders list of immutable decision entries with version and mathematical proof', () => {
    const mockEntries: DecisionLedgerEntry[] = [
      {
        entry_id: 'DEC-12345-1',
        event_id: 'EVT-TEST',
        timestamp: new Date().toISOString(),
        actor: 'Host / Event Coordinator',
        what_changed: 'Applied Lowest Additional Cost: Rapid kitchen batch stretch',
        why_it_changed: 'Selected optimal balance of cost and guest comfort',
        original_values: { budget: 800000, guests: 300 },
        revised_values: { budget: 808000, guests: 340, applied_strategy: 'Lowest Additional Cost' },
        calculations_executed: 'Additional Cost: ₹8,000, Timeline Impact: 15m',
        gemini_recommendation: 'Stretches dinner batches with zero disruption',
        human_approved: true,
        plan_version: 2,
      },
    ];

    render(<DecisionLedger entries={mockEntries} />);

    expect(screen.getByText('Immutable Operational Decision Ledger')).toBeInTheDocument();
    expect(screen.getByText('1 Certified Entries')).toBeInTheDocument();
    expect(screen.getByText('Version v2.0')).toBeInTheDocument();
    expect(screen.getByText(/Applied Lowest Additional Cost/i)).toBeInTheDocument();
    expect(screen.getByText(/Rapid kitchen batch stretch/i)).toBeInTheDocument();
    expect(screen.getByText('Human Approved')).toBeInTheDocument();
    expect(screen.getByText(/Additional Cost: ₹8,000, Timeline Impact: 15m/i)).toBeInTheDocument();
  });
});
