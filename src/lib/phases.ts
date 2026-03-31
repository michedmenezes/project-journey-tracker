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
    description:
      "Nesta fase, os grupos mergulham fundo na investigação do problema que desejam resolver. O objetivo é compreender o contexto, levantar dados e construir uma visão clara do desafio antes de propor qualquer solução.",
    missions: [
      "Realizar ao menos 3 entrevistas com pessoas que vivenciam o problema",
      "Elaborar um mapa mental com todas as causas e consequências identificadas",
      "Escrever uma declaração de problema clara em uma frase",
      "Pesquisar soluções existentes e anotar seus pontos fortes e fracos",
    ],
  },
  {
    id: 2,
    title: "Arquitetos",
    stage: "Planejamento",
    icon: "ClipboardList",
    delivery: "Canvas de Protótipo e Esboço Técnico",
    description:
      "Com o problema bem definido, os grupos passam a planejar a solução. Esta fase é dedicada à estruturação das ideias em um plano concreto, com esboços, divisão de tarefas e definição dos materiais necessários.",
    missions: [
      "Criar ao menos 3 esboços diferentes de possíveis soluções",
      "Escolher a melhor ideia e justificar a escolha por escrito",
      "Preencher o Canvas de Protótipo com todos os campos",
      "Definir a lista preliminar de materiais e ferramentas necessários",
      "Distribuir as responsabilidades entre os membros do grupo",
    ],
  },
  {
    id: 3,
    title: "Construtores",
    stage: "Prototipagem Inicial",
    icon: "Hammer",
    delivery: "Lista de Materiais e Primeira Versão do Protótipo",
    description:
      "É hora de colocar a mão na massa! Os grupos constroem a primeira versão física ou digital do protótipo, aprendendo com os erros e ajustando o projeto conforme avançam.",
    missions: [
      "Construir a primeira versão funcional do protótipo",
      "Documentar cada etapa da construção com fotos ou anotações",
      "Registrar todos os problemas encontrados durante a construção",
      "Realizar ao menos um ajuste significativo com base nos problemas identificados",
    ],
  },
  {
    id: 4,
    title: "Testadores",
    stage: "Validação",
    icon: "FlaskConical",
    delivery: "Relatório de Testes com Usuários e Ajustes",
    description:
      "O protótipo é colocado à prova com usuários reais. Os grupos coletam feedbacks, analisam os resultados e implementam melhorias para garantir que a solução realmente resolve o problema identificado.",
    missions: [
      "Testar o protótipo com ao menos 5 pessoas do público-alvo",
      "Criar um formulário ou roteiro para coletar feedbacks estruturados",
      "Listar os 3 principais pontos de melhoria apontados pelos testadores",
      "Implementar ao menos 2 melhorias no protótipo com base nos feedbacks",
      "Redigir o Relatório de Testes com resultados e aprendizados",
    ],
  },
  {
    id: 5,
    title: "Inventores",
    stage: "Finalização",
    icon: "Trophy",
    delivery: "Relatório Final e Protótipo para a Mostra",
    description:
      "A fase final é dedicada a polir o protótipo, preparar a apresentação e documentar toda a jornada. Os grupos se preparam para apresentar sua solução na Mostra de Projetos.",
    missions: [
      "Finalizar o protótipo com todos os ajustes aplicados",
      "Elaborar o Relatório Final com a descrição completa do projeto",
      "Preparar uma apresentação de no máximo 5 minutos para a Mostra",
      "Criar um pôster ou banner visual para expor na Mostra",
      "Ensaiar a apresentação ao menos 2 vezes com o grupo completo",
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
