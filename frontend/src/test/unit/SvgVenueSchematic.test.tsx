/**
 * FestivaPulseAI — FestivaPulseAI module.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SvgVenueSchematic } from '../../components/SvgVenueSchematic';

describe('SvgVenueSchematic Component Unit Tests', () => {
  it('renders venue schematic and calculated occupancy percentage', () => {
    render(
      <SvgVenueSchematic
        expectedGuests={300}
        actualCheckedIn={240}
        maxCapacity={400}
      />
    );

    expect(screen.getByText(/Venue Spatial Zone & Capacity Schematic/i)).toBeInTheDocument();
    expect(screen.getByText(/60% Occupancy \(240 \/ 400\)/i)).toBeInTheDocument();

    // Verify SVG zones are drawn
    expect(screen.getByText('MAIN DAIS / AUSPICIOUS STAGE')).toBeInTheDocument();
    expect(screen.getByText('CENTRAL AUDIENCE CLUSTERS')).toBeInTheDocument();
    expect(screen.getByText('ELDERS LOUNGE')).toBeInTheDocument();
    expect(screen.getByText('KIDS ACTIVITY ENCLAVE')).toBeInTheDocument();
    expect(screen.getByText(/DINING & BANQUET HALL/i)).toBeInTheDocument();
    expect(screen.getByText('EXIT 1')).toBeInTheDocument();
  });

  it('renders high density warning style when occupancy exceeds 90%', () => {
    render(
      <SvgVenueSchematic
        expectedGuests={380}
        actualCheckedIn={380}
        maxCapacity={400}
      />
    );

    const occupancyBadge = screen.getByText(/95% Occupancy/i);
    expect(occupancyBadge).toBeInTheDocument();
    expect(occupancyBadge.className).toContain('bg-red-100');
  });
});
