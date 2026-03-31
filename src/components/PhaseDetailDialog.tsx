import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Circle, Target, ClipboardList, Trophy, X } from "lucide-react";
import PhaseIcon from "./PhaseIcon";
import { cn } from "@/lib/utils";
import type { Phase } from "@/lib/phases";
import { motion } from "framer-motion";

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
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-card shadow-2xl rounded-xl">
        <div className="relative">
          {/* Header with Background Pattern */}
          <div className="materio-gradient h-32 relative flex items-center px-8">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            </div>
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl border border-white/30 shadow-lg relative z-10">
              <PhaseIcon icon={phase.icon} className="w-8 h-8 text-white" />
            </div>
            <div className="ml-5 text-white relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Fase {phaseIndex + 1}</p>
              <DialogTitle className="text-2xl font-bold tracking-tight text-white">{phase.title}</DialogTitle>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Status & Stage */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-brand-500" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{phase.stage}</span>
              </div>
              <div className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors",
                completed 
                  ? "bg-brand-500/10 text-brand-500 border-brand-500/20" 
                  : "bg-secondary text-muted-foreground border-border"
              )}>
                {completed ? (
                  <><CheckCircle2 className="w-3 h-3" /> Concluída</>
                ) : (
                  <><Circle className="w-3 h-3" /> Em Progresso</>
                )}
              </div>
            </div>

            {/* Delivery Card */}
            <div className="bg-secondary/50 rounded-xl p-5 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-brand-500" />
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Entrega Requerida</h4>
              </div>
              <p className="text-sm font-bold text-foreground leading-relaxed">
                {phase.delivery}
              </p>
            </div>

            {/* Missions List */}
            {phase.missions && phase.missions.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Missões da Etapa
                </h4>
                <div className="space-y-2.5">
                  {phase.missions.slice(0, 5).map((mission: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border hover:border-brand-500/30 transition-colors shadow-sm"
                    >
                      <div className="bg-brand-500/10 text-brand-500 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border border-brand-500/10">
                        {i + 1}
                      </div>
                      <p className="text-xs font-medium text-foreground/80 leading-snug">{mission}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
