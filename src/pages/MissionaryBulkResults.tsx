import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Download, 
  Save, 
  Share2, 
  ArrowLeft, 
  CheckCircle, 
  BookOpen,
  FileText,
  Copy,
  Volume2,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../components/Toast';
import { SaveToNotebookModal } from '../components/SaveToNotebookModal';
import { AudioConfirmationModal } from '../components/AudioConfirmationModal';
import { geminiService } from '../services/geminiService';

import { useAuth } from '../contexts/AuthContext';
import { useAudioBox } from '../contexts/AudioBoxContext';
import { db, auth } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

interface Devotional {
  title: string;
  verse: string;
  message: string;
}

export default function MissionaryBulkResults({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { saveTrack } = useAudioBox();
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [pendingNote, setPendingNote] = useState<{ title: string, content: string } | null>(null);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [isAudioConfirmModalOpen, setIsAudioConfirmModalOpen] = useState(false);
  const [pendingSpeechText, setPendingSpeechText] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('missionary_bulk_devotionals');
    if (saved) {
      setDevotionals(JSON.parse(saved));
    }
  }, []);

  const handleDownloadAll = () => {
    const content = devotionals.map((d, i) => `DIA ${i + 1}\n${d.title}\n${d.verse}\n${d.message}\n\n`).join('---\n\n');
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "devocionais-do-mes.txt";
    document.body.appendChild(element);
    element.click();
    showToast("Baixando todos os devocionais... 📄✨");
  };

  const handleSaveAll = () => {
    const content = devotionals.map((d, i) => `DIA ${i + 1}\n${d.title}\n${d.verse}\n${d.message}\n\n`).join('---\n\n');
    setPendingNote({
      title: "Série Devocional Missionária (Mês)",
      content: content
    });
    setIsNotebookModalOpen(true);
  };

  const confirmSaveToNotebook = async (category: 'Anotações' | 'Pregações' | 'Estudos') => {
    if (!pendingNote) return;
    
    setIsSavingNote(true);
    try {
      if (user) {
        await addDoc(collection(db, 'notes'), {
          userId: user.id,
          title: pendingNote.title,
          content: pendingNote.content,
          category,
          createdAt: new Date().toISOString()
        }).catch(err => handleFirestoreError(err, OperationType.CREATE, 'notes'));
      } else {
        const saved = localStorage.getItem('preacher_notes');
        const entries = saved ? JSON.parse(saved) : [];
        
        const newEntry = {
          id: Date.now().toString(),
          title: pendingNote.title,
          content: pendingNote.content,
          category,
          date: new Date().toLocaleDateString('pt-BR'),
          createdAt: new Date().toISOString()
        };

        localStorage.setItem('preacher_notes', JSON.stringify([newEntry, ...entries]));
      }
      showToast(`Todos os devocionais foram salvos em ${category}! 📖✅`, 'success');
      setIsNotebookModalOpen(false);
      setPendingNote(null);
    } catch (error) {
      console.error("Error saving to notebook:", error);
      showToast("Erro ao salvar no caderno.", 'error');
    } finally {
      setIsSavingNote(false);
    }
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
      
      // Auto-save to Audio Box if it's a generated audio
      try {
        await saveTrack('Devocional Missionário', audioUrl, 'Missionário', 'Inspirador');
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

  if (devotionals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="p-6 bg-stone-100 dark:bg-zinc-800 rounded-full text-stone-400">
          <Calendar size={48} />
        </div>
        <p className="text-stone-500 font-medium">Nenhum resultado encontrado.</p>
        <button onClick={onBack} className="text-emerald-600 font-bold">Voltar</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <img 
                src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
                alt="Logo" 
                className="w-8 h-8 object-contain"
                referrerPolicy="no-referrer"
              />
              <h2 className="text-2xl font-bold">Resultados do Mês</h2>
              <img 
                src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
                alt="Logo" 
                className="w-8 h-8 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-stone-500 text-sm">30 Devocionais Missionários Gerados</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleSaveAll}
            className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <Save size={18} /> SALVAR TUDO
          </button>
          <button 
            onClick={handleDownloadAll}
            className="flex-1 md:flex-none px-6 py-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-xl hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
          >
            <Download size={18} /> BAIXAR TUDO
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devotionals.map((d, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all flex flex-col h-full"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full text-xs font-bold">
                DIA {i + 1}
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${d.title}\n${d.verse}\n${d.message}`);
                  showToast("Copiado! 📋");
                }}
                className="p-2 text-stone-400 hover:text-emerald-600 transition-colors"
              >
                <Copy size={18} />
              </button>
              <button 
                onClick={() => handleListen(`${d.title}. ${d.verse}. ${d.message}`)}
                disabled={isGeneratingSpeech}
                className="p-2 text-stone-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
                title="Ouvir"
              >
                {isGeneratingSpeech && pendingSpeechText === `${d.title}. ${d.verse}. ${d.message}` ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Volume2 size={18} />
                )}
              </button>
            </div>
            <h3 className="text-xl font-bold mb-3">{d.title}</h3>
            <div className="p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl mb-4 border border-stone-100 dark:border-zinc-800">
              <p className="text-sm font-serif italic text-stone-600 dark:text-zinc-400">"{d.verse}"</p>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed flex-1">{d.message}</p>
          </motion.div>
        ))}
      </div>
      <SaveToNotebookModal
        isOpen={isNotebookModalOpen}
        isLoading={isSavingNote}
        onClose={() => setIsNotebookModalOpen(false)}
        onConfirm={confirmSaveToNotebook}
      />
      <AudioConfirmationModal
        isOpen={isAudioConfirmModalOpen}
        isLoading={isGeneratingSpeech}
        onClose={() => setIsAudioConfirmModalOpen(false)}
        onConfirm={confirmGenerateSpeech}
      />
    </div>
  );
}
