import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Circle, Users, Target, ClipboardList, Trophy, XCircle, Rocket } from "lucide-react";
import PhaseIcon from "@/components/PhaseIcon";
import ThemeToggle from "@/components/ThemeToggle";
import { loadPhases, loadGroups, type Phase, type Group } from "@/lib/phases";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function PhasePage() {
  const { phaseId } = useParams();
  const [phase, setPhase] = useState<Phase | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [allPhases, setAllPhases] = useState<Phase[]>([]);

  useEffect(() => {
    const pList = loadPhases();
    setAllPhases(pList);
    const found = pList.find((p) => String(p.id) === phaseId);
    setPhase(found || null);
    setGroups(loadGroups());
  }, [phaseId]);

  if (!phase) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 mb-6">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Etapa não encontrada</h2>
        <Link to="/" className="text-brand-500 font-bold hover:underline uppercase tracking-widest text-xs">
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  const phaseIndex = allPhases.findIndex((p) => p.id === phase.id);
  const completedGroups = groups.filter((g) => g.completedPhases[phaseIndex]);
  const progressPercent = groups.length > 0 ? (completedGroups.length / groups.length) * 100 : 0;

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
              <PhaseIcon icon={phase.icon} className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">{phase.title}</h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">Etapa {phaseIndex + 1}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Phase Hero Card */}
        <div className="materio-card rounded-xl p-8 materio-gradient relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/30">
                  {phase.stage}
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-4 tracking-tight">{phase.title}</h2>
              <p className="text-white/80 text-sm font-medium leading-relaxed max-w-2xl">
                {phase.description || "Nenhuma descrição disponível para esta etapa."}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl flex flex-col items-center justify-center min-w-[180px] text-white">
              <Trophy className="w-8 h-8 text-white mb-2" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Entrega Requerida</span>
              <p className="text-sm font-bold text-center leading-snug">{phase.delivery}</p>
            </div>
          </div>
          <PhaseIcon icon={phase.icon} className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10 -rotate-12" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <ClipboardList className="w-5 h-5 text-brand-500" />
                <h2 className="text-xl font-bold text-foreground uppercase tracking-widest">Missões da Equipe</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {phase.missions && phase.missions.length > 0 ? (
                  phase.missions.map((mission, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="materio-card rounded-xl p-5 flex items-start gap-4 hover:bg-accent/5 transition-all"
                    >
                      <div className="bg-brand-500 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-brand-500/20">
                        {i + 1}
                      </div>
                      <p className="text-foreground font-medium leading-relaxed pt-1">{mission}</p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-muted-foreground italic font-medium">Nenhuma missão cadastrada.</p>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="materio-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Progresso das Equipes</h3>
                <span className="text-sm font-bold text-brand-500">{Math.round(progressPercent)}%</span>
              </div>
              
              <div className="h-2 rounded-full bg-secondary overflow-hidden mb-8">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-brand-500 shadow-materio-primary"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">
                  <Users className="w-3.5 h-3.5" /> Listagem de Grupos
                </div>
                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                  {groups.map((group) => {
                    const isDone = group.completedPhases[phaseIndex];
                    return (
                      <Link
                        key={group.id}
                        to={`/grupo/${group.id}`}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-widest",
                          isDone 
                            ? "bg-brand-500/10 border-brand-500/20 text-brand-500" 
                            : "bg-secondary/30 border-border text-muted-foreground hover:bg-secondary/50"
                        )}
                      >
                        <span className="truncate mr-2">{group.name}</span>
                        {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
