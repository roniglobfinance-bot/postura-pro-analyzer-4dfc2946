// ============================================
// MÓDULO DE ALTA PERFORMANCE (Sprint e Potência)
// Fonte: 9FIT_BIOMECHANICAL_ECOSYSTEM - Arquitetura de Sistema, Seção 3.
// "Calibragem de biomecânica de corrida com base em análise de vetores de
// força (ex: destravamento da Forward Head Posture, liberação torácica)
// para otimização mecânica e controle de picos cardiovasculares intensos
// (aceleração até 22 km/h)."
// ============================================

export interface SprintAssessmentInput {
  forwardHeadPostureDetected: boolean; // FHP compromete a mecanica de braco/ombro em alta velocidade
  thoracicMobilityRestricted: boolean; // limita rotacao de tronco na fase de braco
  peakSpeedKmh: number;                // velocidade de pico atingida no sprint avaliado
  cardiovascularRecoveryOk: boolean;   // recuperacao de FC dentro do esperado pos-pico
  strideFrequencyHz?: number;          // opcional: cadencia de passada
}

export interface SprintPhaseOutput {
  phase: 1 | 2 | 3;
  phase_name: string;
  focus: string;
  cleared_to_progress: boolean;
  blocking_reason: string | null;
  exercises: string[];
}

export interface SprintAnalysisResult {
  current_phase: SprintPhaseOutput;
  vector_corrections: string[];
  cardiovascular_alert: string | null;
  speed_classification: 'base' | 'intermediario' | 'alta_performance';
}

const SPEED_THRESHOLD_ALTA_PERFORMANCE = 22; // km/h, conforme documento oficial

/**
 * Classifica o atleta nas 3 fases do sistema 9FIT (Desinibição -> Estabilização
 * -> Transferência de Força) aplicadas especificamente ao contexto de sprint/corrida.
 * Segue a regra de ouro do documento: nenhuma carga dinâmica de alta velocidade
 * antes de resolver bloqueios de FHP/torácico (Fase 1) e estabilidade de core (Fase 2).
 */
export function analyzeSprintReadiness(input: SprintAssessmentInput): SprintAnalysisResult {
  const vector_corrections: string[] = [];

  // FASE 1: Desinibição e Reset Neural — bloqueio de FHP/torácico impede progressão
  if (input.forwardHeadPostureDetected || input.thoracicMobilityRestricted) {
    const blockers: string[] = [];
    if (input.forwardHeadPostureDetected) {
      blockers.push('Forward Head Posture (FHP) não destravada');
      vector_corrections.push('Destravamento da Forward Head Posture: Chin Tuck + soltura de suboccipitais antes de qualquer sprint em velocidade.');
    }
    if (input.thoracicMobilityRestricted) {
      blockers.push('Mobilidade torácica restrita');
      vector_corrections.push('Liberação torácica: rotação torácica em quadrupedia + mobilização com bastão antes do treino de braçada em alta cadência.');
    }

    return {
      current_phase: {
        phase: 1,
        phase_name: 'Desinibição e Reset Neural',
        focus: 'Destravar FHP e mobilidade torácica antes de liberar vetores de velocidade.',
        cleared_to_progress: false,
        blocking_reason: blockers.join(' + '),
        exercises: ['Chin Tuck', 'Liberação suboccipital', 'Rotação torácica em quadrupedia', 'Mobilização torácica com bastão'],
      },
      vector_corrections,
      cardiovascular_alert: null,
      speed_classification: 'base',
    };
  }

  // FASE 2: Estabilização e Controle Motor — checa recuperação cardiovascular antes de liberar potência
  if (!input.cardiovascularRecoveryOk) {
    return {
      current_phase: {
        phase: 2,
        phase_name: 'Estabilização e Controle Motor',
        focus: 'Recuperação cardiovascular pós-pico ainda inadequada para progressão de potência.',
        cleared_to_progress: false,
        blocking_reason: 'Recuperação de frequência cardíaca fora do esperado após pico de velocidade.',
        exercises: ['Isometria de Glúteo Médio', 'Ativação de Transverso do Abdômen', 'Controle respiratório em amplitude neutra'],
      },
      vector_corrections,
      cardiovascular_alert: 'Frequência cardíaca não normalizou dentro da janela esperada pós-pico. Priorizar controle cardiovascular antes de repetir esforços de alta intensidade.',
      speed_classification: input.peakSpeedKmh >= SPEED_THRESHOLD_ALTA_PERFORMANCE ? 'alta_performance' : 'intermediario',
    };
  }

  // FASE 3: Transferência de Força e Performance — liberado para carga dinâmica e vetores de velocidade
  const speed_classification = input.peakSpeedKmh >= SPEED_THRESHOLD_ALTA_PERFORMANCE ? 'alta_performance' : 'intermediario';

  return {
    current_phase: {
      phase: 3,
      phase_name: 'Transferência de Força e Performance',
      focus: 'Base estrutural blindada (core + postura). Liberado para carga dinâmica e vetores de velocidade.',
      cleared_to_progress: true,
      blocking_reason: null,
      exercises: ['Sprints progressivos com foco em cadência', 'Trabalho de braçada em alta velocidade', 'Pliometria de reação'],
    },
    vector_corrections: vector_corrections.length ? vector_corrections : ['Nenhuma correção de vetor pendente — manter monitoramento de FHP e mobilidade torácica a cada ciclo.'],
    cardiovascular_alert: speed_classification === 'alta_performance'
      ? `Pico de ${input.peakSpeedKmh}km/h classificado como Alta Performance — monitorar picos cardiovasculares intensos a cada sessão.`
      : null,
    speed_classification,
  };
}

export default { analyzeSprintReadiness };
