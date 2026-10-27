import React from 'react';
import { History, CheckCircle2, Clock } from 'lucide-react';
import { DecisionLedgerEntry } from '../types';

interface DecisionLedgerProps {
  entries: DecisionLedgerEntry[];
}

export const DecisionLedger: React.FC<DecisionLedgerProps> = ({ entries }) => {

  if (entries.length === 0) {
    return (
      <div className="tactical-card text-center py-12">
        <History className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h3 className="heading-card">Decision Ledger Empty</h3>
        <p className="text-sub mt-1 max-w-md mx-auto">
          Every time a host or event coordinator approves a recovery proposal in Rescue Studio,
          an immutable, audit-ready record is permanently stamped here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="tactical-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-900 dark:text-cyan-300">
                <History className="w-4 h-4" />
              </span>
              <h2 className="heading-card">Immutable Operational Decision Ledger</h2>
            </div>
            <p className="text-sub mt-1">
              Append-only audit trail recording every state mutation, mathematical proof, and explicit human approval.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-cyan-50 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 self-start sm:self-auto">
            {entries.length} Certified Entries
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {entries.map((entry, idx) => (
            <div
              key={entry.entry_id || idx}
              className="tactical-subcard hover:border-cyan-400 dark:hover:border-cyan-500 transition-colors space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-tactical-darkBorder pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-slate-900 dark:bg-cyan-950 text-white dark:text-cyan-300 border border-transparent dark:border-cyan-800">
                    Version v{entry.plan_version}.0
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{entry.what_changed}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Human Approved
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Reason for Change:</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{entry.why_it_changed}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Deterministic Calculation Proof:</span>
                  <p className="font-mono text-[11px] text-cyan-900 dark:text-cyan-300 font-semibold bg-white dark:bg-tactical-darkSurface p-2 rounded border border-slate-200 dark:border-tactical-darkBorder">
                    {entry.calculations_executed}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-tactical-darkSurface/60 p-2.5 rounded-lg border border-slate-200/80 dark:border-tactical-darkBorder">
                <span className="font-bold text-slate-700 dark:text-slate-300">Gemini Synthesis: </span>
                <span>{entry.gemini_recommendation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
