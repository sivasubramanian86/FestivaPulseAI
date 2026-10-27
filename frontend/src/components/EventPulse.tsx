import React, { useState } from 'react';
import {
  Activity,
  Users,
  IndianRupee,
  Sparkles,
  ArrowRight,
  Volume2,
} from 'lucide-react';
import { EventBlueprint, FoodSufficiencyRadar as FoodRadarType, BudgetLedger, TimelineNode } from '../types';
import { FoodSufficiencyRadar } from './FoodSufficiencyRadar';
import { SvgVenueSchematic } from './SvgVenueSchematic';
import { useTranslation } from '../i18n';

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
  const { t } = useTranslation();
  const [checkedIn, setCheckedIn] = useState(210);
  const expectedTotal = blueprint?.expected_guests || 250;

  if (!blueprint) {
    return (
      <div className="tactical-card text-center py-16">
        <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-3 animate-pulse" />
        <h2 className="heading-card">Event Not Initialized</h2>
        <p className="text-sub mt-2 max-w-md mx-auto">
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
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-sm">
                <Activity className="w-5 h-5" />
              </span>
              <h2 className="heading-card">{t.pulse.title}</h2>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                LIVE TELEMETRY ACTIVE
              </span>
            </div>
            <p className="text-sub mt-1.5 max-w-3xl">
              {t.pulse.subtitle}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-sub block text-[11px] uppercase tracking-wider font-semibold">Active Plan Version</span>
            <span className="text-sm font-bold font-mono text-amber-700 dark:text-amber-400">v{blueprint.version}.0 (Synchronized)</span>
          </div>
        </div>

        {/* Festive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
          {/* Attendance KPI */}
          <div className="tactical-subcard border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                {t.pulse.attendanceRate}
              </span>
              <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                {Math.round((checkedIn / Math.max(1, blueprint.expected_guests)) * 100)}%
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {checkedIn} <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">/ {blueprint.expected_guests} Expected</span>
            </div>
            <div className="w-full bg-amber-100 dark:bg-slate-800 rounded-full h-2 mt-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-rose-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (checkedIn / blueprint.expected_guests) * 100)}%` }}
              />
            </div>
          </div>

          {/* Budget Health KPI */}
          <div className="tactical-subcard border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {t.pulse.financialAllocation}
              </span>
              <span className="font-semibold font-mono text-emerald-700 dark:text-emerald-400">Protected</span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              ₹{ledger?.spent_total?.toLocaleString() ?? '120,000'}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">
                / ₹{blueprint.total_budget.toLocaleString()} Approved
              </span>
            </div>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-1 font-mono">
              Committed: ₹{ledger?.committed_unpaid_total?.toLocaleString() ?? '180,000'} | Contingency: ₹{ledger?.contingency_allocation?.toLocaleString() ?? '25,000'}
            </span>
          </div>

          {/* Acoustic Curfew Countdown KPI */}
          <div className="tactical-subcard border-l-4 border-l-rose-500">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <Volume2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                {t.pulse.policeLimit}
              </span>
              <span className="font-semibold font-mono text-rose-700 dark:text-rose-400">Curfew: 22:00</span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              75 dB <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">Limit Enforced</span>
            </div>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-1">
              Sound curfew strictly monitored; no amplified noise past cutoff.
            </span>
          </div>
        </div>

        {/* Live Attendance Slider */}
        <div className="mt-6 p-4 rounded-xl bg-amber-50/60 dark:bg-[#1D1630] border border-amber-200/80 dark:border-[#352952]">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
            <span>{t.pulse.simulateGate}</span>
            <span className="text-amber-800 dark:text-amber-300 font-bold font-mono">{checkedIn} Checked-In</span>
          </div>
          <input
            type="range"
            min="10"
            max={blueprint.max_venue_capacity}
            value={checkedIn}
            onChange={(e) => handleAttendanceChange(Number(e.target.value))}
            className="w-full accent-amber-600 dark:accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 font-mono">
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
          <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h3 className="heading-section text-slate-900 dark:text-slate-100">
            {t.pulse.shockHeader}
          </h3>
        </div>
        <p className="text-sub mb-4">
          {t.pulse.shockSub}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          <button
            type="button"
            onClick={() =>
              onTriggerRescueIncident('Attendance Surge', {
                new_guests: 360,
                shortage_count: 0,
              })
            }
            className="p-3.5 text-left rounded-xl bg-amber-50/80 hover:bg-amber-100/80 dark:bg-[#1D1630] dark:hover:bg-[#251C3E] border border-amber-200 dark:border-[#352952] transition-all shadow-sm"
          >
            <span className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center justify-between">
              {t.pulse.crowdSurge}
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] text-amber-800 dark:text-amber-300/80 block mt-1">
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
            className="p-3.5 text-left rounded-xl bg-rose-50/80 hover:bg-rose-100/80 dark:bg-[#1D1630] dark:hover:bg-[#251C3E] border border-rose-200 dark:border-[#352952] transition-all shadow-sm"
          >
            <span className="text-xs font-bold text-rose-950 dark:text-rose-200 flex items-center justify-between">
              {t.pulse.foodShortage}
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] text-rose-800 dark:text-rose-300/80 block mt-1">
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
            className="p-3.5 text-left rounded-xl bg-indigo-50/80 hover:bg-indigo-100/80 dark:bg-[#1D1630] dark:hover:bg-[#251C3E] border border-indigo-200 dark:border-[#352952] transition-all shadow-sm"
          >
            <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center justify-between">
              {t.pulse.budgetSlash}
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] text-indigo-800 dark:text-indigo-300/80 block mt-1">
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
            className="p-3.5 text-left rounded-xl bg-purple-50/80 hover:bg-purple-100/80 dark:bg-[#1D1630] dark:hover:bg-[#251C3E] border border-purple-200 dark:border-[#352952] transition-all shadow-sm"
          >
            <span className="text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center justify-between">
              {t.pulse.timelineDelay}
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] text-purple-800 dark:text-purple-300/80 block mt-1">
              Priest delayed; shifts catering call-time.
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
