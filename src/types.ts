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
