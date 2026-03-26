import { 
  Book, Sparkles, Map, Heart, Globe, Palette, Shield, Users, Home, 
  Layout, Link, Coins, Baby, Flame, Zap, Smile, BookOpen, Brain, 
  MessageSquare, Theater, Mic, Music, UserPlus, Search, Loader2
} from 'lucide-react';

export const EVANGELISM_SUBJECTS = [
  { 
    title: 'Introdução ao Evangelismo', 
    desc: 'Conceitos e Plano de Salvação', 
    topics: ['O que é Evangelismo', 'Princípios Fundamentais', 'Plano de Salvação', 'Criação e Queda', 'Redenção e Resposta'], 
    prereq: null, 
    icon: Book 
  },
  { 
    title: 'Base Bíblica do Evangelismo', 
    desc: 'O Chamado nas Escrituras', 
    topics: ['Antigo Testamento', 'Novo Testamento', 'Jesus - Modelo Perfeito', 'A Mulher Samaritana', 'Paulo em Atenas'], 
    prereq: 'Introdução ao Evangelismo', 
    icon: BookOpen 
  },
  { 
    title: 'Evangelismo Urbano', 
    desc: 'Alcançando as Cidades', 
    topics: ['Desafios das Cidades', 'Capelania e Abrigos', 'Evangelismo de Rua', 'Visitas nos Lares', 'Viagens e Impactos'], 
    prereq: 'Base Bíblica do Evangelismo', 
    icon: Map 
  },
  { 
    title: 'Evangelismo Integral', 
    desc: 'Alcançando o Homem Todo', 
    topics: ['Conceito de Missão Integral', 'Obra Social e Evangelho', 'Contexto Físico e Social', 'Contexto Espiritual e Emocional', 'Equilíbrio Prático'], 
    prereq: 'Evangelismo Urbano', 
    icon: Heart 
  },
  { 
    title: 'Missões Transculturais', 
    desc: 'Além das Fronteiras', 
    topics: ['Conceitos e Povos não Alcançados', 'Diferenças Culturais', 'Adaptação Missionária', 'Janela 10 por 40', 'Desafios Globais'], 
    prereq: 'Evangelismo Integral', 
    icon: Globe 
  },
  { 
    title: 'Evangelismo Criativo', 
    desc: 'Novas Formas de Pregar', 
    topics: ['Mídias Sociais e IA', 'Literatura e Música', 'Teatro e Bonecos', 'Contação de Histórias', 'Circo e Arte'], 
    prereq: 'Missões Transculturais', 
    icon: Palette 
  },
  { 
    title: 'Apologética e Desafios', 
    desc: 'Defesa da Fé e Seitas', 
    topics: ['Ateísmo e Relativismo', 'Seitas e Religiões', 'Argumentos Bíblicos', 'Os Desigrejados', 'Estratégias de Abordagem'], 
    prereq: 'Evangelismo Criativo', 
    icon: Shield 
  },
  { 
    title: 'Evangelismo Relacional', 
    desc: 'Parentes e Amigos', 
    topics: ['Testemunho no Lar', 'Amizade e Influência', 'Evangelismo no Trabalho', 'Relacionamento Saudável', 'O Exemplo de Jesus'], 
    prereq: 'Apologética e Desafios', 
    icon: Users 
  },
  { 
    title: 'Pequenos Grupos', 
    desc: 'Células e Grupos Familiares', 
    topics: ['Importância e Vantagens', 'Células e PGs', 'Grupos Familiares', 'Casa de Paz', 'Formação de Líderes'], 
    prereq: 'Evangelismo Relacional', 
    icon: Home 
  },
  { 
    title: 'Organização na Igreja', 
    desc: 'Departamento de Missões', 
    topics: ['Estrutura do Departamento', 'Cultos e Conferências', 'Treinamento de Equipes', 'Cantina e Feiras', 'Comunicação Missionária'], 
    prereq: 'Pequenos Grupos', 
    icon: Layout 
  },
  { 
    title: 'Agências e ONGs', 
    desc: 'Parcerias e Envio', 
    topics: ['Função das Agências', 'Organizações no Brasil', 'Treinamento e Acolhimento', 'Redes Sociais e Contatos', 'Importância do Envio'], 
    prereq: 'Organização na Igreja', 
    icon: Link 
  },
  { 
    title: 'Captação de Recursos', 
    desc: 'Investindo no Reino', 
    topics: ['Ideias Práticas', 'Eventos Beneficentes', 'Parcerias Estratégicas', 'Doações Recorrentes', 'Transparência e Gestão'], 
    prereq: 'Agências e ONGs', 
    icon: Coins 
  },
  { 
    title: 'Evangelismo Infantil', 
    desc: 'Alcançando as Crianças', 
    topics: ['Desafios e Possibilidades', 'Linguagem e Histórias', 'Música e Teatro Infantil', 'Importância da Base', 'Recursos Visuais'], 
    prereq: 'Captação de Recursos', 
    icon: Baby 
  },
  { 
    title: 'Intercessão', 
    desc: 'Batalha Espiritual', 
    topics: ['Importância da Oração', 'Jejum e Consagração', 'Batalha Espiritual', 'Amarrando o Valente', 'Vigilância e Brechas'], 
    prereq: 'Evangelismo Infantil', 
    icon: Flame 
  },
  { 
    title: 'Espírito Santo', 
    desc: 'Poder e Capacitação', 
    topics: ['Papel do Espírito Santo', 'Poder e Unção', 'Sinais e Maravilhas', 'Dons e Talentos', 'Direcionamento Divino'], 
    prereq: 'Intercessão', 
    icon: Zap 
  },
  { 
    title: 'Estilo de Vida', 
    desc: 'Evangelismo no Cotidiano', 
    topics: ['Oportunidades Diárias', 'Serviço e Amor', 'Falar de Jesus Naturalmente', 'Influência no Lazer e Esporte', 'Conclusão do Chamado'], 
    prereq: 'Espírito Santo', 
    icon: Smile 
  },
];

export const getMaxChapters = (subject: string) => 5;
