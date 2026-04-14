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

export interface Story {
  id: string;
  title: string;
  description: string;
  image: string;
  segments: StorySegment[];
}

export const STORIES: Story[] = [
  {
    id: 'son-of-man',
    title: 'O Filho do Homem',
    description: 'Uma jornada imersiva pela vida de Jesus.',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800&h=600',
    segments: [
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
    ]
  },
  {
    id: 'david',
    title: 'Um Homem Segundo o Coração de Deus',
    description: 'A história de Davi, do curral ao trono, suas lutas e restauração.',
    image: 'https://images.unsplash.com/photo-1601933470484-7823b195743a?auto=format&fit=crop&q=80&w=800&h=600',
    segments: [
      {
        id: 1,
        text: "Nas colinas de Belém, um jovem pastor cuidava das ovelhas de seu pai, Jessé. Enquanto seus irmãos mais velhos sonhavam com a glória militar, Davi encontrava melodia no saltério e coragem no silêncio do campo. Ele era o menor da casa, mas Deus via algo especial em seu coração.",
        hiddenWord: "pastor",
        question: {
          text: "Qual era a ocupação de Davi antes de ser rei?",
          options: ["Soldado", "Pastor", "Carpinteiro"],
          correctAnswer: 1
        }
      },
      {
        id: 2,
        text: "O profeta Samuel foi enviado por Deus à casa de Jessé para ungir o novo rei de Israel. Após ver todos os irmãos robustos de Davi serem rejeitados, Samuel perguntou se havia mais alguém. Davi foi chamado do campo, e ali, diante de sua família, o óleo da unção desceu sobre sua cabeça.",
        hiddenWord: "Samuel",
        question: {
          text: "Quem ungiu Davi como rei?",
          options: ["Saul", "Samuel", "Natã"],
          correctAnswer: 1
        }
      },
      {
        id: 3,
        text: "Davi não foi para o palácio imediatamente. Ele voltou para suas ovelhas. Mas quando um urso e um leão atacaram o rebanho, Davi não fugiu. Ele os enfrentou e os matou com as próprias mãos, aprendendo que o Senhor que o livrou das garras das feras o livraria de qualquer inimigo.",
        hiddenWord: "urso e um leão",
        question: {
          text: "Quais animais Davi matou para proteger suas ovelhas?",
          options: ["Lobo e tigre", "Urso e leão", "Cobra e águia"],
          correctAnswer: 1
        }
      },
      {
        id: 4,
        text: "O rei Saul sofria de um espírito perturbador e precisava de alguém que tocasse harpa para acalmá-lo. Davi foi levado ao palácio. Suas melodias traziam paz ao rei, e Davi começou a conhecer os corredores do poder, sem saber que um dia aquele trono seria seu.",
        hiddenWord: "harpa",
        question: {
          text: "Qual instrumento Davi tocava para o rei Saul?",
          options: ["Flauta", "Harpa", "Trombeta"],
          correctAnswer: 1
        }
      },
      {
        id: 5,
        text: "No vale de Elá, um gigante filisteu chamado Golias desafiava o exército de Israel por quarenta dias. Todos tremiam. Davi, ao levar comida para seus irmãos, ouviu as afrontas e se indignou. 'Quem é este incircunciso para afrontar o exército do Deus vivo?', perguntou o jovem.",
        hiddenWord: "Golias",
        question: {
          text: "Qual era o nome do gigante filisteu que Davi enfrentou?",
          options: ["Sansão", "Golias", "Enaque"],
          correctAnswer: 1
        }
      },
      {
        id: 6,
        text: "Recusando a armadura pesada de Saul, Davi foi ao encontro do gigante apenas com seu cajado, cinco pedras lisas e uma funda. Com um arremesso preciso, a pedra atingiu a testa de Golias, que caiu por terra. A vitória não veio pela espada, mas pelo nome do Senhor dos Exércitos.",
        hiddenWord: "cinco pedras lisas",
        question: {
          text: "O que Davi usou para derrotar Golias?",
          options: ["Uma espada", "Uma lança", "Uma funda e pedras"],
          correctAnswer: 2
        }
      },
      {
        id: 7,
        text: "A vitória sobre Golias trouxe fama a Davi, mas também a inveja de Saul. Enquanto o povo cantava 'Saul matou seus milhares, e Davi seus dez milhares', o rei planejava a morte do jovem herói. Davi teve que fugir para o deserto, tornando-se um fugitivo em sua própria terra.",
        hiddenWord: "inveja",
        question: {
          text: "Por que Saul começou a perseguir Davi?",
          options: ["Por medo", "Por inveja", "Por dívidas"],
          correctAnswer: 1
        }
      },
      {
        id: 8,
        text: "No deserto, Davi encontrou refúgio na caverna de Adulão. Ali, cerca de quatrocentos homens em aperto, amargurados e endividados se juntaram a ele. Davi os transformou em um exército de valentes, liderando-os com justiça e temor a Deus.",
        hiddenWord: "caverna de Adulão",
        question: {
          text: "Onde Davi se refugiou e reuniu seus primeiros seguidores?",
          options: ["Caverna de Adulão", "Monte Sinai", "Deserto do Saara"],
          correctAnswer: 0
        }
      },
      {
        id: 9,
        text: "Davi teve várias oportunidades de matar Saul, mas se recusou a tocar no 'ungido do Senhor'. Em uma ocasião, ele apenas cortou a orla do manto de Saul enquanto este dormia em uma caverna. Davi confiava que Deus faria justiça no tempo certo.",
        hiddenWord: "ungido do Senhor",
        question: {
          text: "Por que Davi não matou Saul quando teve oportunidade?",
          options: ["Por medo dos soldados", "Por respeito ao ungido de Deus", "Porque Saul era seu sogro"],
          correctAnswer: 1
        }
      },
      {
        id: 10,
        text: "Davi cultivou uma amizade profunda com Jônatas, filho de Saul. Eles fizeram uma aliança de fidelidade que superava as intrigas do palácio. Jônatas reconhecia que Davi seria o próximo rei e o ajudou a escapar das armadilhas de seu pai várias vezes.",
        hiddenWord: "Jônatas",
        question: {
          text: "Quem era o melhor amigo de Davi, filho de Saul?",
          options: ["Abner", "Joabe", "Jônatas"],
          correctAnswer: 2
        }
      },
      {
        id: 11,
        text: "Após a morte de Saul e Jônatas em batalha, Davi chorou amargamente por eles. Ele foi ungido rei primeiro sobre a tribo de Judá em Hebrom, e sete anos depois, todas as tribos de Israel o aclamaram como rei sobre toda a nação.",
        hiddenWord: "Hebrom",
        question: {
          text: "Em qual cidade Davi foi ungido rei de Judá primeiro?",
          options: ["Jerusalém", "Hebrom", "Belém"],
          correctAnswer: 1
        }
      },
      {
        id: 12,
        text: "Davi conquistou a fortaleza de Sião dos jebuseus e a chamou de Cidade de Davi. Ele estabeleceu Jerusalém como a capital de Israel, unindo o centro político e religioso da nação, e planejou trazer a Arca da Aliança para o centro da cidade.",
        hiddenWord: "Jerusalém",
        question: {
          text: "Qual cidade Davi estabeleceu como capital de Israel?",
          options: ["Samaria", "Jericó", "Jerusalém"],
          correctAnswer: 2
        }
      },
      {
        id: 13,
        text: "Ao trazer a Arca para Jerusalém, Davi dançou com todas as suas forças diante do Senhor, vestindo apenas uma estola de linho. Ele não se importou com sua dignidade real, pois seu desejo era celebrar a presença de Deus entre o Seu povo.",
        hiddenWord: "dançou",
        question: {
          text: "O que Davi fez quando a Arca da Aliança entrou em Jerusalém?",
          options: ["Ficou em silêncio", "Dançou diante do Senhor", "Fez um grande banquete"],
          correctAnswer: 1
        }
      },
      {
        id: 14,
        text: "Davi desejava construir um templo para Deus, mas o Senhor lhe disse que seu filho o faria. Em vez disso, Deus fez uma promessa eterna a Davi: que sua linhagem e seu trono seriam estabelecidos para sempre, uma profecia que apontava para o Messias.",
        hiddenWord: "templo",
        question: {
          text: "O que Davi queria construir para Deus?",
          options: ["Um palácio", "Um templo", "Uma muralha"],
          correctAnswer: 1
        }
      },
      {
        id: 15,
        text: "Mesmo sendo um homem segundo o coração de Deus, Davi cometeu um erro grave. Ele cobiçou Bate-Seba e enviou seu marido, Urias, para a morte na frente de batalha. O pecado trouxe consequências terríveis para sua família e para o reino.",
        hiddenWord: "Bate-Seba",
        question: {
          text: "Com quem Davi cometeu adultério?",
          options: ["Dalila", "Bate-Seba", "Ester"],
          correctAnswer: 1
        }
      },
      {
        id: 16,
        text: "O profeta Natã confrontou Davi com uma parábola sobre um homem rico que roubou a única ovelha de um pobre. Davi se arrependeu profundamente, escrevendo o Salmo 51: 'Cria em mim, ó Deus, um coração puro'. Deus o perdoou, mas a dor do pecado permaneceu.",
        hiddenWord: "Natã",
        question: {
          text: "Qual profeta confrontou Davi sobre seu pecado?",
          options: ["Elias", "Samuel", "Natã"],
          correctAnswer: 2
        }
      },
      {
        id: 17,
        text: "A rebelião de seu filho Absalão foi um dos momentos mais tristes da vida de Davi. Absalão tentou usurpar o trono e Davi teve que fugir de Jerusalém. Quando Absalão morreu em batalha, Davi chorou: 'Meu filho Absalão, quem me dera ter morrido em teu lugar!'.",
        hiddenWord: "Absalão",
        question: {
          text: "Qual filho de Davi liderou uma rebelião contra ele?",
          options: ["Salomão", "Adonias", "Absalão"],
          correctAnswer: 2
        }
      },
      {
        id: 18,
        text: "Davi foi um grande guerreiro e expandiu as fronteiras de Israel, mas ele também foi o 'doce salmista de Israel'. Ele escreveu muitos dos Salmos, expressando alegria, tristeza, arrependimento e confiança inabalável em Deus em todas as circunstâncias.",
        hiddenWord: "Salmos",
        question: {
          text: "Qual livro da Bíblia contém muitos dos cânticos escritos por Davi?",
          options: ["Provérbios", "Salmos", "Eclesiastes"],
          correctAnswer: 1
        }
      },
      {
        id: 19,
        text: "No final de sua vida, Davi preparou tudo para que seu filho Salomão construísse o Templo. Ele reuniu materiais, ouro e prata, e deu instruções detalhadas. Davi morreu em boa velhice, cheio de dias, riquezas e glória, deixando um legado de fé.",
        hiddenWord: "Salomão",
        question: {
          text: "Qual filho de Davi o sucedeu no trono e construiu o Templo?",
          options: ["Salomão", "Roboão", "Absalão"],
          correctAnswer: 0
        }
      },
      {
        id: 20,
        text: "A história de Davi nos ensina que Deus não busca perfeição, mas um coração que se volta para Ele. Das pastagens de Belém ao trono de Jerusalém, Davi mostrou que a verdadeira grandeza está em reconhecer nossa dependência de Deus e em Sua restauração.",
        hiddenWord: "coração",
        question: {
          text: "O que Deus buscava em Davi ao chamá-lo de 'homem segundo o Seu coração'?",
          options: ["Força física", "Perfeição moral", "Um coração voltado para Ele"],
          correctAnswer: 2
        }
      }
    ]
  },
  {
    id: 'abraham',
    title: 'O Pai da fé',
    description: 'A história de Abraão, o homem que creu contra a esperança.',
    image: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=800&h=600',
    segments: [
      {
        id: 1,
        text: "Em Ur dos Caldeus, um homem chamado Abrão vivia com sua família em uma terra de muitos deuses. Um dia, uma voz poderosa ecoou em seu coração: 'Sai da tua terra, da tua parentela e da casa de teu pai, para a terra que eu te mostrarei'. Abrão, sem saber para onde ia, obedeceu.",
        hiddenWord: "Ur dos Caldeus",
        question: {
          text: "De qual cidade Abrão saiu quando Deus o chamou?",
          options: ["Babilônia", "Ur dos Caldeus", "Harã"],
          correctAnswer: 1
        }
      },
      {
        id: 2,
        text: "Deus prometeu a Abrão: 'Farei de ti uma grande nação, e te abençoarei'. Abrão tinha 75 anos quando partiu de Harã com sua esposa Sarai e seu sobrinho Ló. Eles levaram seus bens e as pessoas que haviam adquirido, caminhando em direção ao desconhecido, guiados apenas pela fé.",
        hiddenWord: "75 anos",
        question: {
          text: "Quantos anos Abrão tinha quando saiu de Harã?",
          options: ["50 anos", "75 anos", "100 anos"],
          correctAnswer: 1
        }
      },
      {
        id: 3,
        text: "Ao chegar em Canaã, Abrão passou por Siquém e Betel. Em todos os lugares onde parava, ele edificava um altar ao Senhor, reconhecendo que aquela terra, embora habitada por outros, era a herança prometida por Deus à sua descendência.",
        hiddenWord: "altar",
        question: {
          text: "O que Abrão costumava edificar nos lugares onde parava?",
          options: ["Uma casa", "Um altar", "Um poço"],
          correctAnswer: 1
        }
      },
      {
        id: 4,
        text: "Uma fome severa assolou a terra, e Abrão desceu ao Egito para sobreviver. Com medo de ser morto por causa da beleza de Sarai, ele disse que ela era sua irmã. Faraó a levou para seu palácio, mas Deus interveio com pragas, protegendo a linhagem da promessa.",
        hiddenWord: "Egito",
        question: {
          text: "Para onde Abrão foi quando houve fome em Canaã?",
          options: ["Egito", "Moabe", "Filístia"],
          correctAnswer: 0
        }
      },
      {
        id: 5,
        text: "Abrão e Ló tornaram-se tão ricos em rebanhos que a terra não podia sustentá-los juntos. Para evitar conflitos, Abrão permitiu que Ló escolhesse primeiro. Ló escolheu as planícies férteis de Sodoma, enquanto Abrão permaneceu nas montanhas de Canaã, confiando na provisão divina.",
        hiddenWord: "Ló",
        question: {
          text: "Quem era o sobrinho de Abrão que viajava com ele?",
          options: ["Isaque", "Ló", "Ismael"],
          correctAnswer: 1
        }
      },
      {
        id: 6,
        text: "Após a partida de Ló, Deus disse a Abrão: 'Ergue os olhos e olha para o norte, sul, leste e oeste. Toda esta terra darei a ti e à tua descendência para sempre'. Deus reafirmou que sua semente seria tão numerosa quanto o pó da terra.",
        hiddenWord: "norte, sul, leste e oeste",
        question: {
          text: "O que Deus prometeu dar a Abrão e sua descendência?",
          options: ["Ouro e prata", "A terra de Canaã", "Poder sobre o Egito"],
          correctAnswer: 1
        }
      },
      {
        id: 7,
        text: "Ló foi capturado durante uma guerra entre reis locais. Abrão, ao saber disso, armou 318 de seus homens treinados e perseguiu os invasores. Ele resgatou Ló e todos os seus bens, demonstrando coragem e lealdade à sua família.",
        hiddenWord: "318",
        question: {
          text: "Quantos homens treinados Abrão levou para resgatar Ló?",
          options: ["100", "318", "500"],
          correctAnswer: 1
        }
      },
      {
        id: 8,
        text: "Ao retornar da vitória, Abrão foi recebido por Melquisedeque, rei de Salém e sacerdote do Deus Altíssimo. Melquisedeque trouxe pão e vinho e abençoou Abrão. Em gratidão, Abrão deu-lhe o dízimo de tudo o que havia conquistado.",
        hiddenWord: "Melquisedeque",
        question: {
          text: "Quem era o rei de Salém e sacerdote que abençoou Abrão?",
          options: ["Abimeleque", "Melquisedeque", "Faraó"],
          correctAnswer: 1
        }
      },
      {
        id: 9,
        text: "Abrão estava preocupado por não ter filhos. Deus o levou para fora e disse: 'Olha para o céu e conta as estrelas, se puderes. Assim será a tua descendência'. Abrão creu no Senhor, e isso lhe foi creditado como justiça.",
        hiddenWord: "estrelas",
        question: {
          text: "Com o que Deus comparou a futura descendência de Abrão?",
          options: ["Com as estrelas do céu", "Com as árvores da floresta", "Com as nuvens"],
          correctAnswer: 0
        }
      },
      {
        id: 10,
        text: "Deus fez uma aliança formal com Abrão através de um sacrifício. Enquanto Abrão dormia profundamente, uma tocha de fogo passou entre os animais divididos. Deus prometeu que seus descendentes seriam estrangeiros em terra alheia por 400 anos antes de possuírem Canaã.",
        hiddenWord: "400 anos",
        question: {
          text: "Por quanto tempo Deus disse que a descendência de Abrão seria escrava em terra estranha?",
          options: ["100 anos", "400 anos", "1000 anos"],
          correctAnswer: 1
        }
      },
      {
        id: 11,
        text: "Sarai, impaciente com a demora da promessa, sugeriu que Abrão tivesse um filho com sua serva egípcia, Agar. Assim nasceu Ismael. Mas Deus disse que a aliança seria estabelecida através de um filho que a própria Sarai daria à luz.",
        hiddenWord: "Ismael",
        question: {
          text: "Qual o nome do primeiro filho de Abrão, com a serva Agar?",
          options: ["Isaque", "Ismael", "Jacó"],
          correctAnswer: 1
        }
      },
      {
        id: 12,
        text: "Quando Abrão tinha 99 anos, Deus mudou seu nome para Abraão, que significa 'pai de muitas nações'. Sarai também teve seu nome mudado para Sara. Deus instituiu a circuncisão como sinal da aliança entre Ele e a casa de Abraão.",
        hiddenWord: "Abraão",
        question: {
          text: "O que significa o nome Abraão?",
          options: ["O escolhido", "Pai de muitas nações", "Amigo de Deus"],
          correctAnswer: 1
        }
      },
      {
        id: 13,
        text: "Três visitantes celestiais apareceram a Abraão junto aos carvalhais de Manre. Eles reafirmaram que, no ano seguinte, Sara teria um filho. Sara, ouvindo de dentro da tenda, riu, pois já era idosa. O Senhor perguntou: 'Haveria alguma coisa difícil para o Senhor?'.",
        hiddenWord: "riu",
        question: {
          text: "Qual foi a reação de Sara ao ouvir que teria um filho em sua velhice?",
          options: ["Chorou", "Riu", "Gritou"],
          correctAnswer: 1
        }
      },
      {
        id: 14,
        text: "Deus revelou a Abraão que destruiria Sodoma e Gomorra por causa de sua grande maldade. Abraão intercedeu pela cidade, perguntando se Deus a pouparia se houvesse cinquenta justos, descendo até dez. Mas nem dez justos foram encontrados.",
        hiddenWord: "intercedeu",
        question: {
          text: "O que Abraão fez quando soube que Deus destruiria Sodoma?",
          options: ["Ficou feliz", "Intercedeu pela cidade", "Avisou os reis"],
          correctAnswer: 1
        }
      },
      {
        id: 15,
        text: "Finalmente, no tempo determinado por Deus, nasceu Isaque. Seu nome significa 'riso', lembrando o riso de dúvida que se tornou riso de alegria. Abraão tinha 100 anos e Sara 90. A promessa impossível havia se tornado realidade.",
        hiddenWord: "Isaque",
        question: {
          text: "Qual o nome do filho da promessa, nascido de Sara?",
          options: ["Ismael", "Isaque", "José"],
          correctAnswer: 1
        }
      },
      {
        id: 16,
        text: "Deus pediu a Abraão o maior sacrifício: 'Toma teu filho, teu único filho Isaque, a quem amas, e oferece-o em holocausto'. Abraão obedeceu prontamente, caminhando três dias até o Monte Moriá, confiando que Deus poderia até ressuscitar seu filho.",
        hiddenWord: "Monte Moriá",
        question: {
          text: "Para qual monte Abraão levou Isaque para ser sacrificado?",
          options: ["Monte Sinai", "Monte Carmelo", "Monte Moriá"],
          correctAnswer: 2
        }
      },
      {
        id: 17,
        text: "No momento em que Abraão ergueu o cutelo, o Anjo do Senhor o impediu: 'Não estendas a mão sobre o rapaz'. Abraão viu um carneiro preso pelos chifres em um arbusto e o ofereceu no lugar de seu filho. Ele chamou aquele lugar de 'O Senhor Proverá'.",
        hiddenWord: "carneiro",
        question: {
          text: "O que Abraão sacrificou no lugar de Isaque?",
          options: ["Um cordeiro", "Um carneiro", "Um touro"],
          correctAnswer: 1
        }
      },
      {
        id: 18,
        text: "Sara morreu aos 127 anos em Hebrom. Abraão comprou a caverna de Macpela como sepultura para ela. Foi a única parte da terra de Canaã que Abraão possuiu legalmente em vida, um sinal de que ele ainda aguardava a posse total prometida por Deus.",
        hiddenWord: "caverna de Macpela",
        question: {
          text: "Onde Sara foi sepultada?",
          options: ["No Egito", "Na caverna de Macpela", "Em Belém"],
          correctAnswer: 1
        }
      },
      {
        id: 19,
        text: "Abraão enviou seu servo mais antigo para buscar uma esposa para Isaque entre sua parentela, para que ele não se casasse com as cananeias. O servo encontrou Rebeca, que aceitou seguir para Canaã, garantindo a continuidade da linhagem da fé.",
        hiddenWord: "Rebeca",
        question: {
          text: "Quem foi a esposa de Isaque, buscada pelo servo de Abraão?",
          options: ["Raquel", "Rebeca", "Lia"],
          correctAnswer: 1
        }
      },
      {
        id: 20,
        text: "Abraão morreu aos 175 anos, 'em boa velhice, farto de dias'. Ele é chamado de 'Pai da Fé' e 'Amigo de Deus'. Sua vida nos ensina que crer em Deus significa confiar em Sua palavra, mesmo quando as circunstâncias parecem impossíveis.",
        hiddenWord: "Amigo de Deus",
        question: {
          text: "Como Abraão é carinhosamente chamado nas Escrituras devido à sua proximidade com o Criador?",
          options: ["Servo Fiel", "Amigo de Deus", "Profeta das Nações"],
          correctAnswer: 1
        }
      }
    ]
  },
  {
    id: 'moses',
    title: 'O Homem Mais Manso da Terra',
    description: 'A história de Moisés, do nascimento à morte, o libertador de Israel.',
    image: 'https://images.unsplash.com/photo-1590076175582-40940b43f021?auto=format&fit=crop&q=80&w=800&h=600',
    segments: [
      {
        id: 1,
        text: "No Egito, um novo Faraó que não conhecia José temia o crescimento dos hebreus. Ele ordenou que todo menino hebreu recém-nascido fosse lançado no Rio Nilo. Mas uma mãe corajosa, Joquebede, escondeu seu filho por três meses, até que não pôde mais.",
        hiddenWord: "Rio Nilo",
        question: {
          text: "Onde o Faraó ordenou que os meninos hebreus fossem lançados?",
          options: ["No deserto", "No Rio Nilo", "No Mar Vermelho"],
          correctAnswer: 1
        }
      },
      {
        id: 2,
        text: "Joquebede colocou o bebê em um cesto de papiro vedado com betume e o deixou entre os juncos à beira do rio. A filha do Faraó, ao descer para se banhar, encontrou o cesto. Ela teve compaixão do bebê e o chamou de Moisés, que significa 'tirado das águas'.",
        hiddenWord: "Moisés",
        question: {
          text: "Qual o significado do nome Moisés?",
          options: ["Filho de Deus", "Tirado das águas", "Líder do povo"],
          correctAnswer: 1
        }
      },
      {
        id: 3,
        text: "Moisés cresceu no palácio como um príncipe, instruído em toda a sabedoria dos egípcios. Mas ele nunca esqueceu suas raízes. Um dia, ao ver um egípcio espancando um hebreu, Moisés interveio e matou o egípcio. Com medo de ser descoberto, ele fugiu para a terra de Midiã.",
        hiddenWord: "Midiã",
        question: {
          text: "Para onde Moisés fugiu após matar o egípcio?",
          options: ["Canaã", "Midiã", "Etiópia"],
          correctAnswer: 1
        }
      },
      {
        id: 4,
        text: "Em Midiã, Moisés tornou-se pastor de ovelhas para seu sogro, Jetro. Quarenta anos se passaram no silêncio do deserto. Certo dia, no Monte Horebe, ele viu uma sarça que ardia em fogo, mas não se consumia. Dali, Deus falou com ele: 'Tira as sandálias dos pés, porque o lugar em que estás é terra santa'.",
        hiddenWord: "sarça ardente",
        question: {
          text: "Como Deus apareceu a Moisés no deserto?",
          options: ["Em uma nuvem", "Em uma sarça ardente", "Em um redemoinho"],
          correctAnswer: 1
        }
      },
      {
        id: 5,
        text: "Deus ordenou que Moisés voltasse ao Egito para libertar Seu povo. Moisés, inseguro, perguntou: 'Quem sou eu?'. Deus respondeu: 'Eu serei contigo'. E quando Moisés perguntou Seu nome, Deus disse: 'EU SOU O QUE EU SOU'.",
        hiddenWord: "EU SOU",
        question: {
          text: "Como Deus Se identificou para Moisés?",
          options: ["O Criador", "EU SOU O QUE EU SOU", "O Deus de Israel"],
          correctAnswer: 1
        }
      },
      {
        id: 6,
        text: "Moisés e seu irmão Arão foram perante o Faraó com a mensagem: 'Deixe o meu povo ir'. Faraó endureceu o coração e aumentou a carga de trabalho dos hebreus. Então, Deus enviou dez pragas sobre o Egito, demonstrando Sua soberania sobre os deuses egípcios.",
        hiddenWord: "dez pragas",
        question: {
          text: "Quantas pragas Deus enviou sobre o Egito?",
          options: ["7", "10", "12"],
          correctAnswer: 1
        }
      },
      {
        id: 7,
        text: "A última praga foi a morte dos primogênitos. Os hebreus foram instruídos a marcar os umbrais de suas portas com o sangue de um cordeiro para que o destruidor passasse por cima. Esta foi a primeira Páscoa, o sinal da libertação final.",
        hiddenWord: "sangue de um cordeiro",
        question: {
          text: "O que os hebreus usaram para marcar suas portas na primeira Páscoa?",
          options: ["Azeite", "Sangue de um cordeiro", "Vinho"],
          correctAnswer: 1
        }
      },
      {
        id: 8,
        text: "Faraó finalmente deixou o povo sair, mas logo se arrependeu e os perseguiu com seus carros de guerra. Diante do Mar Vermelho e cercados pelo exército, o povo temeu. Moisés estendeu o cajado, e Deus abriu um caminho seco no meio das águas.",
        hiddenWord: "Mar Vermelho",
        question: {
          text: "Qual mar Deus abriu para o povo de Israel passar?",
          options: ["Mar Morto", "Mar Vermelho", "Mar Mediterrâneo"],
          correctAnswer: 1
        }
      },
      {
        id: 9,
        text: "No deserto, Deus proveu para o povo. Pela manhã, havia o maná, o pão do céu, e à tarde, codornizes. Quando tiveram sede, Moisés feriu a rocha em Horebe, e dela brotou água em abundância para saciar a multidão.",
        hiddenWord: "maná",
        question: {
          text: "Como se chamava o pão que caía do céu todas as manhãs?",
          options: ["Maná", "Ázimo", "Mel"],
          correctAnswer: 0
        }
      },
      {
        id: 10,
        text: "No Monte Sinai, em meio a trovões e fumaça, Deus entregou a Moisés os Dez Mandamentos escritos em tábuas de pedra. Era a base da aliança entre Deus e Israel, chamando o povo a uma vida de santidade e justiça.",
        hiddenWord: "Dez Mandamentos",
        question: {
          text: "O que Deus entregou a Moisés no Monte Sinai?",
          options: ["A Arca da Aliança", "Os Dez Mandamentos", "O Tabernáculo"],
          correctAnswer: 1
        }
      },
      {
        id: 11,
        text: "Enquanto Moisés estava no monte, o povo se corrompeu e fez um bezerro de ouro para adorar. Moisés, ao descer e ver a idolatria, quebrou as tábuas da lei em indignação. Ele intercedeu pelo povo, impedindo que Deus os destruísse completamente.",
        hiddenWord: "bezerro de ouro",
        question: {
          text: "Qual ídolo o povo construiu enquanto Moisés estava no monte?",
          options: ["Uma estátua de Faraó", "Um bezerro de ouro", "Um altar de pedra"],
          correctAnswer: 1
        }
      },
      {
        id: 12,
        text: "Moisés recebeu instruções detalhadas para construir o Tabernáculo, a tenda da congregação onde Deus habitaria no meio do Seu povo. Cada detalhe, desde o candelabro de ouro até o Santo dos Santos, apontava para a glória e a santidade de Deus.",
        hiddenWord: "Tabernáculo",
        question: {
          text: "Como se chamava a tenda móvel onde Deus habitava no deserto?",
          options: ["Templo", "Tabernáculo", "Sinagoga"],
          correctAnswer: 1
        }
      },
      {
        id: 13,
        text: "Moisés enviou doze espias para observar a terra de Canaã. Dez voltaram com um relatório negativo, espalhando medo. Apenas Josué e Calebe confiaram que Deus lhes daria a vitória. Por causa da incredulidade, o povo foi condenado a vagar pelo deserto por quarenta anos.",
        hiddenWord: "Josué e Calebe",
        question: {
          text: "Quais espias trouxeram um relatório de confiança em Deus?",
          options: ["Moisés e Arão", "Josué e Calebe", "Nadabe e Abiú"],
          correctAnswer: 1
        }
      },
      {
        id: 14,
        text: "Em um momento de frustração com as murmurações do povo, Moisés feriu a rocha duas vezes em vez de apenas falar com ela, como Deus ordenara. Por causa dessa desobediência, Deus disse que Moisés não entraria na Terra Prometida.",
        hiddenWord: "feriu a rocha",
        question: {
          text: "Por que Moisés foi impedido de entrar em Canaã?",
          options: ["Por causa da idade", "Porque feriu a rocha em vez de falar com ela", "Porque o povo não quis"],
          correctAnswer: 1
        }
      },
      {
        id: 15,
        text: "Quando o povo reclamou novamente, Deus enviou serpentes abrasadoras. Moisés orou, e Deus ordenou que ele fizesse uma serpente de bronze e a colocasse em uma haste. Quem olhasse para a serpente de bronze seria curado, uma prefiguração de Cristo na cruz.",
        hiddenWord: "serpente de bronze",
        question: {
          text: "O que Moisés fez para curar o povo das picadas de serpente?",
          options: ["Fez um sacrifício", "Levantou uma serpente de bronze", "Orou por cada um"],
          correctAnswer: 1
        }
      },
      {
        id: 16,
        text: "Moisés é descrito como o homem mais manso da terra. Sua liderança não era baseada em força bruta, mas em uma comunhão íntima com Deus. Ele falava com o Senhor face a face, como um amigo fala com outro.",
        hiddenWord: "manso",
        question: {
          text: "Qual característica marcante de Moisés é destacada na Bíblia?",
          options: ["Sua força", "Sua mansidão", "Sua riqueza"],
          correctAnswer: 1
        }
      },
      {
        id: 17,
        text: "Ao final dos quarenta anos, Moisés reuniu o povo nas planícies de Moabe e repetiu a Lei (o livro de Deuteronômio), exortando-os a escolher a vida e a obediência. Ele abençoou cada tribo e preparou Josué para ser o seu sucessor.",
        hiddenWord: "Josué",
        question: {
          text: "Quem foi o sucessor de Moisés na liderança de Israel?",
          options: ["Arão", "Josué", "Calebe"],
          correctAnswer: 1
        }
      },
      {
        id: 18,
        text: "Deus levou Moisés ao topo do Monte Nebo. Dali, ele pôde ver toda a Terra Prometida, de Gileade até o Mar Ocidental. Moisés morreu ali, aos 120 anos, com a vista ainda clara e o vigor intacto. O próprio Deus o sepultou em um vale desconhecido.",
        hiddenWord: "Monte Nebo",
        question: {
          text: "De qual monte Moisés avistou a Terra Prometida antes de morrer?",
          options: ["Monte Sinai", "Monte Nebo", "Monte Carmelo"],
          correctAnswer: 1
        }
      },
      {
        id: 19,
        text: "Nunca mais se levantou em Israel profeta como Moisés, a quem o Senhor conhecesse face a face. Ele foi o mediador da Antiga Aliança, o legislador e o libertador que apontou para o Profeta maior que viria: Jesus Cristo.",
        hiddenWord: "face a face",
        question: {
          text: "Como era a relação de Moisés com Deus?",
          options: ["Através de sonhos apenas", "Face a face", "Através de intermediários"],
          correctAnswer: 1
        }
      },
      {
        id: 20,
        text: "A vida de Moisés nos ensina que Deus pode usar nossas fraquezas e nosso passado para realizar Seus grandes propósitos. De um bebê no cesto a um líder de nações, sua história é um testemunho da fidelidade e do poder libertador de Deus.",
        hiddenWord: "libertador",
        question: {
          text: "Qual o papel principal de Moisés na história de Israel?",
          options: ["Rei", "Libertador e Legislador", "Sacerdote"],
          correctAnswer: 1
        }
      }
    ]
  },
  {
    id: 'paul',
    title: 'O Apóstolo dos Gentios',
    description: 'A história de Paulo, da perseguição à pregação do Evangelho.',
    image: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&q=80&w=800&h=600',
    segments: [
      {
        id: 1,
        text: "Saulo de Tarso era um fariseu zeloso, instruído aos pés de Gamaliel. Ele acreditava que estava servindo a Deus ao perseguir os seguidores de Jesus, a quem considerava uma seita perigosa. Ele estava presente e consentiu na morte de Estêvão, o primeiro mártir cristão.",
        hiddenWord: "Saulo de Tarso",
        question: {
          text: "Qual era o nome original de Paulo antes de sua conversão?",
          options: ["Simão", "Saulo", "Barnabé"],
          correctAnswer: 1
        }
      },
      {
        id: 2,
        text: "Com cartas de autorização do Sumo Sacerdote, Saulo partiu para Damasco para prender os cristãos dali. No caminho, uma luz resplandecente do céu o cercou, e ele caiu por terra. Uma voz lhe disse: 'Saulo, Saulo, por que me persegues?'.",
        hiddenWord: "Damasco",
        question: {
          text: "Para qual cidade Saulo estava indo quando teve seu encontro com Jesus?",
          options: ["Tarso", "Damasco", "Antioquia"],
          correctAnswer: 1
        }
      },
      {
        id: 3,
        text: "Saulo ficou cego por três dias e foi levado para Damasco. Deus enviou um discípulo chamado Ananias para orar por ele. Quando Ananias impôs as mãos, algo como escamas caiu dos olhos de Saulo, e ele recuperou a vista, sendo batizado e cheio do Espírito Santo.",
        hiddenWord: "Ananias",
        question: {
          text: "Quem foi o discípulo enviado por Deus para orar por Saulo em Damasco?",
          options: ["Pedro", "Ananias", "Filipe"],
          correctAnswer: 1
        }
      },
      {
        id: 4,
        text: "Imediatamente, Saulo começou a pregar nas sinagogas que Jesus é o Filho de Deus. Os judeus ficaram atônitos, pois sabiam que ele viera para destruir os cristãos. Para escapar de uma conspiração para matá-lo, os discípulos o desceram pelo muro da cidade em um cesto.",
        hiddenWord: "cesto",
        question: {
          text: "Como Saulo escapou de Damasco quando os judeus tentaram matá-lo?",
          options: ["Disfarçado", "Em um cesto pelo muro", "Por um túnel"],
          correctAnswer: 1
        }
      },
      {
        id: 5,
        text: "Saulo passou um tempo na Arábia e depois voltou para Tarso. Barnabé foi buscá-lo e o levou para Antioquia, onde trabalharam juntos por um ano. Foi em Antioquia que os discípulos foram chamados de 'cristãos' pela primeira vez.",
        hiddenWord: "Antioquia",
        question: {
          text: "Em qual cidade os discípulos foram chamados de cristãos pela primeira vez?",
          options: ["Jerusalém", "Antioquia", "Roma"],
          correctAnswer: 1
        }
      },
      {
        id: 6,
        text: "O Espírito Santo separou Barnabé e Saulo para a primeira viagem missionária. Eles percorreram a ilha de Chipre e várias cidades da Ásia Menor. Em Pafos, Saulo confrontou o mágico Elimas e, a partir de então, passou a ser chamado pelo seu nome romano: Paulo.",
        hiddenWord: "Paulo",
        question: {
          text: "A partir de qual momento Saulo passou a ser chamado predominantemente de Paulo?",
          options: ["No batismo", "Na primeira viagem missionária", "Quando chegou em Roma"],
          correctAnswer: 1
        }
      },
      {
        id: 7,
        text: "Em Listra, Paulo curou um homem coxo de nascença. A multidão pensou que eles fossem deuses e tentou oferecer sacrifícios. Paulo os impediu, pregando sobre o Deus vivo. Mas logo depois, judeus de Antioquia instigaram a multidão, que apedrejou Paulo e o deixou como morto.",
        hiddenWord: "apedrejou",
        question: {
          text: "O que aconteceu com Paulo em Listra após ele curar um coxo?",
          options: ["Foi coroado rei", "Foi apedrejou", "Foi preso"],
          correctAnswer: 1
        }
      },
      {
        id: 8,
        text: "Paulo participou do Concílio de Jerusalém, onde se defendeu que os gentios não precisavam seguir a lei de Moisés para serem salvos, mas apenas a fé em Cristo. Esta decisão foi crucial para a expansão do Evangelho entre todas as nações.",
        hiddenWord: "gentios",
        question: {
          text: "Qual era o foco principal do ministério de Paulo?",
          options: ["Os judeus de Jerusalém", "Os gentios (não-judeus)", "Os sacerdotes do templo"],
          correctAnswer: 1
        }
      },
      {
        id: 9,
        text: "Na segunda viagem missionária, Paulo teve uma visão de um homem da Macedônia pedindo: 'Passa à Macedônia e ajuda-nos'. Paulo entendeu que Deus o chamava para pregar na Europa. Ele fundou igrejas em Filipos, Tessalônica e Corinto.",
        hiddenWord: "Macedônia",
        question: {
          text: "Para onde Paulo foi após ter uma visão de um homem pedindo ajuda?",
          options: ["Egito", "Macedônia", "Espanha"],
          correctAnswer: 1
        }
      },
      {
        id: 10,
        text: "Em Filipos, Paulo e Silas foram presos e açoitados. À meia-noite, enquanto oravam e cantavam hinos, um terremoto abriu as portas da prisão. O carcereiro, impactado, perguntou: 'Que devo fazer para ser salvo?'. Paulo respondeu: 'Crê no Senhor Jesus'.",
        hiddenWord: "cantavam hinos",
        question: {
          text: "O que Paulo e Silas faziam na prisão de Filipos antes do terremoto?",
          options: ["Dormiam", "Oravam e cantavam hinos", "Planejavam a fuga"],
          correctAnswer: 1
        }
      },
      {
        id: 11,
        text: "Em Atenas, Paulo pregou no Areópago sobre o 'Deus Desconhecido'. Ele usou a cultura local para apresentar o Criador e a ressurreição de Cristo. Embora alguns tenham zombado, outros creram, incluindo Dionísio e uma mulher chamada Dâmaris.",
        hiddenWord: "Deus Desconhecido",
        question: {
          text: "Sobre o que Paulo pregou no Areópago em Atenas?",
          options: ["Sobre a Lei de Moisés", "Sobre o Deus Desconhecido", "Sobre a queda de Roma"],
          correctAnswer: 1
        }
      },
      {
        id: 12,
        text: "Paulo passou três anos em Éfeso durante sua terceira viagem. O Evangelho impactou tanto a cidade que os fabricantes de ídolos da deusa Ártemis causaram um tumulto, temendo perder seus lucros. Paulo escreveu muitas de suas cartas para fortalecer as igrejas que fundou.",
        hiddenWord: "Éfeso",
        question: {
          text: "Em qual cidade Paulo passou três anos e enfrentou a oposição dos fabricantes de ídolos?",
          options: ["Corinto", "Éfeso", "Roma"],
          correctAnswer: 1
        }
      },
      {
        id: 13,
        text: "Apesar dos avisos de que seria preso, Paulo voltou a Jerusalém. Ele foi capturado no Templo e salvo de um linchamento pelos soldados romanos. Paulo usou cada oportunidade, perante o Sinédrio e governadores, para testemunhar de sua fé em Cristo.",
        hiddenWord: "Jerusalém",
        question: {
          text: "Onde Paulo foi preso após sua terceira viagem missionária?",
          options: ["Roma", "Jerusalém", "Cesareia"],
          correctAnswer: 1
        }
      },
      {
        id: 14,
        text: "Paulo foi enviado para Roma após apelar para César. Durante a viagem, o navio enfrentou uma tempestade violenta e naufragou na ilha de Malta. Paulo encorajou a todos, e ninguém morreu, conforme Deus lhe havia prometido.",
        hiddenWord: "Malta",
        question: {
          text: "Em qual ilha Paulo naufragou a caminho de Roma?",
          options: ["Chipre", "Malta", "Creta"],
          correctAnswer: 1
        }
      },
      {
        id: 15,
        text: "Em Roma, Paulo viveu dois anos sob prisão domiciliar, mas com liberdade para receber visitas. Ele continuou pregando o Reino de Deus e ensinando sobre o Senhor Jesus Cristo a todos os que o procuravam, inclusive membros da guarda pretoriana.",
        hiddenWord: "prisão domiciliar",
        question: {
          text: "Como Paulo viveu seus primeiros dois anos em Roma?",
          options: ["Em uma masmorra", "Em prisão domiciliar", "Como um homem livre"],
          correctAnswer: 1
        }
      },
      {
        id: 16,
        text: "Paulo escreveu treze cartas que fazem parte do Novo Testamento. Elas abordam doutrina, ética e encorajamento, moldando o pensamento cristão por séculos. Ele ensinou que somos salvos pela graça, mediante a fé, e não pelas obras.",
        hiddenWord: "graça",
        question: {
          text: "Qual o tema central da teologia de Paulo sobre a salvação?",
          options: ["Salvação pelas obras", "Salvação pela graça", "Salvação pelo conhecimento"],
          correctAnswer: 1
        }
      },
      {
        id: 17,
        text: "Paulo enfrentou inúmeros sofrimentos: naufrágios, açoites, prisões, fome e perigos. Ele disse: 'Para mim, o viver é Cristo e o morrer é lucro'. Sua força vinha da convicção de que nada poderia separá-lo do amor de Deus.",
        hiddenWord: "viver é Cristo",
        question: {
          text: "Qual era a frase famosa de Paulo sobre sua vida e morte?",
          options: ["Viver é sofrer", "Viver é Cristo e o morrer é lucro", "Viver é lutar"],
          correctAnswer: 1
        }
      },
      {
        id: 18,
        text: "Perto do fim de sua vida, Paulo escreveu a Timóteo: 'Combati o bom combate, acabei a carreira, guardei a fé'. Ele sabia que sua partida estava próxima, mas estava confiante na coroa da justiça que o Senhor lhe daria.",
        hiddenWord: "combati o bom combate",
        question: {
          text: "Como Paulo descreveu o fim de sua jornada na segunda carta a Timóteo?",
          options: ["Estou cansado", "Combati o bom combate", "Fui derrotado"],
          correctAnswer: 1
        }
      },
      {
        id: 19,
        text: "A tradição diz que Paulo foi martirizado em Roma sob o imperador Nero. Ele deu sua vida pelo Evangelho que um dia tentou destruir. Sua transformação de perseguidor a apóstolo é um dos maiores milagres da história da igreja.",
        hiddenWord: "Nero",
        question: {
          text: "Sob qual imperador romano Paulo foi provavelmente martirizado?",
          options: ["Augusto", "Nero", "Constantino"],
          correctAnswer: 1
        }
      },
      {
        id: 20,
        text: "O legado de Paulo continua vivo. Suas viagens missionárias e seus escritos estabeleceram as bases para a igreja mundial. Ele nos ensina que não importa quem fomos, Deus pode nos transformar em instrumentos poderosos de Sua graça.",
        hiddenWord: "transformar",
        question: {
          text: "O que a vida de Paulo mais demonstra sobre o poder de Deus?",
          options: ["Poder político", "Poder de transformação", "Poder de cura apenas"],
          correctAnswer: 1
        }
      }
    ]
  }
];
