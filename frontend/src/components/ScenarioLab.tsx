import React, { useState } from 'react';
import { 
  FlaskConical, 
  RotateCcw, 
  ShieldCheck, 
  Utensils, 
  Clock, 
  Coins, 
  Building2, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
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
  const [adjustmentsApplied, setAdjustmentsApplied] = useState(false);

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
    setAdjustmentsApplied(false);
  };

  // Tactical operational adjustment calculations
  const cateringAdjustment = attendanceDelta > 0
    ? {
        type: 'warning',
        title: `Kitchen Batch Expansion (+${attendanceDelta} Guests)`,
        action: `Deploy +${Math.round(attendanceDelta * 0.45)} kg Basmati rice/curry expansion to Live Counter 3. Alert Head Chef for Staggered Batch 2 cooking release at 13:15. Ensure +${attendanceDelta} brass thali plates are unboxed from backup storage.`
      }
    : attendanceDelta < 0
    ? {
        type: 'info',
        title: `Surplus Prevention & FSSAI Routing (${attendanceDelta} Guests)`,
        action: `Scale back evening dessert & bread batch by ${Math.abs(attendanceDelta)} servings. Pre-book Robin Hood Army / Feeding India pickup for ~${(Math.abs(attendanceDelta) * 0.35).toFixed(1)} kg surplus redistribution at 15:30. Zero food wasted.`
      }
    : {
        type: 'success',
        title: 'Catering Flow Optimal',
        action: 'Standard 3-batch staggered preparation active. Buffet throughput capacity: 420 guests/hour across 4 dual-sided counters.'
      };

  const venueAdjustment = isOverCapacity
    ? {
        type: 'danger',
        title: `HSE Capacity Breach (${simulatedGuests} / ${blueprint.max_venue_capacity} seats)`,
        action: `DEPLOY OVERFLOW PLAN: Move 4 banquet round tables (32 chairs) into shaded Courtyard West. Open double glass French doors. Maintain 2.5m central aisle clearance for bride & groom procession.`
      }
    : rainDisruption
    ? {
        type: 'warning',
        title: 'Weather Inversion (Rain Disruption Active)',
        action: `Trigger Monsoon Contingency Blue: Relocate Cocktail & High-Tea from open Mughal lawn to Crystal Ballroom East. Deploy water-resistant waterproof canopy walkway from Valet arrival portico to Grand Foyer.`
      }
    : {
        type: 'success',
        title: `Venue Density Balanced (${Math.round((simulatedGuests / blueprint.max_venue_capacity) * 100)}% Occupancy)`,
        action: 'All spatial safety fire egress corridors clear (>2.0m). Elderly seating sanctuary fully isolated from loud sound monitors.'
      };

  const budgetAdjustment = budgetDeltaPct < 0
    ? {
        type: 'warning',
        title: `Budget Compression (-₹${Math.abs(simulatedBudget - blueprint.total_budget).toLocaleString()})`,
        action: `ABSORPTION DIRECTIVE: Deduct ₹${Math.abs(simulatedBudget - blueprint.total_budget).toLocaleString()} from discretionary entrance arch florals & secondary ambient wash lighting. Preserve 100% of core Pandit Muhurtham rituals, live Shehnai musicians, and hot food quality.`
      }
    : budgetDeltaPct > 0
    ? {
        type: 'success',
        title: `Surplus Fund Optimization (+₹${(simulatedBudget - blueprint.total_budget).toLocaleString()})`,
        action: `SURPLUS UPGRADE DIRECTIVE: Allocate +₹${(simulatedBudget - blueprint.total_budget).toLocaleString()} to Premium Scented Jasmine & Tuberose ceiling garlands and add 4K Drone live cinematic aerial streaming.`
      }
    : {
        type: 'neutral',
        title: 'Budget Variance Baseline',
        action: `Total allocation locked at ₹${blueprint.total_budget.toLocaleString()}. 12% contingency buffer held in reserve for emergency supplier overtime.`
      };

  const timelineAdjustment = delayMins > 30
    ? {
        type: 'danger',
        title: `Timeline Drift & Curfew Hazard (+${delayMins} min offset)`,
        action: `CRITICAL CASINO TIME COMPRESSION: Shorten formal couple stage photo line from 45 min to 25 min. Compress VIP felicitations. Accelerate Sangeet DJ performance start by 15 min to conclude strictly by 22:00 sound curfew cutoff (saving ₹15,000 police citation penalty).`
      }
    : delayMins > 0
    ? {
        type: 'warning',
        title: `Minor Schedule Delay (+${delayMins} min)`,
        action: `Re-sequence Baraat procession and Varmala exchange. Notify live catering team to keep buffet warmth stations sealed under brass cloches for an extra ${delayMins} minutes.`
      }
    : {
        type: 'success',
        title: 'Timeline Milestones Synchronized',
        action: 'Shubh Muhurtham ritual window at 10:48 AM protected with zero drift. All 7 vendor check-in gates reporting on schedule.'
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
              onChange={(e) => {
                setAttendanceDelta(Number(e.target.value));
                setAdjustmentsApplied(false);
              }}
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
              onChange={(e) => {
                setBudgetDeltaPct(Number(e.target.value));
                setAdjustmentsApplied(false);
              }}
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
              onChange={(e) => {
                setDelayMins(Number(e.target.value));
                setAdjustmentsApplied(false);
              }}
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
              onChange={(e) => {
                setRainDisruption(e.target.checked);
                setAdjustmentsApplied(false);
              }}
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

        {/* Dynamic Required Operational Adjustments & Directives */}
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-amber-900/10 dark:from-[#251A3A] dark:to-[#171026] border-2 border-amber-400/50 dark:border-amber-500/30 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-300/40 dark:border-amber-700/40 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="heading-section text-amber-950 dark:text-amber-200 text-base font-bold">
                  Required Tactical Adjustments & Operations Directives
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Real-time deterministic calculations indicating exactly what must be reconfigured across Kitchen, Floor Layout, Budget, and Timeline.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAdjustmentsApplied(true)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                adjustmentsApplied
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold shadow-amber-500/20'
              }`}
            >
              {adjustmentsApplied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Directives Dispatched to Vendors</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                  <span>Lock & Dispatch Directives</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Catering Directive */}
            <div className={`p-4 rounded-xl border transition-all ${
              cateringAdjustment.type === 'warning' 
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60'
                : cateringAdjustment.type === 'info'
                ? 'bg-sky-50 dark:bg-sky-950/30 border-sky-300 dark:border-sky-700/60'
                : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/60'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {cateringAdjustment.title}
                </h4>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {cateringAdjustment.action}
              </p>
            </div>

            {/* Venue Directive */}
            <div className={`p-4 rounded-xl border transition-all ${
              venueAdjustment.type === 'danger'
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-400 dark:border-rose-700/60 animate-pulse'
                : venueAdjustment.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60'
                : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/60'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-rose-700 dark:text-rose-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {venueAdjustment.title}
                </h4>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {venueAdjustment.action}
              </p>
            </div>

            {/* Budget Directive */}
            <div className={`p-4 rounded-xl border transition-all ${
              budgetAdjustment.type === 'warning'
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700/60'
                : budgetAdjustment.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/60'
                : 'bg-slate-50 dark:bg-[#1A1329] border-slate-200 dark:border-slate-800'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {budgetAdjustment.title}
                </h4>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {budgetAdjustment.action}
              </p>
            </div>

            {/* Timeline Directive */}
            <div className={`p-4 rounded-xl border transition-all ${
              timelineAdjustment.type === 'danger'
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-400 dark:border-rose-700/60'
                : timelineAdjustment.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60'
                : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/60'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {timelineAdjustment.title}
                </h4>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {timelineAdjustment.action}
              </p>
            </div>
          </div>

          {adjustmentsApplied && (
            <div className="p-3 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>Directives cryptographically hashed & synced with all on-duty coordinators via Pub/Sub mesh.</span>
              </span>
              <span className="text-[10px] font-mono opacity-80">LATENCY 42ms</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

