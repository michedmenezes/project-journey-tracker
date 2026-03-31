import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PHASES, type Group } from "@/lib/phases";
import PhaseIcon from "./PhaseIcon";
import PhaseDetailDialog from "./PhaseDetailDialog";
import { cn } from "@/lib/utils";
import type { Phase } from "@/lib/phases";

const phaseColors = [
  "bg-phase-1",
  "bg-phase-2",
  "bg-phase-3",
  "bg-phase-4",
  "bg-phase-5",
];

const phaseBorders = [
  "border-phase-1",
  "border-phase-2",
  "border-phase-3",
  "border-phase-4",
  "border-phase-5",
];

interface PhaseTrackerProps {
  group: Group;
}

export default function PhaseTracker({ group }: PhaseTrackerProps) {
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const completed = group.completedPhases.filter(Boolean).length;
  const pct = (completed / PHASES.length) * 100;

  const openDetail = (phase: Phase, index: number) => {
    setSelectedPhase(phase);
    setSelectedIndex(index);
    setDialogOpen(true);
  };

  return (
    <div className="rounded-xl bg-card p-5 shadow-md border border-border">
      <div className="flex items-center justify-between mb-4">
        <Link to={`/grupo/${group.id}`} className="hover:underline">
          <h3 className="font-display text-xl font-bold text-foreground">{group.name}</h3>
        </Link>
        <span className="text-sm font-semibold text-muted-foreground">
          {completed}/{PHASES.length} fases
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 rounded-full bg-muted overflow-hidden mb-6">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: "var(--gradient-phase)" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* Phase nodes */}
      <div className="flex items-start justify-between gap-1">
        {PHASES.map((phase, i) => {
          const done = group.completedPhases[i];
          return (
            <div
              key={phase.id}
              className="flex flex-col items-center flex-1 min-w-0 cursor-pointer"
              onClick={() => openDetail(phase, i)}
            >
              <motion.div
                className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-colors hover:scale-110",
                  done
                    ? `${phaseColors[i]} border-transparent text-primary-foreground`
                    : `bg-muted ${phaseBorders[i]} text-muted-foreground`
                )}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <PhaseIcon icon={phase.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.div>
              <span className="mt-2 text-[10px] sm:text-xs font-semibold text-center leading-tight text-foreground">
                {phase.title}
              </span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground text-center leading-tight hidden sm:block">
                {phase.stage}
              </span>
            </div>
          );
        })}
      </div>

      {/* Link to group page */}
      <Link
        to={`/grupo/${group.id}`}
        className="block text-center text-xs font-semibold text-primary mt-4 hover:underline"
      >
        Ver página da equipe →
      </Link>

      <PhaseDetailDialog
        phase={selectedPhase}
        phaseIndex={selectedIndex}
        completed={selectedPhase ? group.completedPhases[selectedIndex] : false}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
