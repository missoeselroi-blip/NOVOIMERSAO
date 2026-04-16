import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Send, 
  Loader2, 
  Trash2, 
  User as UserIcon,
  ShieldAlert,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  doc, 
  deleteDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  limit,
  increment
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { geminiService } from '../services/geminiService';
import { cn } from '../types';

interface PrayerComment {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  createdAt: any;
}

interface PrayerRequest {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  prayerCount: number;
  prayingUserIds: string[];
  createdAt: any;
  comments?: PrayerComment[];
}

export function PrayerRequestsSection() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [newRequest, setNewRequest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'prayerRequests'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PrayerRequest[];
      setRequests(requestsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching prayer requests:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const moderateContent = async (content: string): Promise<boolean> => {
    try {
      const prompt = `Analise o seguinte texto e determine se ele contém conteúdo inapropriado, ofensivo, indecoroso, palavrões ou discurso de ódio. Responda apenas "SAFE" se o conteúdo for apropriado ou "UNSAFE" se for inapropriado.

Texto: "${content}"`;
      
      const result = await geminiService.generateText(prompt, "Você é um moderador de conteúdo para uma comunidade cristã.");
      return result.trim().toUpperCase() === 'SAFE';
    } catch (error) {
      console.error("Moderation error:", error);
      return true; // Fallback to safe if API fails, or handle as needed
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newRequest.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const isSafe = await moderateContent(newRequest);
      if (!isSafe) {
        showToast("Seu pedido contém conteúdo que viola nossas diretrizes de comunidade.", "error");
        setIsSubmitting(false);
        return;
      }

      await addDoc(collection(db, 'prayerRequests'), {
        userId: user.id,
        userName: user.name || 'Usuário',
        userPhoto: user.photoURL || user.avatar || '',
        content: newRequest.trim(),
        prayerCount: 0,
        prayingUserIds: [],
        createdAt: serverTimestamp()
      });

      setNewRequest('');
      showToast("Pedido de oração compartilhado! 🙏", "success");
    } catch (error) {
      console.error("Error sharing prayer request:", error);
      showToast("Erro ao compartilhar pedido.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePrayer = async (requestId: string, isPraying: boolean) => {
    if (!user) return;

    const requestRef = doc(db, 'prayerRequests', requestId);
    try {
      if (isPraying) {
        await updateDoc(requestRef, {
          prayingUserIds: arrayRemove(user.id),
          prayerCount: increment(-1)
        });
      } else {
        await updateDoc(requestRef, {
          prayingUserIds: arrayUnion(user.id),
          prayerCount: increment(1)
        });
      }
    } catch (error) {
      console.error("Error toggling prayer:", error);
    }
  };

  const handleSubmitComment = async (requestId: string) => {
    if (!user || !newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const isSafe = await moderateContent(newComment);
      if (!isSafe) {
        showToast("Seu comentário contém conteúdo inapropriado.", "error");
        setIsSubmittingComment(false);
        return;
      }

      await addDoc(collection(db, `prayerRequests/${requestId}/comments`), {
        requestId,
        userId: user.id,
        userName: user.name || 'Usuário',
        userPhoto: user.photoURL || user.avatar || '',
        content: newComment.trim(),
        createdAt: serverTimestamp()
      });

      setNewComment('');
      setCommentingOn(null);
      showToast("Palavra enviada! ✨", "success");
    } catch (error) {
      console.error("Error posting comment:", error);
      showToast("Erro ao enviar comentário.", "error");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!window.confirm("Deseja realmente excluir este pedido?")) return;
    try {
      await deleteDoc(doc(db, 'prayerRequests', requestId));
      showToast("Pedido removido.", "info");
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  return (
    <section className="mt-12 space-y-8">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-black tracking-tight text-stone-800 dark:text-zinc-100 flex items-center justify-center gap-2">
          <Users className="text-emerald-600" size={28} />
          Pedidos de Oração
        </h3>
        <p className="text-stone-500 dark:text-zinc-400">Compartilhe seu fardo e interceda pelos irmãos.</p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmitRequest} className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] shadow-xl border border-stone-100 dark:border-zinc-800 space-y-4">
        <textarea
          value={newRequest}
          onChange={(e) => setNewRequest(e.target.value)}
          placeholder="No que podemos orar por você hoje?"
          className="w-full p-4 bg-stone-50 dark:bg-zinc-800 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 min-h-[120px] resize-none text-stone-700 dark:text-zinc-200"
          maxLength={2000}
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-stone-400">{newRequest.length}/2000</span>
          <button
            type="submit"
            disabled={!newRequest.trim() || isSubmitting}
            className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            Compartilhar Pedido
          </button>
        </div>
      </form>

      {/* Requests List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 bg-stone-50 dark:bg-zinc-800/50 rounded-[2rem] border-2 border-dashed border-stone-200 dark:border-zinc-700">
            <p className="text-stone-400">Nenhum pedido de oração no momento. Seja o primeiro a compartilhar!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence mode="popLayout">
              {requests.map((request) => (
                <PrayerRequestCard 
                  key={request.id} 
                  request={request} 
                  user={user}
                  onTogglePrayer={handleTogglePrayer}
                  onDelete={handleDeleteRequest}
                  commentingOn={commentingOn}
                  setCommentingOn={setCommentingOn}
                  newComment={newComment}
                  setNewComment={setNewComment}
                  isSubmittingComment={isSubmittingComment}
                  onSubmitComment={handleSubmitComment}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}

function PrayerRequestCard({ 
  request, 
  user, 
  onTogglePrayer, 
  onDelete,
  commentingOn,
  setCommentingOn,
  newComment,
  setNewComment,
  isSubmittingComment,
  onSubmitComment
}: { 
  request: PrayerRequest, 
  user: any,
  onTogglePrayer: (id: string, isPraying: boolean) => void,
  onDelete: (id: string) => void,
  commentingOn: string | null,
  setCommentingOn: (id: string | null) => void,
  newComment: string,
  setNewComment: (val: string) => void,
  isSubmittingComment: boolean,
  onSubmitComment: (id: string) => void
}) {
  const isPraying = user && request.prayingUserIds?.includes(user.id);
  const [comments, setComments] = useState<PrayerComment[]>([]);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (showComments) {
      const q = query(
        collection(db, `prayerRequests/${request.id}/comments`),
        orderBy('createdAt', 'asc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const commentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PrayerComment[];
        setComments(commentsData);
      });
      return () => unsubscribe();
    }
  }, [showComments, request.id]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] shadow-lg border border-stone-100 dark:border-zinc-800 space-y-4"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
            {request.userPhoto ? (
              <img src={request.userPhoto} alt={request.userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <UserIcon className="text-stone-400" size={20} />
            )}
          </div>
          <div>
            <h4 className="font-bold text-stone-800 dark:text-zinc-100">{request.userName}</h4>
            <span className="text-[10px] text-stone-400">
              {request.createdAt?.toDate ? request.createdAt.toDate().toLocaleString() : 'Recentemente'}
            </span>
          </div>
        </div>
        {user && (user.id === request.userId || user.role === 'admin') && (
          <button onClick={() => onDelete(request.id)} className="p-2 text-stone-400 hover:text-red-500 transition-colors">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <p className="text-stone-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
        {request.content}
      </p>

      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={() => onTogglePrayer(request.id, !!isPraying)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm",
            isPraying 
              ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" 
              : "bg-stone-50 text-stone-500 hover:bg-stone-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          )}
        >
          <Heart size={18} className={cn(isPraying && "fill-current animate-pulse")} />
          {request.prayerCount || 0} Em Oração
        </button>

        <button
          onClick={() => {
            setShowComments(!showComments);
            setCommentingOn(commentingOn === request.id ? null : request.id);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-stone-50 text-stone-500 hover:bg-stone-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 rounded-xl transition-all font-bold text-sm"
        >
          <MessageSquare size={18} />
          Dar uma palavra
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-4 pt-4 border-t border-stone-50 dark:border-zinc-800"
          >
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 bg-stone-50 dark:bg-zinc-800/50 p-3 rounded-2xl">
                  <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
                    {comment.userPhoto ? (
                      <img src={comment.userPhoto} alt={comment.userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon className="text-stone-400" size={14} />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-stone-800 dark:text-zinc-100">{comment.userName}</span>
                      <span className="text-[9px] text-stone-400">
                        {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleString() : 'Recentemente'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-zinc-400">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {commentingOn === request.id && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escreva uma palavra de fé..."
                  className="flex-1 p-3 bg-stone-50 dark:bg-zinc-800 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && onSubmitComment(request.id)}
                />
                <button
                  onClick={() => onSubmitComment(request.id)}
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmittingComment ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
