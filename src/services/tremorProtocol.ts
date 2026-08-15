// ============================================
// PROTOCOLO DE TREMOR (Item 5 do dossiê)
// Distingue fadiga aguda normal de sinais de alerta pós-treino.
// ============================================

export type TremorClassification = 'fadiga_aguda_normal' | 'fadiga_neurologica_atencao' | 'possivel_choque_excessivo' | 'red_flag_neurologico';

export interface TremorInput {
  duringSet: boolean;              // tremor apareceu durante a série (falha muscular controlada)
  intensity: 'leve' | 'moderado' | 'severo';
  location: string;                // ex: 'perna', 'braco'
  hasNumbnessOrTingling?: boolean; // formigamento/dormência junto (red flag)
  ableToWalkNormallyAfter?: boolean;
  recoveredWithin24h?: boolean;
  isFirstTimeAtThisIntensity?: boolean;
}

export interface TremorClassificationResult {
  classification: TremorClassification;
  label: string;
  explanation: string;
  recommendation: string;
  requires_medical_attention: boolean;
}

/**
 * Classifica o tremor pós/durante treino relatado pelo aluno,
 * seguindo a lógica "Falha boa vs. Falha ruim" do dossiê 9FIT.
 */
export function classifyTremor(input: TremorInput): TremorClassificationResult {
  // RED FLAG absoluto: formigamento/dormência junto do tremor
  if (input.hasNumbnessOrTingling) {
    return {
      classification: 'red_flag_neurologico',
      label: 'Sinal Neurológico de Atenção',
      explanation: 'Tremor acompanhado de formigamento ou dormência não é fadiga muscular comum — pode indicar envolvimento nervoso.',
      recommendation: 'Suspender o treino da região afetada e buscar avaliação médica antes de continuar.',
      requires_medical_attention: true,
    };
  }

  // Tremor durante a série, intensidade leve/moderada, controlado = falha metabólica normal (BOM sinal)
  if (input.duringSet && input.intensity !== 'severo') {
    return {
      classification: 'fadiga_aguda_normal',
      label: 'Fadiga Aguda Normal (Falha Boa)',
      explanation: 'Tremor durante a série indica que você atingiu o limite de estímulo dos estoques de energia local (glicogênio/cálcio) ou do sistema nervoso periférico. É um sinal de que o estímulo foi suficiente, não uma lesão.',
      recommendation: 'Não alongar forte na sequência (risco de espasmo). Elevar as pernas 5min, hidratar com eletrólitos/magnésio. Treino normal amanhã.',
      requires_medical_attention: false,
    };
  }

  // Tremor severo, não conseguiu andar normalmente depois, ou não recuperou em 24h = choque excessivo
  if (
    input.intensity === 'severo' &&
    (input.ableToWalkNormallyAfter === false || input.recoveredWithin24h === false)
  ) {
    return {
      classification: 'possivel_choque_excessivo',
      label: 'Possível Estímulo de Choque Excessivo',
      explanation: 'A magnitude do tremor e a dificuldade de recuperação em 24h sugerem um estímulo acima da capacidade atual de recuperação — pode ser um "treino de choque" válido pontualmente, mas não deve virar rotina.',
      recommendation: 'Reduzir volume/carga na próxima sessão dessa região em ~30-40%. Priorizar sono, hidratação e proteína nas próximas 48h. Se a dificuldade de andar persistir além de 48h, buscar avaliação médica.',
      requires_medical_attention: false,
    };
  }

  // Default: tremor leve isolado, sem contexto de alerta
  return {
    classification: 'fadiga_aguda_normal',
    label: 'Fadiga Leve Esperada',
    explanation: 'Tremor leve isolado, sem sinais de alerta associados. Dentro do esperado para um estímulo de treino.',
    recommendation: 'Seguir rotina normal de recuperação (hidratação, sono). Monitorar se piorar nas próximas sessões.',
    requires_medical_attention: false,
  };
}

export default { classifyTremor };
