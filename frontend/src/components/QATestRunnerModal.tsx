import React, { useState } from 'react';
import { PlayCircle, CheckCircle2, X, ShieldCheck, Clock, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { QATestSuiteResponse } from '../types';

interface QATestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QATestRunnerModal: React.FC<QATestRunnerModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [suiteResult, setSuiteResult] = useState<QATestSuiteResponse | null>(null);

  if (!isOpen) return null;

  const handleRunTests = async () => {
    setLoading(true);
    try {
      const data = await api.runQATestSuite();
      setSuiteResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qa-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-tactical-darkSurface rounded-2xl w-full max-w-2xl border border-slate-200 dark:border-tactical-darkBorder shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-tactical-darkBorder flex items-center justify-between bg-slate-50 dark:bg-tactical-darkCard">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="qa-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                Automated Domain Invariant & Edge-Case Test Runner
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live evaluation evidence verifying zero fake arithmetic</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Test Modal"
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Click below to execute all deterministic assertions programmatically across budget reconciliation,
              FSSAI compliance, HSE capacity limits, and timeline DAG shifts:
            </p>
            <button
              onClick={handleRunTests}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow flex items-center gap-1.5 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing Tests...</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Run All Test Cases</span>
                </>
              )}
            </button>
          </div>

          {suiteResult && (
            <div className="space-y-4 mt-4 animate-in fade-in duration-300">
              {/* Pass Summary Bar */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  suiteResult.all_passed
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                    : 'bg-red-50/80 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-950 dark:text-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-bold font-mono">
                    {suiteResult.all_passed
                      ? `100% PASS RATE (${suiteResult.passed_tests}/${suiteResult.total_tests} Tests Passed)`
                      : `${suiteResult.failed_tests} Tests Failed`}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {suiteResult.total_duration_ms} ms
                </span>
              </div>

              {/* Individual Test Cards */}
              <div className="space-y-2">
                {suiteResult.results.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-tactical-darkBorder bg-slate-50 dark:bg-tactical-darkCard flex items-start justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{t.id}: {t.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {t.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-mono">{t.assertion}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 font-mono">
                      <span className="text-[11px] text-slate-400">{t.duration_ms}ms</span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          t.status === 'PASS'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-tactical-darkBorder bg-slate-50 dark:bg-tactical-darkCard flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
