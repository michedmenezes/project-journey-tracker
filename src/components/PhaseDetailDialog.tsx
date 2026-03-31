import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PhaseIcon from "./PhaseIcon";
import { cn } from "@/lib/utils";
import type { Phase } from "@/lib/phases";
import { CheckCircle2, Circle, Target, ClipboardList, Trophy } from "lucide-react";

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
      <DialogContent className="glass-card border-white/10 rounded-2xl sm:max-w-[500px] p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-8 pb-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-500/5 blur-3xl -top-12 -right-12 rounded-full" />
          <div className="flex items-center gap-5 relative z-10 text-left">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500",
              completed ? "bg-brand-500 border-brand-500 text-white brand-glow" : "bg-zinc-900 border-white/5 text-zinc-600"
            )}>
              <PhaseIcon icon={phase.icon} className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-black bg-brand-500/10 text-brand-500 px-3 py-1 rounded-full uppercase tracking-[0.2em] border border-brand-500/10">
                  Etapa {phaseIndex + 1}
                </span>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                  {phase.stage}
                </span>
              </div>
              <DialogTitle className="text-2xl font-black text-white tracking-tight">
                {phase.title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="px-8 pb-8 space-y-8 relative z-10">
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Target className="w-4 h-4 text-brand-500" />
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Entrega Requerida</h4>
            </div>
            <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 flex items-start gap-3">
              <Trophy className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
              <p className="text-sm font-black text-white leading-relaxed">{phase.delivery}</p>
            </div>
          </section>

          {phase.missions && phase.missions.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-4 h-4 text-brand-500" />
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Principais Missões</h4>
              </div>
              <div className="space-y-2">
                {phase.missions.slice(0, 3).map((mission, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/50 border border-white/5 group hover:border-white/10 transition-all">
                    <div className="w-5 h-5 rounded-md bg-brand-500/10 flex items-center justify-center text-[10px] font-black text-brand-500 border border-brand-500/10 shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-xs text-zinc-300 font-bold leading-relaxed">{mission}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className={cn(
            "flex items-center justify-center gap-3 p-4 rounded-xl border font-black uppercase tracking-widest text-xs transition-all",
            completed 
              ? "bg-brand-500 text-white brand-glow border-brand-500" 
              : "bg-zinc-900 border-white/5 text-zinc-600"
          )}>
            {completed ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Fase Concluída pela Equipe
              </>
            ) : (
              <>
                <Circle className="w-4 h-4" />
                Fase em Andamento
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
