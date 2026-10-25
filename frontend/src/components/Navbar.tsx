import React from 'react';
import { Sparkles, Activity, ShieldCheck, PlayCircle, Eye, Globe } from 'lucide-react';

interface NavbarProps {
  activeTab: 'blueprint' | 'pulse' | 'rescue' | 'ledger' | 'scenario';
  setActiveTab: (tab: 'blueprint' | 'pulse' | 'rescue' | 'ledger' | 'scenario') => void;
  xrayOpen: boolean;
  setXrayOpen: (open: boolean) => void;
  onOpenQAModal: () => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  xrayOpen,
  setXrayOpen,
  onOpenQAModal,
  selectedLanguage,
  setSelectedLanguage,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#1E1B4B] text-white border-b border-indigo-950 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">FestivaPulseAI</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Day-of-Event OS
                </span>
              </div>
              <p className="text-xs text-indigo-200 hidden sm:block">Plan the celebration. Adapt when reality changes.</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            <button
              onClick={() => setActiveTab('blueprint')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'blueprint'
                  ? 'bg-indigo-800 text-white shadow-inner'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-900/50'
              }`}
            >
              1. Blueprint
            </button>
            <button
              onClick={() => setActiveTab('pulse')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'pulse'
                  ? 'bg-indigo-800 text-white shadow-inner'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-900/50'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              2. Event Pulse
            </button>
            <button
              onClick={() => setActiveTab('rescue')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'rescue'
                  ? 'bg-indigo-800 text-white shadow-inner'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-900/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              3. Rescue Studio
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'ledger'
                  ? 'bg-indigo-800 text-white shadow-inner'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-900/50'
              }`}
            >
              Decision Ledger
            </button>
            <button
              onClick={() => setActiveTab('scenario')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'scenario'
                  ? 'bg-indigo-800 text-white shadow-inner'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-900/50'
              }`}
            >
              Scenario Lab
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative flex items-center">
              <Globe className="w-4 h-4 text-indigo-300 absolute left-2 pointer-events-none" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                aria-label="Select Indian Language"
                className="pl-8 pr-2 py-1 text-xs bg-indigo-900/70 border border-indigo-700 text-indigo-100 rounded-lg focus:ring-1 focus:ring-teal-400 cursor-pointer"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* In-App QA Test Runner Modal Trigger */}
            <button
              onClick={onOpenQAModal}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-colors"
              title="Run Automated QA Verification Suite"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Run QA Tests (100%)</span>
            </button>

            {/* GenAI X-Ray Split-Pane Toggle */}
            <button
              onClick={() => setXrayOpen(!xrayOpen)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                xrayOpen
                  ? 'bg-teal-500 text-white border-teal-400 shadow-md'
                  : 'bg-indigo-900/80 text-indigo-200 border-indigo-700 hover:text-white'
              }`}
              title="Toggle Live GenAI Telemetry X-Ray Drawer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Judge X-Ray</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
