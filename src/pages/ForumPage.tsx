import React, { useState } from 'react';
import { 
  MessageSquare, 
  ShieldAlert, 
  Send, 
  ThumbsUp, 
  Reply, 
  User, 
  Star,
  AlertCircle,
  Info,
  Volume2,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/Toast';
import { AudioSearchButton } from '../components/AudioSearchButton';
import { AudioConfirmationModal } from '../components/AudioConfirmationModal';
import { geminiService } from '../services/geminiService';
import { ForumPost, RANKS } from '../types/forum';
import { cn } from '../types';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useAudioBox } from '../contexts/AudioBoxContext';

const RULES = [
  "Proibido palavrões e linguagem ofensiva.",
  "Proibido ameaças de qualquer natureza.",
  "Proibido brigas e discussões agressivas.",
  "Proibido bullying ou assédio.",
  "Mantenha o respeito e a ética cristã.",
  "Pena para violação: Exclusão imediata do fórum e perda de patente."
];

const MOCK_POSTS: ForumPost[] = [
  {
    id: '1',
    author: 'Pastor João',
    authorRank: 'Capitão',
    content: 'A paz do Senhor a todos! O que estão achando da nova ferramenta de criação de esboços?',
    timestamp: '2 horas atrás',
    likes: 12,
    replies: [
      {
        id: '1-1',
        author: 'Irmão Marcos',
        authorRank: 'Sargento',
        content: 'Tem me ajudado muito nas pregações de domingo!',
        timestamp: '1 hora atrás'
      }
    ]
  },
  {
    id: '2',
    author: 'Missionária Ana',
    authorRank: 'Tenente-Coronel',
    content: 'Gostaria de compartilhar um versículo que tocou meu coração hoje: Salmos 23.',
    timestamp: '5 horas atrás',
    likes: 25,
    replies: []
  }
];

export default function ForumPage() {
  const { fontFamily, fontSize, lineHeight } = useAccessibility();
  const { saveTrack } = useAudioBox();
  const { showToast } = useToast();
  const [posts, setPosts] = useState<ForumPost[]>(MOCK_POSTS);
  const [newPost, setNewPost] = useState('');
  const [showRules, setShowRules] = useState(true);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [isAudioConfirmModalOpen, setIsAudioConfirmModalOpen] = useState(false);
  const [pendingSpeechText, setPendingSpeechText] = useState('');

  const handlePost = () => {
    if (!newPost.trim()) return;
    
    // Simple profanity check (demo only)
    const forbidden = ['palavrao1', 'palavrao2']; // Add real ones if needed
    if (forbidden.some(word => newPost.toLowerCase().includes(word))) {
      showToast("Sua mensagem contém palavras proibidas. Respeite as regras!", 'error');
      return;
    }

    const post: ForumPost = {
      id: Date.now().toString(),
      author: 'Você',
      authorRank: 'Marinheiro', // Default for demo
      content: newPost,
      timestamp: 'Agora',
      likes: 0,
      replies: []
    };

    setPosts([post, ...posts]);
    setNewPost('');
    showToast("Mensagem enviada com sucesso! 🙌✨");
  };

  const handleListen = (text: string) => {
    setPendingSpeechText(text);
    setIsAudioConfirmModalOpen(true);
  };

  const confirmGenerateSpeech = async () => {
    setIsAudioConfirmModalOpen(false);
    setIsGeneratingSpeech(true);
    try {
      const audioUrl = await geminiService.generateSpeech(pendingSpeechText);
      const audio = new Audio(audioUrl);
      await audio.play();
      showToast("Reproduzindo áudio... 🔊✨");

      // Auto-save to Audio Box
      try {
        await saveTrack('Post do Fórum', audioUrl, 'Fórum', 'Comunidade');
        showToast("Áudio salvo na Caixa de Áudios! 🎵", 'success');
      } catch (saveError) {
        console.error("Error auto-saving to audio box:", saveError);
      }
    } catch (error) {
      console.error("Error generating speech:", error);
      showToast("Erro ao gerar áudio.", "error");
    } finally {
      setIsGeneratingSpeech(false);
      setPendingSpeechText('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      {/* Transparent Background Icon */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] z-0 overflow-hidden">
        <MessageSquare size={800} className="text-emerald-900 dark:text-emerald-100 -rotate-12" />
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-3">
            <img 
              src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
              alt="Logo" 
              className="w-8 h-8 object-contain mix-blend-multiply dark:mix-blend-screen"
              referrerPolicy="no-referrer"
            />
            <h2 className="text-3xl font-display font-bold flex items-center gap-3">
              <MessageSquare className="text-emerald-600" size={32} />
              Fórum do Servo Bom e Fiel
            </h2>
            <img 
              src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
              alt="Logo" 
              className="w-8 h-8 object-contain mix-blend-multiply dark:mix-blend-screen"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <button 
          onClick={() => setShowRules(!showRules)}
          className="px-4 py-2 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-200 transition-colors"
        >
          <ShieldAlert size={18} />
          {showRules ? 'Ocultar Regras' : 'Ver Regras'}
        </button>
      </header>

      <AnimatePresence>
        {showRules && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6 rounded-3xl">
              <h3 className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-4">
                <AlertCircle size={20} />
                Regras de Convivência
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {RULES.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shrink-0">
            <User size={24} />
          </div>
          <div className="flex-1 space-y-4">
            <div className="relative">
              <textarea 
                placeholder="⚓ O que deseja compartilhar com a comunidade?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className={cn(
                  "w-full p-4 pr-12 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px] resize-none",
                  fontFamily === 'dyslexic' ? 'font-dyslexic' : 
                  fontFamily === 'serif' ? 'font-serif' : 
                  fontFamily === 'mono' ? 'font-mono' : 'font-sans',
                  fontSize === 'xs' ? 'text-xs' :
                  fontSize === 'sm' ? 'text-sm' :
                  fontSize === 'base' ? 'text-base' :
                  fontSize === 'lg' ? 'text-lg' :
                  fontSize === 'xl' ? 'text-xl' :
                  fontSize === '2xl' ? 'text-2xl' : 'text-3xl'
                )}
                style={{ lineHeight }}
              />
              <div className="absolute right-3 top-3">
                <AudioSearchButton onResult={(text) => setNewPost(text)} size={18} />
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={handlePost}
                disabled={!newPost.trim()}
                className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Send size={18} />
                Publicar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-stone-400">
                  <User size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold">{post.author}</h4>
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {post.authorRank}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">{post.timestamp}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl text-stone-400 transition-colors">
                <ShieldAlert size={18} />
              </button>
              <button 
                onClick={() => handleListen(`${post.author} disse: ${post.content}`)}
                disabled={isGeneratingSpeech}
                className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl text-stone-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
                title="Ouvir"
              >
                {isGeneratingSpeech && pendingSpeechText === `${post.author} disse: ${post.content}` ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Volume2 size={18} />
                )}
              </button>
            </div>

            <p className="text-stone-700 dark:text-zinc-300 leading-relaxed">
              {post.content}
            </p>

            <div className="flex items-center gap-6 pt-2 border-t border-stone-100 dark:border-zinc-800">
              <button 
                onClick={() => {
                  const updatedPosts = posts.map(p => {
                    if (p.id === post.id) {
                      const isLiked = (p as any).isLiked;
                      return { ...p, likes: isLiked ? p.likes - 1 : p.likes + 1, isLiked: !isLiked };
                    }
                    return p;
                  });
                  setPosts(updatedPosts);
                  if (!(post as any).isLiked) {
                    showToast("Você curtiu este post! ❤️");
                  }
                }}
                className={cn(
                  "flex items-center gap-2 transition-all text-sm font-medium",
                  (post as any).isLiked ? "text-red-500" : "text-stone-500 hover:text-emerald-600"
                )}
              >
                <motion.div
                  animate={(post as any).isLiked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <ThumbsUp size={18} fill={(post as any).isLiked ? "currentColor" : "none"} />
                </motion.div>
                {post.likes} Curtidas
              </button>
              <button className="flex items-center gap-2 text-stone-500 hover:text-blue-600 transition-colors text-sm font-medium">
                <Reply size={18} />
                {post.replies.length} Respostas
              </button>
            </div>

            {post.replies.length > 0 && (
              <div className="pl-8 space-y-4 pt-4">
                {post.replies.map((reply) => (
                  <div key={reply.id} className="bg-stone-50 dark:bg-zinc-800/50 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-sm">{reply.author}</h5>
                      <span className="px-2 py-0.5 bg-stone-200 dark:bg-zinc-700 text-stone-600 dark:text-zinc-400 text-[8px] font-bold rounded-full uppercase tracking-wider">
                        {reply.authorRank}
                      </span>
                      <span className="text-[10px] text-stone-400 ml-auto">{reply.timestamp}</span>
                    </div>
                    <p className="text-sm text-stone-600 dark:text-zinc-400">
                      {reply.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <AudioConfirmationModal
        isOpen={isAudioConfirmModalOpen}
        isLoading={isGeneratingSpeech}
        onClose={() => setIsAudioConfirmModalOpen(false)}
        onConfirm={confirmGenerateSpeech}
      />
    </div>
  );
}
