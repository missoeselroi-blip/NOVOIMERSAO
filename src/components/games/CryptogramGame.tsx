import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Trophy, CheckCircle2, XCircle, RotateCcw, Lock, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '../../types';
import { useToast } from '../../components/Toast';

interface CryptogramGameProps {
  onFinish: (score: number) => void;
  onClose: () => void;
}

interface CryptogramData {
  phrase: string;
  author: string;
}

const CRYPTOGRAMS: CryptogramData[] = [
  { phrase: "EU SOU O CAMINHO A VERDADE E A VIDA", author: "Jesus" },
  { phrase: "O SENHOR E O MEU PASTOR E NADA ME FALTARA", author: "Salmos" },
  { phrase: "TUDO POSSO NAQUELE QUE ME FORTALECE", author: "Paulo" },
  { phrase: "O TEMOR DO SENHOR E O PRINCIPIO DA SABEDORIA", author: "Provérbios" }
];

const CryptogramGame: React.FC<CryptogramGameProps> = ({ onFinish, onClose }) => {
  const { showToast } = useToast();
  const [gameData, setGameData] = useState<CryptogramData | null>(null);
  const [mapping, setMapping] = useState<Record<string, number>>({});
  const [userGuesses, setUserGuesses] = useState<Record<number, string>>({});
  const [score, setScore] = useState(100);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [shake, setShake] = useState<number | null>(null);

  useEffect(() => {
    const randomGame = CRYPTOGRAMS[Math.floor(Math.random() * CRYPTOGRAMS.length)];
    setGameData(randomGame);

    const chars = Array.from(new Set(randomGame.phrase.replace(/\s/g, "").split("")));
    const shuffledNumbers = Array.from({ length: 26 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    
    const newMapping: Record<string, number> = {};
    chars.forEach((char, index) => {
      newMapping[char] = shuffledNumbers[index];
    });
    setMapping(newMapping);

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

  const handleGuessChange = (num: number, letter: string) => {
    const upperLetter = letter.toUpperCase().slice(-1);
    if (!upperLetter) {
      setUserGuesses(prev => {
        const newState = { ...prev };
        delete newState[num];
        return newState;
      });
      return;
    }
    if (!/[A-Z]/.test(upperLetter)) return;

    // Só aceita se a letra estiver correta para aquele número
    const correctChar = Object.keys(mapping).find(key => mapping[key] === num);
    if (upperLetter === correctChar) {
      setUserGuesses(prev => ({ ...prev, [num]: upperLetter }));
    } else {
      // Feedback visual de erro
      setShake(num);
      setTimeout(() => setShake(null), 500);
    }
  };

  const checkSolution = () => {
    if (!gameData) return;
    
    const totalRequired = Object.keys(mapping).length;
    const totalGuessed = Object.keys(userGuesses).length;

    if (totalGuessed === totalRequired) {
      setIsFinished(true);
      showToast("Parabéns! Você decifrou o criptograma!", "success");
      onFinish(score);
    } else {
      showToast("A frase ainda não está completa! Continue decifrando.", "error");
    }
  };

  if (!gameData) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-stone-200 dark:border-zinc-800 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-200">Criptograma</h2>
          <p className="text-stone-500 text-sm">Decifre a frase: {gameData.author}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-stone-100 dark:bg-zinc-800 p-1 rounded-lg border border-stone-200 dark:border-zinc-700">
            <button 
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
              className="p-1 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded transition-colors"
              title="Reduzir zoom"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-[10px] font-bold w-8 text-center">{Math.round(zoom * 100)}%</span>
            <button 
              onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
              className="p-1 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded transition-colors"
              title="Aumentar zoom"
            >
              <ZoomIn size={16} />
            </button>
          </div>
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

      <div className="relative border-2 border-stone-200 dark:border-zinc-700 rounded-2xl overflow-hidden bg-stone-50 dark:bg-zinc-900/50 mb-8">
        <div className="overflow-auto max-h-[500px] p-8 custom-scrollbar">
          <div className="flex flex-wrap gap-x-8 gap-y-10 justify-center min-w-fit">
            {gameData.phrase.split(" ").map((word, wIdx) => (
              <div key={wIdx} className="flex gap-2">
                {word.split("").map((char, cIdx) => {
                  const num = mapping[char];
                  const isShaking = shake === num;
                  return (
                    <div key={cIdx} className="flex flex-col items-center gap-2">
                      <input
                        type="text"
                        value={userGuesses[num] || ""}
                        onChange={(e) => handleGuessChange(num, e.target.value)}
                        style={{ 
                          width: 40 * zoom, 
                          height: 40 * zoom, 
                          fontSize: 18 * zoom 
                        }}
                        className={cn(
                          "text-center font-bold border-2 rounded-xl bg-white dark:bg-zinc-800 text-stone-800 dark:text-stone-200 focus:border-blue-500 outline-none uppercase transition-all",
                          userGuesses[num] ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "border-stone-200 dark:border-zinc-700",
                          isShaking && "animate-shake border-red-500"
                        )}
                      />
                      <span 
                        className="font-bold text-stone-400"
                        style={{ fontSize: 12 * zoom }}
                      >
                        {num}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-stone-50 dark:bg-zinc-800/50 p-6 rounded-2xl mb-8 border border-stone-100 dark:border-zinc-800">
        <h4 className="text-xs font-bold text-stone-500 uppercase mb-4 tracking-widest">Legenda de Descobertas</h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(userGuesses).filter(([_, val]) => val !== "").map(([num, val]) => (
            <div key={num} className="bg-white dark:bg-zinc-800 px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 text-sm shadow-sm flex items-center gap-2">
              <span className="font-bold text-blue-500">{num}</span>
              <span className="text-stone-300">=</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{val}</span>
            </div>
          ))}
          {Object.keys(userGuesses).length === 0 && (
            <p className="text-stone-400 text-xs italic">Nenhuma letra descoberta ainda...</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={checkSolution}
          className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={24} />
          Verificar Resposta
        </button>
        <button
          onClick={onClose}
          className="px-8 py-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 rounded-2xl font-bold hover:bg-stone-200 dark:hover:bg-zinc-700 transition-all"
        >
          Desistir
        </button>
      </div>
    </div>
  );
};

export default CryptogramGame;
