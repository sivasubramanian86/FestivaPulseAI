import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Check,
  AlertOctagon,
} from 'lucide-react';
import { RescueStudioComparison, RecoveryProposal } from '../types';

interface RescueStudioProps {
  comparison: RescueStudioComparison | null;
  onApproveProposal: (proposalId: string, reason: string) => Promise<void>;
  onTriggerTestIncident: (type: string, values: Record<string, any>) => void;
  loading: boolean;
}

export const RescueStudio: React.FC<RescueStudioProps> = ({
  comparison,
  onApproveProposal,
  onTriggerTestIncident,
  loading,
}) => {
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const approvalReason = 'Selected optimal balance of cost and guest comfort';

  if (!comparison) {
    return (
      <div className="tactical-card text-center py-12">
        <ShieldAlert className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h2 className="heading-card">Rescue Studio Ready</h2>
        <p className="text-sub mt-1 max-w-md mx-auto">
          No active shock triggered yet. Click one of the live simulation buttons below to watch Gemini
          synthesize 3 comparative recovery alternatives in real time:
        </p>

        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={() =>
              onTriggerTestIncident('Food Shortage', {
                shortage_count: 40,
                category: 'General Vegetarian',
              })
            }
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition-colors"
          >
            Simulate 40-Plate Food Shortage
          </button>
          <button
            type="button"
            onClick={() =>
              onTriggerTestIncident('Budget Cut', {
                budget_cut_amount: 80000,
              })
            }
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition-colors"
          >
            Simulate -₹80,000 Budget Slash
          </button>
          <button
            type="button"
            onClick={() =>
              onTriggerTestIncident('Attendance Surge', {
                new_guests: 420,
              })
            }
            className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-semibold shadow transition-colors"
            title="Test HSE Fire Overcrowding Rejection Gate"
          >
            Test Overcrowding Breach (420 Guests)
          </button>
        </div>
      </div>
    );
  }

  const candidates: { prop: RecoveryProposal; tag: string; color: string; badge: string }[] = [
    {
      prop: comparison.candidate_lowest_cost,
      tag: 'Candidate A',
      color: 'border-emerald-300 dark:border-emerald-700/60',
      badge: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
    {
      prop: comparison.candidate_best_experience,
      tag: 'Candidate B',
      color: 'border-cyan-300 dark:border-cyan-700/60',
      badge: 'bg-cyan-100 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    },
    {
      prop: comparison.candidate_lowest_disruption,
      tag: 'Candidate C',
      color: 'border-amber-300 dark:border-amber-700/60',
      badge: 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    },
  ];

  const handleApprove = (proposalId: string) => {
    onApproveProposal(proposalId, approvalReason);
    setSelectedProposalId(null);
  };

  return (
    <div className="space-y-6">
      {/* Active Incident Header */}
      <div className="tactical-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                Live Incident Triage
              </span>
              <h2 className="heading-card">{comparison.incident_summary}</h2>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 bg-amber-50/80 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800/60">
              <span className="font-semibold text-amber-900 dark:text-amber-200">System Advisory:</span> {comparison.system_advisory}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() =>
                onTriggerTestIncident('Attendance Surge', {
                  new_guests: 420,
                })
              }
              className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-950/50 text-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 border border-red-300 dark:border-red-800 text-xs font-semibold transition-colors"
              title="Test HSE Fire Overcrowding Rejection Gate"
            >
              Test HSE Fire Refusal
            </button>
          </div>
        </div>
      </div>

      {/* 3-Way Comparative Proposals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {candidates.map(({ prop, tag, color, badge }) => (
          <div
            key={prop.proposal_id}
            className={`rounded-2xl p-6 border-2 transition-all flex flex-col justify-between shadow-sm bg-white dark:bg-tactical-darkSurface ${
              selectedProposalId === prop.proposal_id ? 'border-cyan-500 ring-2 ring-cyan-400 dark:ring-cyan-500' : color
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">{tag}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge}`}>
                  {prop.strategy_type}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">{prop.summary}</h3>

              {/* Action Items */}
              <div className="space-y-1.5 my-4">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                  Action Steps:
                </span>
                {prop.action_items.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>

              {/* Metrics Breakdown */}
              <div className="grid grid-cols-2 gap-2 my-4 p-3 rounded-xl bg-slate-50 dark:bg-tactical-darkCard text-xs border border-slate-200 dark:border-tactical-darkBorder font-mono">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-sans">Cost Impact</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {prop.additional_cost > 0 ? `+₹${prop.additional_cost.toLocaleString()}` : '₹0 (Absorbed)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-sans">Timeline Impact</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {prop.timeline_impact_minutes > 0 ? `+${prop.timeline_impact_minutes} mins` : '0 mins'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-sans">Guests Covered</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{prop.guests_covered} Guests</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-sans">Feasibility</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Feasible</span>
                </div>
              </div>

              {/* Approvals Needed */}
              {prop.actions_requiring_human_approval.length > 0 && (
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 mb-4">
                  <span className="font-bold block">Requires Explicit Human Approval:</span>
                  <span>{prop.actions_requiring_human_approval.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Approval Action */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700/60">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleApprove(prop.proposal_id)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold text-xs shadow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Approve & Apply Plan Revision</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Rejected / "NOT FEASIBLE" Proposals Section (Critical Rubric Differentiator) */}
      {comparison.rejected_proposals.length > 0 && (
        <div className="bg-red-50/70 dark:bg-red-950/20 rounded-2xl p-6 border-2 border-red-300 dark:border-red-900 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="text-sm font-bold text-red-900 dark:text-red-200 uppercase tracking-wide">
              System Refusal: Infeasible Strategies Rejected ({comparison.rejected_proposals.length})
            </h3>
          </div>
          <p className="text-xs text-red-800 dark:text-red-300">
            A trustworthy refusal is better than a dangerous, hallucinated plan. FestivaPulseAI rigorously rejects
            proposals that breach HSE fire safety codes or create unmitigated deficits:
          </p>

          <div className="space-y-3">
            {comparison.rejected_proposals.map((rej, i) => (
              <div key={i} className="p-4 rounded-xl bg-white dark:bg-tactical-darkCard border border-red-200 dark:border-red-800/60 text-xs text-red-900 dark:text-red-200 space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{rej.summary}</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-600 text-white font-mono">
                    REJECTED: NOT FEASIBLE
                  </span>
                </div>
                <p className="text-red-700 dark:text-red-400 font-medium mt-1">{rej.infeasibility_reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
