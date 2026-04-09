import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, Clock, Lightbulb } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const WHO_AM_I_DATA = [
  {
    answer: "Davi",
    category: "Personagem",
    options: ["Davi", "Saul", "Salomão"],
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
    category: "Personagem",
    options: ["Moisés", "Arão", "Josué"],
    hints: [
      "Fui colocado em um cesto no rio Nilo quando bebê.",
      "Fui criado pela filha do Faraó.",
      "Vi uma sarça ardente que não se consumia.",
      "Liderei o povo de Israel para fora do Egito.",
      "Recebi os Dez Mandamentos no Monte Sinai."
    ]
  },
  {
    answer: "Gênesis",
    category: "Livro",
    options: ["Gênesis", "Êxodo", "Levítico"],
    hints: [
      "Sou o primeiro livro da Bíblia.",
      "Relato a criação do mundo em seis dias.",
      "Conto a história de Adão e Eva no Jardim do Éden.",
      "Narrei a história da Arca de Noé.",
      "Termino com a morte de José no Egito."
    ]
  },
  {
    answer: "Jerusalém",
    category: "Cidade",
    options: ["Jerusalém", "Belém", "Jericó"],
    hints: [
      "Sou conhecida como a Cidade Santa.",
      "Davi me conquistou e me tornou sua capital.",
      "O Templo de Salomão foi construído em mim.",
      "Jesus entrou em mim montado em um jumentinho.",
      "Fui destruída e reconstruída várias vezes na história."
    ]
  },
  {
    answer: "Dilúvio",
    category: "Evento",
    options: ["Dilúvio", "Êxodo", "Cativeiro"],
    hints: [
      "Choveu por quarenta dias e quarenta noites.",
      "Apenas oito pessoas sobreviveram em uma grande embarcação.",
      "Deus enviou um arco-íris como sinal de sua aliança.",
      "As águas cobriram até as montanhas mais altas.",
      "Aconteceu por causa da grande maldade da humanidade."
    ]
  },
  {
    answer: "Egito",
    category: "Nação",
    options: ["Egito", "Babilônia", "Assíria"],
    hints: [
      "Fui governada por Faraós.",
      "O povo de Israel foi escravizado em minhas terras por 400 anos.",
      "Deus enviou dez pragas sobre mim.",
      "José se tornou governador em minhas terras.",
      "O Mar Vermelho me separa da Península do Sinai."
    ]
  },
  {
    answer: "Apocalipse",
    category: "Livro",
    options: ["Apocalipse", "Daniel", "Ezequiel"],
    hints: [
      "Sou o último livro da Bíblia.",
      "Fui escrito pelo apóstolo João na ilha de Patmos.",
      "Contenho muitas visões simbólicas e profecias.",
      "Falo sobre as sete igrejas da Ásia.",
      "Descrevo a Nova Jerusalém descendo do céu."
    ]
  },
  {
    answer: "Belém",
    category: "Cidade",
    options: ["Belém", "Nazaré", "Cafarnaum"],
    hints: [
      "Sou a cidade onde Jesus nasceu.",
      "Também sou conhecida como a Cidade de Davi.",
      "Miquéias profetizou que de mim sairia o Guia de Israel.",
      "Rute e Boaz viveram em mim.",
      "Fico localizada na região da Judéia."
    ]
  },
  {
    answer: "Êxodo",
    category: "Evento",
    options: ["Êxodo", "Páscoa", "Pentecostes"],
    hints: [
      "Marco a saída triunfal de Israel do Egito.",
      "As águas do Mar Vermelho se abriram para o povo passar.",
      "Fomos guiados por uma coluna de nuvem e fogo.",
      "Moisés foi o líder escolhido por Deus para este evento.",
      "A primeira Páscoa foi celebrada na noite anterior."
    ]
  },
  {
    answer: "Babilônia",
    category: "Nação",
    options: ["Babilônia", "Pérsia", "Grécia"],
    hints: [
      "Meu rei Nabucodonosor destruiu Jerusalém.",
      "Levei o povo de Judá para o exílio por 70 anos.",
      "Daniel foi um dos jovens levados cativos para mim.",
      "Fui famosa por meus jardins suspensos.",
      "Deus confundiu as línguas na torre que levava meu nome."
    ]
  },
  {
    answer: "Ester",
    category: "Personagem",
    options: ["Ester", "Rute", "Débora"],
    hints: [
      "Fui uma rainha judia na Pérsia.",
      "Meu nome hebraico era Hadassa.",
      "Arrisquei minha vida para salvar meu povo de um decreto de morte.",
      "Fui criada por meu primo Mardoqueu.",
      "Há um livro na Bíblia com o meu nome."
    ]
  },
  {
    answer: "Jericó",
    category: "Cidade",
    options: ["Jericó", "Samaria", "Damasco"],
    hints: [
      "Minhas muralhas caíram após o povo marchar ao meu redor.",
      "Raabe me ajudou escondendo os espiões de Israel.",
      "Fui a primeira cidade conquistada por Josué em Canaã.",
      "Jesus curou o cego Bartimeu perto de mim.",
      "Zaqueu, o cobrador de impostos, vivia em mim."
    ]
  },
  {
    answer: "Salmos",
    category: "Livro",
    options: ["Salmos", "Provérbios", "Eclesiastes"],
    hints: [
      "Sou o livro mais longo da Bíblia.",
      "Sou uma coleção de hinos, orações e poemas.",
      "Davi é o autor da maioria dos meus capítulos.",
      "Meu capítulo 119 é o mais longo de todos.",
      "Falo muito sobre louvor, adoração e lamento."
    ]
  },
  {
    answer: "Nascimento de Jesus",
    category: "Evento",
    options: ["Nascimento de Jesus", "Batismo de Jesus", "Transfiguração"],
    hints: [
      "Aconteceu em uma estrebaria pois não havia lugar na estalagem.",
      "Anjos anunciaram este evento aos pastores no campo.",
      "Uma estrela guiou os magos do Oriente até o local.",
      "Maria e José foram os pais terrenos envolvidos.",
      "O rei Herodes tentou impedir este evento matando as crianças."
    ]
  },
  {
    answer: "Roma",
    category: "Nação",
    options: ["Roma", "Grécia", "Macedônia"],
    hints: [
      "Eu dominava o mundo na época de Jesus.",
      "Meus soldados crucificaram o Senhor.",
      "Paulo desejava muito me visitar e pregar em mim.",
      "Fui o império que perseguiu os primeiros cristãos.",
      "O apóstolo Pedro também esteve em minhas terras."
    ]
  },
  {
    answer: "Noé",
    category: "Personagem",
    options: ["Noé", "Ló", "Enoque"],
    hints: [
      "Deus me mandou construir uma arca gigante.",
      "Fui salvo do Dilúvio com minha família.",
      "Levei um casal de cada espécie de animal para a arca.",
      "O arco-íris foi o sinal da aliança de Deus comigo.",
      "Sou considerado o segundo pai da humanidade."
    ]
  },
  {
    answer: "Provérbios",
    category: "Livro",
    options: ["Provérbios", "Eclesiastes", "Cânticos"],
    hints: [
      "Sou um livro de sabedoria prática.",
      "Salomão é o meu principal autor.",
      "Minha frase mais famosa é: 'O temor do Senhor é o princípio da sabedoria'.",
      "Falo muito sobre o contraste entre o sábio e o tolo.",
      "Contenho o famoso poema sobre a mulher virtuosa no capítulo 31."
    ]
  },
  {
    answer: "Nazaré",
    category: "Cidade",
    options: ["Nazaré", "Caná", "Tiro"],
    hints: [
      "Fui a cidade onde Jesus cresceu.",
      "As pessoas perguntavam: 'Pode vir alguma coisa boa de mim?'.",
      "Jesus foi chamado pelo meu nome como um título.",
      "Fico localizada na região da Galiléia.",
      "O anjo Gabriel apareceu a Maria em minhas terras."
    ]
  },
  {
    answer: "Ressurreição de Jesus",
    category: "Evento",
    options: ["Ressurreição de Jesus", "Ascensão", "Transfiguração"],
    hints: [
      "Aconteceu no terceiro dia após a crucificação.",
      "A pedra do túmulo foi removida por um anjo.",
      "Maria Madalena foi a primeira a ver o Senhor vivo.",
      "É o evento central da fé cristã.",
      "Jesus apareceu aos seus discípulos por quarenta dias depois disso."
    ]
  },
  {
    answer: "Assíria",
    category: "Nação",
    options: ["Assíria", "Moabe", "Edom"],
    hints: [
      "Minha capital era a grande cidade de Nínive.",
      "O profeta Jonas foi enviado para pregar em mim.",
      "Fui um império cruel que conquistou o Reino do Norte (Israel).",
      "Deus usou o profeta Naum para anunciar minha destruição.",
      "Fui famosa por meu exército poderoso e táticas de guerra."
    ]
  }
];

interface WhoAmIGameProps {
  onFinish: (score: number) => void;
  onClose: () => void;
}

export default function WhoAmIGame({ onFinish, onClose }: WhoAmIGameProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedHints, setRevealedHints] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(100);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isGameOver && score > 10 && !selectedOption) {
      timer = setInterval(() => {
        setScore(prev => Math.max(10, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isGameOver, score, selectedOption]);

  const currentItem = WHO_AM_I_DATA[currentIndex];

  const handleRevealHint = async () => {
    if (revealedHints >= currentItem.hints.length) return;

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
          setRevealedHints(prev => prev + 1);
          setScore(prev => Math.max(10, prev - 5));
          showToast('Dica usada! -5 créditos e -5 pontos.', 'success');
        } else {
          showToast('Créditos insuficientes! Você precisa de 5 créditos.', 'error');
        }
      } else {
        await setDoc(userRef, {
          name: user.name || 'Usuário',
          credits: 45,
          updatedAt: serverTimestamp()
        }, { merge: true });
        setRevealedHints(prev => prev + 1);
        setScore(prev => Math.max(10, prev - 5));
        showToast('Dica usada! -5 créditos e -5 pontos.', 'success');
      }
    } catch (error) {
      console.error("Erro ao usar dica:", error);
      showToast('Erro ao usar dica.', 'error');
    }
  };

  const handleOptionSelect = (option: string) => {
    if (selectedOption) return;

    setSelectedOption(option);
    const correct = option === currentItem.answer;
    setIsCorrect(correct);
    
    if (correct) {
      showToast(`Correto!`, 'success');
      setTimeout(() => {
        if (currentIndex < WHO_AM_I_DATA.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setRevealedHints(1);
          setSelectedOption(null);
          setIsCorrect(null);
        } else {
          setIsGameOver(true);
        }
      }, 1500);
    } else {
      setScore(prev => Math.max(0, prev - 10));
      showToast('Incorreto! -10 pontos. Tente outra vez.', 'error');
      setTimeout(() => {
        setSelectedOption(null);
        setIsCorrect(null);
      }, 1500);
    }
  };

  if (isGameOver) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-stone-200 dark:border-zinc-800 text-center">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-4">Parabéns!</h2>
        <p className="text-stone-600 dark:text-zinc-400 text-lg mb-8">
          Você completou o desafio "Quem Sou Eu?".
        </p>
        <div className="bg-stone-50 dark:bg-zinc-800/50 rounded-2xl p-6 mb-8">
          <p className="text-sm text-stone-500 dark:text-zinc-500 uppercase tracking-widest font-bold mb-2">Pontuação Final</p>
          <p className="text-5xl font-black text-emerald-600">{score}</p>
        </div>
        <button
          onClick={() => onFinish(score)}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20"
        >
          Salvar e Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-stone-200 dark:border-zinc-800">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-stone-900 dark:text-white">
            <HelpCircle className="text-blue-500" /> Quem Sou Eu?
          </h2>
          <p className="text-sm text-stone-500 dark:text-zinc-400 font-medium">
            {currentItem.category}: {currentIndex + 1} de {WHO_AM_I_DATA.length}
          </p>
        </div>
        <div className="text-lg font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-100 dark:border-blue-800/30">
          <Clock size={20} /> {score} pts
        </div>
      </div>

      <div className="mb-8 space-y-4">
        <div className="space-y-3">
          {currentItem.hints.slice(0, revealedHints).map((hint, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-stone-50 dark:bg-zinc-800/50 text-stone-700 dark:text-zinc-300 rounded-2xl border border-stone-100 dark:border-zinc-700/50 relative overflow-hidden group"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
              <span className="font-bold text-blue-500 mr-2">{idx + 1}.</span>
              {hint}
            </motion.div>
          ))}
        </div>
        
        {revealedHints < currentItem.hints.length && (
          <button
            onClick={handleRevealHint}
            className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-50 dark:hover:bg-amber-900/20 px-4 py-2 rounded-xl transition-colors text-sm"
          >
            <Lightbulb size={16} />
            Revelar próxima dica (-5 créditos)
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {currentItem.options.map((option, idx) => {
          const isSelected = selectedOption === option;
          const isCorrectOption = option === currentItem.answer;
          
          let buttonClass = "p-5 rounded-2xl font-bold text-lg transition-all border-2 flex items-center justify-between group ";
          
          if (isSelected) {
            if (isCorrect) {
              buttonClass += "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400";
            } else {
              buttonClass += "bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-400";
            }
          } else {
            buttonClass += "bg-white dark:bg-zinc-900 border-stone-100 dark:border-zinc-800 text-stone-700 dark:text-zinc-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10";
          }

          return (
            <button
              key={idx}
              disabled={!!selectedOption}
              onClick={() => handleOptionSelect(option)}
              className={buttonClass}
            >
              <span>{option}</span>
              {isSelected && (
                isCorrect ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-red-500" />
              )}
              {!selectedOption && (
                <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
              )}
            </button>
          );
        })}
      </div>
      
      <div className="mt-8 pt-6 border-t border-stone-100 dark:border-zinc-800 text-center">
        <button 
          onClick={onClose} 
          className="text-stone-400 hover:text-stone-600 dark:text-zinc-500 dark:hover:text-zinc-300 text-sm font-medium transition-colors"
        >
          Sair do Jogo
        </button>
      </div>
    </div>
  );
}
