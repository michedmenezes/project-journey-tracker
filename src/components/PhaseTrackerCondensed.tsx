import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { loadPhases, type Group } from "@/lib/phases";
import { cn } from "@/lib/utils";
import { useState } from "react";

const phaseColors = [
  "bg-phase-1", "bg-phase-2", "bg-phase-3", "bg-phase-4", "bg-phase-5",
];

interface PhaseTrackerCondensedProps {
  group: Group;
  rank?: number;
}

export default function PhaseTrackerCondensed({ group, rank }: PhaseTrackerCondensedProps) {
  const [phases] = useState(() => loadPhases());
  
  const completedCount = group.completedPhases.filter(Boolean).length;
  const pct = phases.length > 0 ? (completedCount / phases.length) * 100 : 0;

  return (
    <div className="rounded-xl bg-card p-3 shadow-sm border border-border flex items-center gap-4 hover:shadow-md transition-shadow">
      {/* Rank Badge (if provided) */}
      {rank !== undefined && (
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-sm",
          rank === 1 ? "bg-yellow-500" : 
          rank === 2 ? "bg-slate-400" : 
          rank === 3 ? "bg-amber-600" : "bg-muted-foreground"
        )}>
          {rank}
        </div>
      )}

      {/* Group Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <Link to={`/grupo/${group.id}`} className="hover:underline truncate mr-2">
            <h3 className="font-display text-sm font-bold text-foreground">{group.name}</h3>
          </Link>
          <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
            {completedCount}/{phases.length} FASES
          </span>
        </div>

        {/* Condensed Progress Bar with Steps */}
        <div className="relative h-2 rounded-full bg-muted overflow-hidden flex">
          {phases.map((_, i) => {
            const isDone = group.completedPhases[i];
            return (
              <div 
                key={i} 
                className={cn(
                  "flex-1 border-r border-background last:border-none transition-colors duration-500",
                  isDone ? phaseColors[i % phaseColors.length] : "bg-muted"
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Percentage Circle (Optional/Small) */}
      <div className="hidden sm:flex flex-col items-center justify-center px-2 border-l border-border">
        <span className="text-xs font-black text-primary">{Math.round(pct)}%</span>
      </div>
    </div>
  );
}
