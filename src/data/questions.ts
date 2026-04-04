export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'challenge';
  testament: 'old' | 'new';
}

export const QUESTIONS: Question[] = [
  {
    "id": 1,
    "text": "Quem foi o primeiro homem criado por Deus?",
    "options": ["Noé", "Abraão", "Adão", "Moisés"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "old"
  },
  {
    "id": 2,
    "text": "Em qual cidade Jesus nasceu?",
    "options": ["Nazaré", "Jerusalém", "Belém", "Jericó"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "new"
  },
  {
    "id": 3,
    "text": "Quantos dias e noites choveu durante o Dilúvio?",
    "options": ["7 dias", "40 dias", "100 dias", "12 dias"],
    "correctAnswer": 1,
    "difficulty": "easy",
    "testament": "old"
  },
  {
    "id": 4,
    "text": "Qual era a profissão de Davi antes de ser rei?",
    "options": ["Carpinteiro", "Pescador", "Pastor de ovelhas", "Ferreiro"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "old"
  },
  {
    "id": 5,
    "text": "Qual apóstolo escreveu a maioria das epístolas no Novo Testamento?",
    "options": ["Pedro", "João", "Tiago", "Paulo"],
    "correctAnswer": 3,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 6,
    "text": "Quem foi o sucessor de Moisés na liderança de Israel?",
    "options": ["Calebe", "Josué", "Arão", "Gideão"],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 7,
    "text": "Qual é o livro mais curto do Novo Testamento?",
    "options": ["Judas", "Filemom", "2 João", "3 João"],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "new"
  },
  {
    "id": 8,
    "text": "Qual profeta foi engolido por um grande peixe?",
    "options": ["Elias", "Isaías", "Jonas", "Jeremias"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "old"
  },
  {
    "id": 9,
    "text": "No Apocalipse, qual é o número das tribos de Israel seladas?",
    "options": ["12.000", "144.000", "7.000", "10.000"],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 10,
    "text": "Qual era o nome da esposa de Abraão?",
    "options": ["Rebeca", "Raquel", "Sara", "Lia"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "old"
  },
  {
    "id": 11,
    "text": "Quem foi o apóstolo que negou Jesus três vezes?",
    "options": ["João", "Tiago", "Judas", "Pedro"],
    "correctAnswer": 3,
    "difficulty": "easy",
    "testament": "new"
  },
  {
    "id": 12,
    "text": "Qual foi a primeira praga do Egito?",
    "options": ["Rãs", "Gafanhotos", "Água em sangue", "Trevas"],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 13,
    "text": "Quem subiu ao céu em um redemoinho com um carro de fogo?",
    "options": ["Enoque", "Elias", "Moisés", "Eliseu"],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 14,
    "text": "Qual é o 'Fruto do Espírito' mencionado em Gálatas?",
    "options": ["Amor, alegria, paz...", "Fé, esperança, caridade", "Sabedoria, entendimento...", "Poder, riqueza, glória"],
    "correctAnswer": 0,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 15,
    "text": "Quem foi o homem mais velho mencionado na Bíblia?",
    "options": ["Noé", "Adão", "Matusalém", "Enoque"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "old"
  },
  {
    "id": 16,
    "text": "Em qual ilha João estava quando recebeu a revelação do Apocalipse?",
    "options": ["Creta", "Patmos", "Chipre", "Malta"],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 17,
    "text": "Qual era o nome do gigante que Davi derrotou?",
    "options": ["Sansão", "Golias", "Saul", "Balaão"],
    "correctAnswer": 1,
    "difficulty": "easy",
    "testament": "old"
  },
  {
    "id": 18,
    "text": "Quem foi a mulher que ungiu os pés de Jesus com perfume caro?",
    "options": ["Maria Madalena", "Marta", "Maria (irmã de Lázaro)", "Isabel"],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 19,
    "text": "Qual o nome do monte onde Moisés recebeu os Dez Mandamentos?",
    "options": ["Monte Carmelo", "Monte Sinai", "Monte Sião", "Monte das Oliveiras"],
    "correctAnswer": 1,
    "difficulty": "easy",
    "testament": "old"
  },
  {
    "id": 20,
    "text": "Qual foi o primeiro milagre de Jesus?",
    "options": ["Multiplicação dos pães", "Andar sobre as águas", "Curar um cego", "Transformar água em vinho"],
    "correctAnswer": 3,
    "difficulty": "easy",
    "testament": "new"
  },
  {
    "id": 21,
    "text": "Quem foi o profeta que desafiou os profetas de Baal no Monte Carmelo?",
    "options": ["Eliseu", "Isaías", "Elias", "Jeremias"],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 22,
    "text": "Qual era o nome do jardim onde Jesus orou antes de ser preso?",
    "options": ["Éden", "Getsêmani", "Gólgota", "Calvário"],
    "correctAnswer": 1,
    "difficulty": "easy",
    "testament": "new"
  },
  {
    "id": 23,
    "text": "Quem foi a rainha que visitou Salomão para testar sua sabedoria?",
    "options": ["Rainha de Sabá", "Rainha Ester", "Jezabel", "Atalia"],
    "correctAnswer": 0,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 24,
    "text": "Qual o nome do mar que Moisés abriu para o povo de Israel passar?",
    "options": ["Mar Morto", "Mar da Galileia", "Mar Vermelho", "Mar Mediterrâneo"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "old"
  },
  {
    "id": 25,
    "text": "Quem foi o autor do livro de Atos dos Apóstolos?",
    "options": ["Paulo", "Pedro", "João", "Lucas"],
    "correctAnswer": 3,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 26,
    "text": "Qual o nome do filho de Abraão com a serva Agar?",
    "options": ["Isaque", "Ismael", "Esaú", "Jacó"],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 27,
    "text": "Quem foi o rei que mandou jogar Daniel na cova dos leões?",
    "options": ["Nabucodonosor", "Ciro", "Dario", "Belsazar"],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "old"
  },
  {
    "id": 28,
    "text": "Qual o nome do anjo que anunciou o nascimento de Jesus a Maria?",
    "options": ["Miguel", "Rafael", "Gabriel", "Uriel"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "new"
  },
  {
    "id": 29,
    "text": "Quantos discípulos Jesus escolheu inicialmente?",
    "options": ["7", "10", "12", "70"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "new"
  },
  {
    "id": 30,
    "text": "Qual era a profissão de Pedro antes de seguir Jesus?",
    "options": ["Carpinteiro", "Cobrador de impostos", "Pescador", "Pastor de ovelhas"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "new"
  },
  {
    "id": 31,
    "text": "Qual livro da Bíblia tem mais capítulos?",
    "options": ["Gênesis", "Isaías", "Salmos", "Apocalipse"],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 32,
    "text": "Quem traiu Jesus por 30 moedas de prata?",
    "options": ["Pedro", "Tomé", "Judas Iscariotes", "João"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "new"
  },
  {
    "id": 33,
    "text": "Qual era o nome do jardim onde Adão e Eva viveram?",
    "options": ["Getsêmani", "Éden", "Babilônia", "Sinai"],
    "correctAnswer": 1,
    "difficulty": "easy",
    "testament": "old"
  },
  {
    "id": 34,
    "text": "Quem construiu a arca?",
    "options": ["Moisés", "Abraão", "Noé", "Ló"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "old"
  },
  {
    "id": 35,
    "text": "Quem foi o homem mais sábio do mundo segundo a Bíblia?",
    "options": ["Davi", "Salomão", "Moisés", "Jesus"],
    "correctAnswer": 1,
    "difficulty": "easy",
    "testament": "old"
  },
  {
    "id": 36,
    "text": "Qual o nome da mãe de Jesus?",
    "options": ["Isabel", "Marta", "Maria", "Madalena"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "new"
  },
  {
    "id": 37,
    "text": "Quem batizou Jesus no rio Jordão?",
    "options": ["Pedro", "João Batista", "Tiago", "André"],
    "correctAnswer": 1,
    "difficulty": "easy",
    "testament": "new"
  },
  {
    "id": 38,
    "text": "Quantas pragas foram enviadas ao Egito?",
    "options": ["7", "10", "12", "40"],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 39,
    "text": "Quem interpretou os sonhos do Faraó?",
    "options": ["Daniel", "José", "Moisés", "Jacó"],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 40,
    "text": "Qual o último livro da Bíblia?",
    "options": ["Malaquias", "Judas", "Apocalipse", "Hebreus"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "new"
  },
  {
    "id": 41,
    "text": "Quem sobreviveu à fornalha de fogo ardente?",
    "options": ["Daniel", "Sadraque, Mesaque e Abede-Nego", "Elias e Eliseu", "Josué e Calebe"],
    "correctAnswer": 1,
    "difficulty": "hard",
    "testament": "old"
  },
  {
    "id": 42,
    "text": "Quem foi o pai de João Batista?",
    "options": ["José", "Zacarias", "Simeão", "Nicodemos"],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 43,
    "text": "Qual o nome da esposa de Isaque?",
    "options": ["Raquel", "Lia", "Rebeca", "Sara"],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 44,
    "text": "Quem foi o profeta que ungiu Saul e Davi?",
    "options": ["Elias", "Eliseu", "Samuel", "Natã"],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 45,
    "text": "Qual apóstolo duvidou da ressurreição de Jesus até ver suas feridas?",
    "options": ["Pedro", "João", "Tomé", "Filipe"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "new"
  },
  {
    "id": 46,
    "text": "Quem era o irmão mais velho de Moisés?",
    "options": ["Arão", "Miriã", "Josué", "Calebe"],
    "correctAnswer": 0,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 47,
    "text": "Qual o nome do monte onde Jesus foi crucificado?",
    "options": ["Sinai", "Carmelo", "Gólgota", "Sião"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "new"
  },
  {
    "id": 48,
    "text": "Quem foi o primeiro rei de Israel?",
    "options": ["Davi", "Salomão", "Saul", "Samuel"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "old"
  },
  {
    "id": 49,
    "text": "Qual o nome da mulher que escondeu os espiões israelitas em Jericó?",
    "options": ["Rute", "Ester", "Raabe", "Débora"],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 50,
    "text": "Qual o nome do rio onde Jesus foi batizado?",
    "options": ["Nilo", "Tigre", "Eufrates", "Jordão"],
    "correctAnswer": 3,
    "difficulty": "easy",
    "testament": "new"
  },
  {
    "id": 51,
    "text": "Quem foi o primeiro mártir cristão?",
    "options": ["Pedro", "Paulo", "Estêvão", "Tiago"],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 52,
    "text": "Qual o nome da sogra de Rute?",
    "options": ["Orfa", "Noemi", "Ana", "Isabel"],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 53,
    "text": "Quem vendeu seu direito de primogenitura por um prato de lentilhas?",
    "options": ["Jacó", "Esaú", "José", "Rúben"],
    "correctAnswer": 1,
    "difficulty": "easy",
    "testament": "old"
  },
  {
    "id": 54,
    "text": "Qual o nome do pai de Davi?",
    "options": ["Saul", "Jessé", "Salomão", "Samuel"],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 55,
    "text": "Quem foi o cobrador de impostos que subiu em uma árvore para ver Jesus?",
    "options": ["Mateus", "Zaqueu", "Lucas", "Nicodemos"],
    "correctAnswer": 1,
    "difficulty": "easy",
    "testament": "new"
  },
  {
    "id": 56,
    "text": "Qual o nome da cidade cujos muros caíram após os israelitas marcharem ao redor?",
    "options": ["Jericó", "Jerusalém", "Babilônia", "Nínive"],
    "correctAnswer": 0,
    "difficulty": "easy",
    "testament": "old"
  },
  {
    "id": 57,
    "text": "Quem teve seu cabelo cortado por Dalila, perdendo sua força?",
    "options": ["Davi", "Sansão", "Gideão", "Saul"],
    "correctAnswer": 1,
    "difficulty": "easy",
    "testament": "old"
  },
  {
    "id": 58,
    "text": "Qual o nome do irmão de Marta e Maria que Jesus ressuscitou?",
    "options": ["Lázaro", "João", "Pedro", "Tiago"],
    "correctAnswer": 0,
    "difficulty": "easy",
    "testament": "new"
  },
  {
    "id": 59,
    "text": "Quem escreveu o livro de Provérbios?",
    "options": ["Davi", "Salomão", "Moisés", "Isaías"],
    "correctAnswer": 1,
    "difficulty": "easy",
    "testament": "old"
  },
  {
    "id": 60,
    "text": "Qual o nome do rei da Babilônia que ficou louco e comeu capim como os bois?",
    "options": ["Belsazar", "Dario", "Nabucodonosor", "Ciro"],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "old"
  },
  {
    "id": 61,
    "text": "Quem foi a esposa de Urias que mais tarde se casou com Davi?",
    "options": ["Mical", "Abigail", "Bate-Seba", "Bila"],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 62,
    "text": "Qual o nome do profeta que casou com a prostituta Gômer?",
    "options": ["Amós", "Oseias", "Joel", "Miqueias"],
    "correctAnswer": 1,
    "difficulty": "hard",
    "testament": "old"
  },
  {
    "id": 63,
    "text": "Quem foi o jovem que caiu da janela enquanto Paulo pregava?",
    "options": ["Timóteo", "Tito", "Êutico", "Silas"],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "new"
  },
  {
    "id": 64,
    "text": "Qual o nome da ilha onde Paulo naufragou?",
    "options": ["Creta", "Chipre", "Malta", "Patmos"],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "new"
  },
  {
    "id": 65,
    "text": "Quem foi a primeira mulher de Abraão?",
    "options": ["Agar", "Quetura", "Sara", "Rebeca"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "old"
  },
  {
    "id": 66,
    "text": "Qual o nome do filho da promessa de Abraão e Sara?",
    "options": ["Ismael", "Isaque", "Jacó", "Esaú"],
    "correctAnswer": 1,
    "difficulty": "easy",
    "testament": "old"
  },
  {
    "id": 67,
    "text": "Quem foi o profeta chorão?",
    "options": ["Isaías", "Jeremias", "Ezequiel", "Daniel"],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 68,
    "text": "Qual o nome do homem que ajudou Jesus a carregar a cruz?",
    "options": ["José de Arimateia", "Nicodemos", "Simão de Cirene", "Barrabás"],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 69,
    "text": "Quem foi a juíza e profetisa que liderou Israel à vitória contra Sísera?",
    "options": ["Débora", "Jael", "Ester", "Rute"],
    "correctAnswer": 0,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 70,
    "text": "Qual o nome do lugar onde Deus confundiu as línguas dos homens?",
    "options": ["Sodoma", "Gomorra", "Babel", "Nínive"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "old"
  },
  {
    "id": 71,
    "text": "Quem foi o sumo sacerdote que julgou Jesus?",
    "options": ["Anás", "Caifás", "Pilatos", "Herodes"],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 72,
    "text": "Qual o nome da mulher que tocou nas vestes de Jesus e foi curada?",
    "options": ["Maria Madalena", "Marta", "A mulher do fluxo de sangue", "A mulher samaritana"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "new"
  },
  {
    "id": 73,
    "text": "Quem foi o profeta que viu um vale de ossos secos ganharem vida?",
    "options": ["Isaías", "Jeremias", "Ezequiel", "Daniel"],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 74,
    "text": "Qual o nome do rei que tentou matar o menino Jesus?",
    "options": ["Herodes", "César Augusto", "Pilatos", "Faraó"],
    "correctAnswer": 0,
    "difficulty": "easy",
    "testament": "new"
  },
  {
    "id": 75,
    "text": "Quem foi o apóstolo que substituiu Judas Iscariotes?",
    "options": ["Paulo", "Matias", "Barnabé", "Silas"],
    "correctAnswer": 1,
    "difficulty": "hard",
    "testament": "new"
  },
  {
    "id": 76,
    "text": "Qual o nome da cidade onde os discípulos foram chamados cristãos pela primeira vez?",
    "options": ["Jerusalém", "Roma", "Antioquia", "Éfeso"],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "new"
  },
  {
    "id": 77,
    "text": "Quem foi o marido de Maria, mãe de Jesus?",
    "options": ["Zacarias", "José", "Joaquim", "Simeão"],
    "correctAnswer": 1,
    "difficulty": "easy",
    "testament": "new"
  },
  {
    "id": 78,
    "text": "Qual o nome do profeta que repreendeu Davi por seu pecado com Bate-Seba?",
    "options": ["Samuel", "Natã", "Gade", "Elias"],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 79,
    "text": "Quem foi a mulher que orou silenciosamente no templo e foi confundida com uma bêbada?",
    "options": ["Isabel", "Ana", "Maria", "Marta"],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 80,
    "text": "Qual o nome do filho de Davi que se rebelou contra ele?",
    "options": ["Salomão", "Amnom", "Absalão", "Adonias"],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 81,
    "text": "Quem foi o homem rico de Arimateia que pediu o corpo de Jesus?",
    "options": ["Nicodemos", "José de Arimateia", "Simão", "Lázaro"],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 82,
    "text": "Qual o nome do lugar onde Jesus ascendeu ao céu?",
    "options": ["Monte Sinai", "Monte das Oliveiras", "Monte Carmelo", "Monte Sião"],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 83,
    "text": "Quem foi a rainha que salvou os judeus do extermínio na Pérsia?",
    "options": ["Vasti", "Ester", "Rute", "Raabe"],
    "correctAnswer": 1,
    "difficulty": "easy",
    "testament": "old"
  },
  {
    "id": 84,
    "text": "Qual o nome do homem que foi curado da lepra após mergulhar 7 vezes no rio Jordão?",
    "options": ["Geazi", "Naamã", "Elias", "Eliseu"],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 85,
    "text": "Quem foi o profeta que sucedeu Elias?",
    "options": ["Isaías", "Jeremias", "Eliseu", "Oseias"],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 86,
    "text": "Qual o nome do governador romano que lavou as mãos no julgamento de Jesus?",
    "options": ["Herodes", "Pilatos", "Félix", "Festo"],
    "correctAnswer": 1,
    "difficulty": "easy",
    "testament": "new"
  },
  {
    "id": 87,
    "text": "Quem foi a vendedora de púrpura que se converteu em Filipos?",
    "options": ["Priscila", "Febe", "Lídia", "Dorcas"],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "new"
  },
  {
    "id": 88,
    "text": "Qual o nome do fariseu que foi encontrar Jesus à noite?",
    "options": ["Caifás", "Anás", "Nicodemos", "José de Arimateia"],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 89,
    "text": "Quem foi o sobrinho de Abraão que morou em Sodoma?",
    "options": ["Ismael", "Isaque", "Ló", "Esaú"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "old"
  },
  {
    "id": 90,
    "text": "Qual o nome do rei da Pérsia que permitiu a reconstrução do templo em Jerusalém?",
    "options": ["Dario", "Artaxerxes", "Ciro", "Xerxes"],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "old"
  },
  {
    "id": 91,
    "text": "Quem foi o homem que encontrou um tesouro escondido no campo?",
    "options": ["O homem rico", "O homem da parábola", "O bom samaritano", "O filho pródigo"],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 92,
    "text": "Qual o nome do profeta que teve a visão de um trono celestial com serafins?",
    "options": ["Jeremias", "Ezequiel", "Isaías", "Daniel"],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "old"
  },
  {
    "id": 93,
    "text": "Quem foi o diácono que batizou o eunuco etíope?",
    "options": ["Estêvão", "Filipe", "Prócoro", "Timão"],
    "correctAnswer": 1,
    "difficulty": "hard",
    "testament": "new"
  },
  {
    "id": 94,
    "text": "Qual o nome do homem que caiu entre salteadores e foi ajudado por um samaritano?",
    "options": ["O homem rico", "O homem da parábola", "O publicano", "O fariseu"],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 95,
    "text": "Quem foi o rei que teve sua vida prolongada por 15 anos após orar?",
    "options": ["Davi", "Salomão", "Ezequias", "Josias"],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "old"
  },
  {
    "id": 96,
    "text": "Qual o nome do profeta que foi alimentado por corvos?",
    "options": ["Eliseu", "Elias", "Isaías", "Jeremias"],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 97,
    "text": "Quem foi o apóstolo que era conhecido como 'o discípulo amado'?",
    "options": ["Pedro", "Tiago", "João", "André"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "new"
  },
  {
    "id": 98,
    "text": "Qual o nome do homem que foi libertado em vez de Jesus na Páscoa?",
    "options": ["Dimas", "Gestas", "Barrabás", "Simão"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "new"
  },
  {
    "id": 99,
    "text": "Quem foi a mulher que teve 7 demônios expulsos por Jesus?",
    "options": ["Maria (mãe de Jesus)", "Marta", "Maria Madalena", "Joana"],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 100,
    "text": "Qual o nome do lugar onde Jesus transformou água em vinho?",
    "options": ["Jerusalém", "Nazaré", "Caná da Galileia", "Cafarnaum"],
    "correctAnswer": 2,
    "difficulty": "easy",
    "testament": "new"
  }
];
