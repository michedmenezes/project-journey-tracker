import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import PhaseIcon from "@/components/PhaseIcon";
import { loadPhases, loadGroups, type Phase, type Group } from "@/lib/phases";
import { cn } from "@/lib/utils";

const phaseColors = [
  "bg-phase-1", "bg-phase-2", "bg-phase-3", "bg-phase-4", "bg-phase-5",
];
const phaseBgLight = [
  "bg-phase-1/10", "bg-phase-2/10", "bg-phase-3/10", "bg-phase-4/10", "bg-phase-5/10",
];
const phaseTextColors = [
  "text-phase-1", "text-phase-2", "text-phase-3", "text-phase-4", "text-phase-5",
];
const phaseBorders = [
  "border-phase-1", "border-phase-2", "border-phase-3", "border-phase-4", "border-phase-5",
];

export default function PhasePage() {
  const { phaseId } = useParams<{ phaseId: string }>();
  const [phase, setPhase] = useState<Phase | null>(null);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const update = () => {
      const phases = loadPhases();
      const idx = phases.findIndex((p) => String(p.id) === phaseId);
      if (idx !== -1) {
        setPhase(phases[idx]);
        setPhaseIndex(idx);
      } else {
        setPhase(null);
      }
      setGroups(loadGroups());
    };
    update();
    const interval = setInterval(update, 2000);
    return () => clearInterval(interval);
  }, [phaseId]);

  if (!phase) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">Fase não encontrada.</p>
          <Link to="/" className="text-primary font-semibold hover:underline">
            ← Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const colorIdx = phaseIndex % phaseColors.length;
  const completedGroups = groups.filter((g) => g.completedPhases[phaseIndex] === true);
  const pct = groups.length > 0 ? (completedGroups.length / groups.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center shrink-0",
                "bg-white/20"
              )}
            >
              <PhaseIcon icon={phase.icon} className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-primary-foreground/70 text-sm font-medium uppercase tracking-wide">
                Fase {phaseIndex + 1} — {phase.stage}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold">
                {phase.title}
              </h1>
            </div>
          </div>
        </motion.div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Delivery card */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className={cn(
            "rounded-xl border p-4 flex items-start gap-3",
            phaseBgLight[colorIdx],
            phaseBorders[colorIdx]
          )}
        >
          <span className="text-xl mt-0.5">📋</span>
          <div>
            <p className={cn("text-xs font-semibold uppercase tracking-wide mb-0.5", phaseTextColors[colorIdx])}>
              Entrega Requerida
            </p>
            <p className="text-sm text-foreground font-medium">{phase.delivery}</p>
          </div>
        </motion.div>

        {/* Description */}
        {phase.description && (
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-card shadow-md border border-border p-5"
          >
            <h2 className="font-display text-lg font-bold text-foreground mb-3">
              Descrição
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {phase.description}
            </p>
          </motion.div>
        )}

        {/* Missions */}
        {phase.missions && phase.missions.length > 0 && (
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl bg-card shadow-md border border-border p-5"
          >
            <h2 className="font-display text-lg font-bold text-foreground mb-4">
              Missões
            </h2>
            <ol className="space-y-3">
              {phase.missions.map((mission, mi) => (
                <li key={mi} className="flex items-start gap-3">
                  <span
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-primary-foreground",
                      phaseColors[colorIdx]
                    )}
                  >
                    {mi + 1}
                  </span>
                  <p className="text-sm text-foreground leading-relaxed pt-0.5">{mission}</p>
                </li>
              ))}
            </ol>
          </motion.div>
        )}

        {/* Progress among groups */}
        {groups.length > 0 && (
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl bg-card shadow-md border border-border p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-bold text-foreground">
                Progresso das Equipes
              </h2>
              <span className="text-sm font-semibold text-muted-foreground">
                {completedGroups.length}/{groups.length} concluíram
              </span>
            </div>

            <div className="relative h-3 rounded-full bg-muted overflow-hidden mb-5">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: "var(--gradient-phase)" }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>

            <ul className="space-y-2">
              {groups.map((group) => {
                const done = group.completedPhases[phaseIndex] ?? false;
                return (
                  <li key={group.id}>
                    <Link
                      to={`/grupo/${group.id}`}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm hover:scale-[1.01]",
                        done
                          ? "bg-primary/10 border-primary/30"
                          : "bg-muted/50 border-transparent hover:bg-muted"
                      )}
                    >
                      {done ? (
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      ) : (
                        <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-sm font-semibold text-foreground flex-1">
                        {group.name}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-semibold px-2 py-0.5 rounded-full",
                          done
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {done ? "Concluída" : "Pendente"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </main>
    </div>
  );
}
