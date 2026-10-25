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
    <div className="bg-white rounded-2xl p-6 border border-festiva-border shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Venue Spatial Zone & Capacity Schematic
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Live Density:</span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-bold ${
              occupancyPct > 90
                ? 'bg-red-100 text-red-800'
                : occupancyPct > 70
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {occupancyPct}% Occupancy ({actualCheckedIn} / {maxCapacity})
          </span>
        </div>
      </div>

      {/* Procedural SVG Floorplan */}
      <div className="w-full bg-[#FAF8F5] rounded-xl border border-festiva-border p-4 overflow-hidden">
        <svg
          viewBox="0 0 800 360"
          className="w-full h-auto max-h-72 select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Hall Boundary */}
          <rect x="20" y="20" width="760" height="320" rx="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />

          {/* Stage / Dais */}
          <rect x="260" y="30" width="280" height="50" rx="8" fill="#1E1B4B" />
          <text x="400" y="60" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold">
            MAIN DAIS / AUSPICIOUS STAGE
          </text>

          {/* Main Guest Seating Zone */}
          <rect x="220" y="100" width="360" height="130" rx="8" fill="#F8FAFC" stroke="#94A3B8" strokeDasharray="4 4" />
          <text x="400" y="145" textAnchor="middle" fill="#334155" fontSize="12" fontWeight="bold">
            CENTRAL AUDIENCE CLUSTERS
          </text>
          <text x="400" y="170" textAnchor="middle" fill="#64748B" fontSize="11">
            Seating: {expectedGuests} Seats | Checked-In: {actualCheckedIn}
          </text>
          <rect x="250" y="190" width="300" height="10" rx="5" fill="#E2E8F0" />
          <rect
            x="250"
            y="190"
            width={Math.min(300, Math.round(300 * (actualCheckedIn / Math.max(1, expectedGuests))))}
            height="10"
            rx="5"
            fill="#0D9488"
          />

          {/* Quiet Elders Lounge */}
          <rect x="40" y="100" width="160" height="130" rx="8" fill="#EFF6FF" stroke="#BFDBFE" />
          <text x="120" y="145" textAnchor="middle" fill="#1E40AF" fontSize="11" fontWeight="bold">
            ELDERS LOUNGE
          </text>
          <text x="120" y="165" textAnchor="middle" fill="#3B82F6" fontSize="10">
            Wheelchair Dais Access
          </text>
          <text x="120" y="185" textAnchor="middle" fill="#3B82F6" fontSize="10">
            Low-Decibel Quiet Zone
          </text>

          {/* Kids Activity Zone */}
          <rect x="600" y="100" width="160" height="130" rx="8" fill="#FEF3C7" stroke="#FDE68A" />
          <text x="680" y="145" textAnchor="middle" fill="#92400E" fontSize="11" fontWeight="bold">
            KIDS ACTIVITY ENCLAVE
          </text>
          <text x="680" y="165" textAnchor="middle" fill="#B45309" fontSize="10">
            Crafts & Board Games
          </text>
          <text x="680" y="185" textAnchor="middle" fill="#B45309" fontSize="10">
            Child-Safe Floor Mats
          </text>

          {/* Dining / Catering Hall */}
          <rect x="40" y="250" width="720" height="70" rx="8" fill="#F0FDF4" stroke="#BBF7D0" />
          <text x="400" y="280" textAnchor="middle" fill="#166534" fontSize="12" fontWeight="bold">
            DINING & BANQUET HALL (40/30/30 BATCH COOKING)
          </text>
          <text x="400" y="302" textAnchor="middle" fill="#15803D" fontSize="10">
            Buffet Lines A & B | Live Millet & Chaat Counters | FSSAI Chilled Holding Bay
          </text>

          {/* Emergency Egress Gates */}
          <g>
            <rect x="25" y="150" width="10" height="40" rx="2" fill="#E11D48" />
            <text x="10" y="140" fill="#E11D48" fontSize="9" fontWeight="bold">EXIT 1</text>
            <rect x="765" y="150" width="10" height="40" rx="2" fill="#E11D48" />
            <text x="755" y="140" fill="#E11D48" fontSize="9" fontWeight="bold">EXIT 2</text>
          </g>
        </svg>
      </div>

      {/* Mandatory Statutory Label (Required by PDF specification) */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <ShieldCheck className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span className="italic">
          "Operational schematic — not an approved safety or evacuation plan."
        </span>
      </div>
    </div>
  );
};
