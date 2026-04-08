import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Type, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../components/Toast';

const WORDS = ["JESUS", "PEDRO", "GRACA", "ALTAR", "SANTO", "LIVRO", "CRUZ", "AMOR", "FE", "PAZ", "VIDA"];

interface HiddenWordGameProps {
  onFinish: (score: number) => void;
  onClose: () => void;
}

export default function HiddenWordGame({ onFinish, onClose }: HiddenWordGameProps) {
  const { showToast } = useToast();
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Select a random 5-letter word
    const fiveLetterWords = WORDS.filter(w => w.length === 5);
    const randomWord = fiveLetterWords[Math.floor(Math.random() * fiveLetterWords.length)];
    setTargetWord(randomWord);
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isGameOver) return;

    if (e.key === 'Enter') {
      if (currentGuess.length !== 5) {
        showToast('A palavra deve ter 5 letras.', 'info');
        return;
      }
      
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      
      if (currentGuess === targetWord) {
        const points = (6 - guesses.length) * 20;
        setScore(points);
        showToast(`Parabéns! Você acertou e ganhou ${points} pontos.`, 'success');
        setIsGameOver(true);
      } else if (newGuesses.length >= 6) {
        showToast(`Fim de jogo! A palavra era ${targetWord}.`, 'error');
        setIsGameOver(true);
      }
      
      setCurrentGuess('');
    } else if (e.key === 'Backspace') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Za-z]$/.test(e.key) && currentGuess.length < 5) {
      setCurrentGuess(prev => (prev + e.key).toUpperCase());
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, guesses, isGameOver, targetWord]);

  const getLetterStatus = (letter: string, index: number, guess: string) => {
    if (targetWord[index] === letter) return 'bg-emerald-500 text-white border-emerald-600';
    if (targetWord.includes(letter)) return 'bg-amber-500 text-white border-amber-600';
    return 'bg-stone-300 dark:bg-zinc-700 text-stone-600 dark:text-stone-400 border-stone-400 dark:border-zinc-600';
  };

  if (isGameOver) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-stone-200 dark:border-zinc-800 text-center">
        <h2 className="text-3xl font-bold text-emerald-600 mb-4">Fim de Jogo!</h2>
        <p className="text-xl mb-6">Sua pontuação final: {score}</p>
        <button
          onClick={() => onFinish(score)}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all"
        >
          Salvar e Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-stone-200 dark:border-zinc-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Type className="text-orange-500" /> Palavra Oculta
        </h2>
        <span className="font-bold text-stone-500">Desafio do Dia</span>
      </div>

      <p className="text-stone-600 dark:text-stone-400 mb-8 text-center">
        Digite uma palavra de 5 letras e aperte ENTER.
      </p>

      <div className="flex flex-col items-center gap-2 mb-8">
        {[...Array(6)].map((_, rowIndex) => {
          const guess = guesses[rowIndex];
          const isCurrentRow = rowIndex === guesses.length;
          
          return (
            <div key={rowIndex} className="flex gap-2">
              {[...Array(5)].map((_, colIndex) => {
                let letter = '';
                let statusClass = 'bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700';

                if (guess) {
                  letter = guess[colIndex];
                  statusClass = getLetterStatus(letter, colIndex, guess);
                } else if (isCurrentRow && currentGuess[colIndex]) {
                  letter = currentGuess[colIndex];
                  statusClass = 'border-stone-400 dark:border-zinc-500';
                }

                return (
                  <div 
                    key={colIndex}
                    className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-2xl font-bold rounded-lg border-2 ${statusClass}`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <button onClick={onClose} className="text-stone-500 hover:text-stone-700 text-sm">
          Sair do Jogo
        </button>
      </div>
    </div>
  );
}
