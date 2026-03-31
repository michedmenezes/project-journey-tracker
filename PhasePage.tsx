import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Circle, BookOpen, ClipboardCheck } from "lucide-react";
import PhaseIcon from "@/components/PhaseIcon";
import { loadPhases, loadGroups, type Phase, type Group } from "@/lib/phases";
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
const phaseGradients = [
  "from-blue-500/20 to-cyan-500/10",
  "from-teal-500/20 to-green-500/10",
  "from-green-500/20 to-emerald-500/10",
  "from-yellow-500/20 to-orange-500/10",
  "from-purple-500/20 to-violet-500/10",
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
  const groupsCompleted = groups.filter((g) => g.completedPhases[phaseIndex] === true);
  const groupsTotal = groups.length;

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
            className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
          </Link>

          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center border-2 border-white/30",
                phaseColors[colorIdx],
              )}
            >
              <PhaseIcon icon={phase.icon} className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-primary-foreground/70 text-sm font-medium">
                Fase {phaseIndex + 1} · {phase.stage}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold">
                {phase.title}
              </h1>
            </div>
          </div>
        </motion.div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Progress badge */}
        {groupsTotal > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 shadow-sm"
          >
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", phaseColors[colorIdx])}>
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {groupsCompleted.length} de {groupsTotal} grupos concluíram esta fase
              </p>
              <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden w-48">
                <motion.div
                  className={cn("h-full rounded-full", phaseColors[colorIdx])}
                  initial={{ width: 0 }}
                  animate={{ width: groupsTotal > 0 ? `${(groupsCompleted.length / groupsTotal) * 100}%` : "0%" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Delivery */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={cn(
            "rounded-xl border-2 p-5 bg-gradient-to-br",
            phaseBorders[colorIdx],
            phaseGradients[colorIdx],
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <ClipboardCheck className={cn("w-5 h-5", phaseTextColors[colorIdx])} />
            <h2 className="font-display text-lg font-bold text-foreground">Entrega Requerida</h2>
          </div>
          <p className="text-foreground/80">{phase.delivery}</p>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl bg-card border border-border p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className={cn("w-5 h-5", phaseTextColors[colorIdx])} />
            <h2 className="font-display text-xl font-bold text-foreground">Descrição</h2>
          </div>
          {phase.description ? (
            <p className="text-foreground/80 leading-relaxed">{phase.description}</p>
          ) : (
            <p className="text-muted-foreground italic">Nenhuma descrição cadastrada para esta fase.</p>
          )}
        </motion.div>

        {/* Missions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl bg-card border border-border p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <PhaseIcon icon={phase.icon} className={cn("w-5 h-5", phaseTextColors[colorIdx])} />
            <h2 className="font-display text-xl font-bold text-foreground">Missões</h2>
            {phase.missions && phase.missions.length > 0 && (
              <span className={cn(
                "ml-auto text-xs font-bold px-2 py-0.5 rounded-full",
                phaseColors[colorIdx], "text-white"
              )}>
                {phase.missions.length} missões
              </span>
            )}
          </div>

          {phase.missions && phase.missions.length > 0 ? (
            <ul className="space-y-3">
              {phase.missions.map((mission, mi) => (
                <motion.li
                  key={mi}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + mi * 0.07 }}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                    phaseBorders[colorIdx],
                    "bg-muted/30 hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white",
                    phaseColors[colorIdx]
                  )}>
                    {mi + 1}
                  </div>
                  <span className="text-sm text-foreground leading-relaxed">{mission}</span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground italic">Nenhuma missão cadastrada para esta fase.</p>
          )}
        </motion.div>

        {/* Groups status */}
        {groups.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl bg-card border border-border p-6 shadow-sm"
          >
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Status dos Grupos</h2>
            <div className="space-y-2">
              {groups.map((group) => {
                const done = group.completedPhases[phaseIndex] === true;
                return (
                  <Link
                    key={group.id}
                    to={`/grupo/${group.id}`}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all hover:scale-[1.01] hover:shadow-sm",
                      done
                        ? cn("border-current/30 bg-green-50", phaseTextColors[colorIdx])
                        : "border-border bg-muted/30 hover:bg-muted/50"
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className={cn("w-5 h-5 shrink-0", phaseTextColors[colorIdx])} />
                    ) : (
                      <Circle className="w-5 h-5 shrink-0 text-muted-foreground" />
                    )}
                    <span className={cn(
                      "font-semibold text-sm",
                      done ? phaseTextColors[colorIdx] : "text-foreground"
                    )}>
                      {group.name}
                    </span>
                    <span className={cn(
                      "ml-auto text-xs font-medium",
                      done ? phaseTextColors[colorIdx] : "text-muted-foreground"
                    )}>
                      {done ? "✅ Concluído" : "⏳ Pendente"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
