import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Trash2, ArrowLeft, Lock, ShieldCheck, Pencil, Check, X } from "lucide-react";
import PhaseIcon from "@/components/PhaseIcon";
import { loadPhases, savePhases, loadGroups, saveGroups, AVAILABLE_ICONS, type Phase, type Group } from "@/lib/phases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ADMIN_PASSWORD = "prof2025";

type PhaseFormState = {
  title: string;
  stage: string;
  delivery: string;
  icon: string;
  description: string;
  missions: string; // newline-separated
};

const emptyForm = (): PhaseFormState => ({
  title: "",
  stage: "",
  delivery: "",
  icon: "Star",
  description: "",
  missions: "",
});

function phaseToForm(phase: Phase): PhaseFormState {
  return {
    title: phase.title,
    stage: phase.stage,
    delivery: phase.delivery,
    icon: phase.icon,
    description: phase.description ?? "",
    missions: (phase.missions ?? []).join("\n"),
  };
}

function formToPhase(form: PhaseFormState, base: Partial<Phase> = {}): Omit<Phase, "id"> {
  return {
    title: form.title.trim(),
    stage: form.stage.trim(),
    delivery: form.delivery.trim(),
    icon: form.icon,
    description: form.description.trim() || undefined,
    missions: form.missions
      .split("\n")
      .map((m) => m.trim())
      .filter(Boolean),
    ...base,
  };
}

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [editingPhaseId, setEditingPhaseId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<PhaseFormState>(emptyForm());
  const [newPhase, setNewPhase] = useState<PhaseFormState>(emptyForm());
  const [showNewPhase, setShowNewPhase] = useState(false);

  useEffect(() => {
    if (authenticated) {
      setGroups(loadGroups());
      setPhases(loadPhases());
    }
  }, [authenticated]);

  const persistGroups = useCallback((updated: Group[]) => {
    setGroups(updated);
    saveGroups(updated);
  }, []);

  const persistPhases = useCallback((updated: Phase[]) => {
    setPhases(updated);
    savePhases(updated);
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const addGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;
    const g: Group = {
      id: crypto.randomUUID(),
      name,
      completedPhases: phases.map(() => false),
    };
    persistGroups([...groups, g]);
    setNewGroupName("");
  };

  const removeGroup = (id: string) => {
    persistGroups(groups.filter((g) => g.id !== id));
  };

  const togglePhase = (groupId: string, phaseIndex: number) => {
    persistGroups(
      groups.map((g) => {
        if (g.id !== groupId) return g;
        const cp = [...g.completedPhases];
        while (cp.length < phases.length) cp.push(false);
        cp[phaseIndex] = !cp[phaseIndex];
        return { ...g, completedPhases: cp };
      })
    );
  };

  const startEditPhase = (phase: Phase) => {
    setEditingPhaseId(phase.id);
    setEditForm(phaseToForm(phase));
  };

  const saveEditPhase = () => {
    if (!editForm.title.trim()) return;
    persistPhases(
      phases.map((p) =>
        p.id === editingPhaseId
          ? { ...p, ...formToPhase(editForm) }
          : p
      )
    );
    setEditingPhaseId(null);
  };

  const cancelEdit = () => setEditingPhaseId(null);

  const addPhase = () => {
    if (!newPhase.title.trim()) return;
    const maxId = phases.reduce((max, p) => Math.max(max, p.id), 0);
    const phase: Phase = {
      id: maxId + 1,
      ...formToPhase(newPhase),
    };
    persistPhases([...phases, phase]);
    persistGroups(groups.map((g) => ({
      ...g,
      completedPhases: [...g.completedPhases, false],
    })));
    setNewPhase(emptyForm());
    setShowNewPhase(false);
  };

  const removePhase = (phaseIndex: number) => {
    const updated = phases.filter((_, i) => i !== phaseIndex);
    persistPhases(updated);
    persistGroups(groups.map((g) => ({
      ...g,
      completedPhases: g.completedPhases.filter((_, i) => i !== phaseIndex),
    })));
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm bg-card rounded-2xl shadow-lg border border-border p-8 text-center"
        >
          <Lock className="w-12 h-12 mx-auto text-primary mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-1">Painel do Professor</h2>
          <p className="text-muted-foreground text-sm mb-6">Digite a senha para acessar</p>
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className={cn("mb-3", error && "border-destructive")}
          />
          {error && <p className="text-destructive text-sm mb-3">Senha incorreta</p>}
          <Button onClick={handleLogin} className="w-full">
            Entrar
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header
        className="py-6 px-4 text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <ShieldCheck className="w-7 h-7" />
          <h1 className="font-display text-2xl font-bold">Painel do Professor</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Phase Management */}
        <Accordion type="single" collapsible>
          <AccordionItem value="phases" className="bg-card rounded-xl shadow-md border border-border px-5">
            <AccordionTrigger className="font-display text-lg font-bold text-foreground hover:no-underline">
              ⚙️ Gerenciar Etapas ({phases.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pb-2">
                {phases.map((phase, pi) => (
                  <div key={phase.id} className="rounded-lg border border-border p-3">
                    {editingPhaseId === phase.id ? (
                      <PhaseForm
                        form={editForm}
                        onChange={setEditForm}
                        onSave={saveEditPhase}
                        onCancel={cancelEdit}
                        saveLabel="Salvar"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <PhaseIcon icon={phase.icon} className="w-5 h-5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-sm text-foreground">
                            Fase {pi + 1}: {phase.title}
                          </span>
                          <p className="text-xs text-muted-foreground truncate">
                            {phase.stage} — {phase.delivery}
                          </p>
                          {phase.missions && phase.missions.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {phase.missions.length} missão(ões)
                            </p>
                          )}
                        </div>
                        <Link
                          to={`/fase/${phase.id}`}
                          className="text-xs text-primary hover:underline shrink-0 mr-1"
                        >
                          Ver página
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditPhase(phase)}
                          className="shrink-0 h-8 w-8"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removePhase(pi)}
                          className="shrink-0 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={phases.length <= 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {showNewPhase ? (
                  <div className="rounded-lg border-2 border-dashed border-primary/30 p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                      Nova Etapa
                    </p>
                    <PhaseForm
                      form={newPhase}
                      onChange={setNewPhase}
                      onSave={addPhase}
                      onCancel={() => setShowNewPhase(false)}
                      saveLabel="Adicionar Fase"
                    />
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-dashed"
                    onClick={() => setShowNewPhase(true)}
                  >
                    <Plus className="w-4 h-4" /> Nova Etapa
                  </Button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Add group */}
        <div className="flex gap-3">
          <Input
            placeholder="Nome do novo grupo..."
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGroup()}
            className="flex-1"
          />
          <Button onClick={addGroup} className="gap-2">
            <Plus className="w-4 h-4" /> Adicionar
          </Button>
        </div>

        {groups.length === 0 && (
          <p className="text-center text-muted-foreground py-10">
            Nenhum grupo cadastrado. Adicione um grupo acima.
          </p>
        )}

        {groups.map((group, gi) => (
          <motion.div
            key={group.id}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: gi * 0.05 }}
            className="bg-card rounded-xl shadow-md border border-border p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-foreground">{group.name}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeGroup(group.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-3">
              {phases.map((phase, pi) => {
                const done = group.completedPhases[pi] ?? false;
                return (
                  <label
                    key={phase.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border",
                      done
                        ? "bg-primary/10 border-primary/30"
                        : "bg-muted/50 border-transparent hover:bg-muted"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => togglePhase(group.id, pi)}
                      className="w-5 h-5 accent-primary rounded"
                    />
                    <PhaseIcon icon={phase.icon} className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-sm text-foreground">
                        Fase {pi + 1}: {phase.title}
                      </span>
                      <p className="text-xs text-muted-foreground truncate">{phase.delivery}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </motion.div>
        ))}
      </main>
    </div>
  );
}

/* ─── Shared form component ─────────────────────────────────────── */

interface PhaseFormProps {
  form: PhaseFormState;
  onChange: (form: PhaseFormState) => void;
  onSave: () => void;
  onCancel: () => void;
  saveLabel: string;
}

function PhaseForm({ form, onChange, onSave, onCancel, saveLabel }: PhaseFormProps) {
  const set = (key: keyof PhaseFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...form, [key]: e.target.value });

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="Título"
          value={form.title}
          onChange={set("title")}
        />
        <Input
          placeholder="Etapa (ex: Ideação)"
          value={form.stage}
          onChange={set("stage")}
        />
      </div>
      <Input
        placeholder="Entrega requerida"
        value={form.delivery}
        onChange={set("delivery")}
      />
      <textarea
        placeholder="Descrição da fase (opcional)"
        value={form.description}
        onChange={set("description")}
        rows={3}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
      />
      <div>
        <p className="text-xs text-muted-foreground mb-1">
          Missões <span className="font-normal">(uma por linha)</span>
        </p>
        <textarea
          placeholder={"Missão 1\nMissão 2\nMissão 3"}
          value={form.missions}
          onChange={set("missions")}
          rows={4}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">Ícone:</p>
        <div className="flex flex-wrap gap-1">
          {AVAILABLE_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => onChange({ ...form, icon })}
              className={cn(
                "w-8 h-8 rounded-md flex items-center justify-center border transition-colors",
                form.icon === icon
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-muted"
              )}
            >
              <PhaseIcon icon={icon} className="w-4 h-4 text-foreground" />
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button size="sm" onClick={onSave} className="gap-1">
          <Check className="w-3 h-3" /> {saveLabel}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} className="gap-1">
          <X className="w-3 h-3" /> Cancelar
        </Button>
      </div>
    </div>
  );
}
