/**
 * FestivaPulseAI — FestivaPulseAI module.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QATestRunnerModal } from '../../components/QATestRunnerModal';
import { api } from '../../services/api';

vi.mock('../../services/api', () => ({
  api: {
    runQATestSuite: vi.fn().mockResolvedValue({
      all_passed: true,
      passed_tests: 7,
      failed_tests: 0,
      total_tests: 7,
      total_duration_ms: 15.0,
      results: [
        {
          id: 'TC-01',
          name: 'Budget Ledger Conservation (No Double-Counting)',
          category: 'Finance Invariant',
          passed: true,
          assertion: 'Spent + Committed + Planned equals ₹2,00,000 without arithmetic drift',
          latency_ms: 2.1,
        },
      ],
    }),
  },
}));

describe('QATestRunnerModal Integration Tests', () => {
  it('does not render when isOpen is false', () => {
    const handleClose = vi.fn();
    render(<QATestRunnerModal isOpen={false} onClose={handleClose} />);
    expect(
      screen.queryByText(/Automated Domain Invariant & Edge-Case Test Runner/i)
    ).not.toBeInTheDocument();
  });

  it('renders modal, executes test suite on click, and displays 100% pass rate', async () => {
    const handleClose = vi.fn();
    render(<QATestRunnerModal isOpen={true} onClose={handleClose} />);

    expect(
      screen.getByText(/Automated Domain Invariant & Edge-Case Test Runner/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Live evaluation evidence verifying zero fake arithmetic/i)
    ).toBeInTheDocument();

    const runBtn = screen.getByRole('button', { name: /Run All Test Cases/i });
    expect(runBtn).toBeInTheDocument();
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(api.runQATestSuite).toHaveBeenCalled();
      expect(screen.getByText(/100% PASS RATE/i)).toBeInTheDocument();
      expect(screen.getByText(/Budget Ledger Conservation/i)).toBeInTheDocument();
    });

    // Test close button
    const closeBtn = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });
});
