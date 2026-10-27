import React, { useState } from 'react';
import { FlaskConical, RotateCcw, ShieldCheck } from 'lucide-react';
import { EventBlueprint } from '../types';

interface ScenarioLabProps {
  blueprint: EventBlueprint | null;
}

export const ScenarioLab: React.FC<ScenarioLabProps> = ({ blueprint }) => {
  const [attendanceDelta, setAttendanceDelta] = useState(0);
  const [budgetDeltaPct, setBudgetDeltaPct] = useState(0);
  const [delayMins, setDelayMins] = useState(0);
  const [rainDisruption, setRainDisruption] = useState(false);

  if (!blueprint) {
    return (
      <div className="tactical-card text-center py-12">
        <FlaskConical className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h3 className="heading-card">Scenario Lab Ready</h3>
        <p className="text-sub mt-1 max-w-md mx-auto">
          Initialize a celebration in Tab 1 to run reversible 'What-If' simulations.
        </p>
      </div>
    );
  }

  const simulatedGuests = blueprint.expected_guests + attendanceDelta;
  const simulatedBudget = Math.round(blueprint.total_budget * (1 + budgetDeltaPct / 100));
  const isOverCapacity = simulatedGuests > blueprint.max_venue_capacity;

  const handleReset = () => {
    setAttendanceDelta(0);
    setBudgetDeltaPct(0);
    setDelayMins(0);
    setRainDisruption(false);
  };

  return (
    <div className="space-y-6">
      <div className="tactical-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-900 dark:text-teal-300">
                <FlaskConical className="w-4 h-4" />
              </span>
              <h2 className="heading-card">Scenario Lab: Reversible What-If Sandbox</h2>
            </div>
            <p className="text-sub mt-1">
              Stress-test multi-variable contingency shocks in an isolated sandbox. Simulations NEVER alter actual event state.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sandbox</span>
          </button>
        </div>

        {/* Sandbox Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 tactical-subcard">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Attendance Shock: {attendanceDelta > 0 ? `+${attendanceDelta}` : attendanceDelta} Guests</span>
              <span className="text-cyan-700 dark:text-cyan-300 font-bold font-mono">{simulatedGuests} Simulated</span>
            </div>
            <input
              type="range"
              min="-100"
              max="200"
              step="10"
              value={attendanceDelta}
              onChange={(e) => setAttendanceDelta(Number(e.target.value))}
              className="w-full accent-cyan-600 dark:accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Budget Variance: {budgetDeltaPct > 0 ? `+${budgetDeltaPct}%` : `${budgetDeltaPct}%`}</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">₹{simulatedBudget.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              step="5"
              value={budgetDeltaPct}
              onChange={(e) => setBudgetDeltaPct(Number(e.target.value))}
              className="w-full accent-cyan-600 dark:accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Ceremony Delay Shock: +{delayMins} Minutes</span>
              <span className="text-amber-700 dark:text-amber-400 font-bold font-mono">Delay Offset</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="15"
              value={delayMins}
              onChange={(e) => setDelayMins(Number(e.target.value))}
              className="w-full accent-cyan-600 dark:accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-tactical-darkSurface border border-slate-200 dark:border-tactical-darkBorder">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Outdoor Weather Flip (Rain Shock)</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Relocate outdoor lawn seating to indoor hall B</span>
            </div>
            <input
              type="checkbox"
              checked={rainDisruption}
              onChange={(e) => setRainDisruption(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-600 focus:ring-tactical-cyan cursor-pointer"
            />
          </div>
        </div>

        {/* Real-time Simulated Forecast */}
        <div className="mt-6 p-4 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-800/40 space-y-3">
          <h3 className="heading-section text-cyan-950 dark:text-cyan-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Simulation Impact Assessment
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white dark:bg-tactical-darkCard rounded-lg border border-slate-200/80 dark:border-tactical-darkBorder font-mono">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-sans">Catering Requirement:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{simulatedGuests} Portions Needed</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-0.5 font-sans">
                Staggered Wave 1 (40%): {Math.round(simulatedGuests * 0.4)} plates
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-tactical-darkCard rounded-lg border border-slate-200/80 dark:border-tactical-darkBorder font-mono">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-sans">Venue Safety Status:</span>
              <span className={`font-bold ${isOverCapacity ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                {isOverCapacity ? 'HSE Capacity Breach!' : 'Within Safe Capacity'}
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-0.5 font-sans">
                Limit: {blueprint.max_venue_capacity} seats
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-tactical-darkCard rounded-lg border border-slate-200/80 dark:border-tactical-darkBorder font-mono">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-sans">Curfew Projection:</span>
              <span className={`font-bold ${delayMins > 30 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                {delayMins > 30 ? 'Curfew Breach Alert' : 'Curfew Compliant'}
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-0.5 font-sans">
                {delayMins > 30 ? 'Overtime penalty ₹15,000' : 'No overtime expected'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
