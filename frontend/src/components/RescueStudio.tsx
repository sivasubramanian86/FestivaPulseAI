import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Check,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import { RescueStudioComparison, RecoveryProposal } from '../types';
import { useTranslation } from '../i18n';

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
  const { t } = useTranslation();
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const approvalReason = 'Selected optimal balance of cost and guest comfort';

  if (!comparison) {
    return (
      <div className="tactical-card text-center py-16">
        <Sparkles className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="heading-card">{t.rescue.readyTitle}</h2>
        <p className="text-sub mt-2 max-w-lg mx-auto">
          {t.rescue.readySub}
        </p>

        <div className="flex flex-wrap justify-center gap-3.5 mt-8">
          <button
            type="button"
            onClick={() =>
              onTriggerTestIncident('Food Shortage', {
                shortage_count: 40,
                category: 'General Vegetarian',
              })
            }
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all active:scale-[0.99]"
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
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all active:scale-[0.99]"
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
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-rose-900 hover:from-red-600 hover:to-rose-800 text-white text-xs font-bold shadow-md shadow-red-500/20 transition-all active:scale-[0.99]"
            title="Test HSE Fire Overcrowding Rejection Gate"
          >
            Test Overcrowding Breach (420 Guests)
          </button>
        </div>
      </div>
    );
  }

  const candidates: { prop: RecoveryProposal; tag: string; borderClass: string; badge: string }[] = [
    {
      prop: comparison.candidate_lowest_cost,
      tag: 'Candidate A',
      borderClass: 'border-emerald-300 dark:border-emerald-700/60',
      badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300',
    },
    {
      prop: comparison.candidate_best_experience,
      tag: 'Candidate B',
      borderClass: 'border-amber-300 dark:border-amber-700/60',
      badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300',
    },
    {
      prop: comparison.candidate_lowest_disruption,
      tag: 'Candidate C',
      borderClass: 'border-indigo-300 dark:border-indigo-700/60',
      badge: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300',
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
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </span>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span>Live Incident Triage</span>
                <span>•</span>
                <span>{t.rescue.incidentDetected}</span>
              </span>
              <h2 className="heading-card">{comparison.incident_summary}</h2>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2.5 bg-amber-50/80 dark:bg-[#1D1630] p-3.5 rounded-xl border border-amber-200 dark:border-[#352952]">
              <span className="font-semibold text-amber-900 dark:text-amber-300">System Advisory:</span> {comparison.system_advisory}
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
              className="px-3.5 py-2 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 border border-red-300 dark:border-red-800 text-xs font-semibold transition-colors"
              title="Test HSE Fire Overcrowding Rejection Gate"
            >
              Test HSE Fire Refusal
            </button>
          </div>
        </div>
      </div>

      {/* 3-Way Comparative Proposals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {candidates.map(({ prop, tag, borderClass, badge }) => (
          <div
            key={prop.proposal_id}
            className={`rounded-2xl p-6 border-2 transition-all flex flex-col justify-between shadow-sm bg-white/90 dark:bg-[#140F22]/90 ${
              selectedProposalId === prop.proposal_id ? 'border-amber-500 ring-2 ring-amber-400 dark:ring-amber-500' : borderClass
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">{tag}</span>
                <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${badge}`}>
                  {prop.strategy_type}
                </span>
              </div>

              <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100 mb-2">{prop.summary}</h3>

              {/* Action Items */}
              <div className="space-y-2 my-4">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                  Action Steps:
                </span>
                {prop.action_items.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>

              {/* Metrics Breakdown */}
              <div className="grid grid-cols-2 gap-2.5 my-4 p-3.5 rounded-xl bg-[#FDFBF7] dark:bg-[#1D1630] text-xs border border-[#EFE8DD] dark:border-[#352952] font-mono">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-sans">{t.rescue.costImpact}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {prop.additional_cost > 0 ? `+₹${prop.additional_cost.toLocaleString()}` : '₹0 (Absorbed)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-sans">{t.rescue.timelineImpact}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {prop.timeline_impact_minutes > 0 ? `+${prop.timeline_impact_minutes} mins` : '0 mins'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-sans">{t.rescue.guestsCovered}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{prop.guests_covered} Guests</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-sans">{t.rescue.feasibility}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Feasible</span>
                </div>
              </div>

              {/* Approvals Needed */}
              {prop.actions_requiring_human_approval.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 mb-4">
                  <span className="font-bold block">{t.rescue.humanApprovalNeeded}</span>
                  <span>{prop.actions_requiring_human_approval.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Approval Action */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleApprove(prop.proposal_id)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-rose-700 hover:from-amber-500 hover:to-rose-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.99]"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>{t.rescue.approveButton}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Rejected / "NOT FEASIBLE" Proposals Section */}
      {comparison.rejected_proposals.length > 0 && (
        <div className="bg-red-50/70 dark:bg-red-950/20 rounded-2xl p-6 border-2 border-red-300 dark:border-red-900 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="text-sm font-bold text-red-900 dark:text-red-200 uppercase tracking-wide">
              {t.rescue.systemRefusal} ({comparison.rejected_proposals.length})
            </h3>
          </div>
          <p className="text-xs text-red-800 dark:text-red-300">
            {t.rescue.refusalSub}
          </p>

          <div className="space-y-3">
            {comparison.rejected_proposals.map((rej, i) => (
              <div key={i} className="p-4 rounded-xl bg-white dark:bg-[#1D1630] border border-red-200 dark:border-red-800/60 text-xs text-red-900 dark:text-red-200 space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{rej.summary}</span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-red-600 text-white font-mono">
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
