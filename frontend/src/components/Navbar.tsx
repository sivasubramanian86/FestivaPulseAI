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
import { useTranslation } from '../i18n/I18nContext';
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
    <header className="sticky top-0 z-40 transition-colors duration-200 bg-white/90 dark:bg-tactical-darkSurface/90 backdrop-blur-md text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-tactical-darkBorder shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Operational Beacon */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-tactical-cyan to-tactical-emerald flex items-center justify-center shadow-lg shadow-tactical-cyan/20">
              <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-cyan-500 to-emerald-400 bg-clip-text text-transparent">
                  FestivaPulseAI
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  GCP RUN READY
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {t.nav.brandSubtitle}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            <button
              onClick={() => setActiveTab('blueprint')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'blueprint'
                  ? 'bg-slate-100 dark:bg-tactical-darkCard text-cyan-600 dark:text-tactical-cyan border border-slate-300 dark:border-tactical-cyan/40 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              {t.nav.blueprintTab}
            </button>
            <button
              onClick={() => setActiveTab('pulse')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'pulse'
                  ? 'bg-slate-100 dark:bg-tactical-darkCard text-emerald-600 dark:text-tactical-emerald border border-slate-300 dark:border-tactical-emerald/40 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              {t.nav.pulseTab}
            </button>
            <button
              onClick={() => setActiveTab('rescue')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'rescue'
                  ? 'bg-slate-100 dark:bg-tactical-darkCard text-amber-600 dark:text-tactical-amber border border-slate-300 dark:border-tactical-amber/40 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              {t.nav.rescueTab}
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'ledger'
                  ? 'bg-slate-100 dark:bg-tactical-darkCard text-cyan-600 dark:text-tactical-cyan border border-slate-300 dark:border-tactical-cyan/40 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <ScrollText className="w-3.5 h-3.5" />
              {t.nav.ledgerTab}
            </button>
            <button
              onClick={() => setActiveTab('scenario')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'scenario'
                  ? 'bg-slate-100 dark:bg-tactical-darkCard text-purple-600 dark:text-purple-400 border border-slate-300 dark:border-purple-500/40 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-purple-500 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
              {t.nav.scenarioTab}
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Color Theme"
              className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-tactical-darkCard border border-slate-200 dark:border-tactical-darkBorder transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Tactical Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Language Selector */}
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                aria-label="Select Language"
                className="pl-7 pr-2 py-1 text-xs bg-slate-50 dark:bg-tactical-darkCard border border-slate-200 dark:border-tactical-darkBorder text-slate-700 dark:text-slate-200 rounded-md focus:ring-1 focus:ring-tactical-cyan cursor-pointer transition-colors"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* In-App QA Test Runner Modal Trigger */}
            <button
              onClick={onOpenQAModal}
              className="px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-colors"
              title="Run Automated QA Verification Suite"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Run QA (100%)</span>
            </button>

            {/* GenAI X-Ray Split-Pane Toggle */}
            <button
              onClick={() => setXrayOpen(!xrayOpen)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                xrayOpen
                  ? 'bg-tactical-cyan text-slate-950 border-tactical-cyan shadow-sm font-bold'
                  : 'bg-slate-100 dark:bg-tactical-darkCard text-slate-700 dark:text-slate-300 border-slate-200 dark:border-tactical-darkBorder hover:border-tactical-cyan'
              }`}
              title="Toggle Live GenAI Telemetry X-Ray Drawer"
            >
              <Eye className="w-3.5 h-3.5 text-tactical-cyan" />
              <span className="hidden sm:inline">Telemetry X-Ray</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
