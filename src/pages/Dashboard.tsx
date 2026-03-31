import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Filter, Trophy, Users, LayoutGrid, Rocket } from "lucide-react";
import PhaseTracker from "@/components/PhaseTracker";
import PhaseTrackerCondensed from "@/components/PhaseTrackerCondensed";
import { loadGroups, loadPhases, type Group, type Phase } from "@/lib/phases";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "ranking">("grid");

  useEffect(() => {
    const update = () => {
      setGroups(loadGroups());
      setPhases(loadPhases());
    };
    update();
    const interval = setInterval(update, 2000);
    window.addEventListener("storage", update);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", update);
    };
  }, []);

  const classes = useMemo(() => {
    const uniqueClasses = Array.from(new Set(groups.map((g) => g.class))).filter(Boolean);
    return uniqueClasses.sort();
  }, [groups]);

  const filteredGroups = useMemo(() => {
    let result = [...groups];
    if (selectedClass !== "all") {
      result = result.filter((g) => g.class === selectedClass);
    }
    
    if (viewMode === "ranking") {
      result.sort((a, b) => {
        const aCompleted = a.completedPhases.filter(Boolean).length;
        const bCompleted = b.completedPhases.filter(Boolean).length;
        if (bCompleted !== aCompleted) return bCompleted - aCompleted;
        return a.name.localeCompare(b.name);
      });
    }
    
    return result;
  }, [groups, selectedClass, viewMode]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50 pb-12">
      <header
        className="py-10 px-6 border-b border-white/5 relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="absolute inset-0 bg-brand-500/5 blur-[100px] rounded-full -top-24 -left-24" />
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-brand-500/10 p-3 rounded-2xl border border-brand-500/20 brand-glow">
              <Rocket className="w-8 h-8 text-brand-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">Jornada do Projeto</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Acompanhamento de Progresso</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300 gap-2 rounded-xl">
                <ShieldCheck className="w-4 h-4" /> Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 glass-card p-4 rounded-2xl border border-white/5 shadow-xl">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-3 bg-zinc-900/50 px-4 py-2 rounded-xl border border-white/5">
              <Filter className="w-4 h-4 text-zinc-500" />
              <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Turma:</span>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="h-8 w-[160px] border-none bg-transparent shadow-none focus:ring-0 text-zinc-200 font-bold">
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-zinc-200">
                  <SelectItem value="all">Todas as turmas</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center bg-zinc-900/50 p-1.5 rounded-xl border border-white/5">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-widest",
                viewMode === "grid" ? "bg-brand-500 text-white brand-glow" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <LayoutGrid className="w-4 h-4" /> Grade
            </button>
            <button
              onClick={() => setViewMode("ranking")}
              className={cn(
                "flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-widest",
                viewMode === "ranking" ? "bg-brand-500 text-white brand-glow" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Trophy className="w-4 h-4" /> Ranking
            </button>
          </div>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="text-center py-24 glass-card rounded-3xl border-2 border-dashed border-white/5">
            <Users className="w-16 h-16 mx-auto text-zinc-800 mb-6" />
            <h3 className="text-xl font-bold text-zinc-400">Nenhuma equipe encontrada</h3>
            <p className="text-zinc-600 text-sm mt-2">O professor ainda não cadastrou equipes para esta seleção.</p>
          </div>
        ) : (
          <div className={cn(
            "grid gap-6",
            viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          )}>
            <AnimatePresence mode="popLayout">
              {filteredGroups.map((group, index) => {
                return (
                  <motion.div
                    key={group.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    {viewMode === "grid" ? (
                      <PhaseTracker group={group} />
                    ) : (
                      <PhaseTrackerCondensed group={group} rank={index + 1} />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
