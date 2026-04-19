export interface Lesson {
  id: number;
  title: string;
  theme?: string;
  content: string;
  leaderGuide?: string;
  hasAttachment?: boolean;
}

export const lessons: Lesson[] = Array.from({ length: 50 }, (_, i) => {
  const id = i + 1;
  let content = `Este é o conteúdo detalhado da Lição ${String(id).padStart(2, '0')}. Aqui você encontrará ensinamentos profundos e reflexões sobre a Palavra.`;
  let leaderGuide = undefined;
  
  if (id === 11) {
    content = `
# LIÇÃO DE CÉLULA – Nº 11 ANO 26 – 2ª SEMANA – SÉRIE: COMBUSTÍVEL

<br/>

## **TEMA: A MEDIDA DO AMOR**

<br/>

### **TEXTO: JOÃO 13:34-35**

---

<br/>

**BATE PAPO INICIAL:** 
O que significa amar como Cristo amou? Como Ele nos amou na vida e na morte? Antes e hoje?

<br/>

---

# **INTRODUÇÃO**
O amor ao próximo nas Escrituras tem quatro níveis: 
1º Nível = Amar o amigo e odiar o inimigo (VT). 
2º Nível = Amar os inimigos e orar por eles (Sermão do Monte). 
3º Nível = Amar ao próximo COMO a ti mesmo (Resumo da Lei). 
4º Nível = “Ame como EU vos amei.” 

E como Ele nos amou? Dando a sua vida. Não tem nenhuma outra forma maior de amor. E se queremos ser como Ele... É assim que devemos amar. Você está disposto amar com esta medida?

---

# **DESENVOLVIMENTO**
O amor é o maior combustível do cristão. Mas, precisamos aprofundar nele. Enquanto Jesus ensinou a amar como a nós mesmos, foi desafiador, mas praticável, pois igualava a nossa necessidade de amar ao próximo assim (na mesma proporção) como nós nos amamos. Veja que esse nível de amor agride o egoísmo, mas não o destrói, pois ainda permite que preservemos o nosso amor-próprio. 

Agora amar como Cristo a ponto de dar a vida, aí a coisa muda completamente, pois isso requer um nível de entrega total e absoluta. Assim, consiste no aniquilamento completo e irrestrito de todos os nossos amores: seja a nós mesmos e aos outros. Diante disso precisamos nos perguntar: Que nível de amor é o meu? Estou disposto a morrer por pessoas que nem conheço, não gosto ou que me faz mal? 

Sei que este discurso é duro, mas é bíblico: Se não estamos dispostos a morrer para que o descrente conheça a Deus, não estamos obedecendo o NOVO MANDAMENTO de Jesus - Não podemos ser conhecidos ou chamados de cristãos, pois não o estamos imitando. Precisamos nascer de novo. 

Dizemos tanto que amamos, mas é cultural e muitas vezes mentiroso. Amar exige atitude! Jesus nos amou com o amor Ágape – é Divido, pois Deus é Amor (1 Jo 4:8) – é um amor incondicional, altruísta e sacrificial. É esse amor que precisa habitar em nós, senão seremos apenas religiosos e dos ruins ainda, pois a maioria de nós não chegamos nem aos pés dos Fariseus – e mesmo assim, foram rejeitados por Jesus.

Paulo entendeu a profundidade e a necessidade desse amor ao descrecer que tudo que fazemos sem amor, NÃO TEM NENHUM VALOR, é só barulho (1 Cor 13). Não importa o que fazemos, ou o quanto fazemos, se não estamos dispostos a morrer pelas pessoas, não estamos praticando o NOVO MANDAMENTO ordenado por Jesus.

---

# **CONCLUSÃO:** 
Como ter esse amor na minha vida? Saiba que para o homem é IMPOSSÍVEL... Nenhum homem é capaz de desenvolver esse amor por si mesmo - como um ato racional e voluntário da sua vontade. O amor Ágape precisa ser derramado no coração pelo ESPÍRITO SANTO (Rm 5:5). Portanto, é uma obra de Deus. Sem ela continuaremos a sermos bons crentes, mas nunca seremos bons cristãos. Quem deseja ter este combustível na sua vida?`;
  } else if (id === 12) {
    content = `
# LIÇÃO DE CÉLULA – Nº 12 ANO 26 – 3ª SEMANA – 15 A 21/04 – SÉRIE: COMBUSTÍVEL

<br/>

## **TEMA: O ÂNIMO DOBRE – PARTE I**

<br/>

### **TEXTO: TIAGO 1:6-8**

---

<br/>

**BATE PAPO INICIAL:** 
Você já começou algo com muito entusiasmo (uma dieta, a academia, um curso, um projeto) e desistiu no meio do caminho ou quando surgiram as primeiras dificuldades? Compartilhe brevemente.

<br/>

---

# **INTRODUÇÃO**
O termo "ânimo dobre" vem do grego "dipsychos" que significa ‘homem de duas almas’. Portanto, refere-se a uma mente dividida, um coração em conflito e uma vontade instável. É a condição daquela pessoa que "um dia quer ganhar o mundo para Jesus, e no outro não quer nem sair do sofá". Essa inconstância não afeta apenas a vida espiritual, mas todos os caminhos e decisões dessa pessoa: trabalho, família, finanças e saúde. Para vencer, precisamos primeiro identificar como as raízes do ânimo dobre tem operado em nós. Será que nos falta vontade? Integridade? Ou, temos outras raízes ainda mais profundas do que estas? Vamos refletir sobre isso?

---

# **DESENVOLVIMENTO**
## **TRÊS CARACTERÍSTICAS DO ‘ÂNIMO DOBRE’**
Ele pode se manifestar tanto no desânimo; quanto num súbito ânimo contrário noutra direção. Para facilitar a nossa reflexão, vamos dividir o ânimo dobre em três pilares fundamentais:

**A. Inconstância em TODOS os caminhos** = O ânimo dobre não fica isolado. Ele pode até começar na igreja, mas, tende a se espalhar por outras áreas: projetos no trabalho ou disciplina nos estudos, fidelidade no casamento... Tiago alerta: quem oscila não recebe NADA de Deus - a dúvida destrói a fé (Deus) e a convicção (nós mesmos).

**B. A Escravidão das Emoções e Circunstâncias** = Diferente dos "campeões" que mantêm o foco mesmo em dias ruins, a pessoa de ânimo dobre é guiada pelo que sente no momento. Se o sentimento é bom, ela produz; se acorda desanimada, ela procrastina. Contudo, o ânimo é uma decisão, e não apenas um sentimento passageiro.

**C. Falta de Zelo e Responsabilidade** = O ânimo dobre se estabelece nas pequenas coisas que são negligenciadas e como já dissemos: vai lançando a base para a desistência das grandes coisas:
* **Atrasos constantes** (o atraso a um compromisso é uma forma de "roubar o tempo alheio").
* **Desorganização pessoal** e falta de cuidado com a saúde é outro reflexo da pessoa inconstante.
* **Dificuldade em honrar a palavra** e compromissos financeiros. A pessoa se acostuma a ter dívidas e não as pagar; ela se defende mentalmente e cria compensações para justificar sua irresponsabilidade.
* O hábito de **"procrastinar”** e a dificuldade de dizer **“não"** para a carne (distrações: redes sociais, vídeos...).

O ânimo dobre tem muitas causas, mas as principais são: falta de fé e falta de integridade na tentativa de servir a dois senhores e como Jesus ensinou: isso é impossível (Mt 6:24). Agostinho escreveu que o pecado desordenou os amores humanos. E Paulo relatou a grande luta entre a carne e o espírito, e demonstra que até mesmo ele – experimentou a força da carne em relação ao preparo do espírito (Rm 7:15-25). Ou seja, ninguém está imune a esse conflito. Jesus nos ensinou a vigiar constantemente antes mesmo de orar (Mt 26:41). Tiago ensina em Tg 4:8 convida os de ânimo dobre a: chegar a Deus; Purificar as mãos e Limpar o coração. Ou seja, é possível sermos transformados, e perceba que as três atitudes são ações que pertencem a nós e não a Deus.

---

# **CONCLUSÃO:** 
Creia que é possível mudar. A transformação pode estar a um passo, a uma porta, a uma palavra... siga em frente, confiando que Deus está no controle, no comando e direção da vida. A nós cabe 3 coisas: confiar, esperar e agir, a seu tempo, quando Deus assim nos ordenar, mesmo sem vermos ou sentirmos - Esta é a maior faceta da fé! 

**P.S.** Essa lição foi inspirada no meu livro “Ânimo Dobre” que será lançado em Junho/2026 – Reserve já o seu!
`;
    leaderGuide = `## 1. Aprofundamento Teológico
“O ânimo dobre é uma fragmentação da Alma”

### A Etimologia e o Contexto 
O termo grego dipsychos (Tiago 1:8; 4:8) é uma palavra composta: dis (duas vezes) e psyche (alma/mente). Curiosamente, essa palavra não aparece na literatura grega clássica ou na Septuaginta (LXX); muitos estudiosos acreditam que o próprio Tiago a cunhou para descrever a exigência VT de amar a Deus com todo o coração (Dt 6:4-5).
* Conexão no Antigo Testamento: O correspondente hebraico seria o "coração e coração" (leb wa leb) de Salmos 12:2, descrevendo alguém que fala com duplicidade.
* O Dicionário de Kittel (TDNT): Define o homem de ânimo dobre como aquele que deseja desfrutar de dois mundos; ele quer a segurança de Deus, mas não renuncia à autonomia do "eu".

### A Luta de Agostinho e a Vontade Dividida
Em suas Confissões, Santo Agostinho descreve perfeitamente esse estado: "Eu era aquele que queria e aquele que não queria. Era eu mesmo em ambos os lados... mas eu não estava inteiro em nenhum". O ânimo dobre é uma vontade doente que não consegue se decidir pela Verdade. Essa mesma luta é descrita também por Paulo (Rm 7:18-24).

### Referências Bíblicas de Apoio:
* Mateus 6:24: A impossibilidade de servir a dois senhores (A raiz da divisão).
* 1 Reis 18:21: Elias confronta o povo: "Até quando coxeareis entre dois pensamentos?"
* Oséias 10:2: "O seu coração está dividido; por isso serão culpados".

## 2. Sugestão de Quebra-Gelo: "O Conflito de Comandos"
Objetivo: Mostrar como a divisão interna gera paralisia e erro.
1. Formar uma fila com os participantes uns 4 ou 5 participantes.
2. Combine (secretamente) com o participante que ficará à frente para errar os comandos. E de vez em quando conversar com o pessoal atrás. 
3. Comandos: “Direita”; “Esquerda”; “Abaixa”; “Levanta”; "Pule!", "Mão na cabeça". Começa devagar e vai aumentando o ritmo.
** A ideia é o participante da frente induzir os demais ao erro.
Lição: Somos induzidos a seguir o que vemos e não o que ouvimos. Estamos ouvindo a voz de Deus, na mesma proporção que vemos Deus nas pessoas?

## 3. Dinâmica de Perguntas
### Perguntas Retóricas (Para despertar a consciência)
* "Se a sua vida fosse um barco sem leme, ao sabor das ondas das suas emoções, onde você estaria daqui a cinco anos?"
* "Deus pode confiar uma grande missão a alguém que não consegue cumprir um pequeno compromisso de horário?"
* "Quem está sentado no trono da sua vontade hoje: o seu propósito em Cristo ou o seu sentimento do momento?"

### Perguntas de Aprofundamento (Para análise de raízes)
* Tiago associa o ânimo dobre à dúvida (Tg 1:6). Em qual área da sua vida a falta de confiança no caráter de Deus tem gerado instabilidade?
* O texto diz que o inconstante "não recebe nada do Senhor". Por que a integridade é um pré-requisito para a recepção das promessas divinas?
* Como a cultura do "imediatismo" e das redes sociais tem alimentado a nossa inconstância?

### Perguntas Práticas (Para mudança de comportamento)
* Qual é o "projeto inacabado" que você precisa retomar ou encerrar formalmente esta semana para limpar sua estrutura mental?
* Cite uma área onde você tem sido guiado pelo "sentir" e não pelo "decidir". O que muda se você inverter essa lógica amanhã?
* No que diz respeito à pontualidade e palavra empenhada, qual ajuste imediato o Espírito Santo está te pedindo agora?

## 4. Dicas para a Ministração da Lição
1. Fuja do Moralismo: Não foque apenas no "pare de procrastinar". Foque no "purifique o coração". A inconstância externa é apenas o sintoma de uma deslealdade interna.
2. Seja Vulnerável: Como líder, compartilhe um momento em que você se sentiu um "órfão espiritual" ou tentou barganhar com Deus. Isso gera conexão.
3. Ênfase na Soberania: Lembre ao grupo que o ânimo dobre pode ser uma tentativa de autocontrole que entra em conflito com a confiança em Deus. Quando confiamos em Deus (temos um ânimo firme) porque Ele é imutável, enquanto nós somos mutáveis.

## 5. Ganchos para Evangelismo (Dicas Práticas)
O tema do ânimo dobre toca na ferida da ansiedade moderna.
* O Gancho da Paz: "Você se sente exausto por tentar ser várias pessoas ao mesmo tempo ou por nunca terminar o que começa? Jesus oferece o jugo que é suave e que unifica o coração".
* O Gancho do Propósito: "Muitas pessoas buscam o sentido da vida, mas o perdem porque mudam de direção a cada dificuldade. Conhecer a Cristo é encontrar a 'âncora da alma' (Hb 6:19)".
* O Convite: Convide o visitante a entregar não apenas seus problemas, mas a sua vontade a Cristo.

## 6. Finalizando a Lição
Líder, lembre-se: Tiago 4:8 apresenta uma progressão: Chegar-se -> Purificar as mãos (ações externas) -> Limpar o coração (motivações internas). Não espere "sentir vontade" para ser constante. A constância é o terreno onde o milagre caminha. Tenha uma mensagem de motivação, desafio e até correção, mas jamais esqueça de finalizar ministrando fé, esperança e graça.`;
  } else if (id === 13) {
    content = `
# LIÇÃO DE CÉLULA – Nº 13 ANO 26 – 4ª SEMANA – 22 A 28/04 – SÉRIE: COMBUSTÍVEL

<br/>

## **TEMA: O ÂNIMO DOBRE – PARTE II**

<br/>

### **TEXTO: TG 4:8**

---

<br/>

# **INTRODUÇÃO**
Na lição passada, aprendemos que o ânimo dobre caracteriza uma alma dividida, instável e guiada por emoções. Como consequência, torna a pessoa inconstante em todos os seus caminhos, impedindo-a de receber as bênçãos do Senhor. O ânimo dobre atua como um veneno que altera o nosso "DNA de Filho", ofuscando a nossa visão de Reino e limitando os nossos sonhos e ministérios.

Para neutralizar esse mal, o mero esforço humano não é suficiente. É necessário aplicar antídotos bíblicos que tratam a raiz da inconstância, devolvendo ao cristão a firmeza necessária para caminhar com integridade e fazer a vontade do Pai em tudo. A partir de agora, estudaremos esses antídotos. Eles funcionarão como armas de defesa e ataque, ajudando-nos a identificar como, onde e por que o desânimo invade a nossa mente. O combate ao "ânimo dobre" começa na nossa essência: estabelecendo quem somos em Deus, como cremos n'Ele e como lidamos com as adversidades.

---

# **DESENVOLVIMENTO**
## **1º ANTÍDOTO: Restaurando a IDENTIDADE em Deus**

**Conceito:** Ter uma identidade firme em Deus é, essencialmente, permitir que a voz do Criador seja a única verdade sobre quem você é, silenciando as opiniões do mundo, as suas próprias falhas e as circunstâncias. A Bíblia ensina que fomos criados à imagem e semelhança de Deus (Gn 1:27), mas o pecado distorceu essa visão. A boa notícia é que, em Cristo, recebemos uma nova identidade: a todos os que O receberam, foi dado o direito de se tornarem filhos de Deus (Jo 1:12). Ter uma identidade firme significa que a sua base não está no que você faz, mas em quem você é: um filho amado.

**Vantagens:** A convicção da sua identidade em Deus proporciona três grandes benefícios:
* **Segurança Inabalável:** Você não é destruído pelas críticas nem envaidecido pelos elogios, pois a sua aprovação já foi conquistada na cruz.
* **Propósito Bem Definido:** Você compreende que é "obra-prima" de Deus, criado para boas obras (Ef 2:10). Isso transforma a sua visão sobre o trabalho, a família e os desafios diários.
* **Pertencimento:** Você deixa de agir como um órfão espiritual, exausto de tentar provar o seu valor, e passa a viver como um legítimo herdeiro do Reino.

**O Problema:** Quando buscamos validação nas pessoas, no dinheiro, na fama ou no poder, tornamo-nos escravos da aprovação alheia. Na igreja, isso gera um ativismo religioso sufocante; no mundo, cria consumidores compulsivos, sempre com a necessidade de exibir posses, ganhos e novidades para se impor sobre os outros. Sem uma identidade firme, a pessoa é guiada por emoções momentâneas, fofocas e banalidades, sendo dominada por ciúme, inveja, cobiça e arrogância. Se o mundo não gira ao seu redor, ela se fere profundamente, tornando-se vitimista, depressiva, murmuradora e negativa. Por ser propensa à discórdia, à rebeldia e ao legalismo, torna-se uma companhia difícil, que vive na defensiva e sempre espera o pior dos outros.

**A Solução:** Assuma a sua identidade de Filho de Deus, independentemente do que você tem ou faz. A filiação é uma convicção que precede as obras — lembre-se de que Jesus foi aprovado pelo Pai antes mesmo de realizar Seu primeiro milagre. Saiba e creia que você é filho por adoção, resgatado pelo poder da Graça, da Misericórdia e do Amor de Deus. Tudo é por Ele e para Ele. Pare de dar ouvidos às acusações do inimigo e passe a usufruir dessa bênção. O discurso opressor do “tem que fazer, tem que ter, tem que ganhar” destrói a identidade de filho e nos rebaixa a meros "empregados" de Deus. O bom filho trabalha para o pai por amor, gratidão e honra, e nunca por barganha, obrigação ou pressão. A promessa de Jesus é descanso e paz, não mais correntes e fardos. Assim como Jesus venceu as tentações no deserto amparado pelo amor do Pai, nós venceremos o ânimo dobre firmando nossa identidade na Graça, e não nas exigências humanas.

**Ponto Chave:** Deus se agrada do nosso coração, não apenas das nossas obras — como fica claro na diferença entre as ofertas de Caim e Abel. O convite é para sermos filhos adoradores (como Maria aos pés de Jesus), e não apenas "servos trabalhadores" exaustos por tarefas (como Marta).

---

# **CONCLUSÃO**
A verdadeira libertação da inconstância não provém do esforço exaustivo para provar o seu valor, mas da compreensão profunda da sua identidade como filho amado de Deus. Ao entender que a sua aprovação já foi garantida na cruz, você se liberta do peso da performance e da necessidade de validação humana, deixando de agir como um órfão ou um funcionário focado apenas em bater metas. Quando essa verdade cria raízes no coração, o foco muda do que você "tem que fazer" para quem você "é" no Reino, fazendo com que as emoções oscilantes, o medo e o desânimo percam a sua força. Isso dá lugar a uma paz genuína e a uma convicção que o capacitam a enfrentar tempestades, avançando com integridade, constância e sem olhar para trás.

---

# **PERGUNTAS PARA DISCUSSÃO EM GRUPO**
1. Por que é mais fácil nos vermos como "empregados" de Deus do que como "filhos" amados?
2. Como a necessidade de aprovação das pessoas afeta a sua constância na igreja e na vida pessoal?
3. De que maneira a história de Marta e Maria (Lucas 10:38-42) nos ajuda a entender a diferença entre "fazer" e "ser"?
`;

    leaderGuide = `
## GUIA DO LÍDER: Antídotos Contra o Ânimo Dobre
**Tema 1: Restaurando a Identidade em Deus**

## 1. Fundamentação Teológica e Aprofundamento
Para ensinar sobre identidade, precisamos entender o termo grego para "ânimo dobre" em Tiago 1:8: "dipsuchos" (di = dois; psuche = alma/mente). Significa literalmente "alguém com duas almas". É uma fragmentação do ser. A cura para a fragmentação é a integridade, que vem de saber quem se é em Deus.

* **A Imago Dei (Imagem de Deus):** O Dicionário Teológico de Beacon define que a "imagem" (Gn 1:26) não é física, mas moral e relacional. O pecado não destruiu a imagem, mas a desfigurou. Em Cristo, somos "re-formados". Nossa identidade não é uma construção social, mas uma revelação espiritual.
* **Adoção (Huiothesia):** Em Romanos 8:15, Paulo usa o termo huiothesia. No mundo romano, um filho adotivo era escolhido deliberadamente e todas as suas dívidas passadas eram canceladas. Ele recebia o nome e a herança do pai. Ter identidade de filho é viver sob o "cancelamento da dívida" e a "posse da herança".
* **O Erro de Marta (Lucas 10:38-42):** O termo para "andava ansiosa/atarefada" é periespato, que significa "ser puxado em diferentes direções". Isso é o ânimo dobre. Maria, ao escolher a "boa parte", buscou a unidade do ser aos pés de Cristo.

## 2. Sugestão de Quebra-Gelo: "O Rótulo Escondido"
**Objetivo:** Demonstrar como as vozes externas e as expectativas moldam nosso comportamento quando não sabemos quem somos.

* **Dinâmica:** Cole um adesivo na testa ou nas costas de cada participante com uma "etiqueta" (Ex: Rico, Fracassado, Engraçado, Chato, Santo, Pecador, Líder, Empregado). Eles não podem ver o que está escrito em si mesmos.
* **Ação:** Peça para eles interagirem por 5 minutos, tratando uns aos outros estritamente de acordo com o que diz a etiqueta.
* **Reflexão:** Pergunte como se sentiram sendo tratados por um rótulo que não escolheram. Conclua: "Muitas vezes vivemos baseados no rótulo que o mundo nos deu, e isso gera inconstância. Só o Criador pode dizer o que realmente está escrito em nós."

## 3. Perguntas de Reflexão e Aprofundamento
**Perguntas Retóricas (Para fazer o grupo pensar em silêncio)**
* "Se todas as suas funções (cargo, ministério, profissão) fossem removidas hoje, o que sobraria de você diante de Deus?"
* "De quem é a voz que você mais ouve quando comete um erro: a do Acusador ou a do Abba?"

**Perguntas de Aprofundamento (Teológico/Reflexivo)**
* "Por que basear nossa identidade no que 'fazemos' (performance) é um terreno tão perigoso para a saúde emocional?"
* "Como a falta de convicção da nossa adoção em Cristo alimenta o 'ânimo dobre' (a mente dividida)?"
* "Analise a frase: 'Jesus foi aprovado antes de realizar milagres'. Como isso altera sua visão sobre produtividade no Reino?"

**Perguntas Práticas (Aplicação no Cotidiano)**
* "Cite uma situação recente onde você percebeu que agiu por necessidade de aprovação humana e não por convicção de quem você é em Deus."
* "Qual o principal 'sintoma' de órfão espiritual que você identifica em você: a murmuração, a inveja do sucesso alheio ou o medo do futuro?"
* "Como podemos, na prática, 'silenciar' as vozes da performance durante uma semana de trabalho estressante?"

## 4. Dicas para Ministrar a Lição
* **Cuidado com o Legalismo:** Ao falar que o "tem que fazer" é prejudicial, deixe claro que não estamos pregando a preguiça espiritual, mas a ordem correta: Ser para Fazer.
* **Vulnerabilidade do Líder:** Compartilhe um momento em que você se sentiu um "órfão espiritual" ou tentou barganhar com Deus. Isso gera conexão.
* **Foco na Graça:** Enfatize que a identidade de filho é um presente, não uma conquista. Use a Bíblia de Estudo de Genebra para explicar que a Graça Irresistível é o que nos firma.

## 5. Dicas de Evangelismo (Ganchos Estratégicos)
Este tema é excelente para alcançar pessoas que não conhecem a Cristo, pois a "crise de identidade" é a doença do século.

* **O Gancho da Cansaço:** "Você sente que está sempre tentando provar seu valor e nunca é o suficiente? Existe um lugar de descanso onde seu valor já foi decidido por Quem te criou."
* **O Gancho da Comparação:** "As redes sociais nos obrigam a nos comparar o tempo todo. A Bíblia oferece uma identidade que não depende de curtidas, mas de um amor que deu a própria vida por você."
* **O Gancho do Propósito:** "Muita gente procura o 'que fazer' na vida, mas nunca encontra porque não sabe 'quem é'. Vamos descobrir sua identidade original?"

## 6. Conclusão para o Líder (Seu "Checklist" de Saída)
Ao terminar a lição, ore especificamente para que o Espírito Santo realize o "Testemunho Interno" (Rm 8:16), que é a certeza sobrenatural de que somos filhos. Lembre-se: Um líder que sabe quem é não precisa de súditos, ele forma outros filhos.

**Frase de Efeito para encerrar:** "Você não trabalha PARA ser aceito; você trabalha PORQUE já foi aceito."
`;
  }

  return {
    id,
    title: `Lição ${String(id).padStart(2, '0')}`,
    theme: id === 12 ? "Ânimo Dobre Parte I" : (id === 13 ? "Ânimo Dobre Parte II" : undefined),
    content,
    leaderGuide,
    hasAttachment: id === 12 || id === 13
  };
});
