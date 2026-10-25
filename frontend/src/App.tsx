import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CelebrationBlueprint } from './components/CelebrationBlueprint';
import { EventPulse } from './components/EventPulse';
import { RescueStudio } from './components/RescueStudio';
import { DecisionLedger } from './components/DecisionLedger';
import { ScenarioLab } from './components/ScenarioLab';
import { GenAIXRayDrawer } from './components/GenAIXRayDrawer';
import { QATestRunnerModal } from './components/QATestRunnerModal';
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

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'blueprint' | 'pulse' | 'rescue' | 'ledger' | 'scenario'>('blueprint');
  const [xrayOpen, setXrayOpen] = useState(false);
  const [qaModalOpen, setQaModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Application State
  const [blueprint, setBlueprint] = useState<EventBlueprint | null>(null);
  const [foodRadar, setFoodRadar] = useState<FoodSufficiencyRadar | null>(null);
  const [ledger, setLedger] = useState<BudgetLedger | null>(null);
  const [timeline, setTimeline] = useState<TimelineNode[]>([]);
  const [rescueComparison, setRescueComparison] = useState<RescueStudioComparison | null>(null);
  const [decisionEntries, setDecisionEntries] = useState<DecisionLedgerEntry[]>([]);
  const [latestTelemetry, setLatestTelemetry] = useState<GenAITelemetryTrace | null>(null);
  const [loading, setLoading] = useState(false);

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
      setXrayOpen(true); // Open telemetry drawer to demonstrate live prompt and response!
    } catch (err: any) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Event Pulse live updates
  const handleUpdatePulse = async (data: {
    actual_checked_in: number;
    revised_expected_guests: number;
    revised_budget?: number;
    delayed_node_id?: string;
    delay_minutes?: number;
  }) => {
    if (!blueprint) return;
    try {
      const res = await api.updatePulse(blueprint.id, data);
      if (res.food_radar) setFoodRadar(res.food_radar);
      if (res.timeline) setTimeline(res.timeline);
    } catch (err: any) {
      console.error('Pulse update error:', err);
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
      // Refresh event
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
      setActiveTab('rescue'); // Automatically switch to Rescue Studio!
      setXrayOpen(true);     // Display incoming structured alternatives in X-Ray drawer!
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
      // Reload event
      const updated = await api.getEvent(blueprint.id);
      setBlueprint(updated.blueprint);
      if (updated.ledger) setLedger(updated.ledger);
      alert(`Plan updated to Version v${res.new_version}.0! Stamped into Decision Ledger.`);
      setActiveTab('ledger'); // Switch to Decision Ledger to show verified audit entry!
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-slate-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        xrayOpen={xrayOpen}
        setXrayOpen={setXrayOpen}
        onOpenQAModal={() => setQaModalOpen(true)}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">
          FestivaPulseAI — Autonomous Multi-Agent Event Architect & Live-Venue Contingency Command Center
        </p>
        <p className="mt-1">
          Built for PromptWars Virtual [Challenge 5] | Strict Repository Size &lt; 1.5 MB | WCAG 2.1 AA Compliant
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
export default App;
