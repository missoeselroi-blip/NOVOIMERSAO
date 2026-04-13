export interface StorySegment {
  id: number;
  text: string;
  hiddenWord: string;
  question?: {
    text: string;
    options: string[];
    correctAnswer: number;
  };
}

export const GREATEST_STORY: StorySegment[] = [
  {
    id: 1,
    text: "Tudo começou em uma pequena e humilde cidade chamada Belém. O ar estava frio, mas o coração de Maria e José transbordava de uma promessa divina. Em um estábulo simples, entre o cheiro de feno e o calor dos animais, nasceu Aquele que mudaria o curso da humanidade.",
    hiddenWord: "Belém",
    question: {
      text: "Em qual cidade Jesus nasceu?",
      options: ["Nazaré", "Belém", "Jerusalém"],
      correctAnswer: 1
    }
  },
  {
    id: 2,
    text: "Anos se passaram, e o menino cresceu em sabedoria e graça em Nazaré. Ele aprendeu o ofício de carpinteiro com José, sentindo a textura da madeira e o suor do trabalho honesto. Mas Seu destino clamava por algo maior. Aos trinta anos, Ele foi ao encontro de João Batista nas águas do Rio Jordão.",
    hiddenWord: "Rio Jordão",
    question: {
      text: "Em qual rio Jesus foi batizado?",
      options: ["Rio Nilo", "Rio Eufrates", "Rio Jordão"],
      correctAnswer: 2
    }
  },
  {
    id: 3,
    text: "Após o batismo, o Espírito o conduziu ao deserto. Quarenta dias de silêncio, fome e tentação. Ali, Jesus mostrou que Sua força não vinha do pão, mas de cada palavra que sai da boca de Deus. Ao retornar, Ele começou a chamar Seus primeiros seguidores, pescadores de homens no Mar da Galileia.",
    hiddenWord: "Mar da Galileia",
    question: {
      text: "Onde Jesus chamou Seus primeiros discípulos?",
      options: ["Mar da Galileia", "Mar Morto", "Mar Vermelho"],
      correctAnswer: 0
    }
  },
  {
    id: 4,
    text: "Seu primeiro milagre aconteceu em uma festa de casamento em Caná. Maria percebeu que o vinho havia acabado, uma vergonha terrível para os noivos. Jesus, com um simples comando, transformou a água em vinho, o melhor vinho que já haviam provado.",
    hiddenWord: "água em vinho",
    question: {
      text: "Qual foi o primeiro milagre de Jesus?",
      options: ["Cura de um cego", "Multiplicação dos pães", "Transformação de água em vinho"],
      correctAnswer: 2
    }
  },
  {
    id: 5,
    text: "Jesus percorria as vilas, tocando os intocáveis. Em Cafarnaum, um centurião romano demonstrou uma fé que Jesus não encontrou em todo o Israel. Com apenas uma palavra, o servo do centurião foi curado à distância, mostrando que o poder de Deus não conhece fronteiras.",
    hiddenWord: "Cafarnaum",
    question: {
      text: "Qual cidade era considerada a 'cidade de Jesus' durante Seu ministério na Galileia?",
      options: ["Cafarnaum", "Jericó", "Samaria"],
      correctAnswer: 0
    }
  },
  {
    id: 6,
    text: "Nas encostas de um monte, Ele proferiu o Sermão da Montanha. 'Bem-aventurados os humildes de espírito', dizia Ele. Suas palavras eram como bálsamo para as almas cansadas, desafiando a lógica do mundo e estabelecendo o Reino dos Céus em corações dispostos.",
    hiddenWord: "Sermão da Montanha",
    question: {
      text: "Como é conhecido o famoso discurso de Jesus que contém as Bem-aventuranças?",
      options: ["Sermão do Templo", "Sermão da Montanha", "Sermão do Deserto"],
      correctAnswer: 1
    }
  },
  {
    id: 7,
    text: "Certa vez, uma tempestade furiosa açoitou o barco dos discípulos. Enquanto eles temiam pela vida, Jesus dormia tranquilamente. Ao ser acordado, Ele repreendeu o vento e o mar: 'Aquietai-vos!'. E houve grande bonança, revelando Sua autoridade sobre a criação.",
    hiddenWord: "repreendeu o vento e o mar",
    question: {
      text: "O que Jesus fez para acalmar a tempestade?",
      options: ["Orou em silêncio", "Repreendeu o vento e o mar", "Pediu aos discípulos para remarem mais forte"],
      correctAnswer: 1
    }
  },
  {
    id: 8,
    text: "Em uma terra estrangeira, Jesus encontrou uma mulher samaritana junto ao poço de Jacó. Ele quebrou barreiras sociais e religiosas ao pedir-lhe água, oferecendo em troca a 'Água Viva' que sacia a sede da alma para sempre.",
    hiddenWord: "poço de Jacó",
    question: {
      text: "Onde Jesus encontrou a mulher samaritana?",
      options: ["No Templo", "Junto ao poço de Jacó", "No mercado de Jerusalém"],
      correctAnswer: 1
    }
  },
  {
    id: 9,
    text: "A compaixão de Jesus era infinita. Diante de uma multidão faminta de cinco mil homens, além de mulheres e crianças, Ele tomou cinco pães e dois peixes. Ele deu graças, e o alimento se multiplicou até que todos estivessem satisfeitos, e ainda sobraram doze cestos cheios.",
    hiddenWord: "cinco pães e dois peixes",
    question: {
      text: "Quantos pães e peixes Jesus usou para alimentar os cinco mil?",
      options: ["7 pães e 3 peixes", "5 pães e 2 peixes", "10 pães e 5 peixes"],
      correctAnswer: 1
    }
  },
  {
    id: 10,
    text: "Em Betânia, o luto pesava sobre as irmãs Marta e Maria. Seu irmão Lázaro estava morto há quatro dias. Jesus chorou com elas, humanizando Sua dor. Mas então, com voz de trovão, Ele gritou: 'Lázaro, vem para fora!'. E o morto reviveu.",
    hiddenWord: "Lázaro",
    question: {
      text: "Quem Jesus ressuscitou em Betânia?",
      options: ["Jairo", "Lázaro", "O filho da viúva de Naim"],
      correctAnswer: 1
    }
  },
  {
    id: 11,
    text: "Jesus entrou em Jerusalém montado em um jumentinho, cumprindo a profecia. A multidão estendia ramos de palmeira e gritava: 'Hosana!'. Era o início da semana que mudaria a eternidade, a entrada triunfal do Rei que veio para servir.",
    hiddenWord: "jumentinho",
    question: {
      text: "Qual animal Jesus usou para entrar em Jerusalém?",
      options: ["Um cavalo branco", "Um jumentinho", "Um camelo"],
      correctAnswer: 1
    }
  },
  {
    id: 12,
    text: "Na Última Ceia, Jesus lavou os pés de Seus discípulos, um ato de extrema humildade. Ele instituiu a Ceia, partindo o pão e distribuindo o vinho, símbolos de Seu corpo e sangue que seriam entregues por muitos.",
    hiddenWord: "lavou os pés",
    question: {
      text: "O que Jesus fez para demonstrar serviço aos discípulos na última ceia?",
      options: ["Lavou os pés deles", "Deu-lhes presentes", "Curou suas feridas"],
      correctAnswer: 0
    }
  },
  {
    id: 13,
    text: "No Jardim do Getsêmani, a angústia era profunda. Suor como gotas de sangue caíam ao chão enquanto Ele orava: 'Pai, se possível, afasta de mim este cálice; contudo, não seja como eu quero, mas como Tu queres'. Ali, a batalha espiritual foi vencida pela submissão.",
    hiddenWord: "Getsêmani",
    question: {
      text: "Onde Jesus orou antes de ser preso?",
      options: ["Monte das Oliveiras / Getsêmani", "Monte Sinai", "Monte Carmelo"],
      correctAnswer: 0
    }
  },
  {
    id: 14,
    text: "Traído por um beijo de Judas Iscariotes, Jesus foi levado perante o Sinédrio e depois a Pôncio Pilatos. Mesmo sendo inocente, Ele permaneceu em silêncio, como um cordeiro levado ao matadouro, carregando sobre Si o peso de nossas transgressões.",
    hiddenWord: "Judas Iscariotes",
    question: {
      text: "Quem traiu Jesus com um beijo?",
      options: ["Pedro", "Judas Iscariotes", "Tomé"],
      correctAnswer: 1
    }
  },
  {
    id: 15,
    text: "No alto do Gólgota, o 'Lugar da Caveira', Jesus foi pregado na cruz. Entre dois ladrões, Ele proferiu palavras de perdão: 'Pai, perdoa-lhes, pois não sabem o que fazem'. O céu escureceu ao meio-dia, e a terra tremeu quando Ele entregou Seu espírito.",
    hiddenWord: "Lugar da Caveira",
    question: {
      text: "Qual o significado de Gólgota?",
      options: ["Lugar da Caveira", "Lugar de Paz", "Lugar de Sacrifício"],
      correctAnswer: 0
    }
  },
  {
    id: 16,
    text: "O corpo de Jesus foi depositado em um túmulo novo, cedido por José de Arimateia. Uma grande pedra foi rolada para fechar a entrada, e guardas romanos vigiavam o local. Parecia o fim de uma esperança, o silêncio do sábado pairava sobre o mundo.",
    hiddenWord: "José de Arimateia",
    question: {
      text: "Quem cedeu o túmulo para o sepultamento de Jesus?",
      options: ["Nicodemos", "José de Arimateia", "Simão de Cirene"],
      correctAnswer: 1
    }
  },
  {
    id: 17,
    text: "Mas no domingo de manhã, bem cedo, as mulheres foram ao túmulo e encontraram a pedra removida. Um anjo resplandecente anunciou: 'Ele não está aqui; ressuscitou, como havia dito!'. A morte havia sido derrotada para sempre.",
    hiddenWord: "As mulheres",
    question: {
      text: "Quem foram os primeiros a saber da ressurreição no túmulo?",
      options: ["Os apóstolos", "As mulheres (Maria Madalena e outras)", "Os guardas romanos"],
      correctAnswer: 1
    }
  },
  {
    id: 18,
    text: "Jesus apareceu aos Seus discípulos, mostrando Suas feridas e comendo com eles. Ele soprou sobre eles o Espírito Santo e deu a Grande Comissão: 'Ide por todo o mundo e pregai o evangelho a toda criatura'.",
    hiddenWord: "pregai o evangelho",
    question: {
      text: "Qual foi a ordem final de Jesus aos Seus discípulos?",
      options: ["Fiquem em Jerusalém para sempre", "Ide e pregai o evangelho", "Construam grandes templos"],
      correctAnswer: 1
    }
  },
  {
    id: 19,
    text: "No Monte das Oliveiras, diante de Seus olhos, Jesus foi elevado aos céus. Uma nuvem O encobriu, mas a promessa ficou: 'Esse mesmo Jesus voltará da mesma forma que O vistes subir'. Ele subiu para interceder por nós à direita do Pai.",
    hiddenWord: "Monte das Oliveiras",
    question: {
      text: "De onde Jesus ascendeu aos céus?",
      options: ["Monte das Oliveiras", "Monte Tabor", "Monte Hermom"],
      correctAnswer: 0
    }
  },
  {
    id: 20,
    text: "Hoje, essa história continua em você. O mesmo Jesus que andou na Galileia quer caminhar nos seus desafios modernos. Ele oferece paz em meio ao caos digital, propósito em meio à incerteza e amor em um mundo muitas vezes frio. Ele é a Maior História, e Ele quer escrever um novo capítulo na sua vida.",
    hiddenWord: "esperança e transformação",
    question: {
      text: "Qual é a mensagem central dessa 'Maior História' para os dias de hoje?",
      options: ["É apenas um fato histórico", "Jesus está vivo e oferece esperança e transformação", "Devemos apenas seguir regras"],
      correctAnswer: 1
    }
  }
];
