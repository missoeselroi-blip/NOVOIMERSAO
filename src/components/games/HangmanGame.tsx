import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Skull, Lightbulb, RefreshCw, Clock } from 'lucide-react';
import { cn } from '../../types';
import { useToast } from '../../components/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const HANGMAN_WORDS = [
  { word: "GENESIS", hint: "É um livro da bíblia." },
  { word: "APOCALIPSE", hint: "É um livro da bíblia." },
  { word: "JERUSALEM", hint: "É uma cidade de Israel." },
  { word: "GOLIAS", hint: "Foi um inimigo de Israel." },
  { word: "ELIAS", hint: "Foi um profeta." },
  { word: "DAVI", hint: "Foi um rei." },
  { word: "SANSAO", hint: "Foi um juíz." },
  { word: "PEDRO", hint: "Andou com Jesus." },
  { word: "BARTIMEU", hint: "Foi curado." },
  { word: "TIMOTEO", hint: "É citado por Paulo no livro..." },
  { word: "EFESO", hint: "Foi uma das igrejas primitiva." },
  { word: "MOISES", hint: "Foi um profeta." },
  { word: "SALOMAO", hint: "Foi um rei." },
  { word: "JERICO", hint: "É uma cidade de Israel." },
  { word: "FILISTEUS", hint: "Foi um inimigo de Israel." },
  { word: "MATEUS", hint: "Andou com Jesus." },
  { word: "LAZARO", hint: "Foi curado." },
  { word: "CORINTO", hint: "Foi uma das igrejas primitiva." }
];

interface HangmanGameProps {
  onFinish: (score: number) => void;
  onClose: () => void;
}

export default function HangmanGame({ onFinish, onClose }: HangmanGameProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [target, setTarget] = useState(HANGMAN_WORDS[0]);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(100);
  const [hintsUsed, setHintsUsed] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isGameOver && score > 10) {
      timer = setInterval(() => {
        setScore(prev => Math.max(10, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isGameOver, score]);

  const startNewGame = () => {
    const randomTarget = HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)];
    setTarget(randomTarget);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setIsGameOver(false);
    setScore(100);
    setHintsUsed(0);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const handleGuess = (letter: string) => {
    if (isGameOver || guessedLetters.has(letter)) return;

    const newGuessed = new Set(guessedLetters);
    newGuessed.add(letter);
    setGuessedLetters(newGuessed);

    if (!target.word.includes(letter)) {
      const newWrong = wrongGuesses + 1;
      setWrongGuesses(newWrong);
      if (newWrong >= 6) {
        showToast(`Fim de jogo! A palavra era ${target.word}`, 'error');
        setScore(0);
        setIsGameOver(true);
      }
    } else {
      const isWin = target.word.split('').every(l => newGuessed.has(l));
      if (isWin) {
        showToast(`Parabéns! Você ganhou ${score} pontos.`, 'success');
        setIsGameOver(true);
      }
    }
  };

  const handleHint = async () => {
    if (isGameOver) return;
    
    if (!user) {
      showToast('Você precisa estar logado para usar dicas.', 'error');
      return;
    }

    try {
      const userRef = doc(db, 'quizLeaderboard', user.id);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const currentCredits = userSnap.data().credits ?? 50;
        if (currentCredits >= 5) {
          await updateDoc(userRef, {
            credits: currentCredits - 5
          });
          revealLetter();
          setHintsUsed(prev => prev + 1);
          showToast('Dica usada! -5 créditos.', 'success');
        } else {
          showToast('Créditos insuficientes! Você precisa de 5 créditos.', 'error');
        }
      } else {
        // Document doesn't exist yet, create it with default credits minus 5
        await setDoc(userRef, {
          name: user.name || 'Usuário',
          credits: 45,
          updatedAt: serverTimestamp()
        }, { merge: true });
        revealLetter();
        setHintsUsed(prev => prev + 1);
        showToast('Dica usada! -5 créditos.', 'success');
      }
    } catch (error) {
      console.error("Erro ao usar dica:", error);
      showToast('Erro ao usar dica.', 'error');
    }
  };

  const revealLetter = () => {
    const unrevealed = target.word.split('').filter(l => !guessedLetters.has(l));
    if (unrevealed.length > 0) {
      const randomLetter = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      handleGuess(randomLetter);
    }
  };

  const renderHangman = () => {
    return (
      <div className="relative w-48 h-48 mx-auto mb-8 border-l-4 border-t-4 border-stone-800 dark:border-stone-200">
        <div className="absolute top-0 left-16 w-1 h-8 bg-stone-800 dark:bg-stone-200"></div>
        {/* Head */}
        {wrongGuesses >= 1 && <div className="absolute top-8 left-12 w-8 h-8 rounded-full border-4 border-stone-800 dark:border-stone-200"></div>}
        {/* Body */}
        {wrongGuesses >= 2 && <div className="absolute top-16 left-16 w-1 h-16 bg-stone-800 dark:bg-stone-200"></div>}
        {/* Right Arm */}
        {wrongGuesses >= 3 && <div className="absolute top-20 left-16 w-10 h-1 bg-stone-800 dark:bg-stone-200 origin-left rotate-45"></div>}
        {/* Left Arm */}
        {wrongGuesses >= 4 && <div className="absolute top-20 left-6 w-10 h-1 bg-stone-800 dark:bg-stone-200 origin-right -rotate-45"></div>}
        {/* Right Leg */}
        {wrongGuesses >= 5 && <div className="absolute top-32 left-16 w-10 h-1 bg-stone-800 dark:bg-stone-200 origin-left rotate-45"></div>}
        {/* Left Leg */}
        {wrongGuesses >= 6 && <div className="absolute top-32 left-6 w-10 h-1 bg-stone-800 dark:bg-stone-200 origin-right -rotate-45"></div>}
      </div>
    );
  };

  if (isGameOver) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-stone-200 dark:border-zinc-800 text-center">
        <h2 className="text-3xl font-bold text-emerald-600 mb-4">Fim de Jogo!</h2>
        <p className="text-xl mb-6">Sua pontuação final: {score}</p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <button
            onClick={startNewGame}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={20} /> Nova Palavra
          </button>
          <button
            onClick={() => onFinish(score)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all"
          >
            Salvar e Voltar
          </button>
        </div>
      </div>
    );
  }

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-stone-200 dark:border-zinc-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-stone-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-stone-100 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-2xl">
            <Skull className="text-red-500 w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-stone-800 dark:text-white uppercase tracking-tight">Forca Bíblica</h2>
            <p className="text-xs text-stone-500 font-bold uppercase tracking-widest">Descubra a palavra</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20">
            <Clock size={20} />
            <span className="text-xl">{score}</span>
            <span className="text-[10px] uppercase font-black tracking-tighter opacity-70">pts</span>
          </div>
          
          <div className="flex-1 md:flex-none flex items-center justify-center gap-4 bg-white dark:bg-zinc-800 px-6 py-3 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold">
            <span className="text-stone-400 text-xs uppercase tracking-widest">Erros</span>
            <span className={cn("text-xl", wrongGuesses >= 4 ? "text-red-500" : "text-stone-700 dark:text-stone-200")}>
              {wrongGuesses}/6
            </span>
          </div>

          <button 
            onClick={handleHint}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95 group"
          >
            <Lightbulb size={20} className="group-hover:animate-pulse" />
            <span>Dica</span>
            <span className="text-[10px] bg-amber-600 px-1.5 py-0.5 rounded ml-1">-5 Créditos</span>
          </button>
        </div>
      </div>

      <p className="text-center text-stone-500 mb-4">Dica: {target.hint}</p>

      {renderHangman()}

      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {target.word.split('').map((letter, idx) => (
          <div key={idx} className="w-10 h-12 border-b-4 border-stone-800 dark:border-stone-200 flex items-center justify-center text-2xl font-bold">
            {guessedLetters.has(letter) ? letter : ''}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
        {alphabet.map(letter => (
          <button
            key={letter}
            onClick={() => handleGuess(letter)}
            disabled={guessedLetters.has(letter)}
            className={`w-10 h-10 rounded-lg font-bold text-lg transition-all ${
              guessedLetters.has(letter)
                ? target.word.includes(letter)
                  ? 'bg-emerald-500 text-white'
                  : 'bg-stone-300 text-stone-500 dark:bg-zinc-700'
                : 'bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-800 dark:text-stone-200'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="mt-8 text-center flex justify-center gap-4">
        <button onClick={startNewGame} className="text-blue-500 hover:text-blue-700 text-sm font-bold flex items-center gap-1">
          <RefreshCw size={16} /> Nova Palavra
        </button>
        <button onClick={onClose} className="text-stone-500 hover:text-stone-700 text-sm">
          Sair do Jogo
        </button>
      </div>
    </div>
  );
}
