import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Navbar } from '../components/Navbar';
import { CelebrationBlueprint } from '../components/CelebrationBlueprint';
import { QATestRunnerModal } from '../components/QATestRunnerModal';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    runQATestSuite: vi.fn().mockResolvedValue({
      all_passed: true,
      passed_tests: 7,
      failed_tests: 0,
      total_tests: 7,
      total_duration_ms: 12.5,
      results: [
        {
          id: 'T1',
          name: 'FSSAI Food Surplus Standard Enforcement',
          category: 'food_safety',
          passed: true,
          assertion: 'Verified hot holding >= 63°C and cold holding <= 5°C with NGO tracking.',
          latency_ms: 1.2,
        },
      ],
    }),
  },
}));

describe('FestivaPulseAI Frontend Component Test Suite', () => {
  it('renders Navbar with brand title and status badges', () => {
    render(
      <Navbar
        activeTab="blueprint"
        setActiveTab={vi.fn()}
        xrayOpen={false}
        setXrayOpen={vi.fn()}
        onOpenQAModal={vi.fn()}
        selectedLanguage="en"
        setSelectedLanguage={vi.fn()}
      />
    );
    expect(screen.getByText('FestivaPulseAI')).toBeInTheDocument();
    expect(screen.getByText('Day-of-Event OS')).toBeInTheDocument();
    expect(screen.getByText('Plan the celebration. Adapt when reality changes.')).toBeInTheDocument();
    expect(screen.getByText('Judge X-Ray')).toBeInTheDocument();
  });

  it('displays validation errors when invalid input preset is triggered', () => {
    render(
      <CelebrationBlueprint
        blueprint={null}
        onGenerateBlueprint={vi.fn().mockResolvedValue(undefined)}
        loading={false}
      />
    );

    // Click Test Error State button
    const errorPresetBtn = screen.getByRole('button', { name: /Test Error State/i });
    fireEvent.click(errorPresetBtn);

    // Validation alert banner should appear
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText(/Organizer email "bad-email-format" is invalid/i)).toBeInTheDocument();
  });

  it('populates fields when a preset button is clicked in CelebrationBlueprint', () => {
    render(
      <CelebrationBlueprint
        blueprint={null}
        onGenerateBlueprint={vi.fn().mockResolvedValue(undefined)}
        loading={false}
      />
    );

    // Click Wedding preset button
    const presetBtn = screen.getByRole('button', { name: /Wedding \(₹18L\)/i });
    fireEvent.click(presetBtn);

    // Form inputs should update to Kalyana Mandapam
    const nameInput = screen.getByDisplayValue(/Kalyana Mandapam Traditional Wedding/i);
    expect(nameInput).toBeInTheDocument();
  });

  it('renders and runs QA Test Runner Modal with verifiable assertions', async () => {
    const handleClose = vi.fn();
    render(<QATestRunnerModal isOpen={true} onClose={handleClose} />);

    expect(screen.getByText(/Automated Domain Invariant & Edge-Case Test Runner/i)).toBeInTheDocument();
    expect(screen.getByText(/Live evaluation evidence verifying zero fake arithmetic/i)).toBeInTheDocument();

    const runBtn = screen.getByRole('button', { name: /Run All Test Cases/i });
    expect(runBtn).toBeInTheDocument();
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(api.runQATestSuite).toHaveBeenCalled();
      expect(screen.getByText(/100% PASS RATE/i)).toBeInTheDocument();
    });
  });
});
