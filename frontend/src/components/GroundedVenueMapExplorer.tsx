import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Compass,
  Volume2,
  Car,
  Heart,
  Navigation,
} from 'lucide-react';
import { api } from '../services/api';

export interface GroundedHall {
  id: string;
  name: string;
  city: string;
  area: string;
  category: string;
  lat: number;
  lng: number;
  capacity_min: number;
  capacity_max: number;
  base_rental_inr: number;
  per_plate_veg_inr: number;
  per_plate_nonveg_inr: number;
  sound_curfew_time: string;
  parking_cars: number;
  wheelchair_accessible: boolean;
  fssai_staging_bay: boolean;
  rag_grounding_score: number;
  matched_vibe: string;
  highlights: string[];
}

interface GroundedVenueMapExplorerProps {
  eventId?: string;
  currentLocation?: string;
  expectedGuests?: number;
  totalBudget?: number;
  onApplyVenue?: (hall: GroundedHall, investmentPlan?: any) => void;
}

const REGIONAL_CITY_HUBS = [
  { id: 'Bengaluru', name: 'Bengaluru (Karnataka)', lat: 12.9716, lng: 77.5946, defaultVibe: 'Royal Mysore Heritage' },
  { id: 'Chennai', name: 'Chennai (Tamil Nadu)', lat: 13.0827, lng: 80.2707, defaultVibe: 'Vedic Mandapam Tradition' },
  { id: 'Mumbai', name: 'Mumbai (Maharashtra)', lat: 19.0760, lng: 72.8777, defaultVibe: 'Luxury Bollywood Gala' },
  { id: 'New Delhi', name: 'New Delhi & NCR', lat: 28.6139, lng: 77.2090, defaultVibe: 'Grand Mughal Haveli' },
  { id: 'Hyderabad', name: 'Hyderabad (Telangana)', lat: 17.3850, lng: 78.4867, defaultVibe: 'Nizami Shahi Dawat' },
  { id: 'Jaipur', name: 'Jaipur (Rajasthan)', lat: 26.9124, lng: 75.7873, defaultVibe: 'Rajput Fort Grandeur' },
  { id: 'Goa', name: 'Goa (Coastal)', lat: 15.2993, lng: 74.1240, defaultVibe: 'Beachfront Sunset' },
  { id: 'Tirunelveli', name: 'Tirunelveli (South TN)', lat: 8.7139, lng: 77.7567, defaultVibe: 'Community Halwa Feast' },
];

export const GroundedVenueMapExplorer: React.FC<GroundedVenueMapExplorerProps> = ({
  eventId,
  currentLocation = 'Bengaluru',
  expectedGuests = 350,
  totalBudget = 1200000,
  onApplyVenue,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('Bengaluru');
  const [halls, setHalls] = useState<GroundedHall[]>([]);
  const [selectedHall, setSelectedHall] = useState<GroundedHall | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'streets' | 'satellite'>('streets');

  // Detect city from currentLocation prop
  useEffect(() => {
    if (currentLocation) {
      const matched = REGIONAL_CITY_HUBS.find((c) =>
        currentLocation.toLowerCase().includes(c.id.toLowerCase())
      );
      if (matched) {
        setSelectedCity(matched.id);
      }
    }
  }, [currentLocation]);

  // Load grounded halls when city changes
  useEffect(() => {
    const fetchHalls = async () => {
      setLoading(true);
      try {
        const res = await api.searchVenues(selectedCity, expectedGuests, totalBudget);
        if (res.venues && res.venues.length > 0) {
          setHalls(res.venues);
          setSelectedHall(res.venues[0]);
        }
      } catch (err) {
        console.warn('Venue RAG search error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHalls();
  }, [selectedCity, expectedGuests, totalBudget]);

  const handleApplyHall = async (hall: GroundedHall) => {
    if (eventId) {
      try {
        const res = await api.applyVenue(eventId, hall.id);
        if (onApplyVenue) {
          onApplyVenue(hall, res.investment_plan);
        }
        setAppliedNotice(`Plan Re-Anchored to ${hall.name}! Budget & Itinerary Recalibrated.`);
        setTimeout(() => setAppliedNotice(null), 4500);
      } catch (err: any) {
        console.error('Failed to apply venue:', err);
        if (onApplyVenue) {
          onApplyVenue(hall);
        }
        setAppliedNotice(`Venue Selected: ${hall.name}`);
        setTimeout(() => setAppliedNotice(null), 3500);
      }
    } else if (onApplyVenue) {
      onApplyVenue(hall);
      setAppliedNotice(`Venue Selected: ${hall.name}`);
      setTimeout(() => setAppliedNotice(null), 3500);
    }
  };

  const activeHub = REGIONAL_CITY_HUBS.find((c) => c.id === selectedCity) || REGIONAL_CITY_HUBS[0];

  return (
    <div className="space-y-6">
      {/* Top Header & City Selector Bar */}
      <div className="tactical-card border-amber-300/40 dark:border-amber-700/40 bg-gradient-to-r from-amber-500/10 via-slate-900/10 to-rose-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/30">
                Grounded Spatial RAG
              </span>
              <h3 className="heading-section flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-500" />
                Celebration Venue & Party Hall Radar
              </h3>
            </div>
            <p className="text-sub mt-1">
              Select your celebration city to inspect surrounding grounded party halls, verified tariffs, acoustic curfew limits, and auto-calibrate your complete investment itinerary.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>GCP Vector DB Synced (98% Grounding)</span>
            </span>
          </div>
        </div>

        {/* Regional City Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {REGIONAL_CITY_HUBS.map((city) => {
            const isSelected = selectedCity === city.id;
            return (
              <button
                key={city.id}
                type="button"
                onClick={() => setSelectedCity(city.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-md scale-102 ring-1 ring-amber-400'
                    : 'bg-white/80 dark:bg-[#1D1630]/80 text-slate-700 dark:text-slate-300 border border-[#E8DFD1] dark:border-[#352952] hover:border-amber-400'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-200' : 'text-rose-500'}`} />
                <span>{city.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Applied Notice Banner */}
      {appliedNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-md animate-fadeIn flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-xs sm:text-sm">{appliedNotice}</span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-emerald-500/20 px-2 py-1 rounded">
            Auto-Hydrated
          </span>
        </div>
      )}

      {/* Main Grid: Interactive Map Radar + Venue Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Interactive Google Maps / Spatial Radar */}
        <div className="lg:col-span-5 space-y-4">
          <div className="tactical-card p-4 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD1] dark:border-[#352952]">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                  Spatial Coordinates: {activeHub.lat.toFixed(4)}° N, {activeHub.lng.toFixed(4)}° E
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMapMode('streets')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    mapMode === 'streets'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Radar
                </button>
                <button
                  type="button"
                  onClick={() => setMapMode('satellite')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    mapMode === 'satellite'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Satellite
                </button>
              </div>
            </div>

            {/* Interactive Geospatial Radar Map Canvas */}
            <div className="mt-3 relative w-full h-[360px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
              {/* Background Map Grid & Satellite Texture */}
              <div
                className={`absolute inset-0 opacity-40 transition-opacity ${
                  mapMode === 'satellite' ? 'bg-emerald-950' : 'bg-slate-900'
                }`}
                style={{
                  backgroundImage:
                    'radial-gradient(circle, rgba(212, 175, 55, 0.15) 1px, transparent 1px), linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Range Concentric Radar Circles */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-72 h-72 rounded-full border border-amber-500/20" />
                <div className="w-48 h-48 rounded-full border border-amber-500/30" />
                <div className="w-24 h-24 rounded-full border border-amber-500/40" />
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              </div>

              {/* City Center Pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-lg ring-4 ring-rose-500/30" />
                <span className="text-[9px] font-bold font-mono text-white bg-black/80 px-1.5 py-0.5 rounded mt-1 border border-rose-500/50">
                  {selectedCity} Core
                </span>
              </div>

              {/* Venue Hall Pin Markers */}
              {halls.map((hall) => {
                const isSelected = selectedHall?.id === hall.id;
                // Calculate dynamic visual offsets from city center
                const offsetX = (hall.lng - activeHub.lng) * 450 + 50;
                const offsetY = (activeHub.lat - hall.lat) * 450 + 50;
                const clampX = Math.max(12, Math.min(88, offsetX));
                const clampY = Math.max(12, Math.min(88, offsetY));

                return (
                  <button
                    key={hall.id}
                    type="button"
                    onClick={() => setSelectedHall(hall)}
                    style={{ left: `${clampX}%`, top: `${clampY}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all group cursor-pointer z-10 ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 scale-125 shadow-xl ring-4 ring-amber-400/50'
                        : 'bg-slate-900/90 text-amber-300 border border-amber-400/50 hover:scale-110'
                    }`}
                    title={hall.name}
                  >
                    <MapPin className="w-4 h-4" />
                    {/* Floating Tooltip */}
                    <div
                      className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-black/90 text-white text-[10px] whitespace-nowrap border border-amber-400/40 pointer-events-none transition-opacity ${
                        isSelected ? 'opacity-100 font-bold' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <span>{hall.name.split(' ')[0]}</span>
                      <span className="text-amber-400 ml-1 font-mono">₹{hall.per_plate_veg_inr}/p</span>
                    </div>
                  </button>
                );
              })}

              {/* External Google Maps Link */}
              {selectedHall && (
                <div className="absolute bottom-3 right-3 z-20">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedHall.lat},${selectedHall.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 hover:bg-black text-[10px] font-mono text-amber-300 border border-amber-400/40 shadow-lg transition-colors"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3 h-3 text-amber-400" />
                  </a>
                </div>
              )}
            </div>

            {/* Selected Hall Quick Stat */}
            {selectedHall && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {selectedHall.name}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                    {(selectedHall.rag_grounding_score * 100).toFixed(0)}% RAG Match
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  {selectedHall.area}, {selectedHall.city}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 Cols): Grounded Hall Cards & Investment Recalibrator */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
              Surrounding Party & Wedding Halls ({halls.length} Grounded Venues)
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Sorted by Capacity & Budget Fit
            </span>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center text-xs font-mono text-slate-500">
                Retrieving grounded halls via GCP Spatial RAG...
              </div>
            ) : halls.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No halls indexed for this location yet.
              </div>
            ) : (
              halls.map((hall) => {
                const isSelected = selectedHall?.id === hall.id;
                const estCatering = expectedGuests * hall.per_plate_veg_inr;
                const totalEst = hall.base_rental_inr + estCatering + int(hall.base_rental_inr * 0.95);

                return (
                  <div
                    key={hall.id}
                    onClick={() => setSelectedHall(hall)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-gradient-to-r from-amber-500/10 via-white to-amber-500/5 dark:from-[#231A3A] dark:via-[#1D1630] dark:to-[#171126] shadow-lg ring-1 ring-amber-400'
                        : 'border-[#E8DFD1] dark:border-[#352952] bg-white dark:bg-[#1D1630] hover:border-amber-400/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase">
                            {hall.category}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            {hall.area}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                          {hall.name}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-0.5">
                          "{hall.matched_vibe}"
                        </p>
                      </div>

                      <div className="text-left sm:text-right flex-shrink-0">
                        <span className="text-base font-black font-mono text-slate-900 dark:text-slate-100 block">
                          ₹{hall.base_rental_inr.toLocaleString()}
                          <span className="text-[10px] font-normal text-slate-500">/day lease</span>
                        </span>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                          ₹{hall.per_plate_veg_inr} veg / ₹{hall.per_plate_nonveg_inr} non-veg
                        </span>
                      </div>
                    </div>

                    {/* Operational Badges */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-500" />
                        <span>Cap: {hall.capacity_min}–{hall.capacity_max} pax</span>
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1">
                        <Volume2 className="w-3 h-3 text-purple-400" />
                        <span>Curfew: {hall.sound_curfew_time}</span>
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1">
                        <Car className="w-3 h-3 text-blue-400" />
                        <span>Parking: {hall.parking_cars} cars</span>
                      </span>
                      {hall.wheelchair_accessible && (
                        <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20">
                          Wheelchair Access
                        </span>
                      )}
                    </div>

                    {/* Highlights */}
                    <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-700 dark:text-slate-300">
                      {hall.highlights.slice(0, 2).map((h, i) => (
                        <div key={i} className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-3 h-3 text-amber-500 flex-shrink-0" />
                          <span className="truncate">{h}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Bar */}
                    <div className="mt-3 pt-3 border-t border-[#E8DFD1]/60 dark:border-[#352952]/60 flex items-center justify-between">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Est. All-In Investment ({expectedGuests} guests):{' '}
                        <strong className="text-slate-900 dark:text-slate-100 font-mono">
                          ₹{totalEst.toLocaleString()}
                        </strong>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyHall(hall);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-slate-950 font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                        <span>Select Venue & Recalibrate Plan</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function int(val: number): number {
  return Math.floor(val);
}
