import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export interface TrainingModule {
  id: string;
  title: string;
  category: string;
  content: string;
}

export interface PostTemplate {
  id: string;
  name: string;
  bgUrl: string;
}

export interface NotebookEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  time: string;
  subject: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar: string;
  score: number;
  totalScore?: number;
  battlesWon: number;
  panoramaScore?: number;
  panoramaTime?: number;
  whoAmIScore?: number;
  timelineScore?: number;
  crosswordScore?: number;
  hangmanScore?: number;
  wordSearchScore?: number;
  cryptogramScore?: number;
  anagramScore?: number;
  riddlesScore?: number;
  sonOfManScore?: number;
  davidScore?: number;
  abrahamScore?: number;
  mosesScore?: number;
  paulScore?: number;
  credits?: number;
  lastScore: number;
  month: number;
  trend: 'up' | 'down' | 'same';
  rank?: number;
}
