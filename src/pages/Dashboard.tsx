import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings, Rocket } from "lucide-react";
import PhaseTracker from "@/components/PhaseTracker";
import { loadGroups, type Group } from "@/lib/phases";

export default function Dashboard() {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    setGroups(loadGroups());

    const onStorage = () => setGroups(loadGroups());
    window.addEventListener("storage", onStorage);

    // Poll every 2s for same-tab updates from admin
    const interval = setInterval(() => setGroups(loadGroups()), 2000);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="py-8 px-4 text-center text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Rocket className="w-8 h-8" />
            <h1 className="font-display text-3xl sm:text-4xl font-bold">Projeto Autoral</h1>
          </div>
          <p className="text-primary-foreground/80 text-sm sm:text-base">
            Acompanhe o progresso dos grupos pelos Níveis de Conquista
          </p>
        </motion.div>
      </header>

      {/* Groups */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        {groups.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-2">Nenhum grupo cadastrado ainda.</p>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              <Settings className="w-4 h-4" /> Ir para o painel do professor
            </Link>
          </div>
        ) : (
          groups.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
            >
              <PhaseTracker group={g} />
            </motion.div>
          ))
        )}
      </main>

      {/* FAB to admin */}
      <Link
        to="/admin"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        title="Painel do Professor"
      >
        <Settings className="w-6 h-6" />
      </Link>
    </div>
  );
}
