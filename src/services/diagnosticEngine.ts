// ============================================
// MOTOR DE DIAGNÓSTICO - SAARS
// Processa flags de avaliação e gera diagnósticos
// ============================================

import { 
  evaluationFlags, 
  diagnosticRules, 
  interventionProtocols,
  myofascialFoundations 
} from '@/data/knowledgeBase';

export interface DiagnosticInput {
  flags: string[]; // Lista de códigos de flags (ex: ['PEP01', 'DYN01', 'DOR04'])
}

export interface DiagnosticOutput {
  diagnosis: string;
  severity: number;
  affectedLines: string[];
  mechanisms: string[];
  prognosis: string;
  protocolRef: string;
  matchedRule: string;
  confidence: number;
}

export interface ProtocolOutput {
  id: string;
  name: string;
  duration: string;
  phases: any[];
  note?: string;
}

/**
 * FUNÇÃO PRINCIPAL: Analisa flags e retorna diagnósticos INDIVIDUALIZADOS
 * Busca TODAS as regras no banco de conhecimento para os flags específicos do aluno
 */
export function analyzeDiagnosis(input: DiagnosticInput): DiagnosticOutput[] {
  const { flags } = input;
  const matchedDiagnoses: DiagnosticOutput[] = [];

  // Validar flags
  if (!flags || flags.length === 0) {
    console.log('Nenhum flag fornecido para análise');
    return [];
  }

  console.log(`🔍 Analisando ${flags.length} flags individuais:`, flags);

  // Processar TODAS as regras de diagnóstico do banco de conhecimento
  for (const rule of diagnosticRules) {
    const match = evaluateRule(rule, flags);
    
    if (match.matched) {
      console.log(`✅ Regra ${rule.id} correspondeu com ${match.confidence}% de confiança`);
      
      // Identificar quais flags específicos ativaram esta regra
      const activatingFlags = rule.condition.required.filter((f: string) => flags.includes(f));
      const optionalActivated = rule.condition.optional?.filter((f: string) => flags.includes(f)) || [];
      
      matchedDiagnoses.push({
        diagnosis: rule.output.diagnosis,
        severity: rule.output.severity,
        affectedLines: rule.output.affectedLines,
        mechanisms: rule.output.mechanisms,
        prognosis: rule.output.prognosis,
        protocolRef: rule.output.protocolRef,
        matchedRule: rule.id,
        confidence: match.confidence,
        // Adicionar informação sobre quais flags específicos ativaram o diagnóstico
        activatingFlags: [...activatingFlags, ...optionalActivated]
      } as DiagnosticOutput & { activatingFlags?: string[] });
    }
  }

  // Se nenhuma regra composta corresponder, verificar flags individuais
  if (matchedDiagnoses.length === 0) {
    console.log('⚠️ Nenhuma regra composta correspondeu. Analisando flags individuais...');
    
    // Buscar diagnósticos baseados em flags individuais
    for (const flagCode of flags) {
      const flagInfo = getFlagInfo(flagCode);
      if (flagInfo) {
        // Criar diagnóstico individual para cada flag
        const individualDiag = createIndividualDiagnosis(flagCode, flagInfo);
        if (individualDiag) {
          matchedDiagnoses.push(individualDiag);
        }
      }
    }
  }

  console.log(`📊 Total de ${matchedDiagnoses.length} diagnósticos gerados`);

  // Ordenar por confiança (maior primeiro)
  return matchedDiagnoses.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Cria diagnóstico individual para um flag específico
 */
function createIndividualDiagnosis(flagCode: string, flagInfo: any): DiagnosticOutput | null {
  // Mapear flags individuais para diagnósticos específicos
  const individualMappings: Record<string, {
    diagnosis: string;
    protocolRef: string;
    mechanisms: string[];
    prognosis: string;
  }> = {
    'PEP11': {
      diagnosis: 'Hipercifose Torácica',
      protocolRef: 'PROTOCOLO_HIPERCIFOSE',
      mechanisms: ['Encurtamento de peitoral menor/maior', 'Fraqueza de extensores torácicos', 'Bloqueio de mobilidade T4-T8'],
      prognosis: 'Bom - Responde bem a mobilização e fortalecimento (10-12 semanas)'
    },
    'PEP12': {
      diagnosis: 'Protração de Ombros',
      protocolRef: 'PROTOCOLO_OMBRO_ANTERIOR',
      mechanisms: ['Encurtamento de peitoral menor', 'Inibição de serrátil anterior', 'Descentramento glenoumeral'],
      prognosis: 'Bom - Responde a liberação e ativação (8-10 semanas)'
    },
    'PEP14': {
      diagnosis: 'Anteriorização de Cabeça',
      protocolRef: 'PROTOCOLO_CABECA_PROTUSA',
      mechanisms: ['Hiperatividade suboccipital', 'Encurtamento de ECOM', 'Inibição de flexores profundos'],
      prognosis: 'Bom - Responde a correção postural (8-12 semanas)'
    },
    'PEP07': {
      diagnosis: 'Anteversão Pélvica',
      protocolRef: 'PROTOCOLO_ANTEVERSAO',
      mechanisms: ['Encurtamento de psoas', 'Inibição de glúteos', 'Sobrecarga facetária lombar'],
      prognosis: 'Bom - Responde a liberação + ativação (10-14 semanas)'
    },
    'PEP09': {
      diagnosis: 'Hiperlordose Lombar',
      protocolRef: 'PROTOCOLO_ANTEVERSAO',
      mechanisms: ['Psoas encurtado', 'Fraqueza de core', 'Desequilíbrio cadeia anterior/posterior'],
      prognosis: 'Bom - Responde a estabilização core (10-14 semanas)'
    },
    'DYN01': {
      diagnosis: 'Valgo Dinâmico',
      protocolRef: 'PROTOCOLO_VALGO_CONDRO',
      mechanisms: ['Fraqueza de glúteo médio', 'Hiperatividade de TFL', 'Rotação interna femoral'],
      prognosis: 'Excelente - Alta resposta a fortalecimento (6-10 semanas)'
    },
    'PEP04': {
      diagnosis: 'Joelho Valgo Estático',
      protocolRef: 'PROTOCOLO_VALGO_CONDRO',
      mechanisms: ['Fraqueza de glúteo médio', 'Encurtamento de adutores', 'Pronação excessiva'],
      prognosis: 'Bom - Responde a fortalecimento lateral (8-12 semanas)'
    },
    'PEP01': {
      diagnosis: 'Pé Pronado',
      protocolRef: 'PROTOCOLO_PE_PRONADO',
      mechanisms: ['Colapso do arco medial', 'Inibição tibial posterior', 'Rotação interna em cadeia'],
      prognosis: 'Bom - Responde a fortalecimento intrínseco (8-12 semanas)'
    }
  };

  const mapping = individualMappings[flagCode];
  if (!mapping) return null;

  return {
    diagnosis: mapping.diagnosis,
    severity: flagInfo.severity || 2,
    affectedLines: flagInfo.implies || [],
    mechanisms: mapping.mechanisms,
    prognosis: mapping.prognosis,
    protocolRef: mapping.protocolRef,
    matchedRule: `INDIVIDUAL_${flagCode}`,
    confidence: 75 // Confiança base para diagnósticos individuais
  };
}

/**
 * Avalia se uma regra corresponde aos flags fornecidos
 */
function evaluateRule(rule: any, flags: string[]): { matched: boolean; confidence: number } {
  const { required, optional } = rule.condition;
  
  // Verificar flags obrigatórios
  const requiredMatches = required.filter((req: string) => flags.includes(req));
  const requiredSatisfied = requiredMatches.length === required.length;
  
  if (!requiredSatisfied) {
    return { matched: false, confidence: 0 };
  }
  
  // Calcular confiança baseada em flags opcionais
  const optionalMatches = optional ? optional.filter((opt: string) => flags.includes(opt)).length : 0;
  const optionalTotal = optional ? optional.length : 0;
  
  const baseConfidence = 70; // Confiança base por satisfazer obrigatórios
  const optionalBonus = optionalTotal > 0 ? (optionalMatches / optionalTotal) * 30 : 30;
  
  const confidence = Math.min(100, baseConfidence + optionalBonus);
  
  return { matched: true, confidence: Math.round(confidence) };
}

/**
 * Busca protocolo de intervenção pelo ID
 */
export function getProtocol(protocolRef: string): ProtocolOutput | null {
  const protocol = interventionProtocols[protocolRef as keyof typeof interventionProtocols];
  
  if (!protocol) {
    return null;
  }
  
  return protocol;
}

/**
 * Gera relatório completo de diagnóstico
 */
export function generateDiagnosticReport(input: DiagnosticInput): {
  diagnoses: DiagnosticOutput[];
  protocols: ProtocolOutput[];
  summary: string;
} {
  const diagnoses = analyzeDiagnosis(input);
  
  if (diagnoses.length === 0) {
    return {
      diagnoses: [],
      protocols: [],
      summary: 'Nenhuma regra de diagnóstico correspondente encontrada para os inputs fornecidos.'
    };
  }
  
  // Buscar protocolos para cada diagnóstico
  const protocols = diagnoses
    .map(diag => getProtocol(diag.protocolRef))
    .filter((p): p is ProtocolOutput => p !== null);
  
  // Gerar resumo
  const summary = generateSummary(diagnoses);
  
  return {
    diagnoses,
    protocols,
    summary
  };
}

/**
 * Gera resumo técnico dos diagnósticos
 */
function generateSummary(diagnoses: DiagnosticOutput[]): string {
  if (diagnoses.length === 0) return '';
  
  const lines = [
    `DIAGNÓSTICOS IDENTIFICADOS: ${diagnoses.length}`,
    '',
    ...diagnoses.map((diag, idx) => {
      return [
        `${idx + 1}. ${diag.diagnosis}`,
        `   Severidade: ${diag.severity}/4`,
        `   Confiança: ${diag.confidence}%`,
        `   Linhas Afetadas: ${diag.affectedLines.join(', ')}`,
        `   Prognóstico: ${diag.prognosis}`,
        ''
      ].join('\n');
    })
  ];
  
  return lines.join('\n');
}

/**
 * Valida se um código de flag existe na base de conhecimento
 */
export function validateFlag(flagCode: string): boolean {
  const allFlags = {
    ...evaluationFlags.postural,
    ...evaluationFlags.dynamic,
    ...evaluationFlags.tests,
    ...evaluationFlags.pain
  };
  
  return flagCode in allFlags;
}

/**
 * Retorna informações detalhadas sobre um flag
 */
export function getFlagInfo(flagCode: string): any {
  const allFlags = {
    ...evaluationFlags.postural,
    ...evaluationFlags.dynamic,
    ...evaluationFlags.tests,
    ...evaluationFlags.pain
  };
  
  return allFlags[flagCode as keyof typeof allFlags] || null;
}

/**
 * Lista todos os flags disponíveis por categoria
 */
export function listAvailableFlags(): {
  postural: string[];
  dynamic: string[];
  tests: string[];
  pain: string[];
} {
  return {
    postural: Object.keys(evaluationFlags.postural),
    dynamic: Object.keys(evaluationFlags.dynamic),
    tests: Object.keys(evaluationFlags.tests),
    pain: Object.keys(evaluationFlags.pain)
  };
}

export default {
  analyzeDiagnosis,
  getProtocol,
  generateDiagnosticReport,
  validateFlag,
  getFlagInfo,
  listAvailableFlags
};
