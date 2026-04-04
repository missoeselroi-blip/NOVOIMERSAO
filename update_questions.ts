import fs from 'fs';

const file = 'src/data/questions.ts';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  {
    id: 1,
    text: "Quantas vezes o profeta Daniel orava por dia?",
    options: ["1 vez", "2 vezes", "3 vezes", "7 vezes"],
    correctAnswer: 2,
    difficulty: "medium",
    testament: "old"
  },
  {
    id: 2,
    text: "Qual profeta previu que o Messias nasceria em Belém?",
    options: ["Isaías", "Miqueias", "Jeremias", "Daniel"],
    correctAnswer: 1,
    difficulty: "hard",
    testament: "old"
  },
  {
    id: 3,
    text: "Qual o parentesco Jesus tinha com João Batista?",
    options: ["Irmãos", "Primos", "Tio e sobrinho", "Não tinham parentesco"],
    correctAnswer: 1,
    difficulty: "medium",
    testament: "new"
  },
  {
    id: 8,
    text: "Para qual cidade Deus mandou Jonas pregar antes dele fugir para Társis?",
    options: ["Babilônia", "Nínive", "Jericó", "Damasco"],
    correctAnswer: 1,
    difficulty: "medium",
    testament: "old"
  },
  {
    id: 10,
    text: "Qual era o nome original da esposa de Abraão antes de Deus mudá-lo?",
    options: ["Sarai", "Milca", "Rebeca", "Agar"],
    correctAnswer: 0,
    difficulty: "medium",
    testament: "old"
  },
  {
    id: 11,
    text: "Qual apóstolo foi repreendido por Paulo em Antioquia por causa da circuncisão?",
    options: ["João", "Tiago", "Pedro", "Barnabé"],
    correctAnswer: 2,
    difficulty: "hard",
    testament: "new"
  },
  {
    id: 15,
    text: "Com quantos anos Matusalém morreu?",
    options: ["930", "969", "950", "912"],
    correctAnswer: 1,
    difficulty: "hard",
    testament: "old"
  },
  {
    id: 17,
    text: "De qual cidade era o gigante Golias?",
    options: ["Asdode", "Asquelom", "Ecrom", "Gate"],
    correctAnswer: 3,
    difficulty: "hard",
    testament: "old"
  },
  {
    id: 19,
    text: "Quanto tempo Moisés ficou no Monte Sinai para receber as tábuas da lei?",
    options: ["7 dias e 7 noites", "40 dias e 40 noites", "12 dias e 12 noites", "3 dias e 3 noites"],
    correctAnswer: 1,
    difficulty: "medium",
    testament: "old"
  },
  {
    id: 20,
    text: "Em qual cidade Jesus realizou seu primeiro milagre?",
    options: ["Nazaré", "Cafarnaum", "Caná da Galileia", "Jerusalém"],
    correctAnswer: 2,
    difficulty: "medium",
    testament: "new"
  },
  {
    id: 22,
    text: "O que significa o nome Getsêmani?",
    options: ["Lugar de caveira", "Prensa de azeite", "Casa do pão", "Aldeia do consolo"],
    correctAnswer: 1,
    difficulty: "hard",
    testament: "new"
  },
  {
    id: 24,
    text: "Qual era o nome do faraó do Êxodo segundo a tradição mais aceita?",
    options: ["Tutancâmon", "Ramsés II", "Amenófis III", "Tutmés III"],
    correctAnswer: 1,
    difficulty: "hard",
    testament: "old"
  },
  {
    id: 28,
    text: "Qual anjo apareceu a Zacarias para anunciar o nascimento de João Batista?",
    options: ["Miguel", "Gabriel", "Rafael", "Uriel"],
    correctAnswer: 1,
    difficulty: "medium",
    testament: "new"
  },
  {
    id: 29,
    text: "Quais foram os três discípulos que presenciaram a Transfiguração de Jesus?",
    options: ["Pedro, Tiago e João", "Pedro, André e Filipe", "Tiago, João e Mateus", "Pedro, Tomé e Judas"],
    correctAnswer: 0,
    difficulty: "medium",
    testament: "new"
  },
  {
    id: 30,
    text: "Qual era o nome do pai do apóstolo Pedro?",
    options: ["Zebedeu", "Jonas (ou João)", "Alfeu", "Zacarias"],
    correctAnswer: 1,
    difficulty: "hard",
    testament: "new"
  },
  {
    id: 32,
    text: "Qual era o nome do servo do sumo sacerdote que teve a orelha cortada por Pedro?",
    options: ["Malco", "Caifás", "Ananias", "Barrabás"],
    correctAnswer: 0,
    difficulty: "hard",
    testament: "new"
  },
  {
    id: 33,
    text: "Quais eram os nomes dos dois rios principais que passavam pelo Jardim do Éden?",
    options: ["Nilo e Jordão", "Tigre e Eufrates", "Gihon e Pison", "Tigre e Nilo"],
    correctAnswer: 1,
    difficulty: "hard",
    testament: "old"
  },
  {
    id: 34,
    text: "Quais eram os nomes dos três filhos de Noé?",
    options: ["Sem, Cam e Jafé", "Caim, Abel e Sete", "Abraão, Isaque e Jacó", "Rúben, Simeão e Levi"],
    correctAnswer: 0,
    difficulty: "medium",
    testament: "old"
  },
  {
    id: 35,
    text: "Qual rainha viajou de longe para testar a sabedoria de Salomão com enigmas?",
    options: ["Rainha de Sabá", "Rainha de Ninive", "Rainha de Tiro", "Rainha de Babilônia"],
    correctAnswer: 0,
    difficulty: "medium",
    testament: "old"
  },
  {
    id: 36,
    text: "Quantas vezes Paulo sofreu naufrágios?",
    options: ["1 vez", "2 vezes", "3 vezes", "4 vezes"],
    correctAnswer: 2,
    difficulty: "hard",
    testament: "new"
  },
  {
    id: 37,
    text: "Qual era a profissão de Mateus antes de ser chamado por Jesus?",
    options: ["Pescador", "Carpinteiro", "Cobrador de impostos (Publicano)", "Zelote"],
    correctAnswer: 2,
    difficulty: "medium",
    testament: "new"
  },
  {
    id: 40,
    text: "Qual livro do Novo Testamento foi escrito por um médico?",
    options: ["Atos dos Apóstolos", "Romanos", "Hebreus", "Apocalipse"],
    correctAnswer: 0,
    difficulty: "medium",
    testament: "new"
  },
  {
    id: 47,
    text: "O que significa a palavra 'Gólgota'?",
    options: ["Lugar de paz", "Lugar da caveira", "Monte santo", "Vale da morte"],
    correctAnswer: 1,
    difficulty: "medium",
    testament: "new"
  },
  {
    id: 48,
    text: "De qual tribo de Israel era o rei Saul?",
    options: ["Judá", "Efraim", "Benjamim", "Levi"],
    correctAnswer: 2,
    difficulty: "hard",
    testament: "old"
  },
  {
    id: 50,
    text: "Em qual rio o general sírio Naamã mergulhou para ser curado da lepra?",
    options: ["Nilo", "Tigre", "Eufrates", "Jordão"],
    correctAnswer: 3,
    difficulty: "medium",
    testament: "old"
  }
];

// Parse the file content as a string
let questionsMatch = content.match(/export const QUESTIONS: Question\[\] = (\[[\s\S]*?\]);/);
if (questionsMatch) {
  let questions = JSON.parse(questionsMatch[1]);
  
  for (const rep of replacements) {
    const index = questions.findIndex((q: any) => q.id === rep.id);
    if (index !== -1) {
      questions[index] = rep;
    }
  }
  
  const newContent = content.replace(questionsMatch[1], JSON.stringify(questions, null, 2));
  fs.writeFileSync(file, newContent);
  console.log('Successfully updated questions');
} else {
  console.log('Could not find QUESTIONS array');
}
