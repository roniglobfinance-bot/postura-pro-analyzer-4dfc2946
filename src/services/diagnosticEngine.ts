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
  flags: string[];
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

export interface FailSafeResult {
  blocked_exercises: string[];
  forced_mode: 'SHIELD' | null;
  alerts: FailSafeAlert[];
}

export interface FailSafeAlert {
  type: 'L1_S1_PROTECTED' | 'ADM_KNEE' | 'STOP_SIGN' | 'NEURO_METABOLIC';
  severity: 'warning' | 'critical';
  message: string;
  action: string;
}

export interface NeuroMetabolicAlert {
  type: string;
  severity: 'warning' | 'critical';
  message: string;
  recommendation: string;
}

// ============================================
// FUNÇÃO PRINCIPAL: Analisa flags e retorna diagnósticos
// ============================================
export function analyzeDiagnosis(input: DiagnosticInput): DiagnosticOutput[] {
  const { flags } = input;
  const matchedDiagnoses: DiagnosticOutput[] = [];

  if (!flags || flags.length === 0) return [];

  console.log(`🔍 Analisando ${flags.length} flags:`, flags);

  for (const rule of diagnosticRules) {
    const match = evaluateRule(rule, flags);
    if (match.matched) {
      console.log(`✅ Regra ${rule.id} correspondeu com ${match.confidence}%`);
      matchedDiagnoses.push({
        diagnosis: rule.output.diagnosis,
        severity: rule.output.severity,
        affectedLines: rule.output.affectedLines,
        mechanisms: rule.output.mechanisms,
        prognosis: rule.output.prognosis,
        protocolRef: rule.output.protocolRef,
        matchedRule: rule.id,
        confidence: match.confidence,
      });
    }
  }

  // Fallback: diagnósticos individuais
  if (matchedDiagnoses.length === 0) {
    for (const flagCode of flags) {
      const flagInfo = getFlagInfo(flagCode);
      if (flagInfo) {
        const d = createIndividualDiagnosis(flagCode, flagInfo);
        if (d) matchedDiagnoses.push(d);
      }
    }
  }

  return matchedDiagnoses.sort((a, b) => b.confidence - a.confidence);
}

// ============================================
// FAIL-SAFES: L1-S1, ADM Joelho, Stop Signs
// ============================================
export function applyFailSafes(flags: string[]): FailSafeResult {
  const result: FailSafeResult = { blocked_exercises: [], forced_mode: null, alerts: [] };

  // L1-S1 PROTEGIDO: Dor lombar grau 2-3 + hiperlordose
  const hasLumbarPain = flags.some(f => ['DOR02', 'DOR03'].includes(f));
  const hasLumbarIssue = flags.some(f => ['PEP09', 'PEP07'].includes(f));
  if (hasLumbarPain && hasLumbarIssue) {
    result.blocked_exercises.push(
      'Flexão Lombar sob Carga',
      'Extensão Lombar Extrema',
      'Good Morning Pesado',
      'Agachamento Profundo sem Controle',
      'Stiff com Flexão Excessiva'
    );
    result.alerts.push({
      type: 'L1_S1_PROTECTED',
      severity: 'critical',
      message: 'L1-S1 Protegido: Dor lombar + desvio postural lombar detectados',
      action: 'Bloquear flexão lombar sob carga e extensão extrema'
    });
  }

  // ADM JOELHO: Dor joelho + valgo/hiperextensão
  const hasKneePain = flags.some(f => ['DOR04', 'DOR05'].includes(f));
  const hasKneeIssue = flags.some(f => ['PEP04', 'PEP06'].includes(f));
  if (hasKneePain && hasKneeIssue) {
    result.blocked_exercises.push(
      'Agachamento Profundo (< 15°)',
      'Extensão de Joelho Completa sob Carga',
      'Saltos sem Controle de Aterrissagem'
    );
    result.alerts.push({
      type: 'ADM_KNEE',
      severity: 'warning',
      message: 'ADM Joelho Restrita: 15°-90° para segurança',
      action: 'Restringir ADM do joelho entre 15° e 90° em exercícios com carga'
    });
  }

  // STOP SIGNS: Dor > 3/10, formigamento, edema
  const hasSevPain = flags.includes('DOR03');
  const hasTingling = flags.includes('NM02');
  const hasEdema = flags.includes('NM01');
  const hasSystemicInflammation = flags.includes('NM03');

  if (hasSevPain || hasTingling || hasEdema) {
    result.forced_mode = 'SHIELD';
    result.alerts.push({
      type: 'STOP_SIGN',
      severity: 'critical',
      message: hasTingling
        ? '🔴 FORMIGAMENTO DETECTADO — Recomendação médica imediata'
        : hasEdema
        ? '🔴 EDEMA DETECTADO — Deload imediato, contraindicar carga direta'
        : '🔴 DOR ≥ 3/10 — Deload imediato obrigatório',
      action: 'Forçar modo SHIELD. Deload imediato.'
    });
  }

  if (hasSystemicInflammation) {
    result.alerts.push({
      type: 'NEURO_METABOLIC',
      severity: 'warning',
      message: 'Inflamação sistêmica detectada — Reduzir volume e intensidade',
      action: 'Reduzir volume de treino em 40%. Monitorar resposta.'
    });
  }

  // Retrolistese / Osteopenia
  if (flags.includes('CTX03') || flags.includes('CTX04')) {
    result.blocked_exercises.push(
      'Qualquer Carga Axial',
      'Extensão Lombar',
      'Impacto',
      'Saltos'
    );
    result.forced_mode = 'SHIELD';
    result.alerts.push({
      type: 'STOP_SIGN',
      severity: 'critical',
      message: '🔴 RETROLISTESE/OSTEOPENIA — Carga Axial ZERO',
      action: 'Bloquear toda carga axial. Apenas mobilidade e estabilização mínima.'
    });
  }

  return result;
}

// ============================================
// MOTOR NEURO-METABÓLICO
// ============================================
export function analyzeNeuroMetabolic(flags: string[]): NeuroMetabolicAlert[] {
  const alerts: NeuroMetabolicAlert[] = [];
  const nmFlags = flags.filter(f => f.startsWith('NM'));
  const painFlags = flags.filter(f => f.startsWith('DOR'));

  if (nmFlags.includes('NM01') && painFlags.length > 0) {
    alerts.push({
      type: 'edema_pain_combo',
      severity: 'critical',
      message: 'Edema + Dor articular detectados',
      recommendation: 'Contraindicar carga direta. Prescrever drenagem de extremidades e mobilidade articular suave.'
    });
  }

  if (nmFlags.includes('NM02')) {
    alerts.push({
      type: 'tingling_red_flag',
      severity: 'critical',
      message: 'FORMIGAMENTO — Red Flag neurológico',
      recommendation: 'Recomendação médica IMEDIATA. Suspender treino até avaliação neurológica.'
    });
  }

  if (nmFlags.includes('NM03')) {
    alerts.push({
      type: 'systemic_inflammation',
      severity: 'warning',
      message: 'Inflamação sistêmica detectada',
      recommendation: 'Reduzir volume 40%. Priorizar mobilidade e recuperação. Monitorar marcadores inflamatórios.'
    });
  }

  if (nmFlags.includes('NM04')) {
    alerts.push({
      type: 'nerve_sensitivity',
      severity: 'warning',
      message: 'Sensibilidade nervosa elevada',
      recommendation: 'Evitar alongamento neural agressivo. Mobilização neural suave apenas.'
    });
  }

  if (flags.includes('CTX02')) {
    alerts.push({
      type: 'elderly_context',
      severity: 'warning',
      message: 'Paciente > 70 anos — Protocolo geriátrico',
      recommendation: 'Reduzir intensidade. Priorizar funcionalidade. Monitorar equilíbrio e quedas.'
    });
  }

  return alerts;
}

// ============================================
// RELATÓRIO COMPLETO (com fail-safes e NM)
// ============================================
export function generateDiagnosticReport(input: DiagnosticInput): {
  diagnoses: DiagnosticOutput[];
  protocols: ProtocolOutput[];
  summary: string;
  failSafes: FailSafeResult;
  neuroMetabolicAlerts: NeuroMetabolicAlert[];
} {
  const diagnoses = analyzeDiagnosis(input);
  const failSafes = applyFailSafes(input.flags);
  const neuroMetabolicAlerts = analyzeNeuroMetabolic(input.flags);
  
  const protocols = diagnoses
    .map(diag => getProtocol(diag.protocolRef))
    .filter((p): p is ProtocolOutput => p !== null);
  
  const summary = generateSummary(diagnoses, failSafes, neuroMetabolicAlerts);
  
  return { diagnoses, protocols, summary, failSafes, neuroMetabolicAlerts };
}

// ============================================
// HELPERS
// ============================================

function evaluateRule(rule: any, flags: string[]): { matched: boolean; confidence: number } {
  const { required, optional } = rule.condition;
  const requiredMatches = required.filter((req: string) => flags.includes(req));
  if (requiredMatches.length !== required.length) return { matched: false, confidence: 0 };
  
  const optionalMatches = optional ? optional.filter((opt: string) => flags.includes(opt)).length : 0;
  const optionalTotal = optional ? optional.length : 0;
  const baseConfidence = 70;
  const optionalBonus = optionalTotal > 0 ? (optionalMatches / optionalTotal) * 30 : 30;
  
  return { matched: true, confidence: Math.min(100, Math.round(baseConfidence + optionalBonus)) };
}

function createIndividualDiagnosis(flagCode: string, flagInfo: any): DiagnosticOutput | null {
  const mappings: Record<string, { diagnosis: string; protocolRef: string; mechanisms: string[]; prognosis: string }> = {
    'PEP11': { diagnosis: 'Hipercifose Torácica', protocolRef: 'PROTOCOLO_HIPERCIFOSE', mechanisms: ['Encurtamento de peitoral menor/maior', 'Fraqueza de extensores torácicos'], prognosis: 'Bom (10-12 semanas)' },
    'PEP12': { diagnosis: 'Protração de Ombros', protocolRef: 'PROTOCOLO_OMBRO_ANTERIOR', mechanisms: ['Encurtamento de peitoral menor', 'Inibição de serrátil anterior'], prognosis: 'Bom (8-10 semanas)' },
    'PEP14': { diagnosis: 'Anteriorização de Cabeça', protocolRef: 'PROTOCOLO_CABECA_PROTUSA', mechanisms: ['Hiperatividade suboccipital', 'Inibição de flexores profundos'], prognosis: 'Bom (8-12 semanas)' },
    'PEP07': { diagnosis: 'Anteversão Pélvica', protocolRef: 'PROTOCOLO_ANTEVERSAO', mechanisms: ['Encurtamento de psoas', 'Inibição de glúteos'], prognosis: 'Bom (10-14 semanas)' },
    'PEP09': { diagnosis: 'Hiperlordose Lombar', protocolRef: 'PROTOCOLO_ANTEVERSAO', mechanisms: ['Psoas encurtado', 'Fraqueza de core'], prognosis: 'Bom (10-14 semanas)' },
    'DYN01': { diagnosis: 'Valgo Dinâmico', protocolRef: 'PROTOCOLO_VALGO_CONDRO', mechanisms: ['Fraqueza de glúteo médio', 'Rotação interna femoral'], prognosis: 'Excelente (6-10 semanas)' },
    'PEP04': { diagnosis: 'Joelho Valgo Estático', protocolRef: 'PROTOCOLO_VALGO_CONDRO', mechanisms: ['Fraqueza de glúteo médio', 'Pronação excessiva'], prognosis: 'Bom (8-12 semanas)' },
    'PEP01': { diagnosis: 'Pé Pronado', protocolRef: 'PROTOCOLO_PE_PRONADO', mechanisms: ['Colapso do arco medial', 'Inibição tibial posterior'], prognosis: 'Bom (8-12 semanas)' },
    'NM01': { diagnosis: 'Edema — Red Flag', protocolRef: 'PROTOCOLO_IDOSO_FRAGIL', mechanisms: ['Processo inflamatório ativo', 'Contraindicação de carga direta'], prognosis: 'Monitorar — requer drenagem' },
    'NM02': { diagnosis: 'Formigamento — Red Flag Neurológico', protocolRef: 'PROTOCOLO_IDOSO_FRAGIL', mechanisms: ['Possível compressão nervosa', 'Requer avaliação médica'], prognosis: 'URGENTE — encaminhar médico' },
    'LES01': { diagnosis: 'Ruptura LCA — Instabilidade', protocolRef: 'PROTOCOLO_LCA_JOANETE', mechanisms: ['Perda de estabilização rotacional', 'Valgo de fuga'], prognosis: 'Requer liberação ortopédica' },
    'LES03': { diagnosis: 'Bursite — Compressão', protocolRef: 'PROTOCOLO_DESCOMPRESSAO_LATERAL', mechanisms: ['Compressão por shift pélvico', 'Impacto axial contraindicado'], prognosis: 'Bom com descompressão (10-14 semanas)' },
    'CTX01': { diagnosis: 'Calçado Instável — Fator Cleiton', protocolRef: 'PROTOCOLO_INTERFACE_SOLO', mechanisms: ['Perda de feedback proprioceptivo', 'Falha de transferência de força'], prognosis: 'Excelente — resposta imediata' },
  };

  const mapping = mappings[flagCode];
  if (!mapping) return null;

  return {
    diagnosis: mapping.diagnosis,
    severity: flagInfo.severity || 2,
    affectedLines: flagInfo.implies || [],
    mechanisms: mapping.mechanisms,
    prognosis: mapping.prognosis,
    protocolRef: mapping.protocolRef,
    matchedRule: `INDIVIDUAL_${flagCode}`,
    confidence: 75
  };
}

export function getProtocol(protocolRef: string): ProtocolOutput | null {
  const protocol = interventionProtocols[protocolRef];
  return protocol || null;
}

function generateSummary(
  diagnoses: DiagnosticOutput[],
  failSafes: FailSafeResult,
  nmAlerts: NeuroMetabolicAlert[]
): string {
  if (diagnoses.length === 0 && failSafes.alerts.length === 0) return '';
  
  const lines: string[] = [];
  
  if (failSafes.alerts.length > 0) {
    lines.push('⚠️ FAIL-SAFES ATIVOS:', '');
    failSafes.alerts.forEach(a => lines.push(`  ${a.message}`));
    if (failSafes.forced_mode) lines.push(`  → MODO FORÇADO: ${failSafes.forced_mode}`);
    if (failSafes.blocked_exercises.length > 0) {
      lines.push(`  → BLOQUEADOS: ${failSafes.blocked_exercises.join(', ')}`);
    }
    lines.push('');
  }

  if (nmAlerts.length > 0) {
    lines.push('🧠 ALERTAS NEURO-METABÓLICOS:', '');
    nmAlerts.forEach(a => lines.push(`  ${a.message}`));
    lines.push('');
  }
  
  lines.push(`DIAGNÓSTICOS IDENTIFICADOS: ${diagnoses.length}`, '');
  diagnoses.forEach((diag, idx) => {
    lines.push(
      `${idx + 1}. ${diag.diagnosis}`,
      `   Severidade: ${diag.severity}/4`,
      `   Confiança: ${diag.confidence}%`,
      `   Linhas Afetadas: ${diag.affectedLines.join(', ')}`,
      `   Prognóstico: ${diag.prognosis}`,
      ''
    );
  });
  
  return lines.join('\n');
}

export function validateFlag(flagCode: string): boolean {
  const allFlags = {
    ...evaluationFlags.postural,
    ...evaluationFlags.dynamic,
    ...evaluationFlags.tests,
    ...evaluationFlags.pain,
    ...evaluationFlags.neuroMetabolic,
    ...evaluationFlags.context,
    ...evaluationFlags.lesion
  };
  return flagCode in allFlags;
}

export function getFlagInfo(flagCode: string): any {
  const allFlags = {
    ...evaluationFlags.postural,
    ...evaluationFlags.dynamic,
    ...evaluationFlags.tests,
    ...evaluationFlags.pain,
    ...evaluationFlags.neuroMetabolic,
    ...evaluationFlags.context,
    ...evaluationFlags.lesion
  };
  return allFlags[flagCode as keyof typeof allFlags] || null;
}

export function listAvailableFlags(): Record<string, string[]> {
  return {
    postural: Object.keys(evaluationFlags.postural),
    dynamic: Object.keys(evaluationFlags.dynamic),
    tests: Object.keys(evaluationFlags.tests),
    pain: Object.keys(evaluationFlags.pain),
    neuroMetabolic: Object.keys(evaluationFlags.neuroMetabolic),
    context: Object.keys(evaluationFlags.context),
    lesion: Object.keys(evaluationFlags.lesion),
  };
}

export default {
  analyzeDiagnosis,
  getProtocol,
  generateDiagnosticReport,
  applyFailSafes,
  analyzeNeuroMetabolic,
  validateFlag,
  getFlagInfo,
  listAvailableFlags
};
