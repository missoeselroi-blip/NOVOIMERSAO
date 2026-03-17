import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

interface FeedbackSectionProps {
  page: string;
  context?: string;
}

export function FeedbackSection({ page, context }: FeedbackSectionProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showCommentField, setShowCommentField] = useState(false);

  const handleSubmit = async (selectedRating: 'up' | 'down' | null = rating) => {
    if (!selectedRating && !comment.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        page,
        context: context || '',
        rating: selectedRating,
        comment: comment.trim(),
        userId: user?.id || 'anonymous',
        userEmail: user?.email || 'anonymous',
        createdAt: new Date().toISOString()
      });
      setSubmitted(true);
      showToast('Obrigado pelo seu feedback! 🙏✨', 'success');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showToast('Erro ao enviar feedback. Tente novamente.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 text-center"
      >
        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Feedback enviado! Obrigado por nos ajudar a melhorar. ❤️</p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <MessageSquare size={16} />
          O que achou deste conteúdo?
        </h4>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setRating('up');
              if (!showCommentField) handleSubmit('up');
              else setRating('up');
            }}
            className={`p-2 rounded-xl transition-all ${
              rating === 'up' 
                ? 'bg-emerald-600 text-white shadow-lg' 
                : 'bg-stone-50 dark:bg-zinc-800 text-stone-400 hover:text-emerald-600'
            }`}
          >
            <ThumbsUp size={20} />
          </button>
          <button
            onClick={() => {
              setRating('down');
              setShowCommentField(true);
            }}
            className={`p-2 rounded-xl transition-all ${
              rating === 'down' 
                ? 'bg-red-600 text-white shadow-lg' 
                : 'bg-stone-50 dark:bg-zinc-800 text-stone-400 hover:text-red-600'
            }`}
          >
            <ThumbsDown size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {(showCommentField || rating) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-3 overflow-hidden"
          >
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte-nos mais (opcional)..."
              className="w-full p-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:border-emerald-500 transition-colors resize-none h-24"
            />
            <button
              onClick={() => handleSubmit()}
              disabled={isSubmitting || (!rating && !comment.trim())}
              className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {isSubmitting ? <span className="animate-pulse">Enviando...</span> : <><Send size={18} /> Enviar Feedback</>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!showCommentField && !rating && (
        <button 
          onClick={() => setShowCommentField(true)}
          className="text-xs text-stone-400 hover:text-emerald-600 transition-colors font-medium"
        >
          Adicionar um comentário opcional
        </button>
      )}
    </div>
  );
}
