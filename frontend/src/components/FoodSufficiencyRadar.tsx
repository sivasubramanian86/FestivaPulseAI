import React, { useState } from 'react';
import {
  UtensilsCrossed,
  AlertTriangle,
  CheckCircle2,
  Award,
  Truck,
  Leaf,
  ShieldCheck,
} from 'lucide-react';
import { FoodSufficiencyRadar as FoodRadarType } from '../types';

interface FoodSufficiencyRadarProps {
  radar: FoodRadarType | null;
  onGenerateFssaiManifest: (surplusKg: number, hotTemp: number, coldTemp: number) => Promise<void>;
  loading: boolean;
}

export const FoodSufficiencyRadar: React.FC<FoodSufficiencyRadarProps> = ({
  radar,
  onGenerateFssaiManifest,
  loading,
}) => {
  const [surplusKg, setSurplusKg] = useState(35);
  const [hotTemp, setHotTemp] = useState(68);
  const [coldTemp, setColdTemp] = useState(4);
  const [showManifestForm, setShowManifestForm] = useState(false);

  if (!radar) {
    return (
      <div className="tactical-card text-center py-12">
        <UtensilsCrossed className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-sub">Initialize an event to view the live Food Sufficiency Radar.</p>
      </div>
    );
  }

  const handleManifestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateFssaiManifest(surplusKg, hotTemp, coldTemp);
  };

  return (
    <div className="space-y-6">
      {/* Food Sufficiency Radar Header */}
      <div className="tactical-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                <UtensilsCrossed className="w-4 h-4" />
              </span>
              <h3 className="heading-card">FestivaFoodGuard: Category-Level Sufficiency Radar</h3>
            </div>
            <p className="text-sub mt-1">
              Real-time consumption curves, tray burn rates, and zero-stockout monitoring by dietary category.
            </p>
          </div>

          {/* Quick Summary Pill */}
          <div className="flex items-center gap-3 flex-wrap">
            {radar.total_shortfall_count > 0 ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center gap-1.5 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                {radar.total_shortfall_count} Portion Shortfall
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Zero Shortfall Guaranteed
              </span>
            )}
            <span className="text-xs font-medium font-mono text-slate-500 dark:text-slate-400">
              {radar.total_surplus_count} Surplus Portions
            </span>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-tactical-darkBorder">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-tactical-darkBorder text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-tactical-darkCard text-slate-600 dark:text-slate-300">
                <th className="px-3 py-2.5 text-left font-semibold">Dietary Category</th>
                <th className="px-3 py-2.5 text-right font-semibold">Required</th>
                <th className="px-3 py-2.5 text-right font-semibold">Prepared</th>
                <th className="px-3 py-2.5 text-right font-semibold">Served</th>
                <th className="px-3 py-2.5 text-right font-semibold">Available</th>
                <th className="px-3 py-2.5 text-right font-semibold">Burn Rate</th>
                <th className="px-3 py-2.5 text-center font-semibold">Depletion Time</th>
                <th className="px-3 py-2.5 text-center font-semibold">Net Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-tactical-darkBorder text-slate-800 dark:text-slate-200">
              {radar.categories.map((c, i) => (
                <tr
                  key={i}
                  className={
                    c.is_critical_shortage
                      ? 'bg-red-50/70 dark:bg-red-950/30'
                      : 'hover:bg-slate-50/60 dark:hover:bg-tactical-darkCard/50 transition-colors'
                  }
                >
                  <td className="px-3 py-2.5 font-semibold flex items-center gap-2">
                    {c.is_critical_shortage && (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    )}
                    <span>{c.category}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-slate-600 dark:text-slate-400">{c.required_portions}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-medium">{c.prepared_portions}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-slate-600 dark:text-slate-400">{c.served_portions}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">{c.available_portions}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-medium text-amber-700 dark:text-amber-400">
                    {c.burn_rate_plates_per_min} pl/min
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono font-medium">
                    {c.depletion_projected_minutes !== null ? (
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        c.depletion_projected_minutes < 25
                          ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        ~{c.depletion_projected_minutes} mins
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 font-sans">Stable</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                        c.net_shortfall_or_surplus < 0
                          ? 'bg-red-600 text-white'
                          : c.net_shortfall_or_surplus === 0
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      {c.net_shortfall_or_surplus > 0 ? `+${c.net_shortfall_or_surplus}` : c.net_shortfall_or_surplus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FSSAI Certified Surplus Food Recovery Manifest Section */}
      <div className="tactical-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <h3 className="heading-card">
                FSSAI Regulatory Food-Surplus Rescue & ESG Manifest
              </h3>
            </div>
            <p className="text-sub mt-1">
              Certified handoff workflow matching Feeding India & Robin Hood Army with ESG carbon offset certificates.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowManifestForm(!showManifestForm)}
            className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-sm"
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-300" />
            <span>{showManifestForm ? 'Close Dispatch Form' : 'Generate FSSAI Dispatch Pass'}</span>
          </button>
        </div>

        {/* FSSAI Form */}
        {showManifestForm && (
          <form onSubmit={handleManifestSubmit} className="mt-6 tactical-subcard space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="tactical-label">Surplus Quantity (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={surplusKg}
                  onChange={(e) => setSurplusKg(Number(e.target.value))}
                  required
                  className="tactical-input font-mono"
                />
              </div>

              <div>
                <label className="tactical-label">
                  Hot Holding Temp (FSSAI &gt;= 63°C)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={hotTemp}
                  onChange={(e) => setHotTemp(Number(e.target.value))}
                  required
                  className="tactical-input font-mono"
                />
              </div>

              <div>
                <label className="tactical-label">
                  Cold Holding Temp (FSSAI &lt;= 5°C)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={coldTemp}
                  onChange={(e) => setColdTemp(Number(e.target.value))}
                  required
                  className="tactical-input font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-semibold shadow transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Verify & Issue FSSAI Food Rescue Pass</span>
              </button>
            </div>
          </form>
        )}

        {/* Active Generated Manifest Certificate */}
        {radar.fssai_manifest && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wide font-mono">
                  Official FSSAI Chain-of-Custody Manifest: {radar.fssai_manifest.manifest_id}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                radar.fssai_manifest.is_temperature_compliant
                  ? 'bg-emerald-200 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200'
                  : 'bg-red-200 dark:bg-red-900/60 text-red-900 dark:text-red-200'
              }`}>
                {radar.fssai_manifest.is_temperature_compliant ? 'FSSAI TEMPERATURE COMPLIANT' : 'NON-COMPLIANT TEMP'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-sans">Surplus Rescued:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{radar.fssai_manifest.surplus_kg_total} kg</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-sans">Assigned NGO Partner:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-sans">{radar.fssai_manifest.registered_ngo_partner}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-sans">CO2e Emissions Prevented:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {radar.fssai_manifest.carbon_emissions_prevented_kg} kg CO2e
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-sans">CSR Tax Credit Value:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  ₹{radar.fssai_manifest.csr_tax_deduction_inr.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-emerald-900 dark:text-emerald-300 border-t border-emerald-200 dark:border-emerald-800/60 pt-2 flex items-center justify-between flex-wrap gap-2">
              <span>Pickup Window: Before {radar.fssai_manifest.pickup_window_deadline}</span>
              <span>Authorized Signature: {radar.fssai_manifest.responsible_person_signature}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
