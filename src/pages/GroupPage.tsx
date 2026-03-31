import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Circle, Rocket, Target, Trophy, Info, LayoutDashboard } from "lucide-react";
import PhaseIcon from "@/components/PhaseIcon";
import PhaseDetailDialog from "@/components/PhaseDetailDialog";
import ThemeToggle from "@/components/ThemeToggle";
import { loadGroups, loadPhases, type Group, type Phase } from "@/lib/phases";
import { cn } from "@/lib/utils";

export default function GroupPage() {
  const { groupId } = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<{ phase: Phase, index: number } | null>(null);

  useEffect(() => {
    const update = () => {
      const groups = loadGroups();
      const found = groups.find((g) => g.id === groupId);
      setGroup(found || null);
      setPhases(loadPhases());
    };
    update();
    const interval = setInterval(update, 2000);
    return () => clearInterval(interval);
  }, [groupId]);

  const openPhaseDetails = (phase: Phase, index: number) => {
    setSelectedPhase({ phase, index });
    setDialogOpen(true);
  };

  if (!group) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="bg-secondary p-4 rounded-2xl border border-border mb-6">
          <Rocket className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Equipe não encontrada</h2>
        <Link to="/" className="text-brand-500 font-bold hover:underline uppercase tracking-widest text-xs">
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  const completed = group.completedPhases.filter(Boolean).length;
  const progressPercent = phases.length > 0 ? (completed / phases.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 transition-colors duration-300">
      {/* Header Materio Style */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="hover:bg-secondary p-2 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div className="materio-gradient p-2 rounded-lg shadow-materio-primary">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">{group.name}</h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">{group.class}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Progress Overview Card */}
        <div className="materio-card rounded-xl p-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-brand-500" />
                <h2 className="text-xl font-bold text-foreground tracking-tight">Progresso da Equipe</h2>
              </div>
              <p className="text-muted-foreground text-sm font-medium mb-6">
                A equipe concluiu {completed} de {phases.length} etapas do projeto.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-muted-foreground">Status Geral</span>
                  <span className="text-brand-500">{Math.round(progressPercent)}% Concluído</span>
                </div>
                <div className="h-3 rounded-full bg-secondary overflow-hidden border border-border">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-brand-500 shadow-materio-primary"
                  />
                </div>
              </div>
            </div>

            <div className="bg-accent/50 border border-brand-500/20 p-6 rounded-xl flex flex-col items-center justify-center min-w-[160px] shadow-sm">
              <Trophy className="w-8 h-8 text-brand-500 mb-2" />
              <span className="text-2xl font-bold text-foreground">{completed}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Etapas</span>
            </div>
          </div>
        </div>

        {/* Phases Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {phases.map((phase, i) => {
            const done = group.completedPhases[i];
            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "materio-card rounded-xl p-6 transition-all group flex flex-col justify-between",
                  done ? "border-brand-500/30" : "opacity-75"
                )}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border transition-all shadow-sm",
                    done ? "bg-brand-500 border-brand-500 text-white shadow-materio-primary" : "bg-secondary border-border text-muted-foreground"
                  )}>
                    <PhaseIcon icon={phase.icon} className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Etapa {i + 1}</p>
                    <h3 className={cn("text-base font-bold tracking-tight", done ? "text-foreground" : "text-muted-foreground")}>
                      {phase.title}
                    </h3>
                  </div>

                  <div className="shrink-0">
                    {done ? (
                      <CheckCircle2 className="w-6 h-6 text-brand-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted/30" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Link
                    to={`/fase/${phase.id}`}
                    className="text-[10px] font-bold uppercase tracking-widest text-brand-500 hover:underline flex items-center gap-1.5"
                  >
                    <Info className="w-3.5 h-3.5" /> Detalhes da Etapa
                  </Link>
                  <button 
                    onClick={() => openPhaseDetails(phase, i)}
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Resumo
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

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
