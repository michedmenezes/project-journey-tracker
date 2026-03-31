import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import PhaseIcon from "./PhaseIcon";
import { cn } from "@/lib/utils";
import type { Phase } from "@/lib/phases";

const phaseColorClasses = [
  "text-phase-1", "text-phase-2", "text-phase-3", "text-phase-4", "text-phase-5",
];

const phaseBgClasses = [
  "bg-phase-1/10", "bg-phase-2/10", "bg-phase-3/10", "bg-phase-4/10", "bg-phase-5/10",
];

const PHASE_DESCRIPTIONS: Record<number, string> = {
  1: "Nesta fase, os alunos investigam um problema real que desejam resolver. Utilizam técnicas de brainstorming e pensamento criativo para mapear ideias e definir claramente o desafio. A entrega é a Definição do Problema acompanhada de um Mapa Mental de Ideias que organiza as possibilidades exploradas.",
  2: "Com o problema definido, é hora de planejar a solução. Os alunos preenchem o Canvas de Protótipo, detalhando público-alvo, funcionalidades e recursos necessários. Também criam um Esboço Técnico com as especificações do protótipo que será construído.",
  3: "Mão na massa! Os alunos elaboram a Lista de Materiais necessários e constroem a Primeira Versão do Protótipo (MVP — Mínimo Produto Viável). O foco é transformar o planejamento em algo tangível, mesmo que ainda imperfeito.",
  4: "O protótipo é testado com usuários reais. Os alunos coletam feedback, identificam problemas e documentam os Ajustes Feitos. O Relatório de Testes registra o que funcionou, o que precisa melhorar e as decisões tomadas.",
  5: "A fase final consolida todo o trabalho. Os alunos escrevem o Relatório Final do projeto e preparam o Protótipo Finalizado para apresentação na Mostra. É o momento de celebrar a jornada e compartilhar os resultados!",
};

interface PhaseDetailDialogProps {
  phase: Phase | null;
  phaseIndex: number;
  completed: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PhaseDetailDialog({
  phase,
  phaseIndex,
  completed,
  open,
  onOpenChange,
}: PhaseDetailDialogProps) {
  if (!phase) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                phaseBgClasses[phaseIndex % phaseBgClasses.length]
              )}
            >
              <PhaseIcon
                icon={phase.icon}
                className={cn("w-6 h-6", phaseColorClasses[phaseIndex % phaseColorClasses.length])}
              />
            </div>
            <div>
              <DialogTitle className="font-display text-xl">
                Fase {phase.id}: {phase.title}
              </DialogTitle>
              <DialogDescription className="text-sm">
                Etapa: {phase.stage}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              Sobre esta fase
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {PHASE_DESCRIPTIONS[phase.id]}
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 border border-border">
            <h4 className="text-sm font-semibold text-foreground mb-1">
              📋 Entrega Requerida
            </h4>
            <p className="text-sm text-muted-foreground">{phase.delivery}</p>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-3 h-3 rounded-full",
                completed ? "bg-primary" : "bg-muted-foreground/30"
              )}
            />
            <span
              className={cn(
                "text-sm font-semibold",
                completed ? "text-primary" : "text-muted-foreground"
              )}
            >
              {completed ? "✅ Fase concluída!" : "⏳ Fase pendente"}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
