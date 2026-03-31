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
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm glass-card rounded-2xl p-8 text-center"
        >
          <div className="bg-brand-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-500/20 brand-glow">
            <Lock className="w-8 h-8 text-brand-500" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Painel do Professor</h2>
          <p className="text-zinc-500 text-sm mb-8 font-medium uppercase tracking-widest">Digite a senha para acessar</p>
          <Input
            type="password"
            placeholder="Senha de acesso"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className={cn("mb-4 bg-zinc-900 border-white/5 rounded-xl text-center font-bold tracking-widest h-12", error && "border-red-500/50")}
          />
          {error && <p className="text-red-500 text-xs mb-4 font-bold">Senha incorreta</p>}
          <Button onClick={handleLogin} className="w-full bg-brand-500 hover:bg-brand-600 text-white font-black rounded-xl h-12 brand-glow">
            Entrar no Painel
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      <header
        className="py-10 px-6 border-b border-white/5 relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:bg-white/5 p-2 rounded-xl transition-colors">
              <ArrowLeft className="w-6 h-6 text-zinc-400" />
            </Link>
            <div className="bg-brand-500/10 p-2 rounded-xl border border-brand-500/20">
              <ShieldCheck className="w-7 h-7 text-brand-500" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Painel do Professor</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-zinc-400 hover:text-white hover:bg-white/5 gap-2 rounded-xl font-bold">
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        <Accordion type="single" collapsible>
          <AccordionItem value="phases" className="glass-card rounded-2xl px-6 border-none overflow-hidden">
            <AccordionTrigger className="text-lg font-black text-white hover:no-underline py-6">
              ⚙️ Gerenciar Etapas do Projeto ({phases.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pb-6">
                {phases.map((phase, pi) => (
                  <div key={phase.id} className="rounded-xl bg-zinc-900/50 border border-white/5 p-4 transition-all hover:border-white/10">
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
                        <div className="bg-zinc-800 p-2 rounded-xl border border-white/5">
                          <PhaseIcon icon={phase.icon} className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-black text-sm text-white uppercase tracking-wider">
                            Fase {pi + 1}: {phase.title}
                          </span>
                          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                            {phase.stage} — {phase.delivery}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/fase/${phase.id}`}
                            className="text-[10px] font-black uppercase tracking-widest text-brand-500 hover:underline mr-2"
                          >
                            Ver página
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditPhase(phase)}
                            className="h-9 w-9 rounded-xl hover:bg-white/5 text-zinc-400"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePhase(pi)}
                            className="h-9 w-9 rounded-xl hover:bg-red-500/10 text-zinc-500 hover:text-red-500"
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
                  <div className="rounded-2xl border-2 border-dashed border-brand-500/30 p-6 bg-brand-500/5">
                    <p className="text-xs font-black text-brand-500 mb-6 uppercase tracking-[0.2em]">
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
                    className="w-full gap-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 rounded-xl h-12 font-black text-zinc-400 uppercase tracking-widest text-xs"
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <h2 className="text-2xl font-black text-white tracking-tight">Equipes por Turma</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto glass-card px-4 py-2 rounded-xl border border-white/5">
              <Filter className="w-4 h-4 text-zinc-500" />
              <Select value={selectedClassFilter} onValueChange={setSelectedClassFilter}>
                <SelectTrigger className="w-full sm:w-[200px] border-none bg-transparent shadow-none focus:ring-0 text-zinc-300 font-bold">
                  <SelectValue placeholder="Filtrar por turma" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-zinc-200">
                  <SelectItem value="all">Todas as turmas</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-8 space-y-8 border-none shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-white uppercase tracking-widest">Gerenciar Equipes</p>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={downloadCSVTemplate} className="text-[10px] font-black uppercase tracking-widest gap-2 h-9 rounded-xl bg-white/5 border-white/10 text-zinc-400 hover:text-white">
                  <Download className="w-3.5 h-3.5" /> Modelo CSV
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" size="sm" className="text-[10px] font-black uppercase tracking-widest gap-2 h-9 rounded-xl bg-brand-500/10 border-brand-500/20 text-brand-500 hover:bg-brand-500/20">
                    <FileUp className="w-3.5 h-3.5" /> Importar CSV
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-white/5">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Adicionar Individualmente</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Nome da equipe (ex: Alpha)"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="flex-1 h-11 bg-zinc-900 border-white/5 rounded-xl text-sm font-bold"
                />
                <Input
                  placeholder="Turma (ex: 8º Ano A)"
                  value={newGroupClass}
                  onChange={(e) => setNewGroupClass(e.target.value)}
                  className="w-full sm:w-[220px] h-11 bg-zinc-900 border-white/5 rounded-xl text-sm font-bold"
                />
                <Button onClick={addGroup} className="gap-2 h-11 px-8 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black brand-glow">
                  <Plus className="w-4 h-4" /> Adicionar
                </Button>
              </div>
            </div>
          </div>

          {filteredGroups.length === 0 && (
            <p className="text-center text-zinc-600 py-16 glass-card rounded-2xl border-2 border-dashed border-white/5 font-bold italic">
              Nenhum grupo encontrado para esta seleção.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGroups.map((group, gi) => (
              <motion.div
                key={group.id}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: gi * 0.05 }}
                className="glass-card rounded-2xl p-6 border-none shadow-xl hover:bg-surface/80 transition-all"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1 min-w-0 mr-4">
                    <h3 className="text-lg font-black text-white tracking-tight truncate">{group.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="text-[9px] font-black bg-brand-500/10 text-brand-500 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-brand-500/10">
                        {group.class}
                      </span>
                      {group.members && group.members.length > 0 && (
                        <p className="text-[10px] text-zinc-500 italic truncate font-medium">
                          {group.members.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeGroup(group.id)}
                    className="h-9 w-9 rounded-xl hover:bg-red-500/10 text-zinc-600 hover:text-red-500"
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
                          "flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border text-xs font-bold uppercase tracking-wider",
                          done
                            ? "bg-brand-500/10 border-brand-500/20 text-brand-500"
                            : "bg-zinc-900/50 border-white/5 text-zinc-500 hover:border-white/10 hover:bg-zinc-800"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-md flex items-center justify-center border transition-all",
                          done ? "bg-brand-500 border-brand-500 text-white" : "border-white/10 bg-zinc-900"
                        )}>
                          {done && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={() => togglePhase(group.id, pi)}
                          className="hidden"
                        />
                        <PhaseIcon icon={phase.icon} className={cn("w-4 h-4 shrink-0", done ? "text-brand-500" : "text-zinc-600")} />
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
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Título da Fase</label>
          <Input
            placeholder="Ex: Investigadores"
            value={form.title}
            onChange={set("title")}
            className="h-11 bg-zinc-900 border-white/5 rounded-xl font-bold"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Etapa do Projeto</label>
          <Input
            placeholder="Ex: Ideação"
            value={form.stage}
            onChange={set("stage")}
            className="h-11 bg-zinc-900 border-white/5 rounded-xl font-bold"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Entrega Requerida</label>
        <Input
          placeholder="O que o grupo deve entregar?"
          value={form.delivery}
          onChange={set("delivery")}
          className="h-11 bg-zinc-900 border-white/5 rounded-xl font-bold"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Descrição Detalhada</label>
        <textarea
          placeholder="Explique o que acontece nesta fase..."
          value={form.description}
          onChange={set("description")}
          rows={3}
          className="w-full rounded-xl border border-white/5 bg-zinc-900 px-4 py-3 text-sm font-medium ring-offset-background placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 resize-none text-zinc-200"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
          Missões <span className="font-medium lowercase">(uma por linha)</span>
        </label>
        <textarea
          placeholder={"Missão 1\nMissão 2\nMissão 3"}
          value={form.missions}
          onChange={set("missions")}
          rows={4}
          className="w-full rounded-xl border border-white/5 bg-zinc-900 px-4 py-3 text-sm font-medium ring-offset-background placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 resize-none text-zinc-200"
        />
      </div>
      <div className="space-y-4">
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Ícone Representativo</label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => onChange({ ...form, icon })}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
                form.icon === icon
                  ? "border-brand-500 bg-brand-500/10 text-brand-500 brand-glow"
                  : "border-white/5 bg-zinc-900 text-zinc-600 hover:border-white/10 hover:text-zinc-400"
              )}
            >
              <PhaseIcon icon={icon} className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <Button onClick={onSave} className="bg-brand-500 hover:bg-brand-600 text-white font-black px-8 rounded-xl h-11 brand-glow">
          <Check className="w-4 h-4 mr-2" /> {saveLabel}
        </Button>
        <Button variant="ghost" onClick={onCancel} className="text-zinc-500 hover:text-white hover:bg-white/5 font-bold rounded-xl h-11 px-6">
          <X className="w-4 h-4 mr-2" /> Cancelar
        </Button>
      </div>
    </div>
  );
}
