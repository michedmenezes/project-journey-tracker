export interface Phase {
  id: number;
  title: string;
  stage: string;
  icon: string; // lucide icon name
  delivery: string;
  description?: string;
  missions?: string[];
}

export interface Group {
  id: string;
  name: string;
  completedPhases: boolean[];
}

export const DEFAULT_PHASES: Phase[] = [
  {
    id: 1,
    title: "Investigadores",
    stage: "Ideação",
    icon: "Search",
    delivery: "Definição do Problema e Mapa Mental de Ideias",
    description: "Nesta fase, vocês se tornam investigadores do problema! O objetivo é entender profundamente o desafio que querem resolver, pesquisar sobre o tema e reunir informações que vão guiar todo o projeto.",
    missions: [
      "Realizar pelo menos 3 entrevistas com pessoas que enfrentam o problema",
      "Criar um mapa mental com todas as ideias levantadas pelo grupo",
      "Escrever uma declaração clara do problema em no máximo 2 frases",
      "Pesquisar soluções existentes e listar pontos positivos e negativos de cada uma",
    ],
  },
  {
    id: 2,
    title: "Arquitetos",
    stage: "Planejamento",
    icon: "ClipboardList",
    delivery: "Canvas de Protótipo e Esboço Técnico",
    description: "Agora que conhecem bem o problema, chegou a hora de planejar a solução! Como arquitetos, vocês vão desenhar a estrutura do projeto antes de construí-lo, pensando em cada detalhe.",
    missions: [
      "Preencher o Canvas de Protótipo com todos os campos",
      "Fazer ao menos 2 esboços diferentes da solução e escolher o melhor",
      "Listar todos os materiais e recursos necessários para construir o protótipo",
      "Dividir as tarefas entre os membros do grupo e criar um cronograma",
    ],
  },
  {
    id: 3,
    title: "Construtores",
    stage: "Prototipagem Inicial",
    icon: "Hammer",
    delivery: "Lista de Materiais e Primeira Versão do Protótipo",
    description: "Mãos à obra! É hora de construir a primeira versão da solução. Nesta fase, vocês transformam os planos em realidade, criando um protótipo funcional que possa ser testado.",
    missions: [
      "Construir a primeira versão do protótipo seguindo o esboço planejado",
      "Documentar com fotos cada etapa da construção",
      "Registrar os desafios encontrados e como foram resolvidos",
      "Preparar uma lista de melhorias identificadas durante a construção",
    ],
  },
  {
    id: 4,
    title: "Testadores",
    stage: "Validação",
    icon: "FlaskConical",
    delivery: "Relatório de Testes com Usuários e Ajustes",
    description: "Todo bom produto precisa ser testado! Nesta fase, vocês colocam o protótipo em contato com pessoas reais para descobrir o que funciona bem e o que precisa melhorar.",
    missions: [
      "Realizar testes do protótipo com pelo menos 5 pessoas diferentes",
      "Criar um formulário para coletar feedbacks dos usuários",
      "Listar os 3 principais problemas identificados nos testes",
      "Implementar as melhorias mais importantes e documentar as mudanças",
    ],
  },
  {
    id: 5,
    title: "Inventores",
    stage: "Finalização",
    icon: "Trophy",
    delivery: "Relatório Final e Protótipo para a Mostra",
    description: "Chegamos ao grande final! É hora de polir o projeto, preparar a apresentação e mostrar para o mundo o que vocês criaram. Vocês são verdadeiros inventores!",
    missions: [
      "Finalizar o protótipo com todas as melhorias implementadas",
      "Escrever o relatório final descrevendo todo o processo e aprendizados",
      "Preparar uma apresentação de 5 minutos para a Mostra de Projetos",
      "Criar um pôster ou material visual para expor o projeto na Mostra",
    ],
  },
];

const STORAGE_KEY = "autoral-progress-groups";
const PHASES_STORAGE_KEY = "autoral-progress-phases";

export function loadPhases(): Phase[] {
  try {
    const data = localStorage.getItem(PHASES_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return DEFAULT_PHASES;
}

export function savePhases(phases: Phase[]): void {
  localStorage.setItem(PHASES_STORAGE_KEY, JSON.stringify(phases));
}

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

/** Available icons for phases */
export const AVAILABLE_ICONS = [
  "Search", "ClipboardList", "Hammer", "FlaskConical", "Trophy",
  "Lightbulb", "Rocket", "Target", "Star", "BookOpen",
  "Pencil", "Compass", "Wrench", "Zap", "Heart",
  "Flag", "Award", "Map", "Eye", "Brain",
];
