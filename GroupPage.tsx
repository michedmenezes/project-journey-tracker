import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Rocket } from "lucide-react";
import PhaseIcon from "@/components/PhaseIcon";
import PhaseDetailDialog from "@/components/PhaseDetailDialog";
import { loadPhases, loadGroups, type Group, type Phase } from "@/lib/phases";
import { cn } from "@/lib/utils";

const phaseColors = [
  "bg-phase-1", "bg-phase-2", "bg-phase-3", "bg-phase-4", "bg-phase-5",
];
const phaseBorders = [
  "border-phase-1", "border-phase-2", "border-phase-3", "border-phase-4", "border-phase-5",
];
const phaseTextColors = [
  "text-phase-1", "text-phase-2", "text-phase-3", "text-phase-4", "text-phase-5",
];

export default function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [phases, setPhases] = useState<Phase[]>(loadPhases());
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const groups = loadGroups();
      const found = groups.find((g) => g.id === groupId) ?? null;
      setGroup(found);
      setPhases(loadPhases());
    };
    update();
    const interval = setInterval(update, 2000);
    return () => clearInterval(interval);
  }, [groupId]);

  if (!group) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">Grupo não encontrado.</p>
          <Link to="/" className="text-primary font-semibold hover:underline">
            ← Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const completed = group.completedPhases.filter(Boolean).length;
  const pct = phases.length > 0 ? (completed / phases.length) * 100 : 0;

  const openPhaseDetail = (phase: Phase, index: number) => {
    setSelectedPhase(phase);
    setSelectedIndex(index);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header
        className="py-8 px-4 text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-3xl mx-auto"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground text-sm mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <Rocket className="w-8 h-8" />
            <h1 className="font-display text-3xl sm:text-4xl font-bold">
              {group.name}
            </h1>
          </div>
          <p className="text-primary-foreground/80 mt-1">
            {completed}/{phases.length} fases concluídas
          </p>
        </motion.div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="rounded-xl bg-card p-5 shadow-md border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">Progresso Geral</span>
            <span className="text-sm font-bold text-primary">{Math.round(pct)}%</span>
          </div>
          <div className="relative h-4 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: "var(--gradient-phase)" }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>

        {phases.map((phase, i) => {
          const done = group.completedPhases[i] ?? false;
          return (
            <motion.div
              key={phase.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "rounded-xl bg-card shadow-md border p-5 transition-all",
                done ? "border-primary/30" : "border-border"
              )}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => openPhaseDetail(phase, i)}
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center border-2 shrink-0 transition-transform hover:scale-105",
                    done
                      ? `${phaseColors[i % phaseColors.length]} border-transparent text-primary-foreground`
                      : `bg-muted ${phaseBorders[i % phaseBorders.length]} text-muted-foreground`
                  )}
                >
                  <PhaseIcon icon={phase.icon} className="w-7 h-7" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Fase {i + 1}: {phase.title}
                    </h3>
                    {done && (
                      <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Concluída
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Etapa: {phase.stage}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    📋 {phase.delivery}
                  </p>
                  <Link
                    to={`/fase/${phase.id}`}
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-semibold hover:underline transition-colors",
                      phaseTextColors[i % phaseTextColors.length]
                    )}
                  >
                    Ver descrição e missões →
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </main>

      <PhaseDetailDialog
        phase={selectedPhase}
        phaseIndex={selectedIndex}
        completed={selectedPhase ? (group.completedPhases[selectedIndex] ?? false) : false}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
