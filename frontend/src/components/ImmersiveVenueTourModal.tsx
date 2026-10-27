import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Compass,
  Sparkles,
  MapPin,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Flame,
  CheckCircle2,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface ImmersiveVenueTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQAModal?: () => void;
}

type TourTab = 'digital_twin' | 'transformation' | 'sensory_4dx' | 'guided_walkthrough';
type LightingMode = 'daylight' | 'candlelight' | 'sangeet';

interface VenueZone {
  id: string;
  name: string;
  category: string;
  xPct: number;
  yPct: number;
  description: string;
  capacity: string;
  ambience: string;
  protocols: string[];
}

const VENUE_ZONES: VenueZone[] = [
  {
    id: 'mandap',
    name: 'Mandap Sanctum (Auspicious Dais)',
    category: 'Vedic Ceremonial',
    xPct: 62,
    yPct: 32,
    description: 'Elevated 4-pillar golden mandap with marigold garlands, fragrant jasmine drapes, and ceremonial agni kund fire safety perimeter.',
    capacity: '20 VIP family members on dais + 350 seated audience',
    ambience: 'Auspicious Rohini Nakshatra ritual lighting with soft shehnai acoustics',
    protocols: ['Wheelchair ramp on North Dais', 'Low-smoke organic samagri', 'Dedicated priest concierge'],
  },
  {
    id: 'dining',
    name: 'Grand Royal Banquet & Feast Pavilion',
    category: 'Culinary & FSSAI',
    xPct: 36,
    yPct: 54,
    description: '40/30/30 hot culinary batch cooking lines. Organic banana leaf service and live millet, chaat, and dessert stations.',
    capacity: '450 simultaneous dining covers + 60 staff buffer',
    ambience: 'Warm amber food warmers with chilled FSSAI surplus staging bay',
    protocols: ['FSSAI temperature probes active (Hot > 65°C, Cold < 5°C)', 'Feeding India refrigerated rescue van on 45m standby'],
  },
  {
    id: 'elders',
    name: 'Elders Zenana Sanctuary & Quiet Lounge',
    category: 'Intergenerational Wellbeing',
    xPct: 18,
    yPct: 46,
    description: 'Plush velvet recliner seating, low decibel acoustic barriers, direct wheelchair dais route, and sugar-free beverage station.',
    capacity: '60 elders + attendant escorts',
    ambience: 'Sound dampening curtains maintaining < 65 dB even during Baraat',
    protocols: ['Zero-step flush flooring', 'Emergency medical kit and automated BP monitor', 'Dedicated tea sommelier'],
  },
  {
    id: 'kids',
    name: 'Kids Joyland & Creative Activity Enclave',
    category: 'Family Recreation',
    xPct: 82,
    yPct: 44,
    description: 'Child-safe foam interlocking floor mats with traditional puppet theatre, board games, origami crafts, and child-safe snacks.',
    capacity: '40 children + 3 CPR-trained childcare supervisors',
    ambience: 'Playful fairy-light canopy with cartoon projections',
    protocols: ['RFID wristband entry/exit matching parents', 'Nut-free allergen segregated snack tray'],
  },
  {
    id: 'reception',
    name: 'Grand Entrance & Welcoming Canopy',
    category: 'Guest Circulation',
    xPct: 68,
    yPct: 62,
    description: 'Opulent floral gateway with rosewater misting arches, live shehnai and nadaswaram welcome troupe, and electronic RFID badges.',
    capacity: 'Peak throughput: 250 arrivals per 15 minutes',
    ambience: 'Sandalwood fragrance diffuser with cascading brass diyas',
    protocols: ['Automated gate check-in counter', 'Luggage and gifts security screening', 'Valet parking dispatch tracking'],
  },
];

export const ImmersiveVenueTourModal: React.FC<ImmersiveVenueTourModalProps> = ({
  isOpen,
  onClose,
  onOpenQAModal,
}) => {
  const [activeTab, setActiveTab] = useState<TourTab>('digital_twin');
  const [selectedZone, setSelectedZone] = useState<VenueZone>(VENUE_ZONES[0]);
  const [transformSlider, setTransformSlider] = useState<number>(75);
  const [lightingMode, setLightingMode] = useState<LightingMode>('candlelight');
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscNodesRef = useRef<OscillatorNode[]>([]);

  // Web Audio classical tambura / harmonic drone synthesizer (client-side, 0 dependencies)
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const startAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Indian classical Sa-Pa-Sa drone (C3: 130.81Hz, G3: 196.00Hz, C4: 261.63Hz)
      const frequencies = [130.81, 196.0, 261.63];
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.08, ctx.currentTime);
      masterGain.connect(ctx.destination);

      const oscillators: OscillatorNode[] = [];
      frequencies.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        oscillators.push(osc);
      });

      oscNodesRef.current = oscillators;
      setAudioPlaying(true);
    } catch (e) {
      console.warn('Web Audio synthesis not supported or blocked:', e);
    }
  };

  const stopAudio = () => {
    try {
      oscNodesRef.current.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {}
      });
      oscNodesRef.current = [];
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    } catch {}
    setAudioPlaying(false);
  };

  const toggleAudio = () => {
    if (audioPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-300"
    >
      <div className="bg-[#FAF7F2] dark:bg-[#140F22] rounded-3xl w-full max-w-5xl border-2 border-[#D4AF37]/50 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Royal Crest Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-amber-900/10 via-amber-500/10 to-rose-900/10 dark:from-[#1D1630] dark:via-[#261B40] dark:to-[#1D1630] border-b border-[#E8DFD1] dark:border-[#352952]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D4AF37] via-[#F59E0B] to-[#E11D48] flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
                <Compass className="w-6 h-6 text-slate-950 font-bold" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30">
                    4DX Immersive Venue Experience
                  </span>
                  <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Interactive Digital Twin
                  </span>
                </div>
                <h2 id="tour-modal-title" className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-[#FAF7F2] mt-0.5">
                  FestivaPulseAI — 3D/4DX Venue Transformation & Guided Tour
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {/* Classical Ambience Audio Toggle */}
              <button
                type="button"
                onClick={toggleAudio}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  audioPlaying
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-400 shadow-sm animate-pulse'
                    : 'bg-white dark:bg-[#1D1630] text-slate-700 dark:text-slate-300 border-[#E8DFD1] dark:border-[#352952] hover:border-amber-400'
                }`}
                title="Toggle Live Indian Classical Tambura Ambience"
              >
                {audioPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{audioPlaying ? 'Shehnai / Drone Active' : 'Play Ambient Sound'}</span>
              </button>

              <button
                onClick={onClose}
                aria-label="Close Tour Modal"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sub-Tabs Navigation */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('digital_twin')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                activeTab === 'digital_twin'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-slate-950 shadow-md font-bold'
                  : 'bg-white/80 dark:bg-[#1D1630] text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300 border border-[#E8DFD1] dark:border-[#352952]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>3D Digital Twin & Spatial Hotspots</span>
            </button>

            <button
              onClick={() => setActiveTab('transformation')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                activeTab === 'transformation'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-slate-950 shadow-md font-bold'
                  : 'bg-white/80 dark:bg-[#1D1630] text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300 border border-[#E8DFD1] dark:border-[#352952]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Bare Hall → Royal Transformation</span>
            </button>

            <button
              onClick={() => setActiveTab('sensory_4dx')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                activeTab === 'sensory_4dx'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-slate-950 shadow-md font-bold'
                  : 'bg-white/80 dark:bg-[#1D1630] text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300 border border-[#E8DFD1] dark:border-[#352952]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>4DX Sensory & Lighting Ambience</span>
            </button>

            <button
              onClick={() => setActiveTab('guided_walkthrough')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                activeTab === 'guided_walkthrough'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-slate-950 shadow-md font-bold'
                  : 'bg-white/80 dark:bg-[#1D1630] text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300 border border-[#E8DFD1] dark:border-[#352952]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>App Core Guided Walkthrough</span>
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 sm:p-6 max-h-[72vh] overflow-y-auto space-y-6">
          {/* TAB 1: 3D Digital Twin with Interactive Hotspots */}
          {activeTab === 'digital_twin' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Click on any interactive glowing zone pin below to inspect spatial geometry, capacity limits, and safety telemetry:
                </p>
                <span className="text-[11px] font-mono text-amber-800 dark:text-amber-300 font-bold bg-amber-100/60 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-300/40">
                  Active Zone: {selectedZone.name}
                </span>
              </div>

              {/* 3D Digital Twin Canvas Container */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-xl bg-slate-950 aspect-[16/9] group">
                <img
                  src="/assets/hall_transform_3d.jpg"
                  alt="3D Venue Transformation Model"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />

                {/* Ambient Holographic Overlay Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20 pointer-events-none" />

                {/* Hotspot Markers */}
                {VENUE_ZONES.map((zone) => {
                  const isSelected = selectedZone.id === zone.id;
                  return (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => setSelectedZone(zone)}
                      style={{ top: `${zone.yPct}%`, left: `${zone.xPct}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 group/pin z-20 transition-all ${
                        isSelected ? 'scale-125 ring-4 ring-[#D4AF37]' : 'scale-100 hover:scale-115'
                      }`}
                      title={zone.name}
                    >
                      <span className="relative flex h-8 w-8 items-center justify-center">
                        <span
                          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            isSelected ? 'bg-amber-400' : 'bg-rose-400'
                          }`}
                        />
                        <span
                          className={`relative inline-flex rounded-full h-6 w-6 items-center justify-center font-bold text-[10px] text-slate-950 shadow-md ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B]'
                              : 'bg-white/90 border border-slate-900'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </span>
                      </span>
                      <span className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-slate-900/90 text-amber-200 text-[10px] font-bold font-mono border border-amber-400/30 opacity-90 group-hover/pin:opacity-100">
                        {zone.category}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Zone Deep Inspector Card */}
              <div className="tactical-card border-amber-300 dark:border-amber-700/60 bg-white/95 dark:bg-[#1D1630]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DFD1] dark:border-[#352952]">
                  <div>
                    <span className="text-xs font-bold font-mono text-amber-800 dark:text-amber-300 uppercase tracking-widest">
                      {selectedZone.category}
                    </span>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                      {selectedZone.name}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                    {selectedZone.capacity}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 mt-3 leading-relaxed">
                  {selectedZone.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-3 border-t border-[#E8DFD1]/50 dark:border-[#352952]/50">
                  <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#140F22] border border-[#E8DFD1] dark:border-[#352952]">
                    <span className="text-[11px] font-bold font-mono uppercase text-slate-500 dark:text-slate-400 block mb-1">
                      Acoustic & Lighting Ambience
                    </span>
                    <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
                      {selectedZone.ambience}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#140F22] border border-[#E8DFD1] dark:border-[#352952]">
                    <span className="text-[11px] font-bold font-mono uppercase text-slate-500 dark:text-slate-400 block mb-1">
                      Verified Safety Protocols
                    </span>
                    <ul className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                      {selectedZone.protocols.map((prot, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                          <span>{prot}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Bare Hall vs Royal Transformation Comparison Slider */}
          {activeTab === 'transformation' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Drag the slider below to witness the automated spatial transformation from empty civic hall into an opulent royal wedding palace:
                </p>
                <span className="text-xs font-bold font-mono text-amber-900 dark:text-amber-300">
                  Transformation Progress: {transformSlider}%
                </span>
              </div>

              {/* Interactive Transformation Comparison View */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-2xl aspect-[16/9] select-none">
                {/* Transformed Palatial View */}
                <img
                  src="/assets/royal_hero.jpg"
                  alt="Transformed Royal Palace"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Bare Hall View Masked by Slider */}
                <div
                  style={{ width: `${100 - transformSlider}%` }}
                  className="absolute inset-y-0 right-0 overflow-hidden border-l-2 border-amber-400 bg-slate-900"
                >
                  <img
                    src="/assets/hall_transform_3d.jpg"
                    alt="Digital Twin Grid"
                    className="absolute inset-y-0 right-0 w-full h-full object-cover max-w-none grayscale contrast-125 opacity-70"
                    style={{ width: '100%', minWidth: '100%' }}
                  />
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-slate-900/90 text-white font-mono text-xs font-bold border border-slate-700">
                    Pre-Event Civic Grid
                  </div>
                </div>

                <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-amber-500/90 text-slate-950 font-mono text-xs font-extrabold shadow-lg">
                  Transformed Royal Mandapam
                </div>

                {/* Slider Handle Marker */}
                <div
                  style={{ left: `${transformSlider}%` }}
                  className="absolute inset-y-0 w-1 bg-amber-400 -translate-x-1/2 pointer-events-none"
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-xl border-2 border-white">
                    ↔
                  </div>
                </div>
              </div>

              {/* Slider Input Control */}
              <div className="tactical-card space-y-2">
                <div className="flex justify-between text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                  <span>Empty Civic Structure (0%)</span>
                  <span>Fully Decorated Royal Sanctuary (100%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={transformSlider}
                  onChange={(e) => setTransformSlider(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* TAB 3: 4DX Sensory Ambience & Lighting Simulator */}
          {activeTab === 'sensory_4dx' && (
            <div className="space-y-6">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Experience simulated micro-climate, lighting orchestration, and acoustic decibel filters tailored for dynastic celebrations:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Lighting Mode 1 */}
                <button
                  type="button"
                  onClick={() => setLightingMode('daylight')}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${
                    lightingMode === 'daylight'
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 shadow-lg'
                      : 'border-[#E8DFD1] dark:border-[#352952] bg-white dark:bg-[#1D1630] hover:border-amber-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                    <Sun className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">
                    Surya Daylight Gold (Morning Muhurtham)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    5500K natural sunlight simulation with golden saffron uplighting on floral pillars.
                  </p>
                </button>

                {/* Lighting Mode 2 */}
                <button
                  type="button"
                  onClick={() => setLightingMode('candlelight')}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${
                    lightingMode === 'candlelight'
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 shadow-lg'
                      : 'border-[#E8DFD1] dark:border-[#352952] bg-white dark:bg-[#1D1630] hover:border-amber-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
                    <Flame className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">
                    Twilight Diya Candlelight (Evening Feast)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    2700K warm candlelit intimacy with 500 brass oil lamps and soft amber chandelier glows.
                  </p>
                </button>

                {/* Lighting Mode 3 */}
                <button
                  type="button"
                  onClick={() => setLightingMode('sangeet')}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${
                    lightingMode === 'sangeet'
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 shadow-lg'
                      : 'border-[#E8DFD1] dark:border-[#352952] bg-white dark:bg-[#1D1630] hover:border-amber-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                    <Moon className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">
                    Cosmic Starlight Sangeet (Celebration Night)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Fiber-optic celestial ceiling with synced laser fountain acoustics and sound-reactive sparkles.
                  </p>
                </button>
              </div>

              {/* 4DX Sensory Environment Metrics */}
              <div className="tactical-card grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#140F22] border border-[#E8DFD1] dark:border-[#352952]">
                  <span className="text-[11px] font-mono text-slate-500 uppercase block">Ambient Temperature</span>
                  <span className="text-lg font-bold font-mono text-amber-900 dark:text-amber-200">22.4°C (HVAC Auto)</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#140F22] border border-[#E8DFD1] dark:border-[#352952]">
                  <span className="text-[11px] font-mono text-slate-500 uppercase block">Aromatherapy Misting</span>
                  <span className="text-lg font-bold font-mono text-rose-700 dark:text-rose-300">Jasmine & Desi Gulab</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#140F22] border border-[#E8DFD1] dark:border-[#352952]">
                  <span className="text-[11px] font-mono text-slate-500 uppercase block">Acoustic Decibels</span>
                  <span className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300">72 dB (Safe Limit)</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#140F22] border border-[#E8DFD1] dark:border-[#352952]">
                  <span className="text-[11px] font-mono text-slate-500 uppercase block">Curfew Ordinance</span>
                  <span className="text-lg font-bold font-mono text-indigo-700 dark:text-indigo-300">Compliant (22:00)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: App Core Guided Walkthrough */}
          {activeTab === 'guided_walkthrough' && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                FestivaPulseAI automates wedding and festival orchestration through 5 zero-hallucination pillars:
              </p>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-amber-300/60 dark:border-amber-800/40 bg-white dark:bg-[#1D1630] flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center flex-shrink-0 text-xs font-mono">
                    1
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">
                      Phase 1: Constraint-Grounded Celebration Blueprinting
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Enter wedding parameters with presets (₹5L Diwali, ₹18L Traditional Wedding, ₹3.5L Birthday Gala). Pure deterministic Python guarantees strict zero budget drift and validates HSE venue capacity.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-emerald-300/60 dark:border-emerald-800/40 bg-white dark:bg-[#1D1630] flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center flex-shrink-0 text-xs font-mono">
                    2
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">
                      Phase 2: Live Event Pulse & 40/30/30 Culinary Batching
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Ingests real-time gate RFID check-ins, tracks buffet tray burn rates, prevents stockouts, and generates official FSSAI regulatory food surplus rescue manifests for Feeding India and Robin Hood Army.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-rose-300/60 dark:border-rose-800/40 bg-white dark:bg-[#1D1630] flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-800 dark:text-rose-300 font-bold flex items-center justify-center flex-shrink-0 text-xs font-mono">
                    3
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">
                      Phase 3: Autonomous Rescue Studio (Tri-Option Matrix)
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      When live chaos strikes (food shortage, crowd surge, rain shock), Gemini synthesizes 3 comparative alternatives: Lowest Cost, Best Experience, and Lowest Disruption—enforcing Human-in-the-Loop coordinator approval.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-indigo-300/60 dark:border-indigo-800/40 bg-white dark:bg-[#1D1630] flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 font-bold flex items-center justify-center flex-shrink-0 text-xs font-mono">
                    4
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">
                      Phase 4: Append-Only Immutable Decision Ledger
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Every plan mutation is stamped with cryptographic hashes, timestamp, coordinator reason, and audited mathematical proofs with automatic plan version revisions (v1.0 → v2.0).
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-purple-300/60 dark:border-purple-800/40 bg-white dark:bg-[#1D1630] flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-800 dark:text-purple-300 font-bold flex items-center justify-center flex-shrink-0 text-xs font-mono">
                    5
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">
                      Phase 5: Reversible Scenario Lab & What-If Stress Testing
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Stress-test contingency shocks (budget cut, rain relocation, delayed muhurtham) in an isolated sandbox with instant actionable adjustments before altering physical celebration state.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-[#E8DFD1] dark:border-[#352952] bg-[#FDFBF7] dark:bg-[#1D1630] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Google Cloud Run • Vertex AI Gemini 2.5 Flash • Zero Arithmetic Hallucination</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenQAModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenQAModal();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-800 transition-colors"
              >
                Run Domain Invariant QA
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="btn-gold px-6 py-2 rounded-xl text-xs font-bold"
            >
              Close Experience
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
