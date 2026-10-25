import React from 'react';
import { History, CheckCircle2, Clock } from 'lucide-react';
import { DecisionLedgerEntry } from '../types';

interface DecisionLedgerProps {
  entries: DecisionLedgerEntry[];
}

export const DecisionLedger: React.FC<DecisionLedgerProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-festiva-border shadow-sm text-center">
        <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">Decision Ledger Empty</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Every time a host or event coordinator approves a recovery proposal in Rescue Studio,
          an immutable, audit-ready record is permanently stamped here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-festiva-border shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-900">
                <History className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">Immutable Operational Decision Ledger</h2>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Append-only audit trail recording every state mutation, mathematical proof, and explicit human approval.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
            {entries.length} Certified Entries
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {entries.map((entry, idx) => (
            <div
              key={entry.entry_id || idx}
              className="p-5 rounded-xl bg-[#FAF8F5] border border-festiva-border hover:border-indigo-300 transition-colors space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#1E1B4B] text-white">
                    Version v{entry.plan_version}.0
                  </span>
                  <span className="text-xs font-bold text-slate-900">{entry.what_changed}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Human Approved
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Reason for Change:</span>
                  <p className="font-medium text-slate-800">{entry.why_it_changed}</p>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Deterministic Calculation Proof:</span>
                  <p className="font-mono text-[11px] text-indigo-900 font-semibold bg-white p-2 rounded border border-slate-200">
                    {entry.calculations_executed}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-white/70 p-2.5 rounded-lg border border-slate-200/80">
                <span className="font-bold text-slate-700">Gemini Synthesis: </span>
                <span>{entry.gemini_recommendation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
