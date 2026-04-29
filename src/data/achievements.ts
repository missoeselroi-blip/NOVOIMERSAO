import { LucideIcon, Trophy, Star, Zap, Medal, Crown, Target, Zap as Fast, Heart, Shield, Book, Flame } from 'lucide-react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  goal: number;
  category: 'score' | 'games' | 'streak' | 'special';
  reward: number; // Credits
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'score_100',
    title: 'Estudioso Fiel',
    description: 'Alcance 100 pontos no Quiz Bíblico',
    iconName: 'Trophy',
    goal: 100,
    category: 'score',
    reward: 50
  },
  {
    id: 'score_500',
    title: 'Mestre da Palavra',
    description: 'Alcance 500 pontos totais nos jogos',
    iconName: 'Star',
    goal: 500,
    category: 'score',
    reward: 200
  },
  {
    id: 'games_10',
    title: 'Visitante Assíduo',
    description: 'Jogue 10 vezes qualquer jogo',
    iconName: 'Book',
    goal: 10,
    category: 'games',
    reward: 30
  },
  {
    id: 'games_50',
    title: 'Gamer do Reino',
    description: 'Jogue 50 vezes qualquer jogo',
     iconName: 'Crown',
    goal: 50,
    category: 'games',
    reward: 100
  },
  {
    id: 'streak_3',
    title: 'Foco no Alvo',
    description: 'Mantenha um streak de 3 dias',
    iconName: 'Flame',
    goal: 3,
    category: 'streak',
    reward: 40
  },
  {
    id: 'panorama_master',
    title: 'Visão Geral',
    description: 'Complete o Panorama Bíblico com 100% de acerto',
    iconName: 'Target',
    goal: 1,
    category: 'special',
    reward: 150
  },
  {
    id: 'memory_pro',
    title: 'Memória Abençoada',
    description: 'Complete o Jogo de Memória em menos de 30 segundos',
    iconName: 'Zap',
    goal: 1,
    category: 'special',
    reward: 80
  }
];
