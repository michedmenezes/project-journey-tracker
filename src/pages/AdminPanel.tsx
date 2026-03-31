import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Trash2, ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import PhaseIcon from "@/components/PhaseIcon";
import { PHASES, loadGroups, saveGroups, type Group } from "@/lib/phases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ADMIN_PASSWORD = "prof2025";

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState("");

  useEffect(() => {
    if (authenticated) setGroups(loadGroups());
  }, [authenticated]);

  const persist = useCallback((updated: Group[]) => {
    setGroups(updated);
    saveGroups(updated);
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
      completedPhases: [false, false, false, false, false],
    };
    persist([...groups, g]);
    setNewGroupName("");
  };

  const removeGroup = (id: string) => {
    persist(groups.filter((g) => g.id !== id));
  };

  const togglePhase = (groupId: string, phaseIndex: number) => {
    persist(
      groups.map((g) => {
        if (g.id !== groupId) return g;
        const cp = [...g.completedPhases];
        cp[phaseIndex] = !cp[phaseIndex];
        return { ...g, completedPhases: cp };
      })
    );
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

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
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
              {PHASES.map((phase, pi) => {
                const done = group.completedPhases[pi];
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
                    <div className="min-w-0">
                      <span className="font-semibold text-sm text-foreground">
                        Fase {phase.id}: {phase.title}
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
