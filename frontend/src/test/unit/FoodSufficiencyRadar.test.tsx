import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FoodSufficiencyRadar } from '../../components/FoodSufficiencyRadar';
import { FoodSufficiencyRadar as FoodRadarType } from '../../types';

describe('FoodSufficiencyRadar Component Unit Tests', () => {
  it('renders placeholder when radar state is null', () => {
    render(
      <FoodSufficiencyRadar
        radar={null}
        onGenerateFssaiManifest={vi.fn().mockResolvedValue(undefined)}
        loading={false}
      />
    );

    expect(
      screen.getByText('Initialize an event to view the live Food Sufficiency Radar.')
    ).toBeInTheDocument();
  });

  it('renders categories, portion counts, and FSSAI surplus action button when populated', () => {
    const mockRadar: FoodRadarType = {
      event_id: 'EVT-TEST',
      timestamp: new Date().toISOString(),
      overall_attendance_expected: 300,
      actual_checked_in: 250,
      total_shortfall_count: 0,
      total_surplus_count: 50,
      stale_data_warning: false,
      categories: [
        {
          category: 'General Vegetarian',
          required_portions: 210,
          prepared_portions: 150,
          served_portions: 100,
          available_portions: 30,
          reserved_portions: 20,
          confirmed_inbound: 0,
          net_shortfall_or_surplus: 30,
          burn_rate_plates_per_min: 2.5,
          depletion_projected_minutes: 45,
          supplier_lead_time_minutes: 30,
          is_critical_shortage: false,
        },
        {
          category: 'Jain Diet',
          required_portions: 35,
          prepared_portions: 45,
          served_portions: 35,
          available_portions: 0,
          reserved_portions: 10,
          confirmed_inbound: 0,
          net_shortfall_or_surplus: 0,
          burn_rate_plates_per_min: 0.8,
          depletion_projected_minutes: null,
          supplier_lead_time_minutes: 30,
          is_critical_shortage: false,
        },
      ],
      fssai_manifest: undefined,
    };

    const handleManifest = vi.fn().mockResolvedValue(undefined);

    render(
      <FoodSufficiencyRadar
        radar={mockRadar}
        onGenerateFssaiManifest={handleManifest}
        loading={false}
      />
    );

    expect(screen.getByText(/FestivaFoodGuard: Category-Level Sufficiency Radar/i)).toBeInTheDocument();
    expect(screen.getByText('General Vegetarian')).toBeInTheDocument();
    expect(screen.getByText('Jain Diet')).toBeInTheDocument();
    expect(screen.getByText(/50 Surplus Portions/i)).toBeInTheDocument();

    // Toggle FSSAI manifest form
    const fssaiBtn = screen.getByRole('button', { name: /Generate FSSAI Dispatch Pass/i });
    expect(fssaiBtn).toBeInTheDocument();
    fireEvent.click(fssaiBtn);

    // Form inputs should be visible
    const submitBtn = screen.getByRole('button', { name: /Verify & Issue FSSAI Food Rescue Pass/i });
    fireEvent.click(submitBtn);

    expect(handleManifest).toHaveBeenCalled();
  });
});
