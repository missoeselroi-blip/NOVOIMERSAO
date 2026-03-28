import { 
  Book, Sparkles, Palette, Users, Baby, Theater, Mic, Music, Search, Brain, MessageSquare, Heart, Zap, Smile, BookOpen, UserPlus
} from 'lucide-react';

export const STORYTELLING_SUBJECTS = [
  { 
    title: 'MÓDULO I: INTRODUÇÃO: O PODER DE UMA ESTÓRIA', 
    desc: 'Fundamentos e Conexão com a Criança', 
    topics: [
      'SEJA CRIANÇA PARA CONQUISTAR CRIANÇAS (use a imaginação e criatividade)',
      'Crenças que atrapalham a Contação de Histórias',
      'Os erros mais comuns dos Contadores de Histórias',
      'Geração 3.0',
      'Compreenda seu público',
      'Fórmula de Contação de Histórias',
      'Passo a passo para Contar Histórias',
      'Diferenças entre Contador de Histórias direto e indireto',
      'Como começar, quebrar a timidez e adquirir confiança',
      'Como prender a atenção (grupos pequenos e grandes)',
      'Fórmulas de entrada e saída de uma Contação de Histórias'
    ], 
    prereq: null, 
    icon: Sparkles 
  },
  { 
    title: 'MÓDULO II: Os requisitos para ser um Contador de Histórias', 
    desc: 'Técnicas e Preparação do Contador', 
    topics: [
      'O Roteiro (a importância de escrever a história)',
      'A Expressão Corporal (gestos, postura, olhar)',
      'A Expressão Vocal (entonação, pausas, onomatopeias)',
      'Como escolher um bom livro para contar histórias',
      'Contação de histórias na educação infantil',
      'A arte de ler e contar histórias (diferenças e técnicas)'
    ], 
    prereq: 'MÓDULO I: INTRODUÇÃO: O PODER DE UMA ESTÓRIA', 
    icon: UserPlus 
  },
  { 
    title: 'MÓDULO III: O uso correto das cores na Contação de histórias', 
    desc: 'Ambiente e Inovação', 
    topics: [
      'Psicologia das cores na contação de histórias',
      'Como criar um ambiente acolhedor e mágico',
      'Inovação na Contação de Histórias (tecnologia e tradição)',
      'O uso de músicas e sons para ambientação'
    ], 
    prereq: 'MÓDULO II: Os requisitos para ser um Contador de Histórias', 
    icon: Palette 
  },
  { 
    title: 'MÓDULO IV: Brincadeiras para utilizar na Contação de Histórias', 
    desc: 'Recursos Visuais e Dinâmicas', 
    topics: [
      'Brincadeiras cantadas e rítmicas',
      'Recursos Visuais (objetos, figurinos, cenários)',
      'Artes Cênicas (fantoches, teatro de sombras, teatro de papel)',
      'Truques de mágica simples para ilustrar histórias',
      'Histórias com barbantes e dobraduras'
    ], 
    prereq: 'MÓDULO III: O uso correto das cores na Contação de histórias', 
    icon: Baby 
  },
  { 
    title: 'MÓDULO V: COMO CRIAR UMA BOA ESTÓRIA', 
    desc: 'Dramaturgia e Criação Autoral', 
    topics: [
      'Dramaturgia para contadores de histórias',
      'Como criar personagens inesquecíveis',
      'Elementos visuais na criação da narrativa',
      'Estrutura simples: Início, Meio e Fim',
      'Como inserir valores e lições de vida na história'
    ], 
    prereq: 'MÓDULO IV: Brincadeiras para utilizar na Contação de Histórias', 
    icon: Brain 
  },
];

export const STORYTELLING_AUTHORS = [
  'Todos os autores',
  'Gianni Rodari',
  'Fanny Abramovich',
  'Gislayne Matos',
  'Inno Sorsy',
  'Regina Machado',
  'Celso Sisto',
  'Ilana Pogrebinschi',
  'Ana Maria Machado',
  'Ruth Rocha',
  'Monteiro Lobato',
  'Irmãos Grimm',
  'Hans Christian Andersen',
  'Charles Perrault'
];

export const getMaxChapters = (subject: string) => 5;
