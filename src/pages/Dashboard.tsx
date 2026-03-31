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
    
    // Se for modo ranking, ordena por progresso (fases concluídas)
    if (viewMode === "ranking") {
      result.sort((a, b) => {
        const aCompleted = a.completedPhases.filter(Boolean).length;
        const bCompleted = b.completedPhases.filter(Boolean).length;
        if (bCompleted !== aCompleted) return bCompleted - aCompleted;
        return a.name.localeCompare(b.name); // Desempate por nome
      });
    }
    
    return result;
  }, [groups, selectedClass, viewMode]);

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header compactado para embutir no Moodle */}
      <header
        className="py-6 px-4 text-primary-foreground shadow-lg"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">Jornada do Projeto</h1>
              <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Acompanhamento de Progresso</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 gap-2">
                <ShieldCheck className="w-4 h-4" /> Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Toolbar de Filtros e Modos */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-bold text-muted-foreground uppercase">Turma:</span>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="h-8 w-[140px] border-none bg-transparent shadow-none focus:ring-0">
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                viewMode === "grid" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Grade
            </button>
            <button
              onClick={() => setViewMode("ranking")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                viewMode === "ranking" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Trophy className="w-3.5 h-3.5" /> Ranking
            </button>
          </div>
        </div>

        {/* Listagem de Grupos */}
        {filteredGroups.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border-2 border-dashed border-border">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold text-foreground">Nenhuma equipe encontrada</h3>
            <p className="text-muted-foreground text-sm">O professor ainda não cadastrou equipes para esta seleção.</p>
          </div>
        ) : (
          <div className={cn(
            "grid gap-4",
            viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          )}>
            <AnimatePresence mode="popLayout">
              {filteredGroups.map((group, index) => {
                return (
                  <motion.div
                    key={group.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
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
