import React from 'react';
import { 
  GraduationCap, 
  Flame, 
  MessageSquare, 
  Users, 
  Coins, 
  Clock,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../types';

interface CoursesPageProps {
  onNavigate: (tab: string) => void;
}

export default function CoursesPage({ onNavigate }: CoursesPageProps) {
  const courses = [
    {
      id: 'theology',
      title: 'Curso de Teologia',
      desc: 'Conhecimento profundo das Escrituras e doutrinas cristãs.',
      icon: <GraduationCap size={32} />,
      status: 'active',
      color: 'blue'
    },
    {
      id: 'evangelism',
      title: 'Curso de Evangelismo',
      desc: 'Capacitação prática para o cumprimento do IDE.',
      icon: <Flame size={32} />,
      status: 'active',
      color: 'orange'
    },
    {
      id: 'storytelling',
      title: 'Curso de Contação de Estórias',
      desc: 'A arte de transmitir verdades bíblicas através de narrativas.',
      icon: <BookOpen size={32} />,
      status: 'coming_soon',
      color: 'purple'
    },
    {
      id: 'leadership',
      title: 'Curso de Liderança de Pequenos Grupos',
      desc: 'Desenvolvendo líderes para o pastoreio mútuo e comunhão.',
      icon: <Users size={32} />,
      status: 'coming_soon',
      color: 'green'
    },
    {
      id: 'finance',
      title: 'Curso de Finanças Bíblicas e Investimentos',
      desc: 'Mordomia cristã e princípios bíblicos para a vida financeira.',
      icon: <Coins size={32} />,
      status: 'coming_soon',
      color: 'amber'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 pb-32 pt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => course.status === 'active' && onNavigate(course.id)}
            className={cn(
              "group relative p-8 rounded-[2.5rem] border-2 transition-all duration-300",
              course.status === 'active' 
                ? "bg-white dark:bg-zinc-900 border-stone-100 dark:border-zinc-800 hover:border-orange-200 dark:hover:border-orange-900 cursor-pointer shadow-sm hover:shadow-xl" 
                : "bg-stone-50 dark:bg-zinc-900/50 border-stone-100 dark:border-zinc-800 opacity-75 grayscale cursor-not-allowed"
            )}
          >
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300 shadow-lg",
              course.color === 'blue' ? "bg-blue-600 text-white shadow-blue-600/20" :
              course.color === 'orange' ? "bg-orange-600 text-white shadow-orange-600/20" :
              course.color === 'purple' ? "bg-purple-600 text-white shadow-purple-600/20" :
              course.color === 'green' ? "bg-green-600 text-white shadow-green-600/20" :
              "bg-amber-600 text-white shadow-amber-600/20"
            )}>
              {course.icon}
            </div>

            <h3 className="text-2xl font-bold mb-3 text-stone-900 dark:text-zinc-100">{course.title}</h3>
            <p className="text-stone-500 dark:text-zinc-400 leading-relaxed mb-6">{course.desc}</p>

            <div className="flex items-center justify-between mt-auto">
              {course.status === 'active' ? (
                <div className="flex items-center gap-2 text-orange-600 font-bold group-hover:translate-x-2 transition-transform">
                  Acessar Curso <ChevronRight size={20} />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-stone-400 font-bold italic">
                  <Clock size={20} /> Em breve - Aguardem
                </div>
              )}
            </div>

            {course.status === 'active' && (
              <div className="absolute top-6 right-6">
                <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-full uppercase tracking-wider">
                  Disponível
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
