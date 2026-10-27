import React from 'react';
import { ShieldCheck, MapPin } from 'lucide-react';

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
  const occupancyPct = Math.min(100, Math.round((actualCheckedIn / maxCapacity) * 100));

  return (
    <div className="tactical-card space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <h3 className="heading-section text-slate-900 dark:text-slate-100">
            Venue Spatial Zone & Capacity Schematic
          </h3>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">Live Density:</span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-bold ${
              occupancyPct > 90
                ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                : occupancyPct > 70
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            {occupancyPct}% Occupancy ({actualCheckedIn} / {maxCapacity})
          </span>
        </div>
      </div>

      {/* Procedural SVG Floorplan */}
      <div className="w-full bg-slate-50 dark:bg-tactical-darkCard rounded-xl border border-slate-200 dark:border-tactical-darkBorder p-4 overflow-hidden">
        <svg
          viewBox="0 0 800 360"
          className="w-full h-auto max-h-72 select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Hall Boundary */}
          <rect x="20" y="20" width="760" height="320" rx="12" fill="currentColor" className="text-white dark:text-[#10192E] stroke-slate-300 dark:stroke-slate-700" strokeWidth="2" />

          {/* Stage / Dais */}
          <rect x="260" y="30" width="280" height="50" rx="8" fill="#0B1326" className="dark:fill-[#080E1A]" />
          <text x="400" y="60" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold" fontFamily="Inter, sans-serif">
            MAIN DAIS / AUSPICIOUS STAGE
          </text>

          {/* Main Guest Seating Zone */}
          <rect x="220" y="100" width="360" height="130" rx="8" fill="#F8FAFC" className="dark:fill-[#17223B]" stroke="#94A3B8" strokeDasharray="4 4" />
          <text x="400" y="145" textAnchor="middle" fill="#334155" className="dark:fill-slate-200" fontSize="12" fontWeight="bold" fontFamily="Inter, sans-serif">
            CENTRAL AUDIENCE CLUSTERS
          </text>
          <text x="400" y="170" textAnchor="middle" fill="#64748B" className="dark:fill-slate-400" fontSize="11" fontFamily="JetBrains Mono, monospace">
            Seating: {expectedGuests} Seats | Checked-In: {actualCheckedIn}
          </text>
          <rect x="250" y="190" width="300" height="10" rx="5" fill="#E2E8F0" className="dark:fill-slate-700" />
          <rect
            x="250"
            y="190"
            width={Math.min(300, Math.round(300 * (actualCheckedIn / Math.max(1, expectedGuests))))}
            height="10"
            rx="5"
            fill="#06B6D4"
          />

          {/* Quiet Elders Lounge */}
          <rect x="40" y="100" width="160" height="130" rx="8" fill="#EFF6FF" stroke="#BFDBFE" className="dark:fill-[#132240] dark:stroke-blue-800" />
          <text x="120" y="145" textAnchor="middle" fill="#1E40AF" className="dark:fill-blue-300" fontSize="11" fontWeight="bold" fontFamily="Inter, sans-serif">
            ELDERS LOUNGE
          </text>
          <text x="120" y="165" textAnchor="middle" fill="#3B82F6" className="dark:fill-blue-400" fontSize="10" fontFamily="Inter, sans-serif">
            Wheelchair Dais Access
          </text>
          <text x="120" y="185" textAnchor="middle" fill="#3B82F6" className="dark:fill-blue-400" fontSize="10" fontFamily="Inter, sans-serif">
            Low-Decibel Quiet Zone
          </text>

          {/* Kids Activity Zone */}
          <rect x="600" y="100" width="160" height="130" rx="8" fill="#FEF3C7" stroke="#FDE68A" className="dark:fill-[#2D2214] dark:stroke-amber-800" />
          <text x="680" y="145" textAnchor="middle" fill="#92400E" className="dark:fill-amber-300" fontSize="11" fontWeight="bold" fontFamily="Inter, sans-serif">
            KIDS ACTIVITY ENCLAVE
          </text>
          <text x="680" y="165" textAnchor="middle" fill="#B45309" className="dark:fill-amber-400" fontSize="10" fontFamily="Inter, sans-serif">
            Crafts & Board Games
          </text>
          <text x="680" y="185" textAnchor="middle" fill="#B45309" className="dark:fill-amber-400" fontSize="10" fontFamily="Inter, sans-serif">
            Child-Safe Floor Mats
          </text>

          {/* Dining / Catering Hall */}
          <rect x="40" y="250" width="720" height="70" rx="8" fill="#F0FDF4" stroke="#BBF7D0" className="dark:fill-[#0E241B] dark:stroke-emerald-800" />
          <text x="400" y="280" textAnchor="middle" fill="#166534" className="dark:fill-emerald-300" fontSize="12" fontWeight="bold" fontFamily="Inter, sans-serif">
            DINING & BANQUET HALL (40/30/30 BATCH COOKING)
          </text>
          <text x="400" y="302" textAnchor="middle" fill="#15803D" className="dark:fill-emerald-400" fontSize="10" fontFamily="Inter, sans-serif">
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
          "Operational schematic — not an approved safety or evacuation plan."
        </span>
      </div>
    </div>
  );
};
