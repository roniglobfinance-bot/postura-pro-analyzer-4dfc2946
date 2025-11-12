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
 * FUNÇÃO PRINCIPAL: Analisa flags e retorna diagnósticos
 */
export function analyzeDiagnosis(input: DiagnosticInput): DiagnosticOutput[] {
  const { flags } = input;
  const matchedDiagnoses: DiagnosticOutput[] = [];

  // Validar flags
  if (!flags || flags.length === 0) {
    return [];
  }

  // Processar cada regra de diagnóstico
  for (const rule of diagnosticRules) {
    const match = evaluateRule(rule, flags);
    
    if (match.matched) {
      matchedDiagnoses.push({
        diagnosis: rule.output.diagnosis,
        severity: rule.output.severity,
        affectedLines: rule.output.affectedLines,
        mechanisms: rule.output.mechanisms,
        prognosis: rule.output.prognosis,
        protocolRef: rule.output.protocolRef,
        matchedRule: rule.id,
        confidence: match.confidence
      });
    }
  }

  // Ordenar por confiança (maior primeiro)
  return matchedDiagnoses.sort((a, b) => b.confidence - a.confidence);
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
