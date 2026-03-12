import React, { useState, useEffect } from 'react';
import { 
  User, 
  Trophy, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Award,
  ArrowLeft,
  Calendar,
  GraduationCap,
  Star,
  Brain,
  Zap,
  Pencil,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import TheologyPage from './TheologyPage';
import RedacaoPage from './RedacaoPage';
import { cn } from '../types';

const THEOLOGY_SUBJECTS = [
  'Bibliologia', 'Teontologia', 'Cristologia', 'Pneumatologia', 
  'Antropologia Bíblica', 'Hamartiologia', 'Soteriologia', 
  'Eclesiologia', 'Escatologia', 'Angelologia', 
  'Hermenêutica Bíblica', 'Homilética'
];

export default function StudentPage({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'theology' | 'redacao'>('profile');
  const [theologyProgress, setTheologyProgress] = useState<Record<string, any>>({});
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    const savedProgress = localStorage.getItem('theology_progress');
    if (savedProgress) setTheologyProgress(JSON.parse(savedProgress));

    const savedCerts = localStorage.getItem('theology_certificates');
    if (savedCerts) setCertificates(JSON.parse(savedCerts));
  }, []);

  const handleScoreChange = (subject: string, field: 'evaluation' | 'redacao' | 'completion', value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    const max = field === 'evaluation' ? 50 : field === 'redacao' ? 20 : 100;
    const finalValue = Math.min(numValue, max);

    const current = theologyProgress[subject] || {};
    const newProgress = {
      ...theologyProgress,
      [subject]: {
        ...current,
        [field]: finalValue
      }
    };
    setTheologyProgress(newProgress);
    localStorage.setItem('theology_progress', JSON.stringify(newProgress));
  };

  const calculateTotal = (subject: string) => {
    const data = theologyProgress[subject] || {};
    const evalScore = data.evaluation || 0;
    const redScore = data.redacao || 0;
    const videoScore = data.video ? 10 : 0;
    const slidesScore = data.slides ? 10 : 0;
    const podcastScore = data.podcast ? 10 : 0;
    return evalScore + redScore + videoScore + slidesScore + podcastScore;
  };

  const totalPoints = Object.keys(theologyProgress).reduce((acc, subject) => {
    return acc + calculateTotal(subject);
  }, 0);

  const completedSubjects = Object.keys(theologyProgress).filter(k => theologyProgress[k]?.completed);

  const chartData = THEOLOGY_SUBJECTS.map(subject => {
    const data = theologyProgress[subject] || {};
    return {
      name: subject.split(' ')[0], // Short name for the chart X-axis
      fullSubject: subject,
      Avaliação: data.evaluation || 0,
      Redação: data.redacao || 0,
      Extras: (data.video ? 10 : 0) + (data.slides ? 10 : 0) + (data.podcast ? 10 : 0),
      Total: calculateTotal(subject)
    };
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 bg-white dark:bg-zinc-900 p-2 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm w-fit mx-auto">
        <button 
          onClick={() => setActiveSubTab('profile')}
          className={cn(
            "px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2",
            activeSubTab === 'profile' ? "bg-emerald-600 text-white shadow-lg" : "text-stone-500 hover:bg-stone-50 dark:hover:bg-zinc-800"
          )}
        >
          <User size={18} /> Perfil
        </button>
        <button 
          onClick={() => setActiveSubTab('theology')}
          className={cn(
            "px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2",
            activeSubTab === 'theology' ? "bg-emerald-600 text-white shadow-lg" : "text-stone-500 hover:bg-stone-50 dark:hover:bg-zinc-800"
          )}
        >
          <GraduationCap size={18} /> Curso de Teologia
        </button>
        <button 
          onClick={() => setActiveSubTab('redacao')}
          className={cn(
            "px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2",
            activeSubTab === 'redacao' ? "bg-emerald-600 text-white shadow-lg" : "text-stone-500 hover:bg-stone-50 dark:hover:bg-zinc-800"
          )}
        >
          <Pencil size={18} /> Oficina de Redação
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'profile' && (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Header Profile */}
            <div className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border border-stone-200 dark:border-zinc-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5">
                <GraduationCap size={200} />
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 bg-emerald-600 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-2xl shadow-emerald-600/20">
                  <User size={64} />
                </div>
                <div className="text-center md:text-left space-y-2">
                  <div className="flex items-center gap-4">
                    <img 
                      src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
                      alt="Logo" 
                      className="w-10 h-10 object-contain mix-blend-screen"
                      referrerPolicy="no-referrer"
                    />
                    <h2 className="text-4xl font-bold font-display">Página do Aluno</h2>
                    <img 
                      src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
                      alt="Logo" 
                      className="w-10 h-10 object-contain mix-blend-screen"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-stone-500 font-medium">Histórico acadêmico e progresso na Marinha Celestial</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                    <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full text-sm font-bold flex items-center gap-2">
                      <Trophy size={16} /> {totalPoints} Pontos
                    </div>
                    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full text-sm font-bold flex items-center gap-2">
                      <BookOpen size={16} /> {completedSubjects.length} Matérias Concluídas
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Progress Column */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm overflow-x-auto">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Zap className="text-amber-500" size={20} />
                    Progresso das Matérias
                  </h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-stone-400 border-b border-stone-100 dark:border-zinc-800">
                        <th className="text-left py-4 font-bold uppercase tracking-wider text-[10px]">Matéria</th>
                        <th className="text-center py-4 font-bold uppercase tracking-wider text-[10px]">Avaliação (50)</th>
                        <th className="text-center py-4 font-bold uppercase tracking-wider text-[10px]">Redação (20)</th>
                        <th className="text-center py-4 font-bold uppercase tracking-wider text-[10px]">Conclusão (%)</th>
                        <th className="text-center py-4 font-bold uppercase tracking-wider text-[10px]">Extras (30)</th>
                        <th className="text-right py-4 font-bold uppercase tracking-wider text-[10px]">Nota Final</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50 dark:divide-zinc-800">
                      {THEOLOGY_SUBJECTS.map((subject, i) => {
                        const data = theologyProgress[subject] || {};
                        const extras = (data.video ? 10 : 0) + (data.slides ? 10 : 0) + (data.podcast ? 10 : 0);
                        const total = calculateTotal(subject);

                        return (
                          <tr key={i} className="group hover:bg-stone-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                            <td className="py-4 font-bold text-stone-700 dark:text-zinc-300">{subject}</td>
                            <td className="py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button className="p-2 bg-stone-100 dark:bg-zinc-800 rounded-lg text-[10px] font-bold uppercase text-stone-500 hover:bg-emerald-100 hover:text-emerald-600 transition-colors">
                                  Avaliação
                                </button>
                                <input 
                                  type="number"
                                  value={data.evaluation || ''}
                                  onChange={(e) => handleScoreChange(subject, 'evaluation', e.target.value)}
                                  placeholder="0"
                                  className="w-16 p-2 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg text-center outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                />
                              </div>
                            </td>
                            <td className="py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button className="p-2 bg-stone-100 dark:bg-zinc-800 rounded-lg text-[10px] font-bold uppercase text-stone-500 hover:bg-emerald-100 hover:text-emerald-600 transition-colors">
                                  Redação
                                </button>
                                <input 
                                  type="number"
                                  value={data.redacao || ''}
                                  onChange={(e) => handleScoreChange(subject, 'redacao', e.target.value)}
                                  placeholder="0"
                                  className="w-16 p-2 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg text-center outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                />
                              </div>
                            </td>
                            <td className="py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <input 
                                  type="number"
                                  value={data.completion || ''}
                                  onChange={(e) => handleScoreChange(subject, 'completion', e.target.value)}
                                  placeholder="0"
                                  className="w-16 p-2 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg text-center outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-emerald-600"
                                />
                                <span className="text-xs font-bold text-stone-400">%</span>
                              </div>
                            </td>
                            <td className="py-4 text-center">
                              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-stone-400">
                                <span className={data.video ? "text-emerald-500" : ""}>V</span>
                                <span>•</span>
                                <span className={data.slides ? "text-emerald-500" : ""}>S</span>
                                <span>•</span>
                                <span className={data.podcast ? "text-emerald-500" : ""}>P</span>
                                <span className="ml-2 text-emerald-600">({extras} pts)</span>
                              </div>
                            </td>
                            <td className="py-4 text-right">
                              <span className={cn(
                                "font-bold text-lg px-4 py-1 rounded-full",
                                total >= 70 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" : "text-stone-400 bg-stone-50 dark:bg-zinc-800"
                              )}>
                                {total}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Progress Chart */}
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <BarChart3 className="text-blue-500" size={20} />
                    Desempenho por Matéria
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 10, fill: '#6b7280' }} 
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                          axisLine={false}
                          tickLine={false}
                          domain={[0, 100]}
                        />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                          cursor={{ fill: '#f3f4f6' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar dataKey="Avaliação" stackId="a" fill="#059669" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="Redação" stackId="a" fill="#3b82f6" />
                        <Bar dataKey="Extras" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Award className="text-emerald-600" size={20} />
                    Meus Certificados
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certificates.length === 0 ? (
                      <div className="col-span-2 text-center py-12 text-stone-400 italic">
                        Complete as avaliações para conquistar seus certificados.
                      </div>
                    ) : (
                      certificates.map((cert, i) => (
                        <div key={i} className="p-6 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-3xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Award size={64} />
                          </div>
                          <h4 className="font-bold text-emerald-900 dark:text-emerald-400 mb-1">{cert.subject}</h4>
                          <p className="text-xs text-emerald-700/60 dark:text-emerald-400/40 mb-4">ID: {cert.id}</p>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                            <Calendar size={12} /> {cert.date}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Column */}
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-600/20">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Star size={20} />
                    Nível Ministerial
                  </h3>
                  <div className="space-y-6">
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-emerald-500 text-white">
                            Progresso para Próximo Nível
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-white">
                            {Math.min(100, (totalPoints % 1000) / 10)}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-emerald-900/30">
                        <div style={{ width: `${(totalPoints % 1000) / 10}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-white"></div>
                      </div>
                    </div>
                    <p className="text-sm opacity-80 leading-relaxed">
                      Continue estudando e concluindo matérias para subir de patente na Marinha Celestial!
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Brain size={20} className="text-purple-500" />
                    Estatísticas
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-stone-50 dark:border-zinc-800">
                      <span className="text-sm text-stone-500">Média de Notas</span>
                      <span className="font-bold text-emerald-600">9.2</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-stone-50 dark:border-zinc-800">
                      <span className="text-sm text-stone-500">Tempo de Estudo</span>
                      <span className="font-bold text-blue-600">42h</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm text-stone-500">Rank Global</span>
                      <span className="font-bold text-amber-500">#12</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'theology' && (
          <motion.div 
            key="theology"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <TheologyPage onNavigate={onNavigate} />
          </motion.div>
        )}

        {activeSubTab === 'redacao' && (
          <motion.div 
            key="redacao"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <RedacaoPage />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
