import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Trophy, CheckCircle2, XCircle, RotateCcw, HelpCircle, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '../../types';
import { useToast } from '../../components/Toast';

interface WordSearchGameProps {
  onFinish: (score: number) => void;
  onClose: () => void;
}

const GRID_SIZE = 15;
const PHRASE = "TUDO POSSO NAQUELE QUE ME FORTALECE";
const WORDS_TO_FIND = ["TUDO", "POSSO", "NAQUELE", "FORTALECE"];
const TOTAL_WORDS_IN_PHRASE = 6;

const WordSearchGame: React.FC<WordSearchGameProps> = ({ onFinish, onClose }) => {
  const { showToast } = useToast();
  const [grid, setGrid] = useState<string[][]>([]);
  const [selectedCells, setSelectedCells] = useState<{ r: number; c: number }[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<{ r: number; c: number }[]>([]);
  const [score, setScore] = useState(100);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [showCorrection, setShowCorrection] = useState(false);
  const [zoom, setZoom] = useState(1.0);

  const generateGrid = useCallback(() => {
    const newGrid = Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(null)
    );

    WORDS_TO_FIND.forEach(word => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        attempts++;
        const direction = Math.random() > 0.5 ? 'H' : 'V';
        const row = Math.floor(Math.random() * (direction === 'H' ? GRID_SIZE : GRID_SIZE - word.length));
        const col = Math.floor(Math.random() * (direction === 'H' ? GRID_SIZE - word.length : GRID_SIZE));

        let canPlace = true;
        for (let i = 0; i < word.length; i++) {
          const r = direction === 'H' ? row : row + i;
          const c = direction === 'H' ? col + i : col;
          if (newGrid[r][c] !== null && newGrid[r][c] !== word[i]) {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          for (let i = 0; i < word.length; i++) {
            const r = direction === 'H' ? row : row + i;
            const c = direction === 'H' ? col + i : col;
            newGrid[r][c] = word[i];
          }
          placed = true;
        }
      }
    });

    // Fill remaining with random letters
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newGrid[r][c] === null) {
          const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
          newGrid[r][c] = chars[Math.floor(Math.random() * chars.length)];
        }
      }
    }

    setGrid(newGrid);
  }, []);

  useEffect(() => {
    generateGrid();
    const timer = setInterval(() => {
      setTimeLeft(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [generateGrid]);

  useEffect(() => {
    if (timeLeft > 0 && timeLeft % 5 === 0) {
      setScore(prev => Math.max(0, prev - 1));
    }
  }, [timeLeft]);

  const handleCellClick = (r: number, c: number) => {
    if (isFinished) return;
    
    const isSelected = selectedCells.some(cell => cell.r === r && cell.c === c);
    if (isSelected) {
      setSelectedCells(prev => prev.filter(cell => !(cell.r === r && cell.c === c)));
    } else {
      const newSelected = [...selectedCells, { r, c }];
      setSelectedCells(newSelected);
      
      // Check if selected cells form a word
      const word = newSelected.map(cell => grid[cell.r][cell.c]).join("");
      const reversedWord = word.split("").reverse().join("");
      
      if (WORDS_TO_FIND.includes(word) && !foundWords.includes(word)) {
        setFoundWords(prev => [...prev, word]);
        setFoundCells(prev => [...prev, ...newSelected]);
        showToast(`Palavra encontrada: ${word}!`, "success");
        setSelectedCells([]);
      } else if (WORDS_TO_FIND.includes(reversedWord) && !foundWords.includes(reversedWord)) {
        setFoundWords(prev => [...prev, reversedWord]);
        setFoundCells(prev => [...prev, ...newSelected]);
        showToast(`Palavra encontrada: ${reversedWord}!`, "success");
        setSelectedCells([]);
      }
    }
  };

  const handleFinalSubmit = () => {
    if (userInput.toUpperCase().trim() === PHRASE) {
      setIsFinished(true);
      showToast("Parabéns! Você completou o Caça Palavras!", "success");
      onFinish(score);
    } else {
      showToast("Frase incorreta! Tente novamente.", "error");
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-stone-200 dark:border-zinc-800 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-200">Caça Palavras</h2>
          <p className="text-stone-500 text-sm">Encontre as palavras e forme a verdade bíblica</p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Tamanho da Grade</span>
            <div className="flex items-center gap-2 bg-stone-100 dark:bg-zinc-800 p-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 shadow-sm">
              <button 
                onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-lg transition-colors text-stone-600 dark:text-stone-400"
                title="Diminuir letras"
              >
                <ZoomOut size={18} />
              </button>
              <div className="px-3 flex flex-col items-center justify-center border-x border-stone-200 dark:border-zinc-700">
                <span className="text-[10px] font-black text-stone-800 dark:text-white leading-none mb-0.5">{Math.round(zoom * 100)}%</span>
                <button 
                  onClick={() => setZoom(1.0)}
                  className="text-[8px] font-black text-emerald-600 uppercase hover:underline"
                >
                  Reset
                </button>
              </div>
              <button 
                onClick={() => setZoom(prev => Math.min(2.0, prev + 0.1))}
                className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-lg transition-colors text-stone-600 dark:text-stone-400"
                title="Aumentar letras"
              >
                <ZoomIn size={18} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-4 py-2.5 rounded-2xl border border-amber-100 dark:border-amber-800 shadow-sm">
            <Trophy className="text-amber-500" size={20} />
            <span className="font-bold text-amber-700">{score} pts</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2.5 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-sm">
            <Timer className="text-blue-500" size={20} />
            <span className="font-bold text-blue-700">{timeLeft}s</span>
          </div>
        </div>
      </div>

      {!showCorrection ? (
        <div className="space-y-6">
          <div className="sticky top-0 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm flex flex-wrap gap-2 items-center justify-center">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-widest mr-2">Encontrar:</span>
            {WORDS_TO_FIND.map(word => (
              <span 
                key={word} 
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1.5",
                  foundWords.includes(word) 
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm opacity-60" 
                    : "bg-stone-100 text-stone-600 border-stone-200 dark:bg-zinc-800 dark:text-stone-300 dark:border-zinc-700 shadow-sm"
                )}
              >
                {foundWords.includes(word) && <CheckCircle2 size={12} />}
                {word}
              </span>
            ))}
          </div>

          <div className="relative border-4 border-stone-200 dark:border-zinc-700 rounded-3xl overflow-hidden bg-stone-50 dark:bg-zinc-950 shadow-inner">
            <div className="overflow-auto max-h-[70vh] cursor-grab active:cursor-grabbing p-4 md:p-12 touch-pan-x touch-pan-y" id="grid-container">
              <div 
                className="grid gap-1.5 transition-all duration-200"
                style={{ 
                  gridTemplateColumns: `repeat(${GRID_SIZE}, ${40 * zoom}px)`,
                  width: 'fit-content'
                }}
              >
                {grid.map((row, r) => (
                  row.map((char, c) => {
                    const isSelected = selectedCells.some(cell => cell.r === r && cell.c === c);
                    const isFound = foundCells.some(cell => cell.r === r && cell.c === c);
                    
                    return (
                      <button
                        key={`${r}-${c}`}
                        onClick={() => handleCellClick(r, c)}
                        style={{ 
                          width: 40 * zoom, 
                          height: 40 * zoom, 
                          fontSize: Math.max(8, 18 * zoom)
                        }}
                        className={cn(
                          "flex items-center justify-center font-bold rounded-xl transition-all shadow-sm select-none",
                          isSelected ? "bg-blue-500 text-white scale-110 z-10 shadow-lg ring-4 ring-blue-500/30" : 
                          isFound ? "bg-emerald-500 text-white shadow-md" :
                          "bg-white dark:bg-zinc-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-700 border border-stone-100 dark:border-zinc-700"
                        )}
                      >
                        {char}
                      </button>
                    );
                  })
                ))}
              </div>
            </div>
            {/* Visual Guide for Scroll */}
            <div className="absolute bottom-2 right-2 text-[10px] text-stone-400 font-bold bg-white/80 dark:bg-zinc-900/80 px-2 py-1 rounded-full pointer-events-none">
              Role para navegar no grid
            </div>
          </div>



          <div className="flex flex-col sm:flex-row gap-4">
            {foundWords.length === WORDS_TO_FIND.length && (
              <button
                onClick={() => setShowCorrection(true)}
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={24} />
                Formar Frase Final
              </button>
            )}
            <button
              onClick={onClose}
              className="px-8 py-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 rounded-2xl font-bold hover:bg-stone-200 dark:hover:bg-zinc-700 transition-all"
            >
              Desistir
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 py-8 max-w-2xl mx-auto">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-200 mb-2">Qual é a frase?</h3>
            <p className="text-stone-500">Escreva a frase completa que você descobriu</p>
          </div>

          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Digite a frase aqui..."
            className="w-full p-6 rounded-2xl border-2 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-center text-xl font-bold uppercase focus:border-blue-500 outline-none transition-all"
          />

          <div className="flex gap-4">
            <button
              onClick={() => setShowCorrection(false)}
              className="flex-1 py-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 rounded-2xl font-bold hover:bg-stone-200 dark:hover:bg-zinc-700 transition-all"
            >
              Voltar ao Grid
            </button>
            <button
              onClick={handleFinalSubmit}
              className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg transition-all"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordSearchGame;
