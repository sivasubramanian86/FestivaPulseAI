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
      <div className="bg-white rounded-2xl p-8 border border-festiva-border shadow-sm text-center">
        <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-800">Event Not Initialized</h2>
        <p className="text-xs text-slate-500 mt-1">
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
      <div className="bg-white rounded-2xl p-6 border border-festiva-border shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-900">
                <Activity className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">Event Pulse & Live Field Cockpit</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                LIVE TELEMETRY ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Real-time synchronization between gate check-ins, kitchen batch rates, budget ledgers, and sound curfews.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 block">Active Plan Version</span>
            <span className="text-sm font-bold text-indigo-900">v{blueprint.version}.0 (Synchronized)</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {/* Attendance KPI */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                Live Attendance Rate
              </span>
              <span className="font-semibold text-slate-700">
                {Math.round((checkedIn / Math.max(1, blueprint.expected_guests)) * 100)}%
              </span>
            </div>
            <div className="text-xl font-bold text-slate-900">
              {checkedIn} <span className="text-xs font-normal text-slate-500">/ {blueprint.expected_guests} Expected</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div
                className="bg-indigo-600 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, (checkedIn / blueprint.expected_guests) * 100)}%` }}
              />
            </div>
          </div>

          {/* Budget Health KPI */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                Financial Allocation
              </span>
              <span className="font-semibold text-emerald-700">Protected</span>
            </div>
            <div className="text-xl font-bold text-slate-900">
              ₹{ledger?.spent_total?.toLocaleString() ?? '120,000'}{' '}
              <span className="text-xs font-normal text-slate-500">
                / ₹{blueprint.total_budget.toLocaleString()} Approved
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              Committed: ₹{ledger?.committed_unpaid_total?.toLocaleString() ?? '180,000'} | Contingency: ₹{ledger?.contingency_allocation?.toLocaleString() ?? '25,000'}
            </span>
          </div>

          {/* Acoustic Curfew Countdown KPI */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                Police Acoustic Limit
              </span>
              <span className="font-semibold text-rose-700">Curfew: 22:00</span>
            </div>
            <div className="text-xl font-bold text-slate-900">
              75 dB <span className="text-xs font-normal text-slate-500">Limit Enforced</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              Sound curfew strictly monitored; no amplified noise past cutoff.
            </span>
          </div>
        </div>

        {/* Live Attendance Slider */}
        <div className="mt-6 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-2">
            <span>Simulate Gate Check-Ins (Actual vs Expected)</span>
            <span className="text-indigo-800 font-bold">{checkedIn} Checked-In</span>
          </div>
          <input
            type="range"
            min="10"
            max={blueprint.max_venue_capacity}
            value={checkedIn}
            onChange={(e) => handleAttendanceChange(Number(e.target.value))}
            className="w-full accent-indigo-700 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-1">
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
      <div className="bg-white rounded-2xl p-6 border border-festiva-border shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Simulate Live Day-of-Event Shocks (Send to Rescue Studio)
          </h3>
        </div>
        <p className="text-xs text-slate-600 mb-4">
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
            className="p-3 text-left rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
          >
            <span className="text-xs font-bold text-indigo-900 block flex items-center justify-between">
              Crowd Surge (+44%)
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] text-indigo-700 block mt-1">
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
            className="p-3 text-left rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
          >
            <span className="text-xs font-bold text-amber-900 block flex items-center justify-between">
              Main Course Shortage
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] text-amber-700 block mt-1">
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
            className="p-3 text-left rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            <span className="text-xs font-bold text-rose-900 block flex items-center justify-between">
              Budget Slash (-₹80k)
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] text-rose-700 block mt-1">
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
            className="p-3 text-left rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <span className="text-xs font-bold text-slate-900 block flex items-center justify-between">
              Ceremony Delay (+40m)
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] text-slate-700 block mt-1">
              Priest delayed; shifts catering call-time.
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
