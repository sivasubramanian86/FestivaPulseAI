import React from 'react';
import {
  Sparkles,
  Activity,
  ShieldCheck,
  PlayCircle,
  Eye,
  Globe,
  Sun,
  Moon,
  ScrollText,
  FlaskConical,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { SupportedLanguage } from '../i18n/types';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  activeTab: 'blueprint' | 'pulse' | 'rescue' | 'ledger' | 'scenario';
  setActiveTab: (tab: 'blueprint' | 'pulse' | 'rescue' | 'ledger' | 'scenario') => void;
  xrayOpen: boolean;
  setXrayOpen: (open: boolean) => void;
  onOpenQAModal: () => void;
}

const LANGUAGES: { code: SupportedLanguage; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'es', name: 'Español' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  xrayOpen,
  setXrayOpen,
  onOpenQAModal,
}) => {
  const { language, setLanguage, t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 transition-colors duration-300 bg-white/85 dark:bg-[#140F22]/90 backdrop-blur-md text-slate-800 dark:text-slate-100 border-b border-[#E8DFD1] dark:border-[#352952] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Auspicious Beacon */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] via-[#F59E0B] to-[#E11D48] flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-amber-700 via-rose-700 to-amber-600 dark:from-[#F5E6CA] dark:via-[#FBBF24] dark:to-[#E11D48] bg-clip-text text-transparent">
                  FestivaPulseAI
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  GCP RUN READY
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 hidden sm:block">
                {t.nav.brandSubtitle}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            <button
              onClick={() => setActiveTab('blueprint')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'blueprint'
                  ? 'bg-amber-100/80 dark:bg-[#1D1630] text-amber-900 dark:text-[#FBBF24] border border-amber-300/80 dark:border-amber-500/40 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50/50 dark:hover:bg-[#1D1630]/50'
              }`}
            >
              {t.nav.blueprintTab}
            </button>
            <button
              onClick={() => setActiveTab('pulse')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'pulse'
                  ? 'bg-emerald-100/80 dark:bg-[#1D1630] text-emerald-900 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-500/40 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-[#1D1630]/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {t.nav.pulseTab}
            </button>
            <button
              onClick={() => setActiveTab('rescue')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'rescue'
                  ? 'bg-rose-100/80 dark:bg-[#1D1630] text-rose-900 dark:text-rose-300 border border-rose-300/80 dark:border-rose-500/40 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50/50 dark:hover:bg-[#1D1630]/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              {t.nav.rescueTab}
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'ledger'
                  ? 'bg-indigo-100/80 dark:bg-[#1D1630] text-indigo-900 dark:text-indigo-300 border border-indigo-300/80 dark:border-indigo-500/40 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-[#1D1630]/50'
              }`}
            >
              <ScrollText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              {t.nav.ledgerTab}
            </button>
            <button
              onClick={() => setActiveTab('scenario')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'scenario'
                  ? 'bg-purple-100/80 dark:bg-[#1D1630] text-purple-900 dark:text-purple-300 border border-purple-300/80 dark:border-purple-500/40 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50/50 dark:hover:bg-[#1D1630]/50'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              {t.nav.scenarioTab}
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Color Theme"
              className="p-2 rounded-xl text-slate-700 dark:text-[#E8DFD1] hover:bg-amber-100/50 dark:hover:bg-[#1D1630] border border-[#E8DFD1] dark:border-[#352952] transition-colors"
              title={theme === 'dark' ? 'Switch to Ivory Silk Mode' : 'Switch to Midnight Velvet Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Language Selector */}
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 absolute left-2.5 pointer-events-none" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                aria-label="Select Language"
                className="pl-8 pr-2.5 py-1.5 text-xs bg-white/90 dark:bg-[#1D1630] border border-[#E8DFD1] dark:border-[#352952] text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-[#D4AF37] cursor-pointer transition-colors font-medium shadow-sm"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-white dark:bg-[#140F22] text-slate-900 dark:text-slate-100">
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* In-App QA Test Runner Modal Trigger */}
            <button
              onClick={onOpenQAModal}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              title="Run Automated QA Verification Suite"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Run QA (100%)</span>
            </button>

            {/* GenAI X-Ray Split-Pane Toggle */}
            <button
              onClick={() => setXrayOpen(!xrayOpen)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                xrayOpen
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-slate-950 border-amber-400 shadow-sm font-bold'
                  : 'bg-white/80 dark:bg-[#1D1630] text-slate-700 dark:text-slate-200 border-[#E8DFD1] dark:border-[#352952] hover:border-[#D4AF37]'
              }`}
              title="Toggle Live GenAI Telemetry X-Ray Drawer"
            >
              <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Telemetry X-Ray</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
