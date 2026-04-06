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
  ChevronRight,
  Loader2
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
import { multiAiService } from '../services/multiAiService';

import { THEOLOGY_SUBJECTS as THEOLOGY_SUBJECTS_DATA } from '../constants/theology';
const THEOLOGY_SUBJECTS = THEOLOGY_SUBJECTS_DATA.map(s => s.title);

import { EVANGELISM_SUBJECTS as EVANGELISM_SUBJECTS_DATA } from '../constants/evangelismCourse';
const EVANGELISM_SUBJECTS = EVANGELISM_SUBJECTS_DATA.map(s => s.title);

import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc, collection, getDocs, writeBatch, query, where, orderBy, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '../components/Toast';

export default function StudentPage({ onNavigate }: { onNavigate: (tab: string, state?: any) => void }) {
  const { user, theologyProgress, evangelismProgress, certificates } = useAuth();
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'theology' | 'evangelism' | 'summaries'>('profile');
  const [isResetting, setIsResetting] = useState(false);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  const calculateTotal = (subject: string) => {
    const data = (theologyProgress && theologyProgress[subject]) || {};
    const evalScore = data.evaluation || 0;
    const redMateria = data.redacaoMateria || 0;
    const redAprofundamento = data.redacaoAprofundamento || 0;
    const redSlide = data.redacaoSlide || 0;
    const redVideo = data.redacaoVideo || 0;
    const redPodcast = data.redacaoPodcast || 0;
    const quizPoints = data.quizPoints || 0;
    const studyPoints = data.studyPoints || 0;
    return evalScore + redMateria + redAprofundamento + redSlide + redVideo + redPodcast + quizPoints + studyPoints;
  };

  const totalPoints = theologyProgress ? THEOLOGY_SUBJECTS.reduce((acc, subject) => {
    return acc + calculateTotal(subject);
  }, 0) : 0;

  const completedSubjects = theologyProgress ? Object.keys(theologyProgress).filter(k => theologyProgress[k]?.completed) : [];

  const calculateEvangelismTotal = (subject: string) => {
    const data = (evangelismProgress && evangelismProgress[subject]) || {};
    const evalScore = data.evaluation || 0;
    const redMateria = data.redacaoMateria || 0;
    const redAprofundamento = data.redacaoAprofundamento || 0;
    const redSlide = data.redacaoSlide || 0;
    const redVideo = data.redacaoVideo || 0;
    const redPodcast = data.redacaoPodcast || 0;
    const quizPoints = data.quizPoints || 0;
    return evalScore + redMateria + redAprofundamento + redSlide + redVideo + redPodcast + quizPoints;
  };

  const totalEvangelismPoints = evangelismProgress ? EVANGELISM_SUBJECTS.reduce((acc, subject) => {
    return acc + calculateEvangelismTotal(subject);
  }, 0) : 0;

  const completedEvangelismSubjects = evangelismProgress ? Object.keys(evangelismProgress).filter(k => evangelismProgress[k]?.completed) : [];

  const loadRecommendations = async () => {
    if (!user) return;
    setIsLoadingRecommendations(true);
    try {
      const result = await multiAiService.getPersonalizedRecommendations(
        { name: user.name, email: user.email },
        { completedSubjects, totalPoints }
      );
      if (result && Array.isArray(result)) {
        setRecommendations(result);
      } else if (typeof result === 'string') {
        setRecommendations([result]);
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'profile' && user && recommendations.length === 0) {
      loadRecommendations();
    }
  }, [activeSubTab, user]);

  const loadSummaries = async () => {
    if (!user) return;
    setIsLoadingSummaries(true);
    try {
      const q = query(
        collection(db, 'theologySummaries'),
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSummaries(docs);
    } catch (error) {
      console.error("Error loading summaries:", error);
    } finally {
      setIsLoadingSummaries(false);
    }
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const isAdmin = user?.email === 'imersaobiblicapp@gmail.com';

  const resetAllTheologyProgress = async () => {
    if (!isAdmin) return;
    
    setIsResetting(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'theologyProgress'));
      const batch = writeBatch(db);
      
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      showToast('Todo o progresso de Teologia foi reiniciado com sucesso! 🔄✅', 'success');
      setShowResetConfirm(false);
    } catch (error) {
      console.error("Error resetting theology progress:", error);
      showToast('Erro ao reiniciar progresso.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleScoreChange = async (subject: string, field: 'evaluation' | 'redacaoMateria' | 'redacaoAprofundamento' | 'redacaoSlide' | 'redacaoVideo' | 'redacaoPodcast' | 'quizPoints' | 'studyPoints', value: string) => {
    if (!user) return;
    
    const numValue = Math.max(0, parseInt(value) || 0);
    let max = 5;
    if (field === 'evaluation') max = 40;
    if (field === 'quizPoints') max = 20;
    if (field === 'studyPoints') max = 15;
    
    const finalValue = Math.min(numValue, max);

    const current = (theologyProgress && theologyProgress[subject]) || {};
    const newSubjectProgress = {
      ...current,
      [field]: finalValue
    };
    
    try {
      const progressDocRef = doc(db, 'theologyProgress', user.id);
      await updateDoc(progressDocRef, {
        [subject]: newSubjectProgress
      });

      // Sync to careerProgress
      const progressDoc = await getDoc(progressDocRef);
      if (progressDoc.exists()) {
        const allProgress = progressDoc.data();
        allProgress[subject] = newSubjectProgress;
        
        const grandTotal = Object.keys(allProgress).reduce((acc, key) => {
          if (key === 'userId' || key === 'enrolled') return acc;
          const data = allProgress[key] || {};
          const sTotal = (data.evaluation || 0) + 
                         (data.redacaoMateria || 0) + 
                         (data.redacaoAprofundamento || 0) + 
                         (data.redacaoSlide || 0) + 
                         (data.redacaoVideo || 0) + 
                         (data.redacaoPodcast || 0) + 
                         (data.quizPoints || 0) + 
                         (data.studyPoints || 0);
          return acc + sTotal;
        }, 0);

        const careerDocRef = doc(db, 'careerProgress', user.id);
        const careerDoc = await getDoc(careerDocRef);
        
        if (careerDoc.exists()) {
          const careerData = careerDoc.data();
          const bibleRacePoints = careerData.bibleRacePoints || 0;
          await updateDoc(careerDocRef, { 
            theologyPoints: grandTotal,
            points: grandTotal + bibleRacePoints,
            name: user.name,
            avatar: user.avatar || user.photoURL,
            updatedAt: new Date().toISOString()
          });
        } else {
          await setDoc(careerDocRef, {
            userId: user.id,
            name: user.name,
            avatar: user.avatar || user.photoURL,
            theologyPoints: grandTotal,
            bibleRacePoints: 0,
            points: grandTotal,
            rankId: 1,
            stars: 0,
            authorized: false,
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  const chartData = THEOLOGY_SUBJECTS.map(subject => {
    const data = (theologyProgress && theologyProgress[subject]) || {};
    return {
      name: subject.split(' ')[0], // Short name for the chart X-axis
      fullSubject: subject,
      Avaliação: data.evaluation || 0,
      Redação: (data.redacaoMateria || 0) + (data.redacaoAprofundamento || 0) + (data.redacaoSlide || 0) + (data.redacaoVideo || 0) + (data.redacaoPodcast || 0),
      Total: calculateTotal(subject)
    };
  });

  const evangelismChartData = EVANGELISM_SUBJECTS.map(subject => {
    const data = (evangelismProgress && evangelismProgress[subject]) || {};
    return {
      name: subject.split(' ')[0],
      fullSubject: subject,
      Quiz: data.quizPoints || 0,
      Avaliação: data.evaluation || 0,
      Total: calculateEvangelismTotal(subject)
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
          onClick={() => setActiveSubTab('evangelism')}
          className={cn(
            "px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2",
            activeSubTab === 'evangelism' ? "bg-emerald-600 text-white shadow-lg" : "text-stone-500 hover:bg-stone-50 dark:hover:bg-zinc-800"
          )}
        >
          <Zap size={18} /> Curso de Evangelismo
        </button>
        <button 
          onClick={() => setActiveSubTab('summaries')}
          className={cn(
            "px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2",
            activeSubTab === 'summaries' ? "bg-emerald-600 text-white shadow-lg" : "text-stone-500 hover:bg-stone-50 dark:hover:bg-zinc-800"
          )}
        >
          <Pencil size={18} /> Meus Resumos
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
                    <div className="w-32 h-32 bg-emerald-600 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-2xl shadow-emerald-600/20 overflow-hidden">
                      {user?.avatar || user?.photoURL ? (
                        <img src={user.avatar || user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={64} />
                      )}
                    </div>
                    <div className="text-center md:text-left space-y-2">
                      <div className="flex items-center gap-4">
                        <img 
                          src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
                          alt="Logo" 
                          className="w-10 h-10 object-contain"
                          referrerPolicy="no-referrer"
                        />
                        <h2 className="text-4xl font-bold font-display">{user?.name || 'Página do Aluno'}</h2>
                    <img 
                      src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
                      alt="Logo" 
                      className="w-10 h-10 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-stone-500 font-medium">Histórico acadêmico e progresso na Marinha Celestial</p>
                  
                  {isAdmin && (
                    <div className="mt-4 space-y-4">
                      {!showResetConfirm ? (
                        <button
                          onClick={() => setShowResetConfirm(true)}
                          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center gap-2"
                        >
                          REINICIAR TODOS OS PONTOS DE TEOLOGIA
                        </button>
                      ) : (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl space-y-3">
                          <p className="text-xs font-bold text-red-700 dark:text-red-400">
                            ⚠️ TEM CERTEZA? Isso irá apagar o progresso de TODOS os alunos no curso de Teologia. Esta ação não pode ser desfeita.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={resetAllTheologyProgress}
                              disabled={isResetting}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg text-[10px] font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                            >
                              {isResetting ? 'Reiniciando...' : 'SIM, REINICIAR TUDO'}
                            </button>
                            <button
                              onClick={() => setShowResetConfirm(false)}
                              disabled={isResetting}
                              className="px-4 py-2 bg-stone-200 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 rounded-lg text-[10px] font-bold hover:bg-stone-300 transition-all"
                            >
                              CANCELAR
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

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
                        <th className="text-center py-4 font-bold uppercase tracking-wider text-[10px]">Avaliação (40)</th>
                        <th className="text-center py-4 font-bold uppercase tracking-wider text-[10px]">Resumo (5)</th>
                        <th className="text-center py-4 font-bold uppercase tracking-wider text-[10px]">Aprof. (5)</th>
                        <th className="text-center py-4 font-bold uppercase tracking-wider text-[10px]">Slide (5)</th>
                        <th className="text-center py-4 font-bold uppercase tracking-wider text-[10px]">Vídeo (5)</th>
                        <th className="text-center py-4 font-bold uppercase tracking-wider text-[10px]">Podcast (5)</th>
                        <th className="text-center py-4 font-bold uppercase tracking-wider text-[10px]">Quizzes (20)</th>
                        <th className="text-center py-4 font-bold uppercase tracking-wider text-[10px]">Estudo (15)</th>
                        <th className="text-center py-4 font-bold uppercase tracking-wider text-[10px]">Nota Final</th>
                        <th className="text-right py-4 font-bold uppercase tracking-wider text-[10px]">A/R</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50 dark:divide-zinc-800">
                      {THEOLOGY_SUBJECTS.map((subject, i) => {
                        const data = (theologyProgress && theologyProgress[subject]) || {};
                        const total = calculateTotal(subject);

                        return (
                          <tr key={i} className="group hover:bg-stone-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                            <td className="py-4 font-bold text-stone-700 dark:text-zinc-300">{subject}</td>
                            <td className="py-4 text-center">
                              <input 
                                type="number"
                                value={data.evaluation || ''}
                                onChange={(e) => handleScoreChange(subject, 'evaluation', e.target.value)}
                                placeholder="0"
                                className="w-12 p-1 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg text-center outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                              />
                            </td>
                            <td className="py-4 text-center">
                              <input 
                                type="number"
                                value={data.redacaoMateria || ''}
                                onChange={(e) => handleScoreChange(subject, 'redacaoMateria', e.target.value)}
                                placeholder="0"
                                className="w-12 p-1 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg text-center outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                              />
                            </td>
                            <td className="py-4 text-center">
                              <input 
                                type="number"
                                value={data.redacaoAprofundamento || ''}
                                onChange={(e) => handleScoreChange(subject, 'redacaoAprofundamento', e.target.value)}
                                placeholder="0"
                                className="w-12 p-1 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg text-center outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                              />
                            </td>
                            <td className="py-4 text-center">
                              <input 
                                type="number"
                                value={data.redacaoSlide || ''}
                                onChange={(e) => handleScoreChange(subject, 'redacaoSlide', e.target.value)}
                                placeholder="0"
                                className="w-12 p-1 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg text-center outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                              />
                            </td>
                            <td className="py-4 text-center">
                              <input 
                                type="number"
                                value={data.redacaoVideo || ''}
                                onChange={(e) => handleScoreChange(subject, 'redacaoVideo', e.target.value)}
                                placeholder="0"
                                className="w-12 p-1 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg text-center outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                              />
                            </td>
                            <td className="py-4 text-center">
                              <input 
                                type="number"
                                value={data.redacaoPodcast || ''}
                                onChange={(e) => handleScoreChange(subject, 'redacaoPodcast', e.target.value)}
                                placeholder="0"
                                className="w-12 p-1 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg text-center outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                              />
                            </td>
                            <td className="py-4 text-center">
                              <input 
                                type="number"
                                value={data.quizPoints || ''}
                                onChange={(e) => handleScoreChange(subject, 'quizPoints', e.target.value)}
                                placeholder="0"
                                className="w-12 p-1 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg text-center outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                              />
                            </td>
                            <td className="py-4 text-center">
                              <input 
                                type="number"
                                value={data.studyPoints || ''}
                                onChange={(e) => handleScoreChange(subject, 'studyPoints', e.target.value)}
                                placeholder="0"
                                className="w-12 p-1 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg text-center outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                              />
                            </td>
                            <td className="py-4 text-center">
                              <span className="font-bold text-lg">{total}</span>
                            </td>
                            <td className="py-4 text-right">
                              <span className={cn(
                                "font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider",
                                total === 0 ? "text-stone-900 bg-stone-100 dark:text-zinc-100 dark:bg-zinc-800" :
                                total >= 70 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" : "text-red-600 bg-red-50 dark:bg-red-900/20"
                              )}>
                                {total === 0 ? 'Pendente' : total >= 70 ? 'Aprovado' : 'Reprovado'}
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
                        <Bar dataKey="Redação" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
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
                      Recomendações Personalizadas (Claude AI)
                    </h3>
                    {isLoadingRecommendations ? (
                      <div className="flex items-center gap-2 text-stone-500 italic">
                        <Loader2 className="animate-spin" size={16} /> Analisando seu perfil...
                      </div>
                    ) : recommendations.length > 0 ? (
                      <ul className="space-y-3 list-none p-0">
                        {recommendations.map((rec, index) => (
                          <li key={index} className="flex gap-3 items-start">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-sm text-stone-600 dark:text-zinc-400 leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-stone-500 italic">Nenhuma recomendação disponível no momento.</p>
                    )}
                  </div>

                  <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Brain size={20} className="text-purple-500" />
                      Estatísticas
                    </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-stone-50 dark:border-zinc-800">
                      <span className="text-sm text-stone-500">Média de Notas</span>
                      <span className="font-bold text-emerald-600">
                        {completedSubjects.length > 0 
                          ? (completedSubjects.reduce((acc, sub) => acc + calculateTotal(sub), 0) / completedSubjects.length).toFixed(1)
                          : '0.0'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-stone-50 dark:border-zinc-800">
                      <span className="text-sm text-stone-500">Tempo de Estudo</span>
                      <span className="font-bold text-blue-600">0h</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm text-stone-500">Rank Global</span>
                      <span className="font-bold text-amber-500">-</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'evangelism' && (
          <motion.div 
            key="evangelism"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-2xl">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500 font-bold uppercase tracking-wider">Pontos Totais</p>
                    <h4 className="text-3xl font-bold font-display">{totalEvangelismPoints}</h4>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-2xl">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500 font-bold uppercase tracking-wider">Módulos Concluídos</p>
                    <h4 className="text-3xl font-bold font-display">{completedEvangelismSubjects.length} de {EVANGELISM_SUBJECTS.length}</h4>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-2xl">
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500 font-bold uppercase tracking-wider">Média Geral</p>
                    <h4 className="text-3xl font-bold font-display">
                      {completedEvangelismSubjects.length > 0 
                        ? (totalEvangelismPoints / completedEvangelismSubjects.length).toFixed(1)
                        : '0.0'}
                    </h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm">
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
                <BarChart3 className="text-orange-600" size={24} />
                Desempenho por Módulo
              </h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={evangelismChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f9fafb' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="Quiz" fill="#f97316" radius={[4, 4, 0, 0]} barSize={30} />
                    <Bar dataKey="Avaliação" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm">
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
                <CheckCircle className="text-orange-600" size={24} />
                Progresso Detalhado
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EVANGELISM_SUBJECTS.map((subject) => {
                  const data = (evangelismProgress && evangelismProgress[subject]) || {};
                  const isCompleted = data.completed;
                  return (
                    <div key={subject} className="p-6 bg-stone-50 dark:bg-zinc-800/50 rounded-3xl border border-stone-100 dark:border-zinc-800 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-stone-900 dark:text-zinc-100">{subject}</h4>
                        <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">
                          {isCompleted ? 'Concluído ✅' : 'Em andamento ⏳'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">{calculateEvangelismTotal(subject)}</p>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Pontos</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'summaries' && (
          <motion.div 
            key="summaries"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Pencil className="text-emerald-600" size={24} />
                Meus Resumos e Notas da IA
              </h3>

              {isLoadingSummaries ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="animate-spin text-emerald-600 mb-4" size={32} />
                  <p className="text-stone-500">Carregando seus resumos...</p>
                </div>
              ) : summaries.length === 0 ? (
                <div className="text-center py-12 text-stone-400 italic">
                  Você ainda não criou nenhum resumo avaliado pela IA.
                </div>
              ) : (
                <div className="space-y-6">
                  {summaries.map((summary) => (
                    <div key={summary.id} className="p-6 bg-stone-50 dark:bg-zinc-800/50 rounded-3xl border border-stone-100 dark:border-zinc-800 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-lg text-stone-900 dark:text-zinc-100">{summary.subject}</h4>
                          <p className="text-xs text-stone-500 uppercase tracking-wider font-bold">{summary.type}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="px-4 py-2 bg-emerald-600 text-white rounded-2xl font-bold text-xl shadow-lg shadow-emerald-600/20">
                            {summary.score.toFixed(1)}
                          </div>
                          <p className="text-[10px] text-stone-400 mt-1 font-bold uppercase tracking-widest">Nota da IA</p>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-100 dark:border-zinc-800 text-sm text-stone-600 dark:text-zinc-400 line-clamp-3 italic">
                        "{summary.content}"
                      </div>

                      {summary.aiFeedback && (
                        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20">
                          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1">
                            <Brain size={14} /> Feedback da IA:
                          </p>
                          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/60 leading-relaxed">
                            {summary.aiFeedback}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-[10px] text-stone-400 font-bold uppercase tracking-widest pt-2">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} /> {new Date(summary.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} /> {new Date(summary.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
      </AnimatePresence>
    </div>
  );
}
