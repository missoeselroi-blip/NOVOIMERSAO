import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Timer, CheckCircle2, XCircle, ChevronRight, RotateCcw, Medal } from 'lucide-react';
import { cn } from '../types';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  reference: string;
  difficulty: string;
}

interface GeneratedQuizPlayerProps {
  questions: QuizQuestion[];
  onClose?: () => void;
}

export default function GeneratedQuizPlayer({ questions, onClose }: GeneratedQuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(true);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && !isAnswered && !quizFinished) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, isAnswered, quizFinished]);

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(index);
    setIsAnswered(true);
    setTimerActive(false);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = index === currentQuestion.correctAnswerIndex;

    if (isCorrect) {
      let points = 0;
      if (timeElapsed <= 5) points = 10;
      else if (timeElapsed <= 10) points = 8;
      else if (timeElapsed <= 15) points = 6;
      else if (timeElapsed <= 20) points = 4;
      else if (timeElapsed <= 25) points = 2;
      else points = 1;

      setScore((prev) => prev + points);
    }

    setTimeout(() => {
      setShowResult(true);
    }, 1000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowResult(false);
      setTimeElapsed(0);
      setTimerActive(true);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowResult(false);
    setTimeElapsed(0);
    setTimerActive(true);
    setQuizFinished(false);
  };

  if (questions.length === 0) {
    return <div className="p-4 text-center text-stone-500">Nenhuma pergunta encontrada.</div>;
  }

  if (quizFinished) {
    return (
      <div className="fixed inset-0 z-50 bg-stone-100 dark:bg-zinc-950 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl text-center max-w-2xl w-full mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Trophy className="w-12 h-12 text-amber-500" />
          </motion.div>
          <h2 className="text-3xl font-display font-bold text-stone-800 dark:text-stone-100 mb-4">
            Quiz Concluído!
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mb-8 text-lg">
            Você marcou <span className="font-bold text-emerald-600 text-2xl">{score}</span> pontos.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={restartQuiz}
              className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 flex items-center gap-2 transition-all"
            >
              <RotateCcw size={20} />
              Jogar Novamente
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-6 py-3 bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 font-bold rounded-2xl hover:bg-stone-300 dark:hover:bg-zinc-700 transition-all"
              >
                Fechar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="fixed inset-0 z-50 bg-stone-100 dark:bg-zinc-950 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 shadow-xl max-w-3xl w-full mx-auto relative overflow-hidden">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        )}
        <div className="flex items-center justify-between mb-8 mt-4 md:mt-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
            <Medal className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-stone-400 uppercase tracking-wider">
              Pergunta {currentQuestionIndex + 1} de {questions.length}
            </p>
            <p className="text-sm text-emerald-600 font-medium">Nível: {currentQuestion.difficulty}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
            <Timer className="w-5 h-5" />
            <span className="font-mono font-bold text-lg">{timeElapsed}s</span>
          </div>
          <div className="flex items-center gap-2 text-amber-600">
            <Trophy className="w-5 h-5" />
            <span className="font-bold text-lg">{score} pts</span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-display font-bold text-stone-800 dark:text-stone-100 leading-tight">
          {currentQuestion.question}
        </h3>
      </div>

      <div className="space-y-3">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = index === currentQuestion.correctAnswerIndex;
          
          let buttonClass = "w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between ";
          
          if (!isAnswered) {
            buttonClass += "border-stone-200 dark:border-zinc-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-stone-700 dark:text-stone-300";
          } else {
            if (isCorrect) {
              buttonClass += "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300";
            } else if (isSelected) {
              buttonClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
            } else {
              buttonClass += "border-stone-200 dark:border-zinc-800 opacity-50 text-stone-700 dark:text-stone-300";
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={isAnswered}
              className={buttonClass}
            >
              <span className="font-medium text-lg">{option}</span>
              {isAnswered && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
              {isAnswered && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-stone-200 dark:border-zinc-700"
          >
            <p className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-2">Referência Bíblica</p>
            <p className="text-stone-700 dark:text-stone-300 font-medium mb-6">{currentQuestion.reference}</p>
            
            <button
              onClick={nextQuestion}
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
            >
              Próxima Pergunta
              <ChevronRight size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
