import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RefreshCw, Zap, AlertCircle } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { Lesson } from '../data/lessons_static';
import { cn } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

interface Question {
  question: string;
  options: string[];
  correct: number;
}

interface RankingEntry {
  userId: string;
  name: string;
  totalScore: number;
}

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lesson = location.state?.lesson as Lesson | undefined;
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(50);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [view, setView] = useState<'rules' | 'active' | 'finished'>('rules');
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    if (!lesson) navigate('/lesson');
    fetchRanking();
  }, [lesson, navigate]);

  useEffect(() => {
    if (view === 'active' && timer > 0 && selectedAnswer === null && questions.length > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (view === 'active' && timer === 0 && selectedAnswer === null && questions.length > 0) {
      setScore(s => s - 10);
      const timeoutAnswer = -1;
      handleAnswer(timeoutAnswer); // Time out
    }
  }, [timer, view, selectedAnswer, questions]);

  const fetchRanking = async () => {
    try {
      const res = await fetch('/api/games/leaderboard');
      if (res.ok) {
        const rankingData = await res.json();
        setRanking(rankingData);
      }
    } catch (e) {
      console.error("Error fetching ranking", e);
    }
  }

  const saveScore = async (finalScore: number) => {
    if (!user) return;
    try {
      await fetch('/api/games/leaderboard', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: user.name || 'Usuário',
          totalScore: finalScore,
        })
      });
      fetchRanking();
    } catch (e) {
      console.error("Error saving score", e);
    }
  };

  const resetQuiz = () => {
    setScore(0);
    setCurrentQuestionIndex(0);
    setTimer(50);
    setSelectedAnswer(null);
    setQuestions([]);
    fetchRanking();
    setView('rules');
  };

  const startQuiz = async () => {
    setView('active');
    setLoading(true);
    try {
      const prompt = `Crie 5 perguntas de múltipla escolha com 4 opções (apenas uma certa) baseadas no seguinte conteúdo bíblico: 
      Título: ${lesson?.title}
      Conteúdo: ${lesson?.content}
      
      Retorne APENAS um JSON array no formato: [{"question": "string", "options": ["string", "string", "string", "string"], "correct": 0-3}]. Não coloque markdown ou explicações.`;
      
      const response = await geminiService.generateText(prompt);
      const cleanedResponse = response.replace(/```json|```/g, '').trim();
      let parsed = JSON.parse(cleanedResponse);
      if (!Array.isArray(parsed) && parsed.questions) {
        parsed = parsed.questions;
      }
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("Invalid format returned by AI");
      }
      setQuestions(parsed);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
      setView('rules');
      showToast("Erro ao gerar o quiz. O modelo de IA produziu um formato inválido. Tente novamente.", 'error');
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(optionIndex);
    const timeTaken = 50 - timer;
    
    let points = 0;
    if (optionIndex === questions[currentQuestionIndex].correct) {
      setFeedback('correct');
      if (timeTaken <= 8) points = 10;
      else if (timeTaken <= 16) points = 8;
      else if (timeTaken <= 24) points = 6;
      else if (timeTaken <= 32) points = 4;
      else if (timeTaken <= 40) points = 2;
      else if (timeTaken <= 50) points = 1;
    } else {
      setFeedback('wrong');
      points = -5;
    }
    
    const newScore = score + points;
    setScore(newScore);
    
    setTimeout(() => {
      setFeedback(null);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(i => i + 1);
        setTimer(50);
        setSelectedAnswer(null);
      } else {
        setView('finished');
        saveScore(newScore);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950 text-white flex flex-col p-6 overflow-y-auto">
      {view === 'rules' && (
        <div className="flex flex-col flex-1 justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-4">Quiz Célula: {lesson?.title}</h2>
            <div className="bg-zinc-800 p-6 rounded-2xl mb-6">
              <h3 className="font-bold mb-2">Regras:</h3>
              <ul className="list-disc pl-5 space-y-2 text-zinc-300">
                <li>5 perguntas sobre a lição atual.</li>
                <li>50 segundos por pergunta.</li>
                <li>Pontuação baseada na velocidade:
                  <ul className="pl-4 text-sm text-zinc-400">
                    <li>1-8s: 10 pts | 9-16s: 8 pts</li>
                    <li>17-24s: 6 pts | 25-32s: 4 pts</li>
                    <li>33-40s: 2 pts | 41-50s: 1 pt</li>
                  </ul>
                </li>
                <li>Erro: -5 pontos.</li>
                <li>Não responder em 50s: -10 pontos.</li>
              </ul>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            <button onClick={startQuiz} disabled={loading} className="w-full py-4 bg-emerald-600 rounded-full font-bold">
              {loading ? 'Preparando...' : 'Iniciar Quiz'}
            </button>
            <button onClick={() => navigate('/lesson')} className="w-full py-4 bg-zinc-800 rounded-full font-bold text-zinc-400 hover:bg-zinc-700">
              Fechar
            </button>
            <div className="bg-zinc-800 p-6 rounded-2xl">
              <h3 className="font-bold mb-4">Placar do Conhecimento:</h3>
              <div className="space-y-2">
                {ranking.map((entry, index) => (
                    <div key={entry.userId} className="flex justify-between items-center bg-zinc-700/50 p-2 rounded">
                        <span>{index + 1}. {entry.name}</span>
                        <span className="font-bold text-emerald-400">{entry.totalScore} pts</span>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {view === 'active' && loading ? (
        <div className="flex items-center justify-center flex-1">Carregando...</div>
      ) : view === 'active' && questions.length > 0 ? (
        <div className="flex flex-col flex-1 justify-center">
          <div className="flex justify-between items-center mb-8">
            <span className="text-xl font-bold">Pergunta {currentQuestionIndex + 1}/{questions.length}</span>
            <div className={cn("text-3xl font-black", timer <= 5 ? "text-red-500 animate-pulse" : "text-emerald-500")}>
              {timer}s
            </div>
          </div>
          
          <h3 className="text-2xl mb-8">{questions[currentQuestionIndex].question}</h3>
          
          <div className="grid grid-cols-1 gap-4">
            {questions[currentQuestionIndex].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={cn(
                  "p-4 text-left rounded-xl transition-all",
                  selectedAnswer === null ? "bg-zinc-800 hover:bg-zinc-700" :
                  index === questions[currentQuestionIndex].correct ? "bg-emerald-600" :
                  index === selectedAnswer ? "bg-red-600" : "bg-zinc-800 opacity-50"
                )}
              >
                {option}
                {selectedAnswer !== null && index === questions[currentQuestionIndex].correct && <span className="float-right">✅</span>}
                {selectedAnswer === index && index !== questions[currentQuestionIndex].correct && <span className="float-right">❌</span>}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      
      {view === 'finished' && (
        <div className="flex flex-col items-center justify-center flex-1">
          <Trophy size={64} className="text-yellow-500 mb-4" />
          <h2 className="text-3xl font-bold mb-2">Quiz Finalizado!</h2>
          <p className="text-2xl mb-8">Sua pontuação final: {score}</p>
          {score > 40 && (
            <div className="bg-yellow-500/20 p-4 rounded-xl text-center mb-8 border border-yellow-500 text-yellow-200">
              <h3 className="text-xl font-bold">UAU! Incrível!</h3>
              <p>Você demonstrou um conhecimento fenomenal desta lição! Parabéns!</p>
            </div>
          )}
          <div className="bg-zinc-800 p-4 rounded-xl w-full mb-8">
            <h4 className="font-bold mb-2">Ranking Atualizado</h4>
            <div className="flex justify-between items-center bg-zinc-700 p-3 rounded-lg">
              <span>{user?.name || 'Você'}</span>
              <span className="font-bold text-emerald-400">{score} pts</span>
            </div>
          </div>
          <button onClick={resetQuiz} className="px-6 py-3 bg-emerald-600 rounded-full font-bold">Voltar</button>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
