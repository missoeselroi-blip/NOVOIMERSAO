import { 
  Book, Crown, Cross, Flame, User, AlertTriangle, Heart, Users, Hourglass, 
  Feather, Key, Mic, BookOpen, Brain, Sparkles, Shield, Scale, ShieldCheck 
} from 'lucide-react';

export const THEOLOGY_SUBJECTS = [
  { title: 'Bibliologia', desc: 'A Doutrina das Escrituras', topics: ['Origem e Natureza', 'Inspiração', 'Inerrância', 'Panorama'], prereq: null, icon: Book },
  { title: 'Teontologia', desc: 'A Doutrina de Deus', topics: ['Atributos', 'A Trindade', 'Panorama'], prereq: 'Bibliologia', icon: Crown },
  { title: 'Cristologia', desc: 'A Doutrina de Cristo', topics: ['Divindade e Humanidade', 'A Obra de Cristo', 'Panorama'], prereq: 'Teontologia', icon: Cross },
  { title: 'Pneumatologia', desc: 'A Doutrina do Espírito Santo', topics: ['A Pessoa do Espírito', 'Os Dons', 'Panorama'], prereq: 'Cristologia', icon: Flame },
  { title: 'Antropologia Bíblica', desc: 'O Estudo sobre o Homem', topics: ['Criação', 'Constituição', 'Panorama'], prereq: 'Pneumatologia', icon: User },
  { title: 'Hamartiologia', desc: 'O Estudo sobre o Pecado', topics: ['Natureza', 'Consequências', 'Panorama'], prereq: 'Antropologia Bíblica', icon: AlertTriangle },
  { title: 'Soteriologia', desc: 'A Doutrina da Salvação', topics: ['A Graça', 'Justificação', 'Panorama'], prereq: 'Hamartiologia', icon: Heart },
  { title: 'Eclesiologia', desc: 'A Doutrina da Igreja', topics: ['Missão', 'Ordenanças', 'Panorama'], prereq: 'Soteriologia', icon: Users },
  { title: 'Escatologia', desc: 'A Doutrina das Últimas Coisas', topics: ['Arrebatamento', 'Milênio', 'Panorama'], prereq: 'Eclesiologia', icon: Hourglass },
  { title: 'Angeologia', desc: 'Anjos e Demônios', topics: ['Os Anjos', 'A Queda', 'Panorama'], prereq: 'Escatologia', icon: Feather },
  { title: 'Hermenêutica Bíblica', desc: 'A Interpretação da Bíblia', topics: ['Princípios', 'Regras', 'Panorama'], prereq: 'Angeologia', icon: Key },
  { title: 'Homilética', desc: 'A Arte da Pregação', topics: ['Estrutura', 'Entrega', 'Panorama'], prereq: 'Hermenêutica Bíblica', icon: Mic },
  { title: 'Exegética', desc: 'A Interpretação Profunda do Texto', topics: ['Análise Gramatical', 'Contexto Histórico', 'Panorama'], prereq: 'Hermenêutica Bíblica', icon: BookOpen },
  { title: 'Teologia Sistemática (Calvinista e Arminiana)', desc: 'Perspectivas Comparadas', topics: ['Calvinismo', 'Arminianismo', 'Panorama'], prereq: 'Exegética', icon: Brain },
  { title: 'Evangelismo/Missões', desc: 'A Proclamação do Evangelho', topics: ['Fundamentos', 'Estratégias', 'Panorama'], prereq: 'Teologia Sistemática (Calvinista e Arminiana)', icon: Sparkles },
  { title: 'Liderança Cristã', desc: 'O Modelo Bíblico de Liderança', topics: ['Modelos Bíblicos', 'Autoridade e Submissão', 'O Líder Servo', 'Panorama'], prereq: 'Evangelismo/Missões', icon: Shield },
  { title: 'Filosofia', desc: 'O Cristão e o Pensamento', topics: ['Filosofia Essencial', 'Ética e Moral', 'Panorama'], prereq: 'Liderança Cristã', icon: Scale },
  { title: 'Sociologia', desc: 'O Cristão e a Sociedade', topics: ['Antropologia Cultural', 'Sistemas Políticos', 'Panorama'], prereq: 'Filosofia', icon: Users },
  { title: 'Apologética', desc: 'A Defesa da Fé Cristã', topics: ['Seitas e Heresias', 'Religiões no Brasil', 'Defesa Bíblica', 'Panorama'], prereq: 'Sociologia', icon: ShieldCheck },
  { title: 'As Dispensações', desc: 'O Plano de Deus para os Séculos', topics: ['Inocência', 'Consciência', 'Governo Humano', 'Promessa', 'Lei', 'Graça', 'Reino', 'Panorama'], prereq: 'Apologética', icon: BookOpen },
];

export const getMaxChapters = (subject: string) => subject === 'As Dispensações' ? 7 : 5;
