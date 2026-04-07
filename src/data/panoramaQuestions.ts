export type Difficulty = 'facil' | 'medio' | 'dificil';

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: Difficulty;
}

export const booksList = [
  "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio",
  "Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel", "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras", "Neemias", "Ester",
  "Jó", "Salmos", "Provérbios", "Eclesiastes", "Cânticos",
  "Isaías", "Jeremias", "Lamentações", "Ezequiel", "Daniel",
  "Oséias", "Joel", "Amós", "Obadias", "Jonas", "Miquéias", "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias",
  "Mateus", "Marcos", "Lucas", "João",
  "Atos dos Apóstolos",
  "Romanos", "1 Coríntios", "2 Coríntios", "Gálatas", "Efésios", "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses", "1 Timóteo", "2 Timóteo", "Tito", "Filemom",
  "Hebreus", "Tiago", "1 Pedro", "2 Pedro", "1 João", "2 João", "3 João", "Judas",
  "Apocalipse"
];

export const divisions = [
  { name: 'Pentateuco (A Lei)', startIndex: 0, endIndex: 4 },
  { name: 'Livros Históricos', startIndex: 5, endIndex: 16 },
  { name: 'Livros Poéticos', startIndex: 17, endIndex: 21 },
  { name: 'Profetas Maiores', startIndex: 22, endIndex: 26 },
  { name: 'Profetas Menores', startIndex: 27, endIndex: 38 },
  { name: 'Evangelhos', startIndex: 39, endIndex: 42 },
  { name: 'Histórico', startIndex: 43, endIndex: 43 },
  { name: 'Cartas de Paulo', startIndex: 44, endIndex: 56 },
  { name: 'Cartas Gerais', startIndex: 57, endIndex: 64 },
  { name: 'Livro Profético', startIndex: 65, endIndex: 65 }
];

export const getDivisionForBook = (bookIndex: number) => {
  return divisions.find(d => bookIndex >= d.startIndex && bookIndex <= d.endIndex) || divisions[0];
};

// Banco de dados inicial (pode ser expandido para 20+ por livro)
export const panoramaQuestions: Record<string, Question[]> = {
  "Gênesis": [
    { question: "Quem foi o primeiro homem criado por Deus?", options: ["Abraão", "Adão", "Noé", "Moisés"], correctAnswer: "Adão", difficulty: "facil" },
    { question: "Quantos filhos teve Jacó?", options: ["10", "12", "7", "14"], correctAnswer: "12", difficulty: "medio" }
  ],
  "Êxodo": [
    { question: "Quem liderou o povo de Israel na saída do Egito?", options: ["Josué", "Moisés", "Arão", "Calebe"], correctAnswer: "Moisés", difficulty: "facil" },
    { question: "Qual foi a última praga do Egito?", options: ["Gafanhotos", "Trevas", "Morte dos primogênitos", "Rãs"], correctAnswer: "Morte dos primogênitos", difficulty: "medio" }
  ],
  "Levítico": [
    { question: "Qual tribo foi separada para o sacerdócio?", options: ["Judá", "Levi", "Benjamim", "Rúben"], correctAnswer: "Levi", difficulty: "facil" }
  ],
  "Números": [
    { question: "Quantos espias foram enviados para observar Canaã?", options: ["10", "12", "7", "2"], correctAnswer: "12", difficulty: "facil" }
  ],
  "Deuteronômio": [
    { question: "Quem sucedeu Moisés na liderança de Israel?", options: ["Arão", "Josué", "Calebe", "Elias"], correctAnswer: "Josué", difficulty: "facil" }
  ],
  "Josué": [
    { question: "Qual cidade teve suas muralhas derrubadas pelo som de trombetas?", options: ["Jericó", "Ai", "Jerusalém", "Hebrom"], correctAnswer: "Jericó", difficulty: "facil" }
  ],
  "Juízes": [
    { question: "Qual juiz perdeu sua força ao ter o cabelo cortado?", options: ["Gideão", "Sansão", "Jefté", "Eúde"], correctAnswer: "Sansão", difficulty: "facil" }
  ],
  "Rute": [
    { question: "De quem Rute era nora?", options: ["Sara", "Noemi", "Raquel", "Rebeca"], correctAnswer: "Noemi", difficulty: "facil" }
  ],
  "1 Samuel": [
    { question: "Quem foi o primeiro rei de Israel?", options: ["Davi", "Salomão", "Saul", "Samuel"], correctAnswer: "Saul", difficulty: "facil" }
  ],
  "2 Samuel": [
    { question: "Qual cidade Davi conquistou e tornou sua capital?", options: ["Hebrom", "Jerusalém", "Belém", "Jericó"], correctAnswer: "Jerusalém", difficulty: "medio" }
  ],
  "1 Reis": [
    { question: "Quem construiu o primeiro templo em Jerusalém?", options: ["Davi", "Salomão", "Ezequias", "Josias"], correctAnswer: "Salomão", difficulty: "facil" }
  ],
  "2 Reis": [
    { question: "Qual profeta foi levado ao céu em um redemoinho?", options: ["Eliseu", "Elias", "Isaías", "Jeremias"], correctAnswer: "Elias", difficulty: "facil" }
  ],
  "1 Crônicas": [
    { question: "A genealogia de 1 Crônicas começa com qual personagem?", options: ["Abraão", "Adão", "Davi", "Noé"], correctAnswer: "Adão", difficulty: "dificil" }
  ],
  "2 Crônicas": [
    { question: "Qual rei de Judá foi curado e teve 15 anos acrescentados à sua vida?", options: ["Josias", "Ezequias", "Manassés", "Asa"], correctAnswer: "Ezequias", difficulty: "medio" }
  ],
  "Esdras": [
    { question: "Qual rei persa permitiu que os judeus voltassem a Jerusalém?", options: ["Ciro", "Dario", "Artaxerxes", "Xerxes"], correctAnswer: "Ciro", difficulty: "medio" }
  ],
  "Neemias": [
    { question: "Qual era a profissão de Neemias antes de reconstruir os muros?", options: ["Sacerdote", "Copeiro do rei", "Escriba", "Soldado"], correctAnswer: "Copeiro do rei", difficulty: "facil" }
  ],
  "Ester": [
    { question: "Qual era o nome hebraico da rainha Ester?", options: ["Hadassa", "Rute", "Miriã", "Débora"], correctAnswer: "Hadassa", difficulty: "medio" }
  ],
  "Jó": [
    { question: "O que Jó perdeu em um único dia?", options: ["Sua esposa", "Sua saúde", "Seus filhos e bens", "Sua fé"], correctAnswer: "Seus filhos e bens", difficulty: "facil" }
  ],
  "Salmos": [
    { question: "Quem é o autor mais frequente dos Salmos?", options: ["Salomão", "Davi", "Asafe", "Moisés"], correctAnswer: "Davi", difficulty: "facil" }
  ],
  "Provérbios": [
    { question: "Qual é o princípio da sabedoria segundo Provérbios?", options: ["O amor", "O temor do Senhor", "A inteligência", "A riqueza"], correctAnswer: "O temor do Senhor", difficulty: "facil" }
  ],
  "Eclesiastes": [
    { question: "Qual palavra é frequentemente repetida em Eclesiastes?", options: ["Amor", "Vaidade", "Paz", "Guerra"], correctAnswer: "Vaidade", difficulty: "medio" }
  ],
  "Cânticos": [
    { question: "A quem é atribuída a autoria de Cânticos?", options: ["Davi", "Salomão", "Asafe", "Esdras"], correctAnswer: "Salomão", difficulty: "facil" }
  ],
  "Isaías": [
    { question: "Qual profeta previu que o Messias nasceria de uma virgem?", options: ["Jeremias", "Ezequiel", "Isaías", "Daniel"], correctAnswer: "Isaías", difficulty: "facil" }
  ],
  "Jeremias": [
    { question: "Jeremias é conhecido como o profeta...", options: ["Chorão", "Guerreiro", "Sábio", "Rei"], correctAnswer: "Chorão", difficulty: "facil" }
  ],
  "Lamentações": [
    { question: "Lamentações chora a destruição de qual cidade?", options: ["Babilônia", "Jerusalém", "Nínive", "Samaria"], correctAnswer: "Jerusalém", difficulty: "facil" }
  ],
  "Ezequiel": [
    { question: "Ezequiel teve uma visão de um vale cheio de quê?", options: ["Água", "Ossos secos", "Flores", "Ouro"], correctAnswer: "Ossos secos", difficulty: "facil" }
  ],
  "Daniel": [
    { question: "Quem foi lançado na cova dos leões?", options: ["Sadraque", "Mesaque", "Abede-Nego", "Daniel"], correctAnswer: "Daniel", difficulty: "facil" }
  ],
  "Oséias": [
    { question: "Deus mandou Oséias casar-se com uma mulher de qual tipo?", options: ["Prostituta", "Princesa", "Sacerdotisa", "Viúva"], correctAnswer: "Prostituta", difficulty: "medio" }
  ],
  "Joel": [
    { question: "Joel profetizou sobre uma praga de quê?", options: ["Rãs", "Gafanhotos", "Moscas", "Piolhos"], correctAnswer: "Gafanhotos", difficulty: "facil" }
  ],
  "Amós": [
    { question: "Qual era a profissão de Amós antes de ser profeta?", options: ["Sacerdote", "Rei", "Pastor de ovelhas", "Pescador"], correctAnswer: "Pastor de ovelhas", difficulty: "medio" }
  ],
  "Obadias": [
    { question: "Obadias profetizou contra qual nação?", options: ["Edom", "Egito", "Babilônia", "Assíria"], correctAnswer: "Edom", difficulty: "dificil" }
  ],
  "Jonas": [
    { question: "Para qual cidade Deus mandou Jonas pregar?", options: ["Társis", "Nínive", "Jerusalém", "Babilônia"], correctAnswer: "Nínive", difficulty: "facil" }
  ],
  "Miquéias": [
    { question: "Miquéias profetizou que o Messias nasceria em qual cidade?", options: ["Nazaré", "Jerusalém", "Belém", "Cafarnaum"], correctAnswer: "Belém", difficulty: "medio" }
  ],
  "Naum": [
    { question: "Naum profetizou a destruição de qual cidade?", options: ["Jerusalém", "Nínive", "Babilônia", "Tiro"], correctAnswer: "Nínive", difficulty: "dificil" }
  ],
  "Habacuque": [
    { question: "Qual frase famosa está em Habacuque 2:4?", options: ["O Senhor é meu pastor", "O justo viverá pela fé", "No princípio criou Deus", "Deus é amor"], correctAnswer: "O justo viverá pela fé", difficulty: "medio" }
  ],
  "Sofonias": [
    { question: "Sofonias profetizou durante o reinado de qual rei de Judá?", options: ["Davi", "Josias", "Ezequias", "Manassés"], correctAnswer: "Josias", difficulty: "dificil" }
  ],
  "Ageu": [
    { question: "Ageu encorajou o povo a reconstruir o quê?", options: ["Os muros", "O templo", "O palácio", "O altar"], correctAnswer: "O templo", difficulty: "medio" }
  ],
  "Zacarias": [
    { question: "Zacarias teve visões noturnas. Quantas foram?", options: ["7", "8", "10", "12"], correctAnswer: "8", difficulty: "dificil" }
  ],
  "Malaquias": [
    { question: "Qual profeta fala sobre trazer os dízimos à casa do tesouro?", options: ["Malaquias", "Ageu", "Zacarias", "Isaías"], correctAnswer: "Malaquias", difficulty: "facil" }
  ],
  "Mateus": [
    { question: "Qual era a profissão de Mateus antes de seguir Jesus?", options: ["Pescador", "Cobrador de impostos", "Médico", "Carpinteiro"], correctAnswer: "Cobrador de impostos", difficulty: "facil" }
  ],
  "Marcos": [
    { question: "O Evangelho de Marcos é frequentemente associado a qual apóstolo?", options: ["Pedro", "Paulo", "João", "Tiago"], correctAnswer: "Pedro", difficulty: "dificil" }
  ],
  "Lucas": [
    { question: "Qual era a profissão de Lucas?", options: ["Pescador", "Médico", "Cobrador de impostos", "Tenda"], correctAnswer: "Médico", difficulty: "facil" }
  ],
  "João": [
    { question: "Como João se refere a si mesmo em seu evangelho?", options: ["O apóstolo amado", "O filho do trovão", "O discípulo que Jesus amava", "O menor dos apóstolos"], correctAnswer: "O discípulo que Jesus amava", difficulty: "facil" }
  ],
  "Atos dos Apóstolos": [
    { question: "Quem escreveu o livro de Atos?", options: ["Paulo", "Pedro", "Lucas", "João"], correctAnswer: "Lucas", difficulty: "medio" }
  ],
  "Romanos": [
    { question: "Em Romanos, Paulo diz que o salário do pecado é a...", options: ["Morte", "Vida", "Dor", "Tristeza"], correctAnswer: "Morte", difficulty: "facil" }
  ],
  "1 Coríntios": [
    { question: "Qual capítulo de 1 Coríntios é conhecido como o 'capítulo do amor'?", options: ["11", "12", "13", "15"], correctAnswer: "13", difficulty: "facil" }
  ],
  "2 Coríntios": [
    { question: "Paulo fala sobre um 'espinho na carne' em qual carta?", options: ["Gálatas", "1 Coríntios", "2 Coríntios", "Romanos"], correctAnswer: "2 Coríntios", difficulty: "medio" }
  ],
  "Gálatas": [
    { question: "Onde Paulo lista o 'fruto do Espírito'?", options: ["Romanos 8", "Gálatas 5", "Efésios 2", "Filipenses 4"], correctAnswer: "Gálatas 5", difficulty: "medio" }
  ],
  "Efésios": [
    { question: "Em Efésios 6, Paulo descreve a...", options: ["Armadura de Deus", "Ceia do Senhor", "Ressurreição", "Criação"], correctAnswer: "Armadura de Deus", difficulty: "facil" }
  ],
  "Filipenses": [
    { question: "Qual carta Paulo escreveu enquanto estava na prisão, focando na alegria?", options: ["Romanos", "Gálatas", "Filipenses", "Tessalonicenses"], correctAnswer: "Filipenses", difficulty: "medio" }
  ],
  "Colossenses": [
    { question: "Colossenses destaca a supremacia de quem?", options: ["Paulo", "Cristo", "Pedro", "A Igreja"], correctAnswer: "Cristo", difficulty: "medio" }
  ],
  "1 Tessalonicenses": [
    { question: "Qual é um dos temas principais de 1 e 2 Tessalonicenses?", options: ["O dízimo", "A volta de Cristo", "A circuncisão", "A lei de Moisés"], correctAnswer: "A volta de Cristo", difficulty: "medio" }
  ],
  "2 Tessalonicenses": [
    { question: "Paulo adverte sobre o 'homem do pecado' em qual carta?", options: ["1 Timóteo", "2 Tessalonicenses", "Tito", "Filemom"], correctAnswer: "2 Tessalonicenses", difficulty: "dificil" }
  ],
  "1 Timóteo": [
    { question: "A quem Paulo chama de 'verdadeiro filho na fé'?", options: ["Tito", "Timóteo", "Lucas", "Marcos"], correctAnswer: "Timóteo", difficulty: "facil" }
  ],
  "2 Timóteo": [
    { question: "Qual é considerada a última carta escrita por Paulo?", options: ["Romanos", "2 Timóteo", "Hebreus", "Tito"], correctAnswer: "2 Timóteo", difficulty: "medio" }
  ],
  "Tito": [
    { question: "Onde Tito estava servindo quando Paulo lhe escreveu?", options: ["Creta", "Éfeso", "Roma", "Corinto"], correctAnswer: "Creta", difficulty: "dificil" }
  ],
  "Filemom": [
    { question: "Sobre qual escravo fugitivo Paulo escreve a Filemom?", options: ["Onésimo", "Epafras", "Tíquico", "Apolo"], correctAnswer: "Onésimo", difficulty: "medio" }
  ],
  "Hebreus": [
    { question: "Qual capítulo de Hebreus é conhecido como a 'galeria dos heróis da fé'?", options: ["10", "11", "12", "13"], correctAnswer: "11", difficulty: "facil" }
  ],
  "Tiago": [
    { question: "Tiago diz que a fé sem obras é...", options: ["Pequena", "Morta", "Fraca", "Inútil"], correctAnswer: "Morta", difficulty: "facil" }
  ],
  "1 Pedro": [
    { question: "Pedro escreve para encorajar os cristãos que estavam enfrentando...", options: ["Riqueza", "Perseguição", "Fome", "Falsos mestres"], correctAnswer: "Perseguição", difficulty: "medio" }
  ],
  "2 Pedro": [
    { question: "2 Pedro alerta principalmente contra...", options: ["Falsos mestres", "Idolatria", "Imoralidade", "Preguiça"], correctAnswer: "Falsos mestres", difficulty: "medio" }
  ],
  "1 João": [
    { question: "Qual frase famosa está em 1 João 4:8?", options: ["Deus é luz", "Deus é amor", "Deus é espírito", "Deus é fogo"], correctAnswer: "Deus é amor", difficulty: "facil" }
  ],
  "2 João": [
    { question: "A quem 2 João é endereçada?", options: ["A Gaio", "À senhora eleita", "Aos presbíteros", "Aos diáconos"], correctAnswer: "À senhora eleita", difficulty: "dificil" }
  ],
  "3 João": [
    { question: "A quem 3 João é endereçada?", options: ["A Gaio", "A Diótrefes", "A Demétrio", "A Paulo"], correctAnswer: "A Gaio", difficulty: "dificil" }
  ],
  "Judas": [
    { question: "Judas (o autor da carta) era irmão de quem?", options: ["Pedro", "João", "Tiago", "Paulo"], correctAnswer: "Tiago", difficulty: "dificil" }
  ],
  "Apocalipse": [
    { question: "Onde João estava exilado quando escreveu o Apocalipse?", options: ["Roma", "Patmos", "Éfeso", "Jerusalém"], correctAnswer: "Patmos", difficulty: "facil" }
  ]
};

// Função para obter uma pergunta aleatória de um livro
export const getRandomQuestionForBook = (bookName: string): Question => {
  const questions = panoramaQuestions[bookName];
  if (!questions || questions.length === 0) {
    // Fallback genérico se não houver pergunta (não deve acontecer com o banco preenchido)
    return {
      question: `Pergunta genérica sobre ${bookName}?`,
      options: ["A", "B", "C", "D"],
      correctAnswer: "A",
      difficulty: "facil"
    };
  }
  const randomIndex = Math.floor(Math.random() * questions.length);
  // Shuffle options
  const question = { ...questions[randomIndex] };
  question.options = [...question.options].sort(() => Math.random() - 0.5);
  return question;
};
