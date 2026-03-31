import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { loadPhases, type Group, type Phase } from "@/lib/phases";
import PhaseIcon from "./PhaseIcon";
import PhaseDetailDialog from "./PhaseDetailDialog";
import { cn } from "@/lib/utils";

const phaseColors = [
  "bg-phase-1", "bg-phase-2", "bg-phase-3", "bg-phase-4", "bg-phase-5",
];
const phaseBorders = [
  "border-phase-1", "border-phase-2", "border-phase-3", "border-phase-4", "border-phase-5",
];

interface PhaseTrackerProps {
  group: Group;
}

export default function PhaseTracker({ group }: PhaseTrackerProps) {
  const [phases, setPhases] = useState<Phase[]>(loadPhases());
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setPhases(loadPhases()), 2000);
    return () => clearInterval(interval);
  }, []);

  const completed = group.completedPhases.filter(Boolean).length;
  const pct = phases.length > 0 ? (completed / phases.length) * 100 : 0;

  const openDetail = (phase: Phase, index: number) => {
    setSelectedPhase(phase);
    setSelectedIndex(index);
    setDialogOpen(true);
  };

  return (
    <div className="rounded-xl bg-card p-5 shadow-md border border-border">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 mr-2">
          <Link to={`/grupo/${group.id}`} className="hover:underline">
            <h3 className="font-display text-xl font-bold text-foreground truncate">{group.name}</h3>
          </Link>
          {group.members && group.members.length > 0 && (
            <p className="text-[10px] text-muted-foreground truncate italic">
              {group.members.join(", ")}
            </p>
          )}
        </div>
        <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
          {completed}/{phases.length} fases
        </span>
      </div>

      <div className="relative h-3 rounded-full bg-muted overflow-hidden mb-6">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: "var(--gradient-phase)" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      <div className="flex items-start justify-between gap-1">
        {phases.map((phase, i) => {
          const done = group.completedPhases[i] ?? false;
          return (
            <div
              key={phase.id}
              className="flex flex-col items-center flex-1 min-w-0"
            >
              <motion.div
                className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-colors cursor-pointer hover:scale-110",
                  done
                    ? `${phaseColors[i % phaseColors.length]} border-transparent text-primary-foreground`
                    : `bg-muted ${phaseBorders[i % phaseBorders.length]} text-muted-foreground`
                )}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => openDetail(phase, i)}
              >
                <PhaseIcon icon={phase.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.div>
              <Link
                to={`/fase/${phase.id}`}
                className="mt-2 text-[10px] sm:text-xs font-semibold text-center leading-tight text-foreground hover:text-primary hover:underline transition-colors"
              >
                {phase.title}
              </Link>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground text-center leading-tight hidden sm:block">
                {phase.stage}
              </span>
            </div>
          );
        })}
      </div>

      <Link
        to={`/grupo/${group.id}`}
        className="block text-center text-xs font-semibold text-primary mt-4 hover:underline"
      >
        Ver página da equipe →
      </Link>

      <PhaseDetailDialog
        phase={selectedPhase}
        phaseIndex={selectedIndex}
        completed={selectedPhase ? (group.completedPhases[selectedIndex] ?? false) : false}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
