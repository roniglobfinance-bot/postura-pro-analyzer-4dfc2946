import { DiagnosticFlag } from '@/contexts/AssessmentContext';
import { evaluationFlags } from '@/data/knowledgeBase';

export interface AnalysisResult {
  type: 'skeleton' | 'angle' | 'measurement' | 'pose' | 'deviation';
  findings: {
    name: string;
    value: number;
    severity: number;
    reference?: string;
    angle?: number;
  }[];
}

/**
 * Converte resultados de análises de IA em flags de diagnóstico
 */
export function convertAnalysisToFlags(analysis: AnalysisResult): DiagnosticFlag[] {
  const flags: DiagnosticFlag[] = [];
  analysis.findings.forEach(finding => {
    const matchedFlags = matchFindingToFlags(finding);
    flags.push(...matchedFlags);
  });
  return flags;
}

/**
 * Mapeia achados específicos para códigos de flags
 */
function matchFindingToFlags(finding: {
  name: string;
  value: number;
  severity: number;
  reference?: string;
  angle?: number;
}): DiagnosticFlag[] {
  const flags: DiagnosticFlag[] = [];
  const name = finding.name.toLowerCase();
  
  // POSTURAIS ESTÁTICOS
  if (name.includes('anteriorização') && name.includes('cabeça')) {
    flags.push({ code: 'PEP14', name: 'Anteriorização de Cabeça', severity: finding.severity, source: 'auto-detected', confidence: 85 });
  }
  if (name.includes('ombro') && name.includes('elevado')) {
    flags.push({ code: 'PEP13', name: 'Ombro Elevado', severity: finding.severity, source: 'auto-detected', confidence: 92 });
  }
  if (name.includes('desnível') && name.includes('ombro')) {
    flags.push({ code: 'PEP13', name: 'Ombro Elevado/Desnivelado', severity: finding.severity, source: 'auto-detected', confidence: 90 });
  }
  if (name.includes('ombro') && name.includes('protrus')) {
    flags.push({ code: 'PEP12', name: 'Protrusão de Ombros', severity: finding.severity, source: 'auto-detected', confidence: 85 });
  }
  if (name.includes('cifose') || (name.includes('torácica') && name.includes('aumento'))) {
    flags.push({ code: 'PEP11', name: 'Hipercifose Torácica', severity: finding.severity, source: 'auto-detected', confidence: 85 });
  }
  if (name.includes('lordose') && name.includes('lombar')) {
    flags.push({ code: 'PEP09', name: 'Hiperlordose Lombar', severity: finding.severity, source: 'auto-detected', confidence: 85 });
  }
  if (name.includes('retificação') && name.includes('lombar')) {
    flags.push({ code: 'PEP10', name: 'Retificação Lombar', severity: finding.severity, source: 'auto-detected', confidence: 85 });
  }
  if (name.includes('anteroversão') && name.includes('pelve')) {
    flags.push({ code: 'PEP07', name: 'Anteroversão Pélvica', severity: finding.severity, source: 'auto-detected', confidence: 80 });
  }
  if (name.includes('retroversão') && name.includes('pelve')) {
    flags.push({ code: 'PEP08', name: 'Retroversão Pélvica', severity: finding.severity, source: 'auto-detected', confidence: 80 });
  }
  if (name.includes('genu') && name.includes('valgo')) {
    flags.push({ code: 'PEP04', name: 'Genu Valgo', severity: finding.severity, source: 'auto-detected', confidence: 93 });
  }
  if (name.includes('genu') && name.includes('varo')) {
    flags.push({ code: 'PEP05', name: 'Genu Varo', severity: finding.severity, source: 'auto-detected', confidence: 93 });
  }
  if (name.includes('pronação') || (name.includes('pé') && name.includes('plano'))) {
    flags.push({ code: 'PEP01', name: 'Pé Pronado/Plano', severity: finding.severity, source: 'auto-detected', confidence: 85 });
  }
  
  // DINÂMICOS FUNCIONAIS
  if (name.includes('valgo') && name.includes('dinâmico')) {
    flags.push({ code: 'DYN01', name: 'Valgo Dinâmico de Joelho', severity: finding.severity, source: 'auto-detected', confidence: 90 });
  }
  if (name.includes('rotação') && name.includes('quadril') && name.includes('medial')) {
    flags.push({ code: 'DYN02', name: 'Rotação Medial Excessiva de Quadril', severity: finding.severity, source: 'auto-detected', confidence: 85 });
  }
  if (name.includes('colapso') && name.includes('arco')) {
    flags.push({ code: 'DYN03', name: 'Colapso do Arco Medial', severity: finding.severity, source: 'auto-detected', confidence: 80 });
  }
  if (name.includes('trendelenburg')) {
    flags.push({ code: 'DYN04', name: 'Trendelenburg Positivo', severity: finding.severity, source: 'auto-detected', confidence: 88 });
  }

  // NEURO-METABÓLICOS
  if (name.includes('edema') || name.includes('inchaço')) {
    flags.push({ code: 'NM01', name: 'Edema', severity: finding.severity || 3, source: 'auto-detected', confidence: 85 });
  }
  if (name.includes('formigamento') || name.includes('parestesia')) {
    flags.push({ code: 'NM02', name: 'Formigamento', severity: 4, source: 'auto-detected', confidence: 90 });
  }
  if (name.includes('inflamação') || name.includes('inflamatório')) {
    flags.push({ code: 'NM03', name: 'Inflamação Sistêmica', severity: 3, source: 'auto-detected', confidence: 80 });
  }

  // CONTEXTO
  if (name.includes('calçado') && (name.includes('instável') || name.includes('amortecido'))) {
    flags.push({ code: 'CTX01', name: 'Calçado Instável', severity: 2, source: 'auto-detected', confidence: 90 });
  }
  if (name.includes('retrolistese')) {
    flags.push({ code: 'CTX03', name: 'Retrolistese', severity: 4, source: 'auto-detected', confidence: 85 });
  }
  if (name.includes('osteopenia') || name.includes('osteoporose')) {
    flags.push({ code: 'CTX04', name: 'Osteopenia', severity: 3, source: 'auto-detected', confidence: 85 });
  }

  // LESÃO
  if (name.includes('lca') || name.includes('ligamento cruzado')) {
    flags.push({ code: 'LES01', name: 'Ruptura LCA', severity: 4, source: 'auto-detected', confidence: 90 });
  }
  if (name.includes('joanete') || name.includes('hallux valgus')) {
    flags.push({ code: 'LES02', name: 'Joanete', severity: 2, source: 'auto-detected', confidence: 85 });
  }
  if (name.includes('bursite')) {
    flags.push({ code: 'LES03', name: 'Bursite', severity: 3, source: 'auto-detected', confidence: 85 });
  }
  
  return flags;
}

/**
 * Calcula a confiança de um flag baseado na análise
 */
export function calculateFlagConfidence(
  flagCode: string,
  analysisValue: number,
  analysisType: string
): number {
  const baseConfidence = {
    'skeleton': 85,
    'angle': 90,
    'measurement': 95,
    'pose': 80
  }[analysisType] || 75;
  
  const deviationBonus = Math.min(15, analysisValue * 3);
  return Math.min(100, baseConfidence + deviationBonus);
}

/**
 * Agrupa flags similares e retorna o de maior confiança
 */
export function deduplicateFlags(flags: DiagnosticFlag[]): DiagnosticFlag[] {
  const flagMap = new Map<string, DiagnosticFlag>();
  flags.forEach(flag => {
    const existing = flagMap.get(flag.code);
    if (!existing || (flag.confidence || 0) > (existing.confidence || 0)) {
      flagMap.set(flag.code, flag);
    }
  });
  return Array.from(flagMap.values());
}

/**
 * Valida se um flag detectado realmente existe na base de conhecimento
 */
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

/**
 * Enriquece flags com informações da base de conhecimento
 */
export function enrichFlags(flags: DiagnosticFlag[]): DiagnosticFlag[] {
  const allFlags = {
    ...evaluationFlags.postural,
    ...evaluationFlags.dynamic,
    ...evaluationFlags.tests,
    ...evaluationFlags.pain,
    ...evaluationFlags.neuroMetabolic,
    ...evaluationFlags.context,
    ...evaluationFlags.lesion
  };
  
  return flags.map(flag => {
    const flagInfo = allFlags[flag.code as keyof typeof allFlags];
    if (flagInfo) {
      return {
        ...flag,
        name: flagInfo.name || flag.name,
        severity: flagInfo.severity || flag.severity
      };
    }
    return flag;
  });
}
