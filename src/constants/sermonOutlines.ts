export interface SermonOutline {
  id: string;
  category: string;
  theme: string;
  verse: string;
  introduction: string;
  development: string[];
  conclusion: string;
  prayer: string;
  appeal: string;
}

export const sermonOutlines: SermonOutline[] = [
  // Categoria: Família e Relacionamentos
  {
    id: 'fam-1',
    category: 'Família e Relacionamentos',
    theme: 'Construindo um Lar sobre a Rocha',
    verse: 'Mateus 7:24-25 (NVI)',
    introduction: 'A família é o projeto mais antigo de Deus. No entanto, muitas famílias hoje estão desmoronando porque foram construídas sobre a areia das conveniências e não sobre a rocha da Palavra de Deus.',
    development: [
      '1. A Tempestade é Inevitável: Todas as famílias enfrentarão crises (ventos e chuvas).',
      '2. A Importância do Alicerce: Ouvir e praticar a Palavra de Deus é a rocha.',
      '3. A Recompensa da Obediência: Uma casa que não cai, um lar que resiste às provações.'
    ],
    conclusion: 'Não podemos evitar as tempestades da vida, mas podemos escolher onde construir nossa casa. Um lar firmado em Cristo suporta qualquer crise.',
    prayer: 'Senhor, ajuda-nos a construir nossas famílias sobre a rocha da Tua Palavra. Que nosso lar seja um refúgio de paz e amor.',
    appeal: 'Se o seu lar está desmoronando, convide Jesus hoje para ser o alicerce da sua família.'
  },
  {
    id: 'fam-2',
    category: 'Família e Relacionamentos',
    theme: 'O Perdão que Restaura Relacionamentos',
    verse: 'Efésios 4:32 (NVI)',
    introduction: 'Onde há convivência, haverá atritos. O perdão não é uma opção para a família cristã, é uma necessidade vital para a sobrevivência do amor.',
    development: [
      '1. A Natureza do Perdão: Sejam bondosos e compassivos.',
      '2. O Padrão do Perdão: Perdoem-se mutuamente, assim como Deus os perdoou em Cristo.',
      '3. O Fruto do Perdão: Restauração, cura e paz no lar.'
    ],
    conclusion: 'Reter o perdão é beber veneno esperando que o outro morra. Liberar perdão é abrir a porta da prisão e descobrir que o prisioneiro era você.',
    prayer: 'Pai, ensina-nos a perdoar como fomos perdoados. Quebranta nosso orgulho e cura nossas feridas.',
    appeal: 'Há alguém na sua família que você precisa perdoar hoje? Dê o primeiro passo em direção à cura.'
  },
  {
    id: 'fam-3',
    category: 'Família e Relacionamentos',
    theme: 'Pais que Deixam um Legado',
    verse: 'Provérbios 22:6 (NVI)',
    introduction: 'A maior herança que podemos deixar para nossos filhos não é financeira, mas espiritual. O legado da fé é eterno.',
    development: [
      '1. A Responsabilidade: "Instrua a criança". Não terceirize a educação espiritual.',
      '2. O Caminho: "Segundo os objetivos que você tem para ela". Ensine o caminho do Senhor.',
      '3. A Promessa: "Mesmo com o passar dos anos não se desviará deles".'
    ],
    conclusion: 'Nossos filhos são flechas em nossas mãos. Precisamos mirar no alvo certo, que é Cristo, para que eles alcancem o propósito de Deus.',
    prayer: 'Senhor, dá-nos sabedoria para guiar nossos filhos no Teu caminho. Que nossa vida seja o maior exemplo para eles.',
    appeal: 'Pais, assumam hoje o compromisso de serem os principais discipuladores de seus filhos.'
  },
  {
    id: 'fam-4',
    category: 'Família e Relacionamentos',
    theme: 'O Casamento que Glorifica a Deus',
    verse: 'Efésios 5:25 (NVI)',
    introduction: 'O casamento não foi criado apenas para a nossa felicidade, mas para a nossa santificação e para refletir o amor de Cristo pela Igreja.',
    development: [
      '1. O Amor Sacrificial: "Maridos, amem suas mulheres, como Cristo amou a igreja".',
      '2. A Entrega Total: "E entregou-se a si mesmo por ela".',
      '3. O Propósito: Apresentar a esposa santa e irrepreensível.'
    ],
    conclusion: 'Um casamento forte não é feito de duas pessoas perfeitas, mas de dois pecadores que aprenderam a viver a graça e o perdão de Deus.',
    prayer: 'Deus, fortalece os casamentos da nossa igreja. Que cada casal reflita o Teu amor sacrificial.',
    appeal: 'Casais, renovem hoje seus votos de amor, respeito e submissão mútua diante do Senhor.'
  },
  {
    id: 'fam-5',
    category: 'Família e Relacionamentos',
    theme: 'Honrando Pai e Mãe em Todas as Fases',
    verse: 'Efésios 6:2-3 (NVI)',
    introduction: 'O primeiro mandamento com promessa é sobre a honra aos pais. Honrar não é concordar com tudo, mas tratar com respeito e dignidade em todas as fases da vida.',
    development: [
      '1. O Mandamento: "Honra teu pai e tua mãe".',
      '2. A Promessa: "Para que tudo te corra bem e tenhas longa vida sobre a terra".',
      '3. A Prática: Cuidar, respeitar e valorizar, mesmo na velhice.'
    ],
    conclusion: 'A forma como tratamos nossos pais revela muito sobre o nosso relacionamento com Deus, nosso Pai celestial.',
    prayer: 'Senhor, ajuda-nos a honrar nossos pais. Que possamos ser filhos gratos e amorosos.',
    appeal: 'Se você tem mágoas de seus pais, peça a Deus graça para perdoar e honrá-los hoje.'
  },

  // Categoria: Fé e Esperança
  {
    id: 'fe-1',
    category: 'Fé e Esperança',
    theme: 'Fé para Mover Montanhas',
    verse: 'Marcos 11:23 (NVI)',
    introduction: 'A fé não é negar a realidade da montanha, mas declarar a grandeza de Deus diante dela. A verdadeira fé move o coração de Deus.',
    development: [
      '1. A Palavra de Autoridade: "Disser a este monte: Levante-se e atire-se no mar".',
      '2. A Ausência de Dúvida: "E não duvidar em seu coração".',
      '3. A Certeza da Resposta: "Crer que acontecerá o que diz, assim lhe será feito".'
    ],
    conclusion: 'O tamanho da sua fé não importa tanto quanto o tamanho do Deus em quem você deposita a sua fé.',
    prayer: 'Pai, aumenta a nossa fé. Ajuda-nos a olhar para Ti e não para as montanhas de problemas.',
    appeal: 'Qual é a montanha na sua vida hoje? Entregue-a a Deus com fé e veja o Seu poder agir.'
  },
  {
    id: 'fe-2',
    category: 'Fé e Esperança',
    theme: 'Esperança em Tempos de Crise',
    verse: 'Romanos 15:13 (NVI)',
    introduction: 'Quando o mundo oferece desespero, Deus nos oferece uma esperança viva. A esperança cristã não é um otimismo cego, mas uma âncora firme.',
    development: [
      '1. A Fonte da Esperança: "O Deus da esperança".',
      '2. O Meio da Esperança: "Encha-os de toda alegria e paz, por sua confiança nele".',
      '3. O Resultado da Esperança: "Para que vocês transbordem de esperança, pelo poder do Espírito Santo".'
    ],
    conclusion: 'A crise pode abalar nossas estruturas terrenas, mas nunca pode tocar na nossa esperança eterna em Cristo.',
    prayer: 'Senhor, enche-nos de alegria, paz e esperança. Que o Teu Espírito Santo nos renove hoje.',
    appeal: 'Se você está desesperançado, corra para os braços do Deus da esperança agora mesmo.'
  },
  {
    id: 'fe-3',
    category: 'Fé e Esperança',
    theme: 'A Fé que Agrada a Deus',
    verse: 'Hebreus 11:6 (NVI)',
    introduction: 'Muitas coisas impressionam os homens: riqueza, talento, poder. Mas apenas uma coisa agrada a Deus: a fé genuína.',
    development: [
      '1. A Necessidade da Fé: "Sem fé é impossível agradar a Deus".',
      '2. A Crença na Existência: "Pois quem dele se aproxima precisa crer que ele existe".',
      '3. A Crença na Recompensa: "E que recompensa aqueles que o buscam".'
    ],
    conclusion: 'A fé não é um salto no escuro, é um salto para os braços de um Pai amoroso e fiel.',
    prayer: 'Deus, queremos viver uma vida que Te agrade. Fortalece a nossa fé diária em Ti.',
    appeal: 'Você tem buscado a Deus com fé? Decida hoje confiar nEle de todo o seu coração.'
  },
  {
    id: 'fe-4',
    category: 'Fé e Esperança',
    theme: 'Esperando no Senhor',
    verse: 'Isaías 40:31 (NVI)',
    introduction: 'Vivemos na geração do imediatismo, mas o relógio de Deus é diferente do nosso. Aprender a esperar nEle é o segredo para a renovação das forças.',
    development: [
      '1. A Ação: "Aqueles que esperam no Senhor".',
      '2. A Promessa: "Renovam as suas forças".',
      '3. O Resultado: "Voam alto como águias; correm e não ficam exaustos, andam e não se cansam".'
    ],
    conclusion: 'A espera não é tempo perdido, é tempo de preparação. Deus fortalece aqueles que confiam no Seu tempo.',
    prayer: 'Senhor, ensina-nos a esperar em Ti com paciência. Renova nossas forças cansadas.',
    appeal: 'Você está cansado de lutar com suas próprias forças? Entregue o controle a Deus e espere nEle.'
  },
  {
    id: 'fe-5',
    category: 'Fé e Esperança',
    theme: 'A Certeza da Salvação',
    verse: '1 João 5:13 (NVI)',
    introduction: 'A dúvida sobre a salvação rouba a alegria do cristão. Deus não quer que vivamos na incerteza, mas na plena convicção da vida eterna.',
    development: [
      '1. O Propósito da Escrita: "Escrevi-lhes estas coisas".',
      '2. O Público-Alvo: "A vocês que crêem no nome do Filho de Deus".',
      '3. A Garantia: "Para que saibam que têm a vida eterna".'
    ],
    conclusion: 'Nossa salvação não depende do que sentimos, mas do que Cristo fez na cruz e da promessa da Sua Palavra.',
    prayer: 'Pai, obrigado pela garantia da salvação em Cristo. Que essa certeza nos traga paz profunda.',
    appeal: 'Se você tem dúvidas sobre sua salvação, reafirme sua fé em Jesus hoje e descanse na Sua promessa.'
  },

  // Categoria: Vida Cristã e Discipulado
  {
    id: 'vida-1',
    category: 'Vida Cristã e Discipulado',
    theme: 'O Custo do Discipulado',
    verse: 'Lucas 9:23 (NVI)',
    introduction: 'A salvação é de graça, mas o discipulado custa tudo. Jesus não nos chama apenas para sermos admiradores, mas seguidores comprometidos.',
    development: [
      '1. A Renúncia: "Negue-se a si mesmo". O fim do egoísmo.',
      '2. A Cruz Diária: "Tome diariamente a sua cruz". Disposição para sofrer por Cristo.',
      '3. A Caminhada: "E siga-me". Obediência contínua e imitação de Jesus.'
    ],
    conclusion: 'Seguir a Jesus custa a nossa própria vida, mas não segui-Lo custa a nossa eternidade.',
    prayer: 'Senhor, dá-nos coragem para negar a nós mesmos, tomar nossa cruz e Te seguir todos os dias.',
    appeal: 'Você está disposto a pagar o preço de ser um verdadeiro discípulo de Jesus?'
  },
  {
    id: 'vida-2',
    category: 'Vida Cristã e Discipulado',
    theme: 'Transformados pela Renovação da Mente',
    verse: 'Romanos 12:2 (NVI)',
    introduction: 'O mundo tenta nos espremer em seu molde, mas Deus nos chama para uma transformação de dentro para fora, começando pela nossa mente.',
    development: [
      '1. A Proibição: "Não se amoldem ao padrão deste mundo".',
      '2. O Processo: "Mas transformem-se pela renovação da sua mente".',
      '3. O Propósito: "Para que sejam capazes de experimentar e comprovar a boa, agradável e perfeita vontade de Deus".'
    ],
    conclusion: 'Uma mente cheia da Palavra de Deus resulta em uma vida que reflete a glória de Deus.',
    prayer: 'Deus, renova a nossa mente com a Tua Palavra. Livra-nos dos padrões deste mundo.',
    appeal: 'Entregue sua mente a Cristo hoje e deixe que Ele transforme suas atitudes e desejos.'
  },
  {
    id: 'vida-3',
    category: 'Vida Cristã e Discipulado',
    theme: 'O Fruto do Espírito',
    verse: 'Gálatas 5:22-23 (NVI)',
    introduction: 'O verdadeiro sinal de maturidade espiritual não são os dons que exercemos, mas o fruto que produzimos no nosso caráter.',
    development: [
      '1. A Origem do Fruto: É do Espírito, não do esforço humano.',
      '2. A Diversidade do Fruto: Amor, alegria, paz, paciência, amabilidade, bondade, fidelidade, mansidão e domínio próprio.',
      '3. A Liberdade do Fruto: "Contra essas coisas não há lei".'
    ],
    conclusion: 'Dons são dados, mas o fruto é cultivado. Precisamos permanecer na Videira para dar muito fruto.',
    prayer: 'Espírito Santo, produz em nós o Teu fruto. Que o nosso caráter seja cada vez mais parecido com o de Jesus.',
    appeal: 'Qual aspecto do fruto do Espírito você mais precisa desenvolver? Peça a ajuda de Deus hoje.'
  },
  {
    id: 'vida-4',
    category: 'Vida Cristã e Discipulado',
    theme: 'A Importância da Oração',
    verse: '1 Tessalonicenses 5:17 (NVI)',
    introduction: 'A oração é a respiração da alma. Um cristão que não ora é como um soldado que vai para a guerra sem comunicação com seu comandante.',
    development: [
      '1. A Frequência: "Orem continuamente".',
      '2. A Atitude: Uma vida de dependência constante de Deus.',
      '3. O Relacionamento: Oração não é apenas pedir, é comunhão com o Pai.'
    ],
    conclusion: 'Não temos tempo a perder, por isso precisamos orar. A oração move a mão Daquele que move o mundo.',
    prayer: 'Senhor, desperta em nós um espírito de oração. Que a nossa vida seja uma constante conversa Contigo.',
    appeal: 'Assuma o compromisso de dedicar um tempo diário e exclusivo para a oração a partir de hoje.'
  },
  {
    id: 'vida-5',
    category: 'Vida Cristã e Discipulado',
    theme: 'Vencendo a Tentação',
    verse: '1 Coríntios 10:13 (NVI)',
    introduction: 'A tentação não é pecado, mas ceder a ela sim. Deus nos garante que nunca enfrentaremos uma tentação maior do que podemos suportar.',
    development: [
      '1. A Realidade: "Não sobreveio a vocês tentação que não fosse comum aos homens".',
      '2. A Fidelidade de Deus: "E Deus é fiel; ele não permitirá que vocês sejam tentados além do que podem suportar".',
      '3. A Saída: "Mas, quando forem tentados, ele lhes providenciará um livramento".'
    ],
    conclusion: 'A vitória sobre a tentação não vem da nossa própria força, mas de confiar no livramento que Deus providencia.',
    prayer: 'Pai, livra-nos do mal. Dá-nos discernimento para ver a saída que Tu providencias nas horas de tentação.',
    appeal: 'Se você está lutando contra um pecado oculto, confesse a Deus hoje e aproprie-se do Seu livramento.'
  },

  // Categoria: Evangelismo e Missões
  {
    id: 'mis-1',
    category: 'Evangelismo e Missões',
    theme: 'A Grande Comissão',
    verse: 'Mateus 28:19-20 (NVI)',
    introduction: 'A Grande Comissão não é a "Grande Sugestão". É o mandamento final de Jesus para a Sua Igreja. Evangelismo é a nossa missão principal.',
    development: [
      '1. A Ordem: "Vão e façam discípulos de todas as nações".',
      '2. O Método: "Batizando-os... ensinando-os a obedecer a tudo o que eu lhes ordenei".',
      '3. A Promessa: "E eu estarei sempre com vocês, até o fim dos tempos".'
    ],
    conclusion: 'Uma igreja que não evangeliza está fossilizada. Fomos salvos para salvar.',
    prayer: 'Senhor, dá-nos paixão pelas almas perdidas. Que sejamos instrumentos de salvação na nossa geração.',
    appeal: 'Quem é a pessoa que você vai convidar para conhecer a Jesus esta semana?'
  },
  {
    id: 'mis-2',
    category: 'Evangelismo e Missões',
    theme: 'O Poder do Testemunho Pessoal',
    verse: 'Atos 1:8 (NVI)',
    introduction: 'Você não precisa ser um teólogo para evangelizar. Você só precisa ser uma testemunha do que Jesus fez na sua vida.',
    development: [
      '1. O Capacitador: "Mas receberão poder quando o Espírito Santo descer sobre vocês".',
      '2. A Identidade: "E serão minhas testemunhas".',
      '3. O Alcance: "Em Jerusalém, em toda a Judeia e Samaria, e até os confins da terra".'
    ],
    conclusion: 'O seu testemunho é a ferramenta mais poderosa que você tem. Ninguém pode argumentar contra uma vida transformada.',
    prayer: 'Espírito Santo, enche-nos de poder e ousadia para testemunhar do amor de Cristo onde quer que estejamos.',
    appeal: 'Abra a sua boca hoje e compartilhe o que Deus fez por você com alguém que precisa de esperança.'
  },
  {
    id: 'mis-3',
    category: 'Evangelismo e Missões',
    theme: 'A Urgência da Colheita',
    verse: 'João 4:35 (NVI)',
    introduction: 'Muitas vezes adiamos a obra de Deus achando que ainda há tempo. Mas Jesus nos alerta que os campos já estão prontos para a colheita.',
    development: [
      '1. A Visão Natural: "Vocês não dizem: \'Ainda faltam quatro meses para a colheita\'?".',
      '2. A Visão Espiritual: "Eu lhes digo: Abram os olhos e vejam os campos!".',
      '3. A Realidade: "Eles estão brancos para a colheita".'
    ],
    conclusion: 'As pessoas estão sedentas por verdade e amor. Não podemos cruzar os braços enquanto o mundo perece.',
    prayer: 'Senhor da seara, abre os nossos olhos espirituais para vermos a urgência da colheita ao nosso redor.',
    appeal: 'Não deixe para amanhã. Fale do amor de Jesus para alguém hoje mesmo.'
  },
  {
    id: 'mis-4',
    category: 'Evangelismo e Missões',
    theme: 'Sendo Sal da Terra e Luz do Mundo',
    verse: 'Mateus 5:13-14 (NVI)',
    introduction: 'Nossa presença no mundo deve fazer diferença. O cristão deve preservar a sociedade da corrupção e iluminar as trevas com a verdade.',
    development: [
      '1. O Sal da Terra: Dá sabor, preserva da corrupção e gera sede de Deus.',
      '2. A Luz do Mundo: Ilumina o caminho, revela a verdade e afasta as trevas.',
      '3. O Propósito: "Para que vejam as suas boas obras e glorifiquem ao Pai de vocês, que está nos céus" (v. 16).'
    ],
    conclusion: 'Sal no saleiro não salga, e luz debaixo da vasilha não ilumina. Precisamos nos envolver com o mundo sem nos contaminar com ele.',
    prayer: 'Deus, ajuda-nos a ser sal e luz na nossa família, no nosso trabalho e na nossa cidade.',
    appeal: 'Decida hoje viver de tal maneira que as pessoas vejam Cristo em suas atitudes diárias.'
  },
  {
    id: 'mis-5',
    category: 'Evangelismo e Missões',
    theme: 'A Mensagem da Reconciliação',
    verse: '2 Coríntios 5:18-20 (NVI)',
    introduction: 'O pecado separou o homem de Deus, mas a cruz construiu a ponte de volta. Nós somos os embaixadores dessa mensagem de paz.',
    development: [
      '1. A Obra de Deus: "Tudo isso provém de Deus, que nos reconciliou consigo mesmo por meio de Cristo".',
      '2. O Nosso Ministério: "E nos deu o ministério da reconciliação".',
      '3. A Nossa Identidade: "Portanto, somos embaixadores de Cristo".'
    ],
    conclusion: 'Um embaixador não fala por si mesmo, mas representa o seu Rei. Nossa mensagem é simples: Reconciliem-se com Deus!',
    prayer: 'Pai, obrigado por nos reconciliares Contigo. Usa-nos como Teus embaixadores neste mundo quebrado.',
    appeal: 'Se você ainda está longe de Deus, aceite hoje a oferta de reconciliação através de Jesus Cristo.'
  },

  // Categoria: Consolo e Encorajamento
  {
    id: 'cons-1',
    category: 'Consolo e Encorajamento',
    theme: 'Deus é o Nosso Refúgio',
    verse: 'Salmos 46:1 (NVI)',
    introduction: 'Quando o chão parece sumir sob os nossos pés, precisamos lembrar onde está a nossa verdadeira segurança. Deus é o nosso porto seguro.',
    development: [
      '1. Deus é o Nosso Refúgio: O lugar de proteção contra as tempestades.',
      '2. Deus é a Nossa Fortaleza: A fonte de força quando estamos fracos.',
      '3. Socorro Bem Presente: Ele não é um Deus distante, mas está conosco na angústia.'
    ],
    conclusion: 'O mundo pode desabar, mas aqueles que se abrigam em Deus permanecem inabaláveis.',
    prayer: 'Senhor, Tu és o nosso refúgio e fortaleza. Em meio às tribulações, corremos para os Teus braços.',
    appeal: 'Se você está com medo ou angustiado, encontre descanso e proteção no Senhor hoje.'
  },
  {
    id: 'cons-2',
    category: 'Consolo e Encorajamento',
    theme: 'A Paz que Excede o Entendimento',
    verse: 'Filipenses 4:6-7 (NVI)',
    introduction: 'A ansiedade é o mal do século, mas Deus tem um antídoto poderoso: a oração com ações de graças que resulta em paz.',
    development: [
      '1. A Ordem: "Não andem ansiosos por coisa alguma".',
      '2. A Solução: "Em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus".',
      '3. A Promessa: "E a paz de Deus, que excede todo o entendimento, guardará o coração e a mente de vocês em Cristo Jesus".'
    ],
    conclusion: 'A paz de Deus não é a ausência de problemas, mas a certeza da presença de Deus no meio dos problemas.',
    prayer: 'Pai, entregamos a Ti todas as nossas ansiedades. Guarda os nossos corações com a Tua paz incompreensível.',
    appeal: 'Troque hoje a sua ansiedade pela paz de Deus. Entregue seus fardos a Ele em oração.'
  },
  {
    id: 'cons-3',
    category: 'Consolo e Encorajamento',
    theme: 'O Bom Pastor Cuida das Ovelhas',
    verse: 'Salmos 23:1 (NVI)',
    introduction: 'O Salmo 23 é o poema mais reconfortante da Bíblia. Ele nos lembra que não estamos sozinhos na jornada da vida; temos um Pastor.',
    development: [
      '1. A Relação: "O Senhor é o meu pastor". Uma relação pessoal e íntima.',
      '2. A Provisão: "Nada me faltará". Ele supre todas as nossas necessidades reais.',
      '3. A Condução: Ele nos guia a pastos verdes e águas tranquilas, e restaura a nossa alma.'
    ],
    conclusion: 'Mesmo no vale da sombra da morte, não precisamos temer, porque o Pastor está conosco com Sua vara e Seu cajado.',
    prayer: 'Senhor, obrigado por seres o nosso Bom Pastor. Confiamos no Teu cuidado e na Tua provisão.',
    appeal: 'Deixe Jesus ser o Pastor da sua vida hoje. Ele guiará os seus passos em segurança.'
  },
  {
    id: 'cons-4',
    category: 'Consolo e Encorajamento',
    theme: 'O Choro Dura uma Noite',
    verse: 'Salmos 30:5 (NVI)',
    introduction: 'O sofrimento faz parte da vida humana, mas para o filho de Deus, a dor tem prazo de validade. A alegria da manhã é garantida.',
    development: [
      '1. A Ira Passageira: "Pois a sua ira só dura um instante".',
      '2. O Favor Duradouro: "Mas o seu favor dura a vida toda".',
      '3. A Promessa de Alegria: "O choro pode persistir uma noite, mas de manhã irrompe a alegria".'
    ],
    conclusion: 'A sua "noite" pode parecer longa e escura, mas o sol da justiça vai nascer trazendo cura em suas asas.',
    prayer: 'Deus, consola os corações que estão chorando nesta noite. Dá-nos a esperança da alegria que virá pela manhã.',
    appeal: 'Não desista no meio da noite escura. A alegria do Senhor está a caminho da sua vida.'
  },
  {
    id: 'cons-5',
    category: 'Consolo e Encorajamento',
    theme: 'Deus Enxugará Toda Lágrima',
    verse: 'Apocalipse 21:4 (NVI)',
    introduction: 'A nossa maior esperança não está nesta vida, mas na eternidade com Deus, onde o sofrimento será extinto para sempre.',
    development: [
      '1. O Fim da Dor: "Ele enxugará dos seus olhos toda lágrima".',
      '2. O Fim da Morte: "Não haverá mais morte".',
      '3. O Fim do Sofrimento: "Nem tristeza, nem choro, nem dor, pois a antiga ordem já passou".'
    ],
    conclusion: 'As aflições deste tempo presente não podem ser comparadas com a glória que nos será revelada. O melhor de Deus ainda está por vir.',
    prayer: 'Pai, ansiamos pelo dia em que estaremos Contigo para sempre. Que essa esperança nos sustente nas lutas de hoje.',
    appeal: 'Mantenha os seus olhos fixos na eternidade. Entregue sua vida a Jesus e garanta o seu lugar no céu.'
  },

  // Categoria: Liderança e Ministério
  {
    id: 'lid-1',
    category: 'Liderança e Ministério',
    theme: 'Liderança Servidora',
    verse: 'Marcos 10:43-45 (NVI)',
    introduction: 'O mundo ensina que liderar é mandar e ser servido. Jesus inverteu essa pirâmide e ensinou que o verdadeiro líder é aquele que serve.',
    development: [
      '1. O Contraste: "Não será assim entre vocês". O padrão do Reino é diferente.',
      '2. O Caminho da Grandeza: "Quem quiser tornar-se importante entre vocês deverá ser servo".',
      '3. O Exemplo Maior: "Pois nem mesmo o Filho do homem veio para ser servido, mas para servir e dar a sua vida em resgate por muitos".'
    ],
    conclusion: 'A autoridade espiritual não é conquistada pela força, mas pelo serviço sacrificial e pelo amor ao próximo.',
    prayer: 'Senhor, quebra o nosso orgulho. Ensina-nos a liderar com a toalha e a bacia nas mãos, lavando os pés dos nossos irmãos.',
    appeal: 'Se você exerce liderança, comprometa-se hoje a ser um líder que serve e inspira pelo exemplo.'
  },
  {
    id: 'lid-2',
    category: 'Liderança e Ministério',
    theme: 'O Chamado de Deus',
    verse: 'Jeremias 1:5 (NVI)',
    introduction: 'Deus não chama os capacitados, Ele capacita os escolhidos. O seu chamado foi estabelecido antes mesmo de você nascer.',
    development: [
      '1. O Conhecimento Prévio: "Antes de formá-lo no ventre eu o escolhi".',
      '2. A Consagração: "Antes de você nascer, eu o separei".',
      '3. A Missão: "E o designei profeta às nações".'
    ],
    conclusion: 'Você não é um acidente. Deus tem um propósito específico e um ministério para a sua vida. Não fuja do seu chamado.',
    prayer: 'Deus, ajuda-nos a compreender e abraçar o chamado que tens para nós. Dá-nos coragem para dizer "Eis-me aqui".',
    appeal: 'Responda ao chamado de Deus hoje. Coloque os seus dons e talentos à disposição do Reino.'
  },
  {
    id: 'lid-3',
    category: 'Liderança e Ministério',
    theme: 'Fidelidade no Pouco',
    verse: 'Mateus 25:21 (NVI)',
    introduction: 'Muitos querem grandes ministérios e palcos iluminados, mas Deus testa o nosso caráter na obscuridade e nas pequenas coisas.',
    development: [
      '1. O Elogio: "Muito bem, servo bom e fiel!".',
      '2. O Teste: "Você foi fiel no pouco".',
      '3. A Recompensa: "Eu o porei sobre o muito. Venha e participe da alegria do seu senhor!".'
    ],
    conclusion: 'A fidelidade nas pequenas tarefas é o passaporte para as grandes responsabilidades no Reino de Deus.',
    prayer: 'Senhor, ajuda-nos a ser fiéis naquilo que ninguém vê. Que o nosso serviço seja sempre para a Tua glória.',
    appeal: 'Sirva com excelência onde Deus te plantou hoje, mesmo que pareça insignificante.'
  },
  {
    id: 'lid-4',
    category: 'Liderança e Ministério',
    theme: 'O Perigo do Orgulho no Ministério',
    verse: 'Provérbios 16:18 (NVI)',
    introduction: 'O orgulho é o veneno mais sutil e letal para a vida de um líder. Ele nos faz esquecer que tudo o que temos e somos vem de Deus.',
    development: [
      '1. A Queda: "O orgulho vem antes da destruição".',
      '2. A Arrogância: "O espírito altivo, antes da queda".',
      '3. O Remédio: A humildade e o reconhecimento da nossa total dependência de Deus.'
    ],
    conclusion: 'Deus resiste aos soberbos, mas dá graça aos humildes. O palco do ministério é perigoso se não estivermos ajoelhados.',
    prayer: 'Pai, guarda o nosso coração do orgulho. Que toda a glória seja sempre dada a Ti.',
    appeal: 'Examine o seu coração hoje. Se o orgulho tem tomado espaço, humilhe-se diante do Senhor.'
  },
  {
    id: 'lid-5',
    category: 'Liderança e Ministério',
    theme: 'A Importância do Discipulador',
    verse: '2 Timóteo 2:2 (NVI)',
    introduction: 'O ministério não termina em nós; ele deve ser multiplicado. Um líder de sucesso é aquele que forma outros líderes.',
    development: [
      '1. O Recebimento: "E as coisas que me ouviu dizer".',
      '2. A Transmissão: "Confie a homens fiéis".',
      '3. A Multiplicação: "Que sejam também capazes de ensinar a outros".'
    ],
    conclusion: 'O legado de um líder não é medido pelo número de seguidores, mas pelo número de líderes que ele forma.',
    prayer: 'Senhor, dá-nos sabedoria para investir na vida de outras pessoas. Que possamos formar discípulos fiéis.',
    appeal: 'Quem você está discipulando? Comece a investir intencionalmente na vida de alguém esta semana.'
  },

  // Categoria: Jovens e Adolescentes
  {
    id: 'jov-1',
    category: 'Jovens e Adolescentes',
    theme: 'Pureza em um Mundo Impuro',
    verse: 'Salmos 119:9 (NVI)',
    introduction: 'A juventude é bombardeada por apelos à impureza. Como manter o coração e a mente limpos em uma cultura corrompida?',
    development: [
      '1. A Pergunta Crucial: "Como pode o jovem manter pura a sua conduta?".',
      '2. A Resposta Divina: "Vivendo de acordo com a tua palavra".',
      '3. A Prática: Esconder a Palavra no coração para não pecar contra Deus (v. 11).'
    ],
    conclusion: 'A pureza não é a ausência de tentação, mas a escolha diária de obedecer à Palavra de Deus acima dos desejos da carne.',
    prayer: 'Deus, fortalece os nossos jovens. Dá-lhes amor pela Tua Palavra para que vivam em pureza e santidade.',
    appeal: 'Jovem, tome a decisão hoje de guardar a Palavra de Deus no seu coração e viver uma vida pura.'
  },
  {
    id: 'jov-2',
    category: 'Jovens e Adolescentes',
    theme: 'Não Despreze a Sua Juventude',
    verse: '1 Timóteo 4:12 (NVI)',
    introduction: 'Muitas vezes, a sociedade e até a igreja subestimam o potencial dos jovens. Mas Deus chama jovens para serem exemplos e líderes.',
    development: [
      '1. A Exortação: "Ninguém o despreze pelo fato de você ser jovem".',
      '2. O Desafio: "Mas seja um exemplo para os fiéis".',
      '3. As Áreas de Exemplo: "Na palavra, no procedimento, no amor, na fé e na pureza".'
    ],
    conclusion: 'A idade não define a maturidade espiritual. Um jovem comprometido com Deus pode impactar toda uma geração.',
    prayer: 'Senhor, levanta uma geração de jovens que sejam exemplos de fé e amor. Usa-os poderosamente.',
    appeal: 'Jovem, não espere ficar velho para servir a Deus. Seja um exemplo hoje, onde você está.'
  },
  {
    id: 'jov-3',
    category: 'Jovens e Adolescentes',
    theme: 'Fugindo das Paixões da Juventude',
    verse: '2 Timóteo 2:22 (NVI)',
    introduction: 'A juventude é uma fase de paixões intensas. Paulo aconselha Timóteo não a lutar contra elas, mas a fugir e buscar o que é certo.',
    development: [
      '1. A Fuga: "Fuja dos desejos malignos da juventude".',
      '2. A Busca: "Siga a justiça, a fé, o amor e a paz".',
      '3. A Companhia: "Com aqueles que, de coração puro, invocam o Senhor".'
    ],
    conclusion: 'Fugir do pecado não é covardia, é sabedoria. E buscar a Deus em comunidade é a chave para a vitória.',
    prayer: 'Pai, dá aos nossos jovens a sabedoria para fugir do mal e a paixão para buscar a Tua justiça.',
    appeal: 'Afaste-se das amizades e ambientes que te levam a pecar. Busque andar com aqueles que amam a Deus.'
  },
  {
    id: 'jov-4',
    category: 'Jovens e Adolescentes',
    theme: 'Lembrando do Criador',
    verse: 'Eclesiastes 12:1 (NVI)',
    introduction: 'O mundo diz: "Aproveite a vida agora e pense em Deus depois". A Bíblia diz: "Lembre-se de Deus agora, para aproveitar a vida de verdade".',
    development: [
      '1. O Mandamento: "Lembre-se do seu Criador nos dias da sua juventude".',
      '2. O Motivo: "Antes que venham os dias difíceis e se aproximem os anos em que você dirá: Não tenho satisfação neles".',
      '3. O Benefício: Viver a juventude com propósito e evitar arrependimentos futuros.'
    ],
    conclusion: 'Entregar a juventude a Deus não é perder a vida, é encontrar a vida em sua plenitude.',
    prayer: 'Senhor, que os nossos jovens Te busquem enquanto há tempo. Que eles entreguem a força da juventude a Ti.',
    appeal: 'Não deixe Deus para o final da sua vida. Entregue o seu melhor e a sua juventude a Ele hoje.'
  },
  {
    id: 'jov-5',
    category: 'Jovens e Adolescentes',
    theme: 'Jovens Fortes na Palavra',
    verse: '1 João 2:14 (NVI)',
    introduction: 'A verdadeira força de um jovem não está nos músculos ou na popularidade, mas na sua capacidade de vencer o Maligno através da Palavra.',
    development: [
      '1. O Reconhecimento: "Jovens, eu lhes escrevi, porque vocês são fortes".',
      '2. O Segredo da Força: "E em vocês a Palavra de Deus permanece".',
      '3. A Vitória: "E vocês venceram o Maligno".'
    ],
    conclusion: 'Um jovem cheio da Palavra de Deus é uma arma letal contra o reino das trevas.',
    prayer: 'Deus, levanta jovens fortes e corajosos, que conheçam a Tua Palavra e vençam o inimigo.',
    appeal: 'Jovem, fortaleça-se na leitura e meditação da Bíblia. Essa é a sua maior arma.'
  },

  // Categoria: Datas Comemorativas
  {
    id: 'data-1',
    category: 'Datas Comemorativas',
    theme: 'O Verdadeiro Significado do Natal',
    verse: 'Isaías 9:6 (NVI)',
    introduction: 'O Natal foi sequestrado pelo consumismo, mas a sua essência é o maior presente que a humanidade já recebeu: o Filho de Deus.',
    development: [
      '1. O Presente: "Porque um menino nos nasceu, um filho nos foi dado".',
      '2. A Autoridade: "E o governo está sobre os seus ombros".',
      '3. Os Títulos: "Maravilhoso Conselheiro, Deus Poderoso, Pai Eterno, Príncipe da Paz".'
    ],
    conclusion: 'O Natal não é sobre presentes debaixo da árvore, mas sobre a presença de Cristo nos nossos corações.',
    prayer: 'Senhor, obrigado pelo dom inefável de Jesus. Que Ele nasça e reine em nossos corações todos os dias.',
    appeal: 'Neste Natal, abra o presente da salvação. Receba Jesus como seu Senhor e Salvador.'
  },
  {
    id: 'data-2',
    category: 'Datas Comemorativas',
    theme: 'A Vitória da Páscoa',
    verse: '1 Coríntios 15:55-57 (NVI)',
    introduction: 'A cruz parecia o fim, mas o túmulo vazio provou que era apenas o começo. A Páscoa é a celebração da vitória da vida sobre a morte.',
    development: [
      '1. O Desafio à Morte: "Onde está, ó morte, a sua vitória? Onde está, ó morte, o seu aguilhão?".',
      '2. A Causa da Morte: "O aguilhão da morte é o pecado, e a força do pecado é a lei".',
      '3. A Vitória em Cristo: "Mas graças a Deus, que nos dá a vitória por meio de nosso Senhor Jesus Cristo".'
    ],
    conclusion: 'Porque Ele vive, nós também viveremos. A ressurreição de Cristo é a garantia da nossa própria ressurreição.',
    prayer: 'Pai, celebramos a ressurreição do Teu Filho. Obrigado pela vitória sobre o pecado e a morte.',
    appeal: 'A morte não tem a última palavra. Creia no Cristo ressurreto e receba a vida eterna.'
  },
  {
    id: 'data-3',
    category: 'Datas Comemorativas',
    theme: 'Ação de Graças: Um Estilo de Vida',
    verse: '1 Tessalonicenses 5:18 (NVI)',
    introduction: 'A gratidão não deve ser apenas um evento anual, mas a atitude constante do coração cristão, independentemente das circunstâncias.',
    development: [
      '1. A Ordem: "Dêem graças em todas as circunstâncias".',
      '2. A Vontade de Deus: "Pois esta é a vontade de Deus para vocês em Cristo Jesus".',
      '3. O Desafio: Agradecer não "pelas" circunstâncias ruins, mas "nas" circunstâncias ruins.'
    ],
    conclusion: 'A gratidão muda a nossa perspectiva. Ela transforma o que temos em suficiente e atrai a presença de Deus.',
    prayer: 'Senhor, perdoa a nossa murmuração. Ensina-nos a ser gratos em todo o tempo e por todas as coisas.',
    appeal: 'Faça hoje uma lista das bênçãos de Deus na sua vida e passe o dia agradecendo a Ele.'
  },
  {
    id: 'data-4',
    category: 'Datas Comemorativas',
    theme: 'Ano Novo: Tempo de Recomeçar',
    verse: 'Lamentações 3:22-23 (NVI)',
    introduction: 'A virada do ano traz esperança de renovação. Mas a verdadeira renovação não vem do calendário, vem das misericórdias de Deus.',
    development: [
      '1. A Causa da Nossa Sobrevivência: "Graças ao grande amor do Senhor é que não somos consumidos".',
      '2. A Inesgotável Compaixão: "Pois as suas misericórdias são inesgotáveis".',
      '3. A Renovação Diária: "Renovam-se cada manhã; grande é a sua fidelidade".'
    ],
    conclusion: 'Não importa como foi o seu ano passado. Hoje é um novo dia, e as misericórdias de Deus estão frescas para você.',
    prayer: 'Deus, entregamos este novo ano em Tuas mãos. Confiamos na Tua fidelidade e nas Tuas misericórdias.',
    appeal: 'Deixe os erros do passado para trás. Receba o perdão de Deus e comece um novo capítulo na sua história.'
  },
  {
    id: 'data-5',
    category: 'Datas Comemorativas',
    theme: 'Dia das Mães: O Valor de uma Mãe Piedosa',
    verse: 'Provérbios 31:28-30 (NVI)',
    introduction: 'O papel da mãe é fundamental na formação do caráter e da fé. Uma mãe que teme ao Senhor é um tesouro inestimável.',
    development: [
      '1. O Reconhecimento da Família: "Seus filhos se levantam e a elogiam; seu marido também a elogia".',
      '2. A Ilusão da Beleza: "A beleza é enganosa, e a formosura é passageira".',
      '3. O Verdadeiro Valor: "Mas a mulher que teme ao Senhor será elogiada".'
    ],
    conclusion: 'A maior herança que uma mãe pode deixar não são bens materiais, mas o exemplo de uma vida de temor a Deus.',
    prayer: 'Senhor, abençoa todas as mães. Dá a elas sabedoria, força e graça para criarem seus filhos nos Teus caminhos.',
    appeal: 'Filhos, honrem e valorizem suas mães hoje e sempre. Mães, busquem o temor do Senhor acima de tudo.'
  },
  
  // Categoria: Cura e Libertação
  {
    id: 'cura-1',
    category: 'Cura e Libertação',
    theme: 'Jesus, o Médico dos Médicos',
    verse: 'Isaías 53:4-5 (NVI)',
    introduction: 'A doença e a dor entraram no mundo pelo pecado, mas Jesus veio para trazer cura completa: espiritual, emocional e física.',
    development: [
      '1. Ele Tomou as Nossas Dores: "Certamente ele tomou sobre si as nossas enfermidades".',
      '2. O Preço da Cura: "Mas ele foi transpassado por causa das nossas transgressões".',
      '3. A Promessa de Restauração: "E por suas feridas fomos curados".'
    ],
    conclusion: 'A cura não é apenas um milagre físico, mas um sinal do Reino de Deus invadindo a Terra. Jesus ainda cura hoje.',
    prayer: 'Senhor, clamamos pela Tua cura sobre os enfermos. Que o Teu poder restaurador flua sobre nós.',
    appeal: 'Se você precisa de cura, entregue a sua enfermidade a Jesus com fé e confie na Sua vontade soberana.'
  },
  {
    id: 'cura-2',
    category: 'Cura e Libertação',
    theme: 'Libertos para Viver',
    verse: 'João 8:36 (NVI)',
    introduction: 'Muitos vivem aprisionados por vícios, medos e pecados do passado. Mas a verdadeira liberdade só é encontrada em Cristo.',
    development: [
      '1. A Ilusão da Liberdade: O pecado promete liberdade, mas escraviza.',
      '2. O Agente Libertador: "Portanto, se o Filho os libertar".',
      '3. A Verdadeira Liberdade: "Vocês de fato serão livres".'
    ],
    conclusion: 'Cristo não nos liberta para fazermos o que queremos, mas para fazermos o que devemos, com alegria.',
    prayer: 'Pai, quebra as correntes que nos prendem. Liberta-nos de tudo o que nos afasta de Ti.',
    appeal: 'Qual é a sua prisão hoje? Clame pelo nome de Jesus e receba a verdadeira liberdade.'
  },
  {
    id: 'cura-3',
    category: 'Cura e Libertação',
    theme: 'A Cura das Emoções',
    verse: 'Salmos 147:3 (NVI)',
    introduction: 'As feridas emocionais muitas vezes doem mais que as físicas e demoram mais para sarar. Mas Deus é especialista em restaurar corações quebrantados.',
    development: [
      '1. O Diagnóstico: "Corações quebrantados". A dor da rejeição, do luto e da traição.',
      '2. O Médico: "Ele cura os de coração quebrantado".',
      '3. O Tratamento: "E cuida das suas feridas". O cuidado amoroso e paciente de Deus.'
    ],
    conclusion: 'Não esconda suas feridas de Deus. Ele não pode curar aquilo que você se recusa a entregar a Ele.',
    prayer: 'Senhor, traz cura para as nossas emoções feridas. Sara as memórias dolorosas do nosso passado.',
    appeal: 'Entregue o seu coração ferido ao Senhor hoje. Permita que Ele enfaixe as suas feridas com o Seu amor.'
  },
  {
    id: 'cura-4',
    category: 'Cura e Libertação',
    theme: 'Vencendo o Medo',
    verse: '2 Timóteo 1:7 (NVI)',
    introduction: 'O medo paralisa e nos impede de viver os propósitos de Deus. Mas o medo não vem de Deus; Ele nos deu armas para vencê-lo.',
    development: [
      '1. A Origem do Medo: "Pois Deus não nos deu espírito de covardia".',
      '2. O Antídoto do Poder: A força do Espírito Santo em nós.',
      '3. O Antídoto do Amor e Equilíbrio: O amor lança fora o medo, e o equilíbrio nos dá clareza.'
    ],
    conclusion: 'A coragem não é a ausência de medo, mas a decisão de agir apesar do medo, confiando no poder de Deus.',
    prayer: 'Deus, repreende todo espírito de medo nas nossas vidas. Enche-nos de poder, amor e equilíbrio.',
    appeal: 'Não deixe o medo ditar as suas escolhas. Dê um passo de fé hoje, confiando no Senhor.'
  },
  {
    id: 'cura-5',
    category: 'Cura e Libertação',
    theme: 'A Libertação do Passado',
    verse: 'Filipenses 3:13-14 (NVI)',
    introduction: 'Muitos cristãos vivem acorrentados aos erros do passado, incapazes de avançar. Paulo nos ensina o segredo para deixar o passado para trás.',
    development: [
      '1. O Foco: "Uma coisa faço". A necessidade de concentração espiritual.',
      '2. O Esquecimento: "Esquecendo-me das coisas que ficaram para trás". O perdão de Deus e o auto-perdão.',
      '3. O Avanço: "Avançando para as que estão adiante, prossigo para o alvo".'
    ],
    conclusion: 'Você não pode mudar o seu passado, mas em Cristo, você pode mudar o seu futuro.',
    prayer: 'Senhor, ajuda-nos a soltar as amarras do passado. Que possamos correr com perseverança a corrida que nos é proposta.',
    appeal: 'Pare de olhar pelo retrovisor da vida. Olhe para frente, para o alvo que é Cristo Jesus.'
  },

  // Categoria: Finanças e Mordomia
  {
    id: 'fin-1',
    category: 'Finanças e Mordomia',
    theme: 'O Princípio da Semeadura',
    verse: '2 Coríntios 9:6-7 (NVI)',
    introduction: 'A forma como lidamos com o nosso dinheiro revela onde está o nosso coração. Deus nos chama para sermos generosos, não por obrigação, mas com alegria.',
    development: [
      '1. A Lei da Colheita: "Quem semeia pouco, também colherá pouco; e quem semeia com fartura, também colherá com fartura".',
      '2. A Decisão Pessoal: "Cada um dê conforme determinou em seu coração".',
      '3. A Atitude Correta: "Não com pesar ou por obrigação, pois Deus ama quem dá com alegria".'
    ],
    conclusion: 'A generosidade não é sobre a quantidade que damos, mas sobre a atitude do nosso coração ao dar.',
    prayer: 'Pai, livra-nos da avareza. Ensina-nos a ser generosos e a semear com alegria no Teu Reino.',
    appeal: 'Examine o seu coração hoje. Você tem sido um semeador generoso ou tem retido o que pertence a Deus?'
  },
  {
    id: 'fin-2',
    category: 'Finanças e Mordomia',
    theme: 'Buscando o Reino em Primeiro Lugar',
    verse: 'Mateus 6:33 (NVI)',
    introduction: 'A ansiedade financeira consome muitas vidas. Jesus nos ensina a inverter as nossas prioridades para encontrarmos a verdadeira provisão.',
    development: [
      '1. A Prioridade Errada: Buscar as coisas materiais acima de tudo (v. 32).',
      '2. A Prioridade Certa: "Busquem, pois, em primeiro lugar o Reino de Deus e a sua justiça".',
      '3. A Promessa de Provisão: "E todas essas coisas lhes serão acrescentadas".'
    ],
    conclusion: 'Quando cuidamos das coisas de Deus em primeiro lugar, Ele cuida das nossas necessidades.',
    prayer: 'Senhor, perdoa-nos por invertermos as prioridades. Ajuda-nos a buscar o Teu Reino acima de tudo.',
    appeal: 'Qual tem sido a prioridade da sua vida? Coloque Deus em primeiro lugar nas suas finanças e decisões hoje.'
  },
  {
    id: 'fin-3',
    category: 'Finanças e Mordomia',
    theme: 'A Sabedoria na Administração Financeira',
    verse: 'Provérbios 21:20 (NVI)',
    introduction: 'Deus nos abençoa com recursos, mas espera que sejamos bons administradores (mordomos) daquilo que Ele nos confia.',
    development: [
      '1. O Padrão do Sábio: "Na casa do sábio há comida e azeite armazenados". A importância da poupança e do planejamento.',
      '2. O Padrão do Tolo: "Mas o tolo devora tudo o que pode". O perigo do consumismo e do desperdício.',
      '3. O Princípio da Mordomia: Tudo pertence a Deus, nós somos apenas administradores.'
    ],
    conclusion: 'A sabedoria financeira não é sobre ganhar muito, mas sobre administrar bem o que se ganha para a glória de Deus.',
    prayer: 'Deus, dá-nos sabedoria para administrar os recursos que nos confiaste. Livra-nos do desperdício e das dívidas.',
    appeal: 'Comece hoje a fazer um planejamento financeiro sábio. Honre a Deus com a sua administração.'
  },
  {
    id: 'fin-4',
    category: 'Finanças e Mordomia',
    theme: 'O Perigo do Amor ao Dinheiro',
    verse: '1 Timóteo 6:10 (NVI)',
    introduction: 'O dinheiro em si não é mau, mas o amor a ele é a raiz de muitos males. O dinheiro é um excelente servo, mas um péssimo senhor.',
    development: [
      '1. A Raiz do Mal: "O amor ao dinheiro é a raiz de todos os males".',
      '2. O Desvio da Fé: "Algumas pessoas, por cobiçarem o dinheiro, desviaram-se da fé".',
      '3. O Resultado: "E atormentaram a si mesmas com muitos sofrimentos".'
    ],
    conclusion: 'A verdadeira riqueza não é medida pelo saldo bancário, mas pela paz de espírito e pela comunhão com Deus.',
    prayer: 'Senhor, guarda o nosso coração da ganância. Que o nosso maior tesouro seja sempre a Tua presença.',
    appeal: 'O dinheiro tem sido o senhor da sua vida? Arrependa-se hoje e coloque Cristo de volta no trono do seu coração.'
  },
  {
    id: 'fin-5',
    category: 'Finanças e Mordomia',
    theme: 'O Contentamento Cristão',
    verse: 'Filipenses 4:11-13 (NVI)',
    introduction: 'Vivemos em uma cultura de insatisfação constante. O apóstolo Paulo nos ensina o segredo do contentamento, independentemente das circunstâncias.',
    development: [
      '1. O Aprendizado: "Aprendi a adaptar-me a toda e qualquer circunstância". O contentamento não é natural, é aprendido.',
      '2. A Experiência: "Sei o que é passar necessidade e sei o que é ter fartura".',
      '3. O Segredo: "Tudo posso naquele que me fortalece". A força vem de Cristo, não das circunstâncias.'
    ],
    conclusion: 'O contentamento não é conformismo, é a paz profunda de saber que Deus é suficiente para nós.',
    prayer: 'Pai, ensina-nos o segredo do contentamento. Que possamos encontrar a nossa plena satisfação em Cristo.',
    appeal: 'Pare de murmurar pelo que você não tem e comece a agradecer a Deus pelo que Ele já te deu.'
  }
];
