// ============================================
// TRADUTOR DE FLAGS PARA O ALUNO
// Converte codigos clinicos (PEP14, DYN01...) em
// linguagem simples, sem jargao tecnico.
// Uso: tela do aluno (nunca mostrar o codigo bruto a ele)
// ============================================

export interface StudentFlagTranslation {
  code: string;
  simple_name: string;
  simple_reason: string;
  is_alert: boolean;
}

const FLAG_TRANSLATIONS: Record<string, Omit<StudentFlagTranslation, 'code'>> = {
  PEP01: { simple_name: 'Apoio do pe caindo para dentro', simple_reason: 'Seu pe perde um pouco o arco quando voce fica em pe, o que pode sobrecarregar o joelho.', is_alert: false },
  PEP02: { simple_name: 'Apoio do pe virado para fora', simple_reason: 'Seu pe apoia mais pela lateral externa.', is_alert: false },
  PEP03: { simple_name: 'Arco do pe baixo', simple_reason: 'A sola do seu pe tem pouco espaco curvado, o que reduz a absorcao de impacto.', is_alert: false },
  PEP04: { simple_name: 'Joelho para dentro', simple_reason: 'Seu joelho tende a cair para dentro, geralmente por falta de forca no quadril.', is_alert: false },
  PEP05: { simple_name: 'Joelho para fora', simple_reason: 'Seu joelho tende a se abrir para fora.', is_alert: false },
  PEP06: { simple_name: 'Joelho travando para tras', simple_reason: 'Voce trava o joelho para economizar esforco ao ficar em pe.', is_alert: false },
  PEP07: { simple_name: 'Quadril inclinado para frente', simple_reason: 'Sua bacia tende a bascular para frente, o que pode aumentar a curva da lombar.', is_alert: false },
  PEP08: { simple_name: 'Quadril inclinado para tras', simple_reason: 'Sua bacia tende a bascular para tras.', is_alert: false },
  PEP09: { simple_name: 'Curva lombar acentuada', simple_reason: 'Sua lombar tem uma curva maior que o esperado.', is_alert: false },
  PEP10: { simple_name: 'Lombar mais reta que o normal', simple_reason: 'Sua lombar perdeu um pouco da curva natural, reduzindo a amortizacao.', is_alert: false },
  PEP11: { simple_name: 'Costas arredondadas (corcunda)', simple_reason: 'A parte de cima das suas costas esta mais curvada que o ideal.', is_alert: false },
  PEP12: { simple_name: 'Ombros para frente', simple_reason: 'Seus ombros tendem a enrolar para frente.', is_alert: false },
  PEP13: { simple_name: 'Um ombro mais alto que o outro', simple_reason: 'Ha uma pequena diferenca de altura entre os seus ombros.', is_alert: false },
  PEP14: { simple_name: 'Cabeca projetada para frente', simple_reason: 'Sua cabeca fica um pouco a frente da linha do corpo, sobrecarregando o pescoco.', is_alert: false },
  PEP15: { simple_name: 'Coluna com desvio lateral', simple_reason: 'Foi identificado um desvio lateral na coluna que merece acompanhamento.', is_alert: true },

  DYN01: { simple_name: 'Joelho colapsando ao mover', simple_reason: 'Durante o movimento, seu joelho tende a cair para dentro - comum e treinavel.', is_alert: false },
  DYN02: { simple_name: 'Rotacao do quadril para dentro', simple_reason: 'Seu quadril gira mais para dentro do que o ideal durante o movimento.', is_alert: false },
  DYN03: { simple_name: 'Lombar compensando no agachamento', simple_reason: 'Sua lombar assume parte do trabalho que deveria ser do quadril ao agachar.', is_alert: false },
  DYN04: { simple_name: 'Quadril caindo ao apoiar uma perna', simple_reason: 'Ao ficar em uma perna so, seu quadril do lado oposto cai - sinal de que o gluteo precisa de mais forca.', is_alert: false },
  DYN05: { simple_name: 'Desequilibrio entre os lados', simple_reason: 'Um lado do corpo esta um pouco menos estavel que o outro no apoio unilateral.', is_alert: false },

  TES01: { simple_name: 'Sinal de curvatura na coluna', simple_reason: 'No teste de flexao, foi observado um sinal que sugere avaliacao medica.', is_alert: true },
  TES02: { simple_name: 'Tensao na frente do quadril', simple_reason: 'Os musculos da frente do seu quadril estao mais encurtados que o normal.', is_alert: false },
  TES03: { simple_name: 'Tensao na lateral do quadril', simple_reason: 'A lateral do seu quadril apresenta mais tensao que o esperado.', is_alert: false },
  TES04: { simple_name: 'Flexibilidade reduzida ao curvar a coluna', simple_reason: 'Voce tem menos amplitude ao se curvar para frente.', is_alert: false },
  TES05: { simple_name: 'Giro do pescoco limitado', simple_reason: 'Seu pescoco tem menos amplitude ao girar para um dos lados.', is_alert: false },

  DOR01: { simple_name: 'Dor leve na lombar', simple_reason: 'Voce relatou um desconforto leve na regiao lombar.', is_alert: false },
  DOR02: { simple_name: 'Dor moderada na lombar', simple_reason: 'Voce relatou um desconforto moderado na lombar - vamos ajustar a carga.', is_alert: false },
  DOR03: { simple_name: 'Dor forte na lombar', simple_reason: 'Voce relatou uma dor forte na lombar. O treino de hoje sera mais leve por seguranca.', is_alert: true },
  DOR04: { simple_name: 'Dor na frente do joelho', simple_reason: 'Voce sente dor na parte da frente do joelho.', is_alert: false },
  DOR05: { simple_name: 'Dor na lateral interna do joelho', simple_reason: 'Voce sente dor na parte de dentro do joelho.', is_alert: false },
  DOR06: { simple_name: 'Dor no pescoco', simple_reason: 'Voce relatou desconforto na regiao cervical.', is_alert: false },
  DOR07: { simple_name: 'Dor no ombro', simple_reason: 'Voce relatou desconforto no ombro.', is_alert: false },

  NM01: { simple_name: 'Inchaco identificado', simple_reason: 'Foi notado inchaco na regiao. Seu professor vai ajustar o treino para priorizar a recuperacao.', is_alert: true },
  NM02: { simple_name: 'Formigamento identificado', simple_reason: 'Voce relatou formigamento. Isso pede atencao medica - fale com seu professor antes de treinar.', is_alert: true },
  NM03: { simple_name: 'Sinal de inflamacao no corpo', simple_reason: 'Foram identificados sinais de inflamacao. O volume de treino sera reduzido por alguns dias.', is_alert: true },
  NM04: { simple_name: 'Sensibilidade nervosa aumentada', simple_reason: 'Sua regiao esta mais sensivel que o normal. Vamos evitar movimentos bruscos por enquanto.', is_alert: true },

  CTX01: { simple_name: 'Calcado pouco estavel para o treino', simple_reason: 'O tenis usado hoje pode estar deixando seu apoio menos firme durante o exercicio.', is_alert: false },
  CTX02: { simple_name: 'Atencao especial por idade', simple_reason: 'O plano foi ajustado com mais cuidado, priorizando seguranca e equilibrio.', is_alert: false },
  CTX03: { simple_name: 'Instabilidade identificada na coluna', simple_reason: 'Foi identificado um ponto de atencao na coluna que exige cuidado redobrado com cargas.', is_alert: true },
  CTX04: { simple_name: 'Ossos mais sensiveis', simple_reason: 'Seus ossos pedem mais cuidado com impacto e carga - o plano ja considera isso.', is_alert: true },

  LES01: { simple_name: 'Historico de lesao no ligamento do joelho', simple_reason: 'Seu historico de lesao no joelho esta sendo considerado em todos os exercicios.', is_alert: true },
  LES02: { simple_name: 'Alteracao no dedao do pe (joanete)', simple_reason: 'A alteracao no seu dedao pode mudar levemente seu apoio ao caminhar.', is_alert: false },
  LES03: { simple_name: 'Inflamacao em bolsa articular', simple_reason: 'Ha uma inflamacao identificada que pede cuidado com impacto direto na regiao.', is_alert: true },
};

export function translateFlagForStudent(code: string): StudentFlagTranslation {
  const found = FLAG_TRANSLATIONS[code];
  if (found) return { code, ...found };
  return {
    code,
    simple_name: 'Ponto de atencao identificado',
    simple_reason: 'Seu professor identificou um ponto especifico que sera trabalhado no seu plano.',
    is_alert: false,
  };
}

export function translateFlagsForStudent(codes: string[]): StudentFlagTranslation[] {
  const unique = Array.from(new Set(codes));
  return unique
    .map(translateFlagForStudent)
    .sort((a, b) => Number(b.is_alert) - Number(a.is_alert));
}

export default { translateFlagForStudent, translateFlagsForStudent };
