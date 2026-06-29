import type { Lead } from '../types';

// Pontos concedidos ao médico cada vez que uma conexão é concretizada
// (quando o médico aprova e libera o WhatsApp para a empresa).
export const POINTS_PER_CONNECTION = 50;

// Pontos ao marcar interesse em produto, workshop, evento ou empresa.
export const POINTS_PER_INTEREST = 10;

export interface Level {
  index: number;
  name: string;
  min: number;
  color: string;
}

// Faixas de nível. `min` é o total de pontos necessário para entrar no nível.
export const LEVELS: Level[] = [
  { index: 0, name: 'Iniciante',          min: 0,    color: '#7FA7B8' },
  { index: 1, name: 'Conectado',          min: 100,  color: '#4AA8FF' },
  { index: 2, name: 'Ativo',              min: 300,  color: '#1EA97C' },
  { index: 3, name: 'Referência',         min: 600,  color: '#F58220' },
  { index: 4, name: 'Embaixador Tessy',   min: 1000, color: '#E63E8C' },
];

export interface LevelProgress {
  level: Level;
  next: Level | null;
  points: number;
  pointsIntoLevel: number;
  pointsForNextLevel: number;
  percent: number;
  isMax: boolean;
}

export function getLevelProgress(points: number): LevelProgress {
  const safePoints = Math.max(0, Math.floor(points || 0));
  let level = LEVELS[0];
  for (const candidate of LEVELS) {
    if (safePoints >= candidate.min) level = candidate;
  }
  const next = LEVELS[level.index + 1] ?? null;
  const isMax = next === null;
  const span = next ? next.min - level.min : 0;
  const pointsIntoLevel = safePoints - level.min;
  const pointsForNextLevel = next ? next.min - safePoints : 0;
  const percent = isMax || span <= 0
    ? 100
    : Math.min(100, Math.round((pointsIntoLevel / span) * 100));

  return {
    level,
    next,
    points: safePoints,
    pointsIntoLevel,
    pointsForNextLevel,
    percent,
    isMax,
  };
}

// Nº de conexões concretizadas (leads aprovados) do médico.
export function countApprovedConnections(leads: Lead[]): number {
  return leads.filter(lead => lead.connectionStatus === 'approved').length;
}

export interface Badge {
  id: string;
  label: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

// Selos baseados no nº de conexões concretizadas + pontos acumulados.
export function getBadges(connections: number, points: number): Badge[] {
  return [
    {
      id: 'first',
      label: 'Primeira conexão',
      description: 'Concretize sua primeira conexão com uma empresa.',
      icon: '🤝',
      unlocked: connections >= 1,
    },
    {
      id: 'five',
      label: '5 conexões',
      description: 'Conecte-se com 5 empresas.',
      icon: '⭐',
      unlocked: connections >= 5,
    },
    {
      id: 'ten',
      label: '10 conexões',
      description: 'Conecte-se com 10 empresas.',
      icon: '🔥',
      unlocked: connections >= 10,
    },
    {
      id: 'twentyfive',
      label: '25 conexões',
      description: 'Conecte-se com 25 empresas.',
      icon: '🏆',
      unlocked: connections >= 25,
    },
    {
      id: 'ambassador',
      label: 'Embaixador',
      description: 'Alcance 1000 pontos na Tessy.',
      icon: '💎',
      unlocked: points >= 1000,
    },
  ];
}
