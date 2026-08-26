// ============================================
// MATRIZ DE PRESCRIÇÃO E INTERVENÇÃO TECNOLÓGICA
// Fonte: 9FIT_BIOMECHANICAL_ECOSYSTEM - Arquitetura de Sistema (doc oficial)
// Transcrita fielmente da Seção 4 do documento.
// Esta matriz é a fonte de verdade para "Prescrição Cirúrgica de Movimento".
// ============================================

export interface PrescriptionMatrixRow {
  id: string;
  disfuncao: string;
  risco_biomecanico: string;
  vetor_correcao: string;
  prescricao_cirurgica: string[]; // lista de exercícios exatos do documento
  // flags do sistema que, quando presentes, disparam esta linha da matriz
  matching_flags: string[];
}

export const PRESCRIPTION_MATRIX: PrescriptionMatrixRow[] = [
  {
    id: 'MATRIX01',
    disfuncao: 'Valgo Dinâmico / Inibição Pélvica',
    risco_biomecanico: 'Compressão do Trato Iliotibial, estresse articular no joelho.',
    vetor_correcao: 'Ativação de fibras posteriores (Glúteo Médio).',
    prescricao_cirurgica: [
      'Clamshell sem compressão',
      'Passada lateral com banda',
      'Box Squat com feedback tátil',
    ],
    matching_flags: ['DYN01', 'PEP04', 'LES03'],
  },
  {
    id: 'MATRIX02',
    disfuncao: 'Encurtamento de Peitoral Menor e FHP (Forward Head Posture)',
    risco_biomecanico: 'Rotação interna de ombro, bloqueio respiratório apical, rigidez cervical.',
    vetor_correcao: 'Desinibição miofascial e fortalecimento posterior profundo.',
    prescricao_cirurgica: [
      'Liberação com bola de lacrosse',
      'Chin Tuck',
      'Depressão Escapular (Y-Raise)',
    ],
    matching_flags: ['PEP12', 'PEP14', 'PEP11'],
  },
  {
    id: 'MATRIX03',
    disfuncao: 'Instabilidade e Tensão Lombossacra',
    risco_biomecanico: 'Sobrecarga em flexão, fadiga precoce e espasmo protetivo.',
    vetor_correcao: 'Isolamento do eixo e ativação antirotacional.',
    prescricao_cirurgica: [
      'Substituição de remada livre por Remada com Peito Apoiado',
      'Execução de Pallof Press',
    ],
    matching_flags: ['DOR01', 'DOR02', 'DOR03', 'PEP09', 'PEP10', 'CTX03'],
  },
];

/**
 * Retorna as linhas da Matriz de Prescrição que batem com as flags detectadas
 * na avaliação (achados, histórico de dor, contexto). Usado no ResultsHUD
 * para exibir a "Prescrição Cirúrgica de Movimento" oficial do sistema 9FIT.
 */
export function getPrescriptionMatrixForFlags(flags: string[]): PrescriptionMatrixRow[] {
  const normalizedFlags = new Set(flags.map(f => f.toUpperCase()));
  return PRESCRIPTION_MATRIX.filter(row =>
    row.matching_flags.some(mf => normalizedFlags.has(mf.toUpperCase()))
  );
}

export default { PRESCRIPTION_MATRIX, getPrescriptionMatrixForFlags };
