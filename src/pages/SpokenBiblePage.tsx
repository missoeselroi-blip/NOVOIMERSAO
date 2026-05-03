import React, { useState } from 'react';
import { 
  Volume2, 
  Search, 
  BookOpen, 
  ArrowLeft,
  X,
  Plus,
  Clock,
  Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../types';
import { useAudioBible, ALL_BOOKS, AudioBibleBook } from '../contexts/AudioBibleContext';

export default function SpokenBiblePage() {
  const { playChapter, selectedBook: ctxBook, selectedChapter: ctxChapter } = useAudioBible();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<AudioBibleBook | null>(null);
  const [testamentFilter, setTestamentFilter] = useState<'all' | 'VT' | 'NT'>('all');

  const filteredBooks = ALL_BOOKS.filter(book => {
    const matchesSearch = book.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTestament = testamentFilter === 'all' || book.testament === testamentFilter;
    return matchesSearch && matchesTestament;
  });

  return (
    <div className="min-h-screen pb-32 pt-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button 
                onClick={() => {
                  if (selectedBook) setSelectedBook(null);
                  else window.history.back();
                }}
                className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-3xl font-black text-stone-900 dark:text-white tracking-tighter uppercase flex items-center gap-3">
                <div className="p-2 bg-amber-600 text-white rounded-xl">
                  <Headphones size={24} />
                </div>
                Bíblia Áudio
              </h1>
            </div>
            <p className="text-stone-500 dark:text-zinc-400 font-medium">
              Ouça a Palavra de Deus em qualquer lugar.
            </p>
          </div>

          <div className="flex items-center gap-2">
          </div>
        </div>

        {!selectedBook ? (
          <div className="space-y-8">
            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-600 transition-colors" size={20} />
                <input 
                  type="text"
                  placeholder="Pesquisar livro..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm"
                />
              </div>
              <div className="flex bg-stone-100 dark:bg-zinc-800 p-1 rounded-2xl border border-stone-200 dark:border-zinc-700">
                <button 
                  onClick={() => setTestamentFilter('all')}
                  className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all", testamentFilter === 'all' ? "bg-white dark:bg-zinc-700 text-amber-600 shadow-sm" : "text-stone-500")}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setTestamentFilter('VT')}
                  className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all", testamentFilter === 'VT' ? "bg-white dark:bg-zinc-700 text-amber-600 shadow-sm" : "text-stone-500")}
                >
                  VT
                </button>
                <button 
                  onClick={() => setTestamentFilter('NT')}
                  className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all", testamentFilter === 'NT' ? "bg-white dark:bg-zinc-700 text-amber-600 shadow-sm" : "text-stone-500")}
                >
                  NT
                </button>
              </div>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredBooks.map((book) => (
                <motion.button
                  key={book.pk}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedBook(book)}
                  className="p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-900 transition-all text-center flex flex-col items-center gap-3 group"
                >
                  <div className={cn(
                    "p-3 rounded-2xl transition-colors",
                    book.testament === 'VT' ? "bg-stone-100 dark:bg-zinc-800 text-stone-500 group-hover:bg-amber-100" : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 group-hover:bg-emerald-100"
                  )}>
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-stone-900 dark:text-white line-clamp-1">{book.name}</h3>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest font-black mt-1">{book.chapters} cap</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Chapters View */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className={cn(
                  "p-4 rounded-[1.5rem]",
                  selectedBook.testament === 'VT' ? "bg-stone-100 text-stone-500" : "bg-emerald-100 text-emerald-600"
                )}>
                  <BookOpen size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-stone-900 dark:text-white uppercase tracking-tight">{selectedBook.name}</h2>
                  <p className="text-xs text-stone-400 uppercase tracking-[0.2em] font-bold">
                    {selectedBook.testament === 'VT' ? 'Velho Testamento' : 'Novo Testamento'} • {selectedBook.chapters} Capítulos
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter) => (
                  <button
                    key={`chapter-${chapter}`}
                    onClick={() => playChapter(selectedBook, chapter)}
                    className={cn(
                      "aspect-square rounded-2xl font-bold flex items-center justify-center transition-all border",
                      ctxBook?.pk === selectedBook.pk && ctxChapter === chapter
                        ? "bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-600/20" 
                        : "bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 border-transparent hover:border-amber-200"
                    )}
                  >
                    {chapter}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
