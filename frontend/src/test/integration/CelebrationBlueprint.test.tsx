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
});
