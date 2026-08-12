// ============================================
// MOTOR DE REGRAS MIOFASCIAIS — COMPARTILHADO (Deno)
// Porte determinístico de src/data/knowledgeBase.ts
// Sem IA: apenas lógica condicional sobre flags.
// Protocolos completos vivem em public.ppa_protocols_library
// ============================================

export const myofascialFoundations = {
  lines: {
    LSP: { id: 'LSP', name: 'Linha Superficial Posterior', segments: ['occipital', 'sacro', 'calcâneo'], function: 'Extensão corporal completa', commonDysfunctions: ['encurtamento', 'hipertonicidade'] },
    LPA: { id: 'LPA', name: 'Linha Profunda Anterior', segments: ['língua', 'diafragma', 'psoas', 'arco-pé'], function: 'Estabilização central e suporte visceral', commonDysfunctions: ['inibição', 'fraqueza', 'encurtamento-psoas'] },
    LL: { id: 'LL', name: 'Linha Lateral', segments: ['ombro', 'quadril', 'joelho', 'tornozelo'], function: 'Estabilização lateral e equilíbrio', commonDysfunctions: ['encurtamento-unilateral', 'fraqueza-glúteo-médio'] },
    LE: { id: 'LE', name: 'Linha Espiral', segments: ['occipital', 'ombro-oposto', 'quadril-oposto', 'joelho', 'arco-pé'], function: 'Rotação e estabilização cruzada', commonDysfunctions: ['desequilíbrio-rotacional', 'compensação-cruzada'] },
    LBA: { id: 'LBA', name: 'Linha dos Braços', segments: ['pescoço', 'ombro', 'cotovelo', 'mão'], function: 'Integração membro superior', commonDysfunctions: ['tensão-cervical', 'protração-ombro'] },
    LF: { id: 'LF', name: 'Linha Frontal', segments: ['testa', 'esterno', 'púbis', 'pé'], function: 'Flexão e proteção anterior', commonDysfunctions: ['encurtamento-anterior', 'protração'] },
  },
} as const;

export interface FlagDef {
  name: string;
  severity: number;
  implies?: string[];
  location?: string;
  redFlag?: boolean;
}

export const evaluationFlags: Record<string, Record<string, FlagDef>> = {
  postural: {
    PEP01: { name: 'Pé Pronado', severity: 2, implies: ['LL', 'LPA', 'LE'] },
    PEP02: { name: 'Pé Supinado', severity: 2, implies: ['LL', 'LSP'] },
    PEP03: { name: 'Pé Plano', severity: 2, implies: ['LPA', 'LL'] },
    PEP04: { name: 'Joelho Valgo', severity: 2, implies: ['LL', 'LE'] },
    PEP05: { name: 'Joelho Varo', severity: 2, implies: ['LL', 'LSP'] },
    PEP06: { name: 'Hiperextensão de Joelho', severity: 1, implies: ['LSP'] },
    PEP07: { name: 'Anteversão Pélvica', severity: 2, implies: ['LPA', 'LSP'] },
    PEP08: { name: 'Retroversão Pélvica', severity: 2, implies: ['LSP', 'LPA'] },
    PEP09: { name: 'Hiperlordose Lombar', severity: 2, implies: ['LSP', 'LPA'] },
    PEP10: { name: 'Retificação Lombar', severity: 2, implies: ['LSP'] },
    PEP11: { name: 'Hipercifose Torácica', severity: 3, implies: ['LSP', 'LF', 'LBA'] },
    PEP12: { name: 'Protração de Ombros', severity: 2, implies: ['LF', 'LBA'] },
    PEP13: { name: 'Elevação de Ombro', severity: 1, implies: ['LBA', 'LE'] },
    PEP14: { name: 'Projeção Anterior Cabeça', severity: 3, implies: ['LSP', 'LF', 'LBA'] },
    PEP15: { name: 'Escoliose Estrutural', severity: 4, implies: ['LL', 'LE', 'LSP'] },
  },
  dynamic: {
    DYN01: { name: 'Valgo Dinâmico', severity: 3, implies: ['LL', 'LE', 'LPA'] },
    DYN02: { name: 'Rotação Interna Fêmur', severity: 2, implies: ['LE', 'LL'] },
    DYN03: { name: 'Compensação Lombar Agachamento', severity: 2, implies: ['LPA', 'LSP'] },
    DYN04: { name: 'Trendelenburg Positivo', severity: 3, implies: ['LL', 'LPA'] },
    DYN05: { name: 'Desequilíbrio Perna Única', severity: 2, implies: ['LL', 'LPA', 'LE'] },
  },
  tests: {
    TES01: { name: 'Adams Positivo', severity: 4, implies: ['LL', 'LE', 'LSP'] },
    TES02: { name: 'Thomas Positivo', severity: 2, implies: ['LPA'] },
    TES03: { name: 'Ober Positivo', severity: 2, implies: ['LL'] },
    TES04: { name: 'Flexão Anterior Limitada', severity: 2, implies: ['LSP'] },
    TES05: { name: 'Rotação Cervical Limitada', severity: 2, implies: ['LBA', 'LE'] },
  },
  pain: {
    DOR01: { name: 'Dor Lombar Grau 1', severity: 1, location: 'lombar' },
    DOR02: { name: 'Dor Lombar Grau 2', severity: 2, location: 'lombar' },
    DOR03: { name: 'Dor Lombar Grau 3', severity: 3, location: 'lombar' },
    DOR04: { name: 'Dor Joelho Anterior', severity: 2, location: 'joelho' },
    DOR05: { name: 'Dor Joelho Medial', severity: 2, location: 'joelho' },
    DOR06: { name: 'Dor Cervical', severity: 2, location: 'cervical' },
    DOR07: { name: 'Dor Ombro', severity: 2, location: 'ombro' },
  },
  neuroMetabolic: {
    NM01: { name: 'Edema', severity: 3, implies: ['LL'], redFlag: true },
    NM02: { name: 'Formigamento', severity: 4, implies: ['LPA', 'LE'], redFlag: true },
    NM03: { name: 'Inflamação Sistêmica', severity: 3, implies: [], redFlag: true },
    NM04: { name: 'Sensibilidade Nervosa', severity: 3, implies: ['LE', 'LPA'], redFlag: true },
  },
  context: {
    CTX01: { name: 'Calçado Instável', severity: 2, implies: ['LL', 'LPA'] },
    CTX02: { name: 'Idade > 70', severity: 3, implies: [] },
    CTX03: { name: 'Retrolistese', severity: 4, implies: ['LSP', 'LPA'], redFlag: true },
    CTX04: { name: 'Osteopenia', severity: 3, implies: ['LSP'], redFlag: true },
  },
  lesion: {
    LES01: { name: 'Ruptura LCA', severity: 4, implies: ['LL', 'LE'], redFlag: true },
    LES02: { name: 'Joanete (Hallux Valgus)', severity: 2, implies: ['LPA', 'LL'] },
    LES03: { name: 'Bursite', severity: 3, implies: ['LL'], redFlag: true },
  },
};

export interface DiagnosisOutput {
  diagnosis: string;
  severity: number;
  affectedLines: string[];
  mechanisms: string[];
  prognosis: string;
  protocolRef: string;
}

export interface DiagnosticRule {
  id: string;
  name: string;
  condition: { required: string[]; optional?: string[] };
  logicRule: string;
  output: DiagnosisOutput;
}

export const diagnosticRules: DiagnosticRule[] = [
  {
    id: 'DIAG_CONDRO',
    name: 'Condromalácia Patelar',
    condition: { required: ['PEP01', 'DYN01', 'DOR04'], optional: ['PEP04', 'DYN02'] },
    logicRule: 'IF (Pé Pronado AND Valgo Dinâmico AND Dor Joelho Anterior) THEN Condromalácia',
    output: {
      diagnosis: 'Condromalácia Patelar',
      severity: 3,
      affectedLines: ['LL', 'LE', 'LPA'],
      mechanisms: [
        'Pronação excessiva do pé gera rotação interna tibial',
        'Valgo dinâmico aumenta pressão lateral na patela',
        'Fraqueza de glúteo médio perpetua padrão disfuncional',
      ],
      prognosis: 'Moderado - Requer 12-16 semanas de intervenção',
      protocolRef: 'PROTOCOLO_CONDRO',
    },
  },
  {
    id: 'DIAG_LOMBALGIA_CRONICA',
    name: 'Lombalgia Crônica com Disfunção LPA',
    condition: { required: ['PEP07', 'DOR02', 'TES02'], optional: ['PEP09'] },
    logicRule: 'IF (Anteversão Pélvica AND Dor Lombar Grau 2+ AND Thomas Positivo) THEN Lombalgia Crônica',
    output: {
      diagnosis: 'Lombalgia Crônica - Disfunção LPA',
      severity: 3,
      affectedLines: ['LPA', 'LSP'],
      mechanisms: [
        'Encurtamento de iliopsoas causa tração lombar anterior',
        'Inibição de glúteo máximo perpetua anteversão',
        'Sobrecarga de paravertebrais lombares',
      ],
      prognosis: 'Bom - Responde bem a liberação + ativação (10-14 semanas)',
      protocolRef: 'PROTOCOLO_LOMBALGIA',
    },
  },
  {
    id: 'DIAG_SINDROME_CRUZADA_SUP',
    name: 'Síndrome Cruzada Superior',
    condition: { required: ['PEP11', 'PEP12', 'PEP14'], optional: ['DOR06'] },
    logicRule: 'IF (Hipercifose AND Protração Ombros AND Projeção Anterior Cabeça) THEN Síndrome Cruzada Superior',
    output: {
      diagnosis: 'Síndrome Cruzada Superior',
      severity: 3,
      affectedLines: ['LSP', 'LF', 'LBA'],
      mechanisms: [
        'Encurtamento de peitoral menor e maior',
        'Hipertonicidade de trapézio superior',
        'Inibição de romboides e serrátil anterior',
      ],
      prognosis: 'Bom - Responde a correção postural + exercícios (8-12 semanas)',
      protocolRef: 'PROTOCOLO_CRUZADA_SUP',
    },
  },
  {
    id: 'DIAG_ESCOLIOSE_FUNC',
    name: 'Escoliose Funcional',
    condition: { required: ['TES01', 'PEP15'], optional: ['PEP13'] },
    logicRule: 'IF (Adams Positivo AND Escoliose Estrutural) THEN Escoliose',
    output: {
      diagnosis: 'Escoliose Estrutural - Requer Avaliação Médica',
      severity: 4,
      affectedLines: ['LL', 'LE', 'LSP'],
      mechanisms: [
        'Assimetria vertebral estrutural',
        'Desequilíbrio de cadeias musculares laterais',
        'Compensação respiratória',
      ],
      prognosis: 'Variável - Depende de grau e maturidade esquelética',
      protocolRef: 'PROTOCOLO_ESCOLIOSE',
    },
  },
  {
    id: 'DIAG_VALGO_DINAMICO',
    name: 'Valgo Dinâmico Isolado',
    condition: { required: ['DYN01'], optional: ['PEP04', 'DOR05'] },
    logicRule: 'IF (Valgo Dinâmico) THEN Disfunção LL',
    output: {
      diagnosis: 'Valgo Dinâmico - Disfunção Linha Lateral',
      severity: 2,
      affectedLines: ['LL', 'LE'],
      mechanisms: [
        'Fraqueza de glúteo médio',
        'Hiperatividade de TFL e tensor da fáscia lata',
        'Rotação interna femoral excessiva',
      ],
      prognosis: 'Excelente - Alta resposta a fortalecimento (6-10 semanas)',
      protocolRef: 'PROTOCOLO_VALGO',
    },
  },
  {
    id: 'DIAG_MARILIA',
    name: 'Caso Marília - Valgo de Fuga (LCA + Joanete)',
    condition: { required: ['LES01', 'LES02'], optional: ['DYN01', 'PEP01'] },
    logicRule: 'IF (Ruptura LCA AND Joanete) THEN Valgo de Fuga',
    output: {
      diagnosis: 'Valgo Dinâmico de Fuga — Instabilidade LCA + Joanete',
      severity: 4,
      affectedLines: ['LL', 'LE', 'LPA'],
      mechanisms: [
        'Ruptura de LCA elimina estabilizador rotacional do joelho',
        'Joanete colapsa 1º raio → perda de push-off medial',
        'Valgo dinâmico é mecanismo de fuga, não fraqueza isolada',
        'Cadeia cinética ascendente comprometida desde o pé',
      ],
      prognosis: 'Moderado - Requer 16-20 semanas com ancoragem de pé',
      protocolRef: 'PROTOCOLO_LCA_JOANETE',
    },
  },
  {
    id: 'DIAG_MARIA_LOURDES',
    name: 'Caso Maria de Lourdes - Idoso Frágil',
    condition: { required: ['CTX02', 'CTX03'], optional: ['CTX04', 'NM01'] },
    logicRule: 'IF (Idade > 70 AND Retrolistese) THEN Carga Axial ZERO',
    output: {
      diagnosis: 'Instabilidade Vertebral com Fragilidade Óssea — CARGA AXIAL ZERO',
      severity: 4,
      affectedLines: ['LSP', 'LPA'],
      mechanisms: [
        'Retrolistese indica instabilidade segmentar vertebral',
        'Osteopenia reduz tolerância à compressão axial',
        'Edema indica processo inflamatório ativo → contraindicar carga direta',
        'Proibição de extensão lombar sob qualquer carga',
      ],
      prognosis: 'Reservado - Gestão conservadora indefinida',
      protocolRef: 'PROTOCOLO_IDOSO_FRAGIL',
    },
  },
  {
    id: 'DIAG_CLEITON',
    name: 'Caso Cleiton - Falha de Interface',
    condition: { required: ['CTX01', 'DOR03'], optional: ['PEP01'] },
    logicRule: 'IF (Calçado Instável AND Dor Lombar Grau 3) THEN Falha de Interface',
    output: {
      diagnosis: 'Falha de Interface Solo — Fator Cleiton',
      severity: 3,
      affectedLines: ['LPA', 'LSP', 'LL'],
      mechanisms: [
        'Calçado amortecido demais elimina feedback proprioceptivo',
        'Alongamento passivo pré-treino reduz stiffness articular',
        'Perda de estabilidade reflexa → compensação lombar',
        'Fisgada no Leg Press = falha de transferência de força pelo pé',
      ],
      prognosis: 'Excelente - Resposta imediata com troca de calçado e base rígida',
      protocolRef: 'PROTOCOLO_INTERFACE_SOLO',
    },
  },
  {
    id: 'DIAG_ELISA',
    name: 'Caso Elisa - Compressão Lateral + Bursite',
    condition: { required: ['LES03', 'PEP08'], optional: ['DOR05', 'DYN04'] },
    logicRule: 'IF (Bursite AND Retroversão Pélvica) THEN Compressão Lateral',
    output: {
      diagnosis: 'Síndrome de Compressão Lateral — Bursite por Shift Pélvico',
      severity: 3,
      affectedLines: ['LL', 'LPA'],
      mechanisms: [
        'Shift pélvico lateral esmaga a bursa trocantérica',
        'Retroversão pélvica agrava posição do fêmur',
        'Impacto axial direto é contraindicado',
        'Descompressão em cadeia fechada obrigatória antes de carga',
      ],
      prognosis: 'Bom - Responde a descompressão + controle pélvico (10-14 semanas)',
      protocolRef: 'PROTOCOLO_DESCOMPRESSAO_LATERAL',
    },
  },
  {
    id: 'DIAG_SWAYBACK',
    name: 'Swayback Postural',
    condition: { required: ['PEP08', 'PEP10'], optional: ['PEP11', 'DYN03'] },
    logicRule: 'IF (Retroversão Pélvica AND Retificação Lombar) THEN Swayback',
    output: {
      diagnosis: 'Swayback — Deslocamento Anterior do Centro de Gravidade',
      severity: 3,
      affectedLines: ['LSP', 'LPA', 'LF'],
      mechanisms: [
        'Centro de gravidade deslocado anteriormente',
        'Retroversão pélvica com retificação lombar (NÃO é hiperlordose)',
        'Inibição de core profundo (multífido, transverso)',
        'Reposicionamento do CG via ativação core profundo é obrigatório',
      ],
      prognosis: 'Bom - Responde a reposicionamento + core profundo (10-14 semanas)',
      protocolRef: 'PROTOCOLO_SWAYBACK',
    },
  },
  {
    id: 'DIAG_HIPERLORDOSE_FUNCIONAL',
    name: 'Hiperlordose Funcional',
    condition: { required: ['PEP07', 'PEP09'], optional: ['TES02', 'DOR02'] },
    logicRule: 'IF (Anteversão Pélvica AND Hiperlordose Lombar) THEN Hiperlordose Funcional',
    output: {
      diagnosis: 'Hiperlordose Funcional — Padrão Anteroversão',
      severity: 2,
      affectedLines: ['LPA', 'LSP'],
      mechanisms: [
        'Anteversão pélvica traciona lordose lombar',
        'Encurtamento de psoas e reto femoral',
        'Diferente de Swayback: aqui há ANTEVERSÃO (não retroversão)',
        'Reposicionamento do CG via ativação glúteo + core',
      ],
      prognosis: 'Bom - Responde a liberação + ativação (10-14 semanas)',
      protocolRef: 'PROTOCOLO_ANTEVERSAO',
    },
  },
];

/** Retorna a definição de uma flag pelo id (ex: 'DYN01'). */
export function getFlagDef(flagId: string): FlagDef | null {
  for (const group of Object.values(evaluationFlags)) {
    if (group[flagId]) return group[flagId];
  }
  return null;
}

/**
 * Motor determinístico: casa as flags recebidas contra diagnosticRules.
 * Uma regra dá match quando TODAS as flags `required` estão presentes.
 * Em caso de múltiplos matches, vence o de maior severidade (empate: mais
 * flags obrigatórias satisfeitas = regra mais específica).
 */
export function diagnoseFromFlags(flagIds: string[]): DiagnosisOutput | null {
  const set = new Set(flagIds || []);
  const matches = diagnosticRules.filter((rule) =>
    rule.condition.required.length > 0 && rule.condition.required.every((f) => set.has(f))
  );
  if (matches.length === 0) return null;

  matches.sort((a, b) => {
    const sev = b.output.severity - a.output.severity;
    if (sev !== 0) return sev;
    return b.condition.required.length - a.condition.required.length;
  });

  return matches[0].output;
}

/** Todas as regras que deram match (útil para contexto adicional). */
export function matchAllRules(flagIds: string[]): DiagnosticRule[] {
  const set = new Set(flagIds || []);
  return diagnosticRules.filter((rule) =>
    rule.condition.required.length > 0 && rule.condition.required.every((f) => set.has(f))
  );
}

/**
 * Busca o protocolo de intervenção completo em public.ppa_protocols_library.
 * `client` é um SupabaseClient já autenticado (service role nas edge functions).
 */
export async function fetchProtocol(client: any, protocolRef: string): Promise<any | null> {
  if (!protocolRef) return null;
  try {
    const { data, error } = await client
      .from('ppa_protocols_library')
      .select('*')
      .eq('protocol_key', protocolRef)
      .maybeSingle();
    if (error) {
      console.error('fetchProtocol error', error.message);
      return null;
    }
    return data ?? null;
  } catch (e) {
    console.error('fetchProtocol exception', e);
    return null;
  }
}
