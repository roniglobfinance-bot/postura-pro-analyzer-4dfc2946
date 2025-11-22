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
  
  // POSTURAIS ESTÁTICOS - CABEÇA E PESCOÇO
  if (name.includes('anteriorização') && name.includes('cabeça')) {
    flags.push({
      code: 'PEP01',
      name: 'Anteriorização de Cabeça',
      severity: finding.severity,
      source: 'auto-detected',
      confidence: 85
    });
  }
  
  if (name.includes('ombro') && name.includes('elevado')) {
    // Determinar lado
    const isRight = name.includes(' d') || name.includes('direito');
    const isLeft = name.includes(' e') || name.includes('esquerdo');
    
    flags.push({
      code: 'PEP02',
      name: `Ombro Elevado ${isRight ? 'D' : isLeft ? 'E' : ''}`.trim(),
      severity: finding.severity,
      source: 'auto-detected',
      confidence: 92
    });
  }
  
  if (name.includes('desnível') && name.includes('ombro')) {
    flags.push({
      code: 'PEP02',
      name: 'Ombro Elevado/Desnivelado',
      severity: finding.severity,
      source: 'auto-detected',
      confidence: 90
    });
  }
  
  if (name.includes('ombro') && name.includes('protrus')) {
    flags.push({
      code: 'PEP03',
      name: 'Protrusão de Ombros',
      severity: finding.severity,
      source: 'auto-detected',
      confidence: 85
    });
  }
  
  if (name.includes('escápula') && name.includes('alada')) {
    flags.push({
      code: 'PEP04',
      name: 'Escápula Alada',
      severity: finding.severity,
      source: 'auto-detected',
      confidence: 80
    });
  }
  
  if (name.includes('cifose') || (name.includes('torácica') && name.includes('aumento'))) {
    flags.push({
      code: 'PEP05',
      name: 'Hipercifose Torácica',
      severity: finding.severity,
      source: 'auto-detected',
      confidence: 85
    });
  }
  
  if (name.includes('lordose') && name.includes('lombar')) {
    flags.push({
      code: 'PEP06',
      name: 'Hiperlordose Lombar',
      severity: finding.severity,
      source: 'auto-detected',
      confidence: 85
    });
  }
  
  if (name.includes('anteroversão') && name.includes('pelve')) {
    flags.push({
      code: 'PEP07',
      name: 'Anteroversão Pélvica',
      severity: finding.severity,
      source: 'auto-detected',
      confidence: 80
    });
  }
  
  if (name.includes('retroversão') && name.includes('pelve')) {
    flags.push({
      code: 'PEP08',
      name: 'Retroversão Pélvica',
      severity: finding.severity,
      source: 'auto-detected',
      confidence: 80
    });
  }
  
  if (name.includes('desnível') && name.includes('quadril')) {
    const isRight = name.includes(' d') || name.includes('direito');
    const isLeft = name.includes(' e') || name.includes('esquerdo');
    
    flags.push({
      code: 'PEP09',
      name: `Desnível de Quadril ${isRight ? 'D' : isLeft ? 'E' : ''}`.trim(),
      severity: finding.severity,
      source: 'auto-detected',
      confidence: 88
    });
  }
  
  if (name.includes('assimetria') && name.includes('quadril')) {
    flags.push({
      code: 'PEP09',
      name: 'Assimetria de Quadril',
      severity: finding.severity,
      source: 'auto-detected',
      confidence: 85
    });
  }
  
  if (name.includes('genu') && name.includes('valgo')) {
    const isRight = name.includes(' d') || name.includes('direito');
    const isLeft = name.includes(' e') || name.includes('esquerdo');
    
    flags.push({
      code: 'PEP10',
      name: `Genu Valgo ${isRight ? 'D' : isLeft ? 'E' : ''}`.trim(),
      severity: finding.severity,
      source: 'auto-detected',
      confidence: 93
    });
  }
  
  if (name.includes('genu') && name.includes('varo')) {
    const isRight = name.includes(' d') || name.includes('direito');
    const isLeft = name.includes(' e') || name.includes('esquerdo');
    
    flags.push({
      code: 'PEP11',
      name: `Genu Varo ${isRight ? 'D' : isLeft ? 'E' : ''}`.trim(),
      severity: finding.severity,
      source: 'auto-detected',
      confidence: 93
    });
  }
  
  if (name.includes('pronação') || (name.includes('pé') && name.includes('plano'))) {
    flags.push({
      code: 'PEP12',
      name: 'Pé Pronado/Plano',
      severity: finding.severity,
      source: 'auto-detected',
      confidence: 85
    });
  }
  
  // DINÂMICOS FUNCIONAIS
  if (name.includes('valgo') && name.includes('dinâmico')) {
    flags.push({
      code: 'DYN01',
      name: 'Valgo Dinâmico de Joelho',
      severity: finding.severity,
      source: 'auto-detected',
      confidence: 90
    });
  }
  
  if (name.includes('rotação') && name.includes('quadril') && name.includes('medial')) {
    flags.push({
      code: 'DYN02',
      name: 'Rotação Medial Excessiva de Quadril',
      severity: finding.severity,
      source: 'auto-detected',
      confidence: 85
    });
  }
  
  if (name.includes('colapso') && name.includes('arco')) {
    flags.push({
      code: 'DYN03',
      name: 'Colapso do Arco Medial',
      severity: finding.severity,
      source: 'auto-detected',
      confidence: 80
    });
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
  // Confiança base depende do tipo de análise
  const baseConfidence = {
    'skeleton': 85,
    'angle': 90,
    'measurement': 95,
    'pose': 80
  }[analysisType] || 75;
  
  // Ajustar confiança baseado no valor
  // Quanto maior o desvio, maior a confiança
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
    ...evaluationFlags.pain
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
    ...evaluationFlags.pain
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
