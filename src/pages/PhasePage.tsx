import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Circle, Users, Target, ClipboardList, Trophy, XCircle } from "lucide-react";
import PhaseIcon from "@/components/PhaseIcon";
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
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 mb-6">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Etapa não encontrada</h2>
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
    <div className="min-h-screen bg-[#09090b] text-zinc-50 pb-20">
      <header
        className="py-12 px-6 border-b border-white/5 relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="absolute inset-0 bg-brand-500/5 blur-[100px] rounded-full -top-24 -right-24" />
        <div className="max-w-4xl mx-auto relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-xs font-black uppercase tracking-widest mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Voltar ao Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="bg-brand-500/10 p-4 rounded-2xl border border-brand-500/20 brand-glow shrink-0 w-20 h-20 flex items-center justify-center">
              <PhaseIcon icon={phase.icon} className="w-10 h-10 text-brand-500" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-black bg-brand-500/10 text-brand-500 px-3 py-1 rounded-full uppercase tracking-[0.2em] border border-brand-500/10">
                  Etapa {phaseIndex + 1}
                </span>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                  {phase.stage}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                {phase.title}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-12">
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-5 h-5 text-brand-500" />
                <h2 className="text-xl font-black text-white uppercase tracking-widest">O que é esta etapa?</h2>
              </div>
              <div className="glass-card rounded-2xl p-8 border-none shadow-xl leading-relaxed text-zinc-300 font-medium">
                {phase.description || "Nenhuma descrição disponível para esta etapa."}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <ClipboardList className="w-5 h-5 text-brand-500" />
                <h2 className="text-xl font-black text-white uppercase tracking-widest">Missões da Equipe</h2>
              </div>
              <div className="space-y-4">
                {phase.missions && phase.missions.length > 0 ? (
                  phase.missions.map((mission, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-card rounded-xl p-5 border-none flex items-start gap-4 hover:bg-surface/80 transition-all"
                    >
                      <div className="bg-brand-500/10 text-brand-500 w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 border border-brand-500/10">
                        {i + 1}
                      </div>
                      <p className="text-zinc-200 font-bold leading-snug pt-1">{mission}</p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-zinc-500 italic font-medium">Nenhuma missão cadastrada.</p>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="glass-card rounded-2xl p-6 border-none shadow-xl bg-brand-500/5 border border-brand-500/10">
              <h3 className="text-xs font-black text-brand-500 uppercase tracking-[0.2em] mb-4">Entrega Requerida</h3>
              <div className="flex items-start gap-3">
                <Trophy className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                <p className="text-sm font-black text-white leading-relaxed">
                  {phase.delivery}
                </p>
              </div>
            </section>

            <section className="glass-card rounded-2xl p-6 border-none shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Status das Equipes</h3>
                <span className="text-xs font-black text-brand-500">{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-900 overflow-hidden mb-6">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-brand-500 brand-glow"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 border-b border-white/5 pb-2">
                  <Users className="w-3.5 h-3.5" /> Listagem de Grupos
                </div>
                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                  {groups.map((group) => {
                    const isDone = group.completedPhases[phaseIndex];
                    return (
                      <Link
                        key={group.id}
                        to={`/grupo/${group.id}`}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest",
                          isDone 
                            ? "bg-brand-500/10 border-brand-500/20 text-brand-500" 
                            : "bg-zinc-900/50 border-white/5 text-zinc-500 hover:border-white/10"
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
