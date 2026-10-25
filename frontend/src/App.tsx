import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CelebrationBlueprint } from './components/CelebrationBlueprint';
import { EventPulse } from './components/EventPulse';
import { RescueStudio } from './components/RescueStudio';
import { DecisionLedger } from './components/DecisionLedger';
import { ScenarioLab } from './components/ScenarioLab';
import { GenAIXRayDrawer } from './components/GenAIXRayDrawer';
import { QATestRunnerModal } from './components/QATestRunnerModal';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider, useTranslation } from './i18n/I18nContext';
import { api } from './services/api';
import {
  EventBlueprint,
  FoodSufficiencyRadar,
  BudgetLedger,
  TimelineNode,
  RescueStudioComparison,
  GenAITelemetryTrace,
  DecisionLedgerEntry,
  EventIntakeRequest,
} from './types';

const MainCockpit: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'blueprint' | 'pulse' | 'rescue' | 'ledger' | 'scenario'>('blueprint');
  const [xrayOpen, setXrayOpen] = useState(false);
  const [qaModalOpen, setQaModalOpen] = useState(false);

  // Application State
  const [blueprint, setBlueprint] = useState<EventBlueprint | null>(null);
  const [foodRadar, setFoodRadar] = useState<FoodSufficiencyRadar | null>(null);
  const [ledger, setLedger] = useState<BudgetLedger | null>(null);
  const [timeline, setTimeline] = useState<TimelineNode[]>([]);
  const [rescueComparison, setRescueComparison] = useState<RescueStudioComparison | null>(null);
  const [decisionEntries, setDecisionEntries] = useState<DecisionLedgerEntry[]>([]);
  const [latestTelemetry, setLatestTelemetry] = useState<GenAITelemetryTrace | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  // Initialize with a rich default blueprint on first load
  useEffect(() => {
    const initDefaultEvent = async () => {
      setLoading(true);
      try {
        const initialIntake: EventIntakeRequest = {
          event_name: 'Tirunelveli Tamil-English Community Celebration',
          event_type: 'Community Event',
          organizer_email: 'siva@festivapulse.org',
          target_date: '2026-11-12',
          location: 'Tirunelveli Town Hall & Lawns',
          expected_guests: 250,
          max_venue_capacity: 350,
          total_budget: 500000,
          currency: 'INR',
          dietary: {
            general_veg_pct: 70,
            vegan_pct: 10,
            jain_pct: 10,
            non_veg_pct: 10,
            allergy_specific_count: 5,
            children_meals_count: 20,
            staff_vendor_meals_count: 20,
          },
          preferences: {
            cultural_vibe: 'Eco-friendly Tamil heritage with live classical fusion & organic banana leaf feast',
            elders_comfort_priority: true,
            healthy_lifestyle_focus: true,
            kids_activity_zone: true,
            sound_curfew_time: '22:00',
          },
        };

        const res = await api.createEvent(initialIntake);
        setBlueprint(res.blueprint);
        setLedger(res.ledger);
        setFoodRadar(res.food_radar);
        setTimeline(res.timeline);
        setLatestTelemetry(res.telemetry);
      } catch (err) {
        console.error('Failed to initialize default celebration:', err);
      } finally {
        setLoading(false);
      }
    };

    initDefaultEvent();
  }, []);

  // Handle Event Creation from Form
  const handleGenerateBlueprint = async (intake: EventIntakeRequest) => {
    setLoading(true);
    try {
      const res = await api.createEvent(intake);
      setBlueprint(res.blueprint);
      setLedger(res.ledger);
      setFoodRadar(res.food_radar);
      setTimeline(res.timeline);
      setLatestTelemetry(res.telemetry);
      setXrayOpen(true);
    } catch (err: any) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Ingesting Pulse Check-in
  const handleUpdatePulse = async (data: {
    actual_checked_in: number;
    revised_expected_guests: number;
    revised_budget?: number;
    delayed_node_id?: string;
    delay_minutes?: number;
  }) => {
    if (!blueprint) return;
    setLoading(true);
    try {
      const res = await api.updatePulse(blueprint.id, data);
      if (res.food_radar) setFoodRadar(res.food_radar);
      if (res.new_incident_triggered && res.comparison) {
        setRescueComparison(res.comparison);
        setActiveTab('rescue');
        setXrayOpen(true);
      }
    } catch (err: any) {
      console.error('Pulse update error:', err);
    } finally {
      setLoading(false);
    }
  };


  // Handle FSSAI Surplus Manifest generation
  const handleGenerateFssaiManifest = async (surplusKg: number, hotTemp: number, coldTemp: number) => {
    if (!blueprint) return;
    setLoading(true);
    try {
      await api.generateFssaiManifest(blueprint.id, {
        surplus_kg: surplusKg,
        hot_temp_celsius: hotTemp,
        cold_temp_celsius: coldTemp,
      });
      const refreshed = await api.getEvent(blueprint.id);
      if (refreshed.food_radar) setFoodRadar(refreshed.food_radar);
    } catch (err: any) {
      alert(`FSSAI Manifest failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Triggering Incidents for Rescue Studio
  const handleTriggerRescueIncident = async (incidentType: string, values: Record<string, any>) => {
    if (!blueprint) return;
    setLoading(true);
    try {
      const res = await api.proposeRescue(blueprint.id, {
        event_id: blueprint.id,
        incident_type: incidentType,
        entered_values: values,
        source: 'Live Operational Sensor & Field Input',
        observation_time: new Date().toLocaleTimeString(),
      });
      setRescueComparison(res.comparison);
      setLatestTelemetry(res.telemetry);
      setActiveTab('rescue');
      setXrayOpen(true);
    } catch (err: any) {
      alert(`Rescue synthesis failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Approving a Proposal in Rescue Studio
  const handleApproveProposal = async (proposalId: string, reason: string) => {
    if (!blueprint) return;
    setLoading(true);
    try {
      const res = await api.approveProposal(blueprint.id, proposalId, reason);
      setDecisionEntries((prev) => [res.decision_entry, ...prev]);
      const updated = await api.getEvent(blueprint.id);
      setBlueprint(updated.blueprint);
      if (updated.ledger) setLedger(updated.ledger);
      alert(`Plan updated to Version v${res.new_version}.0! Stamped into Decision Ledger.`);
      setActiveTab('ledger');
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-tactical-light dark:bg-tactical-dark text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Command Cockpit Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        xrayOpen={xrayOpen}
        setXrayOpen={setXrayOpen}
        onOpenQAModal={() => setQaModalOpen(true)}
      />

      {/* Main Operational Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'blueprint' && (
          <CelebrationBlueprint
            blueprint={blueprint}
            onGenerateBlueprint={handleGenerateBlueprint}
            loading={loading}
          />
        )}

        {activeTab === 'pulse' && (
          <EventPulse
            blueprint={blueprint}
            foodRadar={foodRadar}
            ledger={ledger}
            timeline={timeline}
            onUpdatePulse={handleUpdatePulse}
            onGenerateFssaiManifest={handleGenerateFssaiManifest}
            onTriggerRescueIncident={handleTriggerRescueIncident}
            loading={loading}
          />
        )}

        {activeTab === 'rescue' && (
          <RescueStudio
            comparison={rescueComparison}
            onApproveProposal={handleApproveProposal}
            onTriggerTestIncident={handleTriggerRescueIncident}
            loading={loading}
          />
        )}

        {activeTab === 'ledger' && (
          <DecisionLedger entries={decisionEntries} />
        )}

        {activeTab === 'scenario' && (
          <ScenarioLab blueprint={blueprint} />
        )}
      </main>

      {/* Cockpit Footer */}
      <footer className="border-t border-slate-200 dark:border-tactical-darkBorder bg-white/70 dark:bg-tactical-darkSurface/70 py-6 mt-12 text-center text-xs text-slate-500 dark:text-slate-400">
        <p className="font-semibold text-slate-700 dark:text-slate-200">
          FestivaPulseAI — {t.nav.brandSubtitle}
        </p>
        <p className="mt-1">
          Google Cloud Run + Vertex AI (Gemini 2.5 Flash) + Cloud Firestore + Pub/Sub Streaming | WCAG 2.1 AAA Compliant
        </p>
      </footer>

      {/* Dockable Live GenAI X-Ray Telemetry Drawer */}
      <GenAIXRayDrawer
        isOpen={xrayOpen}
        onClose={() => setXrayOpen(false)}
        telemetry={latestTelemetry}
      />

      {/* In-App Automated QA Verification Modal */}
      <QATestRunnerModal
        isOpen={qaModalOpen}
        onClose={() => setQaModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <I18nProvider>
        <MainCockpit />
      </I18nProvider>
    </ThemeProvider>
  );
};

export default App;
