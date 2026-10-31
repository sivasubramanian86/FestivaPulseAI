/**
 * @file FoodSufficiencyRadar.tsx
 * @description Food Sufficiency & 40/30/30 Batch Kitchen Radar Component.
 * Tracks batch preparation covers, buffer thresholds, predicted surplus vs deficit,
 * and handles 1-click FSSAI certified cold-chain manifest generation for NGO food recovery networks.
 *
 * @module components/FoodSufficiencyRadar
 * @version 2.0.0
 */

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
import { useTranslation } from '../i18n';

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
  const { t } = useTranslation();
  const [surplusKg, setSurplusKg] = useState(35);
  const [hotTemp, setHotTemp] = useState(68);
  const [coldTemp, setColdTemp] = useState(4);
  const [showManifestForm, setShowManifestForm] = useState(false);

  if (!radar) {
    return (
      <div className="tactical-card text-center py-16">
        <UtensilsCrossed className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <p className="text-sub max-w-md mx-auto">{t.radar.emptySub}</p>
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
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white shadow-sm">
                <UtensilsCrossed className="w-5 h-5" />
              </span>
              <h3 className="heading-card">{t.radar.title}</h3>
            </div>
            <p className="text-sub mt-1.5 max-w-2xl">
              {t.radar.subtitle}
            </p>
          </div>

          {/* Quick Summary Pill */}
          <div className="flex items-center gap-3 flex-wrap">
            {radar.total_shortfall_count > 0 ? (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold font-mono bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800 flex items-center gap-1.5 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                {radar.total_shortfall_count} {t.radar.shortfall}
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {t.radar.zeroShortfall}
              </span>
            )}
            <span className="text-xs font-medium font-mono text-slate-600 dark:text-slate-300 bg-amber-50 dark:bg-[#1D1630] px-3 py-1.5 rounded-full border border-amber-200 dark:border-[#352952]">
              {radar.total_surplus_count} {t.radar.surplusPortions}
            </span>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#E8DFD1] dark:border-[#352952] shadow-sm">
          <table className="min-w-full divide-y divide-[#E8DFD1] dark:divide-[#352952] text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] dark:bg-[#1D1630] text-slate-700 dark:text-[#E8DFD1]">
                <th className="px-3.5 py-3 text-left font-bold">{t.radar.categoryCol}</th>
                <th className="px-3.5 py-3 text-right font-bold">{t.radar.requiredCol}</th>
                <th className="px-3.5 py-3 text-right font-bold">{t.radar.preparedCol}</th>
                <th className="px-3.5 py-3 text-right font-bold">{t.radar.servedCol}</th>
                <th className="px-3.5 py-3 text-right font-bold">{t.radar.availableCol}</th>
                <th className="px-3.5 py-3 text-right font-bold">{t.radar.burnRateCol}</th>
                <th className="px-3.5 py-3 text-center font-bold">{t.radar.depletionCol}</th>
                <th className="px-3.5 py-3 text-center font-bold">{t.radar.netBalanceCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE8DD] dark:divide-[#352952] text-slate-800 dark:text-slate-200 bg-white/70 dark:bg-[#140F22]/70">
              {radar.categories.map((c, i) => (
                <tr
                  key={i}
                  className={
                    c.is_critical_shortage
                      ? 'bg-red-50/80 dark:bg-red-950/40'
                      : 'hover:bg-amber-50/40 dark:hover:bg-[#1D1630]/60 transition-colors'
                  }
                >
                  <td className="px-3.5 py-3 font-semibold flex items-center gap-2">
                    {c.is_critical_shortage && (
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                    )}
                    <span>{c.category}</span>
                  </td>
                  <td className="px-3.5 py-3 text-right font-mono text-slate-600 dark:text-slate-400">{c.required_portions}</td>
                  <td className="px-3.5 py-3 text-right font-mono font-medium">{c.prepared_portions}</td>
                  <td className="px-3.5 py-3 text-right font-mono text-slate-600 dark:text-slate-400">{c.served_portions}</td>
                  <td className="px-3.5 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">{c.available_portions}</td>
                  <td className="px-3.5 py-3 text-right font-mono font-medium text-amber-700 dark:text-amber-400">
                    {c.burn_rate_plates_per_min} pl/min
                  </td>
                  <td className="px-3.5 py-3 text-center font-mono font-medium">
                    {c.depletion_projected_minutes !== null ? (
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                        c.depletion_projected_minutes < 25
                          ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                          : 'bg-amber-100/70 dark:bg-slate-800 text-amber-900 dark:text-amber-300'
                      }`}>
                        ~{c.depletion_projected_minutes} mins
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 font-sans">Stable</span>
                    )}
                  </td>
                  <td className="px-3.5 py-3 text-center font-mono">
                    <span
                      className={`px-3 py-0.5 rounded-full font-bold text-[11px] ${
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
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </span>
              <h3 className="heading-card">
                {t.radar.fssaiTitle}
              </h3>
            </div>
            <p className="text-sub mt-1.5 max-w-2xl">
              {t.radar.fssaiSub}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowManifestForm(!showManifestForm)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-500 hover:to-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto shadow-sm"
          >
            <Leaf className="w-4 h-4 text-emerald-300" />
            <span>{showManifestForm ? t.radar.fssaiCloseBtn : t.radar.fssaiGenerateBtn}</span>
          </button>
        </div>

        {/* FSSAI Form */}
        {showManifestForm && (
          <form onSubmit={handleManifestSubmit} className="mt-6 tactical-subcard space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label htmlFor="fssai-surplus-kg" className="tactical-label">Surplus Quantity (kg)</label>
                <input
                  id="fssai-surplus-kg"
                  type="number"
                  step="0.5"
                  value={surplusKg}
                  onChange={(e) => setSurplusKg(Number(e.target.value))}
                  required
                  className="tactical-input font-mono"
                />
              </div>

              <div>
                <label htmlFor="fssai-hot-temp" className="tactical-label">
                  Hot Holding Temp (FSSAI &gt;= 63°C)
                </label>
                <input
                  id="fssai-hot-temp"
                  type="number"
                  step="0.5"
                  value={hotTemp}
                  onChange={(e) => setHotTemp(Number(e.target.value))}
                  required
                  className="tactical-input font-mono"
                />
              </div>

              <div>
                <label htmlFor="fssai-cold-temp" className="tactical-label">
                  Cold Holding Temp (FSSAI &lt;= 5°C)
                </label>
                <input
                  id="fssai-cold-temp"
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
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-[0.99]"
              >
                <Truck className="w-4 h-4" />
                <span>{t.radar.fssaiIssueBtn}</span>
              </button>
            </div>
          </form>
        )}

        {/* Active Generated Manifest Certificate */}
        {radar.fssai_manifest && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800/60 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wide font-mono">
                  Official FSSAI Chain-of-Custody Manifest: {radar.fssai_manifest.manifest_id}
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold font-mono ${
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
