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
  Calendar,
  Heart,
  Music,
} from 'lucide-react';
import { DynamicItineraryMenu } from './DynamicItineraryMenu';

interface ImmersiveVenueTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQAModal?: () => void;
}

export type TourTab =
  | 'themes_atelier'
  | 'dynamic_itinerary'
  | 'digital_twin'
  | 'transformation'
  | 'sensory_4dx'
  | 'guided_walkthrough';

type LightingMode = 'daylight' | 'candlelight' | 'sangeet';

interface CelebrationTheme {
  id: string;
  name: string;
  category: string;
  tagline: string;
  imageSrc: string;
  imageAlt: string;
  audioName: string;
  audioFrequencies: number[];
  audioWaveType: OscillatorType;
  culturalElements: string[];
  recommendedBudget: string;
  curfewProfile: string;
  colorGradient: string;
}

const CELEBRATION_THEMES: CelebrationTheme[] = [
  {
    id: 'raja_rani',
    name: 'Raja Rani Rajasthan Palace Wedding',
    category: 'Royal Heritage',
    tagline: 'Opulent Rajput Fort Grandeur with Marigold Arches, Golden Torches & Royal Fanfare',
    imageSrc: '/assets/cultural_themes.jpg',
    imageAlt: 'Raja Rani Royal Wedding Theme',
    audioName: 'Royal Shehnai Fanfare & Nagada Drone',
    audioFrequencies: [130.81, 196.0, 261.63, 392.0],
    audioWaveType: 'sawtooth',
    culturalElements: [
      'Carved Teak Mandap with 24k Gold Accents',
      'Ceremonial Agni Kund with Sandalwood Logs',
      'Live Shehnai & Nagada Auspicious Procession',
      'Grand Royal Thali Feast on Brassware',
    ],
    recommendedBudget: '₹35,00,000 - ₹80,00,000',
    curfewProfile: 'Sound Curfew 22:30 (Acoustic Folk After)',
    colorGradient: 'from-amber-600 via-rose-700 to-amber-900',
  },
  {
    id: 'tamil_brahmin',
    name: 'Tamil Brahmin Grand Temple Kalyanam',
    category: 'Vedic Temple Heritage',
    tagline: 'Sacred Gopuram Sanctum, Brass Kuthuvilakku Lamps, Vedic Chants & Fresh Lotus Arches',
    imageSrc: '/assets/cultural_themes.jpg',
    imageAlt: 'Tamil Brahmin Kalyanam Theme',
    audioName: 'Temple Nadaswaram & Thavil Drone (Sa-Pa-Sa)',
    audioFrequencies: [138.59, 207.65, 277.18],
    audioWaveType: 'triangle',
    culturalElements: [
      'Kasi Yatra & Oonjal Swing Ceremony with Silk Cushions',
      '18-Dish Authentic Banana Leaf Sadya (No Onion/Garlic)',
      'Live Master Nadaswaram & Thavil Artists',
      'Fresh Jasmine (Malli) Floral Pillars',
    ],
    recommendedBudget: '₹12,00,000 - ₹30,00,000',
    curfewProfile: 'Strict Temple Muhurtham 07:30 - 11:30 AM',
    colorGradient: 'from-amber-500 via-orange-600 to-amber-800',
  },
  {
    id: 'church_cathedral',
    name: 'Grand Church Cathedral Nuptial Mass',
    category: 'Christian Nuptials',
    tagline: 'Majestic Stained Glass Gothic Sanctuary, White Floral Aisle & Angelic Choral Harmony',
    imageSrc: '/assets/cultural_themes.jpg',
    imageAlt: 'Grand Church Cathedral Wedding',
    audioName: 'Cathedral Pipe Organ & Choral Resonance',
    audioFrequencies: [130.81, 164.81, 196.0, 261.63, 329.63],
    audioWaveType: 'sine',
    culturalElements: [
      '80-Foot White Satin Velvet Aisle Runner',
      'Tiered Ivory Fondant Cake & Champagne Toast',
      'Classical String Quartet & Church Choir',
      'European Roasted Gourmet Banquet & Pastry Station',
    ],
    recommendedBudget: '₹15,00,000 - ₹45,00,000',
    curfewProfile: 'Reception Curfew 23:00 (Permit Extended)',
    colorGradient: 'from-sky-600 via-indigo-700 to-purple-900',
  },
  {
    id: 'muslim_nikah',
    name: 'Royal Muslim Maharaja Nikah & Walima',
    category: 'Mughal Aristocracy',
    tagline: 'Emerald & Ivory Jaali Pavilion, Scented Oudh Misting & Devotional Sufi Qawwali',
    imageSrc: '/assets/cultural_themes.jpg',
    imageAlt: 'Royal Muslim Nikah Theme',
    audioName: 'Sufi Harmonium & Rubab Devotional Drone',
    audioFrequencies: [146.83, 220.0, 293.66, 440.0],
    audioWaveType: 'triangle',
    culturalElements: [
      'Hand-Carved Marble Mehraab Stage Backdrop',
      'Segregated Zenana & Mardana Plush Lounges',
      'Authentic Slow-Cooked Dum Biryani Handis',
      'Silver Ittar (Attar) Fragrance Fountains',
    ],
    recommendedBudget: '₹25,00,000 - ₹60,00,000',
    curfewProfile: 'Late Evening Walima Banquet (20:00 - 23:30)',
    colorGradient: 'from-emerald-600 via-teal-700 to-slate-900',
  },
  {
    id: 'ambani_luxury',
    name: 'Ultra-Modern Billionaire Extravaganza',
    category: 'Limitless Luxury',
    tagline: 'Tiered Crystal Chandeliers, Drone Light Show, Floating Floral Fountains & Global Couture',
    imageSrc: '/assets/modern_themes.jpg',
    imageAlt: 'Ambani Style Billionaire Wedding',
    audioName: 'Symphonic Strings & Philharmonic Resonance',
    audioFrequencies: [130.81, 196.0, 246.94, 329.63, 493.88],
    audioWaveType: 'sine',
    culturalElements: [
      'Swarovski Crystal Cascades with Automated Dimmers',
      'Michelin-Star Celebrity Chef Live Pavilions',
      'Synchronized 400-Drone Aerial Storytelling Display',
      'Bespoke Gold-Plated Invitation & Concierge Fleet',
    ],
    recommendedBudget: '₹1,50,00,000 - ₹10,00,00,000+',
    curfewProfile: 'Enclosed Acoustic Glasshouse (24h Soundproof)',
    colorGradient: 'from-amber-400 via-purple-600 to-rose-700',
  },
  {
    id: 'genz_neon',
    name: 'Gen Z Neon Techno After-Party & Sangeet',
    category: 'Trendsetter & Party',
    tagline: 'Cyberpunk Laser Light Shows, LED Cocktail Bar, 128 BPM Sound System & Silent Disco',
    imageSrc: '/assets/modern_themes.jpg',
    imageAlt: 'Gen Z Neon Techno Party Theme',
    audioName: 'Electronic 808 Synth Bassline & Rhythmic Pulse',
    audioFrequencies: [55.0, 110.0, 220.0],
    audioWaveType: 'sawtooth',
    culturalElements: [
      'Laser Beam Grid with Haze Fog Mapping',
      'Molecular Cocktail Mixology with Liquid Nitrogen',
      'Silent Disco Headphones Past 22:00 Curfew',
      'Interactive RFID Photo Wall & TikTok Drone Cam',
    ],
    recommendedBudget: '₹8,00,000 - ₹22,00,000',
    curfewProfile: 'Outdoor Cutoff 22:00 -> Indoor Club 02:00',
    colorGradient: 'from-fuchsia-600 via-cyan-500 to-purple-900',
  },
  {
    id: 'eco_harvest',
    name: 'Eco-Friendly Community Harvest Festival',
    category: 'Sustainable & Folk',
    tagline: 'Zero-Waste Bamboo Pavilions, Banana Leaf Dining, Earthen Matkas & Live Folk Flute',
    imageSrc: '/assets/modern_themes.jpg',
    imageAlt: 'Eco Harvest Community Theme',
    audioName: 'Earthen Bamboo Flute & Folk Whistle Harmonics',
    audioFrequencies: [174.61, 261.63, 349.23],
    audioWaveType: 'triangle',
    culturalElements: [
      '100% Biodegradable Areca Nut Tableware',
      'Solar-Powered Amber Fairy Light Canopies',
      'Organic Farm-to-Table Traditional Feast',
      'FSSAI 0% Food Waste Route to Local Shelters',
    ],
    recommendedBudget: '₹4,00,000 - ₹10,00,00,000',
    curfewProfile: 'Natural Daylight & Sunset Celebration',
    colorGradient: 'from-emerald-600 via-amber-600 to-stone-800',
  },
  {
    id: 'economy_courtyard',
    name: 'Smart Economy / Intimate Courtyard Wedding',
    category: 'Budget-Optimized Dignity',
    tagline: 'Warm Brass Diyas, Rustic Stone Archways, Intimate 80-Guest Banquet & Acoustic Melody',
    imageSrc: '/assets/modern_themes.jpg',
    imageAlt: 'Economy Intimate Courtyard Theme',
    audioName: 'Acoustic Courtyard Guitar & Sitar Resonance',
    audioFrequencies: [146.83, 196.0, 293.66],
    audioWaveType: 'sine',
    culturalElements: [
      'Warm Brass Diya Illuminations on Stone Steps',
      'Family-Recipe Heritage Feast Service',
      'Intimate 80-Seat Open Sky Courtyard Table',
      'Maximum Financial Prudence with Zero Elegance Loss',
    ],
    recommendedBudget: '₹2,50,000 - ₹6,00,000',
    curfewProfile: 'Compliant 22:00 Soft Acoustic Wrap',
    colorGradient: 'from-amber-700 via-orange-800 to-slate-900',
  },
];

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
  const [activeTab, setActiveTab] = useState<TourTab>('themes_atelier');
  const [selectedTheme, setSelectedTheme] = useState<CelebrationTheme>(CELEBRATION_THEMES[0]);
  const [selectedZone, setSelectedZone] = useState<VenueZone>(VENUE_ZONES[0]);
  const [transformSlider, setTransformSlider] = useState<number>(75);
  const [lightingMode, setLightingMode] = useState<LightingMode>('candlelight');
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscNodesRef = useRef<OscillatorNode[]>([]);

  // Web Audio Multi-Harmonic Sound Synthesizer (0 dependencies, 100% client side)
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Update audio dynamically when selectedTheme changes
  useEffect(() => {
    if (audioPlaying) {
      stopAudio();
      startAudio(selectedTheme);
    }
  }, [selectedTheme]);

  const startAudio = (theme: CelebrationTheme = selectedTheme) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.07, ctx.currentTime);
      masterGain.connect(ctx.destination);

      const oscillators: OscillatorNode[] = [];
      theme.audioFrequencies.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = theme.audioWaveType;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
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
      startAudio(selectedTheme);
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
      <div className="bg-[#FAF7F2] dark:bg-[#140F22] rounded-3xl w-full max-w-6xl border-2 border-[#D4AF37]/50 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden my-auto animate-in zoom-in-95 duration-200">
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
                    Multi-Cultural & GPS Enabled
                  </span>
                </div>
                <h2 id="tour-modal-title" className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-[#FAF7F2] mt-0.5">
                  FestivaPulseAI — 3D/4DX Venue Transformation & Guided Tour
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {/* Dynamic Theme Ambience Audio Toggle */}
              <button
                type="button"
                onClick={toggleAudio}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  audioPlaying
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-400 shadow-sm animate-pulse'
                    : 'bg-white dark:bg-[#1D1630] text-slate-700 dark:text-slate-300 border-[#E8DFD1] dark:border-[#352952] hover:border-amber-400'
                }`}
                title="Toggle Live Theme-Matched Ambient Soundscape"
              >
                {audioPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="font-sans">
                  {audioPlaying ? selectedTheme.audioName.split(' ')[0] + ' Active' : 'Play Soundscape'}
                </span>
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
          <div className="flex items-center gap-1.5 mt-5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setActiveTab('themes_atelier')}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'themes_atelier'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white/80 dark:bg-[#140F22]/80 text-slate-700 dark:text-slate-300 border border-[#E8DFD1] dark:border-[#352952]'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Multi-Cultural & Budget Atelier (8 Themes)</span>
            </button>

            <button
              onClick={() => setActiveTab('dynamic_itinerary')}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'dynamic_itinerary'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white/80 dark:bg-[#140F22]/80 text-slate-700 dark:text-slate-300 border border-[#E8DFD1] dark:border-[#352952]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Dynamic Itinerary & Regional Menu</span>
            </button>

            <button
              onClick={() => setActiveTab('digital_twin')}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'digital_twin'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white/80 dark:bg-[#140F22]/80 text-slate-700 dark:text-slate-300 border border-[#E8DFD1] dark:border-[#352952]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>3D Spatial Digital Twin</span>
            </button>

            <button
              onClick={() => setActiveTab('transformation')}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'transformation'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white/80 dark:bg-[#140F22]/80 text-slate-700 dark:text-slate-300 border border-[#E8DFD1] dark:border-[#352952]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Before & After Transformation</span>
            </button>

            <button
              onClick={() => setActiveTab('sensory_4dx')}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'sensory_4dx'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white/80 dark:bg-[#140F22]/80 text-slate-700 dark:text-slate-300 border border-[#E8DFD1] dark:border-[#352952]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>4DX Sensory & Lighting</span>
            </button>

            <button
              onClick={() => setActiveTab('guided_walkthrough')}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'guided_walkthrough'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white/80 dark:bg-[#140F22]/80 text-slate-700 dark:text-slate-300 border border-[#E8DFD1] dark:border-[#352952]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Autonomous Copilot Pillars</span>
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* TAB 1: Multi-Cultural & Budget Atelier (8 Themes) */}
          {activeTab === 'themes_atelier' && (
            <div className="space-y-6">
              {/* Theme Selector Carousel Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Select Celebration Theme & Soundscape:
                  </span>
                  <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400">
                    Active: {selectedTheme.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CELEBRATION_THEMES.map((theme) => {
                    const isSelected = selectedTheme.id === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setSelectedTheme(theme)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-gradient-to-br from-amber-500/20 to-rose-500/10 border-amber-500 shadow-md scale-102 ring-1 ring-amber-400'
                            : 'bg-white dark:bg-[#1D1630] border-[#E8DFD1] dark:border-[#352952] hover:border-amber-400'
                        }`}
                      >
                        <span className="text-[10px] font-mono uppercase text-amber-700 dark:text-amber-400 font-bold block">
                          {theme.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1 mt-0.5">
                          {theme.name}
                        </h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1 font-mono">
                          {theme.recommendedBudget.split('-')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Theme Grand Visual & Operational Panel */}
              <div className="rounded-3xl border-2 border-amber-400/50 overflow-hidden shadow-xl bg-gradient-to-b from-white to-[#FDFBF7] dark:from-[#1D1630] dark:to-[#140F22]">
                <div className="relative aspect-[16/8] sm:aspect-[16/7] w-full overflow-hidden bg-slate-950">
                  <img
                    src={selectedTheme.imageSrc}
                    alt={selectedTheme.imageAlt}
                    className="w-full h-full object-cover object-center filter brightness-[0.9] hover:scale-102 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500 text-slate-950 inline-block mb-2">
                      {selectedTheme.category}
                    </span>
                    <h3 className="text-xl sm:text-3xl font-black text-white font-display drop-shadow-md">
                      {selectedTheme.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-100/90 font-sans max-w-2xl mt-1 drop-shadow">
                      {selectedTheme.tagline}
                    </p>
                  </div>

                  {/* Soundscape Badge */}
                  <div className="absolute top-4 right-4">
                    <button
                      type="button"
                      onClick={toggleAudio}
                      className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-400/40 text-amber-300 hover:text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
                    >
                      <Music className="w-3.5 h-3.5 text-amber-400" />
                      <span>{selectedTheme.audioName}</span>
                    </button>
                  </div>
                </div>

                {/* Theme Highlights & Specifications */}
                <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <h5 className="heading-section text-xs font-bold">Timeless Cultural Protocols</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {selectedTheme.culturalElements.map((elem, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                          <span className="text-slate-800 dark:text-slate-200">{elem}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block uppercase">
                        Recommended Investment Band
                      </span>
                      <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                        {selectedTheme.recommendedBudget}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block uppercase">
                        Sound Curfew Ordinance
                      </span>
                      <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                        {selectedTheme.curfewProfile}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('dynamic_itinerary')}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Customize Location & Menu</span>
                      <Compass className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Dynamic Itinerary & Regional Menu */}
          {activeTab === 'dynamic_itinerary' && (
            <DynamicItineraryMenu />
          )}

          {/* TAB 3: 3D Spatial Digital Twin */}
          {activeTab === 'digital_twin' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 relative aspect-[16/10] rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-xl bg-slate-950">
                <img
                  src="/assets/hall_transform_3d.jpg"
                  alt="3D Digital Twin Hall Schematic"
                  className="w-full h-full object-cover filter brightness-[0.85] contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30 pointer-events-none" />

                {/* Clickable Spatial Hotspots */}
                {VENUE_ZONES.map((zone) => {
                  const isSelected = selectedZone.id === zone.id;
                  return (
                    <button
                      key={zone.id}
                      onClick={() => setSelectedZone(zone)}
                      style={{ top: `${zone.yPct}%`, left: `${zone.xPct}%` }}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group transition-all duration-300 ${
                        isSelected ? 'scale-125' : 'scale-100 hover:scale-110'
                      }`}
                      title={zone.name}
                    >
                      <div className="relative">
                        <span
                          className={`absolute -inset-2 rounded-full animate-ping opacity-60 ${
                            isSelected ? 'bg-amber-400' : 'bg-rose-500'
                          }`}
                        />
                        <div
                          className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-lg border-2 ${
                            isSelected
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500 border-white text-slate-950'
                              : 'bg-slate-900/90 border-amber-400 text-amber-300'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        <span className="absolute left-1/2 -bottom-6 transform -translate-x-1/2 bg-black/80 text-[10px] text-white px-2 py-0.5 rounded-md font-mono whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                          {zone.name.split(' ')[0]}
                        </span>
                      </div>
                    </button>
                  );
                })}

                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-[11px] text-amber-200 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>5 Interactive Spatial Hotspots Active</span>
                </div>
              </div>

              {/* Selected Zone Detail Card */}
              <div className="tactical-card flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E8DFD1] dark:border-[#352952] pb-2">
                    <span className="text-[11px] font-mono uppercase text-amber-700 dark:text-amber-400 font-bold">
                      {selectedZone.category}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Coordinates: {selectedZone.xPct}%, {selectedZone.yPct}%
                    </span>
                  </div>

                  <h3 className="heading-card text-lg sm:text-xl font-bold">
                    {selectedZone.name}
                  </h3>
                  <p className="text-sub text-xs leading-relaxed">
                    {selectedZone.description}
                  </p>

                  <div className="space-y-2 pt-2 text-xs">
                    <div className="p-3 bg-white dark:bg-[#1D1630] rounded-xl border border-[#E8DFD1] dark:border-[#352952]">
                      <span className="text-[10px] text-slate-400 block uppercase font-mono">
                        Capacity & Crowd Density
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {selectedZone.capacity}
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#1D1630] rounded-xl border border-[#E8DFD1] dark:border-[#352952]">
                      <span className="text-[10px] text-slate-400 block uppercase font-mono">
                        Acoustic & Ambience Profile
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {selectedZone.ambience}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                      Safety & Invariant Protocols:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      {selectedZone.protocols.map((p, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono pt-3 border-t border-[#E8DFD1] dark:border-[#352952]">
                  Click any hotspot on the digital twin to inspect real-time venue telemetry.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Before & After Transformation */}
          {activeTab === 'transformation' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="heading-card text-lg font-bold">
                    Interactive Before vs. After Hall Transformation
                  </h3>
                  <p className="text-sub text-xs">
                    Slide to witness an empty municipal venue evolve into an opulent royal banquet.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500">Bare Hall (0%)</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={transformSlider}
                    onChange={(e) => setTransformSlider(Number(e.target.value))}
                    className="accent-amber-500 w-36 sm:w-48 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300">
                    Royal Atelier ({transformSlider}%)
                  </span>
                </div>
              </div>

              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-2xl bg-slate-900">
                <img
                  src="/assets/hall_transform_3d.jpg"
                  alt="Transformed Celebration Atelier"
                  className="w-full h-full object-cover"
                />

                <div
                  className="absolute inset-0 bg-slate-900/90 pointer-events-none transition-opacity duration-300"
                  style={{ opacity: (100 - transformSlider) / 100 * 0.85 }}
                />

                <div
                  className="absolute inset-y-0 w-1 bg-amber-400 shadow-[0_0_15px_#F59E0B]"
                  style={{ left: `${transformSlider}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-lg">
                    ⇄
                  </div>
                </div>

                <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-lg text-white font-mono text-xs">
                  Bare Framework (Pre-Decoration)
                </div>
                <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 font-bold px-3 py-1 rounded-lg font-mono text-xs shadow-md">
                  Autonomous Transformation Complete
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 4DX Sensory Ambience Engine */}
          {activeTab === 'sensory_4dx' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="tactical-card space-y-4">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h4 className="heading-card text-base font-bold">Dynamic Lighting Profiles</h4>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setLightingMode('daylight')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      lightingMode === 'daylight'
                        ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 font-bold text-amber-900 dark:text-amber-200'
                        : 'bg-white dark:bg-[#1D1630] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Sun className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                    <span className="text-xs block">Daylight Gold</span>
                    <span className="text-[10px] text-slate-400 font-mono">5500K Ritual</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLightingMode('candlelight')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      lightingMode === 'candlelight'
                        ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 font-bold text-amber-900 dark:text-amber-200'
                        : 'bg-white dark:bg-[#1D1630] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                    <span className="text-xs block">Diya Glow</span>
                    <span className="text-[10px] text-slate-400 font-mono">2700K Warm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLightingMode('sangeet')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      lightingMode === 'sangeet'
                        ? 'bg-purple-100 dark:bg-purple-950/60 border-purple-400 font-bold text-purple-900 dark:text-purple-200'
                        : 'bg-white dark:bg-[#1D1630] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Moon className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                    <span className="text-xs block">Starlight Night</span>
                    <span className="text-[10px] text-slate-400 font-mono">RGB Sangeet</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-slate-700 dark:text-slate-300">
                  <h5 className="font-bold text-amber-900 dark:text-amber-200 mb-1">
                    Smart DMX Fixture Sync
                  </h5>
                  <p>
                    All 48 LED pin-spots and ceiling wash beams synchronize automatically with Shubh Muhurtham rituals, dimming smoothly for sacred vows and illuminating dynamically during Baraat.
                  </p>
                </div>
              </div>

              <div className="tactical-card space-y-4">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="heading-card text-base font-bold">Acoustic & Olfactory Atmosphere</h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-white dark:bg-[#1D1630] rounded-xl border border-[#E8DFD1] dark:border-[#352952]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Floral Hydro-Fog Misting
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Sandalwood, Rosewater & Jasmine essential extract dispersed at 15-minute intervals to preserve fresh flower vitality under hall AC.
                    </p>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#1D1630] rounded-xl border border-[#E8DFD1] dark:border-[#352952]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Live Sound Level Sensor
                      </span>
                      <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                        62.4 dB (Optimal)
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Strict sound curfew monitor enforces municipal noise limits (&lt; 75 dB) to guarantee zero police citation penalties.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Autonomous Copilot Pillars */}
          {activeTab === 'guided_walkthrough' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/40 text-xs">
                <h4 className="font-bold text-amber-950 dark:text-amber-200 text-sm mb-1">
                  FestivaPulseAI — 5 Operational Resilience Pillars
                </h4>
                <p className="text-slate-600 dark:text-slate-300">
                  Built for zero failure on the most high-stakes day of a family's life.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="tactical-subcard space-y-2">
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                    01 · INGESTION
                  </span>
                  <h5 className="font-bold text-slate-900 dark:text-slate-100">
                    Master Celebration Blueprint
                  </h5>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                    Vertex AI Gemini 2.5 Flash digests cultural dietary requirements, capacity ceilings, and budgets to generate a locked execution DAG.
                  </p>
                </div>

                <div className="tactical-subcard space-y-2">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                    02 · TELEMETRY
                  </span>
                  <h5 className="font-bold text-slate-900 dark:text-slate-100">
                    Live Event Pulse & Check-in
                  </h5>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                    Ingests live RFID gate arrivals, vendor delays, and dietary splits with sub-100ms pub/sub telemetry streaming.
                  </p>
                </div>

                <div className="tactical-subcard space-y-2">
                  <span className="font-mono text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                    03 · RESILIENCE
                  </span>
                  <h5 className="font-bold text-slate-900 dark:text-slate-100">
                    Rescue Studio (HITL)
                  </h5>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                    When rain strikes or guests surge, multi-agent ADK swarms generate comparative options for human coordinator signoff.
                  </p>
                </div>

                <div className="tactical-subcard space-y-2">
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold text-[11px]">
                    04 · AUDIT
                  </span>
                  <h5 className="font-bold text-slate-900 dark:text-slate-100">
                    Immutable Decision Ledger
                  </h5>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                    Every approved plan modification is cryptographically stamped with coordinator rationale, creating an airtight audit trail.
                  </p>
                </div>

                <div className="tactical-subcard space-y-2">
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                    05 · SIMULATION
                  </span>
                  <h5 className="font-bold text-slate-900 dark:text-slate-100">
                    Scenario Lab Sandbox
                  </h5>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                    Stress-test what-if shocks: simulate +100 sudden guests or 45-minute Baraat delay to verify real-time tactical adjustments.
                  </p>
                </div>

                <div className="tactical-subcard space-y-2">
                  <span className="font-mono text-teal-600 dark:text-teal-400 font-bold text-[11px]">
                    06 · VERIFICATION
                  </span>
                  <h5 className="font-bold text-slate-900 dark:text-slate-100">
                    Automated Invariant Suite
                  </h5>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                    Rigorous domain invariant checks verifying zero arithmetic hallucinations, FSSAI temperature thresholds, and HSE limits.
                  </p>
                </div>
              </div>

              {onOpenQAModal && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={onOpenQAModal}
                    className="btn-emerald text-xs font-bold inline-flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Run In-App Automated QA Verification Suite</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
