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
  gamesPlayed: number;
  points: number;
  authorized: boolean;
  trend: 'up' | 'down' | 'stable';
}

export const RANKS: Rank[] = [
  {
    id: 1,
    name: 'Marinheiro',
    category: 'PRAÇAS',
    stars: 1,
    requirements: [],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kleber&backgroundColor=f8fafc&hair=shortHairTheCaesar&facialHair=moustacheMagnum&clothes=blazerShirt&mouth=serious'
  },
  {
    id: 2,
    name: 'Cabo',
    category: 'PRAÇAS',
    stars: 1,
    requirements: [],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bruno&backgroundColor=f1f5f9&hair=shortHairSides&clothes=shirtCrewNeck'
  },
  {
    id: 3,
    name: '3° Sargento',
    category: 'PRAÇAS',
    stars: 2,
    requirements: [],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos&backgroundColor=e2e8f0&hair=shortHairTheCaesar&clothes=shirtCrewNeck'
  },
  {
    id: 4,
    name: '2° Sargento',
    category: 'PRAÇAS',
    stars: 2,
    requirements: [],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel&backgroundColor=cbd5e1&hair=shortHairDreads01&clothes=shirtCrewNeck'
  },
  {
    id: 5,
    name: '1° Sargento',
    category: 'PRAÇAS',
    stars: 3,
    requirements: [],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eduardo&backgroundColor=ecfdf5&hair=shortHairShortWaved&clothes=collarSweater'
  },
  {
    id: 6,
    name: 'Suboficial',
    category: 'PRAÇAS',
    stars: 3,
    requirements: [],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fernando&backgroundColor=d1fae5&hair=shortHairFrizzle&clothes=collarSweater'
  },
  {
    id: 7,
    name: '2° Tenente',
    category: 'OFICIAIS',
    stars: 1,
    requirements: [],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriel&backgroundColor=a7f3d0&hair=shortHairSides&clothes=collarSweater'
  },
  {
    id: 8,
    name: '1° Tenente',
    category: 'OFICIAIS',
    stars: 2,
    requirements: [],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Henrique&backgroundColor=6ee7b7&hair=shortHairTheCaesarSidePart&clothes=collarSweater'
  },
  {
    id: 9,
    name: 'Capitão-Tenente',
    category: 'OFICIAIS',
    stars: 3,
    requirements: [],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Igor&backgroundColor=fef3c7&hair=shortHairShortCurly&clothes=blazerShirt'
  },
  {
    id: 10,
    name: 'Capitão-do-mar',
    category: 'OFICIAIS',
    stars: 3,
    requirements: [],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leandro&backgroundColor=fde68a&hair=shortHairShortFlat&facialHair=beardMajestic&mouth=serious&eyebrow=angryNatural&clothes=blazerShirt'
  },
  {
    id: 11,
    name: 'Almirante-de-Esquadra',
    category: 'ALTA PATENTE',
    stars: 2,
    requirements: [],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arthur&backgroundColor=fcd34d&hair=shortHairShortFlat&clothes=shirtCrewNeck'
  },
  {
    id: 12,
    name: 'Almirante',
    category: 'ALTA PATENTE',
    stars: 3,
    requirements: [],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao&backgroundColor=fbbf24&hair=shortHairShortFlat&clothes=blazerShirt'
  },
];
