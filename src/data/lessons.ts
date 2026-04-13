export interface Lesson {
  id: number;
  title: string;
  theme?: string;
  content: string;
  hasAttachment?: boolean;
}

export const lessons: Lesson[] = Array.from({ length: 50 }, (_, i) => {
  const id = i + 1;
  let content = `Este é o conteúdo detalhado da Lição ${String(id).padStart(2, '0')}. Aqui você encontrará ensinamentos profundos e reflexões sobre a Palavra.`;
  
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

Paulo entendeu a profundidade e a necessidade desse amor ao descrever que tudo que fazemos sem amor, NÃO TEM NENHUM VALOR, é só barulho (1 Cor 13). Não importa o que fazemos, ou o quanto fazemos, se não estamos dispostos a morrer pelas pessoas, não estamos praticando o NOVO MANDAMENTO ordenado por Jesus.

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
  }

  return {
    id,
    title: `Lição ${String(id).padStart(2, '0')}`,
    theme: id === 12 ? "Ânimo Dobre Parte I" : undefined,
    content,
    hasAttachment: id === 12
  };
});
