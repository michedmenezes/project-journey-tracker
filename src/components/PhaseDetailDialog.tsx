import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import PhaseIcon from "./PhaseIcon";
import { cn } from "@/lib/utils";
import type { Phase } from "@/lib/phases";

const phaseColorClasses = [
  "text-phase-1", "text-phase-2", "text-phase-3", "text-phase-4", "text-phase-5",
];

const phaseBgClasses = [
  "bg-phase-1/10", "bg-phase-2/10", "bg-phase-3/10", "bg-phase-4/10", "bg-phase-5/10",
];

interface PhaseDetailDialogProps {
  phase: Phase | null;
  phaseIndex: number;
  completed: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PhaseDetailDialog({
  phase,
  phaseIndex,
  completed,
  open,
  onOpenChange,
}: PhaseDetailDialogProps) {
  if (!phase) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                phaseBgClasses[phaseIndex % phaseBgClasses.length]
              )}
            >
              <PhaseIcon
                icon={phase.icon}
                className={cn("w-6 h-6", phaseColorClasses[phaseIndex % phaseColorClasses.length])}
              />
            </div>
            <div>
              <DialogTitle className="font-display text-xl">
                Fase {phaseIndex + 1}: {phase.title}
              </DialogTitle>
              <DialogDescription className="text-sm">
                Etapa: {phase.stage}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="rounded-lg bg-muted/50 p-3 border border-border">
            <h4 className="text-sm font-semibold text-foreground mb-1">
              📋 Entrega Requerida
            </h4>
            <p className="text-sm text-muted-foreground">{phase.delivery}</p>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-3 h-3 rounded-full",
                completed ? "bg-primary" : "bg-muted-foreground/30"
              )}
            />
            <span
              className={cn(
                "text-sm font-semibold",
                completed ? "text-primary" : "text-muted-foreground"
              )}
            >
              {completed ? "✅ Fase concluída!" : "⏳ Fase pendente"}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
