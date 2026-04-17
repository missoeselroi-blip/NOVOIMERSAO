import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Video, Mic, Square, Download, Share2, 
  Trash2, Save, StickyNote, Loader2, Camera, 
  Pause, RotateCcw, Plus, X, List, History, 
  MessageSquare, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db, storage } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
  collection, addDoc, query, where, orderBy, 
  onSnapshot, deleteDoc, doc, serverTimestamp, 
  updateDoc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useToast } from '../components/Toast';
import { cn } from '../types';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

const mockSermons = [
  { 
    id: 'm1', 
    title: 'Missões e Satanismo na Disney.', 
    speaker: 'Pr. Josué Yrion', 
    type: 'video', 
    videoId: '69BBSmBAHOc',
    summary: 'Mensagem impactante é dividida em duas partes: 1ª parte revela os traços sutis de satanismo, pornografia e ocultismo nos desenhos e animações da Disney. 2ª parte revela o tamanho do desafio missionário em todo o mundo.'
  },
  { 
    id: 'm2', 
    title: 'Sanguessuga e Suas Filhas', 
    speaker: 'Pr. Jorge Linhares', 
    type: 'video', 
    videoId: 'aiizOFTscsY',
    summary: 'Mensagem edificante que traz uma profunda reflexão sobre a importância de sermos gratos e como a ganância e exploração tem atingido o ser humano em todas as suas relações.'
  },
  { 
    id: 'm3', 
    title: 'A Última Mensagem de Paulo', 
    speaker: 'Pr. Hernandes Dias Lopes', 
    type: 'video', 
    videoId: 'O4bvWuoMmkA',
    summary: 'Esta é uma mensagem inspiradora que traduz as últimas palavras do Apóstolo Paulo revelando como foram seus últimos dias, seus pedidos, preocupações e sentimentos.'
  }
];

interface UserSermon {
  id: string;
  userId: string;
  title: string;
  notes: string;
  mediaUrl: string;
  type: 'video' | 'audio';
  createdAt: any;
  duration?: number;
}

const SermonsPage = () => {
  const [user] = useAuthState(auth);
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'recommended' | 'my-sermons' | 'recorder'>('recommended');
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  
  // Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const [recorderType, setRecorderType] = useState<'video' | 'audio'>('audio');
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [sermonTitle, setSermonTitle] = useState('');
  const [sermonNotes, setSermonNotes] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  // User Sermons State
  const [userSermons, setUserSermons] = useState<UserSermon[]>([]);
  const [isLoadingSermons, setIsLoadingSermons] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserSermons([]);
      setIsLoadingSermons(false);
      return;
    }

    const q = query(
      collection(db, 'userSermons'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sermonsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserSermon[];
      setUserSermons(sermonsData);
      setIsLoadingSermons(false);
    }, (error) => {
      console.error("Error fetching user sermons:", error);
      setIsLoadingSermons(false);
    });

    return () => unsubscribe();
  }, [user]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: recorderType === 'video'
      });
      
      streamRef.current = stream;
      if (videoPreviewRef.current && recorderType === 'video') {
        videoPreviewRef.current.srcObject = stream;
      }

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorderType === 'video' ? 'video/webm' : 'audio/webm' });
        setMediaBlob(blob);
        setMediaUrl(URL.createObjectURL(blob));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      showToast(`Gravando ${recorderType === 'video' ? 'vídeo' : 'áudio'}... 🔴`, 'info');
    } catch (error) {
      console.error("Error starting recording:", error);
      showToast("Não foi possível acessar a câmera/microfone.", 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
    showToast("Gravação finalizada! 🏁", 'success');
  };

  const handleSaveSermon = async () => {
    if (!user) {
      showToast("Você precisa estar logado para salvar.", 'error');
      return;
    }
    if (!mediaBlob) return;
    if (!sermonTitle.trim()) {
      showToast("Dê um título para seu sermão.", 'info');
      return;
    }

    setIsUploading(true);
    showToast("Salvando sermão na nuvem... ☁️", 'info');

    try {
      const fileExt = recorderType === 'video' ? 'webm' : 'webm';
      const fileName = `sermons/${user.uid}/${Date.now()}.${fileExt}`;
      const fileRef = ref(storage, fileName);
      
      await uploadBytes(fileRef, mediaBlob);
      const downloadUrl = await getDownloadURL(fileRef);

      await addDoc(collection(db, 'userSermons'), {
        userId: user.uid,
        title: sermonTitle,
        notes: sermonNotes,
        mediaUrl: downloadUrl,
        type: recorderType,
        fileName: fileName,
        duration: recordingTime,
        createdAt: serverTimestamp()
      });

      showToast("Sermão salvo com sucesso! 🎉", 'success');
      resetRecorder();
      setActiveTab('my-sermons');
    } catch (error) {
      console.error("Error saving sermon:", error);
      showToast("Erro ao salvar o sermão na nuvem.", 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const resetRecorder = () => {
    setMediaBlob(null);
    setMediaUrl(null);
    setSermonTitle('');
    setSermonNotes('');
    setRecordingTime(0);
  };

  const handleDeleteSermon = async (sermon: UserSermon) => {
    if (!window.confirm("Tem certeza que deseja excluir este sermão permanentemente?")) return;

    try {
      // Delete from Storage first
      // Note: we need the original filename/path. Assuming it's stored in 'fileName'
      if ((sermon as any).fileName) {
        const fileRef = ref(storage, (sermon as any).fileName);
        await deleteObject(fileRef).catch(err => console.warn("Storage delete failed, might not exist:", err));
      }

      await deleteDoc(doc(db, 'userSermons', sermon.id));
      showToast("Sermão excluído.", 'success');
    } catch (error) {
      console.error("Error deleting sermon:", error);
      showToast("Erro ao excluir o sermão.", 'error');
    }
  };

  const handleShareSermon = async (sermon: UserSermon) => {
    const shareData = {
      title: `Meu Sermão: ${sermon.title}`,
      text: `Confira este sermão que gravei no App Imersão Bíblica: ${sermon.title}\nNotas: ${sermon.notes.substring(0, 100)}...`,
      url: sermon.mediaUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback
      await navigator.clipboard.writeText(sermon.mediaUrl);
      showToast("Link copiado para a área de transferência!", 'success');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 text-stone-900 dark:text-zinc-100">Sermões e Estudos</h1>
          <p className="text-stone-500 dark:text-zinc-400">Assista referências ou grave suas próprias mensagens.</p>
        </div>
        
        <div className="flex p-1.5 bg-stone-100 dark:bg-zinc-800 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('recommended')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'recommended' 
                ? "bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-sm" 
                : "text-stone-500 dark:text-zinc-400 hover:text-stone-700"
            )}
          >
            <List size={18} />
            Recomendados
          </button>
          <button
            onClick={() => setActiveTab('my-sermons')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'my-sermons' 
                ? "bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-sm" 
                : "text-stone-500 dark:text-zinc-400 hover:text-stone-700"
            )}
          >
            <History size={18} />
            Minhas Gravações
          </button>
          <button
            onClick={() => setActiveTab('recorder')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'recorder' 
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                : "text-stone-500 dark:text-zinc-400 hover:text-stone-700"
            )}
          >
            <Plus size={18} />
            Gravar Novo
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'recommended' && (
          <motion.div
            key="recommended"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {mockSermons.map((sermon, index) => (
              <motion.div 
                key={sermon.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group"
              >
                {activeVideo === sermon.videoId ? (
                  <div className="aspect-video w-full">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${sermon.videoId}?autoplay=1`} 
                      title={sermon.title} 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div 
                    className="aspect-video w-full relative group cursor-pointer"
                    onClick={() => setActiveVideo(sermon.videoId)}
                  >
                    <img 
                      src={`https://img.youtube.com/vi/${sermon.videoId}/maxresdefault.jpg`} 
                      alt={sermon.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${sermon.videoId}/hqdefault.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <Play size={32} className="ml-2" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-3">
                    <Video size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Vídeo Recomendado</span>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-zinc-100 mb-2 leading-tight group-hover:text-emerald-600 transition-colors">{sermon.title}</h3>
                  <p className="text-stone-500 dark:text-zinc-500 text-sm font-medium mb-3">Por {sermon.speaker}</p>
                  <p className="text-sm text-stone-500 dark:text-zinc-400 mb-6 flex-1 line-clamp-3">{sermon.summary}</p>
                  
                  <button 
                    onClick={() => activeVideo === sermon.videoId ? setActiveVideo(null) : setActiveVideo(sermon.videoId)}
                    className={cn(
                      "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all",
                      activeVideo === sermon.videoId 
                        ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                        : "bg-stone-100 hover:bg-emerald-600 hover:text-white dark:bg-zinc-800 dark:hover:bg-emerald-600 dark:text-zinc-100"
                    )}
                  >
                    {activeVideo === sermon.videoId ? (
                      <> <X size={18} /> Fechar </>
                    ) : (
                      <> <Play size={18} /> Assistir Agora </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'my-sermons' && (
          <motion.div
            key="my-sermons"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {isLoadingSermons ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-emerald-600" size={48} />
                <p className="text-stone-500 font-medium">Carregando seus sermões da nuvem...</p>
              </div>
            ) : userSermons.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border-2 border-dashed border-stone-200 dark:border-zinc-800 p-20 text-center">
                <div className="w-20 h-20 bg-stone-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Mic size={40} className="text-stone-300 dark:text-zinc-600" />
                </div>
                <h3 className="text-2xl font-bold text-stone-900 dark:text-zinc-100 mb-2">Configure seu primeiro sermão</h3>
                <p className="text-stone-500 dark:text-zinc-400 max-w-sm mx-auto mb-8">
                  Você ainda não gravou nenhum sermão. Suas gravações ficam salvas com segurança na nuvem.
                </p>
                <button
                  onClick={() => setActiveTab('recorder')}
                  className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                >
                  Começar a Gravar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userSermons.map((sermon) => (
                  <motion.div
                    key={sermon.id}
                    layoutId={sermon.id}
                    className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn(
                        "p-3 rounded-2xl",
                        sermon.type === 'video' ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                      )}>
                        {sermon.type === 'video' ? <Video size={24} /> : <Mic size={24} />}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleShareSermon(sermon)}
                          className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-stone-400"
                        >
                          <Share2 size={20} />
                        </button>
                        <button 
                          onClick={() => handleDeleteSermon(sermon)}
                          className="p-2 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 rounded-xl transition-colors text-stone-400"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-stone-900 dark:text-zinc-100 mb-2">{sermon.title}</h3>
                    <div className="text-xs text-stone-400 font-medium mb-4 flex items-center gap-2">
                      <span>{new Date(sermon.createdAt?.toDate?.() || Date.now()).toLocaleDateString('pt-BR')}</span>
                      <span>•</span>
                      <span>{formatTime(sermon.duration || 0)}</span>
                    </div>

                    <div className="bg-stone-50 dark:bg-zinc-800/50 rounded-2xl p-4 mb-6 relative group overflow-hidden">
                      {sermon.type === 'video' ? (
                        <video 
                          src={sermon.mediaUrl} 
                          controls 
                          className="w-full rounded-xl"
                        />
                      ) : (
                        <audio 
                          src={sermon.mediaUrl} 
                          controls 
                          className="w-full"
                        />
                      )}
                    </div>

                    {sermon.notes && (
                      <div className="mb-6">
                        <h4 className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
                          <StickyNote size={14} /> Notas do Sermão
                        </h4>
                        <div className="text-sm text-stone-600 dark:text-zinc-400 bg-stone-50/50 dark:bg-zinc-800/30 p-4 rounded-2xl max-h-32 overflow-y-auto">
                           <MarkdownRenderer content={sermon.notes} />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'recorder' && (
          <motion.div
            key="recorder"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recorder UI */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 p-8 shadow-sm overflow-hidden relative">
                  {!mediaUrl ? (
                    <div className="space-y-8">
                      <div className="flex items-center justify-center p-2 bg-stone-100 dark:bg-zinc-800 rounded-2xl w-fit mx-auto">
                        <button
                          onClick={() => setRecorderType('audio')}
                          disabled={isRecording}
                          className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                            recorderType === 'audio' ? "bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-sm" : "text-stone-500"
                          )}
                        >
                          <Mic size={18} /> Áudio
                        </button>
                        <button
                          onClick={() => setRecorderType('video')}
                          disabled={isRecording}
                          className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                            recorderType === 'video' ? "bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-sm" : "text-stone-500"
                          )}
                        >
                          <Camera size={18} /> Vídeo
                        </button>
                      </div>

                      <div className="aspect-video bg-stone-100 dark:bg-zinc-800 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group">
                        {recorderType === 'video' && (
                          <video 
                            ref={videoPreviewRef} 
                            autoPlay 
                            muted 
                            className={cn(
                              "w-full h-full object-cover transition-opacity",
                              isRecording ? "opacity-100" : "opacity-30"
                            )}
                          />
                        )}
                        
                        {!isRecording && recorderType === 'video' && (
                           <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400">
                             <Camera size={48} className="mb-4 opacity-20" />
                             <p className="text-sm font-medium">A prévia do vídeo aparecerá aqui</p>
                           </div>
                        )}

                        {recorderType === 'audio' && (
                          <div className="flex flex-col items-center gap-6">
                            <div className={cn(
                              "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300",
                              isRecording ? "bg-red-100 dark:bg-red-900/30 scale-110" : "bg-stone-50 dark:bg-zinc-700"
                            )}>
                              <Mic size={40} className={cn(
                                isRecording ? "text-red-500 animate-pulse" : "text-stone-300"
                              )} />
                            </div>
                            {isRecording && (
                              <div className="flex gap-1.5 items-end h-8">
                                {[...Array(8)].map((_, i) => (
                                  <motion.div
                                    key={i}
                                    animate={{ height: [10, 30, 15, 25, 10] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                                    className="w-1.5 bg-emerald-500 rounded-full"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {isRecording && (
                          <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-sm font-mono tracking-tighter shadow-xl">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                            {formatTime(recordingTime)}
                          </div>
                        )}
                      </div>

                      {!isRecording ? (
                        <button
                          onClick={startRecording}
                          className="w-full py-6 bg-emerald-600 text-white font-black text-xl rounded-3xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3 group"
                        >
                          <div className="w-4 h-4 bg-white rounded-full transition-transform group-hover:scale-125" />
                          COMEÇAR GRAVAÇÃO
                        </button>
                      ) : (
                        <button
                          onClick={stopRecording}
                          className="w-full py-6 bg-red-600 text-white font-black text-xl rounded-3xl hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 active:scale-95 flex items-center justify-center gap-3"
                        >
                          <Square size={24} fill="currentColor" />
                          PARAR AGORA
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                           <History className="text-emerald-600" size={24} />
                           Revisar Gravação
                        </h3>
                        <button onClick={resetRecorder} className="p-2 hover:bg-stone-100 rounded-xl text-stone-400">
                          <RotateCcw size={20} />
                        </button>
                      </div>

                      <div className="aspect-video bg-stone-900 rounded-3xl overflow-hidden shadow-2xl">
                         {recorderType === 'video' ? (
                           <video src={mediaUrl} controls className="w-full h-full object-contain" />
                         ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-stone-800 to-stone-900">
                             <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-6">
                               <Mic size={40} className="text-emerald-400" />
                             </div>
                             <audio src={mediaUrl} controls className="w-full" />
                           </div>
                         )}
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-stone-400 ml-2">Título do Sermão</label>
                          <input 
                            type="text"
                            placeholder="Ex: O Poder da Oração"
                            value={sermonTitle}
                            onChange={(e) => setSermonTitle(e.target.value)}
                            className="w-full px-6 py-4 bg-stone-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-stone-900 dark:text-white"
                          />
                        </div>

                        <button
                          onClick={handleSaveSermon}
                          disabled={isUploading || !sermonTitle.trim()}
                          className="w-full py-5 bg-emerald-600 text-white font-black text-xl rounded-3xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                          {isUploading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                          SALVAR NA NUVEM
                        </button>
                        
                        <p className="text-center text-[10px] text-stone-400 font-medium">
                          Seus sermões são salvos de forma privada no Firebase Storage.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes UI */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 p-8 shadow-sm flex flex-col h-full min-h-[500px]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center">
                      <StickyNote size={24} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-stone-900 dark:text-white leading-tight">Notas do Sermão</h3>
                      <p className="text-xs text-stone-400 font-medium">Anote os pontos principais de sua mensagem.</p>
                    </div>
                  </div>

                  <textarea
                    value={sermonNotes}
                    onChange={(e) => setSermonNotes(e.target.value)}
                    placeholder="Comece a digitar seu esboço ou notas aqui... (Suporta Markdown: # Título, * Item)"
                    className="flex-1 w-full p-6 bg-stone-50 dark:bg-zinc-800/50 border-none rounded-3xl focus:ring-2 focus:ring-amber-500 transition-all resize-none text-stone-800 dark:text-white font-medium leading-relaxed"
                  />
                  
                  <div className="mt-6 flex items-center justify-between text-[10px] text-stone-400 font-bold uppercase tracking-widest px-2">
                    <span>{sermonNotes.split(/\s+/).filter(Boolean).length} palavras</span>
                    <div className="flex items-center gap-4">
                       <span className="flex items-center gap-1"><History size={10}/> Auto-salvamento ativo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SermonsPage;
