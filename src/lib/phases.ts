export interface Phase {
  id: number;
  title: string;
  stage: string;
  icon: string; // lucide icon name
  delivery: string;
}

export interface Group {
  id: string;
  name: string;
  completedPhases: boolean[];
}

export const PHASES: Phase[] = [
  {
    id: 1,
    title: "Investigadores",
    stage: "Ideação",
    icon: "Search",
    delivery: "Definição do Problema e Mapa Mental de Ideias",
  },
  {
    id: 2,
    title: "Arquitetos",
    stage: "Planejamento",
    icon: "ClipboardList",
    delivery: "Canvas de Protótipo e Esboço Técnico",
  },
  {
    id: 3,
    title: "Construtores",
    stage: "Prototipagem Inicial",
    icon: "Hammer",
    delivery: "Lista de Materiais e Primeira Versão do Protótipo",
  },
  {
    id: 4,
    title: "Testadores",
    stage: "Validação",
    icon: "FlaskConical",
    delivery: "Relatório de Testes com Usuários e Ajustes",
  },
  {
    id: 5,
    title: "Inventores",
    stage: "Finalização",
    icon: "Trophy",
    delivery: "Relatório Final e Protótipo para a Mostra",
  },
];

const STORAGE_KEY = "autoral-progress-groups";

export function loadGroups(): Group[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return [];
}

export function saveGroups(groups: Group[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
}
