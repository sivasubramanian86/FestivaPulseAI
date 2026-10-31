/**
 * FestivaPulseAI — FestivaPulseAI module.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '../../components/Navbar';
import { ThemeProvider } from '../../context/ThemeContext';
import { I18nProvider } from '../../i18n/I18nContext';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <I18nProvider>{ui}</I18nProvider>
    </ThemeProvider>
  );
};

describe('Navbar Component Unit Tests', () => {
  it('renders brand title, tagline, and navigation tabs', () => {
    const setActiveTab = vi.fn();
    const setXrayOpen = vi.fn();
    const onOpenQAModal = vi.fn();
    const onOpenGuidedTour = vi.fn();

    renderWithProviders(
      <Navbar
        activeTab="blueprint"
        setActiveTab={setActiveTab}
        xrayOpen={false}
        setXrayOpen={setXrayOpen}
        onOpenQAModal={onOpenQAModal}
        onOpenGuidedTour={onOpenGuidedTour}
      />
    );

    expect(screen.getByText('FestivaPulseAI')).toBeInTheDocument();
    expect(screen.queryByText('GCP RUN READY')).not.toBeInTheDocument();

    // Verify navigation tabs
    const pulseTab = screen.getByRole('button', { name: /Live Event Pulse/i });
    expect(pulseTab).toBeInTheDocument();
    fireEvent.click(pulseTab);
    expect(setActiveTab).toHaveBeenCalledWith('pulse');

    // Verify Guided Tour button
    const tourBtn = screen.getByRole('button', { name: /Guided Tour/i });
    expect(tourBtn).toBeInTheDocument();
    fireEvent.click(tourBtn);
    expect(onOpenGuidedTour).toHaveBeenCalled();

    // Verify Telemetry X-Ray button
    const xrayBtn = screen.getByRole('button', { name: /Telemetry X-Ray/i });
    expect(xrayBtn).toBeInTheDocument();
    fireEvent.click(xrayBtn);
    expect(setXrayOpen).toHaveBeenCalled();
  });

  it('handles language selection changes and theme toggle', () => {
    renderWithProviders(
      <Navbar
        activeTab="blueprint"
        setActiveTab={vi.fn()}
        xrayOpen={false}
        setXrayOpen={vi.fn()}
        onOpenQAModal={vi.fn()}
        onOpenGuidedTour={vi.fn()}
      />
    );

    const langSelect = screen.getByRole('combobox');
    expect(langSelect).toBeInTheDocument();
    fireEvent.change(langSelect, { target: { value: 'ta' } });
    expect((langSelect as HTMLSelectElement).value).toBe('ta');

    // Theme toggle button
    const themeBtn = screen.getByRole('button', { name: /Toggle Color Theme/i });
    expect(themeBtn).toBeInTheDocument();
    fireEvent.click(themeBtn);
  });
});
