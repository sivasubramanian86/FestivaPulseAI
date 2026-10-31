/**
 * FestivaPulseAI — FestivaPulseAI module.
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DynamicItineraryMenu } from '../../components/DynamicItineraryMenu';

describe('DynamicItineraryMenu Unit Tests', () => {
  it('renders with default Bengaluru profile, meal courses, and dynamic pricing', () => {
    render(<DynamicItineraryMenu initialGuests={300} />);

    // Check header / feast menu
    expect(screen.getByText(/Dynamic Regional Feast Menu/i)).toBeInTheDocument();

    // Check default city Bengaluru is active
    expect(screen.getByText(/Palace Grounds Botanical Glasshouse & Lawns/i)).toBeInTheDocument();

    // Check itinerary milestones
    expect(screen.getByText(/Auspicious Arrival & Shubh Aarambh Breakfast/i)).toBeInTheDocument();
    expect(screen.getByText(/Grand Royal Banquet & Plantain Leaf Service/i)).toBeInTheDocument();
    expect(screen.getByText(/Sundowner Hi-Tea & Live Chaat Counters/i)).toBeInTheDocument();
    expect(screen.getByText(/Celebration Gala Dinner & Artisan Dessert Studio/i)).toBeInTheDocument();

    // Check default Lunch delicacies for Bengaluru
    expect(screen.getByText(/Traditional Bisi Bele Bath with Boondi/i)).toBeInTheDocument();
  });

  it('switches location to Chennai and updates authentic South Indian delicacies and venue', () => {
    render(<DynamicItineraryMenu initialGuests={250} />);

    // Click on Chennai location button
    const chennaiBtn = screen.getByRole('button', { name: /Chennai/i });
    fireEvent.click(chennaiBtn);

    // Verify Chennai venue and lunch delicacy (default active tab is lunch)
    expect(screen.getByText(/Mylapore Heritage Mandapam & Lawns/i)).toBeInTheDocument();
    expect(screen.getByText(/18-Course Authentic Banana Leaf Sadya/i)).toBeInTheDocument();

    // Switch to Breakfast tab to verify Degree Kaapi
    const breakfastTabBtn = screen.getByRole('button', { name: /Shubh Breakfast/i });
    fireEvent.click(breakfastTabBtn);
    expect(screen.getByText(/Organic Kumbakonam Degree Filter Kaapi/i)).toBeInTheDocument();
  });

  it('adjusts duration tier and budget tier to recalculate totals dynamically', () => {
    render(<DynamicItineraryMenu initialGuests={200} />);

    // Switch duration to 2 Days
    const twoDayBtn = screen.getByRole('button', { name: /2-Day Grand/i });
    fireEvent.click(twoDayBtn);

    // Switch budget tier to Billionaire / Ambani
    const ambaniBtn = screen.getByRole('button', { name: /Ultra-Modern Billionaire/i });
    fireEvent.click(ambaniBtn);

    // Verify recalculations occur and price badges update
    expect(screen.getByText(/Limitless Extravaganza/i)).toBeInTheDocument();
  });

  it('switches to Delhi NCR and displays Mughal & Punjabi delicacies', () => {
    render(<DynamicItineraryMenu initialGuests={350} />);

    const delhiBtn = screen.getByRole('button', { name: /Delhi NCR/i });
    fireEvent.click(delhiBtn);

    expect(screen.getByText(/Chhatarpur Imperial Farmhouse & Crystal Pavilion/i)).toBeInTheDocument();

    // Default tab is Lunch -> Dal Makhani
    expect(screen.getByText(/Slow-Cooked Dal Makhani \(24h Simmer\)/i)).toBeInTheDocument();

    // Switch to Breakfast tab -> Bedmi Puri
    const breakfastTabBtn = screen.getByRole('button', { name: /Shubh Breakfast/i });
    fireEvent.click(breakfastTabBtn);
    expect(screen.getByText(/Bedmi Puri with Aloo Sabzi/i)).toBeInTheDocument();

    // Switch to Dinner tab for Awadhi Biryani
    const dinnerTabBtn = screen.getByRole('button', { name: /Gala Dinner Buffet/i });
    fireEvent.click(dinnerTabBtn);
    expect(screen.getByText(/Awadhi Dum Biryani/i)).toBeInTheDocument();
  });
});
