import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, CheckCircle2, Trophy, ArrowRight, RotateCcw, ChevronRight, ChevronDown, ZoomIn, ZoomOut } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { cn } from '../../types';

type BibleDivision = 
  | 'Pentateuco' 
  | 'Históricos' 
  | 'Poéticos' 
  | 'Profetas Maiores' 
  | 'Profetas Menores' 
  | 'Evangelhos' 
  | 'História' 
  | 'Epístolas Paulinas' 
  | 'Epístolas Gerais' 
  | 'Profecia';

interface CrosswordWord {
  number: number;
  word: string;
  hint: string;
  row: number;
  col: number;
  direction: 'across' | 'down';
}

interface CrosswordData {
  width: number;
  height: number;
  words: CrosswordWord[];
}

const THEMED_CROSSWORDS: Record<BibleDivision, CrosswordData> = {
  'Evangelhos': {
    width: 12,
    height: 12,
    words: [
      { number: 1, word: "JESUS", hint: "O centro dos evangelhos", row: 0, col: 0, direction: 'across' },
      { number: 2, word: "SALVACAO", hint: "O que Jesus trouxe ao mundo", row: 0, col: 2, direction: 'down' },
      { number: 3, word: "BELEM", hint: "Cidade onde Jesus nasceu", row: 2, col: 0, direction: 'across' },
      { number: 4, word: "MILAGRE", hint: "Ato sobrenatural de Jesus", row: 2, col: 4, direction: 'down' },
      { number: 5, word: "CRUZ", hint: "Onde Jesus morreu", row: 7, col: 4, direction: 'across' },
    ]
  },
  'Pentateuco': {
    width: 12,
    height: 12,
    words: [
      { number: 1, word: "ADAO", hint: "O primeiro homem", row: 0, col: 0, direction: 'across' },
      { number: 2, word: "ARCA", hint: "Construída por Noé", row: 0, col: 0, direction: 'down' },
      { number: 3, word: "EGITO", hint: "Terra da escravidão", row: 3, col: 0, direction: 'across' },
      { number: 4, word: "MOISES", hint: "Líder do êxodo", row: 1, col: 3, direction: 'down' },
      { number: 5, word: "MANA", hint: "Pão do deserto", row: 6, col: 3, direction: 'across' },
    ]
  },
  'Históricos': {
    width: 12,
    height: 12,
    words: [
      { number: 1, word: "DAVI", hint: "Rei que venceu Golias", row: 0, col: 0, direction: 'across' },
      { number: 2, word: "ESTER", hint: "Rainha que salvou seu povo", row: 0, col: 3, direction: 'down' },
      { number: 3, word: "JOSUE", hint: "Sucessor de Moisés", row: 2, col: 0, direction: 'across' },
      { number: 4, word: "MUROS", hint: "Neemias reconstruiu os de Jerusalém", row: 4, col: 0, direction: 'across' },
      { number: 5, word: "SANSAO", hint: "Juiz muito forte", row: 2, col: 2, direction: 'down' },
    ]
  },
  'Poéticos': {
    width: 12,
    height: 12,
    words: [
      { number: 1, word: "SALMOS", hint: "Livro de cânticos", row: 0, col: 0, direction: 'across' },
      { number: 2, word: "SABIO", hint: "Salomão era muito...", row: 0, col: 0, direction: 'down' },
      { number: 3, word: "JO", hint: "Exemplo de paciência", row: 3, col: 0, direction: 'across' },
      { number: 4, word: "AMADO", hint: "Termo de Cantares", row: 0, col: 4, direction: 'down' },
      { number: 5, word: "VAIDADE", hint: "Tema de Eclesiastes", row: 5, col: 0, direction: 'across' },
    ]
  },
  'Profetas Maiores': {
    width: 12,
    height: 12,
    words: [
      { number: 1, word: "ISAIAS", hint: "Profeta messiânico", row: 0, col: 0, direction: 'across' },
      { number: 2, word: "DANIEL", hint: "Na cova dos leões", row: 0, col: 0, direction: 'down' },
      { number: 3, word: "OSSOS", hint: "Ezequiel viu o vale de...", row: 3, col: 0, direction: 'across' },
      { number: 4, word: "OLEIRO", hint: "Jeremias visitou sua casa", row: 0, col: 4, direction: 'down' },
      { number: 5, word: "COVAS", hint: "Onde Daniel foi lançado", row: 5, col: 0, direction: 'across' },
    ]
  },
  'Profetas Menores': {
    width: 12,
    height: 12,
    words: [
      { number: 1, word: "JONAS", hint: "Engolido por um grande peixe", row: 0, col: 0, direction: 'across' },
      { number: 2, word: "JOEL", hint: "Profeta do derramamento do Espírito", row: 0, col: 0, direction: 'down' },
      { number: 3, word: "PEIXE", hint: "O que engoliu Jonas", row: 3, col: 0, direction: 'across' },
      { number: 4, word: "NINIVE", hint: "Cidade para onde Jonas fugiu", row: 0, col: 4, direction: 'down' },
      { number: 5, word: "JUSTO", hint: "Viverá pela fé (Habacuque)", row: 5, col: 0, direction: 'across' },
    ]
  },
  'História': {
    width: 12,
    height: 12,
    words: [
      { number: 1, word: "ATOS", hint: "História da igreja primitiva", row: 0, col: 0, direction: 'across' },
      { number: 2, word: "PAULO", hint: "Apóstolo dos gentios", row: 0, col: 0, direction: 'down' },
      { number: 3, word: "ROMA", hint: "Destino final de Paulo em Atos", row: 3, col: 0, direction: 'across' },
      { number: 4, word: "ESTEVAO", hint: "Primeiro mártir", row: 0, col: 4, direction: 'down' },
      { number: 5, word: "FOGO", hint: "Línguas de... no Pentecostes", row: 5, col: 0, direction: 'across' },
    ]
  },
  'Epístolas Paulinas': {
    width: 12,
    height: 12,
    words: [
      { number: 1, word: "GRACA", hint: "Tema de Romanos", row: 0, col: 0, direction: 'across' },
      { number: 2, word: "GALACO", hint: "Carta sobre a liberdade", row: 0, col: 0, direction: 'down' },
      { number: 3, word: "AMOR", hint: "O maior dom (1 Coríntios 13)", row: 3, col: 0, direction: 'across' },
      { number: 4, word: "ALEGRIA", hint: "Tema de Filipenses", row: 0, col: 4, direction: 'down' },
      { number: 5, word: "FE", hint: "Justificados pela...", row: 5, col: 0, direction: 'across' },
    ]
  },
  'Epístolas Gerais': {
    width: 12,
    height: 12,
    words: [
      { number: 1, word: "TIAGO", hint: "Fala sobre fé e obras", row: 0, col: 0, direction: 'across' },
      { number: 2, word: "PEDRO", hint: "Escreveu sobre o sofrimento", row: 0, col: 0, direction: 'down' },
      { number: 3, word: "OBRAS", hint: "Fé sem elas é morta", row: 3, col: 0, direction: 'across' },
      { number: 4, word: "JOAO", hint: "O apóstolo do amor", row: 0, col: 4, direction: 'down' },
      { number: 5, word: "JUDAS", hint: "Irmão de Tiago", row: 5, col: 0, direction: 'across' },
    ]
  },
  'Profecia': {
    width: 12,
    height: 12,
    words: [
      { number: 1, word: "ALFA", hint: "O princípio", row: 0, col: 0, direction: 'across' },
      { number: 2, word: "APOCALIPSE", hint: "Revelação final", row: 0, col: 0, direction: 'down' },
      { number: 3, word: "SELOS", hint: "Sete... foram abertos", row: 3, col: 0, direction: 'across' },
      { number: 4, word: "CORDEIRO", hint: "Título de Jesus no céu", row: 0, col: 4, direction: 'down' },
      { number: 5, word: "NOVA", hint: "... Jerusalém", row: 5, col: 0, direction: 'across' },
    ]
  },
};

interface CrosswordGameProps {
  onFinish: (score: number) => void;
  onClose: () => void;
}

export default function CrosswordGame({ onFinish, onClose }: CrosswordGameProps) {
  const { showToast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState<BibleDivision | null>(null);
  const [grid, setGrid] = useState<string[][]>([]);
  const [focusedCell, setFocusedCell] = useState<{ r: number; c: number } | null>(null);
  const [focusedDirection, setFocusedDirection] = useState<'across' | 'down'>('across');
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(100);
  const [shake, setShake] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [verificationResult, setVerificationResult] = useState<{ correct: number, wrong: number, missing: number } | null>(null);

  const crosswordData = selectedTheme ? THEMED_CROSSWORDS[selectedTheme] : null;

  useEffect(() => {
    const themes = Object.keys(THEMED_CROSSWORDS) as BibleDivision[];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    setSelectedTheme(randomTheme);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isGameOver && score > 10 && selectedTheme) {
      timer = setInterval(() => {
        setScore(prev => Math.max(10, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isGameOver, score, selectedTheme]);

  useEffect(() => {
    if (crosswordData) {
      const newGrid = Array.from({ length: crosswordData.height }, () => 
        Array.from({ length: crosswordData.width }, () => '')
      );
      setGrid(newGrid);
      setFocusedCell({ r: 0, c: 0 });
      setScore(100);
      setVerificationResult(null);
    }
  }, [selectedTheme, crosswordData]);

  const isCellInWord = (r: number, c: number) => {
    if (!crosswordData) return false;
    return crosswordData.words.some(w => {
      if (w.direction === 'across') {
        return r === w.row && c >= w.col && c < w.col + w.word.length;
      } else {
        return c === w.col && r >= w.row && r < w.row + w.word.length;
      }
    });
  };

  const getActiveWord = () => {
    if (!crosswordData || !focusedCell) return null;
    return crosswordData.words.find(w => {
      const isIn = w.direction === 'across' 
        ? focusedCell.r === w.row && focusedCell.c >= w.col && focusedCell.c < w.col + w.word.length
        : focusedCell.c === w.col && focusedCell.r >= w.row && focusedCell.r < w.row + w.word.length;
      return isIn && w.direction === focusedDirection;
    }) || crosswordData.words.find(w => {
      return w.direction === 'across' 
        ? focusedCell.r === w.row && focusedCell.c >= w.col && focusedCell.c < w.col + w.word.length
        : focusedCell.c === w.col && focusedCell.r >= w.row && focusedCell.r < w.row + w.word.length;
    });
  };

  const isCellInActiveWord = (r: number, c: number) => {
    const activeWord = getActiveWord();
    if (!activeWord) return false;
    if (activeWord.direction === 'across') {
      return r === activeWord.row && c >= activeWord.col && c < activeWord.col + activeWord.word.length;
    } else {
      return c === activeWord.col && r >= activeWord.row && r < activeWord.row + activeWord.word.length;
    }
  };

  const getCellNumber = (r: number, c: number) => {
    if (!crosswordData) return null;
    const word = crosswordData.words.find(w => w.row === r && w.col === c);
    return word ? word.number : null;
  };

  const handleCellClick = (r: number, c: number) => {
    if (focusedCell?.r === r && focusedCell?.c === c) {
      setFocusedDirection(prev => prev === 'across' ? 'down' : 'across');
    } else {
      setFocusedCell({ r, c });
      // Determine if this cell is part of multiple words to decide initial direction
      const words = crosswordData!.words.filter(w => {
        if (w.direction === 'across') return r === w.row && c >= w.col && c < w.col + w.word.length;
        return c === w.col && r >= w.row && r < w.row + w.word.length;
      });
      if (words.length > 0) {
        if (words.some(w => w.direction === focusedDirection)) {
          // Keep current direction if possible
        } else {
          setFocusedDirection(words[0].direction);
        }
      }
    }
  };

  const handleCellChange = (r: number, c: number, val: string) => {
    if (isGameOver) return;
    const newGrid = [...grid];
    newGrid[r][c] = val.toUpperCase().slice(-1);
    setGrid(newGrid);

    // Auto-advance
    if (val && crosswordData) {
      const activeWord = getActiveWord();
      if (activeWord) {
        if (activeWord.direction === 'across' && c < activeWord.col + activeWord.word.length - 1) {
          setFocusedCell({ r, c: c + 1 });
        } else if (activeWord.direction === 'down' && r < activeWord.row + activeWord.word.length - 1) {
          setFocusedCell({ r: r + 1, c });
        }
      }
    }
  };

  const handleKeyDown = (r: number, c: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !grid[r][c]) {
      if (c > 0) setFocusedCell({ r, c: c - 1 });
      else if (r > 0) setFocusedCell({ r: r - 1, c: crosswordData!.width - 1 });
    } else if (e.key === 'ArrowRight' && c < crosswordData!.width - 1) {
      setFocusedCell({ r, c: c + 1 });
    } else if (e.key === 'ArrowLeft' && c > 0) {
      setFocusedCell({ r, c: c - 1 });
    } else if (e.key === 'ArrowDown' && r < crosswordData!.height - 1) {
      setFocusedCell({ r: r + 1, c });
    } else if (e.key === 'ArrowUp' && r > 0) {
      setFocusedCell({ r: r - 1, c });
    }
  };

  const checkGrid = () => {
    if (!crosswordData || grid.length === 0) return;
    let correct = 0;
    let wrong = 0;
    let missing = 0;

    crosswordData.words.forEach(w => {
      let wordFilled = true;
      let wordCorrect = true;
      for (let i = 0; i < w.word.length; i++) {
        const r = w.direction === 'across' ? w.row : w.row + i;
        const c = w.direction === 'across' ? w.col + i : w.col;
        
        if (!grid[r] || grid[r][c] === undefined || grid[r][c] === '') {
          wordFilled = false;
          wordCorrect = false;
        } else if (grid[r][c] !== w.word[i]) {
          wordCorrect = false;
        }
      }
      if (wordCorrect) correct++;
      else if (!wordFilled) missing++;
      else wrong++;
    });

    setVerificationResult({ correct, wrong, missing });

    if (correct === crosswordData.words.length) {
      showToast('Incrível! Você completou o desafio!', 'success');
      setIsGameOver(true);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setScore(prev => Math.max(0, prev - 10));
      showToast(`Certas: ${correct}, Erradas: ${wrong}, Faltantes: ${missing}`, 'error');
    }
  };

  if (!selectedTheme) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <div className="fixed inset-0 z-50 bg-stone-50/90 dark:bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 shadow-2xl border border-stone-200 dark:border-zinc-800 text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="text-emerald-600 w-10 h-10" />
          </div>
          <h2 className="text-4xl font-black text-emerald-600 mb-2 uppercase tracking-tight">Parabéns!</h2>
          <p className="text-stone-500 dark:text-stone-400 mb-8 font-medium">Você completou o desafio de {selectedTheme}!</p>
          
          <div className="bg-stone-50 dark:bg-zinc-800/50 rounded-3xl p-6 mb-8 border border-stone-100 dark:border-zinc-700">
            <span className="text-sm text-stone-400 uppercase tracking-widest font-bold block mb-1">Pontuação Final</span>
            <span className="text-5xl font-black text-stone-800 dark:text-white">{score}</span>
          </div>

          <button
            onClick={() => onFinish(score)}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2 group"
          >
            Salvar e Voltar
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-stone-50 dark:bg-zinc-950">
      <div className="flex-1 p-4 md:p-8 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-stone-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <button onClick={() => { onFinish(0); onClose(); }} className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 font-bold uppercase tracking-widest text-xs">
              Sair (0 pts)
            </button>
            <div>
              <h2 className="text-xl font-black text-stone-800 dark:text-white uppercase tracking-tight">Palavras Cruzadas</h2>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">{selectedTheme}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-stone-100 dark:bg-zinc-800 p-1 rounded-lg border border-stone-200 dark:border-zinc-700">
              <button 
                onClick={() => setZoom(prev => Math.max(0.3, prev - 0.1))}
                className="p-1 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded transition-colors"
                title="Reduzir zoom"
              >
                <ZoomOut size={16} />
              </button>
              <button 
                onClick={() => setZoom(1)}
                className="px-2 py-1 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded text-[10px] font-black uppercase tracking-widest transition-colors"
                title="Resetar zoom"
              >
                Reset
              </button>
              <span className="text-[10px] font-bold w-12 text-center border-x border-stone-200 dark:border-zinc-700">{Math.round(zoom * 100)}%</span>
              <button 
                onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
                className="p-1 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded transition-colors"
                title="Aumentar zoom"
              >
                <ZoomIn size={16} />
              </button>
            </div>
            <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold">
              {score} pts
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 flex-1">
          {/* Grid Section */}
          <div className="flex-1 bg-white dark:bg-zinc-900 rounded-[2rem] p-6 shadow-xl border border-stone-200 dark:border-zinc-800 overflow-hidden flex flex-col">
            <div className="flex-1 relative border-2 border-stone-200 dark:border-zinc-700 rounded-2xl overflow-hidden bg-stone-50 dark:bg-zinc-900/50 cursor-grab active:cursor-grabbing">
              <div className="overflow-auto w-full h-full p-8 custom-scrollbar flex items-center justify-center touch-pan-x touch-pan-y">
                <div 
                  className={`grid gap-2 mx-auto ${shake ? 'animate-shake' : ''} transition-all duration-200`}
                  style={{ 
                    gridTemplateColumns: `repeat(${crosswordData?.width}, ${52 * zoom}px)`,
                    width: 'fit-content'
                  }}
                >
                  {grid.map((row, r) => row.map((cell, c) => {
                    const inWord = isCellInWord(r, c);
                    const number = getCellNumber(r, c);
                    const isFocused = focusedCell?.r === r && focusedCell?.c === c;
                    const isInActiveWord = isCellInActiveWord(r, c);

                    return (
                      <div 
                        key={`${r}-${c}`}
                        style={{ width: 52 * zoom, height: 52 * zoom }}
                        className={`relative flex items-center justify-center rounded-xl transition-all shadow-sm ${
                          inWord 
                            ? isFocused
                              ? 'bg-orange-500 text-white z-10 scale-105 shadow-lg'
                              : isInActiveWord
                                ? 'bg-orange-100 dark:bg-orange-950/30 cursor-pointer lg:hover:bg-orange-200 dark:lg:hover:bg-orange-900/40'
                                : 'bg-white dark:bg-zinc-900 cursor-pointer lg:hover:bg-stone-50 dark:lg:hover:bg-zinc-800'
                            : 'bg-stone-200 dark:bg-zinc-800/20 opacity-50'
                        }`}
                        onClick={() => inWord && handleCellClick(r, c)}
                      >
                        {number && (
                          <span 
                            className="absolute top-1.5 left-1.5 font-bold text-stone-400 leading-none"
                            style={{ fontSize: 11 * zoom }}
                          >
                            {number}
                          </span>
                        )}
                        {inWord && (
                          <input
                            id={`cell-${r}-${c}`}
                            type="text"
                            maxLength={1}
                            value={cell}
                            onChange={(e) => handleCellChange(r, c, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(r, c, e)}
                            onFocus={() => {
                              if (focusedCell?.r !== r || focusedCell?.c !== c) {
                                setFocusedCell({ r, c });
                              }
                            }}
                            style={{ fontSize: 22 * zoom }}
                            className={cn(
                              "w-full h-full text-center font-black bg-transparent outline-none uppercase",
                              isFocused ? "text-white" : "text-stone-800 dark:text-white"
                            )}
                            autoComplete="off"
                          />
                        )}
                      </div>
                    );
                  }))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={checkGrid}
                className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                Verificar Respostas
                <CheckCircle2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setGrid(Array.from({ length: crosswordData!.height }, () => Array.from({ length: crosswordData!.width }, () => '')));
                }}
                className="px-6 py-4 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 rounded-2xl font-bold hover:bg-stone-200 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
            {verificationResult && (
              <div className="mt-4 flex justify-center gap-4 text-sm font-bold">
                <span className="text-emerald-600">Certas: {verificationResult.correct}</span>
                <span className="text-red-500">Erradas: {verificationResult.wrong}</span>
                <span className="text-stone-500">Faltantes: {verificationResult.missing}</span>
              </div>
            )}
          </div>

          {/* Hints Section */}
          <div className="w-full lg:w-80 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 shadow-xl border border-stone-200 dark:border-zinc-800">
              <h3 className="text-lg font-black text-stone-800 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                <ChevronRight className="w-5 h-5 text-orange-500" />
                Horizontais
              </h3>
              <div className="space-y-4">
                {crosswordData?.words.filter(w => w.direction === 'across').map(w => (
                  <div key={w.number} className="text-sm">
                    <span className="font-black text-orange-600 mr-2">{w.number}.</span>
                    <span className="text-stone-600 dark:text-stone-300 font-medium">{w.hint}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 shadow-xl border border-stone-200 dark:border-zinc-800">
              <h3 className="text-lg font-black text-stone-800 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                <ChevronDown className="w-5 h-5 text-emerald-500" />
                Verticais
              </h3>
              <div className="space-y-4">
                {crosswordData?.words.filter(w => w.direction === 'down').map(w => (
                  <div key={w.number} className="text-sm">
                    <span className="font-black text-emerald-600 mr-2">{w.number}.</span>
                    <span className="text-stone-600 dark:text-stone-300 font-medium">{w.hint}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button 
                onClick={() => {
                  const themes = Object.keys(THEMED_CROSSWORDS) as BibleDivision[];
                  const randomTheme = themes[Math.floor(Math.random() * themes.length)];
                  setSelectedTheme(randomTheme);
                  setScore(0);
                }} 
                className="w-full py-3 text-orange-600 font-bold uppercase tracking-widest text-xs hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all bg-white dark:bg-zinc-900 shadow-sm border border-orange-100 dark:border-orange-900/30"
              >
                Mudar Tema (Zera Pontos)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
