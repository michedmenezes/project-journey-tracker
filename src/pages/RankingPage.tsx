import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ArrowLeft, Filter, Rocket, LayoutDashboard, Search } from "lucide-react";
import PhaseTrackerCondensed from "@/components/PhaseTrackerCondensed";
import ThemeToggle from "@/components/ThemeToggle";
import { loadGroups, loadPhases, type Group, type Phase } from "@/lib/phases";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function RankingPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const update = () => {
      setGroups(loadGroups());
      setPhases(loadPhases());
    };
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, []);

  const classes = useMemo(() => {
    const uniqueClasses = Array.from(new Set(groups.map((g) => g.class))).filter(Boolean);
    return uniqueClasses.sort();
  }, [groups]);

  const rankedGroups = useMemo(() => {
    let result = [...groups];
    
    // Filter by class
    if (selectedClass !== "all") {
      result = result.filter((g) => g.class === selectedClass);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(g => 
        g.name.toLowerCase().includes(q) || 
        (g.members && g.members.some(m => m.toLowerCase().includes(q)))
      );
    }
    
    // Sort by progress
    result.sort((a, b) => {
      const aCompleted = a.completedPhases.filter(Boolean).length;
      const bCompleted = b.completedPhases.filter(Boolean).length;
      if (bCompleted !== aCompleted) return bCompleted - aCompleted;
      return a.name.localeCompare(b.name);
    });
    
    return result;
  }, [groups, selectedClass, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header Materio Style */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="hover:bg-secondary p-2 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div className="materio-gradient p-2 rounded-lg shadow-materio-primary">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">Ranking de Equipes</h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">Público — Sem Senha</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Top Card */}
        <div className="materio-card rounded-xl p-6 materio-gradient relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-1">Acompanhe seu Progresso! 🚀</h2>
              <p className="text-white/80 text-sm font-medium">Veja como sua equipe está se saindo no projeto autoral.</p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg text-white">
              <span className="text-xs font-bold uppercase tracking-widest opacity-70 block">Turma Selecionada</span>
              <span className="text-lg font-bold">{selectedClass === "all" ? "Todas" : selectedClass}</span>
            </div>
          </div>
          <Trophy className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10 -rotate-12" />
        </div>

        {/* Filters & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-card border border-border px-4 py-1 rounded-lg shadow-sm">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="border-none bg-transparent shadow-none focus:ring-0 text-foreground font-bold h-10">
                <SelectValue placeholder="Escolher Turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as turmas</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 bg-card border border-border px-4 py-1 rounded-lg shadow-sm">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <Input 
              placeholder="Buscar equipe ou aluno..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none bg-transparent shadow-none focus-visible:ring-0 h-10 font-bold"
            />
          </div>
        </div>

        {/* Ranking List */}
        {rankedGroups.length === 0 ? (
          <div className="text-center py-20 materio-card rounded-xl border-2 border-dashed border-border bg-transparent shadow-none">
            <Rocket className="w-12 h-12 mx-auto text-muted mb-4" />
            <h3 className="text-lg font-bold text-muted-foreground">Nenhuma equipe encontrada</h3>
            <p className="text-muted-foreground/60 text-sm mt-1">Ajuste o filtro ou a busca.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {rankedGroups.map((group, index) => (
                <motion.div
                  key={group.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <PhaseTrackerCondensed group={group} rank={index + 1} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="text-center pt-8">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Atualizado em tempo real pelo professor
          </p>
        </div>
      </main>
    </div>
  );
}
