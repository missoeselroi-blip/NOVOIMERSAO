import React, { useState } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  ZoomIn,
  ZoomOut,
  Download, 
  Share2, 
  StickyNote, 
  Volume2, 
  Globe,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText,
  ExternalLink,
  PenTool,
  FileSearch,
  History,
  Save,
  X,
  BookOpen,
  Book,
  Glasses
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { cn } from '../types';
import { useToast } from '../components/Toast';
import { geminiService } from '../services/geminiService';
import { SpeechGenerator } from '../components/SpeechGenerator';

import { SaveToNotebookModal } from '../components/SaveToNotebookModal';

interface Lesson {
  id: number;
  title: string;
  theme?: string;
  content: string;
  hasAttachment?: boolean;
}

const LessonPage: React.FC = () => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState<string>("");
  const [notesHistory, setNotesHistory] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [showLeaderGuide, setShowLeaderGuide] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [isSavingToNotebook, setIsSavingToNotebook] = useState(false);
  const [contentToSave, setContentToSave] = useState({ title: '', content: '' });
  const [bibleModal, setBibleModal] = useState<{
    isOpen: boolean;
    reference: string;
    version: string;
    content: string;
    loading: boolean;
  }>({
    isOpen: false,
    reference: "",
    version: "NVI",
    content: "",
    loading: false
  });
  const { showToast } = useToast();

  const bibleVersions = ["NVI", "ACF", "ARA", "KJV", "NTLH"];

  const leaderGuideContent = `## 1. Aprofundamento Teológico
“O ânimo dobre é uma fragmentação da Alma”

### A Etimologia e o Contexto 
O termo grego dipsychos (Tiago 1:8; 4:8) é uma palavra composta: dis (duas vezes) e psyche (alma/mente). Curiosamente, essa palavra não aparece na literatura grega clássica ou na Septuaginta (LXX); muitos estudiosos acreditam que o próprio Tiago a cunhou para descrever a exigência VT de amar a Deus com todo o coração (Dt 6:4-5).
* Conexão no Antigo Testamento: O correspondente hebraico seria o "coração e coração" (leb wa leb) de Salmos 12:2, descrevendo alguém que fala com duplicidade.
* O Dicionário de Kittel (TDNT): Define o homem de ânimo dobre como aquele que deseja desfrutar de dois mundos; ele quer a segurança de Deus, mas não renuncia à autonomia do "eu".

### A Luta de Agostinho e a Vontade Dividida
Em suas Confissões, Santo Agostinho descreve perfeitamente esse estado: "Eu era aquele que queria e aquele que não queria. Era eu mesmo em ambos os lados... mas eu não estava inteiro em nenhum". O ânimo dobre é uma vontade doente que não consegue se decidir pela Verdade. Essa mesma luta é descrita também por Paulo (Rm 7:18-24).

### Referências Bíblicas de Apoio:
* Mateus 6:24: A impossibilidade de servir a dois senhores (A raiz da divisão).
* 1 Reis 18:21: Elias confronta o povo: "Até quando coxeareis entre dois pensamentos?"
* Oséias 10:2: "O seu coração está dividido; por isso serão culpados".

## 2. Sugestão de Quebra-Gelo: "O Conflito de Comandos"
Objetivo: Mostrar como a divisão interna gera paralisia e erro.
1. Formar uma fila com os participantes uns 4 ou 5 participantes.
2. Combine (secretamente) com o participante que ficará à frente para errar os comandos. E de vez em quando conversar com o pessoal atrás. 
3. Comandos: “Direita”; “Esquerda”; “Abaixa”; “Levanta”; "Pule!", "Mão na cabeça". Começa devagar e vai aumentando o ritmo.
** A ideia é o participante da frente induzir os demais ao erro.
Lição: Somos induzidos a seguir o que vemos e não o que ouvimos. Estamos ouvindo a voz de Deus, na mesma proporção que vemos Deus nas pessoas?

## 3. Dinâmica de Perguntas
### Perguntas Retóricas (Para despertar a consciência)
* "Se a sua vida fosse um barco sem leme, ao sabor das ondas das suas emoções, onde você estaria daqui a cinco anos?"
* "Deus pode confiar uma grande missão a alguém que não consegue cumprir um pequeno compromisso de horário?"
* "Quem está sentado no trono da sua vontade hoje: o seu propósito em Cristo ou o seu sentimento do momento?"

### Perguntas de Aprofundamento (Para análise de raízes)
* Tiago associa o ânimo dobre à dúvida (Tg 1:6). Em qual área da sua vida a falta de confiança no caráter de Deus tem gerado instabilidade?
* O texto diz que o inconstante "não recebe nada do Senhor". Por que a integridade é um pré-requisito para a recepção das promessas divinas?
* Como a cultura do "imediatismo" e das redes sociais tem alimentado a nossa inconstância?

### Perguntas Práticas (Para mudança de comportamento)
* Qual é o "projeto inacabado" que você precisa retomar ou encerrar formalmente esta semana para limpar sua estrutura mental?
* Cite uma área onde você tem sido guiado pelo "sentir" e não pelo "decidir". O que muda se você inverter essa lógica amanhã?
* No que diz respeito à pontualidade e palavra empenhada, qual ajuste imediato o Espírito Santo está te pedindo agora?

## 4. Dicas para a Ministração da Lição
1. Fuja do Moralismo: Não foque apenas no "pare de procrastinar". Foque no "purifique o coração". A inconstância externa é apenas o sintoma de uma deslealdade interna.
2. Seja Vulnerável: Como líder, compartilhe um projeto que você quase abandonou e como a disciplina (que é fruto do Espírito) te sustentou quando a motivação sumiu.
3. Ênfase na Soberania: Lembre ao grupo que o ânimo dobre pode ser uma tentativa de autocontrole que entra em conflito com a confiança em Deus. Quando confiamos em Deus (temos um ânimo firme) porque Ele é imutável, enquanto nós somos mutáveis.

## 5. Ganchos para Evangelismo (Dicas Práticas)
O tema do ânimo dobre toca na ferida da ansiedade moderna.
* O Gancho da Paz: "Você se sente exausto por tentar ser várias pessoas ao mesmo tempo ou por nunca terminar o que começa? Jesus oferece o jugo que é suave e que unifica o coração".
* O Gancho do Propósito: "Muitas pessoas buscam o sentido da vida, mas o perdem porque mudam de direção a cada dificuldade. Conhecer a Cristo é encontrar a 'âncora da alma' (Hb 6:19)".
* O Convite: Convide o visitante a entregar não apenas seus problemas, mas a sua vontade a Cristo.

## 6. Finalizando a Lição
Líder, lembre-se: Tiago 4:8 apresenta uma progressão: Chegar-se -> Purificar as mãos (ações externas) -> Limpar o coração (motivações internas). Não espere "sentir vontade" para ser constante. A constância é o terreno onde o milagre caminha. Tenha uma mensagem de motivação, desafio e até correção, mas jamais esqueça de finalizar ministrando fé, esperança e graça.`;

  const fetchBibleText = async (ref: string, version: string) => {
    setBibleModal(prev => ({ ...prev, loading: true, reference: ref, version }));
    try {
      const prompt = `Forneça o texto bíblico para a referência "${ref}" na versão "${version}". Retorne apenas o texto dos versículos, sem comentários adicionais.`;
      const text = await geminiService.generateText(prompt);
      setBibleModal(prev => ({ ...prev, content: text, loading: false }));
    } catch (error) {
      console.error("Error fetching bible text:", error);
      setBibleModal(prev => ({ ...prev, content: "Erro ao carregar o texto bíblico.", loading: false }));
    }
  };

  const handleBibleRefClick = (ref: string) => {
    setBibleModal(prev => ({ ...prev, isOpen: true }));
    fetchBibleText(ref, bibleModal.version);
  };

  const handleNavigateBible = async (direction: 'prev' | 'next') => {
    // Simple logic to navigate chapters if possible, otherwise just a placeholder
    // For a real app, we'd parse the reference properly
    showToast("Navegação de capítulos em desenvolvimento...", "info");
  };

  const processedContent = React.useMemo(() => {
    if (!selectedLesson) return "";
    // Regex to match biblical references like "João 3:16", "1 Coríntios 13:1-8", etc.
    const bibleRegex = /((?:[123]\s)?[A-Z][a-zà-ÿ]+)\s\d+:\d+(?:-\d+)?/g;
    return selectedLesson.content.replace(bibleRegex, (match) => `**${match}**`);
  }, [selectedLesson]);

  // Generate 50 lessons
  const lessons: Lesson[] = Array.from({ length: 50 }, (_, i) => {
    const id = i + 1;
    let content = `Este é o conteúdo detalhado da Lição ${String(id).padStart(2, '0')}. Aqui você encontrará ensinamentos profundos e reflexões sobre a Palavra.`;
    
    if (id === 11) {
      content = `
# LIÇÃO DE CÉLULA – Nº 11 ANO 26 – 2ª SEMANA – SÉRIE: COMBUSTÍVEL

<br/>

## **TEMA: A MEDIDA DO AMOR**

<br/>

### **TEXTO: JOÃO 13:34-35**

---

<br/>

**BATE PAPO INICIAL:** 
O que significa amar como Cristo amou? Como Ele nos amou na vida e na morte? Antes e hoje?

<br/>

---

# **INTRODUÇÃO**
O amor ao próximo nas Escrituras tem quatro níveis: 
1º Nível = Amar o amigo e odiar o inimigo (VT). 
2º Nível = Amar os inimigos e orar por eles (Sermão do Monte). 
3º Nível = Amar ao próximo COMO a ti mesmo (Resumo da Lei). 
4º Nível = “Ame como EU vos amei.” 

E como Ele nos amou? Dando a sua vida. Não tem nenhuma outra forma maior de amor. E se queremos ser como Ele... É assim que devemos amar. Você está disposto amar com esta medida?

---

# **DESENVOLVIMENTO**
O amor é o maior combustível do cristão. Mas, precisamos aprofundar nele. Enquanto Jesus ensinou a amar como a nós mesmos, foi desafiador, mas praticável, pois igualava a nossa necessidade de amar ao próximo assim (na mesma proporção) como nós nos amamos. Veja que esse nível de amor agride o egoísmo, mas não o destrói, pois ainda permite que preservemos o nosso amor-próprio. 

Agora amar como Cristo a ponto de dar a vida, aí a coisa muda completamente, pois isso requer um nível de entrega total e absoluta. Assim, consiste no aniquilamento completo e irrestrito de todos os nossos amores: seja a nós mesmos e aos outros. Diante disso precisamos nos perguntar: Que nível de amor é o meu? Estou disposto a morrer por pessoas que nem conheço, não gosto ou que me faz mal? 

Sei que este discurso é duro, mas é bíblico: Se não estamos dispostos a morrer para que o descrente conheça a Deus, não estamos obedecendo o NOVO MANDAMENTO de Jesus - Não podemos ser conhecidos ou chamados de cristãos, pois não o estamos imitando. Precisamos nascer de novo. 

Dizemos tanto que amamos, mas é cultural e muitas vezes mentiroso. Amar exige atitude! Jesus nos amou com o amor Ágape – é Divido, pois Deus é Amor (1 Jo 4:8) – é um amor incondicional, altruísta e sacrificial. É esse amor que precisa habitar em nós, senão seremos apenas religiosos e dos ruins ainda, pois a maioria de nós não chegamos nem aos pés dos Fariseus – e mesmo assim, foram rejeitados por Jesus.

Paulo entendeu a profundidade e a necessidade desse amor ao descrever que tudo que fazemos sem amor, NÃO TEM NENHUM VALOR, é só barulho (1 Cor 13). Não importa o que fazemos, ou o quanto fazemos, se não estamos dispostos a morrer pelas pessoas, não estamos praticando o NOVO MANDAMENTO ordenado por Jesus.

---

# **CONCLUSÃO:** 
Como ter esse amor na minha vida? Saiba que para o homem é IMPOSSÍVEL... Nenhum homem é capaz de desenvolver esse amor por si mesmo - como um ato racional e voluntário da sua vontade. O amor Ágape precisa ser derramado no coração pelo ESPÍRITO SANTO (Rm 5:5). Portanto, é uma obra de Deus. Sem ela continuaremos a sermos bons crentes, mas nunca seremos bons cristãos. Quem deseja ter este combustível na sua vida?`;
    } else if (id === 12) {
      content = `
# LIÇÃO DE CÉLULA – Nº 12 ANO 26 – 3ª SEMANA – 15 A 21/04 – SÉRIE: COMBUSTÍVEL

<br/>

## **TEMA: O ÂNIMO DOBRE – PARTE I**

<br/>

### **TEXTO: TIAGO 1:6-8**

---

<br/>

**BATE PAPO INICIAL:** 
Você já começou algo com muito entusiasmo (uma dieta, a academia, um curso, um projeto) e desistiu no meio do caminho ou quando surgiram as primeiras dificuldades? Compartilhe brevemente.

<br/>

---

# **INTRODUÇÃO**
O termo "ânimo dobre" vem do grego "dipsychos" que significa ‘homem de duas almas’. Portanto, refere-se a uma mente dividida, um coração em conflito e uma vontade instável. É a condição daquela pessoa que "um dia quer ganhar o mundo para Jesus, e no outro não quer nem sair do sofá". Essa inconstância não afeta apenas a vida espiritual, mas todos os caminhos e decisões dessa pessoa: trabalho, família, finanças e saúde. Para vencer, precisamos primeiro identificar como as raízes do ânimo dobre tem operado em nós. Será que nos falta vontade? Integridade? Ou, temos outras raízes ainda mais profundas do que estas? Vamos refletir sobre isso?

---

# **DESENVOLVIMENTO**
## **TRÊS CARACTERÍSTICAS DO ‘ÂNIMO DOBRE’**
Ele pode se manifestar tanto no desânimo; quanto num súbito ânimo contrário noutra direção. Para facilitar a nossa reflexão, vamos dividir o ânimo dobre em três pilares fundamentais:

**A. Inconstância em TODOS os caminhos** = O ânimo dobre não fica isolado. Ele pode até começar na igreja, mas, tende a se espalhar por outras áreas: projetos no trabalho ou disciplina nos estudos, fidelidade no casamento... Tiago alerta: quem oscila não recebe NADA de Deus - a dúvida destrói a fé (Deus) e a convicção (nós mesmos).

**B. A Escravidão das Emoções e Circunstâncias** = Diferente dos "campeões" que mantêm o foco mesmo em dias ruins, a pessoa de ânimo dobre é guiada pelo que sente no momento. Se o sentimento é bom, ela produz; se acorda desanimada, ela procrastina. Contudo, o ânimo é uma decisão, e não apenas um sentimento passageiro.

**C. Falta de Zelo e Responsabilidade** = O ânimo dobre se estabelece nas pequenas coisas que são negligenciadas e como já dissemos: vai lançando a base para a desistência das grandes coisas:
* **Atrasos constantes** (o atraso a um compromisso é uma forma de "roubar o tempo alheio").
* **Desorganização pessoal** e falta de cuidado com a saúde é outro reflexo da pessoa inconstante.
* **Dificuldade em honrar a palavra** e compromissos financeiros. A pessoa se acostuma a ter dívidas e não as pagar; ela se defende mentalmente e cria compensações para justificar sua irresponsabilidade.
* O hábito de **"procrastinar”** e a dificuldade de dizer **“não"** para a carne (distrações: redes sociais, vídeos...).

O ânimo dobre tem muitas causas, mas as principais são: falta de fé e falta de integridade na tentativa de servir a dois senhores e como Jesus ensinou: isso é impossível (Mt 6:24). Agostinho escreveu que o pecado desordenou os amores humanos. E Paulo relatou a grande luta entre a carne e o espírito, e demonstra que até mesmo ele – experimentou a força da carne em relação ao preparo do espírito (Rm 7:15-25). Ou seja, ninguém está imune a esse conflito. Jesus nos ensinou a vigiar constantemente antes mesmo de orar (Mt 26:41). Tiago ensina em Tg 4:8 convida os de ânimo dobre a: chegar a Deus; Purificar as mãos e Limpar o coração. Ou seja, é possível sermos transformados, e perceba que as três atitudes são ações que pertencem a nós e não a Deus.

---

# **CONCLUSÃO:** 
Creia que é possível mudar. A transformação pode estar a um passo, a uma porta, a uma palavra... siga em frente, confiando que Deus está no controle, no comando e direção da vida. A nós cabe 3 coisas: confiar, esperar e agir, a seu tempo, quando Deus assim nos ordenar, mesmo sem vermos ou sentirmos - Esta é a maior faceta da fé! 

**P.S.** Essa lição foi inspirada no meu livro “Ânimo Dobre” que será lançado em Junho/2026 – Reserve já o seu!
`;
    }

    return {
      id,
      title: `Lição ${String(id).padStart(2, '0')}`,
      theme: id === 12 ? "Ânimo Dobre Parte I" : undefined,
      content,
      hasAttachment: id === 12
    };
  });

  const handleShare = () => {
    showToast("Link da lição copiado para a área de transferência!", "success");
  };

  const handleSave = () => {
    if (selectedLesson) {
      setContentToSave({
        title: selectedLesson.title,
        content: selectedLesson.content
      });
      setIsNotebookModalOpen(true);
    }
  };

  const confirmSaveToNotebook = async (category: string) => {
    setIsSavingToNotebook(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSavingToNotebook(false);
    setIsNotebookModalOpen(false);
    showToast(`Lição salva com sucesso em ${category}!`, "success");
  };

  const handleListen = () => {
    setShowAudio(!showAudio);
    if (!showAudio) {
      showToast("Abrindo ferramentas de áudio...", "info");
    }
  };

  const handleDownload = () => {
    showToast("Iniciando download da lição...", "info");
  };

  const navigate = useNavigate();

  const handleWiki = () => {
    if (selectedLesson) {
      const text = selectedLesson.content.replace(/<br\/>/g, '\n').replace(/#|##|###|\*/g, '');
      navigate(`/study?wikiQuery=${encodeURIComponent(text)}`);
    }
  };

  const handleSaveNote = () => {
    if (notes.trim()) {
      setNotesHistory([notes, ...notesHistory]);
      setNotes("");
      showToast("Anotação salva com sucesso!", "success");
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (!isFullScreen) {
      setZoom(1.5); // Max zoom for reading
    } else {
      setZoom(1);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full mb-4"
          >
            <Glasses size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">Módulo de Estudos</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-stone-900 dark:text-white tracking-tighter mb-4">
            Lições Bíblicas
          </h1>
          <p className="text-stone-500 dark:text-zinc-400 max-w-2xl mx-auto font-medium">
            Explore nossa jornada de 50 lições fundamentais para o seu crescimento espiritual e conhecimento teológico.
          </p>
        </header>

        {/* Lessons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {lessons.map((lesson) => (
            <motion.button
              key={lesson.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedLesson(lesson);
                setZoom(1.1); // Default to 110%
                setIsFullScreen(true); // Default to fullscreen
              }}
              className={cn(
                "aspect-square flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all shadow-lg",
                lesson.hasAttachment 
                  ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800" 
                  : "bg-white border-stone-100 dark:bg-zinc-900 dark:border-zinc-800"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mb-4",
                lesson.hasAttachment ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
              )}>
                {lesson.hasAttachment ? <FileText size={24} /> : (
                  <Glasses size={24} />
                )}
              </div>
              <span className="font-bold text-lg text-stone-900 dark:text-white">{lesson.title}</span>
              {lesson.theme && (
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mt-2 text-center px-2">
                  {lesson.theme}
                </span>
              )}
              {lesson.hasAttachment && lesson.id !== 12 && (
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 mt-2">Anexo</span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lesson Reader Modal */}
      <AnimatePresence>
        {selectedLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8",
              isFullScreen ? "bg-white dark:bg-zinc-950" : "bg-black/60 backdrop-blur-sm"
            )}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden flex flex-col",
                isFullScreen 
                  ? "w-full h-full rounded-none" 
                  : "w-full max-w-4xl max-h-[90vh] rounded-[3rem] border border-stone-200 dark:border-zinc-800"
              )}
            >
              {/* Toolbar */}
              <div className="p-4 md:p-6 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between bg-stone-50/50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedLesson(null)}
                    className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">{selectedLesson.title}</h2>
                  </div>
                </div>

                <div className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar max-w-[60vw] md:max-w-none">
                  <button onClick={toggleFullScreen} className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-xl transition-colors shrink-0" title={isFullScreen ? "Minimizar" : "Maximizar"}>
                    {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                  </button>
                  <button onClick={handleDownload} className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-xl transition-colors shrink-0" title="Baixar">
                    <Download size={20} />
                  </button>
                  <button onClick={handleShare} className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-xl transition-colors shrink-0" title="Compartilhar">
                    <Share2 size={20} />
                  </button>
                  <button onClick={handleSave} className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-xl transition-colors shrink-0" title="Salvar no Caderno">
                    <StickyNote size={20} />
                  </button>
                  <button onClick={handleListen} className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-xl transition-colors shrink-0" title="Ouvir">
                    <Volume2 size={20} />
                  </button>
                  <button onClick={handleWiki} className="p-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-2 px-3 shrink-0" title="Wiki">
                    <Globe size={18} />
                    <span className="hidden md:inline text-xs font-bold uppercase">Wiki</span>
                  </button>
                  <button 
                    onClick={() => setShowNotes(true)} 
                    className="p-2 bg-amber-500 text-white hover:bg-amber-600 rounded-xl transition-colors flex items-center gap-2 px-3 shrink-0" 
                    title="Anotar"
                  >
                    <PenTool size={18} />
                    <span className="hidden md:inline text-xs font-bold uppercase">Anotar</span>
                  </button>
                  <button 
                    onClick={() => setShowSummary(true)} 
                    className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-2 px-3 shrink-0" 
                    title="Resumo"
                  >
                    <FileSearch size={18} />
                    <span className="hidden md:inline text-xs font-bold uppercase">Resumo</span>
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className={cn(
                "flex-1 overflow-y-auto p-8 md:p-16 scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-zinc-800 relative",
                selectedLesson.id === 11 && "bg-cover bg-center bg-no-repeat",
                selectedLesson.id === 12 && "bg-stone-50 dark:bg-zinc-950"
              )}
              style={selectedLesson.id === 11 ? { backgroundImage: 'url("https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format&fit=crop&q=80&w=1920")' } : {}}
              >
                {/* Overlay for readability if background is present */}
                {selectedLesson.id === 11 && (
                  <div className="absolute inset-0 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-[2px] z-0" />
                )}
                
                <div className="max-w-3xl mx-auto relative z-10 mb-8">
                  <AnimatePresence>
                    {showAudio && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-8"
                      >
                        <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                          <Volume2 size={20} />
                          <h4 className="font-black uppercase tracking-widest text-xs">Narração Emotiva da Lição</h4>
                        </div>
                        <SpeechGenerator 
                          initialText={selectedLesson.content.replace(/<br\/>/g, '\n').replace(/#|##|###|\*/g, '')}
                          initialTitle={`Narração: ${selectedLesson.title}`}
                          initialSubject="Lição Bíblica"
                          initialEmotion="inspirador"
                          initialVoice="homem"
                          onSaveToNotebook={(title, content) => {
                            setContentToSave({ title, content });
                            setIsNotebookModalOpen(true);
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div 
                  className="max-w-3xl mx-auto transition-all duration-500 relative z-10"
                  style={{ 
                    transform: `scale(${zoom})`, 
                    transformOrigin: 'top center',
                    width: zoom > 1 ? `${100 / zoom}%` : '100%',
                    fontFamily: 'Arial, sans-serif'
                  }}
                >
                  <div className="prose dark:prose-invert max-w-none lesson-custom-formatting">
                    <style>{`
                      .lesson-custom-formatting { font-size: 14px !important; }
                      .lesson-custom-formatting h1, .lesson-custom-formatting p, .lesson-custom-formatting li { font-size: 14px !important; }
                      .lesson-custom-formatting h2, .lesson-custom-formatting h3 { font-size: 18px !important; font-weight: bold !important; margin-top: 1.5rem !important; margin-bottom: 0.75rem !important; color: #065f46 !important; }
                      .dark .lesson-custom-formatting h2, .dark .lesson-custom-formatting h3 { color: #34d399 !important; }
                      .lesson-custom-formatting h1 { font-weight: bold !important; margin-top: 1rem !important; margin-bottom: 0.5rem !important; }
                      .bible-ref-link { 
                        background-color: #fef08a; 
                        padding: 0 4px; 
                        border-radius: 4px; 
                        font-weight: bold; 
                        color: #854d0e; 
                        cursor: pointer;
                        text-decoration: none;
                        transition: all 0.2s;
                      }
                      .bible-ref-link:hover {
                        background-color: #fde047;
                        transform: translateY(-1px);
                      }
                      .dark .bible-ref-link { background-color: #854d0e; color: #fef08a; }
                      .dark .bible-ref-link:hover { background-color: #a16207; }
                    `}</style>
                    <div className="text-stone-600 dark:text-zinc-400 leading-[2.2] mb-6">
                      <ReactMarkdown 
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          strong: ({node, ...props}) => {
                            const content = String(props.children);
                            // Improved regex for biblical references
                            const bibleRegex = /((?:[123]\s)?[A-Z][a-zà-ÿ]+)\s\d+:\d+(?:-\d+)?/g;
                            if (content.match(bibleRegex)) {
                              return (
                                <button 
                                  onClick={() => handleBibleRefClick(content)}
                                  className="bible-ref-link"
                                >
                                  {content}
                                </button>
                              );
                            }
                            return <strong {...props} />;
                          }
                        }}
                      >
                        {processedContent}
                      </ReactMarkdown>
                    </div>
                    
                    <div className="mt-16 pt-8 border-t border-stone-200 dark:border-zinc-800 text-center">
                      <div className="italic text-stone-400 dark:text-zinc-500 text-sm space-y-1">
                        <p>Escrito por Wesley Reis</p>
                        <p>Temas e revisão: Eliomar e Rosa Ferrari</p>
                        {selectedLesson.id === 12 && (
                          <p className="mt-4 font-bold not-italic text-stone-600 dark:text-zinc-400">Igreja Betânia de Ipatinga</p>
                        )}
                      </div>
                      {selectedLesson.id === 12 && (
                        <button 
                          onClick={() => setShowLeaderGuide(true)}
                          className="mt-8 px-8 py-3 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 mx-auto"
                        >
                          <BookOpen size={20} />
                          GUIA DO LÍDER
                        </button>
                      )}
                    </div>
                    
                    {selectedLesson.hasAttachment && selectedLesson.id !== 12 && (
                      <div className="mt-12 p-8 bg-amber-50 dark:bg-amber-900/20 rounded-[2rem] border-2 border-dashed border-amber-200 dark:border-amber-800 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-800 rounded-2xl flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
                          <FileText size={32} />
                        </div>
                        <h4 className="text-xl font-bold mb-2">Arquivo em Anexo</h4>
                        <p className="text-sm text-stone-500 dark:text-zinc-400 mb-6">
                          Esta lição contém um material complementar importante para o seu estudo.
                        </p>
                        <button className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-full font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20">
                          <Download size={20} />
                          Baixar PDF da Lição 12
                        </button>
                      </div>
                    )}

                    {/* Footer removed */}
                  </div>
                </div>
              </div>

              {/* Zoom Controls (Floating) */}
              <div className="absolute bottom-8 right-8 flex items-center gap-2 bg-white dark:bg-zinc-800 p-2 rounded-2xl shadow-2xl border border-stone-200 dark:border-zinc-700 z-[110]">
                <button 
                  onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                  className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-700 rounded-xl transition-colors text-stone-600 dark:text-zinc-400"
                  title="Diminuir Zoom"
                >
                  <ZoomOut size={18} />
                </button>
                <span className="text-xs font-black w-12 text-center text-stone-900 dark:text-white">{Math.round(zoom * 100)}%</span>
                <button 
                  onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
                  className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-700 rounded-xl transition-colors text-stone-600 dark:text-zinc-400"
                  title="Aumentar Zoom"
                >
                  <ZoomIn size={18} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Annotations Modal */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PenTool className="text-amber-500" />
                  <h3 className="text-xl font-black tracking-tight">Anotações</h3>
                </div>
                <button onClick={() => setShowNotes(false)} className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-stone-400">Nova Observação</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Escreva suas reflexões aqui..."
                    className="w-full h-32 p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800 border-2 border-stone-100 dark:border-zinc-700 focus:border-amber-500 outline-none transition-all resize-none"
                  />
                  <button 
                    onClick={handleSaveNote}
                    className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Salvar Anotação
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-stone-400">
                    <History size={14} />
                    Histórico
                  </div>
                  {notesHistory.length === 0 ? (
                    <p className="text-sm text-stone-400 italic">Nenhuma anotação salva ainda.</p>
                  ) : (
                    <div className="space-y-3">
                      {notesHistory.map((note, idx) => (
                        <div key={idx} className="p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-xl border border-stone-100 dark:border-zinc-800 text-sm leading-relaxed">
                          {note}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Modal */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between bg-blue-50/50 dark:bg-blue-900/10">
                <div className="flex items-center gap-3">
                  <FileSearch className="text-blue-600" size={28} />
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">Resumo Executivo</h3>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Ideias Centrais & Recursos</p>
                  </div>
                </div>
                <button onClick={() => setShowSummary(false)} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {selectedLesson.id === 12 ? (
                  <section className="space-y-4">
                    <h4 className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
                      <div className="w-2 h-6 bg-blue-600 rounded-full" />
                      Pontos Chave da Lição
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex gap-3 text-stone-600 dark:text-zinc-400">
                        <span className="font-black text-blue-600">01.</span>
                        <span>**Definição de Ânimo Dobre:** A mente dividida ("dipsychos") que gera inconstância em todas as áreas da vida.</span>
                      </li>
                      <li className="flex gap-3 text-stone-600 dark:text-zinc-400">
                        <span className="font-black text-blue-600">02.</span>
                        <span>**Impacto da Inconstância:** A oscilação impede o recebimento de bênçãos divinas e destrói a autoconfiança.</span>
                      </li>
                      <li className="flex gap-3 text-stone-600 dark:text-zinc-400">
                        <span className="font-black text-blue-600">03.</span>
                        <span>**Raízes do Problema:** Falta de fé, escravidão emocional e negligência em pequenas responsabilidades (atrasos, desorganização).</span>
                      </li>
                      <li className="flex gap-3 text-stone-600 dark:text-zinc-400">
                        <span className="font-black text-blue-600">04.</span>
                        <span>**O Caminho da Vitória:** Vigiar, chegar-se a Deus, purificar as mãos e limpar o coração (Tg 4:8).</span>
                      </li>
                      <li className="flex gap-3 text-stone-600 dark:text-zinc-400">
                        <span className="font-black text-blue-600">05.</span>
                        <span>**Integridade e Decisão:** O ânimo é uma decisão, não apenas um sentimento passageiro. Requer integridade total.</span>
                      </li>
                      <li className="flex gap-3 text-stone-600 dark:text-zinc-400">
                        <span className="font-black text-blue-600">06.</span>
                        <span>**A Luta Espiritual:** O conflito entre carne e espírito é real para todos, exigindo vigilância constante (Mt 26:41).</span>
                      </li>
                      <li className="flex gap-3 text-stone-600 dark:text-zinc-400">
                        <span className="font-black text-blue-600">07.</span>
                        <span>**Promessa de Mudança:** A transformação é possível através da confiança, espera e ação no tempo de Deus.</span>
                      </li>
                    </ul>
                  </section>
                ) : (
                  <section className="space-y-4">
                    <h4 className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
                      <div className="w-2 h-6 bg-blue-600 rounded-full" />
                      Resumo da Lição
                    </h4>
                    <p className="text-stone-600 dark:text-zinc-400 leading-relaxed">
                      Esta lição explora fundamentos bíblicos essenciais para o crescimento espiritual. 
                      Recomendamos a leitura atenta do texto e a utilização das ferramentas de anotação para registrar seus insights.
                    </p>
                  </section>
                )}

                <section className="space-y-4">
                  <h4 className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
                    <div className="w-2 h-6 bg-emerald-600 rounded-full" />
                    Recursos para Aprofundamento
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-stone-100 dark:border-zinc-800">
                      <h5 className="font-bold text-emerald-600 mb-1 flex items-center gap-2">
                        <BookOpen size={16} />
                        Módulo Imersão
                      </h5>
                      <p className="text-xs text-stone-500">Use a ferramenta de Imersão para pesquisar temas relacionados a esta lição.</p>
                    </div>
                    <div className="p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-stone-100 dark:border-zinc-800">
                      <h5 className="font-bold text-amber-600 mb-1 flex items-center gap-2">
                        <StickyNote size={16} />
                        Caderno de Notas
                      </h5>
                      <p className="text-xs text-stone-500">Registre seus compromissos e decisões baseadas neste estudo.</p>
                    </div>
                  </div>
                </section>

                <div className="p-6 bg-blue-600 rounded-[2rem] text-white">
                  <h5 className="font-black uppercase tracking-widest text-[10px] mb-2 opacity-80">Dica do App</h5>
                  <p className="text-sm font-medium leading-relaxed">
                    Aprofunde seu conhecimento utilizando a **Pesquisa Wiki** para encontrar referências históricas e teológicas sobre os temas abordados.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bible Reference Modal */}
      <AnimatePresence>
        {bibleModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
            >
              <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-900/10">
                <div className="flex items-center gap-3">
                  <Book className="text-emerald-600" size={24} />
                  <div>
                    <h3 className="text-xl font-black tracking-tight">{bibleModal.reference}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {bibleVersions.map(v => (
                        <button
                          key={v}
                          onClick={() => fetchBibleText(bibleModal.reference, v)}
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold transition-all",
                            bibleModal.version === v 
                              ? "bg-emerald-600 text-white" 
                              : "bg-stone-200 dark:bg-zinc-800 text-stone-500"
                          )}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => setBibleModal(prev => ({ ...prev, isOpen: false }))} className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8">
                {bibleModal.loading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Search className="text-emerald-600" size={32} />
                    </motion.div>
                    <p className="text-sm font-bold text-stone-400 animate-pulse">Buscando na Palavra...</p>
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-stone-700 dark:text-zinc-300 leading-relaxed text-lg font-serif italic">
                      "{bibleModal.content}"
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leader Guide Modal */}
      <AnimatePresence>
        {showLeaderGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 md:p-8 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-900/10">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowLeaderGuide(false)}
                    className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-full transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black tracking-tight">GUIA DO LÍDER</h3>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Lição 12 – ÂNIMO DOBRE PARTE I</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar max-w-[40vw] md:max-w-none">
                  <button onClick={handleDownload} className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-xl transition-colors shrink-0" title="Baixar">
                    <Download size={20} />
                  </button>
                  <button onClick={handleShare} className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-xl transition-colors shrink-0" title="Compartilhar">
                    <Share2 size={20} />
                  </button>
                  <button onClick={handleWiki} className="p-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-2 px-3 shrink-0" title="Wiki">
                    <Globe size={18} />
                    <span className="hidden md:inline text-xs font-bold uppercase">Wiki</span>
                  </button>
                  <button 
                    onClick={() => setShowNotes(true)} 
                    className="p-2 bg-amber-500 text-white hover:bg-amber-600 rounded-xl transition-colors flex items-center gap-2 px-3 shrink-0" 
                    title="Anotar"
                  >
                    <PenTool size={18} />
                    <span className="hidden md:inline text-xs font-bold uppercase">Anotar</span>
                  </button>
                  <button 
                    onClick={() => setShowSummary(true)} 
                    className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-2 px-3 shrink-0" 
                    title="Resumo"
                  >
                    <FileSearch size={18} />
                    <span className="hidden md:inline text-xs font-bold uppercase">Resumo</span>
                  </button>
                  <button onClick={() => setShowLeaderGuide(false)} className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-full transition-colors shrink-0">
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 md:p-12">
                <div className="max-w-3xl mx-auto mb-8">
                  <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                    <Volume2 size={20} />
                    <h4 className="font-black uppercase tracking-widest text-xs">Narração Emotiva do Guia</h4>
                  </div>
                  <SpeechGenerator 
                    initialText={leaderGuideContent}
                    initialTitle="Narração: Guia do Líder - Lição 12"
                    initialSubject="Guia do Líder"
                    initialEmotion="pastor"
                    initialVoice="homem"
                    onSaveToNotebook={(title, content) => {
                      setContentToSave({ title, content });
                      setIsNotebookModalOpen(true);
                    }}
                  />
                </div>
                <div className="prose dark:prose-invert max-w-none leader-guide-content">
                  <style>{`
                    .leader-guide-content h2 { color: #059669; font-weight: 900; margin-top: 2rem; border-bottom: 2px solid #ecfdf5; padding-bottom: 0.5rem; }
                    .leader-guide-content h3 { color: #10b981; font-weight: 800; margin-top: 1.5rem; }
                    .leader-guide-content p { line-height: 1.8; margin-bottom: 1rem; }
                    .leader-guide-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
                    .leader-guide-content li { margin-bottom: 0.5rem; }
                    .leader-guide-content hr { margin: 2rem 0; border-color: #f3f4f6; }
                  `}</style>
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {leaderGuideContent}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <SaveToNotebookModal 
        isOpen={isNotebookModalOpen}
        isLoading={isSavingToNotebook}
        onClose={() => setIsNotebookModalOpen(false)}
        onConfirm={confirmSaveToNotebook}
      />
    </div>
  );
};

export default LessonPage;
