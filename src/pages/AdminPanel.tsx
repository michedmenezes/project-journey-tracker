import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Trash2, ArrowLeft, Lock, ShieldCheck, Pencil, Check, X, Filter, LogOut, FileUp, Download } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ADMIN_PASSWORD = "prof2025";
const AUTH_STORAGE_KEY = "autoral-admin-auth";

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
  const [authenticated, setAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupClass, setNewGroupClass] = useState("");
  const [editingPhaseId, setEditingPhaseId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<PhaseFormState>(emptyForm());
  const [newPhase, setNewPhase] = useState<PhaseFormState>(emptyForm());
  const [showNewPhase, setShowNewPhase] = useState(false);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("all");

  useEffect(() => {
    if (authenticated) {
      setGroups(loadGroups());
      setPhases(loadPhases());
    }
  }, [authenticated]);

  const classes = useMemo(() => {
    const uniqueClasses = Array.from(new Set(groups.map((g) => g.class))).filter(Boolean);
    return uniqueClasses.sort();
  }, [groups]);

  const filteredGroups = useMemo(() => {
    if (selectedClassFilter === "all") return groups;
    return groups.filter((g) => g.class === selectedClassFilter);
  }, [groups, selectedClassFilter]);

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
      localStorage.setItem(AUTH_STORAGE_KEY, "true");
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setPassword("");
  };

  const addGroup = () => {
    const name = newGroupName.trim();
    const className = newGroupClass.trim();
    if (!name || !className) return;
    const g: Group = {
      id: crypto.randomUUID(),
      name,
      class: className,
      completedPhases: phases.map(() => false),
    };
    persistGroups([...groups, g]);
    setNewGroupName("");
    setNewGroupClass("");
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
      
      if (lines.length === 0) return;

      // Pergunta a turma para aplicar a todos os grupos do CSV
      const className = prompt("Para qual turma deseja importar estes grupos? (Ex: 8º Ano C)");
      if (!className) return;

      const newGroups: Group[] = [];
      
      lines.forEach((line, index) => {
        const parts = line.split(",").map(p => p.trim());
        if (parts.length > 0) {
          const groupName = parts[0];
          
          // Ignora cabeçalho se o primeiro campo for "Grupo" ou "Nome"
          if (index === 0 && (groupName.toLowerCase() === "grupo" || groupName.toLowerCase() === "nome")) {
            return;
          }

          if (groupName) {
            // Captura integrantes das colunas seguintes, ignorando campos vazios ou "-"
            const members = parts.slice(1).filter(m => m && m !== "-" && m !== "");
            
            newGroups.push({
              id: crypto.randomUUID(),
              name: groupName,
              class: className,
              members: members.length > 0 ? members : undefined,
              completedPhases: phases.map(() => false),
            });
          }
        }
      });

      if (newGroups.length > 0) {
        if (confirm(`Encontramos ${newGroups.length} grupos. Deseja importá-los para a turma "${className}"?`)) {
          persistGroups([...groups, ...newGroups]);
        }
      } else {
        alert("Nenhum grupo válido encontrado no CSV. Certifique-se de que o nome do grupo esteja na primeira coluna.");
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  const downloadCSVTemplate = () => {
    const content = "Grupo,Integrante 1,Integrante 2,Integrante 3,Integrante 4\nGrupo 1,Celina,Daniel,Sofia,Pedro C.\nGrupo 2,Julia,Moema,Luana,-";
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo_grupos.csv";
    a.click();
  };

  const removeGroup = (id: string) => {
    if (confirm("Tem certeza que deseja remover este grupo?")) {
      persistGroups(groups.filter((g) => g.id !== id));
    }
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
    if (confirm("Tem certeza que deseja remover esta etapa? Isso afetará o progresso de todos os grupos.")) {
      const updated = phases.filter((_, i) => i !== phaseIndex);
      persistPhases(updated);
      persistGroups(groups.map((g) => ({
        ...g,
        completedPhases: g.completedPhases.filter((_, i) => i !== phaseIndex),
      })));
    }
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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <ShieldCheck className="w-7 h-7" />
            <h1 className="font-display text-2xl font-bold">Painel do Professor</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground hover:bg-white/10 gap-2">
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
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

        {/* Group Management Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="font-display text-xl font-bold text-foreground">Equipes por Turma</h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedClassFilter} onValueChange={setSelectedClassFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por turma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as turmas</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Add group & CSV Import */}
          <div className="bg-card rounded-xl shadow-md border border-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Gerenciar Equipes</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadCSVTemplate} className="text-xs gap-1.5 h-8">
                  <Download className="w-3.5 h-3.5" /> Modelo CSV
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8 bg-primary/5 border-primary/20 text-primary hover:bg-primary/10">
                    <FileUp className="w-3.5 h-3.5" /> Importar CSV
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="pt-2 border-t border-border/50">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Adicionar Individualmente</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Nome da equipe (ex: Alpha)"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="flex-1 h-9 text-sm"
                />
                <Input
                  placeholder="Turma (ex: 8º Ano A)"
                  value={newGroupClass}
                  onChange={(e) => setNewGroupClass(e.target.value)}
                  className="w-full sm:w-[200px] h-9 text-sm"
                />
                <Button onClick={addGroup} size="sm" className="gap-2 h-9">
                  <Plus className="w-4 h-4" /> Adicionar
                </Button>
              </div>
            </div>
          </div>

          {filteredGroups.length === 0 && (
            <p className="text-center text-muted-foreground py-10 bg-muted/20 rounded-xl border border-dashed">
              Nenhum grupo encontrado para esta seleção.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGroups.map((group, gi) => (
              <motion.div
                key={group.id}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: gi * 0.05 }}
                className="bg-card rounded-xl shadow-md border border-border p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className="font-display text-lg font-bold text-foreground truncate">{group.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {group.class}
                      </span>
                      {group.members && group.members.length > 0 && (
                        <p className="text-[10px] text-muted-foreground italic truncate">
                          {group.members.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeGroup(group.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {phases.map((phase, pi) => {
                    const done = group.completedPhases[pi] ?? false;
                    return (
                      <label
                        key={phase.id}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border text-sm",
                          done
                            ? "bg-primary/5 border-primary/20"
                            : "bg-muted/30 border-transparent hover:bg-muted"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={() => togglePhase(group.id, pi)}
                          className="w-4 h-4 accent-primary rounded"
                        />
                        <PhaseIcon icon={phase.icon} className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className={cn("flex-1 truncate", done ? "text-foreground font-medium" : "text-muted-foreground")}>
                          Fase {pi + 1}: {phase.title}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
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
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider">Título da Fase</label>
          <Input
            placeholder="Ex: Investigadores"
            value={form.title}
            onChange={set("title")}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider">Etapa do Projeto</label>
          <Input
            placeholder="Ex: Ideação"
            value={form.stage}
            onChange={set("stage")}
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-foreground uppercase tracking-wider">Entrega Requerida</label>
        <Input
          placeholder="O que o grupo deve entregar?"
          value={form.delivery}
          onChange={set("delivery")}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-foreground uppercase tracking-wider">Descrição Detalhada</label>
        <textarea
          placeholder="Explique o que acontece nesta fase..."
          value={form.description}
          onChange={set("description")}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-foreground uppercase tracking-wider">
          Missões <span className="font-normal lowercase">(uma por linha)</span>
        </label>
        <textarea
          placeholder={"Missão 1\nMissão 2\nMissão 3"}
          value={form.missions}
          onChange={set("missions")}
          rows={4}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-foreground uppercase tracking-wider">Ícone Representativo</label>
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
