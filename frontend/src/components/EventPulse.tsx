import React, { useState } from 'react';
import {
  Activity,
  Users,
  IndianRupee,
  Clock,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { EventBlueprint, FoodSufficiencyRadar as FoodRadarType, BudgetLedger, TimelineNode } from '../types';
import { FoodSufficiencyRadar } from './FoodSufficiencyRadar';
import { SvgVenueSchematic } from './SvgVenueSchematic';

interface EventPulseProps {
  blueprint: EventBlueprint | null;
  foodRadar: FoodRadarType | null;
  ledger: BudgetLedger | null;
  timeline?: TimelineNode[];
  onUpdatePulse: (data: {
    actual_checked_in: number;
    revised_expected_guests: number;
    revised_budget?: number;
    delayed_node_id?: string;
    delay_minutes?: number;
  }) => Promise<void>;
  onGenerateFssaiManifest: (surplusKg: number, hotTemp: number, coldTemp: number) => Promise<void>;
  onTriggerRescueIncident: (type: string, values: Record<string, any>) => void;
  loading: boolean;
}

export const EventPulse: React.FC<EventPulseProps> = ({
  blueprint,
  foodRadar,
  ledger,
  onUpdatePulse,
  onGenerateFssaiManifest,
  onTriggerRescueIncident,
  loading,
}) => {
  const [checkedIn, setCheckedIn] = useState(210);
  const expectedTotal = blueprint?.expected_guests || 250;

  if (!blueprint) {
    return (
      <div className="tactical-card text-center py-12">
        <Activity className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h2 className="heading-card">Event Not Initialized</h2>
        <p className="text-sub mt-1 max-w-sm mx-auto">
          Please create a celebration blueprint in Tab 1 before accessing the Day-of-Event Pulse.
        </p>
      </div>
    );
  }

  const handleAttendanceChange = (val: number) => {
    setCheckedIn(val);
    onUpdatePulse({
      actual_checked_in: val,
      revised_expected_guests: expectedTotal,
    });
  };

  return (
    <div className="space-y-8">
      {/* Event Header & Operational KPIs */}
      <div className="tactical-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-900 dark:text-cyan-300">
                <Activity className="w-4 h-4" />
              </span>
              <h2 className="heading-card">Event Pulse & Live Field Cockpit</h2>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                LIVE TELEMETRY ACTIVE
              </span>
            </div>
            <p className="text-sub mt-1">
              Real-time synchronization between gate check-ins, kitchen batch rates, budget ledgers, and sound curfews.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-sub block text-[11px] uppercase tracking-wider font-semibold">Active Plan Version</span>
            <span className="text-sm font-bold font-mono text-cyan-700 dark:text-cyan-400">v{blueprint.version}.0 (Synchronized)</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {/* Attendance KPI */}
          <div className="tactical-subcard">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-medium">
                <Users className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Live Attendance Rate
              </span>
              <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                {Math.round((checkedIn / Math.max(1, blueprint.expected_guests)) * 100)}%
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {checkedIn} <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">/ {blueprint.expected_guests} Expected</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700/60 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-cyan-600 dark:bg-cyan-400 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (checkedIn / blueprint.expected_guests) * 100)}%` }}
              />
            </div>
          </div>

          {/* Budget Health KPI */}
          <div className="tactical-subcard">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-medium">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Financial Allocation
              </span>
              <span className="font-semibold font-mono text-emerald-700 dark:text-emerald-400">Protected</span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              ₹{ledger?.spent_total?.toLocaleString() ?? '120,000'}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">
                / ₹{blueprint.total_budget.toLocaleString()} Approved
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1 font-mono">
              Committed: ₹{ledger?.committed_unpaid_total?.toLocaleString() ?? '180,000'} | Contingency: ₹{ledger?.contingency_allocation?.toLocaleString() ?? '25,000'}
            </span>
          </div>

          {/* Acoustic Curfew Countdown KPI */}
          <div className="tactical-subcard">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                Police Acoustic Limit
              </span>
              <span className="font-semibold font-mono text-rose-700 dark:text-rose-400">Curfew: 22:00</span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              75 dB <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">Limit Enforced</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
              Sound curfew strictly monitored; no amplified noise past cutoff.
            </span>
          </div>
        </div>

        {/* Live Attendance Slider */}
        <div className="mt-6 p-4 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-800/40">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
            <span>Simulate Gate Check-Ins (Actual vs Expected)</span>
            <span className="text-cyan-700 dark:text-cyan-300 font-bold font-mono">{checkedIn} Checked-In</span>
          </div>
          <input
            type="range"
            min="10"
            max={blueprint.max_venue_capacity}
            value={checkedIn}
            onChange={(e) => handleAttendanceChange(Number(e.target.value))}
            className="w-full accent-cyan-600 dark:accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
            <span>10</span>
            <span>RSVP: {blueprint.expected_guests}</span>
            <span>HSE Max: {blueprint.max_venue_capacity}</span>
          </div>
        </div>
      </div>

      {/* Hero Food Sufficiency Radar Component */}
      <FoodSufficiencyRadar
        radar={foodRadar}
        onGenerateFssaiManifest={onGenerateFssaiManifest}
        loading={loading}
      />

      {/* Procedural Venue Zone Schematic Component */}
      <SvgVenueSchematic
        expectedGuests={blueprint.expected_guests}
        actualCheckedIn={checkedIn}
        maxCapacity={blueprint.max_venue_capacity}
      />

      {/* Rapid Incident Injection Bar (Triggers Rescue Studio) */}
      <div className="tactical-card">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h3 className="heading-section text-slate-900 dark:text-slate-100">
            Simulate Live Day-of-Event Shocks (Send to Rescue Studio)
          </h3>
        </div>
        <p className="text-sub mb-4">
          Click any crisis scenario to test how Gemini synthesizes 3 comparative recovery alternatives in real time:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() =>
              onTriggerRescueIncident('Attendance Surge', {
                new_guests: 360,
                shortage_count: 0,
              })
            }
            className="p-3 text-left rounded-xl bg-cyan-50/70 hover:bg-cyan-100/70 dark:bg-cyan-950/30 dark:hover:bg-cyan-900/40 border border-cyan-200 dark:border-cyan-800/60 transition-colors"
          >
            <span className="text-xs font-bold text-cyan-950 dark:text-cyan-200 flex items-center justify-between">
              Crowd Surge (+44%)
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] text-cyan-800 dark:text-cyan-300/80 block mt-1">
              Jump from 250 to 360 guests mid-event.
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              onTriggerRescueIncident('Food Shortage', {
                shortage_count: 40,
                category: 'General Vegetarian',
              })
            }
            className="p-3 text-left rounded-xl bg-amber-50/70 hover:bg-amber-100/70 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800/60 transition-colors"
          >
            <span className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center justify-between">
              Main Course Shortage
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] text-amber-800 dark:text-amber-300/80 block mt-1">
              40-plate gap detected 45m into feast.
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              onTriggerRescueIncident('Budget Cut', {
                budget_cut_amount: 80000,
              })
            }
            className="p-3 text-left rounded-xl bg-rose-50/70 hover:bg-rose-100/70 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/60 transition-colors"
          >
            <span className="text-xs font-bold text-rose-950 dark:text-rose-200 flex items-center justify-between">
              Budget Slash (-₹80k)
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] text-rose-800 dark:text-rose-300/80 block mt-1">
              Sponsor pulls out 48h before event.
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              onTriggerRescueIncident('Timeline Delay', {
                delay_minutes: 40,
              })
            }
            className="p-3 text-left rounded-xl bg-slate-50/70 hover:bg-slate-100/70 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <span className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center justify-between">
              Ceremony Delay (+40m)
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-1">
              Priest delayed; shifts catering call-time.
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
