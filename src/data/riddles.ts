export interface Riddle {
  id: number;
  enigma: string;
  answer: string;
  options: string[];
  hint: string;
}

export const BIBLE_RIDDLES: Riddle[] = [
  {
    id: 1,
    enigma: "Fui o primeiro a ver a morte, mas nunca nasci. Fui o primeiro a ser enterrado, mas não tive funeral. Quem sou eu?",
    answer: "Abel",
    options: ["Adão", "Abel", "Seta"],
    hint: "Fui morto por meu próprio irmão."
  },
  {
    id: 2,
    enigma: "Tenho doze irmãos, mas sou o mais odiado. Fui vendido por prata, mas salvei uma nação do abismo da fome. Quem sou eu?",
    answer: "José",
    options: ["Benjamim", "José", "Judá"],
    hint: "Tinha uma túnica de várias cores."
  },
  {
    id: 3,
    enigma: "Sou o menor dos grãos, mas quando cresço, as aves do céu fazem ninhos em meus ramos. O que sou eu?",
    answer: "Grão de mostarda",
    options: ["Semente de trigo", "Grão de mostarda", "Semente de uva"],
    hint: "Jesus usou minha pequenez para falar da fé."
  },
  {
    id: 4,
    enigma: "Fui feito de terra, mas não sou planta. Fui feito de carne, mas não nasci de mulher. Minha costela deu vida a outra. Quem sou eu?",
    answer: "Adão",
    options: ["Enoque", "Adão", "Noé"],
    hint: "O primeiro homem."
  },
  {
    id: 5,
    enigma: "Não tenho pés, mas caminhei sobre as águas. Não tenho boca, mas engoli o profeta fujão. O que sou eu?",
    answer: "Grande Peixe",
    options: ["Baleia", "Grande Peixe", "Leviatã"],
    hint: "Hospedei Jonas por três dias."
  },
  {
    id: 6,
    enigma: "Fui uma rainha que não nasceu em berço de ouro, mas salvei meu povo da forca de um homem orgulhoso. Quem sou eu?",
    answer: "Ester",
    options: ["Rute", "Ester", "Vasti"],
    hint: "Meu tio se chamava Mardoqueu."
  },
  {
    id: 7,
    enigma: "Fui o homem mais forte da terra, mas fui vencido por uma tesoura e pelo segredo do meu coração. Quem sou eu?",
    answer: "Sansão",
    options: ["Golias", "Sansão", "Davi"],
    hint: "Minha força estava no meu cabelo."
  },
  {
    id: 8,
    enigma: "Fui o profeta que subiu ao céu em um redemoinho, sem conhecer a morte, deixando meu manto para trás. Quem sou eu?",
    answer: "Elias",
    options: ["Eliseu", "Elias", "Enoque"],
    hint: "Fui alimentado por corvos."
  },
  {
    id: 9,
    enigma: "Sou o rio onde o mestre foi batizado e onde o general leproso mergulhou sete vezes para ser limpo. Que rio sou eu?",
    answer: "Rio Jordão",
    options: ["Rio Nilo", "Rio Jordão", "Rio Eufrates"],
    hint: "Suas águas se abriram para Josué."
  },
  {
    id: 10,
    enigma: "Fui o rei que pediu sabedoria em vez de riquezas, mas terminei meus dias cercado por deuses estranhos. Quem sou eu?",
    answer: "Salomão",
    options: ["Davi", "Salomão", "Saul"],
    hint: "Construí o primeiro Templo."
  },
  {
    id: 11,
    enigma: "Fui a mulher que olhou para trás e me tornei um monumento de sal no meio da destruição. Quem sou eu?",
    answer: "Mulher de Ló",
    options: ["Sara", "Mulher de Ló", "Raquel"],
    hint: "Saí de Sodoma com pressa."
  },
  {
    id: 12,
    enigma: "Fui o gigante que caiu diante de uma pedra e da fé de um pastor de ovelhas. Quem sou eu?",
    answer: "Golias",
    options: ["Golias", "Og", "Sif"],
    hint: "Era um filisteu de Gate."
  },
  {
    id: 13,
    enigma: "Fui o discípulo que andou sobre as águas, mas afundou quando o medo foi maior que a fé. Quem sou eu?",
    answer: "Pedro",
    options: ["João", "Pedro", "Tiago"],
    hint: "Neguei o mestre três vezes."
  },
  {
    id: 14,
    enigma: "Fui o homem que construiu uma casa gigante em terra seca, enquanto todos riam de uma chuva que nunca viram. Quem sou eu?",
    answer: "Noé",
    options: ["Lameque", "Noé", "Matusalém"],
    hint: "Sobrevivi ao Dilúvio."
  },
  {
    id: 15,
    enigma: "Sou o lugar onde o sol parou por um dia inteiro para que o povo de Deus vencesse a batalha. Que lugar sou eu?",
    answer: "Gibeão",
    options: ["Jericó", "Gibeão", "Aí"],
    hint: "Josué fez a oração audaciosa aqui."
  },
  {
    id: 16,
    enigma: "Fui o profeta que falou com uma jumenta, mas meu coração estava preso ao ouro do rei inimigo. Quem sou eu?",
    answer: "Balaão",
    options: ["Balaão", "Baruque", "Bileão"],
    hint: "Tentei amaldiçoar Israel."
  },
  {
    id: 17,
    enigma: "Sou o objeto que floresceu em uma noite para provar quem era o escolhido para o sacerdócio. O que sou eu?",
    answer: "Vara de Arão",
    options: ["Cajado de Moisés", "Vara de Arão", "Arca da Aliança"],
    hint: "Produzi amêndoas."
  },
  {
    id: 18,
    enigma: "Fui o homem que viveu mais tempo na terra, mas minha história termina antes do grande dilúvio. Quem sou eu?",
    answer: "Matusalém",
    options: ["Enoque", "Matusalém", "Jarede"],
    hint: "Vivi 969 anos."
  },
  {
    id: 19,
    enigma: "Fui o traidor que trocou o autor da vida por trinta moedas de prata e um beijo de morte. Quem sou eu?",
    answer: "Judas Iscariotes",
    options: ["Simão", "Judas Iscariotes", "Barrabás"],
    hint: "Era o tesoureiro dos discípulos."
  },
  {
    id: 20,
    enigma: "Sou a cidade cujas muralhas caíram ao som de trombetas e gritos de um povo que marchou sete dias. Que cidade sou eu?",
    answer: "Jericó",
    options: ["Babilônia", "Jericó", "Samaria"],
    hint: "A primeira cidade conquistada em Canaã."
  },
  {
    id: 21,
    enigma: "Fui o homem que lutou com um anjo até o amanhecer e recebi um novo nome e uma coxa ferida. Quem sou eu?",
    answer: "Jacó",
    options: ["Esaú", "Jacó", "Isaque"],
    hint: "Meu nome se tornou Israel."
  },
  {
    id: 22,
    enigma: "Sou o fogo que arde mas não consome, a voz que chamou o libertador no meio do deserto. O que sou eu?",
    answer: "Sarça Ardente",
    options: ["Coluna de Fogo", "Sarça Ardente", "Altar de Incenso"],
    hint: "Moisés tirou as sandálias diante de mim."
  },
  {
    id: 23,
    enigma: "Fui o rei que viu uma mão escrevendo na parede o fim do meu império em uma noite de banquete. Quem sou eu?",
    answer: "Baltazar",
    options: ["Nabucodonosor", "Baltazar", "Ciro"],
    hint: "Mene, Mene, Tequel, Parsim."
  },
  {
    id: 24,
    enigma: "Fui o profeta que foi jogado na cova dos leões, mas a boca das feras foi fechada pela mão de Deus. Quem sou eu?",
    answer: "Daniel",
    options: ["Ezequiel", "Daniel", "Jeremias"],
    hint: "Interpretava sonhos na Babilônia."
  },
  {
    id: 25,
    enigma: "Sou o pão que caiu do céu todas as manhãs para alimentar um povo faminto no deserto. O que sou eu?",
    answer: "Maná",
    options: ["Codorna", "Maná", "Pão Ázimo"],
    hint: "Tinha gosto de bolo de mel."
  },
  {
    id: 26,
    enigma: "Fui a mulher que escondeu os espiões em Jericó e fui salva por um cordão vermelho em minha janela. Quem sou eu?",
    answer: "Raabe",
    options: ["Raabe", "Débora", "Jael"],
    hint: "Sou ancestral de Jesus."
  },
  {
    id: 27,
    enigma: "Fui o primeiro rei de Israel, alto e formoso, mas perdi o trono por causa da minha desobediência. Quem sou eu?",
    answer: "Saul",
    options: ["Saul", "Davi", "Samuel"],
    hint: "Perseguia Davi com ciúmes."
  },
  {
    id: 28,
    enigma: "Sou o monte onde as tábuas da lei foram entregues entre trovões, relâmpagos e uma nuvem espessa. Que monte sou eu?",
    answer: "Monte Sinai",
    options: ["Monte Horebe", "Monte Sinai", "Monte Carmelo"],
    hint: "Também chamado de Horebe."
  },
  {
    id: 29,
    enigma: "Fui o homem que foi ressuscitado por Jesus após quatro dias no túmulo, quando já cheirava mal. Quem sou eu?",
    answer: "Lázaro",
    options: ["Estêvão", "Lázaro", "Nicodemos"],
    hint: "Irmão de Marta e Maria."
  },
  {
    id: 30,
    enigma: "Sou a torre que os homens tentaram construir para chegar ao céu, mas terminaram em confusão de línguas. O que sou eu?",
    answer: "Torre de Babel",
    options: ["Torre de Siloé", "Torre de Babel", "Torre de vigia"],
    hint: "Origem das diversas línguas."
  },
  {
    id: 31,
    enigma: "Fui o profeta que fugiu de uma rainha má e desejei a morte debaixo de um zimbro. Quem sou eu?",
    answer: "Elias",
    options: ["Elias", "Eliseu", "Amós"],
    hint: "Venci os profetas de Baal no Carmelo."
  },
  {
    id: 32,
    enigma: "Fui o apóstolo que duvidou da ressurreição até tocar nas feridas do mestre com minhas próprias mãos. Quem sou eu?",
    answer: "Tomé",
    options: ["Filipe", "Tomé", "Bartolomeu"],
    hint: "Disse: 'Meu Senhor e meu Deus'."
  },
  {
    id: 33,
    enigma: "Sou o mar que se abriu para um povo passar e se fechou para um exército perecer. Que mar sou eu?",
    answer: "Mar Vermelho",
    options: ["Mar da Galileia", "Mar Vermelho", "Mar Morto"],
    hint: "Moisés estendeu o cajado sobre mim."
  },
  {
    id: 34,
    enigma: "Fui a juíza que liderou Israel e profetizei a vitória sobre Sísera debaixo de uma palmeira. Quem sou eu?",
    answer: "Débora",
    options: ["Débora", "Rute", "Noemi"],
    hint: "Trabalhei com Baraque."
  },
  {
    id: 35,
    enigma: "Fui o homem que subiu em uma figueira brava para ver Jesus passar, pois era de pequena estatura. Quem sou eu?",
    answer: "Zaqueu",
    options: ["Mateus", "Zaqueu", "Bartimeu"],
    hint: "Era um publicano rico em Jericó."
  },
  {
    id: 36,
    enigma: "Sou o jardim onde a queda começou, onde o pecado entrou e a perfeição foi perdida. Que jardim sou eu?",
    answer: "Jardim do Éden",
    options: ["Getsêmani", "Jardim do Éden", "Jardim do Túmulo"],
    hint: "Onde ficava a árvore da vida."
  },
  {
    id: 37,
    enigma: "Fui o primeiro mártir da igreja, apedrejado enquanto via os céus abertos e o Filho do Homem à direita de Deus. Quem sou eu?",
    answer: "Estêvão",
    options: ["Tiago", "Estêvão", "Paulo"],
    hint: "Rosto como de um anjo."
  },
  {
    id: 38,
    enigma: "Sou o objeto que continha o maná, a vara de Arão e as tábuas da lei. O que sou eu?",
    answer: "Arca da Aliança",
    options: ["Altar de Ouro", "Arca da Aliança", "Mesa dos Pães"],
    hint: "Ficava no Santo dos Santos."
  },
  {
    id: 39,
    enigma: "Fui o perseguidor que se tornou perseguido, após ver uma luz brilhante no caminho de Damasco. Quem sou eu?",
    answer: "Paulo",
    options: ["Saulo", "Paulo", "Barnabé"],
    hint: "Escrevi a maioria das epístolas."
  },
  {
    id: 40,
    enigma: "Sou a estrela que guiou os magos do oriente até o lugar onde o rei dos judeus nasceu. O que sou eu?",
    answer: "Estrela de Belém",
    options: ["Estrela da Manhã", "Estrela de Belém", "Cometa"],
    hint: "Parou sobre a casa onde estava o menino."
  },
  {
    id: 41,
    enigma: "Fui o homem que trocou seu direito de primogenitura por um prato de lentilhas vermelhas. Quem sou eu?",
    answer: "Esaú",
    options: ["Jacó", "Esaú", "Ruben"],
    hint: "Era um caçador peludo."
  },
  {
    id: 42,
    enigma: "Sou o monte onde Jesus foi transfigurado e Suas vestes se tornaram brancas como a luz. Que monte sou eu?",
    answer: "Monte Tabor",
    options: ["Monte Hermom", "Monte Tabor", "Monte das Oliveiras"],
    hint: "Moisés e Elias apareceram lá."
  },
  {
    id: 43,
    enigma: "Fui o rei que teve sua vida prolongada em quinze anos após chorar e orar voltado para a parede. Quem sou eu?",
    answer: "Ezequias",
    options: ["Josias", "Ezequias", "Acaz"],
    hint: "A sombra retrocedeu dez graus."
  },
  {
    id: 44,
    enigma: "Sou o deserto onde o povo de Deus vagou por quarenta anos por causa da sua incredulidade. Que deserto sou eu?",
    answer: "Deserto de Sinai",
    options: ["Deserto de Sinai", "Deserto de Judá", "Deserto de Parã"],
    hint: "Lugar de provação e maná."
  },
  {
    id: 45,
    enigma: "Fui o jovem que dormiu durante o sermão de Paulo e caiu da janela, mas foi restaurado à vida. Quem sou eu?",
    answer: "Êutico",
    options: ["Timóteo", "Êutico", "Tito"],
    hint: "Aconteceu em Trôade."
  },
  {
    id: 46,
    enigma: "Sou a arma que Davi usou para derrubar o gigante, provando que a vitória vem do Senhor. O que sou eu?",
    answer: "Funda",
    options: ["Espada", "Funda", "Lança"],
    hint: "Usei cinco pedras lisas."
  },
  {
    id: 47,
    enigma: "Fui a mulher que lavou os pés de Jesus com suas lágrimas e os enxugou com seus próprios cabelos. Quem sou eu?",
    answer: "Maria Madalena",
    options: ["Marta", "Maria Madalena", "Maria de Betânia"],
    hint: "Muitos pecados me foram perdoados."
  },
  {
    id: 48,
    enigma: "Sou o sinal que Deus colocou nas nuvens após o dilúvio como promessa de que nunca mais destruiria a terra com água. O que sou eu?",
    answer: "Arco-íris",
    options: ["Nuvem", "Arco-íris", "Estrela"],
    hint: "Aliança entre Deus e a terra."
  },
  {
    id: 49,
    enigma: "Fui o homem que foi levado por Deus e não conheceu a morte, porque andou com Deus. Quem sou eu?",
    answer: "Enoque",
    options: ["Noé", "Enoque", "Elias"],
    hint: "Sétimo depois de Adão."
  },
  {
    id: 50,
    enigma: "Sou o cordeiro que foi providenciado no lugar de Isaque no alto do monte Moriá. O que sou eu?",
    answer: "Carneiro",
    options: ["Cordeiro", "Carneiro", "Novilho"],
    hint: "Estava preso pelos chifres num matagal."
  }
];
