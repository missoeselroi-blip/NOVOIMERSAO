import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useToast } from '../../components/Toast';

const WHO_AM_I_DATA = [
  {
    answer: "Davi",
    hints: [
      "Fui um pastor de ovelhas na minha juventude.",
      "Derrotei um gigante com uma funda e uma pedra.",
      "Toquei harpa para acalmar um rei atormentado.",
      "Fui o segundo rei de Israel.",
      "Escrevi muitos dos Salmos."
    ]
  },
  {
    answer: "Moisés",
    hints: [
      "Fui colocado em um cesto no rio Nilo quando bebê.",
      "Fui criado pela filha do Faraó.",
      "Vi uma sarça ardente que não se consumia.",
      "Liderei o povo de Israel para fora do Egito.",
      "Recebi os Dez Mandamentos no Monte Sinai."
    ]
  },
  {
    answer: "Pedro",
    hints: [
      "Meu nome original era Simão.",
      "Eu era um pescador antes de seguir Jesus.",
      "Andei sobre as águas por um breve momento.",
      "Neguei Jesus três vezes antes do galo cantar.",
      "Preguei no dia de Pentecostes."
    ]
  },
  {
    answer: "Paulo",
    hints: [
      "Meu nome original era Saulo.",
      "Fui um fariseu e persegui os cristãos.",
      "Tive um encontro com Jesus na estrada para Damasco.",
      "Fiquei cego por três dias.",
      "Escrevi grande parte do Novo Testamento."
    ]
  },
  {
    answer: "Arca da Aliança",
    hints: [
      "Sou um objeto sagrado feito de madeira de acácia e coberto de ouro.",
      "Fui construída no deserto sob as ordens de Moisés.",
      "Contenho as tábuas da lei, um pouco de maná e a vara de Arão.",
      "Fui capturada pelos filisteus, mas causei-lhes muitos problemas.",
      "Fui colocada no Santo dos Santos no templo de Salomão."
    ]
  }
];

interface WhoAmIGameProps {
  onFinish: (score: number) => void;
  onClose: () => void;
}

export default function WhoAmIGame({ onFinish, onClose }: WhoAmIGameProps) {
  const { showToast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedHints, setRevealedHints] = useState(1);
  const [guess, setGuess] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  const currentItem = WHO_AM_I_DATA[currentIndex];

  const handleRevealHint = () => {
    if (revealedHints < currentItem.hints.length) {
      setRevealedHints(prev => prev + 1);
    }
  };

  const handleGuess = () => {
    if (!guess.trim()) return;

    const isCorrect = guess.toLowerCase().trim() === currentItem.answer.toLowerCase().trim();
    
    if (isCorrect) {
      // Points based on hints revealed: 5 hints max. 
      // 1 hint = 50 pts, 2 hints = 40 pts, 3 hints = 30 pts, 4 hints = 20 pts, 5 hints = 10 pts
      const points = (6 - revealedHints) * 10;
      setTotalScore(prev => prev + points);
      showToast(`Correto! Você ganhou ${points} pontos.`, 'success');
      
      if (currentIndex < WHO_AM_I_DATA.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setRevealedHints(1);
        setGuess('');
      } else {
        setIsGameOver(true);
      }
    } else {
      showToast('Incorreto! Tente novamente ou revele mais uma dica.', 'error');
      setGuess('');
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
          <HelpCircle className="text-blue-500" /> Quem Sou Eu?
        </h2>
        <span className="font-bold text-stone-500">Pontos: {totalScore}</span>
      </div>

      <div className="mb-8">
        <h3 className="font-bold text-stone-700 dark:text-stone-300 mb-4">Dicas Reveladas:</h3>
        <div className="space-y-3">
          {currentItem.hints.slice(0, revealedHints).map((hint, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-xl border border-blue-100 dark:border-blue-800"
            >
              {idx + 1}. {hint}
            </motion.div>
          ))}
        </div>
        
        {revealedHints < currentItem.hints.length && (
          <button
            onClick={handleRevealHint}
            className="mt-4 text-blue-600 dark:text-blue-400 font-bold hover:underline text-sm"
          >
            + Revelar próxima dica (diminui a pontuação)
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
          placeholder="Digite seu palpite..."
          className="flex-1 p-4 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          onClick={handleGuess}
          className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center gap-2"
        >
          Responder <ArrowRight size={20} />
        </button>
      </div>
      
      <div className="mt-6 text-center">
        <button onClick={onClose} className="text-stone-500 hover:text-stone-700 text-sm">
          Sair do Jogo
        </button>
      </div>
    </div>
  );
}
