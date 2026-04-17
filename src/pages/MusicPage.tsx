import React, { useState, useEffect, useRef } from 'react';
import { 
  Music, 
  Plus, 
  Search, 
  Filter, 
  Play, 
  Pause, 
  Heart, 
  Share2, 
  Trash2, 
  Mic2, 
  Save, 
  X,
  FileText,
  Volume2,
  Clock,
  ChevronRight,
  MoreVertical,
  Type,
  Globe,
  Lock,
  Sparkles,
  Users,
  Settings,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db, storage } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
  collection, addDoc, query, where, orderBy, 
  onSnapshot, deleteDoc, doc, serverTimestamp, 
  updateDoc, limit, getDocs
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useToast } from '../components/Toast';
import { cn } from '../types';
import { geminiService } from '../services/geminiService';

const RHYTHMS = [
  'Todos',
  'Worship',
  'Gospel Pop',
  'Rock Cristão',
  'Folk',
  'MPB Cristã',
  'Sertanejo',
  'Pentecostal',
  'Instrumental',
  'Outro'
];

interface MusicTrack {
  id: string;
  userId: string;
  authorName: string;
  title: string;
  rhythm: string;
  lyrics: string;
  audioUrl?: string;
  videoUrl?: string;
  isFavorite: boolean;
  isPublic: boolean;
  lyricsTimestamps?: { time: number; text: string }[];
  createdAt: any;
}

const MusicPage = () => {
  const [user] = useAuthState(auth);
  const { showToast } = useToast();
  const [myTracks, setMyTracks] = useState<MusicTrack[]>([]);
  const [publicTracks, setPublicTracks] = useState<MusicTrack[]>([]);
  const [activeTab, setActiveTab] = useState<'studio' | 'community'>('studio');
  const [loading, setLoading] = useState(true);
  const [activeRhythm, setActiveRhythm] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // New track form state
  const [newTrack, setNewTrack] = useState({
    title: '',
    rhythm: 'Worship',
    lyrics: '',
    audioFile: null as File | null,
    isPublic: true,
    authorName: user?.displayName || 'Autor'
  });

  // Player state
  const [playingTrack, setPlayingTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  // Load My Tracks
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'userMusic'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      setMyTracks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MusicTrack)));
      setLoading(false);
    });
  }, [user]);

  // Load Community Tracks
  useEffect(() => {
    const q = query(
      collection(db, 'userMusic'),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    return onSnapshot(q, (snapshot) => {
      setPublicTracks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MusicTrack)));
    });
  }, []);

  const handlePlay = (track: MusicTrack) => {
    if (!track.audioUrl) return;
    if (playingTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setPlayingTrack(track);
      setIsPlaying(true);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.src = track.audioUrl;
        audioRef.current.play();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      
      // Auto-scroll lyrics
      if (playingTrack?.lyricsTimestamps && lyricsContainerRef.current) {
        // Fallback for findLastIndex (ES2023)
        let activeLine = -1;
        for (let i = playingTrack.lyricsTimestamps.length - 1; i >= 0; i--) {
          if (playingTrack.lyricsTimestamps[i].time <= audioRef.current!.currentTime) {
            activeLine = i;
            break;
          }
        }

        if (activeLine >= 0) {
          const lineElement = lyricsContainerRef.current.children[activeLine] as HTMLElement;
          if (lineElement) {
            lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
    }
  };

  const identifyRhythm = async () => {
    if (!newTrack.lyrics.trim()) {
      showToast("Escreva a letra para a IA analisar o ritmo.", 'info');
      return;
    }
    setIsAnalyzing(true);
    try {
      const suggestedRhythm = await geminiService.identifyMusicRhythm(newTrack.lyrics);
      // Logic to find closest match in RHYTHMS
      const match = RHYTHMS.find(r => suggestedRhythm.toLowerCase().includes(r.toLowerCase()));
      if (match) {
        setNewTrack(prev => ({ ...prev, rhythm: match }));
        showToast(`IA sugeriu o ritmo: ${match}`, 'success');
      } else {
        setNewTrack(prev => ({ ...prev, rhythm: 'Outro' }));
        showToast(`IA sugeriu ritmo: ${suggestedRhythm}`, 'info');
      }
    } catch (error) {
       showToast("Erro na análise da IA.", 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveTrack = async () => {
    if (!user) return;
    if (!newTrack.title.trim()) {
      showToast("Dê um título para sua música.", 'info');
      return;
    }

    setIsSaving(true);
    try {
      let audioUrl = '';
      let duration = 0;
      let lyricsTimestamps: any[] = [];

      if (newTrack.audioFile) {
        // Get duration before upload
        const audioObj = new Audio(URL.createObjectURL(newTrack.audioFile));
        await new Promise((resolve) => {
          audioObj.onloadedmetadata = () => {
            duration = audioObj.duration;
            resolve(null);
          };
        });

        const fileRef = ref(storage, `music/${user.uid}/${Date.now()}_${newTrack.audioFile.name}`);
        const uploadResult = await uploadBytes(fileRef, newTrack.audioFile);
        audioUrl = await getDownloadURL(uploadResult.ref);

        // Generate timestamps if lyrics exist
        if (newTrack.lyrics.trim() && duration > 0) {
          try {
            lyricsTimestamps = await geminiService.generateLyricsTimestamps(newTrack.lyrics, duration);
          } catch (e) {
             console.warn("Failed to generate timestamps", e);
          }
        }
      }

      await addDoc(collection(db, 'userMusic'), {
        userId: user.uid,
        authorName: newTrack.authorName || user.displayName || 'Autor',
        title: newTrack.title,
        rhythm: newTrack.rhythm,
        lyrics: newTrack.lyrics,
        audioUrl,
        isFavorite: false,
        isPublic: newTrack.isPublic,
        lyricsTimestamps: lyricsTimestamps.length > 0 ? lyricsTimestamps : null,
        createdAt: serverTimestamp()
      });

      showToast("Música registrada e compartilhada!", 'success');
      setIsAddModalOpen(false);
      setNewTrack({ title: '', rhythm: 'Worship', lyrics: '', audioFile: null, isPublic: true, authorName: user.displayName || '' });
    } catch (error) {
      console.error("Erro ao salvar música:", error);
      showToast("Erro ao salvar.", 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const tracksToDisplay = activeTab === 'studio' ? myTracks : publicTracks;
  const filteredTracks = tracksToDisplay.filter(t => {
    const matchesRhythm = activeRhythm === 'Todos' || t.rhythm === activeRhythm;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.lyrics.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRhythm && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-24">
      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={() => setIsPlaying(false)}
      />

      {/* Header with Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
             <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/20">
               <Music className="text-white" size={28} />
             </div>
             Minha Autoria
          </h1>
          <p className="text-zinc-400 pl-1">Registre, organize e compartilhe suas composições.</p>
        </div>

        <div className="flex p-1 bg-zinc-900/50 rounded-2xl border border-zinc-800">
           <button
             onClick={() => setActiveTab('studio')}
             className={cn(
               "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
               activeTab === 'studio' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-zinc-500 hover:text-white"
             )}
           >
             <Settings size={18} />
             Meu Estúdio
           </button>
           <button
             onClick={() => setActiveTab('community')}
             className={cn(
               "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
               activeTab === 'community' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-zinc-500 hover:text-white"
             )}
           >
             <Users size={18} />
             Comunidade
           </button>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-white text-zinc-950 font-black rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl"
        >
          <Plus size={20} />
          Registrar Obra
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder={activeTab === 'studio' ? "Buscar nas minhas músicas..." : "Descobrir composições na comunidade..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl py-5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-white placeholder:text-zinc-600 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {RHYTHMS.map(rhythm => (
            <button
              key={rhythm}
              onClick={() => setActiveRhythm(rhythm)}
              className={cn(
                "px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all border",
                activeRhythm === rhythm 
                  ? "bg-white border-white text-zinc-950 shadow-lg shadow-white/10" 
                  : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-white"
              )}
            >
              {rhythm}
            </button>
          ))}
        </div>
      </div>

      {/* Music Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : filteredTracks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredTracks.map((track) => (
              <motion.div
                key={track.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "group relative flex flex-col h-full bg-zinc-950 border border-zinc-800 rounded-[2.5rem] overflow-hidden hover:border-emerald-500/50 transition-all duration-500 shadow-2xl overflow-hidden",
                  playingTrack?.id === track.id && "border-emerald-500 shadow-emerald-500/10 ring-1 ring-emerald-500/50"
                )}
              >
                {/* Decorative Background for Public items */}
                {track.isPublic && (
                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                     <Globe size={80} />
                   </div>
                )}

                <div className="p-8 flex-1 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "p-5 rounded-3xl transition-transform duration-500 group-hover:scale-110",
                      playingTrack?.id === track.id ? "bg-emerald-600 text-white" : "bg-zinc-900 text-zinc-400"
                    )}>
                      <Music size={28} />
                    </div>
                    
                    <div className="flex items-center gap-2">
                       {track.userId === user?.uid && (
                          <div className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                            track.isPublic ? "bg-blue-500/10 text-blue-400" : "bg-zinc-800 text-zinc-500"
                          )}>
                            {track.isPublic ? <Globe size={12} /> : <Lock size={12} />}
                            {track.isPublic ? 'Público' : 'Privado'}
                          </div>
                       )}
                       <button 
                        onClick={() => {
                          if (!user) return;
                          deleteDoc(doc(db, 'userMusic', track.id));
                        }}
                        className="p-3 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-500 text-[9px] font-black uppercase tracking-widest rounded-lg">
                        {track.rhythm}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-white leading-tight pr-8">
                       {track.title}
                    </h3>
                    <p className="text-sm font-bold text-zinc-500">
                       Por: <span className="text-emerald-500">{track.authorName}</span>
                    </p>
                  </div>

                  <div className="relative group/lyrics max-h-32 overflow-hidden mask-fade-bottom">
                     <p className="text-zinc-600 italic font-serif leading-relaxed text-base group-hover/lyrics:text-zinc-400 transition-colors">
                        {track.lyrics}
                     </p>
                  </div>
                </div>

                <div className="px-8 pb-8 flex items-center justify-between gap-4 mt-auto">
                   <button
                     onClick={() => handlePlay(track)}
                     className={cn(
                       "flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all",
                       playingTrack?.id === track.id && isPlaying
                        ? "bg-white text-zinc-950" 
                        : "bg-emerald-600 text-white hover:bg-emerald-500"
                     )}
                   >
                     {playingTrack?.id === track.id && isPlaying ? <Pause size={18} /> : <Play size={18} />}
                     {playingTrack?.id === track.id && isPlaying ? "Pausar" : "Reproduzir"}
                   </button>

                   <button 
                    className="p-4 bg-zinc-900 text-zinc-400 rounded-2xl hover:text-white hover:bg-zinc-800 transition-all border border-zinc-800"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: track.title,
                          text: `Ouça minha nova música: ${track.title} (${track.rhythm})\n\n${track.lyrics}`,
                          url: window.location.href
                        }).catch(console.error);
                      }
                    }}
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center">
           <div className="w-32 h-32 bg-zinc-900/50 rounded-full flex items-center justify-center text-zinc-800 mb-6 border border-zinc-800">
             <Music size={56} />
           </div>
           <h3 className="text-2xl font-black text-white mb-2 underline decoration-emerald-500 underline-offset-8">
             {activeTab === 'studio' ? 'Seu estúdio está vago' : 'Sem obras na comunidade'}
           </h3>
           <p className="text-zinc-500 max-w-sm font-medium">
             {activeTab === 'studio' 
               ? 'Suas composições aparecerão aqui. Comece um novo projeto agora!' 
               : 'Seja o primeiro a compartilhar sua arte com a comunidade cristã.'}
           </p>
        </div>
      )}

      {/* Persistent Audio Player with Lyrics */}
      <AnimatePresence>
        {playingTrack && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 md:left-24 md:right-24 z-50 pointer-events-none"
          >
            <div className="mx-auto max-w-4xl bg-black/90 backdrop-blur-2xl border border-zinc-800 p-1 rounded-[3rem] shadow-3xl pointer-events-auto overflow-hidden">
               <div className="p-4 flex flex-col md:flex-row items-center gap-6">
                  {/* Track Info */}
                  <div className="flex items-center gap-4 min-w-[200px]">
                     <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white relative overflow-hidden group">
                        <Music />
                        {isPlaying && (
                           <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: '100%' }}
                               transition={{ duration: 2, repeat: Infinity }}
                               className="h-full bg-white"
                             />
                           </div>
                        )}
                     </div>
                     <div>
                        <h4 className="text-white font-black text-lg line-clamp-1">{playingTrack.title}</h4>
                        <p className="text-emerald-500 text-xs font-bold">{playingTrack.authorName}</p>
                     </div>
                  </div>

                  {/* Lyrics Display */}
                  <div className="flex-1 w-full relative">
                     <div className="h-20 flex items-center justify-center overflow-hidden">
                        <div ref={lyricsContainerRef} className="text-center w-full px-4 transition-all duration-700">
                           {playingTrack.lyricsTimestamps ? (
                              playingTrack.lyricsTimestamps.map((line, idx) => {
                                 // Fallback for findLastIndex (ES2023)
                                 let activeLine = -1;
                                 for (let i = playingTrack.lyricsTimestamps!.length - 1; i >= 0; i--) {
                                   if (playingTrack.lyricsTimestamps![i].time <= currentTime) {
                                     activeLine = i;
                                     break;
                                   }
                                 }
                                 
                                 return (
                                    <p 
                                      key={idx}
                                      className={cn(
                                        "text-sm font-black uppercase tracking-wider transition-all duration-500 py-1",
                                        idx === activeLine 
                                          ? "text-white scale-110 opacity-100" 
                                          : "text-zinc-700 opacity-20 scale-90"
                                      )}
                                    >
                                       {line.text}
                                    </p>
                                 );
                              })
                           ) : (
                              <p className="text-zinc-600 text-xs italic font-medium">Letra não sincronizada para este arquivo</p>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-4">
                     <button 
                       onClick={() => handlePlay(playingTrack)}
                       className="p-4 bg-white text-zinc-950 rounded-full hover:scale-105 active:scale-95 transition-all"
                     >
                       {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                     </button>
                     <button 
                       onClick={() => setPlayingTrack(null)}
                       className="p-4 text-zinc-500 hover:text-white transition-colors"
                     >
                        <X size={20} />
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Track Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSaving && setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-[3rem] p-1 shadow-3xl overflow-hidden"
            >
              <div className="p-8 md:p-12 space-y-8 overflow-y-auto max-h-[85vh]">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                      <Save className="text-emerald-500" size={32} />
                      Nova Obra
                    </h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Registro de Propriedade Intelectual e Compartilhamento</p>
                  </div>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-500 hover:text-white"><X /></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] ml-1">Título da Composição</label>
                      <input
                        type="text"
                        placeholder="Ex: Refúgio e Fortaleza"
                        value={newTrack.title}
                        onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 focus:ring-2 focus:ring-emerald-500/50 outline-none text-white font-bold text-lg"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] ml-1">Nome do Autor / Cantor</label>
                      <input
                        type="text"
                        placeholder="Seu nome artístico ou oficial"
                        value={newTrack.authorName}
                        onChange={(e) => setNewTrack({ ...newTrack, authorName: e.target.value })}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 focus:ring-2 focus:ring-emerald-500/50 outline-none text-white font-bold"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                         <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Ritmo e Estilo</label>
                         <button 
                           onClick={identifyRhythm}
                           disabled={isAnalyzing}
                           className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-md hover:bg-emerald-500/10 transition-colors uppercase tracking-widest"
                         >
                           {isAnalyzing ? <RefreshCw className="animate-spin" size={12} /> : <Sparkles size={12} />}
                           Identificar via IA
                         </button>
                      </div>
                      <select
                        value={newTrack.rhythm}
                        onChange={(e) => setNewTrack({ ...newTrack, rhythm: e.target.value })}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 focus:ring-2 focus:ring-emerald-500/50 outline-none text-white font-bold appearance-none cursor-pointer"
                      >
                        {RHYTHMS.filter(r => r !== 'Todos').map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] ml-1">Configurações</label>
                       <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-3xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                               <Globe size={20} />
                             </div>
                             <div>
                                <p className="text-xs font-bold text-white">Compartilhar na Comunidade</p>
                                <p className="text-[9px] font-medium text-zinc-500">Outros usuários poderão ouvir e ler sua música.</p>
                             </div>
                          </div>
                          <button 
                             onClick={() => setNewTrack(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                             className={cn(
                               "w-12 h-6 rounded-full p-1 transition-colors duration-300",
                               newTrack.isPublic ? "bg-emerald-600" : "bg-zinc-800"
                             )}
                          >
                             <div className={cn(
                               "w-4 h-4 bg-white rounded-full transition-transform duration-300",
                               newTrack.isPublic ? "translate-x-6" : "translate-x-0"
                             )} />
                          </button>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] ml-1">Letra Completa</label>
                      <textarea
                        placeholder="Escreva a letra da sua música aqui..."
                        value={newTrack.lyrics}
                        onChange={(e) => setNewTrack({ ...newTrack, lyrics: e.target.value })}
                        className="w-full h-48 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 focus:ring-2 focus:ring-emerald-500/50 outline-none text-white font-serif italic text-lg resize-none leading-relaxed"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] ml-1">Arquivo Demo (Áudio)</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => setNewTrack({ ...newTrack, audioFile: e.target.files?.[0] || null })}
                          className="hidden"
                          id="audio-upload-modal"
                        />
                        <label 
                          htmlFor="audio-upload-modal"
                          className="w-full flex flex-col items-center justify-center gap-3 bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-3xl p-10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer group"
                        >
                          {newTrack.audioFile ? (
                            <div className="text-center">
                              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-3">
                                <Volume2 size={24} />
                              </div>
                              <p className="text-sm text-white font-black truncate max-w-[200px]">{newTrack.audioFile.name}</p>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">Sincronização de letra habilitada</p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-700 mx-auto mb-3 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-all">
                                <Plus size={24} />
                              </div>
                              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Selecionar Arquivo MP3/WAV</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 pt-10 border-t border-zinc-900">
                  <button
                    disabled={isSaving}
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-5 bg-zinc-900 text-zinc-500 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-zinc-800 transition-all border border-zinc-800"
                  >
                    Descartar
                  </button>
                  <button
                    disabled={isSaving}
                    onClick={handleSaveTrack}
                    className="flex-[2] py-5 bg-white text-zinc-950 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-zinc-100 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="animate-spin" size={18} />
                        Processando na Nuvem...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Registrar e Publicar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MusicPage;
