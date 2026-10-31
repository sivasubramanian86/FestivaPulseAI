/**
 * @file DecisionLedger.tsx
 * @description Immutable Audit Ledger & Version History Component.
 * Visualizes cryptographic or sequential audit records of every plan update, approved proposal,
 * version bump, and coordinator sign-off for enterprise compliance and post-event post-mortems.
 *
 * @module components/DecisionLedger
 * @version 2.0.0
 */

import React from 'react';
import { History, CheckCircle2, Clock, Award } from 'lucide-react';
import { DecisionLedgerEntry } from '../types';
import { useTranslation } from '../i18n';

/**
 * Properties for the DecisionLedger audit component.
 */
interface DecisionLedgerProps {
  /** Array of chronological decision and proposal approval records */
  entries: DecisionLedgerEntry[];
}

/**
 * DecisionLedger - Immutable compliance timeline and audit trail viewer.
 */
export const DecisionLedger: React.FC<DecisionLedgerProps> = ({ entries }) => {
  const { t } = useTranslation();

  if (entries.length === 0) {
    return (
      <div className="tactical-card text-center py-16">
        <History className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="heading-card">{t.ledger.emptyTitle}</h3>
        <p className="text-sub mt-2 max-w-md mx-auto">
          {t.ledger.emptySub}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="tactical-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </span>
              <h2 className="heading-card">{t.ledger.title}</h2>
            </div>
            <p className="text-sub mt-1.5 max-w-2xl">
              {t.ledger.subtitle}
            </p>
          </div>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold font-mono bg-amber-100/80 dark:bg-[#1D1630] text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 self-start sm:self-auto shadow-sm">
            {entries.length} {t.ledger.certifiedEntries}
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {entries.map((entry, idx) => (
            <div
              key={entry.entry_id || idx}
              className="tactical-subcard hover:border-amber-400 dark:hover:border-amber-500/60 transition-all space-y-3.5 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#EFE8DD] dark:border-[#352952] pb-2.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold font-mono bg-slate-900 dark:bg-amber-950 text-white dark:text-amber-300 border border-transparent dark:border-amber-800/60">
                    Version v{entry.plan_version}.0
                  </span>
                  <span className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">{entry.what_changed}</span>
                </div>
                <div className="flex items-center gap-3.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Human Approved
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">{t.ledger.reasonForChange}</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{entry.why_it_changed}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">{t.ledger.proofTitle}</span>
                  <p className="font-mono text-[11px] text-amber-900 dark:text-amber-300 font-semibold bg-white dark:bg-[#140F22] p-2.5 rounded-lg border border-[#E8DFD1] dark:border-[#352952] mt-0.5">
                    {entry.calculations_executed}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-[#140F22]/70 p-3 rounded-xl border border-[#E8DFD1] dark:border-[#352952]">
                <span className="font-bold text-amber-900 dark:text-amber-400">{t.ledger.geminiSynthesis}</span>
                <span>{entry.gemini_recommendation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
