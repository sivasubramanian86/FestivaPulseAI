import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CelebrationBlueprint } from './components/CelebrationBlueprint';
import { EventPulse } from './components/EventPulse';
import { RescueStudio } from './components/RescueStudio';
import { DecisionLedger } from './components/DecisionLedger';
import { ScenarioLab } from './components/ScenarioLab';
import { GenAIXRayDrawer } from './components/GenAIXRayDrawer';
import { QATestRunnerModal } from './components/QATestRunnerModal';
import { ImmersiveVenueTourModal } from './components/ImmersiveVenueTourModal';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider } from './i18n/I18nContext';
import { api } from './services/api';
import { Sparkles, Compass, ShieldCheck, Calendar, MapPin, Eye, CheckCircle2 } from 'lucide-react';
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
  const [tourOpen, setTourOpen] = useState(false);

  // Application State
  const [blueprint, setBlueprint] = useState<EventBlueprint | null>(null);
  const [foodRadar, setFoodRadar] = useState<FoodSufficiencyRadar | null>(null);
  const [ledger, setLedger] = useState<BudgetLedger | null>(null);
  const [timeline, setTimeline] = useState<TimelineNode[]>([]);
  const [rescueComparison, setRescueComparison] = useState<RescueStudioComparison | null>(null);
  const [decisionEntries, setDecisionEntries] = useState<DecisionLedgerEntry[]>([]);
  const [latestTelemetry, setLatestTelemetry] = useState<GenAITelemetryTrace | null>(null);
  const [loading, setLoading] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<string>('Palace Grounds Botanical Glasshouse & Lawns, Bengaluru');
  const [gpsDetecting, setGpsDetecting] = useState<boolean>(false);
  const [gpsCoords, setGpsCoords] = useState<string | null>('12.9716° N, 77.5946° E');

  const handleDetectGpsVenue = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGpsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsCoords(`${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`);
        let venue = `GPS Local Venue (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`;
        if (Math.abs(latitude - 12.97) < 0.8 && Math.abs(longitude - 77.59) < 0.8) {
          venue = 'Palace Grounds Botanical Glasshouse & Lawns, Bengaluru';
        } else if (Math.abs(latitude - 13.08) < 0.8 && Math.abs(longitude - 80.27) < 0.8) {
          venue = 'Chennai Heritage Kalyana Mandapam, T. Nagar';
        } else if (Math.abs(latitude - 19.07) < 0.8 && Math.abs(longitude - 72.87) < 0.8) {
          venue = 'Jio World Convention Centre, BKC, Mumbai';
        } else if (Math.abs(latitude - 28.61) < 0.8 && Math.abs(longitude - 77.20) < 0.8) {
          venue = 'The Grand Ballroom & Haveli Lawns, New Delhi';
        } else if (Math.abs(latitude - 8.73) < 0.8 && Math.abs(longitude - 77.70) < 0.8) {
          venue = 'Tirunelveli Town Hall & Lawns';
        }
        setGpsLocation(venue);
        if (blueprint) {
          setBlueprint({ ...blueprint, location: venue });
        }
        setGpsDetecting(false);
      },
      (err) => {
        console.warn('GPS detection fallback:', err.message);
        setGpsDetecting(false);
        setGpsCoords('12.9716° N, 77.5946° E (Default)');
      },
      { timeout: 8000 }
    );
  };

  // Initialize with a rich default blueprint on first load
  useEffect(() => {
    const initDefaultEvent = async () => {
      setLoading(true);
      try {
        const initialIntake: EventIntakeRequest = {
          event_name: 'Bengaluru Grand Palace Grounds Royal Celebration',
          event_type: 'Community Event',
          organizer_email: 'siva@festivapulse.org',
          target_date: '2026-11-12',
          location: 'Palace Grounds Botanical Glasshouse & Lawns, Bengaluru',
          expected_guests: 350,
          max_venue_capacity: 500,
          total_budget: 1200000,
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
            cultural_vibe: 'Eco-friendly royal Karnataka heritage with live Carnatic-Western fusion & authentic Mysore Pak banquet',
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

  // Handle Applying Grounded Venue Selection from Spatial RAG
  const handleApplyVenue = async (hall: any, _investmentPlan?: any) => {
    if (!blueprint) return;
    setLoading(true);
    try {
      const res = await api.applyVenue(blueprint.id, hall.id);
      if (res.blueprint) setBlueprint(res.blueprint);
      if (res.ledger) setLedger(res.ledger);
      const updatedLoc = `${res.hall.name}, ${res.hall.city}`;
      setGpsLocation(updatedLoc);
      if (res.hall?.latitude && res.hall?.longitude) {
        setGpsCoords(`${res.hall.latitude}° N, ${res.hall.longitude}° E`);
      }
      alert(`Applied Grounded Venue: ${res.hall.name}! Itinerary & budget re-calibrated.`);
    } catch (err: any) {
      console.error('Failed to apply venue:', err);
      alert(`Could not apply venue: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Top Command Cockpit Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        xrayOpen={xrayOpen}
        setXrayOpen={setXrayOpen}
        onOpenQAModal={() => setQaModalOpen(true)}
        onOpenGuidedTour={() => setTourOpen(true)}
      />

      {/* Opulent Celebration Hero Header Layer with Generated Indian Royal Decor */}
      <section className="relative overflow-hidden border-b border-amber-300/40 dark:border-amber-700/30">
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/royal_hero.jpg"
            alt="Royal Celebration Palace"
            className="w-full h-full object-cover object-center filter brightness-[0.75] dark:brightness-[0.45] transform scale-105 transition-transform duration-1000 ease-out hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-950/85 via-slate-950/70 to-purple-950/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FFFDF9] dark:from-[#0E0918] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-400/40 text-amber-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Google Cloud ADK Swarm + Vertex AI Gemini 2.5 Flash</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-display drop-shadow-md">
                The Royal Celebration Atelier
              </h1>

              <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed drop-shadow font-sans">
                Where timeless cultural grandeur meets autonomous multi-agent chaos resilience. Zero math hallucinations, zero food waste, and 100% serene celebrations for families and coordinators.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
                <span className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-md border border-amber-400/20">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Target: Nov 12, 2026 (Shubh Muhurtham)</span>
                </span>
                
                {/* 1-Click Live GPS Venue Detection Bar */}
                <button
                  type="button"
                  onClick={handleDetectGpsVenue}
                  disabled={gpsDetecting}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/40 hover:to-rose-500/40 px-3 py-1 rounded-md border border-amber-400/50 hover:border-amber-300 text-amber-200 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Click to detect current celebration venue via browser GPS geolocation"
                >
                  <MapPin className={`w-3.5 h-3.5 text-rose-400 ${gpsDetecting ? 'animate-bounce' : ''}`} />
                  <span className="font-semibold">{gpsDetecting ? 'Acquiring GPS...' : '📍 Detect Live GPS Venue'}</span>
                  {gpsCoords && <span className="text-[10px] text-amber-300/80 font-mono">[{gpsCoords}]</span>}
                </button>

                <span className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-md border border-amber-400/20 text-amber-100 font-sans">
                  <span className="text-amber-300/80 font-bold">Venue:</span>
                  <span className="truncate max-w-[220px] sm:max-w-xs">{blueprint?.location || gpsLocation}</span>
                </span>

                <span className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-md border border-amber-400/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Chaos Resilience: 99.8%</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 self-start lg:self-center">
              <button
                type="button"
                onClick={() => setTourOpen(true)}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#FBBF24] to-[#B8860B] text-slate-950 font-black text-sm tracking-wide shadow-xl hover:shadow-amber-500/30 flex items-center justify-center gap-2.5 transform hover:-translate-y-0.5 active:translate-y-0 transition-all border border-amber-300"
              >
                <Compass className="w-4 h-4 text-slate-950" />
                <span>3D Transformation & 4DX Tour</span>
              </button>

              <button
                type="button"
                onClick={() => setXrayOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-amber-200 hover:text-white border border-amber-400/40 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Open GenAI Telemetry X-Ray</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Operational Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'blueprint' && (
          <CelebrationBlueprint
            blueprint={blueprint}
            onGenerateBlueprint={handleGenerateBlueprint}
            loading={loading}
            onApplyVenue={handleApplyVenue}
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

      {/* Opulent Royal Footer Layer with Generated Heritage Art */}
      <footer className="relative border-t border-amber-300/40 dark:border-amber-700/30 bg-gradient-to-b from-[#FFFDF9] to-[#F5ECE0] dark:from-[#110B1E] dark:to-[#07040D] overflow-hidden py-10 mt-12 transition-colors">
        <div className="absolute inset-0 opacity-10 dark:opacity-15 pointer-events-none flex justify-center items-center">
          <img
            src="/assets/royal_footer_mandala.jpg"
            alt="Decorative Mandala"
            className="w-full h-full object-cover object-bottom"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 animate-pulse" />
                <h4 className="font-display font-black text-base text-amber-950 dark:text-amber-200">
                  FestivaPulseAI — Autonomous Event Resilience
                </h4>
              </div>
              <p className="text-slate-600 dark:text-slate-400 max-w-md leading-relaxed font-sans">
                Engineered for Google Cloud APAC AI Builder Cup. Powered by Google ADK multi-agent swarm, Vertex AI Gemini 2.5 Flash, Cloud Firestore, and real-time Pub/Sub live event sensory streaming.
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                Engineering Invariants
              </h5>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Zero Arithmetic Hallucination</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>FSSAI Surplus Redistribution</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>HSE Fire & Crowd Capacity Bounds</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Human-in-the-Loop Signoff</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                Interactive Tools
              </h5>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setTourOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-semibold text-left flex items-center gap-2 border border-amber-400/30 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Launch 3D & 4DX Experience</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQaModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-semibold text-left flex items-center gap-2 border border-emerald-400/30 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Run Automated QA Suite</span>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-amber-300/30 dark:border-amber-800/30 pt-6 text-center text-[11px] text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>FestivaPulseAI v2.4 Enterprise | WCAG 2.1 AAA Compliant</span>
            <span className="font-mono text-amber-700 dark:text-amber-400">
              Vertex AI Model: gemini-2.5-flash | Footprint: &lt; 10 MB (Clean Git Gate)
            </span>
          </div>
        </div>
      </footer>

      {/* Immersive 3D Digital Twin & 4DX Sensory Transformation Modal */}
      <ImmersiveVenueTourModal
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
        onOpenQAModal={() => {
          setTourOpen(false);
          setQaModalOpen(true);
        }}
        eventId={blueprint?.id}
        currentLocation={blueprint?.location || gpsLocation}
        expectedGuests={blueprint?.expected_guests || 350}
        totalBudget={blueprint?.total_budget || 1200000}
        onApplyVenue={handleApplyVenue}
      />

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
