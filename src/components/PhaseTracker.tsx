import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { loadPhases, type Group } from "@/lib/phases";
import { cn } from "@/lib/utils";
import { useState } from "react";
import PhaseDetailDialog from "./PhaseDetailDialog";
import PhaseIcon from "./PhaseIcon";

interface PhaseTrackerProps {
  group: Group;
}

export default function PhaseTracker({ group }: PhaseTrackerProps) {
  const [phases] = useState(() => loadPhases());
  const completed = group.completedPhases.filter(Boolean).length;
  const progress = (completed / phases.length) * 100;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<{ phase: any, index: number } | null>(null);

  const openPhaseDetails = (phase: any, index: number) => {
    setSelectedPhase({ phase, index });
    setDialogOpen(true);
  };

  return (
    <div className="materio-card rounded-xl p-6 transition-all hover:-translate-y-1">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 min-w-0 mr-4">
          <Link to={`/grupo/${group.id}`} className="hover:text-brand-500 transition-colors">
            <h3 className="text-xl font-bold text-foreground truncate tracking-tight">{group.name}</h3>
          </Link>
          {group.members && group.members.length > 0 && (
            <p className="text-xs text-muted-foreground truncate mt-1 italic font-medium">
              {group.members.join(", ")}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-lg font-bold text-brand-500">
              {completed}/{phases.length}
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">etapas concluídas</p>
        </div>
      </div>

      <div className="relative h-2 rounded-full bg-secondary overflow-hidden mb-8">
        <motion.div
          className="absolute inset-y-0 left-0 bg-brand-500 rounded-full shadow-materio-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      <div className="flex justify-between items-center relative px-1">
        {phases.map((phase, i) => {
          const isDone = group.completedPhases[i];
          const isCurrent = !isDone && (i === 0 || group.completedPhases[i - 1]);

          return (
            <div key={phase.id} className="flex flex-col items-center group relative">
              <button
                onClick={() => openPhaseDetails(phase, i)}
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 relative z-10",
                  isDone 
                    ? "bg-brand-500 text-white shadow-materio-primary" 
                    : isCurrent 
                      ? "bg-accent border-2 border-brand-500 text-brand-500" 
                      : "bg-secondary text-muted-foreground hover:bg-brand-500/10 hover:text-brand-500"
                )}
              >
                <PhaseIcon icon={phase.icon} className="w-5 h-5" />
                
                {isCurrent && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                  </span>
                )}
              </button>
              
              <Link 
                to={`/fase/${phase.id}`}
                className={cn(
                  "mt-3 text-[10px] font-bold uppercase tracking-wider transition-colors max-w-[64px] text-center leading-tight",
                  isDone ? "text-brand-500" : isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {phase.title}
              </Link>
            </div>
          );
        })}
      </div>

      <PhaseDetailDialog
        phase={selectedPhase?.phase || null}
        phaseIndex={selectedPhase?.index ?? 0}
        completed={selectedPhase ? (group.completedPhases[selectedPhase.index] ?? false) : false}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
