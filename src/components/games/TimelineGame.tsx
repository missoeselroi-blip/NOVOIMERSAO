import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowUp, ArrowDown, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../components/Toast';

const TIMELINE_LEVELS = [
  {
    id: 1,
    events: [
      { id: 'a', text: 'Criação do Mundo', order: 1 },
      { id: 'b', text: 'O Dilúvio', order: 2 },
      { id: 'c', text: 'Chamado de Abraão', order: 3 },
      { id: 'd', text: 'As Dez Pragas do Egito', order: 4 }
    ]
  },
  {
    id: 2,
    events: [
      { id: 'a', text: 'Nascimento de Jesus', order: 1 },
      { id: 'b', text: 'Batismo de Jesus', order: 2 },
      { id: 'c', text: 'Crucificação', order: 3 },
      { id: 'd', text: 'Dia de Pentecostes', order: 4 }
    ]
  },
  {
    id: 3,
    events: [
      { id: 'a', text: 'Reinado de Davi', order: 1 },
      { id: 'b', text: 'Construção do Templo por Salomão', order: 2 },
      { id: 'c', text: 'Exílio na Babilônia', order: 3 },
      { id: 'd', text: 'Reconstrução dos Muros por Neemias', order: 4 }
    ]
  }
];

interface TimelineGameProps {
  onFinish: (score: number) => void;
  onClose: () => void;
}

export default function TimelineGame({ onFinish, onClose }: TimelineGameProps) {
  const { showToast } = useToast();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    loadLevel(currentLevel);
  }, [currentLevel]);

  const loadLevel = (levelIndex: number) => {
    if (levelIndex >= TIMELINE_LEVELS.length) {
      setIsGameOver(true);
      return;
    }
    // Shuffle items
    const shuffled = [...TIMELINE_LEVELS[levelIndex].events].sort(() => Math.random() - 0.5);
    setItems(shuffled);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    if (direction === 'up' && index > 0) {
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    } else if (direction === 'down' && index < newItems.length - 1) {
      [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
    }
    setItems(newItems);
  };

  const checkOrder = () => {
    const isCorrect = items.every((item, index) => item.order === index + 1);
    if (isCorrect) {
      setTotalScore(prev => prev + 50);
      showToast('Ordem correta! +50 pontos', 'success');
      setTimeout(() => {
        setCurrentLevel(prev => prev + 1);
      }, 1500);
    } else {
      showToast('A ordem ainda não está correta. Tente novamente!', 'error');
    }
  };

  if (isGameOver) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-stone-200 dark:border-zinc-800 text-center">
        <h2 className="text-3xl font-bold text-emerald-600 mb-4">Fim de Jogo!</h2>
        <p className="text-xl mb-6">Sua pontuação final: {totalScore}</p>
        <button
          onClick={() => onFinish(totalScore)}
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
          <Clock className="text-purple-500" /> Linha do Tempo
        </h2>
        <span className="font-bold text-stone-500">Nível {currentLevel + 1}/{TIMELINE_LEVELS.length}</span>
      </div>

      <p className="text-stone-600 dark:text-stone-400 mb-6">
        Ordene os eventos do mais antigo (topo) para o mais recente (baixo).
      </p>

      <div className="space-y-3 mb-8">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            layout
            className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
          >
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => moveItem(index, 'up')}
                disabled={index === 0}
                className="p-1 text-stone-400 hover:text-purple-500 disabled:opacity-30"
              >
                <ArrowUp size={20} />
              </button>
              <button 
                onClick={() => moveItem(index, 'down')}
                disabled={index === items.length - 1}
                className="p-1 text-stone-400 hover:text-purple-500 disabled:opacity-30"
              >
                <ArrowDown size={20} />
              </button>
            </div>
            <span className="font-medium text-lg flex-1">{item.text}</span>
          </motion.div>
        ))}
      </div>

      <button
        onClick={checkOrder}
        className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
      >
        <CheckCircle2 size={24} /> Verificar Ordem
      </button>

      <div className="mt-6 text-center">
        <button onClick={onClose} className="text-stone-500 hover:text-stone-700 text-sm">
          Sair do Jogo
        </button>
      </div>
    </div>
  );
}
