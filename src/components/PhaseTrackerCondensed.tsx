import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { loadPhases, type Group } from "@/lib/phases";
import { cn } from "@/lib/utils";
import { useState } from "react";
import PhaseIcon from "./PhaseIcon";

const phaseColors = [
  "bg-phase-1", "bg-phase-2", "bg-phase-3", "bg-phase-4", "bg-phase-5",
];

const phaseTextColors = [
  "text-phase-1", "text-phase-2", "text-phase-3", "text-phase-4", "text-phase-5",
];

interface PhaseTrackerCondensedProps {
  group: Group;
  rank?: number;
}

export default function PhaseTrackerCondensed({ group, rank }: PhaseTrackerCondensedProps) {
  const [phases] = useState(() => loadPhases());
  
  const completedCount = group.completedPhases.filter(Boolean).length;
  const pct = phases.length > 0 ? (completedCount / phases.length) * 100 : 0;
  
  // Encontrar a fase atual (a primeira não concluída ou a última concluída se tudo estiver pronto)
  const currentPhaseIndex = Math.min(completedCount, phases.length - 1);
  const currentPhase = phases[currentPhaseIndex];
  const isAllCompleted = completedCount === phases.length;

  return (
    <div className="rounded-xl bg-card p-3 shadow-sm border border-border flex items-center gap-3 hover:shadow-md transition-shadow">
      {/* Rank Badge */}
      {rank !== undefined && (
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-sm text-xs",
          rank === 1 ? "bg-yellow-500" : 
          rank === 2 ? "bg-slate-400" : 
          rank === 3 ? "bg-amber-600" : "bg-muted-foreground"
        )}>
          {rank}
        </div>
      )}

      {/* Group Info & Progress */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex-1 min-w-0 mr-2">
            <Link to={`/grupo/${group.id}`} className="hover:underline truncate block">
              <h3 className="font-display text-sm font-bold text-foreground inline mr-2">{group.name}</h3>
              {group.members && group.members.length > 0 && (
                <span className="text-[9px] text-muted-foreground italic truncate">
                  ({group.members.join(", ")})
                </span>
              )}
            </Link>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap uppercase tracking-tighter">
            {completedCount}/{phases.length} FASES
          </span>
        </div>

        {/* Condensed Progress Bar with Steps */}
        <div className="relative h-1.5 rounded-full bg-muted overflow-hidden flex mb-1">
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

        {/* Current Phase Legend */}
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "p-0.5 rounded-sm",
            isAllCompleted ? "bg-primary/10" : "bg-muted"
          )}>
            <PhaseIcon 
              icon={isAllCompleted ? "Trophy" : currentPhase.icon} 
              className={cn(
                "w-2.5 h-2.5",
                isAllCompleted ? "text-primary" : phaseTextColors[currentPhaseIndex % phaseTextColors.length]
              )} 
            />
          </div>
          <span className={cn(
            "text-[9px] font-bold uppercase tracking-wider",
            isAllCompleted ? "text-primary" : "text-muted-foreground"
          )}>
            {isAllCompleted ? "Projeto Concluído!" : `Etapa Atual: ${currentPhase.title}`}
          </span>
        </div>
      </div>

      {/* Percentage Circle */}
      <div className="flex flex-col items-center justify-center px-2 border-l border-border h-10">
        <span className="text-xs font-black text-primary leading-none">{Math.round(pct)}%</span>
        <span className="text-[8px] font-bold text-muted-foreground uppercase mt-1">Progresso</span>
      </div>
    </div>
  );
}
