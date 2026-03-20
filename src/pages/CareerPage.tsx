import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  Clock, 
  Share2, 
  MessageSquare, 
  Heart,
  ChevronRight,
  ShieldCheck,
  Award,
  Camera,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/Toast';
import { RANKS, UserProfile, Rank } from '../types/forum';
import { cn } from '../types';

const MOCK_USER: UserProfile = {
  id: 'user-1',
  name: 'João Silva',
  nickname: 'Pregador Fiel',
  avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Officer1&clothesColor=2d4a2d&hat=military&hairColor=b58143',
  rankId: 5, // Aspirante
  stars: 1,
  membershipMonths: 5,
  accessPerWeek: 4,
  hoursPerMonth: 4.5,
  shares: 12,
  forumParticipations: 8,
  contributions: 15,
  authorized: false,
  trend: 'up'
};

const LEADERBOARD: UserProfile[] = [
  { ...MOCK_USER, id: '1', name: 'João Silva', rankId: 5, trend: 'up' },
  { id: '2', name: 'Maria Santos', nickname: 'Missionária Maria', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Officer4&clothesColor=2d4a2d&hat=military&hairColor=241c11', rankId: 8, stars: 3, membershipMonths: 8, accessPerWeek: 6, hoursPerMonth: 7, shares: 25, forumParticipations: 15, contributions: 50, authorized: true, trend: 'up' },
  { id: '3', name: 'Pedro Oliveira', nickname: 'Irmão Pedro', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Soldier4&clothesColor=3c5e3c&hat=military&hairColor=472731', rankId: 4, stars: 3, membershipMonths: 4, accessPerWeek: 3, hoursPerMonth: 3, shares: 10, forumParticipations: 5, contributions: 0, authorized: true, trend: 'down' },
  { id: '4', name: 'Ana Costa', nickname: 'Ana Pregadora', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=High2&clothesColor=1e331e&hat=military&hairColor=d1d1d1&accessories=sunglasses', rankId: 10, stars: 2, membershipMonths: 10, accessPerWeek: 8, hoursPerMonth: 9, shares: 40, forumParticipations: 30, contributions: 100, authorized: true, trend: 'stable' },
];

import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default function CareerPage() {
  const { user, careerProgress, metrics, isInitialLoading } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'ranks' | 'leaderboard'>('profile');
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(true);

  // Initialize career progress if it doesn't exist
  useEffect(() => {
    if (user && !careerProgress && !isInitialLoading) {
      const initCareer = async () => {
        const careerDocRef = doc(db, 'careerProgress', user.id);
        await setDoc(careerDocRef, {
          userId: user.id,
          rankId: 1,
          stars: 0,
          authorized: false,
          points: 0,
          updatedAt: new Date().toISOString()
        });
      };
      initCareer();
    }
  }, [user, careerProgress, isInitialLoading]);

  // Fetch leaderboard
  useEffect(() => {
    if (activeTab === 'leaderboard') {
      const fetchLeaderboard = async () => {
        setLoadingLeaderboard(true);
        try {
          const q = query(collection(db, 'careerProgress'), orderBy('points', 'desc'), limit(10));
          const snapshot = await getDocs(q);
          const data = snapshot.docs.map(doc => {
            const progressData = doc.data();
            return {
              id: progressData.userId || doc.id,
              name: progressData.name || 'Membro da Marinha',
              nickname: progressData.nickname || 'Recruta',
              avatar: progressData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${progressData.userId || doc.id}`,
              rankId: progressData.rankId || 1,
              stars: progressData.stars || 0,
              points: progressData.points || 0,
              trend: progressData.trend || 'stable',
              authorized: progressData.authorized || false,
              membershipMonths: progressData.membershipMonths || 0,
              accessPerWeek: progressData.accessPerWeek || 0,
              hoursPerMonth: progressData.hoursPerMonth || 0,
              shares: progressData.shares || 0,
              forumParticipations: progressData.forumParticipations || 0,
              contributions: progressData.contributions || 0
            } as UserProfile;
          });
          setLeaderboard(data);
        } catch (error) {
          console.error("Error fetching leaderboard:", error);
        } finally {
          setLoadingLeaderboard(false);
        }
      };
      fetchLeaderboard();
    }
  }, [activeTab]);

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Acesse sua conta para ver sua carreira</h2>
        <p className="text-stone-500">Acompanhe sua evolução na Marinha Celestial.</p>
      </div>
    );
  }

  const currentCareer = careerProgress || { rankId: 1, stars: 0, authorized: false, trend: 'stable' };
  const currentRank = RANKS.find(r => r.id === currentCareer.rankId) || RANKS[0];
  const nextRank = RANKS.find(r => r.id === currentCareer.rankId + 1);

  const handleAuthorize = async () => {
    const careerDocRef = doc(db, 'careerProgress', user.id);
    await updateDoc(careerDocRef, { authorized: true });
    showToast("Autorização concedida! Bem-vindo à carreira militar celestial. 🙏✨");
  };

  const handleSharePromotion = () => {
    showToast("Compartilhando sua promoção nas redes sociais! 🕊️✨");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <div className="flex items-center gap-3">
              <img 
                src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
                alt="Logo" 
                className="w-8 h-8 object-contain"
                referrerPolicy="no-referrer"
              />
              <h2 className="text-3xl font-display font-bold flex items-center gap-3 text-emerald-900 dark:text-emerald-400">
                <Trophy className="text-amber-500" size={32} />
                Carreira da Marinha Celestial
              </h2>
              <img 
                src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
                alt="Logo" 
                className="w-8 h-8 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-stone-500 dark:text-zinc-400">Sua jornada de aprendizado e crescimento na Marinha de Cristo - Vamos navegar nessa aventura.</p>
          </div>
        </div>
        <div className="flex bg-stone-100 dark:bg-zinc-800 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('profile')}
            className={cn(
              "px-6 py-2 rounded-xl font-bold text-sm transition-all",
              activeTab === 'profile' ? "bg-emerald-700 text-white shadow-sm" : "text-stone-500"
            )}
          >
            Meu Perfil
          </button>
          <button 
            onClick={() => setActiveTab('ranks')}
            className={cn(
              "px-6 py-2 rounded-xl font-bold text-sm transition-all",
              activeTab === 'ranks' ? "bg-emerald-700 text-white shadow-sm" : "text-stone-500"
            )}
          >
            Patentes
          </button>
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={cn(
              "px-6 py-2 rounded-xl font-bold text-sm transition-all",
              activeTab === 'leaderboard' ? "bg-emerald-700 text-white shadow-sm" : "text-stone-500"
            )}
          >
            Ranking
          </button>
        </div>
      </header>

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                <div className="flex gap-1">
                  {[...Array(currentCareer.stars || 0)].map((_, i) => (
                    <Star key={i} size={20} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-32 h-32 rounded-full border-4 border-emerald-700 p-1 bg-emerald-50 dark:bg-emerald-900/20">
                    <img 
                      src={currentRank.image} 
                      alt={user.name} 
                      className="w-full h-full rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                
                <div>
                  <h3 className="text-2xl font-bold">{user.name}</h3>
                  <p className="text-stone-500 dark:text-zinc-400 text-sm">{user.email}</p>
                </div>

                <div className="px-6 py-2 bg-emerald-800 text-white rounded-full font-bold text-sm uppercase tracking-widest">
                  {currentRank.name}
                </div>

                <div className="w-full pt-6 grid grid-cols-2 gap-4">
                  <div className="bg-stone-50 dark:bg-zinc-800 p-4 rounded-3xl text-center">
                    <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Categoria</p>
                    <p className="font-bold text-sm">{currentRank.category}</p>
                  </div>
                  <div className="bg-stone-50 dark:bg-zinc-800 p-4 rounded-3xl text-center">
                    <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Tendência</p>
                    <div className="flex items-center justify-center gap-1">
                      {(currentCareer.trend || 'stable') === 'up' ? <TrendingUp className="text-emerald-500" size={16} /> : <TrendingDown className="text-red-500" size={16} />}
                      <p className="font-bold text-sm">{(currentCareer.trend || 'stable') === 'up' ? 'Evoluindo' : 'Regredindo'}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleSharePromotion}
                  className="w-full py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 size={18} />
                  Compartilhar Patente
                </button>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-3xl border border-amber-200 dark:border-amber-800">
              <h4 className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-4">
                <Award size={20} />
                Próxima Conquista
              </h4>
              {nextRank ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600">
                      <img src={nextRank.image} alt={nextRank.name} className="w-10 h-10 rounded-lg" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{nextRank.name}</p>
                      <p className="text-xs text-amber-700/70 dark:text-amber-400/70">{nextRank.category}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {nextRank.requirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-400">
                        <div className="w-1 h-1 rounded-full bg-amber-400" />
                        {req}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-amber-800 dark:text-amber-400">Você alcançou a patente máxima! Glória a Deus! 🙌</p>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard icon={<Calendar className="text-blue-500" />} label="Acessos" value={metrics.accesses} />
              <StatCard icon={<Clock className="text-purple-500" />} label="Tempo de Uso" value={`${(metrics.totalTime / 3600).toFixed(1)}h`} />
              <StatCard icon={<Users className="text-emerald-500" />} label="Participação Fórum" value={metrics.forumParticipations} />
              <StatCard icon={<Share2 className="text-pink-500" />} label="Compartilhamentos" value={metrics.shares} />
              <StatCard icon={<Award className="text-amber-500" />} label="Pontos" value={currentCareer.points || 0} />
              <StatCard icon={<Heart className="text-red-500" />} label="Contribuição" value={metrics.hasContributed ? 'Sim' : 'Não'} />
            </div>

            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" size={24} />
                Progresso da Carreira
              </h3>
              <div className="space-y-6">
                <div className="relative h-4 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentCareer.rankId / 12) * 100}%` }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-blue-500"
                  />
                </div>
                <div className="flex justify-between text-xs font-bold text-stone-400 uppercase tracking-widest">
                  <span>Marinheiro</span>
                  <span>Aspirante</span>
                  <span>Almirante</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Trophy size={120} />
              </div>
              <div className="relative z-10 space-y-4">
                <h3 className="text-2xl font-bold">Premiações Especiais</h3>
                <p className="text-emerald-100 max-w-md">
                  Alcance os postos mais elevados e ajude o App a alcançar suas metas, assim você se qualifica para ganhar prêmios exclusivos como medalhas de honra, livros e certificados!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ranks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {RANKS.map((rank) => (
            <div 
              key={rank.id}
              className={cn(
                "bg-white dark:bg-zinc-900 p-6 rounded-3xl border transition-all",
                currentCareer.rankId === rank.id ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-stone-200 dark:border-zinc-800"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-zinc-800 p-1">
                  <img src={rank.image} alt={rank.name} className="w-full h-full rounded-xl" referrerPolicy="no-referrer" />
                </div>
                <div className="flex gap-0.5">
                  {[...Array(rank.stars)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <h4 className="font-bold text-lg mb-1">{rank.name}</h4>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">{rank.category}</p>
              <div className="space-y-2">
                {rank.requirements.map((req, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-stone-500 dark:text-zinc-400">
                    <div className="w-1 h-1 rounded-full bg-stone-300 mt-1.5" />
                    {req}
                  </div>
                ))}
              </div>
              {currentCareer.rankId >= rank.id && (
                <div className="mt-4 pt-4 border-t border-stone-100 dark:border-zinc-800 flex items-center gap-2 text-emerald-600 font-bold text-xs">
                  <ShieldCheck size={14} />
                  Conquistado
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-stone-100 dark:border-zinc-800">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Users className="text-emerald-600" size={24} />
              Quadro de Honra
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 dark:bg-zinc-800/50 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  <th className="px-8 py-4">Membro</th>
                  <th className="px-8 py-4">Patente</th>
                  <th className="px-8 py-4">Estrelas</th>
                  <th className="px-8 py-4">Tendência</th>
                  <th className="px-8 py-4">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                {leaderboard.map((member) => {
                  const rank = RANKS.find(r => r.id === member.rankId) || RANKS[0];
                  return (
                    <tr key={member.id} className="hover:bg-stone-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={member.avatar} 
                            alt={member.name} 
                            className="w-10 h-10 rounded-full bg-stone-100 dark:bg-zinc-800"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-bold text-sm">{member.name}</p>
                            <p className="text-xs text-stone-400">ID: {member.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="px-3 py-1 bg-stone-100 dark:bg-zinc-800 rounded-full text-[10px] font-bold uppercase tracking-widest">
                          {rank.name}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex gap-0.5">
                          {[...Array(member.stars)].map((_, i) => (
                            <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        {(member.trend || 'stable') === 'up' && <TrendingUp className="text-emerald-500" size={20} />}
                        {(member.trend || 'stable') === 'down' && <TrendingDown className="text-red-500" size={20} />}
                        {(member.trend || 'stable') === 'stable' && <div className="w-5 h-1 bg-stone-300 rounded-full" />}
                      </td>
                      <td className="px-8 py-4">
                        <button className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl text-stone-400 transition-colors">
                          <ChevronRight size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && !currentCareer.authorized && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-stone-200 dark:border-zinc-800 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
                <UserCheck size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Termo de Autorização</h3>
                <p className="text-stone-500 dark:text-zinc-400 text-sm">
                  Para participar do ranking e do fórum, solicitamos sua autorização para exibir seu nome, apelido e imagem de patente para outros membros da comunidade.
                </p>
              </div>
              <div className="bg-stone-50 dark:bg-zinc-800 p-4 rounded-2xl text-left text-xs text-stone-500 space-y-2">
                <p>• Seus dados serão usados apenas para fins de classificação.</p>
                <p>• Você pode revogar esta autorização a qualquer momento.</p>
                <p>• Respeite as regras do fórum para manter sua patente.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200"
                >
                  Agora não
                </button>
                <button 
                  onClick={handleAuthorize}
                  className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                >
                  Autorizar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-stone-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-stone-50 dark:bg-zinc-800 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}
