import React, { useState } from 'react';
import { FlaskConical, RotateCcw, ShieldCheck } from 'lucide-react';
import { EventBlueprint } from '../types';
import { useTranslation } from '../i18n/I18nContext';

interface ScenarioLabProps {
  blueprint: EventBlueprint | null;
}

export const ScenarioLab: React.FC<ScenarioLabProps> = ({ blueprint }) => {
  const { t } = useTranslation();
  const [attendanceDelta, setAttendanceDelta] = useState(0);
  const [budgetDeltaPct, setBudgetDeltaPct] = useState(0);
  const [delayMins, setDelayMins] = useState(0);
  const [rainDisruption, setRainDisruption] = useState(false);

  if (!blueprint) {
    return (
      <div className="tactical-card text-center py-12">
        <FlaskConical className="w-10 h-10 text-amber-300 dark:text-amber-500 mx-auto mb-3" />
        <h3 className="heading-card">{t.scenario.title}</h3>
        <p className="text-sub mt-1 max-w-md mx-auto">
          {t.scenario.emptySub}
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
              <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300">
                <FlaskConical className="w-4 h-4" />
              </span>
              <h2 className="heading-card">{t.scenario.title}</h2>
            </div>
            <p className="text-sub mt-1">
              {t.scenario.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.scenario.resetBtn}</span>
          </button>
        </div>

        {/* Sandbox Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 tactical-subcard">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>{t.scenario.attendanceShock}: {attendanceDelta > 0 ? `+${attendanceDelta}` : attendanceDelta} Guests</span>
              <span className="text-amber-700 dark:text-amber-300 font-bold font-mono">{simulatedGuests} Simulated</span>
            </div>
            <input
              type="range"
              min="-100"
              max="200"
              step="10"
              value={attendanceDelta}
              onChange={(e) => setAttendanceDelta(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>{t.scenario.budgetVariance}: {budgetDeltaPct > 0 ? `+${budgetDeltaPct}%` : `${budgetDeltaPct}%`}</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">₹{simulatedBudget.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              step="5"
              value={budgetDeltaPct}
              onChange={(e) => setBudgetDeltaPct(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>{t.scenario.delayShock}: +{delayMins} Minutes</span>
              <span className="text-amber-700 dark:text-amber-400 font-bold font-mono">Delay Offset</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="15"
              value={delayMins}
              onChange={(e) => setDelayMins(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#140F22] border border-[#E8DFD1] dark:border-[#352952]">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{t.scenario.weatherFlip}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{t.scenario.weatherSub}</span>
            </div>
            <input
              type="checkbox"
              checked={rainDisruption}
              onChange={(e) => setRainDisruption(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Real-time Simulated Forecast */}
        <div className="mt-6 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 space-y-3">
          <h3 className="heading-section text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            {t.scenario.assessmentTitle}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white dark:bg-[#1D1630] rounded-lg border border-[#E8DFD1] dark:border-[#352952] font-mono shadow-sm">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-sans">{t.scenario.cateringReq}</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{simulatedGuests} Portions Needed</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-0.5 font-sans">
                Staggered Wave 1 (40%): {Math.round(simulatedGuests * 0.4)} plates
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-[#1D1630] rounded-lg border border-[#E8DFD1] dark:border-[#352952] font-mono shadow-sm">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-sans">{t.scenario.venueSafety}</span>
              <span className={`font-bold ${isOverCapacity ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                {isOverCapacity ? 'HSE Capacity Breach!' : 'Within Safe Capacity'}
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-0.5 font-sans">
                Limit: {blueprint.max_venue_capacity} seats
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-[#1D1630] rounded-lg border border-[#E8DFD1] dark:border-[#352952] font-mono shadow-sm">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-sans">{t.scenario.curfewProj}</span>
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

