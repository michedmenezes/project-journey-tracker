import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Trash2, ArrowLeft, Lock, ShieldCheck, Pencil, Check, X, Filter, LogOut, FileUp, Download, LayoutDashboard, Settings } from "lucide-react";
import PhaseIcon from "@/components/PhaseIcon";
import ThemeToggle from "@/components/ThemeToggle";
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
  missions: string;
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

      const className = prompt("Para qual turma deseja importar estes grupos? (Ex: 8º Ano C)");
      if (!className) return;

      const newGroups: Group[] = [];
      
      lines.forEach((line, index) => {
        const parts = line.split(",").map(p => p.trim());
        if (parts.length > 0) {
          const groupName = parts[0];
          
          if (index === 0 && (groupName.toLowerCase() === "grupo" || groupName.toLowerCase() === "nome")) {
            return;
          }

          if (groupName) {
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
      <div className="min-h-screen bg-background flex items-center justify-center px-4 transition-colors duration-300">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm materio-card rounded-xl p-8 text-center"
        >
          <div className="materio-gradient w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6 shadow-materio-primary">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-1 tracking-tight">Painel do Professor</h2>
          <p className="text-muted-foreground text-xs mb-8 font-bold uppercase tracking-widest">Acesso Restrito</p>
          <Input
            type="password"
            placeholder="Senha de acesso"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className={cn("mb-4 bg-secondary/50 border-border rounded-lg text-center font-bold tracking-widest h-11", error && "border-red-500/50")}
          />
          {error && <p className="text-red-500 text-[10px] mb-4 font-bold uppercase tracking-widest">Senha incorreta</p>}
          <Button onClick={handleLogin} className="w-full h-11 font-bold">
            Entrar
          </Button>
          <div className="mt-6 flex justify-center">
            <ThemeToggle />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header Admin */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="hover:bg-secondary p-2 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div className="bg-brand-500/10 p-2 rounded-lg border border-brand-500/20">
              <ShieldCheck className="w-6 h-6 text-brand-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Configurações</h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">Gestão de Projetos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-red-500 gap-2 font-bold">
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="phases" className="materio-card rounded-xl border-none overflow-hidden px-6">
            <AccordionTrigger className="text-lg font-bold text-foreground hover:no-underline py-6">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-brand-500" />
                <span>Gerenciar Etapas do Projeto ({phases.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pb-6">
                {phases.map((phase, pi) => (
                  <div key={phase.id} className="rounded-lg bg-secondary/30 border border-border p-4 transition-all hover:border-brand-500/30">
                    {editingPhaseId === phase.id ? (
                      <PhaseForm
                        form={editForm}
                        onChange={setEditForm}
                        onSave={saveEditPhase}
                        onCancel={cancelEdit}
                        saveLabel="Salvar Alterações"
                      />
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="bg-card p-2 rounded-lg border border-border shadow-sm">
                          <PhaseIcon icon={phase.icon} className="w-5 h-5 text-brand-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-sm text-foreground">
                            Fase {pi + 1}: {phase.title}
                          </span>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                            {phase.stage} — {phase.delivery}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/fase/${phase.id}`}
                            className="text-[10px] font-bold uppercase tracking-widest text-brand-500 hover:underline mr-2"
                          >
                            Ver página
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditPhase(phase)}
                            className="h-9 w-9 rounded-lg hover:bg-brand-500/10 text-muted-foreground hover:text-brand-500"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePhase(pi)}
                            className="h-9 w-9 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                            disabled={phases.length <= 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {showNewPhase ? (
                  <div className="rounded-xl border-2 border-dashed border-brand-500/30 p-6 bg-brand-500/5">
                    <p className="text-[10px] font-bold text-brand-500 mb-6 uppercase tracking-widest">
                      Criar Nova Etapa
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
                    className="w-full gap-2 border-dashed border-border hover:bg-secondary/50 h-12 font-bold text-muted-foreground uppercase tracking-widest text-[10px]"
                    onClick={() => setShowNewPhase(true)}
                  >
                    <Plus className="w-4 h-4" /> Nova Etapa
                  </Button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Gestão de Equipes</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto bg-card border border-border px-4 py-2 rounded-lg shadow-sm">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedClassFilter} onValueChange={setSelectedClassFilter}>
                <SelectTrigger className="w-full sm:w-[180px] border-none bg-transparent shadow-none focus:ring-0 text-foreground font-bold">
                  <SelectValue placeholder="Todas as turmas" />
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

          <div className="materio-card rounded-xl p-8 space-y-8 border-none">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-foreground uppercase tracking-widest">Adicionar Grupos</p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Individual ou em massa via CSV</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadCSVTemplate} className="text-[9px] font-bold gap-2">
                  <Download className="w-3.5 h-3.5" /> Modelo CSV
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" size="sm" className="text-[9px] font-bold gap-2 bg-brand-500/10 border-brand-500/20 text-brand-500 hover:bg-brand-500/20">
                    <FileUp className="w-3.5 h-3.5" /> Importar CSV
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-border">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Nome da equipe"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="flex-1 h-11 bg-secondary/30 border-border rounded-lg text-sm font-semibold"
                />
                <Input
                  placeholder="Turma (ex: 8º Ano A)"
                  value={newGroupClass}
                  onChange={(e) => setNewGroupClass(e.target.value)}
                  className="w-full sm:w-[200px] h-11 bg-secondary/30 border-border rounded-lg text-sm font-semibold"
                />
                <Button onClick={addGroup} className="h-11 px-8 font-bold">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGroups.map((group, gi) => (
              <motion.div
                key={group.id}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: gi * 0.05 }}
                className="materio-card rounded-xl p-6 border-none hover:border-brand-500/30"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1 min-w-0 mr-4">
                    <h3 className="text-lg font-bold text-foreground tracking-tight truncate">{group.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      <span className="text-[9px] font-bold bg-brand-500/10 text-brand-500 px-2.5 py-1 rounded-md uppercase tracking-widest border border-brand-500/10">
                        {group.class}
                      </span>
                      {group.members && group.members.length > 0 && (
                        <p className="text-[10px] text-muted-foreground italic truncate font-medium">
                          {group.members.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeGroup(group.id)}
                    className="h-9 w-9 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {phases.map((phase, pi) => {
                    const done = group.completedPhases[pi] ?? false;
                    return (
                      <label
                        key={phase.id}
                        className={cn(
                          "flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all border text-[10px] font-bold uppercase tracking-widest",
                          done
                            ? "bg-brand-500/10 border-brand-500/20 text-brand-500"
                            : "bg-secondary/20 border-border text-muted-foreground hover:border-brand-500/30 hover:bg-secondary/40"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded-md flex items-center justify-center border transition-all",
                          done ? "bg-brand-500 border-brand-500 text-white shadow-materio-primary" : "border-border bg-card"
                        )}>
                          {done && <Check className="w-3 h-3" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={() => togglePhase(group.id, pi)}
                          className="hidden"
                        />
                        <PhaseIcon icon={phase.icon} className={cn("w-3.5 h-3.5 shrink-0", done ? "text-brand-500" : "text-muted-foreground")} />
                        <span className="flex-1 truncate">
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Título da Fase</label>
          <Input
            placeholder="Ex: Investigadores"
            value={form.title}
            onChange={set("title")}
            className="h-11 bg-card border-border rounded-lg font-semibold"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Etapa do Projeto</label>
          <Input
            placeholder="Ex: Ideação"
            value={form.stage}
            onChange={set("stage")}
            className="h-11 bg-card border-border rounded-lg font-semibold"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Entrega Requerida</label>
        <Input
          placeholder="O que o grupo deve entregar?"
          value={form.delivery}
          onChange={set("delivery")}
          className="h-11 bg-card border-border rounded-lg font-semibold"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Descrição Detalhada</label>
        <textarea
          placeholder="Explique o que acontece nesta fase..."
          value={form.description}
          onChange={set("description")}
          rows={3}
          className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 resize-none text-foreground"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Missões <span className="font-medium lowercase">(uma por linha)</span>
        </label>
        <textarea
          placeholder={"Missão 1\nMissão 2\nMissão 3"}
          value={form.missions}
          onChange={set("missions")}
          rows={4}
          className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 resize-none text-foreground"
        />
      </div>
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ícone Representativo</label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => onChange({ ...form, icon })}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center border transition-all",
                form.icon === icon
                  ? "border-brand-500 bg-brand-500/10 text-brand-500 shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-brand-500/30 hover:text-foreground"
              )}
            >
              <PhaseIcon icon={icon} className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <Button onClick={onSave} className="font-bold px-8">
          <Check className="w-4 h-4 mr-2" /> {saveLabel}
        </Button>
        <Button variant="ghost" onClick={onCancel} className="text-muted-foreground hover:text-foreground font-bold px-6">
          <X className="w-4 h-4 mr-2" /> Cancelar
        </Button>
      </div>
    </div>
  );
}
