import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { loadPhases, type Group } from "@/lib/phases";
import { cn } from "@/lib/utils";
import { useState } from "react";
import PhaseIcon from "./PhaseIcon";

interface PhaseTrackerCondensedProps {
  group: Group;
  rank?: number;
}

export default function PhaseTrackerCondensed({ group, rank }: PhaseTrackerCondensedProps) {
  const [phases] = useState(() => loadPhases());
  
  const completedCount = group.completedPhases.filter(Boolean).length;
  const pct = phases.length > 0 ? (completedCount / phases.length) * 100 : 0;
  
  const currentPhaseIndex = Math.min(completedCount, phases.length - 1);
  const currentPhase = phases[currentPhaseIndex];
  const isAllCompleted = completedCount === phases.length;

  return (
    <div className="glass-card rounded-xl p-4 flex items-center gap-5 transition-all hover:border-brand-500/30 hover:bg-secondary/10 group">
      {/* Rank Badge */}
      {rank !== undefined && (
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-lg text-sm transition-transform group-hover:scale-110",
          rank === 1 ? "bg-brand-500 brand-glow" : 
          rank === 2 ? "bg-zinc-500" : 
          rank === 3 ? "bg-zinc-700" : "bg-secondary border border-border text-muted-foreground"
        )}>
          {rank}
        </div>
      )}

      {/* Group Info & Progress */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1 min-w-0 mr-4">
            <Link to={`/grupo/${group.id}`} className="hover:text-brand-500 transition-colors block">
              <h3 className="text-base font-bold text-foreground inline mr-2">{group.name}</h3>
              {group.members && group.members.length > 0 && (
                <span className="text-[10px] text-muted-foreground italic truncate">
                  ({group.members.join(", ")})
                </span>
              )}
            </Link>
          </div>
          <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest whitespace-nowrap">
            {completedCount}/{phases.length} ETAPAS
          </span>
        </div>

        {/* Condensed Progress Bar */}
        <div className="relative h-1.5 rounded-full bg-secondary overflow-hidden flex mb-2 border border-border">
          {phases.map((_, i) => {
            const isDone = group.completedPhases[i];
            return (
              <div 
                key={i} 
                className={cn(
                  "flex-1 border-r border-black/5 dark:border-black/20 last:border-none transition-all duration-500",
                  isDone ? "bg-brand-500" : "bg-secondary"
                )}
              />
            );
          })}
        </div>

        {/* Current Phase Legend */}
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1 rounded-md",
            isAllCompleted ? "bg-brand-500/20" : "bg-secondary border border-border"
          )}>
            <PhaseIcon 
              icon={isAllCompleted ? "Trophy" : currentPhase.icon} 
              className={cn(
                "w-3 h-3",
                isAllCompleted ? "text-brand-500" : "text-muted-foreground"
              )} 
            />
          </div>
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider",
            isAllCompleted ? "text-brand-500" : "text-muted-foreground"
          )}>
            {isAllCompleted ? "Projeto Concluído!" : `Etapa Atual: ${currentPhase.title}`}
          </span>
        </div>
      </div>

      {/* Percentage Circle */}
      <div className="flex flex-col items-center justify-center px-4 border-l border-border h-12">
        <span className="text-lg font-black text-brand-500 leading-none">{Math.round(pct)}%</span>
        <span className="text-[8px] font-black text-muted-foreground uppercase mt-1 tracking-tighter">Progresso</span>
      </div>
    </div>
  );
}
