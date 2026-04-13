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
  UserCheck,
  Loader2
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
  points: 2450,
  authorized: false,
  trend: 'up'
};

const LEADERBOARD: UserProfile[] = [];

import { useAuth } from '../contexts/AuthContext';
import { compressImage } from '../utils/imageUtils';
import { useCredits } from '../contexts/CreditContext';
import { geminiService } from '../services/geminiService';
import { db } from '../lib/firebase';
import { doc, setDoc, updateDoc, collection, query, orderBy, limit, onSnapshot, where, getDocs } from 'firebase/firestore';
import html2canvas from 'html2canvas';

export default function CareerPage() {
  const { user, careerProgress, metrics, isInitialLoading, updateUser } = useAuth();
  const { consumeCredits, estimateCredits } = useCredits();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'ranks' | 'leaderboard'>('profile');
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

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

  // Fetch leaderboard with real-time updates
  useEffect(() => {
    if (activeTab === 'leaderboard') {
      setLoadingLeaderboard(true);
      // Removed limit(10) to allow users to find their position
      const q = query(collection(db, 'careerProgress'), orderBy('points', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
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
        setLoadingLeaderboard(false);
      }, (error) => {
        console.error("Error fetching leaderboard:", error);
        setLoadingLeaderboard(false);
      });
      return () => unsubscribe();
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

  const handleSharePromotion = async () => {
    const element = document.getElementById('share-rank-card');
    if (!element) {
      showToast("Erro ao preparar imagem para compartilhamento.", "error");
      return;
    }

    try {
      showToast("Preparando sua patente para compartilhar... 🕊️✨", "info");
      
      // Temporarily show the hidden card for capture
      element.style.display = 'block';
      const canvas = await html2canvas(element, {
        useCORS: true,
        backgroundColor: null,
        scale: 2
      });
      element.style.display = 'none';

      const image = canvas.toDataURL('image/png');
      
      // Try to share as file if supported
      if (navigator.share && navigator.canShare) {
        const blob = await (await fetch(image)).blob();
        const file = new File([blob], 'minha-patente-marinha-celestial.png', { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Minha Patente na Marinha Celestial',
            text: `Acabei de alcançar a patente de ${currentRank.name} na Marinha Celestial! Venha navegar conosco no Imersão Bíblica IA. ⚓✨`
          });
          return;
        }
      }

      // Fallback: Download image
      const link = document.createElement('a');
      link.href = image;
      link.download = `patente-${currentRank.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.click();
      showToast("Patente salva como imagem! Agora você pode compartilhar.", "success");
    } catch (error) {
      console.error("Error sharing rank:", error);
      showToast("Erro ao compartilhar patente.", "error");
      element.style.display = 'none';
    }
  };

  const handleGenerateAvatar = async () => {
    const cost = estimateCredits('avatar');
    if (!(await consumeCredits(cost, 'Geração de Avatar'))) {
      showToast(`Créditos insuficientes. Você precisa de ${cost} créditos.`, 'error');
      return;
    }

    setIsGeneratingAvatar(true);
    showToast("Gerando seu novo avatar... 🎨✨", 'info');

    try {
      const prompt = `A professional and heroic military avatar for a member of the "Celestial Navy" (Marinha Celestial). The character should look like a brave christian soldier, with a modern military uniform inspired by naval officers, but with spiritual and celestial elements (subtle light glows, cross symbols). High quality digital art style, clean lines, professional character design. Rank: ${currentRank.name}.`;
      
      const imageUrl = await geminiService.generateImage(prompt);
      if (imageUrl) {
        // Compress image before saving to Firestore to avoid 1MB limit
        const compressedUrl = await compressImage(imageUrl, 512, 512, 0.7);
        
        await updateUser({ 
          avatar: compressedUrl,
          photoURL: compressedUrl 
        });
        
        // Update career progress doc for leaderboard
        const careerDocRef = doc(db, 'careerProgress', user.id);
        try {
          await updateDoc(careerDocRef, { 
            avatar: compressedUrl,
            name: user.name // Ensure name is also synced
          });
        } catch (e) {
          // If doc doesn't exist, create it
          await setDoc(careerDocRef, {
            userId: user.id,
            name: user.name,
            avatar: compressedUrl,
            rankId: 1,
            stars: 0,
            authorized: false,
            points: 0,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }

        // Sync with Bible Race Progress
        const raceProgressRef = doc(db, 'bibleRaceProgress', user.id);
        try {
          await updateDoc(raceProgressRef, {
            userPhoto: compressedUrl
          });
        } catch (e) {
          // Might not exist, ignore
        }

        // Sync with Bible Race Champions (Quadro de Honra/Galeria de Campeões)
        const championsRef = collection(db, 'bibleRaceChampions');
        const q = query(championsRef, where('userId', '==', user.id));
        const querySnapshot = await getDocs(q);
        const updatePromises = querySnapshot.docs.map(doc => 
          updateDoc(doc.ref, { userPhoto: compressedUrl })
        );
        await Promise.all(updatePromises);

        showToast("Avatar gerado com sucesso! Ficou incrível! ⚓✨", 'success');
      } else {
        showToast("Erro ao gerar avatar. Tente novamente.", 'error');
      }
    } catch (error) {
      console.error("Error generating avatar:", error);
      showToast("Erro ao gerar avatar.", 'error');
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  return (
    <>
      {/* Hidden Share Card */}
      <div id="share-rank-card" style={{ display: 'none', position: 'fixed', left: '-9999px', top: '-9999px' }}>
        <div className="w-[500px] p-10 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-[3rem] border-8 border-emerald-400/30 shadow-2xl relative overflow-hidden font-sans">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full -ml-32 -mb-32 blur-3xl" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-emerald-400/20 rounded-2xl">
                <ShieldCheck className="text-emerald-400" size={32} />
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">Marinha Celestial</h1>
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-2xl animate-pulse" />
              <img 
                src={user?.avatar || user?.photoURL || `https://ui-avatars.com/api/?name=${user?.name || 'Membro'}&background=random`} 
                alt={user?.name || ''} 
                className="w-40 h-40 rounded-full border-8 border-emerald-400 shadow-2xl relative z-10 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-emerald-400 text-emerald-950 px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest shadow-xl z-20">
                {currentRank.name}
              </div>
            </div>

            <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">{user?.name}</h2>
            <p className="text-emerald-400 font-bold uppercase tracking-[0.3em] text-xs mb-8">Oficial da Marinha Celestial</p>

            <div className="grid grid-cols-3 gap-4 w-full mb-8">
              <div className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Pontos</p>
                <p className="text-xl font-black">{careerProgress?.points || 0}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Estrelas</p>
                <div className="flex items-center justify-center gap-1">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <p className="text-xl font-black">{careerProgress?.stars || 0}</p>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Status</p>
                <p className="text-xl font-black">{careerProgress?.authorized ? 'Ativo' : 'Recruta'}</p>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 w-full flex items-center justify-between">
              <div className="text-left">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">App Oficial</p>
                <p className="text-sm font-black tracking-tighter uppercase">Imersão Bíblica IA</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Data</p>
                <p className="text-sm font-black tracking-tighter uppercase">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <div className="flex items-center gap-3">
              <img 
                src="https://i.postimg.cc/3N279HyV/1000105226-removebg-preview.png" 
                alt="Logo" 
                className="w-8 h-8 object-contain"
                referrerPolicy="no-referrer"
              />
              <h2 className="text-3xl font-display font-bold flex items-center gap-3 text-emerald-900 dark:text-emerald-400">
                <Trophy className="text-amber-500" size={32} />
                Carreira da Marinha Celestial
              </h2>
              <img 
                src="https://i.postimg.cc/3N279HyV/1000105226-removebg-preview.png" 
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
                  <div className="w-32 h-32 rounded-full border-4 border-emerald-700 p-1 bg-emerald-50 dark:bg-emerald-900/20 relative group">
                    <img 
                      src={user.avatar || currentRank.image} 
                      alt={user.name} 
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {isGeneratingAvatar && (
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                        <Loader2 className="animate-spin text-white" size={32} />
                      </div>
                    )}
                  </div>
                
                <div>
                  <h3 className="text-2xl font-bold">{user.name}</h3>
                  <p className="text-stone-500 dark:text-zinc-400 text-sm">{user.email}</p>
                </div>

                <div className="px-6 py-2 bg-emerald-800 text-white rounded-full font-bold text-sm uppercase tracking-widest">
                  {currentRank.name}
                </div>

                <div className="w-full pt-4 space-y-3">
                  <button 
                    onClick={handleGenerateAvatar}
                    disabled={isGeneratingAvatar}
                    className="w-full py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <Camera size={18} />
                      {user.avatar ? 'Trocar Avatar' : 'Gerar Avatar'}
                    </div>
                    <span className="text-[10px] opacity-80">Custo: {estimateCredits('avatar')} créditos</span>
                  </button>

                  <button 
                    onClick={handleSharePromotion}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Share2 size={18} />
                    Compartilhar Patente
                  </button>
                </div>
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
          <div className="p-8 border-b border-stone-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Users className="text-emerald-600" size={24} />
              Quadro de Honra
            </h3>
            
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input 
                  type="text"
                  placeholder="Buscar oficial..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-100 dark:border-zinc-700 rounded-xl text-xs outline-none focus:ring-2 ring-emerald-500/50 transition-all"
                />
              </div>
              <button 
                onClick={() => {
                  if (user) {
                    setSearchTerm(user.name || '');
                  }
                }}
                className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all active:scale-95"
                title="Minha Localização"
              >
                <UserCheck size={14} />
                <span className="hidden sm:inline">Minha Posição</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 dark:bg-zinc-800/50 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  <th className="px-8 py-4">Posição</th>
                  <th className="px-8 py-4">Membro</th>
                  <th className="px-8 py-4">Patente</th>
                  <th className="px-8 py-4">Pontos</th>
                  <th className="px-8 py-4">Estrelas</th>
                  <th className="px-8 py-4">Tendência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                {leaderboard
                  .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((member) => {
                    const rank = RANKS.find(r => r.id === member.rankId) || RANKS[0];
                    const actualRank = leaderboard.findIndex(l => l.id === member.id);
                    const isCurrentUser = member.id === user?.id;
                    
                    return (
                      <tr 
                        key={member.id} 
                        className={cn(
                          "hover:bg-stone-50 dark:hover:bg-zinc-800/30 transition-colors",
                          isCurrentUser && "bg-emerald-50/50 dark:bg-emerald-900/10"
                        )}
                      >
                        <td className="px-8 py-4">
                          <div className="w-6 h-6 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black">
                            {actualRank + 1}
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={member.avatar} 
                              alt={member.name} 
                              className="w-10 h-10 rounded-full bg-stone-100 dark:bg-zinc-800 object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="font-bold text-sm flex items-center gap-2">
                                {member.name}
                                {isCurrentUser && (
                                  <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-[8px] font-black uppercase tracking-tighter">Você</span>
                                )}
                              </p>
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
                          <p className="font-black text-emerald-600 dark:text-emerald-400">{member.points}</p>
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
    </>
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
