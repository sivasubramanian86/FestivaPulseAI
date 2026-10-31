/**
 * @file GenAIXRayDrawer.tsx
 * @description Dockable GenAI X-Ray Telemetry Inspector Component.
 * Surfaces transparent model prompts, token consumption, latency breakdowns, and
 * raw response payloads for Vertex AI Gemini 2.5 Flash and Google ADK swarm consensus.
 *
 * @module components/GenAIXRayDrawer
 * @version 2.0.0
 */

import React from 'react';
import { Eye, X, Terminal, Clock, Cpu, CheckCircle2, ShieldCheck } from 'lucide-react';
import { GenAITelemetryTrace } from '../types';

interface GenAIXRayDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: GenAITelemetryTrace | null;
}

export const GenAIXRayDrawer: React.FC<GenAIXRayDrawerProps> = ({ isOpen, onClose, telemetry }) => {
  if (!isOpen) return null;

  return (
    <aside
      aria-label="Live GenAI Telemetry Inspector Drawer"
      className="fixed inset-y-0 right-0 w-full sm:w-[480px] md:w-[540px] bg-slate-950 text-slate-100 z-50 shadow-2xl flex flex-col border-l border-slate-800 animate-in slide-in-from-right duration-300"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Judge Mode: Live GenAI X-Ray
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% DYNAMIC
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Verifiable prompt-to-response telemetry stream</p>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close Inspector Drawer"
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono">
        {telemetry ? (
          <>
            {/* Status Telemetry Bar */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px]">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-slate-400">Agent:</span>
                <span className="font-bold text-slate-200 truncate">{telemetry.active_agent}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">Latency:</span>
                <span className="font-bold text-emerald-400">{telemetry.latency_ms} ms</span>
              </div>
            </div>

            {/* Purpose */}
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block mb-1">
                Intent & Purpose:
              </span>
              <p className="text-slate-300 text-[11px]">{telemetry.purpose}</p>
            </div>

            {/* Live Prompt In */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                  <Terminal className="w-3 h-3" />
                  Exact Outgoing Prompt Sent to Gemini:
                </span>
                <span className="text-[10px] text-slate-500">~{telemetry.token_usage_estimated} tokens</span>
              </div>
              <pre className="p-3 rounded-xl bg-slate-900 text-slate-300 text-[11px] leading-relaxed overflow-x-auto border border-slate-800 whitespace-pre-wrap max-h-56">
                {telemetry.raw_prompt_sent}
              </pre>
            </div>

            {/* Structured JSON Out */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Incoming Structured JSON Schema Output:
              </span>
              <pre className="p-3 rounded-xl bg-slate-900 text-emerald-300 text-[11px] leading-relaxed overflow-x-auto border border-slate-800 max-h-64">
                {JSON.stringify(telemetry.structured_json_response, null, 2)}
              </pre>
            </div>

            {/* Verification Proof Badge */}
            <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-800/50 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <p className="text-[11px] text-teal-200">
                <span className="font-bold">Dynamic Generation Proof: </span>
                {telemetry.dynamic_diff_summary}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No telemetry trace recorded yet. Trigger an action in Blueprint or Rescue Studio to inspect live prompt streaming.</p>
          </div>
        )}
      </div>
    </aside>
  );
};
