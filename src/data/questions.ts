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
    "text": "Quantas vezes o profeta Daniel orava por dia?",
    "options": [
      "1 vez",
      "2 vezes",
      "3 vezes",
      "7 vezes"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 2,
    "text": "Qual profeta previu que o Messias nasceria em Belém?",
    "options": [
      "Isaías",
      "Miqueias",
      "Jeremias",
      "Daniel"
    ],
    "correctAnswer": 1,
    "difficulty": "hard",
    "testament": "old"
  },
  {
    "id": 3,
    "text": "Qual o parentesco Jesus tinha com João Batista?",
    "options": [
      "Irmãos",
      "Primos",
      "Tio e sobrinho",
      "Não tinham parentesco"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 4,
    "text": "Qual era o nome da esposa de Moisés?",
    "options": [
      "Miriã",
      "Zípora",
      "Raquel",
      "Lia"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 5,
    "text": "Qual apóstolo escreveu a maioria das epístolas no Novo Testamento?",
    "options": [
      "Pedro",
      "João",
      "Tiago",
      "Paulo"
    ],
    "correctAnswer": 3,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 6,
    "text": "Quem foi o sucessor de Moisés na liderança de Israel?",
    "options": [
      "Calebe",
      "Josué",
      "Arão",
      "Gideão"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 7,
    "text": "Qual é o livro mais curto do Novo Testamento?",
    "options": [
      "Judas",
      "Filemom",
      "2 João",
      "3 João"
    ],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "new"
  },
  {
    "id": 8,
    "text": "Para qual cidade Deus mandou Jonas pregar antes dele fugir para Társis?",
    "options": [
      "Babilônia",
      "Nínive",
      "Jericó",
      "Damasco"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 9,
    "text": "No Apocalipse, qual é o número das tribos de Israel seladas?",
    "options": [
      "12.000",
      "144.000",
      "7.000",
      "10.000"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 10,
    "text": "Qual era o nome original da esposa de Abraão antes de Deus mudá-lo?",
    "options": [
      "Sarai",
      "Milca",
      "Rebeca",
      "Agar"
    ],
    "correctAnswer": 0,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 11,
    "text": "Qual apóstolo foi repreendido por Paulo em Antioquia por causa da circuncisão?",
    "options": [
      "João",
      "Tiago",
      "Pedro",
      "Barnabé"
    ],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "new"
  },
  {
    "id": 12,
    "text": "Qual foi a primeira praga do Egito?",
    "options": [
      "Rãs",
      "Gafanhotos",
      "Água em sangue",
      "Trevas"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 13,
    "text": "Quem subiu ao céu em um redemoinho com um carro de fogo?",
    "options": [
      "Enoque",
      "Elias",
      "Moisés",
      "Eliseu"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 14,
    "text": "Qual é o 'Fruto do Espírito' mencionado em Gálatas?",
    "options": [
      "Amor, alegria, paz...",
      "Fé, esperança, caridade",
      "Sabedoria, entendimento...",
      "Poder, riqueza, glória"
    ],
    "correctAnswer": 0,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 15,
    "text": "Com quantos anos Matusalém morreu?",
    "options": [
      "930",
      "969",
      "950",
      "912"
    ],
    "correctAnswer": 1,
    "difficulty": "hard",
    "testament": "old"
  },
  {
    "id": 16,
    "text": "Em qual ilha João estava quando recebeu a revelação do Apocalipse?",
    "options": [
      "Creta",
      "Patmos",
      "Chipre",
      "Malta"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 17,
    "text": "De qual cidade era o gigante Golias?",
    "options": [
      "Asdode",
      "Asquelom",
      "Ecrom",
      "Gate"
    ],
    "correctAnswer": 3,
    "difficulty": "hard",
    "testament": "old"
  },
  {
    "id": 18,
    "text": "Quem foi a mulher que ungiu os pés de Jesus com perfume caro?",
    "options": [
      "Maria Madalena",
      "Marta",
      "Maria (irmã de Lázaro)",
      "Isabel"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 19,
    "text": "Quanto tempo Moisés ficou no Monte Sinai para receber as tábuas da lei?",
    "options": [
      "7 dias e 7 noites",
      "40 dias e 40 noites",
      "12 dias e 12 noites",
      "3 dias e 3 noites"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 20,
    "text": "Em qual cidade Jesus realizou seu primeiro milagre?",
    "options": [
      "Nazaré",
      "Cafarnaum",
      "Caná da Galileia",
      "Jerusalém"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 21,
    "text": "Quem foi o profeta que desafiou os profetas de Baal no Monte Carmelo?",
    "options": [
      "Eliseu",
      "Isaías",
      "Elias",
      "Jeremias"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 22,
    "text": "O que significa o nome Getsêmani?",
    "options": [
      "Lugar de caveira",
      "Prensa de azeite",
      "Casa do pão",
      "Aldeia do consolo"
    ],
    "correctAnswer": 1,
    "difficulty": "hard",
    "testament": "new"
  },
  {
    "id": 23,
    "text": "Quem foi a rainha que visitou Salomão para testar sua sabedoria?",
    "options": [
      "Rainha de Sabá",
      "Rainha Ester",
      "Jezabel",
      "Atalia"
    ],
    "correctAnswer": 0,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 24,
    "text": "Qual era o nome do faraó do Êxodo segundo a tradição mais aceita?",
    "options": [
      "Tutancâmon",
      "Ramsés II",
      "Amenófis III",
      "Tutmés III"
    ],
    "correctAnswer": 1,
    "difficulty": "hard",
    "testament": "old"
  },
  {
    "id": 25,
    "text": "Quem foi o autor do livro de Atos dos Apóstolos?",
    "options": [
      "Paulo",
      "Pedro",
      "João",
      "Lucas"
    ],
    "correctAnswer": 3,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 26,
    "text": "Qual o nome do filho de Abraão com a serva Agar?",
    "options": [
      "Isaque",
      "Ismael",
      "Esaú",
      "Jacó"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 27,
    "text": "Quem foi o rei que mandou jogar Daniel na cova dos leões?",
    "options": [
      "Nabucodonosor",
      "Ciro",
      "Dario",
      "Belsazar"
    ],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "old"
  },
  {
    "id": 28,
    "text": "Qual anjo apareceu a Zacarias para anunciar o nascimento de João Batista?",
    "options": [
      "Miguel",
      "Gabriel",
      "Rafael",
      "Uriel"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 29,
    "text": "Quais foram os três discípulos que presenciaram a Transfiguração de Jesus?",
    "options": [
      "Pedro, Tiago e João",
      "Pedro, André e Filipe",
      "Tiago, João e Mateus",
      "Pedro, Tomé e Judas"
    ],
    "correctAnswer": 0,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 30,
    "text": "Qual era o nome do pai do apóstolo Pedro?",
    "options": [
      "Zebedeu",
      "Jonas (ou João)",
      "Alfeu",
      "Zacarias"
    ],
    "correctAnswer": 1,
    "difficulty": "hard",
    "testament": "new"
  },
  {
    "id": 31,
    "text": "Qual livro da Bíblia tem mais capítulos?",
    "options": [
      "Gênesis",
      "Isaías",
      "Salmos",
      "Apocalipse"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 32,
    "text": "Qual era o nome do servo do sumo sacerdote que teve a orelha cortada por Pedro?",
    "options": [
      "Malco",
      "Caifás",
      "Ananias",
      "Barrabás"
    ],
    "correctAnswer": 0,
    "difficulty": "hard",
    "testament": "new"
  },
  {
    "id": 33,
    "text": "Quais eram os nomes dos dois rios principais que passavam pelo Jardim do Éden?",
    "options": [
      "Nilo e Jordão",
      "Tigre e Eufrates",
      "Gihon e Pison",
      "Tigre e Nilo"
    ],
    "correctAnswer": 1,
    "difficulty": "hard",
    "testament": "old"
  },
  {
    "id": 34,
    "text": "Quais eram os nomes dos três filhos de Noé?",
    "options": [
      "Sem, Cam e Jafé",
      "Caim, Abel e Sete",
      "Abraão, Isaque e Jacó",
      "Rúben, Simeão e Levi"
    ],
    "correctAnswer": 0,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 35,
    "text": "Qual rainha viajou de longe para testar a sabedoria de Salomão com enigmas?",
    "options": [
      "Rainha de Sabá",
      "Rainha de Ninive",
      "Rainha de Tiro",
      "Rainha de Babilônia"
    ],
    "correctAnswer": 0,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 36,
    "text": "Quantas vezes Paulo sofreu naufrágios?",
    "options": [
      "1 vez",
      "2 vezes",
      "3 vezes",
      "4 vezes"
    ],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "new"
  },
  {
    "id": 37,
    "text": "Qual era a profissão de Mateus antes de ser chamado por Jesus?",
    "options": [
      "Pescador",
      "Carpinteiro",
      "Cobrador de impostos (Publicano)",
      "Zelote"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 38,
    "text": "Quantas pragas foram enviadas ao Egito?",
    "options": [
      "7",
      "10",
      "12",
      "40"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 39,
    "text": "Quem interpretou os sonhos do Faraó?",
    "options": [
      "Daniel",
      "José",
      "Moisés",
      "Jacó"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 40,
    "text": "Qual livro do Novo Testamento foi escrito por um médico?",
    "options": [
      "Atos dos Apóstolos",
      "Romanos",
      "Hebreus",
      "Apocalipse"
    ],
    "correctAnswer": 0,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 41,
    "text": "Quem sobreviveu à fornalha de fogo ardente?",
    "options": [
      "Daniel",
      "Sadraque, Mesaque e Abede-Nego",
      "Elias e Eliseu",
      "Josué e Calebe"
    ],
    "correctAnswer": 1,
    "difficulty": "hard",
    "testament": "old"
  },
  {
    "id": 42,
    "text": "Quem foi o pai de João Batista?",
    "options": [
      "José",
      "Zacarias",
      "Simeão",
      "Nicodemos"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 43,
    "text": "Qual o nome da esposa de Isaque?",
    "options": [
      "Raquel",
      "Lia",
      "Rebeca",
      "Sara"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 44,
    "text": "Quem foi o profeta que ungiu Saul e Davi?",
    "options": [
      "Elias",
      "Eliseu",
      "Samuel",
      "Natã"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 45,
    "text": "Quem foi o rei de Israel que sucedeu a Salomão?",
    "options": [
      "Jeroboão",
      "Roboão",
      "Acabe",
      "Josias"
    ],
    "correctAnswer": 1,
    "difficulty": "hard",
    "testament": "old"
  },
  {
    "id": 46,
    "text": "Quem era o irmão mais velho de Moisés?",
    "options": [
      "Arão",
      "Miriã",
      "Josué",
      "Calebe"
    ],
    "correctAnswer": 0,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 47,
    "text": "O que significa a palavra 'Gólgota'?",
    "options": [
      "Lugar de paz",
      "Lugar da caveira",
      "Monte santo",
      "Vale da morte"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 48,
    "text": "De qual tribo de Israel era o rei Saul?",
    "options": [
      "Judá",
      "Efraim",
      "Benjamim",
      "Levi"
    ],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "old"
  },
  {
    "id": 49,
    "text": "Qual o nome da mulher que escondeu os espiões israelitas em Jericó?",
    "options": [
      "Rute",
      "Ester",
      "Raabe",
      "Débora"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 50,
    "text": "Em qual rio o general sírio Naamã mergulhou para ser curado da lepra?",
    "options": [
      "Nilo",
      "Tigre",
      "Eufrates",
      "Jordão"
    ],
    "correctAnswer": 3,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 51,
    "text": "Quem foi o primeiro mártir cristão?",
    "options": [
      "Pedro",
      "Paulo",
      "Estêvão",
      "Tiago"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 52,
    "text": "Qual o nome da sogra de Rute?",
    "options": [
      "Orfa",
      "Noemi",
      "Ana",
      "Isabel"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 53,
    "text": "Qual profeta foi engolido por um grande peixe?",
    "options": [
      "Elias",
      "Eliseu",
      "Jonas",
      "Miqueias"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 54,
    "text": "Qual o nome do pai de Davi?",
    "options": [
      "Saul",
      "Jessé",
      "Salomão",
      "Samuel"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 55,
    "text": "Quantos anos viveu Matusalém?",
    "options": [
      "930",
      "969",
      "950",
      "912"
    ],
    "correctAnswer": 1,
    "difficulty": "hard",
    "testament": "old"
  },
  {
    "id": 56,
    "text": "Qual apóstolo foi exilado na ilha de Patmos?",
    "options": [
      "Pedro",
      "Paulo",
      "João",
      "Tiago"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 57,
    "text": "Quem era o governador romano da Judeia durante o julgamento de Jesus?",
    "options": [
      "Herodes",
      "Pôncio Pilatos",
      "Félix",
      "Festo"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 58,
    "text": "Qual foi o primeiro milagre de Jesus registrado no Evangelho de João?",
    "options": [
      "Cura do cego",
      "Multiplicação dos pães",
      "Transformação de água em vinho",
      "Ressurreição de Lázaro"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 59,
    "text": "Quem ajudou Jesus a carregar a cruz?",
    "options": [
      "Simão Pedro",
      "Simão, o Zelote",
      "Simão de Cirene",
      "José de Arimateia"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 60,
    "text": "Qual o nome do rei da Babilônia que ficou louco e comeu capim como os bois?",
    "options": [
      "Belsazar",
      "Dario",
      "Nabucodonosor",
      "Ciro"
    ],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "old"
  },
  {
    "id": 61,
    "text": "Quem foi a esposa de Urias que mais tarde se casou com Davi?",
    "options": [
      "Mical",
      "Abigail",
      "Bate-Seba",
      "Bila"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 62,
    "text": "Qual o nome do profeta que casou com a prostituta Gômer?",
    "options": [
      "Amós",
      "Oseias",
      "Joel",
      "Miqueias"
    ],
    "correctAnswer": 1,
    "difficulty": "hard",
    "testament": "old"
  },
  {
    "id": 63,
    "text": "Quem foi o jovem que caiu da janela enquanto Paulo pregava?",
    "options": [
      "Timóteo",
      "Tito",
      "Êutico",
      "Silas"
    ],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "new"
  },
  {
    "id": 64,
    "text": "Qual o nome da ilha onde Paulo naufragou?",
    "options": [
      "Creta",
      "Chipre",
      "Malta",
      "Patmos"
    ],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "new"
  },
  {
    "id": 65,
    "text": "Qual era a profissão de Mateus antes de seguir Jesus?",
    "options": [
      "Pescador",
      "Carpinteiro",
      "Publicano (cobrador de impostos)",
      "Médico"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 66,
    "text": "Quem foi o primeiro mártir cristão?",
    "options": [
      "Tiago",
      "Estêvão",
      "Pedro",
      "Paulo"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 67,
    "text": "Quem foi o profeta chorão?",
    "options": [
      "Isaías",
      "Jeremias",
      "Ezequiel",
      "Daniel"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 68,
    "text": "Qual o nome do homem que ajudou Jesus a carregar a cruz?",
    "options": [
      "José de Arimateia",
      "Nicodemos",
      "Simão de Cirene",
      "Barrabás"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 69,
    "text": "Quem foi a juíza e profetisa que liderou Israel à vitória contra Sísera?",
    "options": [
      "Débora",
      "Jael",
      "Ester",
      "Rute"
    ],
    "correctAnswer": 0,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 70,
    "text": "Qual o nome do monte onde Jesus foi transfigurado?",
    "options": [
      "Monte Sinai",
      "Monte Carmelo",
      "Monte Tabor",
      "Monte das Oliveiras"
    ],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "new"
  },
  {
    "id": 71,
    "text": "Quem foi o sumo sacerdote que julgou Jesus?",
    "options": [
      "Anás",
      "Caifás",
      "Pilatos",
      "Herodes"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 72,
    "text": "Quem interpretou o sonho de Faraó sobre as vacas magras e gordas?",
    "options": [
      "Moisés",
      "Daniel",
      "José",
      "Abraão"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 73,
    "text": "Quem foi o profeta que viu um vale de ossos secos ganharem vida?",
    "options": [
      "Isaías",
      "Jeremias",
      "Ezequiel",
      "Daniel"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 74,
    "text": "Qual profeta confrontou os profetas de Baal no Monte Carmelo?",
    "options": [
      "Eliseu",
      "Elias",
      "Isaías",
      "Jeremias"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 75,
    "text": "Quem foi o apóstolo que substituiu Judas Iscariotes?",
    "options": [
      "Paulo",
      "Matias",
      "Barnabé",
      "Silas"
    ],
    "correctAnswer": 1,
    "difficulty": "hard",
    "testament": "new"
  },
  {
    "id": 76,
    "text": "Qual o nome da cidade onde os discípulos foram chamados cristãos pela primeira vez?",
    "options": [
      "Jerusalém",
      "Roma",
      "Antioquia",
      "Éfeso"
    ],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "new"
  },
  {
    "id": 77,
    "text": "Quem foi a única juíza de Israel mencionada na Bíblia?",
    "options": [
      "Ester",
      "Rute",
      "Débora",
      "Raabe"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 78,
    "text": "Qual o nome do profeta que repreendeu Davi por seu pecado com Bate-Seba?",
    "options": [
      "Samuel",
      "Natã",
      "Gade",
      "Elias"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 79,
    "text": "Quem foi a mulher que orou silenciosamente no templo e foi confundida com uma bêbada?",
    "options": [
      "Isabel",
      "Ana",
      "Maria",
      "Marta"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 80,
    "text": "Qual o nome do filho de Davi que se rebelou contra ele?",
    "options": [
      "Salomão",
      "Amnom",
      "Absalão",
      "Adonias"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 81,
    "text": "Quem foi o homem rico de Arimateia que pediu o corpo de Jesus?",
    "options": [
      "Nicodemos",
      "José de Arimateia",
      "Simão",
      "Lázaro"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 82,
    "text": "Qual o nome do lugar onde Jesus ascendeu ao céu?",
    "options": [
      "Monte Sinai",
      "Monte das Oliveiras",
      "Monte Carmelo",
      "Monte Sião"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 83,
    "text": "Qual rei da Babilônia teve um sonho com uma grande estátua?",
    "options": [
      "Belsazar",
      "Nabucodonosor",
      "Ciro",
      "Dario"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 84,
    "text": "Qual o nome do homem que foi curado da lepra após mergulhar 7 vezes no rio Jordão?",
    "options": [
      "Geazi",
      "Naamã",
      "Elias",
      "Eliseu"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 85,
    "text": "Quem foi o profeta que sucedeu Elias?",
    "options": [
      "Isaías",
      "Jeremias",
      "Eliseu",
      "Oseias"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 86,
    "text": "Quem escreveu o livro de Atos dos Apóstolos?",
    "options": [
      "Paulo",
      "Pedro",
      "Lucas",
      "João"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 87,
    "text": "Quem foi a vendedora de púrpura que se converteu em Filipos?",
    "options": [
      "Priscila",
      "Febe",
      "Lídia",
      "Dorcas"
    ],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "new"
  },
  {
    "id": 88,
    "text": "Qual o nome do fariseu que foi encontrar Jesus à noite?",
    "options": [
      "Caifás",
      "Anás",
      "Nicodemos",
      "José de Arimateia"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 89,
    "text": "Qual era o nome do sumo sacerdote que presidiu o julgamento de Jesus?",
    "options": [
      "Anás",
      "Caifás",
      "Nicodemos",
      "José de Arimateia"
    ],
    "correctAnswer": 1,
    "difficulty": "hard",
    "testament": "new"
  },
  {
    "id": 90,
    "text": "Qual o nome do rei da Pérsia que permitiu a reconstrução do templo em Jerusalém?",
    "options": [
      "Dario",
      "Artaxerxes",
      "Ciro",
      "Xerxes"
    ],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "old"
  },
  {
    "id": 91,
    "text": "Quem foi o homem que encontrou um tesouro escondido no campo?",
    "options": [
      "O homem rico",
      "O homem da parábola",
      "O bom samaritano",
      "O filho pródigo"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 92,
    "text": "Qual o nome do profeta que teve a visão de um trono celestial com serafins?",
    "options": [
      "Jeremias",
      "Ezequiel",
      "Isaías",
      "Daniel"
    ],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "old"
  },
  {
    "id": 93,
    "text": "Quem foi o diácono que batizou o eunuco etíope?",
    "options": [
      "Estêvão",
      "Filipe",
      "Prócoro",
      "Timão"
    ],
    "correctAnswer": 1,
    "difficulty": "hard",
    "testament": "new"
  },
  {
    "id": 94,
    "text": "Qual o nome do homem que caiu entre salteadores e foi ajudado por um samaritano?",
    "options": [
      "O homem rico",
      "O homem da parábola",
      "O publicano",
      "O fariseu"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 95,
    "text": "Quem foi o rei que teve sua vida prolongada por 15 anos após orar?",
    "options": [
      "Davi",
      "Salomão",
      "Ezequias",
      "Josias"
    ],
    "correctAnswer": 2,
    "difficulty": "hard",
    "testament": "old"
  },
  {
    "id": 96,
    "text": "Qual o nome do profeta que foi alimentado por corvos?",
    "options": [
      "Eliseu",
      "Elias",
      "Isaías",
      "Jeremias"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 97,
    "text": "A quem Paulo chamou de 'meu verdadeiro filho na fé'?",
    "options": [
      "Tito",
      "Timóteo",
      "Silas",
      "Barnabé"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 98,
    "text": "Qual o nome da mulher que escondeu os espiões israelitas em Jericó?",
    "options": [
      "Rute",
      "Ester",
      "Raabe",
      "Sara"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "old"
  },
  {
    "id": 99,
    "text": "Quem foi a mulher que teve 7 demônios expulsos por Jesus?",
    "options": [
      "Maria (mãe de Jesus)",
      "Marta",
      "Maria Madalena",
      "Joana"
    ],
    "correctAnswer": 2,
    "difficulty": "medium",
    "testament": "new"
  },
  {
    "id": 100,
    "text": "Quem foi o pai do rei Davi?",
    "options": [
      "Saul",
      "Jessé",
      "Salomão",
      "Samuel"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "testament": "old"
  }
];
