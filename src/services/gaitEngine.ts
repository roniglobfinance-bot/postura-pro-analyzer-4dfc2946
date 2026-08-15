// ============================================
// GAIT ENGINE (Item 2 do dossiê)
// Motor de análise de marcha: detecta bloqueio de dissóciação
// tronco-quadril e outros padrões de marcha travada (caso Lourdes).
// ============================================

export interface GaitInput {
  strideAsymmetryPct?: number;        // diferenca percentual entre o comprimento do passo D vs E
  trunkRotatesWithStep?: boolean;      // tronco gira junto com a passada (sinal de bloqueio de dissociacao)
  limping?: boolean;                   // manqueira visível
  usesAnkleForPropulsion?: boolean;    // usa dorsiflexao/flexao plantar para propulsionar
  hipExtensionOnBackswingLimited?: boolean; // dificuldade de estender o quadril na fase de retorno do passo
  recentLumbarPainRelief?: boolean;    // dor lombar aliviada recentemente (contexto: Lourdes)
}

export interface GaitFlag {
  code: string;
  label: string;
  clinical_note: string;
}

const GAIT_FLAGS: Record<string, Omit<GaitFlag, 'code'>> = {
  GAIT01: {
    label: 'Passo Curto por Proteção Lombar',
    clinical_note: 'O SNC limita a extensão de quadril na passada para traás, pois essa extensão tende a acentuar a lordose e comprimir estruturas posteriores da coluna (ex: Baastrup).',
  },
  GAIT02: {
    label: 'Bloqueio de Dissociação Tronco-Quadril',
    clinical_note: 'O tronco gira junto com o quadril durante a marcha em vez de permanecer estável. Sinal de que o "bracing" que estabiliza a lombar em repouso ainda não foi transferido para o movimento dinâmico.',
  },
  GAIT03: {
    label: 'Marcha Assimétrica (Claudicação)',
    clinical_note: 'Apoio desigual entre os lados, geralmente fugindo de um ponto de dor ou instabilidade articular.',
  },
  GAIT04: {
    label: 'Perda de Propulsão Distal',
    clinical_note: 'Tornozelo/dedos não participam da fase de impulsão. Sobrecarrega quadril e lombar para compensar a falta de "molejo" distal.',
  },
};

export interface GaitAnalysisResult {
  flags: GaitFlag[];
  diagnosis: string | null;
  dissociation_protocol: string[];
}

/** Protocolo de destravamento de dissóciação tronco-quadril (item 6 do dossiê). */
export const DISSOCIATION_PROTOCOL = [
  'Reset pré-marcha: 2min deitado fazendo rotação interna consciente de quadril, sentindo o fêmur "encaixar".',
  'Deadbug com pressão na parede: empurrar a parede com as mãos enquanto move as pernas alternadamente, mantendo a lombar neutra (ativa transverso + dorsal simultaneamente).',
  'Marcha estacionária com braços cruzados no peito: obriga o quadril a girar sem o tronco acompanhar, treinando a dissóciação de forma isolada.',
  'Terra Unilateral (RDL) segurando peso na mão OPOSTA à perna de apoio: força o quadril a resistir à rotação (anti-rotação) enquanto a perna de trás estende.',
  'Passada longa controlada (marcha consciente): dar passos deliberadamente mais longos, focando em manter os ombros voltados para frente o tempo todo.',
];

/**
 * Analisa dados de marcha (coletados via observação do professor ou Movement Analyser)
 * e retorna flags + protocolo de dissóciação quando aplicável.
 */
export function analyzeGait(input: GaitInput): GaitAnalysisResult {
  const flags: GaitFlag[] = [];

  if (input.hipExtensionOnBackswingLimited) {
    flags.push({ code: 'GAIT01', ...GAIT_FLAGS.GAIT01 });
  }
  if (input.trunkRotatesWithStep) {
    flags.push({ code: 'GAIT02', ...GAIT_FLAGS.GAIT02 });
  }
  if (input.limping || (input.strideAsymmetryPct ?? 0) > 15) {
    flags.push({ code: 'GAIT03', ...GAIT_FLAGS.GAIT03 });
  }
  if (input.usesAnkleForPropulsion === false) {
    flags.push({ code: 'GAIT04', ...GAIT_FLAGS.GAIT04 });
  }

  let diagnosis: string | null = null;
  if (flags.some(f => f.code === 'GAIT02') && input.recentLumbarPainRelief) {
    diagnosis = 'Marcha travada pós-alívio lombar: a dor sumiu, mas o padrão motor de proteção (tronco rígido) ainda não foi "destravado" para o movimento dinâmico. Não é mais um problema de dor, é um problema de coordenação.';
  } else if (flags.some(f => f.code === 'GAIT01' || f.code === 'GAIT02')) {
    diagnosis = 'Bloqueio de extensão de quadril por proteção lombar residual.';
  } else if (flags.some(f => f.code === 'GAIT04')) {
    diagnosis = 'Marcha sem propulsão distal — sobrecarga proximal compensatória.';
  }

  const dissociation_protocol = flags.some(f => f.code === 'GAIT01' || f.code === 'GAIT02')
    ? DISSOCIATION_PROTOCOL
    : [];

  return { flags, diagnosis, dissociation_protocol };
}

export default { analyzeGait, DISSOCIATION_PROTOCOL };
