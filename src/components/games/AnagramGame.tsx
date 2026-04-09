import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Timer, Trophy, CheckCircle2, XCircle, RotateCcw, Lightbulb, Coins, HelpCircle } from 'lucide-react';
import { cn } from '../../types';

interface AnagramGameProps {
  onFinish: (score: number) => void;
  onClose: () => void;
  credits: number;
  onSpendCredits: (amount: number) => Promise<boolean> | boolean;
}

interface AnagramData {
  verse: string;
  author: string;
  book: string;
}

const ANAGRAMS: AnagramData[] = [
  { verse: "O SENHOR É MEU PASTOR E NADA ME FALTARÁ", author: "Davi", book: "Salmos 23:1" },
  { verse: "TUDO POSSO NAQUELE QUE ME FORTALECE", author: "Paulo", book: "Filipenses 4:13" },
  { verse: "NO PRINCÍPIO CRIOU DEUS OS CÉUS E A TERRA", author: "Moisés", book: "Gênesis 1:1" },
  { verse: "PORQUE DEUS AMOU O MUNDO DE TAL MANEIRA", author: "João", book: "João 3:16" }
];

const AnagramGame: React.FC<AnagramGameProps> = ({ onFinish, onClose, credits, onSpendCredits }) => {
  const [gameData, setGameData] = useState<AnagramData | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [score, setScore] = useState(100);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [hints, setHints] = useState({
    book: false,
    firstWord: false,
    lastWord: false
  });

  useEffect(() => {
    const randomGame = ANAGRAMS[Math.floor(Math.random() * ANAGRAMS.length)];
    setGameData(randomGame);
    
    const shuffledWords = randomGame.verse.split(" ").sort(() => Math.random() - 0.5);
    setWords(shuffledWords);

    const timer = setInterval(() => {
      setTimeLeft(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && timeLeft % 5 === 0) {
      setScore(prev => Math.max(0, prev - 1));
    }
  }, [timeLeft]);

  const checkSolution = () => {
    if (!gameData) return;
    if (words.join(" ") === gameData.verse) {
      setIsFinished(true);
      onFinish(score);
    } else {
      alert("A ordem ainda não está correta!");
    }
  };

  const buyHint = async (type: keyof typeof hints) => {
    if (hints[type]) return;
    const success = await onSpendCredits(5);
    if (success) {
      setHints(prev => ({ ...prev, [type]: true }));
    } else {
      alert("Créditos insuficientes!");
    }
  };

  if (!gameData) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-stone-200 dark:border-zinc-800">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-200">Anagrama de Versículo</h2>
          <p className="text-stone-500 text-sm">Ordene as palavras para formar o versículo</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl border border-amber-100 dark:border-amber-800">
            <Trophy className="text-amber-500" size={20} />
            <span className="font-bold text-amber-700">{score} pts</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-800">
            <Timer className="text-blue-500" size={20} />
            <span className="font-bold text-blue-700">{timeLeft}s</span>
          </div>
        </div>
      </div>

      <div className="bg-stone-50 dark:bg-zinc-800/50 p-4 rounded-2xl mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="text-blue-500" size={20} />
          <div>
            <p className="text-xs text-stone-500 uppercase font-bold">Quem falou?</p>
            <p className="font-bold text-stone-800 dark:text-stone-200">{gameData.author}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800">
          <Coins className="text-emerald-500" size={16} />
          <span className="font-bold text-emerald-700 text-sm">{credits} créditos</span>
        </div>
      </div>

      <Reorder.Group axis="y" values={words} onReorder={setWords} className="space-y-2 mb-8">
        {words.map((word) => (
          <Reorder.Item
            key={word}
            value={word}
            className="p-4 bg-white dark:bg-zinc-800 border-2 border-stone-100 dark:border-zinc-700 rounded-xl cursor-grab active:cursor-grabbing hover:border-blue-500 transition-colors font-medium text-stone-800 dark:text-stone-200 flex items-center gap-3"
          >
            <div className="w-2 h-2 bg-stone-300 rounded-full" />
            {word}
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <button
          onClick={() => buyHint('book')}
          disabled={hints.book}
          className={cn(
            "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all",
            hints.book 
              ? "bg-blue-50 border-blue-200 text-blue-700" 
              : "bg-stone-50 border-stone-100 text-stone-500 hover:border-blue-300"
          )}
        >
          <Lightbulb size={20} />
          <span className="text-[10px] font-bold uppercase">Livro</span>
          {hints.book ? <span className="text-xs font-bold">{gameData.book}</span> : <span className="text-[10px] text-emerald-600">5 créditos</span>}
        </button>
        <button
          onClick={() => buyHint('firstWord')}
          disabled={hints.firstWord}
          className={cn(
            "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all",
            hints.firstWord 
              ? "bg-blue-50 border-blue-200 text-blue-700" 
              : "bg-stone-50 border-stone-100 text-stone-500 hover:border-blue-300"
          )}
        >
          <Lightbulb size={20} />
          <span className="text-[10px] font-bold uppercase">Início</span>
          {hints.firstWord ? <span className="text-xs font-bold">{gameData.verse.split(" ")[0]}</span> : <span className="text-[10px] text-emerald-600">5 créditos</span>}
        </button>
        <button
          onClick={() => buyHint('lastWord')}
          disabled={hints.lastWord}
          className={cn(
            "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all",
            hints.lastWord 
              ? "bg-blue-50 border-blue-200 text-blue-700" 
              : "bg-stone-50 border-stone-100 text-stone-500 hover:border-blue-300"
          )}
        >
          <Lightbulb size={20} />
          <span className="text-[10px] font-bold uppercase">Fim</span>
          {hints.lastWord ? <span className="text-xs font-bold">{gameData.verse.split(" ").pop()}</span> : <span className="text-[10px] text-emerald-600">5 créditos</span>}
        </button>
      </div>

      <button
        onClick={checkSolution}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-lg transition-all"
      >
        Verificar Ordem
      </button>

      <button
        onClick={onClose}
        className="mt-6 w-full py-3 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 text-sm font-medium"
      >
        Desistir
      </button>
    </div>
  );
};

export default AnagramGame;
