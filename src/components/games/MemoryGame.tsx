import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, RefreshCw, Trophy, Clock, Star, HelpCircle } from 'lucide-react';
import { useToast } from '../Toast';
import { cn } from '../../types';

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
  pairId: number;
}

const MEMORY_ITEMS = [
  { value: "🍎", label: "Fruto Proibido" },
  { value: "🚢", label: "Arca de Noé" },
  { value: "🌈", label: "Arco-Íris" },
  { value: "🪵", label: "Altar" },
  { value: "🐑", label: "Cordeiro" },
  { value: "🧔", label: "Abraão" },
  { value: "🌊", label: "Mar Vermelho" },
  { value: "📜", label: "Mandamentos" },
  { value: "🏺", label: "Maná" },
  { value: "🦁", label: "Daniel" },
  { value: "🎺", label: "Jericó" },
  { value: "🐟", label: "Jonas" },
];

interface MemoryGameProps {
  onFinish: (score: number) => void;
}

export default function MemoryGame({ onFinish }: MemoryGameProps) {
  const { showToast } = useToast();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      finishGame();
    }
    return () => clearInterval(timer);
  }, [timerActive, timeLeft]);

  const initializeGame = () => {
    const pairItems = MEMORY_ITEMS.slice(0, 8); // Use 8 pairs for 16 cards
    const initialCards: Card[] = [];
    
    pairItems.forEach((item, index) => {
      // Add two of each
      initialCards.push({
        id: index * 2,
        value: item.value,
        isFlipped: false,
        isMatched: false,
        pairId: index
      });
      initialCards.push({
        id: index * 2 + 1,
        value: item.value,
        isFlipped: false,
        isMatched: false,
        pairId: index
      });
    });

    // Shuffle
    const shuffledCards = initialCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setMoves(0);
    setMatches(0);
    setFlippedCards([]);
    setIsGameFinished(false);
    setTimeLeft(60);
    setTimerActive(true);
  };

  const handleCardClick = (index: number) => {
    if (!timerActive || isGameFinished || flippedCards.length === 2 || cards[index].isFlipped || cards[index].isMatched) {
      return;
    }

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [firstIndex, secondIndex] = newFlipped;
      
      if (cards[firstIndex].pairId === cards[secondIndex].pairId) {
        // Match!
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstIndex].isMatched = true;
          matchedCards[secondIndex].isMatched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          setMatches(prev => prev + 1);
          
          if (matches + 1 === cards.length / 2) {
            finishGame();
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const unFlippedCards = [...cards];
          unFlippedCards[firstIndex].isFlipped = false;
          unFlippedCards[secondIndex].isFlipped = false;
          setCards(unFlippedCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const finishGame = () => {
    setTimerActive(false);
    setIsGameFinished(true);
    
    // Calculate score
    const timeBonus = Math.floor(timeLeft * 2);
    const movePenalty = Math.max(0, moves - 12) * 5;
    const finalScore = Math.max(10, Math.min(100, (matches * 10) + timeBonus - movePenalty));
    
    onFinish(finalScore);
    showToast(`Jogo finalizado! Pontuação: ${finalScore}`, "success");
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2">
          <Clock className="text-orange-500" size={20} />
          <span className={cn(
            "font-mono font-bold text-xl",
            timeLeft < 10 ? "text-red-500 animate-pulse" : "text-stone-700 dark:text-zinc-300"
          )}>
            {timeLeft}s
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Jogadas</p>
            <p className="font-bold text-stone-700 dark:text-zinc-300">{moves}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Pares</p>
            <p className="font-bold text-emerald-600">{matches}/{cards.length / 2}</p>
          </div>
        </div>
        <button 
          onClick={initializeGame}
          className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-stone-500"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            layout
            onClick={() => handleCardClick(index)}
            className={cn(
              "aspect-square rounded-xl cursor-pointer perspective-1000",
              "transition-all duration-300 transform-style-3d relative",
              (card.isFlipped || card.isMatched) ? "rotate-y-180" : ""
            )}
          >
            {/* Front of Card (Visible when flipped) */}
            <div className={cn(
              "absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-zinc-900 border-2 rounded-xl flex items-center justify-center text-3xl shadow-sm",
              card.isMatched ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10" : "border-stone-200 dark:border-zinc-800"
            )}>
              {card.value}
            </div>

            {/* Back of Card (Hidden when flipped) */}
            <div className={cn(
              "absolute inset-0 backface-hidden bg-stone-100 dark:bg-zinc-800 border-2 border-stone-200 dark:border-zinc-700 rounded-xl flex items-center justify-center shadow-sm hover:border-orange-300 transition-colors",
              !timerActive && !isGameFinished && "opacity-50 grayscale"
            )}>
              <HelpCircle className="text-stone-400" size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isGameFinished && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 p-6 rounded-3xl text-center space-y-4"
          >
            <Trophy className="mx-auto text-yellow-500" size={48} />
            <div>
              <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-400">Excelente Trabalho!</h3>
              <p className="text-stone-600 dark:text-zinc-400">Você provou ter uma memória abençoada.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl">
                <p className="text-xs text-stone-400 font-bold uppercase">Pontuação</p>
                <p className="text-2xl font-black text-emerald-600">
                  {Math.max(10, Math.min(100, (matches * 10) + Math.floor(timeLeft * 2) - Math.max(0, moves - 12) * 5))}
                </p>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl">
                <p className="text-xs text-stone-400 font-bold uppercase">Tempo Restante</p>
                <p className="text-2xl font-black text-orange-500">{timeLeft}s</p>
              </div>
            </div>
            <button
              onClick={initializeGame}
              className="w-full bg-emerald-600 text-white py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
            >
              Jogar Novamente
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!timerActive && !isGameFinished && cards.length > 0 && (
        <div className="text-center p-8">
          <button
            onClick={() => setTimerActive(true)}
            className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
          >
            Começar Desafio
          </button>
        </div>
      )}
    </div>
  );
}
