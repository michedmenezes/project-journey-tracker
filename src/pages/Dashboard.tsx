import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Filter, Trophy, Users, LayoutGrid, Rocket, LayoutDashboard, BarChart3 } from "lucide-react";
import PhaseTracker from "@/components/PhaseTracker";
import PhaseTrackerCondensed from "@/components/PhaseTrackerCondensed";
import ThemeToggle from "@/components/ThemeToggle";
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
    const interval = setInterval(update, 5000);
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header Materio Style */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="materio-gradient p-2 rounded-lg shadow-materio-primary">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Journey Tracker</h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">Dashboard de Projetos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="h-6 w-[1px] bg-border mx-2" />
            <Link to="/ranking">
              <Button variant="ghost" size="sm" className="font-bold text-brand-500 hover:bg-brand-500/10 gap-2">
                <BarChart3 className="w-4 h-4" /> <span className="hidden sm:inline">Ver Ranking Público</span>
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="font-bold text-muted-foreground hover:text-brand-500 gap-2">
                <ShieldCheck className="w-4 h-4" /> <span className="hidden sm:inline">Admin</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Card */}
        <div className="materio-card rounded-xl p-6 materio-gradient relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-1">Olá, Professor!</h2>
              <p className="text-white/80 text-sm font-medium">Acompanhe o progresso dos seus alunos em tempo real.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg text-white">
                <span className="text-xs font-bold uppercase tracking-widest opacity-70 block">Total de Grupos</span>
                <span className="text-xl font-bold">{groups.length}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg text-white">
                <span className="text-xs font-bold uppercase tracking-widest opacity-70 block">Turmas Ativas</span>
                <span className="text-xl font-bold">{classes.length}</span>
              </div>
            </div>
          </div>
          <Rocket className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10 -rotate-12" />
        </div>

        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-card border border-border px-4 py-2 rounded-lg shadow-sm w-full sm:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Filtrar Turma:</span>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="h-8 w-[160px] border-none bg-transparent shadow-none focus:ring-0 text-foreground font-bold">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as turmas</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center bg-card border border-border p-1 rounded-lg shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all uppercase tracking-widest",
                viewMode === "grid" ? "bg-brand-500 text-white shadow-materio-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Grade
            </button>
            <button
              onClick={() => setViewMode("ranking")}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all uppercase tracking-widest",
                viewMode === "ranking" ? "bg-brand-500 text-white shadow-materio-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Trophy className="w-3.5 h-3.5" /> Ranking
            </button>
          </div>
        </div>

        {/* Groups Grid */}
        {filteredGroups.length === 0 ? (
          <div className="text-center py-20 materio-card rounded-xl border-2 border-dashed border-border bg-transparent shadow-none">
            <Users className="w-12 h-12 mx-auto text-muted mb-4" />
            <h3 className="text-lg font-bold text-muted-foreground">Nenhuma equipe para exibir</h3>
            <p className="text-muted-foreground/60 text-sm mt-1">Aguardando cadastro de grupos.</p>
          </div>
        ) : (
          <div className={cn(
            "grid gap-6",
            viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2" : "grid-cols-1"
          )}>
            <AnimatePresence mode="popLayout">
              {filteredGroups.map((group, index) => (
                <motion.div
                  key={group.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {viewMode === "grid" ? (
                    <PhaseTracker group={group} />
                  ) : (
                    <PhaseTrackerCondensed group={group} rank={index + 1} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
