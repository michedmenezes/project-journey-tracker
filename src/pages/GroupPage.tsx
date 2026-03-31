import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Circle, Rocket, Target, Trophy, Info } from "lucide-react";
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
        <h2 className="text-2xl font-black text-foreground mb-2">Equipe não encontrada</h2>
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
      <header
        className="py-12 px-6 border-b border-border relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="absolute inset-0 bg-brand-500/5 blur-[100px] rounded-full -top-24 -left-24" />
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs font-black uppercase tracking-widest transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Voltar ao Dashboard
            </Link>
            <ThemeToggle />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="bg-brand-500/10 p-4 rounded-2xl border border-brand-500/20 brand-glow shrink-0 w-20 h-20 flex items-center justify-center">
              <Rocket className="w-10 h-10 text-brand-500" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-black bg-brand-500/10 text-brand-500 px-3 py-1 rounded-full uppercase tracking-[0.2em] border border-brand-500/10">
                  {group.class}
                </span>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  {completed}/{phases.length} Etapas Concluídas
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground dark:text-white tracking-tight mb-2">
                {group.name}
              </h1>
              {group.members && group.members.length > 0 && (
                <p className="text-muted-foreground text-sm italic font-medium">
                  Integrantes: {group.members.join(", ")}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section className="glass-card rounded-3xl p-8 border-none shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Trophy className="w-32 h-32 text-brand-500" />
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-foreground uppercase tracking-widest flex items-center gap-3">
              <Target className="w-5 h-5 text-brand-500" /> Progresso da Jornada
            </h2>
            <span className="text-2xl font-black text-brand-500">{Math.round(progressPercent)}%</span>
          </div>
          
          <div className="h-4 rounded-full bg-secondary overflow-hidden mb-12 border border-border">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-brand-500 brand-glow"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {phases.map((phase, i) => {
              const done = group.completedPhases[i];
              return (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "group relative p-5 rounded-2xl border transition-all flex items-center gap-4",
                    done 
                      ? "bg-brand-500/10 border-brand-500/20" 
                      : "bg-secondary/20 border-border grayscale opacity-70"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all",
                    done ? "bg-brand-500 border-brand-500 text-white brand-glow" : "bg-secondary border-border text-muted-foreground"
                  )}>
                    <PhaseIcon icon={phase.icon} className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Fase {i + 1}</p>
                    <h3 className={cn("text-sm font-black uppercase tracking-tight truncate", done ? "text-foreground" : "text-muted-foreground")}>
                      {phase.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Link
                        to={`/fase/${phase.id}`}
                        className="text-[9px] font-black uppercase tracking-widest text-brand-500 hover:underline flex items-center gap-1"
                      >
                        <Info className="w-3 h-3" /> Ver Detalhes
                      </Link>
                      <button 
                        onClick={() => openPhaseDetails(phase, i)}
                        className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
                      >
                        Resumo
                      </button>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {done ? (
                      <CheckCircle2 className="w-6 h-6 text-brand-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-border" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
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
