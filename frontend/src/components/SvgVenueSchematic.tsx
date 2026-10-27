import React from 'react';
import { ShieldCheck, MapPin } from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext';

interface SvgVenueSchematicProps {
  expectedGuests: number;
  actualCheckedIn: number;
  maxCapacity: number;
}

export const SvgVenueSchematic: React.FC<SvgVenueSchematicProps> = ({
  expectedGuests,
  actualCheckedIn,
  maxCapacity,
}) => {
  const { t } = useTranslation();
  const occupancyPct = Math.min(100, Math.round((actualCheckedIn / maxCapacity) * 100));

  return (
    <div className="tactical-card space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h3 className="heading-section text-slate-900 dark:text-slate-100">
            {t.schematic.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">{t.schematic.liveDensity}</span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-bold ${
              occupancyPct > 90
                ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                : occupancyPct > 70
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            {occupancyPct}% {t.schematic.occupancy} ({actualCheckedIn} / {maxCapacity})
          </span>
        </div>
      </div>

      {/* Procedural SVG Floorplan */}
      <div className="w-full bg-[#FDFBF7] dark:bg-[#1D1630] rounded-xl border border-[#E8DFD1] dark:border-[#352952] p-4 overflow-hidden shadow-inner">
        <svg
          viewBox="0 0 800 360"
          className="w-full h-auto max-h-72 select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Hall Boundary */}
          <rect x="20" y="20" width="760" height="320" rx="12" fill="currentColor" className="text-white dark:text-[#140F22] stroke-amber-200/80 dark:stroke-amber-900/60" strokeWidth="2" />

          {/* Stage / Dais */}
          <rect x="260" y="30" width="280" height="50" rx="8" fill="#D4AF37" className="dark:fill-[#997A15]" />
          <text x="400" y="60" textAnchor="middle" fill="#0C0814" fontSize="13" fontWeight="bold" fontFamily="Cinzel, serif">
            {t.schematic.stage}
          </text>

          {/* Main Guest Seating Zone */}
          <rect x="220" y="100" width="360" height="130" rx="8" fill="#FAF7F2" className="dark:fill-[#1D1630]" stroke="#D4AF37" strokeDasharray="4 4" />
          <text x="400" y="145" textAnchor="middle" fill="#78350F" className="dark:fill-amber-200" fontSize="12" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
            {t.schematic.audience}
          </text>
          <text x="400" y="170" textAnchor="middle" fill="#92400E" className="dark:fill-amber-400" fontSize="11" fontFamily="JetBrains Mono, monospace">
            Seating: {expectedGuests} Seats | Checked-In: {actualCheckedIn}
          </text>
          <rect x="250" y="190" width="300" height="10" rx="5" fill="#E8DFD1" className="dark:fill-slate-700" />
          <rect
            x="250"
            y="190"
            width={Math.min(300, Math.round(300 * (actualCheckedIn / Math.max(1, expectedGuests))))}
            height="10"
            rx="5"
            fill="#D4AF37"
          />

          {/* Quiet Elders Lounge */}
          <rect x="40" y="100" width="160" height="130" rx="8" fill="#FDF2F8" stroke="#FBCFE8" className="dark:fill-[#2A1124] dark:stroke-pink-900/60" />
          <text x="120" y="145" textAnchor="middle" fill="#9D174D" className="dark:fill-pink-300" fontSize="11" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
            {t.schematic.elders}
          </text>
          <text x="120" y="165" textAnchor="middle" fill="#BE185D" className="dark:fill-pink-400" fontSize="10" fontFamily="Plus Jakarta Sans, sans-serif">
            Wheelchair Dais Access
          </text>
          <text x="120" y="185" textAnchor="middle" fill="#BE185D" className="dark:fill-pink-400" fontSize="10" fontFamily="Plus Jakarta Sans, sans-serif">
            Low-Decibel Quiet Zone
          </text>

          {/* Kids Activity Zone */}
          <rect x="600" y="100" width="160" height="130" rx="8" fill="#FEF3C7" stroke="#FDE68A" className="dark:fill-[#2D2214] dark:stroke-amber-800" />
          <text x="680" y="145" textAnchor="middle" fill="#92400E" className="dark:fill-amber-300" fontSize="11" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
            {t.schematic.kids}
          </text>
          <text x="680" y="165" textAnchor="middle" fill="#B45309" className="dark:fill-amber-400" fontSize="10" fontFamily="Plus Jakarta Sans, sans-serif">
            Crafts & Board Games
          </text>
          <text x="680" y="185" textAnchor="middle" fill="#B45309" className="dark:fill-amber-400" fontSize="10" fontFamily="Plus Jakarta Sans, sans-serif">
            Child-Safe Floor Mats
          </text>

          {/* Dining / Catering Hall */}
          <rect x="40" y="250" width="720" height="70" rx="8" fill="#F0FDF4" stroke="#BBF7D0" className="dark:fill-[#0E241B] dark:stroke-emerald-800" />
          <text x="400" y="280" textAnchor="middle" fill="#166534" className="dark:fill-emerald-300" fontSize="12" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
            {t.schematic.dining}
          </text>
          <text x="400" y="302" textAnchor="middle" fill="#15803D" className="dark:fill-emerald-400" fontSize="10" fontFamily="Plus Jakarta Sans, sans-serif">
            Buffet Lines A & B | Live Millet & Chaat Counters | FSSAI Chilled Holding Bay
          </text>

          {/* Emergency Egress Gates */}
          <g>
            <rect x="25" y="150" width="10" height="40" rx="2" fill="#E11D48" />
            <text x="10" y="140" fill="#E11D48" fontSize="9" fontWeight="bold" fontFamily="JetBrains Mono, monospace">EXIT 1</text>
            <rect x="765" y="150" width="10" height="40" rx="2" fill="#E11D48" />
            <text x="755" y="140" fill="#E11D48" fontSize="9" fontWeight="bold" fontFamily="JetBrains Mono, monospace">EXIT 2</text>
          </g>
        </svg>
      </div>

      {/* Mandatory Statutory Label */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <ShieldCheck className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
        <span className="italic">
          "{t.schematic.disclaimer}"
        </span>
      </div>
    </div>
  );
};
