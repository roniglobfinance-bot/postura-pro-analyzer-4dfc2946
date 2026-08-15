// ============================================
// CAMADA DE CONTEXTO / TRAUMA (Item 1 do dossiê)
// "Antes de ver a imagem, o sistema processa quem é o sujeito."
// Histórico de trauma vira BLOQUEIO PRIMÁRIO — tudo o resto é compensação.
// ============================================

export interface TraumaKeyword {
  code: string;
  patterns: string[]; // termos a procurar no texto (lowercase, sem acento simplificado)
  zone_patterns: string[]; // partes do corpo associadas, usadas p/ extrair a zona
  label: string;
  priority: 'critico' | 'alto' | 'moderado';
  clinical_note: string;
}

// Catálogo de padrões de trauma. Cada entrada mapeia palavras-chave a um "tipo" de lesão.
export const TRAUMA_KEYWORDS: TraumaKeyword[] = [
  {
    code: 'TRM01',
    patterns: ['fratura', 'fraturei', 'fraturou', 'quebrei', 'quebrou o osso'],
    zone_patterns: ['acetabulo', 'quadril', 'joelho', 'patela', 'tornozelo', 'punho', 'clavicula', 'femur', 'tibia', 'coluna'],
    label: 'Fratura Óssea',
    priority: 'critico',
    clinical_note: 'Consolidação óssea pode alterar geometria articular permanentemente. Tratar a zona como âncora do desvio compensatório.',
  },
  {
    code: 'TRM02',
    patterns: ['cirurgia', 'operado', 'operei', 'artrodese', 'pino', 'parafuso', 'placa de titanio', 'osteotomia'],
    zone_patterns: ['coluna', 'quadril', 'joelho', 'tornozelo', 'ombro', 'pe', 'punho'],
    label: 'Cirurgia / Fixação Interna',
    priority: 'alto',
    clinical_note: 'Segmento operado pode ter mobilidade artificialmente restrita ou reforcada. Vizinhos assumem carga compensatória.',
  },
  {
    code: 'TRM03',
    patterns: ['tendao cortado', 'ruptura de tendao', 'tendao rompido', 'ligamento rompido', 'ruptura do lca', 'ruptura ligamentar', 'corte parcial', 'corte total do tendao'],
    zone_patterns: ['patelar', 'quadricipital', 'joelho', 'ombro', 'tornozelo', 'aquiles'],
    label: 'Ruptura de Tendão/Ligamento',
    priority: 'critico',
    clinical_note: 'Inibição Artrogênica esperada: o SNC desliga parcialmente o músculo agonista para proteger a sutura. Não forcar extensão total sem base de estabilidade.',
  },
  {
    code: 'TRM04',
    patterns: ['retirada ossea', 'retirada de osso', 'amputacao', 'ressecao ossea'],
    zone_patterns: ['patela', 'joelho', 'pe', 'quadril'],
    label: 'Perda de Massa Óssea Estrutural',
    priority: 'critico',
    clinical_note: 'Alteração permanente do bracço de alavanca articular. Compensações são esperadas e não devem ser "corrigidas", apenas gerenciadas.',
  },
  {
    code: 'TRM05',
    patterns: ['acidente de moto', 'acidente de carro', 'queda de altura', 'impacto forte', 'atropelamento', 'colisao'],
    zone_patterns: ['quadril', 'coluna', 'joelho', 'ombro', 'cranio', 'bacia'],
    label: 'Trauma de Alto Impacto',
    priority: 'alto',
    clinical_note: 'Investigar padrão de "modo evasão" (tensão protetora aprendida) mesmo sem dor atual relatada — padrão motor pode persistir anos após a lesão.',
  },
  {
    code: 'TRM06',
    patterns: ['protese', 'implante articular', 'artroplastia'],
    zone_patterns: ['quadril', 'joelho', 'ombro'],
    label: 'Prótese / Implante Articular',
    priority: 'alto',
    clinical_note: 'ADM e vetores de carga devem respeitar limites do fabricante do implante. Consultar ortopedista antes de progredir carga axial.',
  },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // remove acentos
}

function extractSide(text: string, index: number): 'D' | 'E' | null {
  // olha numa janela de ~40 caracteres ao redor do termo encontrado
  const window = text.slice(Math.max(0, index - 40), index + 40);
  if (/esquerd/.test(window)) return 'E';
  if (/direit/.test(window)) return 'D';
  return null;
}

export interface TraumaFinding {
  code: string;
  label: string;
  priority: 'critico' | 'alto' | 'moderado';
  zone: string | null;
  side: 'D' | 'E' | null;
  clinical_note: string;
  matched_text: string;
}

export interface TraumaContextResult {
  findings: TraumaFinding[];
  primaryBlockage: TraumaFinding | null;
  narrative: string;
}

/**
 * ETAPA 1 do protocolo 9FIT: TRIAGEM DE TRAUMA.
 * Lê o texto livre de histórico (ex: campo "historico_lesoes" do questionário funcional)
 * e extrai os pontos de trauma, priorizando-os como "Bloqueio Primário".
 * Deve ser chamado ANTES de qualquer interpretação visual, para que a IA/motor local
 * já saiba que o corpo está comprometido a partir daquele ponto.
 */
export function extractTraumaContext(historyText: string): TraumaContextResult {
  if (!historyText || historyText.trim().length < 3) {
    return { findings: [], primaryBlockage: null, narrative: '' };
  }

  const normalized = normalize(historyText);
  const findings: TraumaFinding[] = [];

  TRAUMA_KEYWORDS.forEach(kw => {
    kw.patterns.forEach(pattern => {
      const idx = normalized.indexOf(normalize(pattern));
      if (idx === -1) return;
      const zone = kw.zone_patterns.find(z => normalized.includes(normalize(z))) || null;
      const side = extractSide(normalized, idx);
      findings.push({
        code: kw.code,
        label: kw.label,
        priority: kw.priority,
        zone,
        side,
        clinical_note: kw.clinical_note,
        matched_text: pattern,
      });
    });
  });

  // dedup por code+zone
  const dedupMap = new Map<string, TraumaFinding>();
  findings.forEach(f => dedupMap.set(`${f.code}_${f.zone}`, f));
  const uniqueFindings = Array.from(dedupMap.values());

  // Bloqueio primário = achado de maior prioridade (crítico > alto > moderado)
  const priorityRank = { critico: 3, alto: 2, moderado: 1 };
  const primaryBlockage = uniqueFindings.length
    ? uniqueFindings.sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority])[0]
    : null;

  let narrative = '';
  if (primaryBlockage) {
    const sideText = primaryBlockage.side === 'D' ? 'lado direito' : primaryBlockage.side === 'E' ? 'lado esquerdo' : '';
    const zoneText = primaryBlockage.zone ? ` (${primaryBlockage.zone}${sideText ? ', ' + sideText : ''})` : (sideText ? ` (${sideText})` : '');
    narrative = `Bloqueio Primário identificado: ${primaryBlockage.label}${zoneText}. ${primaryBlockage.clinical_note}`;
  }

  return { findings: uniqueFindings, primaryBlockage, narrative };
}

export default { extractTraumaContext, TRAUMA_KEYWORDS };
