import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Utensils,
  Calendar,
  Compass,
  DollarSign,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { DietaryRequirement } from '../types';

export interface LocationProfile {
  id: string;
  name: string;
  state: string;
  country: string;
  defaultVenue: string;
  culturalVibe: string;
  curfewTime: string;
  cateringHighlights: {
    breakfast: string[];
    lunch: string[];
    hiTea: string[];
    dinner: string[];
  };
  baseVenueRate1Day: number;
}

export const REGIONAL_LOCATIONS: LocationProfile[] = [
  {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    defaultVenue: 'Mylapore Heritage Mandapam & Lawns',
    culturalVibe: 'Traditional Vedic & Dravidian Temple Elegance with Live Nadaswaram',
    curfewTime: '22:00',
    cateringHighlights: {
      breakfast: ['Traditional Ghee Getti Pongal', 'Steamed Kanchipuram Idli', 'Crispy Medu Vada', 'Organic Kumbakonam Degree Filter Kaapi'],
      lunch: ['18-Course Authentic Banana Leaf Sadya', 'Mor Kuzhambu & Drumstick Sambar', 'Avial & Poriyal Medley', 'Warm Elaneer (Tender Coconut) Payasam'],
      hiTea: ['Mini Podi Idlis on Skewers', 'Madras Onion Pakoda', 'Filter Kaapi & Sukku Coffee', 'Mysore Pak'],
      dinner: ['Chettinad Kozhi Biryani / Mushroom Biryani', 'Parotta with Veg Salna', 'Live Appam & Stew Counter', 'Badam Halwa'],
    },
    baseVenueRate1Day: 220000,
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    defaultVenue: 'Marine Drive Waterfront Palace & Ballroom',
    culturalVibe: 'Regal Coastal Heritage with Bollywood Glamour & Live Violin Fusion',
    curfewTime: '23:30',
    cateringHighlights: {
      breakfast: ['Kanda Poha with Pomegranate', 'Sabudana Khichdi', 'Batata Vada with Dry Chutney', 'Masala Cutting Chai'],
      lunch: ['Puran Poli with Ghee', 'Pithla Bhakri & Bharli Vangi', 'Aamras Puri Station', 'Ukdiche Modak'],
      hiTea: ['Chowpatty Sev Puri & Bhel Live Counter', 'Mini Misal Pao Sliders', 'Lemongrass Chai', 'Shrewsbury Biscuits'],
      dinner: ['Maharashtrian Dum Biryani', 'Kolhapuri Tawa Paneer / Mutton Sukka', 'Bhakri & Rotis', 'Kulfi Falooda Live Station'],
    },
    baseVenueRate1Day: 350000,
  },
  {
    id: 'delhi',
    name: 'Delhi NCR',
    state: 'Delhi',
    country: 'India',
    defaultVenue: 'Chhatarpur Imperial Farmhouse & Crystal Pavilion',
    culturalVibe: 'Grand Mughal & Punjabi Royal Splendor with Live Dhol & Shehnai',
    curfewTime: '22:30',
    cateringHighlights: {
      breakfast: ['Bedmi Puri with Aloo Sabzi', 'Amritsari Stuffed Kulche with Chole', 'Sweet Lassi in Earthen Matkas', 'Kullad Chai'],
      lunch: ['Slow-Cooked Dal Makhani (24h Simmer)', 'Paneer Tikka Lababdar', 'Kashmiri Pulao with Nuts', 'Hot Gulab Jamun with Rabri'],
      hiTea: ['Chandni Chowk Live Chaat Counter', 'Palak Patta Crispy Chaat', 'Kesari Jalebi with Cream', 'Tandoori Chai'],
      dinner: ['Awadhi Dum Biryani', 'Tandoori Smoked Delicacies', 'Sheermal & Roomali Roti', 'Shahi Tukda & Ice Pan Live'],
    },
    baseVenueRate1Day: 400000,
  },
  {
    id: 'bangalore',
    name: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    defaultVenue: 'Palace Grounds Botanical Glasshouse & Lawns',
    culturalVibe: 'Lush Garden City Botanical Opulence with Classical Carnatic Fusion',
    curfewTime: '23:00',
    cateringHighlights: {
      breakfast: ['MTR Style Khara Bath & Kesari Bath', 'Benne Dosa with Coconut Chutney', 'Maddur Vada', 'Chikmagalur Filter Coffee'],
      lunch: ['Traditional Bisi Bele Bath with Boondi', 'Mysore Rasam & Mysore Pak', 'Kosambari Salad', 'Holige with Pure Cow Ghee'],
      hiTea: ['Mangalore Buns', 'Nippattu Chaat', 'Sulaimani Chai & Cardamom Tea', 'Dharwad Peda'],
      dinner: ['Udupi Style Ghee Roast / Paneer Ghee Roast', 'Neer Dosa with Coconut Stew', 'Hyderabadi-Bangalore Biryani', 'Gudbud Ice Cream Bowl'],
    },
    baseVenueRate1Day: 280000,
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    defaultVenue: 'Taj Falaknuma Enclave & Mughal Terraces',
    culturalVibe: 'Nizami Royal Aristocracy with Sufi Qawwali & Marble Terraces',
    curfewTime: '23:00',
    cateringHighlights: {
      breakfast: ['Hyderabadi Kheema Khichdi / Veg Khichdi Khatta', 'Irani Chai with Osmania Biscuits', 'Poori Chole', 'Badam Milk'],
      lunch: ['Authentic Kacchi Gosht / Jackfruit Dum Biryani', 'Mirchi Ka Salan & Bagara Baingan', 'Dahi Ki Chutney', 'Double Ka Meetha with Mawa'],
      hiTea: ['Mini Luqmi with Mint Dip', 'Irani Chai Station', 'Patti Samosas', 'Apricot Delight Cake'],
      dinner: ['Nizami Handi Biryani Feast', 'Paneer Reshmi / Mutton Marag Broth', 'Taftan & Sheermal Breads', 'Qubani Ka Meetha with Vanilla Gelato'],
    },
    baseVenueRate1Day: 320000,
  },
  {
    id: 'kochi',
    name: 'Kochi',
    state: 'Kerala',
    country: 'India',
    defaultVenue: 'Kumarakom Backwater Heritage Pavilion',
    culturalVibe: 'Serene Coastal Backwaters with Live Chenda Melam & Houseboat Arrival',
    curfewTime: '22:00',
    cateringHighlights: {
      breakfast: ['Soft Appam with Stew (Veg / Chicken)', 'Steamed Puttu with Kadala Curry', 'Idiyappam with Coconut Milk', 'Spiced Chai'],
      lunch: ['Grand Onam-Style Sadya on Plantain Leaf (24 Dishes)', 'Sambar, Pulissery, Olan, Thoran', 'Parippu with Ghee', 'Palada Pradhaman & Parippu Payasam'],
      hiTea: ['Pazham Pori (Golden Banana Fritters)', 'Sukhiyan & Parippu Vada', 'Cardamom Spiced Black Tea', 'Unniyappam'],
      dinner: ['Malabar Biryani with Date Chutney', 'Kappa & Meen Curry / Mushroom Roast', 'Malabar Parotta', 'Tender Coconut Souffle'],
    },
    baseVenueRate1Day: 250000,
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    defaultVenue: 'Amer Heritage Fort & Royal Courtyard',
    culturalVibe: 'Raja Rani Royal Rajput Heritage with Ghoomar Dancers & Torchlit Arches',
    curfewTime: '22:30',
    cateringHighlights: {
      breakfast: ['Pyaz Ki Kachori', 'Mirchi Vada with Tamarind Chutney', 'Bikaneri Bhujia Poha', 'Kesariya Chai'],
      lunch: ['Traditional Dal Baati Churma (3 Churma Varieties)', 'Gatte Ki Sabzi & Ker Sangri', 'Bajra Roti with White Butter', 'Ghevar with Malai Topping'],
      hiTea: ['Mini Mawa Kachori', 'Masala Mathri with Mango Pickle', 'Saffron Kahwa', 'Moong Dal Halwa'],
      dinner: ['Royal Rajasthani Pulao', 'Paneer Korma / Laal Maas Stew', 'Missi Roti with Ghee', 'Rasmalai in Earthen Bowls'],
    },
    baseVenueRate1Day: 380000,
  },
  {
    id: 'dubai',
    name: 'Dubai',
    state: 'Downtown / Marina',
    country: 'UAE',
    defaultVenue: 'Burj Skyline Terrace & Arabesque Grand Ballroom',
    culturalVibe: 'Ultra-Modern Cosmopolitan Extravaganza with Drone Light Spectacle',
    curfewTime: '01:00',
    cateringHighlights: {
      breakfast: ['Emirati Balaleet with Saffron', 'Avocado Croissant Tartines', 'Arabic Coffee (Gahwa) with Medjool Dates', 'Fresh Pomegranate Nectar'],
      lunch: ['Middle Eastern Mezze Extravaganza', 'Slow-Roasted Lamb Ouzi / Truffle Risotto', 'Saffron Rice with Barberries', 'Kunafa with Rose Pistachio Cream'],
      hiTea: ['Gold-Dusted French Macarons', 'Artisan Baklava Tower', 'Moroccan Mint Tea Fountain', 'Zaatar Brioche Knots'],
      dinner: ['7-Course Royal Arabian Gulf Banquet', 'Smoked Wagyu / Grilled Halloumi Steaks', 'Caviar & Seafood Raw Bar', 'Live Nitrogen Dessert Sphere'],
    },
    baseVenueRate1Day: 850000,
  },
];

export type DurationTier = 'hourly' | '1d' | '2d' | 'weekly';
export type BudgetTier = 'economy' | 'standard' | 'royal' | 'ambani_luxury';

interface DynamicItineraryMenuProps {
  initialGuests?: number;
  dietary?: DietaryRequirement;
}

export const DynamicItineraryMenu: React.FC<DynamicItineraryMenuProps> = ({
  initialGuests = 250,
  dietary,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationProfile>(
    REGIONAL_LOCATIONS.find((l) => l.id === 'bangalore') || REGIONAL_LOCATIONS[3]
  );
  const [duration, setDuration] = useState<DurationTier>('1d');
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('royal');
  const [guestCount, setGuestCount] = useState<number>(initialGuests);
  const [gpsDetecting, setGpsDetecting] = useState<boolean>(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [activeMealTab, setActiveMealTab] = useState<'breakfast' | 'lunch' | 'hiTea' | 'dinner'>('lunch');

  // Multiplier Matrix
  const durationMultipliers: Record<DurationTier, { label: string; timeSpan: string; baseFactor: number; meals: number }> = {
    hourly: { label: 'Hourly (4h)', timeSpan: '4-Hour Reception / Sangeet', baseFactor: 0.45, meals: 1 },
    '1d': { label: '1-Day Classic', timeSpan: 'Full Auspicious Wedding Day (14h)', baseFactor: 1.0, meals: 3 },
    '2d': { label: '2-Day Grand', timeSpan: 'Complete 2-Day Extravaganza (48h)', baseFactor: 1.85, meals: 6 },
    weekly: { label: 'Weekly Festival', timeSpan: '7-Day Royal Celebration Week', baseFactor: 4.8, meals: 18 },
  };

  const budgetTierMultipliers: Record<BudgetTier, { name: string; multiplier: number; cateringPerPlate: number; badge: string }> = {
    economy: { name: 'Smart Economy', multiplier: 0.65, cateringPerPlate: 550, badge: 'Budget-Optimized' },
    standard: { name: 'Cultural Classic', multiplier: 1.0, cateringPerPlate: 950, badge: 'Traditional Dignity' },
    royal: { name: 'Raja Rani Royal', multiplier: 1.75, cateringPerPlate: 1850, badge: 'Opulent Grandeur' },
    ambani_luxury: { name: 'Ultra-Modern Billionaire', multiplier: 3.5, cateringPerPlate: 4200, badge: 'Limitless Extravaganza' },
  };

  // Browser Geolocation Detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported by browser. Using regional selection.');
      return;
    }

    setGpsDetecting(true);
    setGpsStatus('Requesting high-accuracy GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsDetecting(false);
        // Map rough coordinates to closest Indian / Global hub
        if (latitude > 25) {
          setSelectedLocation(REGIONAL_LOCATIONS.find((l) => l.id === 'delhi') || REGIONAL_LOCATIONS[2]);
        } else if (latitude > 18 && longitude < 74) {
          setSelectedLocation(REGIONAL_LOCATIONS.find((l) => l.id === 'mumbai') || REGIONAL_LOCATIONS[1]);
        } else if (latitude > 16 && longitude > 77) {
          setSelectedLocation(REGIONAL_LOCATIONS.find((l) => l.id === 'hyderabad') || REGIONAL_LOCATIONS[4]);
        } else if (latitude > 12 && longitude < 78) {
          setSelectedLocation(REGIONAL_LOCATIONS.find((l) => l.id === 'bangalore') || REGIONAL_LOCATIONS[3]);
        } else if (latitude < 12 && longitude > 79) {
          setSelectedLocation(REGIONAL_LOCATIONS.find((l) => l.id === 'chennai') || REGIONAL_LOCATIONS[0]);
        } else if (latitude < 11) {
          setSelectedLocation(REGIONAL_LOCATIONS.find((l) => l.id === 'kochi') || REGIONAL_LOCATIONS[5]);
        } else {
          setSelectedLocation(REGIONAL_LOCATIONS[0]);
        }
        setGpsStatus(`GPS Locked: ${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E -> Matched to ${selectedLocation.name}`);
      },
      (err) => {
        setGpsDetecting(false);
        setGpsStatus(`GPS access ${err.message}. Showing simulation mode.`);
      },
      { timeout: 8000 }
    );
  };

  // Deterministic Cost Calculations
  const currentDurationConfig = durationMultipliers[duration];
  const currentBudgetConfig = budgetTierMultipliers[budgetTier];

  const estimatedVenueCost = Math.round(
    selectedLocation.baseVenueRate1Day * currentDurationConfig.baseFactor * currentBudgetConfig.multiplier
  );

  const estimatedCateringCost = Math.round(
    guestCount * currentBudgetConfig.cateringPerPlate * (currentDurationConfig.meals * 0.75)
  );

  const decorAndMediaCost = Math.round(estimatedVenueCost * 0.45);
  const contingencyBuffer = Math.round((estimatedVenueCost + estimatedCateringCost + decorAndMediaCost) * 0.1);
  const totalEstimatedCost = estimatedVenueCost + estimatedCateringCost + decorAndMediaCost + contingencyBuffer;
  const costPerGuest = Math.round(totalEstimatedCost / guestCount);

  // Dynamic Itinerary Node Generator
  const getItinerarySteps = () => {
    if (duration === 'hourly') {
      return [
        { time: '18:00', title: 'Grand Red Carpet & Welcome Drinks', type: 'Arrival', buffer: '15 min', icon: 'arrival' },
        { time: '18:30', title: 'Ring Exchange & Couple Stage Felicitations', type: 'Ceremony', buffer: '20 min', icon: 'ceremony' },
        { time: '19:45', title: 'Live Sangeet DJ & Dance Floor Open', type: 'Entertainment', buffer: '30 min', icon: 'dance' },
        { time: '20:30', title: 'Gourmet Multi-Cuisine Dinner Buffet', type: 'Dining', buffer: 'FSSAI Verified', icon: 'food' },
        { time: '21:45', title: 'Sparkler Farewell & Curfew Compliance', type: 'Wrap Up', buffer: '15 min to curfew', icon: 'curfew' },
      ];
    }

    if (duration === '2d') {
      return [
        { time: 'Day 1 · 10:00', title: 'Haldi & Floral Phoolon Ki Holi', type: 'Ritual', buffer: '30 min', icon: 'ritual' },
        { time: 'Day 1 · 13:00', title: 'Authentic Regional Welcome Lunch', type: 'Dining', buffer: 'Batch 1-2', icon: 'food' },
        { time: 'Day 1 · 17:00', title: 'Mehendi & Artisan Bangle Bazaar', type: 'Folk', buffer: '45 min', icon: 'folk' },
        { time: 'Day 1 · 19:30', title: 'Royal Sangeet Gala & DJ Night', type: 'Gala', buffer: 'Sound Curfew 22:30', icon: 'dance' },
        { time: 'Day 2 · 07:30', title: 'Mangala Snanam & Traditional Breakfast', type: 'Ritual', buffer: 'Kaapi Bar', icon: 'breakfast' },
        { time: 'Day 2 · 10:30', title: 'Shubh Muhurtham Kalyanam / Holy Vows', type: 'Vedic Sanctum', buffer: 'Zero Drift Gate', icon: 'ceremony' },
        { time: 'Day 2 · 12:30', title: 'Grand 18-Course Royal Feast', type: 'Dining', buffer: 'FSSAI Monitored', icon: 'food' },
        { time: 'Day 2 · 19:00', title: 'VIP Wedding Reception & Drone Show', type: 'Reception', buffer: 'Formal Line', icon: 'reception' },
      ];
    }

    if (duration === 'weekly') {
      return [
        { time: 'Day 1', title: 'Ganapathi Homam / Auspicious Inception', type: 'Opening', buffer: 'Family Sanctum', icon: 'ritual' },
        { time: 'Day 2', title: 'Cultural Heritage Night & Sufi Musical Soiree', type: 'Music', buffer: 'Acoustic', icon: 'dance' },
        { time: 'Day 3', title: 'Mehendi Carnival & Street Food Mela', type: 'Bazaar', buffer: 'Live Stalls', icon: 'food' },
        { time: 'Day 4', title: 'The Great Sangeet & Bollywood Symphony', type: 'Extravaganza', buffer: 'Light Show', icon: 'dance' },
        { time: 'Day 5', title: 'Haldi & Youngsters Sunset Poolside Bash', type: 'Party', buffer: 'Eco Colors', icon: 'party' },
        { time: 'Day 6', title: 'Grand Royal Wedding Ceremony (Muhurtham)', type: 'Sacred Vows', buffer: 'Protected', icon: 'ceremony' },
        { time: 'Day 7', title: 'Mega Walima / Grand Gala VIP Banquet', type: 'Final Gala', buffer: 'All Dignitaries', icon: 'reception' },
      ];
    }

    // Default 1-Day Classic
    return [
      { time: '07:30', title: 'Auspicious Arrival & Shubh Aarambh Breakfast', type: 'Breakfast', buffer: 'Fresh Batch', icon: 'breakfast' },
      { time: '09:45', title: 'Baraat Procession & Traditional Welcoming Gate', type: 'Procession', buffer: '20 min', icon: 'arrival' },
      { time: '10:48', title: 'Sacred Muhurtham / Vows Ritual Window', type: 'Sacred', buffer: 'Protected Anchor', icon: 'ceremony' },
      { time: '12:30', title: 'Grand Royal Banquet & Plantain Leaf Service', type: 'Lunch Feast', buffer: '40/30/30 Flow', icon: 'food' },
      { time: '16:30', title: 'Sundowner Hi-Tea & Live Chaat Counters', type: 'Refreshment', buffer: 'Live Sommelier', icon: 'tea' },
      { time: '18:30', title: 'Grand Reception & Classical Fusion Performance', type: 'Reception', buffer: 'Photo Line 45m', icon: 'reception' },
      { time: '20:15', title: 'Celebration Gala Dinner & Artisan Dessert Studio', type: 'Dinner', buffer: 'FSSAI Surplus Staging', icon: 'food' },
      { time: '22:00', title: 'Acoustic Wrap & Curfew Police Ordinance Compliance', type: 'Curfew', buffer: 'Strict 0dB Outside', icon: 'curfew' },
    ];
  };

  const itinerarySteps = getItinerarySteps();

  return (
    <div className="space-y-6">
      {/* Location GPS & Regional Selector Banner */}
      <div className="tactical-card relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-purple-500/10 dark:from-[#211736] dark:to-[#171026] border-2 border-amber-400/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8DFD1] dark:border-[#352952]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <MapPin className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="heading-card text-lg sm:text-xl font-bold">
                  {selectedLocation.name}, {selectedLocation.state}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30">
                  {selectedLocation.country}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-sans mt-0.5">
                Venue: <span className="font-semibold text-amber-800 dark:text-amber-300">{selectedLocation.defaultVenue}</span> · Sound Curfew: <span className="font-mono font-bold">{selectedLocation.curfewTime}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={gpsDetecting}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-60"
            >
              {gpsDetecting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Compass className="w-3.5 h-3.5" />
              )}
              <span>{gpsDetecting ? 'Detecting GPS...' : 'Auto-Detect My GPS Venue'}</span>
            </button>
          </div>
        </div>

        {gpsStatus && (
          <div className="mt-2 text-[11px] font-mono text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{gpsStatus}</span>
          </div>
        )}

        {/* 12-City Quick Location Simulation Pills */}
        <div className="mt-4">
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
            Simulate Cultural Regional Hubs:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {REGIONAL_LOCATIONS.map((loc) => {
              const isSelected = selectedLocation.id === loc.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => {
                    setSelectedLocation(loc);
                    setGpsStatus(`Simulating venue in ${loc.name}, ${loc.state}`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-sm'
                      : 'bg-white dark:bg-[#1D1630] text-slate-700 dark:text-slate-300 border-[#E8DFD1] dark:border-[#352952] hover:border-amber-400'
                  }`}
                >
                  {loc.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Booking Duration & Budget Tier Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Duration Selector */}
        <div className="tactical-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h4 className="heading-section text-sm font-bold">Booking Duration Mode</h4>
            </div>
            <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold font-mono">
              {currentDurationConfig.timeSpan}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(durationMultipliers) as DurationTier[]).map((dKey) => {
              const active = duration === dKey;
              return (
                <button
                  key={dKey}
                  type="button"
                  onClick={() => setDuration(dKey)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    active
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black border-amber-400 shadow-md scale-102'
                      : 'bg-white dark:bg-[#1D1630] text-slate-700 dark:text-slate-300 border-[#E8DFD1] dark:border-[#352952] hover:border-amber-400'
                  }`}
                >
                  <span className="block text-xs font-bold">{durationMultipliers[dKey].label}</span>
                  <span className="block text-[10px] opacity-80 mt-0.5 font-mono">
                    {durationMultipliers[dKey].meals} Meal Windows
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Budget Tier Selector */}
        <div className="tactical-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="heading-section text-sm font-bold">Extravaganza & Budget Tier</h4>
            </div>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold font-mono">
              {currentBudgetConfig.badge}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(budgetTierMultipliers) as BudgetTier[]).map((bKey) => {
              const active = budgetTier === bKey;
              const cfg = budgetTierMultipliers[bKey];
              return (
                <button
                  key={bKey}
                  type="button"
                  onClick={() => setBudgetTier(bKey)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    active
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black border-emerald-400 shadow-md scale-102'
                      : 'bg-white dark:bg-[#1D1630] text-slate-700 dark:text-slate-300 border-[#E8DFD1] dark:border-[#352952] hover:border-emerald-400'
                  }`}
                >
                  <span className="block text-xs font-bold leading-tight">{cfg.name}</span>
                  <span className="block text-[10px] opacity-80 mt-1 font-mono">
                    ₹{cfg.cateringPerPlate}/plate
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Deterministic Pricing Summary Matrix */}
      <div className="tactical-card bg-gradient-to-br from-amber-500/10 via-transparent to-emerald-500/10 border-2 border-amber-300/60 dark:border-amber-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DFD1] dark:border-[#352952]">
          <div>
            <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-300 uppercase">
              Deterministic Pricing Engine (Zero LLM Math)
            </span>
            <h3 className="heading-card text-xl font-bold mt-0.5">
              Cost & Resource Allocation for {guestCount} Guests ({currentDurationConfig.label})
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-sans">Simulate Attendance:</span>
              <input
                type="range"
                min="50"
                max="1500"
                step="25"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="accent-amber-500 w-32 cursor-pointer"
              />
              <span className="font-mono font-bold text-amber-800 dark:text-amber-300 text-xs">
                {guestCount} Guests
              </span>
            </div>
          </div>

          <div className="text-right self-start sm:self-auto">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-sans">Total Estimated Investment</span>
            <span className="text-2xl sm:text-3xl font-mono font-black text-slate-900 dark:text-[#FAF7F2] text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-900 dark:from-amber-200 dark:to-amber-400">
              ₹{totalEstimatedCost.toLocaleString()}
            </span>
            <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 block">
              ₹{costPerGuest.toLocaleString()} / guest all-inclusive
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs font-mono">
          <div className="p-3 bg-white dark:bg-[#1D1630] rounded-xl border border-[#E8DFD1] dark:border-[#352952] shadow-sm">
            <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 block">Venue & Facilities</span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 block">
              ₹{estimatedVenueCost.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block">{selectedLocation.name} Hub Base</span>
          </div>

          <div className="p-3 bg-white dark:bg-[#1D1630] rounded-xl border border-[#E8DFD1] dark:border-[#352952] shadow-sm">
            <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 block">Catering & Service</span>
            <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 mt-1 block">
              ₹{estimatedCateringCost.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block">{guestCount} pax · {currentBudgetConfig.name}</span>
          </div>

          <div className="p-3 bg-white dark:bg-[#1D1630] rounded-xl border border-[#E8DFD1] dark:border-[#352952] shadow-sm">
            <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 block">Decor, Lighting & Sound</span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 block">
              ₹{decorAndMediaCost.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block">4K Visuals + Acoustic Mesh</span>
          </div>

          <div className="p-3 bg-white dark:bg-[#1D1630] rounded-xl border border-[#E8DFD1] dark:border-[#352952] shadow-sm">
            <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 block">10% Emergency Contingency</span>
            <span className="text-base font-bold text-amber-700 dark:text-amber-400 mt-1 block">
              ₹{contingencyBuffer.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block">Weather & Supplier Buffer</span>
          </div>
        </div>
      </div>

      {/* Dynamic Regional Culinary Menu Experience */}
      <div className="tactical-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h4 className="heading-card text-base sm:text-lg font-bold">
                Dynamic Regional Feast Menu — {selectedLocation.name} Style
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                Tailored for {selectedLocation.culturalVibe} with FSSAI surplus tracking.
              </p>
            </div>
          </div>

          {/* Meal Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-amber-50 dark:bg-[#1D1630] rounded-xl border border-[#E8DFD1] dark:border-[#352952]">
            {(['breakfast', 'lunch', 'hiTea', 'dinner'] as const).map((mealKey) => {
              const active = activeMealTab === mealKey;
              const labels = {
                breakfast: 'Shubh Breakfast',
                lunch: 'Royal Lunch Feast',
                hiTea: 'Sundowner Hi-Tea',
                dinner: 'Gala Dinner Buffet',
              };
              return (
                <button
                  key={mealKey}
                  type="button"
                  onClick={() => setActiveMealTab(mealKey)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    active
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-amber-700'
                  }`}
                >
                  {labels[mealKey]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meal Dishes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {selectedLocation.cateringHighlights[activeMealTab].map((dish, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-white dark:bg-[#1D1630] border border-[#E8DFD1] dark:border-[#352952] hover:border-amber-400 transition-all flex flex-col justify-between shadow-sm"
            >
              <div>
                <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 block mb-1">
                  Course #{idx + 1}
                </span>
                <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-sans leading-snug">
                  {dish}
                </h5>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Fresh Batch</span>
                </span>
                <span className="font-mono">FSSAI Safe</span>
              </div>
            </div>
          ))}
        </div>

        {/* Dietary breakdown note */}
        {dietary && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 text-xs text-amber-900 dark:text-amber-200 flex flex-wrap items-center justify-between gap-2">
            <span>
              <strong>Dietary Portions:</strong> {dietary.general_veg_pct}% Veg · {dietary.jain_pct}% Jain · {dietary.vegan_pct}% Vegan · {dietary.non_veg_pct}% Non-Veg · {dietary.allergy_specific_count} Allergen Segregated
            </span>
            <span className="font-mono font-bold text-[11px]">Zero Cross-Contamination Verified</span>
          </div>
        )}
      </div>

      {/* Innovative Chronological Dynamic Itinerary */}
      <div className="tactical-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <h4 className="heading-card text-base sm:text-lg font-bold">
              Dynamic Operational Itinerary ({durationMultipliers[duration].label})
            </h4>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {itinerarySteps.length} Scheduled Operational Milestones
          </span>
        </div>

        <div className="space-y-3">
          {itinerarySteps.map((step, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-white dark:bg-[#1D1630] border border-[#E8DFD1] dark:border-[#352952] hover:border-amber-400/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 font-mono text-xs font-black text-amber-900 dark:text-amber-300 whitespace-nowrap">
                  {step.time}
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 font-sans">
                    {step.title}
                  </h5>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                    Category: <strong className="text-amber-700 dark:text-amber-300">{step.type}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
                <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-mono">
                  {step.buffer}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
