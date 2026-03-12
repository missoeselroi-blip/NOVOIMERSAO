import { LucideIcon } from 'lucide-react';

export interface ForumPost {
  id: string;
  author: string;
  authorRank: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: ForumReply[];
}

export interface ForumReply {
  id: string;
  author: string;
  authorRank: string;
  content: string;
  timestamp: string;
}

export type RankCategory = 'PRAÇAS' | 'OFICIAIS' | 'ALTA PATENTE';

export interface Rank {
  id: number;
  name: string;
  category: RankCategory;
  stars: number;
  requirements: string[];
  image: string; // URL to avatar
}

export interface UserProfile {
  id: string;
  name: string;
  nickname: string;
  avatar: string;
  rankId: number;
  stars: number;
  membershipMonths: number;
  accessPerWeek: number;
  hoursPerMonth: number;
  shares: number;
  forumParticipations: number;
  contributions: number; // in Reais
  authorized: boolean;
  trend: 'up' | 'down' | 'stable';
}

export const RANKS: Rank[] = [
  {
    id: 1,
    name: 'Marinheiro',
    category: 'PRAÇAS',
    stars: 1,
    requirements: ['1ª Estrela: Ser membro', '2ª Estrela: Acessar 1x por semana', '3ª Estrela: Tempo médio > 1 h/mês'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kleber&backgroundColor=f8fafc&hair=shortHairTheCaesar&facialHair=moustacheMagnum&clothes=blazerShirt&mouth=serious'
  },
  {
    id: 2,
    name: 'Cabo',
    category: 'PRAÇAS',
    stars: 1,
    requirements: ['1ª Estrela: Acessar 4x ao mês', '2ª Estrela: Tempo médio 1 a 2 h/mês', '3ª Estrela: Compartilhar o app'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bruno&backgroundColor=f1f5f9&hair=shortHairSides&clothes=shirtCrewNeck'
  },
  {
    id: 3,
    name: '3° Sargento',
    category: 'PRAÇAS',
    stars: 2,
    requirements: ['1ª Estrela: Acessar 6x ao mês', '2ª Estrela: Tempo médio 1 a 2 h/mês', '3ª Estrela: Compartilhar ou Fórum'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos&backgroundColor=e2e8f0&hair=shortHairTheCaesar&clothes=shirtCrewNeck'
  },
  {
    id: 4,
    name: '2° Sargento',
    category: 'PRAÇAS',
    stars: 2,
    requirements: ['1ª Estrela: Acessar 8x ao mês', '2ª Estrela: Tempo médio 2 a 3 h/mês', '3ª Estrela: Compartilhar ou Fórum 1x/mês'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel&backgroundColor=cbd5e1&hair=shortHairDreads01&clothes=shirtCrewNeck'
  },
  {
    id: 5,
    name: '1° Sargento',
    category: 'PRAÇAS',
    stars: 3,
    requirements: ['1ª Estrela: Contribuir (> R$ 1)', '2ª Estrela: Tempo médio 3 a 4 h/mês', '3ª Estrela: Compartilhar ou Fórum 2x/mês'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eduardo&backgroundColor=ecfdf5&hair=shortHairShortWaved&clothes=collarSweater'
  },
  {
    id: 6,
    name: 'Suboficial',
    category: 'PRAÇAS',
    stars: 3,
    requirements: ['1ª Estrela: Acessar 8x ao mês', '2ª Estrela: Tempo médio 4 a 5 h/mês', '3ª Estrela: Compartilhar ou Fórum 3x/mês'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fernando&backgroundColor=d1fae5&hair=shortHairFrizzle&clothes=collarSweater'
  },
  {
    id: 7,
    name: '2° Tenente',
    category: 'OFICIAIS',
    stars: 1,
    requirements: ['1ª Estrela: Contribuir (> R$ 5/mês)', '2ª Estrela: Tempo médio 5 a 6 h/mês', '3ª Estrela: Compartilhar ou Fórum 4x/mês'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriel&backgroundColor=a7f3d0&hair=shortHairSides&clothes=collarSweater'
  },
  {
    id: 8,
    name: '1° Tenente',
    category: 'OFICIAIS',
    stars: 2,
    requirements: ['1ª Estrela: Contribuir (> R$ 10/mês)', '2ª Estrela: Tempo médio 6 a 7 h/mês', '3ª Estrela: Compartilhar ou Fórum 5x/mês'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Henrique&backgroundColor=6ee7b7&hair=shortHairTheCaesarSidePart&clothes=collarSweater'
  },
  {
    id: 9,
    name: 'Capitão-Tenente',
    category: 'OFICIAIS',
    stars: 3,
    requirements: ['1ª Estrela: Membro 9 meses', '2ª Estrela: Tempo médio 7 a 8 h/mês', '3ª Estrela: Acessar 15x ao mês'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Igor&backgroundColor=fef3c7&hair=shortHairShortCurly&clothes=blazerShirt'
  },
  {
    id: 10,
    name: 'Capitão-do-mar',
    category: 'OFICIAIS',
    stars: 3,
    requirements: ['1ª Estrela: Membro 10 meses', '2ª Estrela: Tempo médio 8 a 9 h/mês', '3ª Estrela: Acessar 20x ao mês'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leandro&backgroundColor=fde68a&hair=shortHairShortFlat&facialHair=beardMajestic&mouth=serious&eyebrow=angryNatural&clothes=blazerShirt'
  },
  {
    id: 11,
    name: 'Almirante-de-Esquadra',
    category: 'ALTA PATENTE',
    stars: 2,
    requirements: ['1ª Estrela: Membro 11 meses', '2ª Estrela: Tempo médio 9 a 10 h/mês', '3ª Estrela: Acessar 25x ao mês'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arthur&backgroundColor=fcd34d&hair=shortHairShortFlat&clothes=shirtCrewNeck'
  },
  {
    id: 12,
    name: 'Almirante',
    category: 'ALTA PATENTE',
    stars: 3,
    requirements: ['1ª Estrela: Membro 12 meses', '2ª Estrela: Tempo médio > 10 h/mês', '3ª Estrela: Acessar 30x ao mês'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao&backgroundColor=fbbf24&hair=shortHairShortFlat&clothes=blazerShirt'
  },
];
