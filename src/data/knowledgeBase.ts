// ============================================
// BASE DE CONHECIMENTO - MOTOR DE DIAGNÓSTICO
// Sistema SAARS - Avaliação Postural Profissional
// ============================================

// PARTE 1: FUNDAMENTOS - Linhas Miofasciais e Padrões
export const myofascialFoundations = {
  lines: {
    LSP: {
      id: 'LSP',
      name: 'Linha Superficial Posterior',
      segments: ['occipital', 'sacro', 'calcâneo'],
      function: 'Extensão corporal completa',
      commonDysfunctions: ['encurtamento', 'hipertonicidade']
    },
    LPA: {
      id: 'LPA',
      name: 'Linha Profunda Anterior',
      segments: ['língua', 'diafragma', 'psoas', 'arco-pé'],
      function: 'Estabilização central e suporte visceral',
      commonDysfunctions: ['inibição', 'fraqueza', 'encurtamento-psoas']
    },
    LL: {
      id: 'LL',
      name: 'Linha Lateral',
      segments: ['ombro', 'quadril', 'joelho', 'tornozelo'],
      function: 'Estabilização lateral e equilíbrio',
      commonDysfunctions: ['encurtamento-unilateral', 'fraqueza-glúteo-médio']
    },
    LE: {
      id: 'LE',
      name: 'Linha Espiral',
      segments: ['occipital', 'ombro-oposto', 'quadril-oposto', 'joelho', 'arco-pé'],
      function: 'Rotação e estabilização cruzada',
      commonDysfunctions: ['desequilíbrio-rotacional', 'compensação-cruzada']
    },
    LBA: {
      id: 'LBA',
      name: 'Linha dos Braços',
      segments: ['pescoço', 'ombro', 'cotovelo', 'mão'],
      function: 'Integração membro superior',
      commonDysfunctions: ['tensão-cervical', 'protração-ombro']
    },
    LF: {
      id: 'LF',
      name: 'Linha Frontal',
      segments: ['testa', 'esterno', 'púbis', 'pé'],
      function: 'Flexão e proteção anterior',
      commonDysfunctions: ['encurtamento-anterior', 'protração']
    }
  },
  patterns: {
    encurtamento: { type: 'structural', impact: 'restriction' },
    inibicao: { type: 'neurological', impact: 'weakness' },
    hipertonicidade: { type: 'neuromuscular', impact: 'excess-tension' },
    fraqueza: { type: 'muscular', impact: 'instability' }
  }
};

// PARTE 2: FLAGS DE AVALIAÇÃO - Inputs do Sistema
export const evaluationFlags = {
  // Flags Posturais Estáticos
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
    // Whitepaper 9FIT Postura Pro Analyzer
    PEP16: { name: 'Valgo de Cotovelo', severity: 2, implies: ['LBA'] }, // ângulo > 15° = instabilidade ligamentar
    PEP17: { name: 'Drop do Navicular', severity: 2, implies: ['LPA'] }, // colapso do arco = falha da Linha Profunda Anterior
    PEP18: { name: 'Umbigo Triste/Desviado', severity: 2, implies: ['LPA', 'LE'] }, // hipotonia de reto abdominal ou escoliose
    PEP19: { name: 'Triângulo de Tales Assimétrico', severity: 3, implies: ['LL', 'LE', 'LSP'] } // prova visual de escoliose/colapso lateral
  },
  
  // Flags Funcionais Dinâmicos
  dynamic: {
    DYN01: { name: 'Valgo Dinâmico', severity: 3, implies: ['LL', 'LE', 'LPA'] },
    DYN02: { name: 'Rotação Interna Fêmur', severity: 2, implies: ['LE', 'LL'] },
    DYN03: { name: 'Compensação Lombar Agachamento', severity: 2, implies: ['LPA', 'LSP'] },
    DYN04: { name: 'Trendelenburg Positivo', severity: 3, implies: ['LL', 'LPA'] },
    DYN05: { name: 'Desequilíbrio Perna Única', severity: 2, implies: ['LL', 'LPA', 'LE'] }
  },
  
  // Flags de Testes Funcionais
  tests: {
    TES01: { name: 'Adams Positivo', severity: 4, implies: ['LL', 'LE', 'LSP'] },
    TES02: { name: 'Thomas Positivo', severity: 2, implies: ['LPA'] },
    TES03: { name: 'Ober Positivo', severity: 2, implies: ['LL'] },
    TES04: { name: 'Flexão Anterior Limitada', severity: 2, implies: ['LSP'] },
    TES05: { name: 'Rotação Cervical Limitada', severity: 2, implies: ['LBA', 'LE'] },
    TES06: { name: 'Teste do Calço Positivo', severity: 3, implies: ['LSP', 'LL'] }, // calço 1-1.5cm nivela quadril e simetriza Tales = discrepância funcional, indica palmilha
    TES07: { name: 'Short Foot Test Positivo', severity: 2, implies: ['LPA', 'LL'] }, // apoio unipodal: arco desaba e joelho vai para dentro
    TES08: { name: 'Ritmo Escapular Alterado', severity: 2, implies: ['LBA'] } // elevação de ombro antes de 90° de abdução
  },
  
  // Flags de Dor
  pain: {
    DOR01: { name: 'Dor Lombar Grau 1', severity: 1, location: 'lombar' },
    DOR02: { name: 'Dor Lombar Grau 2', severity: 2, location: 'lombar' },
    DOR03: { name: 'Dor Lombar Grau 3', severity: 3, location: 'lombar' },
    DOR04: { name: 'Dor Joelho Anterior', severity: 2, location: 'joelho' },
    DOR05: { name: 'Dor Joelho Medial', severity: 2, location: 'joelho' },
    DOR06: { name: 'Dor Cervical', severity: 2, location: 'cervical' },
    DOR07: { name: 'Dor Ombro', severity: 2, location: 'ombro' }
  },

  // Flags Neuro-Metabólicos
  neuroMetabolic: {
    NM01: { name: 'Edema', severity: 3, implies: ['LL'], redFlag: true },
    NM02: { name: 'Formigamento', severity: 4, implies: ['LPA', 'LE'], redFlag: true },
    NM03: { name: 'Inflamação Sistêmica', severity: 3, implies: [], redFlag: true },
    NM04: { name: 'Sensibilidade Nervosa', severity: 3, implies: ['LE', 'LPA'], redFlag: true }
  },

  // Flags de Contexto
  context: {
    CTX01: { name: 'Calçado Instável', severity: 2, implies: ['LL', 'LPA'] },
    CTX02: { name: 'Idade > 70', severity: 3, implies: [] },
    CTX03: { name: 'Retrolistese', severity: 4, implies: ['LSP', 'LPA'], redFlag: true },
    CTX04: { name: 'Osteopenia', severity: 3, implies: ['LSP'], redFlag: true },
    CTX05: { name: 'Pé Rodado 10h10', severity: 2, implies: ['LE', 'LL'] } // rotação externa bilateral = bloqueio de tornozelo/quadril
  },

  // Flags de Lesão
  lesion: {
    LES01: { name: 'Ruptura LCA', severity: 4, implies: ['LL', 'LE'], redFlag: true },
    LES02: { name: 'Joanete (Hallux Valgus)', severity: 2, implies: ['LPA', 'LL'] },
    LES03: { name: 'Bursite', severity: 3, implies: ['LL'], redFlag: true }
  }
};

// PARTE 3: REGRAS DE DIAGNÓSTICO - Lógica de Processamento
export const diagnosticRules = [
  {
    id: 'DIAG_CONDRO',
    name: 'Condromalácia Patelar',
    condition: {
      required: ['PEP01', 'DYN01', 'DOR04'],
      optional: ['PEP04', 'DYN02']
    },
    logicRule: 'IF (Pé Pronado AND Valgo Dinâmico AND Dor Joelho Anterior) THEN Condromalácia',
    output: {
      diagnosis: 'Condromalácia Patelar',
      severity: 3,
      affectedLines: ['LL', 'LE', 'LPA'],
      mechanisms: [
        'Pronação excessiva do pé gera rotação interna tibial',
        'Valgo dinâmico aumenta pressão lateral na patela',
        'Fraqueza de glúteo médio perpetua padrão disfuncional'
      ],
      prognosis: 'Moderado - Requer 12-16 semanas de intervenção',
      protocolRef: 'PROTOCOLO_CONDRO'
    }
  },
  {
    id: 'DIAG_LOMBALGIA_CRONICA',
    name: 'Lombalgia Crônica com Disfunção LPA',
    condition: {
      required: ['PEP07', 'DOR02', 'TES02'],
      optional: ['PEP09']
    },
    logicRule: 'IF (Anteversão Pélvica AND Dor Lombar Grau 2+ AND Thomas Positivo) THEN Lombalgia Crônica',
    output: {
      diagnosis: 'Lombalgia Crônica - Disfunção LPA',
      severity: 3,
      affectedLines: ['LPA', 'LSP'],
      mechanisms: [
        'Encurtamento de iliopsoas causa tração lombar anterior',
        'Inibição de glúteo máximo perpetua anteversão',
        'Sobrecarga de paravertebrais lombares'
      ],
      prognosis: 'Bom - Responde bem a liberação + ativação (10-14 semanas)',
      protocolRef: 'PROTOCOLO_LOMBALGIA'
    }
  },
  {
    id: 'DIAG_SINDROME_CRUZADA_SUP',
    name: 'Síndrome Cruzada Superior',
    condition: {
      required: ['PEP11', 'PEP12', 'PEP14'],
      optional: ['DOR06']
    },
    logicRule: 'IF (Hipercifose AND Protração Ombros AND Projeção Anterior Cabeça) THEN Síndrome Cruzada Superior',
    output: {
      diagnosis: 'Síndrome Cruzada Superior',
      severity: 3,
      affectedLines: ['LSP', 'LF', 'LBA'],
      mechanisms: [
        'Encurtamento de peitoral menor e maior',
        'Hipertonicidade de trapézio superior',
        'Inibição de romboides e serrátil anterior'
      ],
      prognosis: 'Bom - Responde a correção postural + exercícios (8-12 semanas)',
      protocolRef: 'PROTOCOLO_CRUZADA_SUP'
    }
  },
  {
    id: 'DIAG_ESCOLIOSE_FUNC',
    name: 'Escoliose Funcional',
    condition: {
      required: ['TES01', 'PEP15'],
      optional: ['PEP13']
    },
    logicRule: 'IF (Adams Positivo AND Escoliose Estrutural) THEN Escoliose',
    output: {
      diagnosis: 'Escoliose Estrutural - Requer Avaliação Médica',
      severity: 4,
      affectedLines: ['LL', 'LE', 'LSP'],
      mechanisms: [
        'Assimetria vertebral estrutural',
        'Desequilíbrio de cadeias musculares laterais',
        'Compensação respiratória'
      ],
      prognosis: 'Variável - Depende de grau e maturidade esquelética',
      protocolRef: 'PROTOCOLO_ESCOLIOSE'
    }
  },
  {
    id: 'DIAG_VALGO_DINAMICO',
    name: 'Valgo Dinâmico Isolado',
    condition: {
      required: ['DYN01'],
      optional: ['PEP04', 'DOR05']
    },
    logicRule: 'IF (Valgo Dinâmico) THEN Disfunção LL',
    output: {
      diagnosis: 'Valgo Dinâmico - Disfunção Linha Lateral',
      severity: 2,
      affectedLines: ['LL', 'LE'],
      mechanisms: [
        'Fraqueza de glúteo médio',
        'Hiperatividade de TFL e tensor da fáscia lata',
        'Rotação interna femoral excessiva'
      ],
      prognosis: 'Excelente - Alta resposta a fortalecimento (6-10 semanas)',
      protocolRef: 'PROTOCOLO_VALGO'
    }
  },

  // ============================================
  // CASOS CLÍNICOS DO CHECKLIST MASTER
  // ============================================

  // CASO MARÍLIA: Ruptura LCA + Joanete → Valgo de Fuga
  {
    id: 'DIAG_MARILIA',
    name: 'Caso Marília - Valgo de Fuga (LCA + Joanete)',
    condition: {
      required: ['LES01', 'LES02'],
      optional: ['DYN01', 'PEP01']
    },
    logicRule: 'IF (Ruptura LCA AND Joanete) THEN Valgo de Fuga',
    output: {
      diagnosis: 'Valgo Dinâmico de Fuga — Instabilidade LCA + Joanete',
      severity: 4,
      affectedLines: ['LL', 'LE', 'LPA'],
      mechanisms: [
        'Ruptura de LCA elimina estabilizador rotacional do joelho',
        'Joanete colapsa 1º raio → perda de push-off medial',
        'Valgo dinâmico é mecanismo de fuga, não fraqueza isolada',
        'Cadeia cinética ascendente comprometida desde o pé'
      ],
      prognosis: 'Moderado - Requer 16-20 semanas com ancoragem de pé',
      protocolRef: 'PROTOCOLO_LCA_JOANETE'
    }
  },

  // CASO MARIA DE LOURDES: Retrolistese + Osteopenia + Edema (78 anos)
  {
    id: 'DIAG_MARIA_LOURDES',
    name: 'Caso Maria de Lourdes - Idoso Frágil',
    condition: {
      required: ['CTX02', 'CTX03'],
      optional: ['CTX04', 'NM01']
    },
    logicRule: 'IF (Idade > 70 AND Retrolistese) THEN Carga Axial ZERO',
    output: {
      diagnosis: 'Instabilidade Vertebral com Fragilidade Óssea — CARGA AXIAL ZERO',
      severity: 4,
      affectedLines: ['LSP', 'LPA'],
      mechanisms: [
        'Retrolistese indica instabilidade segmentar vertebral',
        'Osteopenia reduz tolerância à compressão axial',
        'Edema indica processo inflamatório ativo → contraindicar carga direta',
        'Proibição de extensão lombar sob qualquer carga'
      ],
      prognosis: 'Reservado - Gestão conservadora indefinida',
      protocolRef: 'PROTOCOLO_IDOSO_FRAGIL'
    }
  },

  // CASO CLEITON: Falha de Interface (calçado instável)
  {
    id: 'DIAG_CLEITON',
    name: 'Caso Cleiton - Falha de Interface',
    condition: {
      required: ['CTX01', 'DOR03'],
      optional: ['PEP01']
    },
    logicRule: 'IF (Calçado Instável AND Dor Lombar Grau 3) THEN Falha de Interface',
    output: {
      diagnosis: 'Falha de Interface Solo — Fator Cleiton',
      severity: 3,
      affectedLines: ['LPA', 'LSP', 'LL'],
      mechanisms: [
        'Calçado amortecido demais elimina feedback proprioceptivo',
        'Alongamento passivo pré-treino reduz stiffness articular',
        'Perda de estabilidade reflexa → compensação lombar',
        'Fisgada no Leg Press = falha de transferência de força pelo pé'
      ],
      prognosis: 'Excelente - Resposta imediata com troca de calçado e base rígida',
      protocolRef: 'PROTOCOLO_INTERFACE_SOLO'
    }
  },

  // CASO ELISA: Bursite + Shift Pélvico
  {
    id: 'DIAG_ELISA',
    name: 'Caso Elisa - Compressão Lateral + Bursite',
    condition: {
      required: ['LES03', 'PEP08'],
      optional: ['DOR05', 'DYN04']
    },
    logicRule: 'IF (Bursite AND Retroversão Pélvica) THEN Compressão Lateral',
    output: {
      diagnosis: 'Síndrome de Compressão Lateral — Bursite por Shift Pélvico',
      severity: 3,
      affectedLines: ['LL', 'LPA'],
      mechanisms: [
        'Shift pélvico lateral esmaga a bursa trocantérica',
        'Retroversão pélvica agrava posição do fêmur',
        'Impacto axial direto é contraindicado',
        'Descompressão em cadeia fechada obrigatória antes de carga'
      ],
      prognosis: 'Bom - Responde a descompressão + controle pélvico (10-14 semanas)',
      protocolRef: 'PROTOCOLO_DESCOMPRESSAO_LATERAL'
    }
  },

  // SWAYBACK (diferenciado de hiperlordose)
  {
    id: 'DIAG_SWAYBACK',
    name: 'Swayback Postural',
    condition: {
      required: ['PEP08', 'PEP10'],
      optional: ['PEP11', 'DYN03']
    },
    logicRule: 'IF (Retroversão Pélvica AND Retificação Lombar) THEN Swayback',
    output: {
      diagnosis: 'Swayback — Deslocamento Anterior do Centro de Gravidade',
      severity: 3,
      affectedLines: ['LSP', 'LPA', 'LF'],
      mechanisms: [
        'Centro de gravidade deslocado anteriormente',
        'Retroversão pélvica com retificação lombar (NÃO é hiperlordose)',
        'Inibição de core profundo (multífido, transverso)',
        'Reposicionamento do CG via ativação core profundo é obrigatório'
      ],
      prognosis: 'Bom - Responde a reposicionamento + core profundo (10-14 semanas)',
      protocolRef: 'PROTOCOLO_SWAYBACK'
    }
  },

  // HIPERLORDOSE FUNCIONAL (diferenciada de swayback)
  {
    id: 'DIAG_HIPERLORDOSE_FUNCIONAL',
    name: 'Hiperlordose Funcional',
    condition: {
      required: ['PEP07', 'PEP09'],
      optional: ['TES02', 'DOR02']
    },
    logicRule: 'IF (Anteversão Pélvica AND Hiperlordose Lombar) THEN Hiperlordose Funcional',
    output: {
      diagnosis: 'Hiperlordose Funcional — Padrão Anteroversão',
      severity: 2,
      affectedLines: ['LPA', 'LSP'],
      mechanisms: [
        'Anteversão pélvica traciona lordose lombar',
        'Encurtamento de psoas e reto femoral',
        'Diferente de Swayback: aqui há ANTEVERSÃO (não retroversão)',
        'Reposicionamento do CG via ativação glúteo + core'
      ],
      prognosis: 'Bom - Responde a liberação + ativação (10-14 semanas)',
      protocolRef: 'PROTOCOLO_ANTEVERSAO'
    }
  },

  // COLAPSO LATERAL (whitepaper 9FIT — escoliose funcional por perna curta)
  {
    id: 'DIAG_COLAPSO_LATERAL',
    name: 'Síndrome de Colapso Lateral (Escoliose Funcional por Perna Curta)',
    condition: {
      required: ['PEP19', 'PEP08'],
      optional: ['PEP18', 'CTX05']
    },
    logicRule: 'IF (Triângulo de Tales Assimétrico AND Retroversão/Drop Pélvico) THEN Colapso Lateral',
    output: {
      diagnosis: 'Síndrome de Colapso Lateral',
      severity: 3,
      affectedLines: ['LL', 'LE', 'LSP'],
      mechanisms: [
        'Perna funcionalmente ou anatomicamente mais curta gera queda pélvica de um lado',
        'Tronco cai para o lado curto, coluna faz curva compensatória para o lado oposto',
        'Espasmo lombar unilateral crônico tentando conter a queda do tronco',
        'Confirmar com Teste do Calço: se simetriza com calço de 1-1.5cm, é discrepância funcional (indicar palmilha); se resistir ao calço, é rigidez estrutural'
      ],
      prognosis: 'Bom se funcional (responde a palmilha + descompressão); reservado se estrutural',
      protocolRef: 'PROTOCOLO_COLAPSO_LATERAL'
    }
  }
];

// PARTE 3.1: ARQUÉTIPOS BIOMECÂNICOS — macro-classificação antes das flags
export const biomechanicalArchetypes = {
  SWAYBACK: { name: 'Swayback', criteria: 'Quadril à frente do tornozelo + Glúteo inibido', cause: 'Ligamentos frouxos / frouxidão ligamentar' },
  FLAT_BACK: { name: 'Flat Back', criteria: 'Lombar reta + Retroversão pélvica', cause: 'Isquiotibiais curtos' },
  CIFOSE_LORDOSE: { name: 'Cifose-Lordose', criteria: 'Bumbum empinado + Corcunda (hipercifose)', cause: 'Síndrome Cruzada Superior e Inferior combinadas' },
  COLAPSO_LATERAL: { name: 'Colapso Lateral', criteria: 'Um ombro mais baixo + Triângulo de Tales assimétrico', cause: 'Escoliose ou perna curta (real ou funcional)' }
};

// PARTE 4: PROTOCOLOS DE INTERVENÇÃO - Sistema 9FIT OS
export const interventionProtocols: Record<string, any> = {
  // PROTOCOLO 1 - Ombro Anteriorizado (Slide Umeral Anterior)
  PROTOCOLO_OMBRO_ANTERIOR: {
    id: 'PROTOCOLO_OMBRO_ANTERIOR',
    name: 'Protocolo Ombro Anteriorizado - Slide Umeral',
    duration: '8-10 semanas',
    phases: [
      { name: 'Fase 1 - Liberação Miofascial', blocks: [{ type: 'liberacao', exercises: [
        { name: 'Liberação Peitoral Menor com bola', sets: 3, reps: '60s por lado', tool: 'bola de lacrosse' },
        { name: 'Liberação Deltoide Anterior', sets: 2, reps: '45s por lado', tool: 'foam roller' }
      ]}]},
      { name: 'Fase 2 - Pré-Ativação', blocks: [{ type: 'ativacao', exercises: [
        { name: 'Rotação Externa com Banda (Infraespinal/Redondo Menor)', sets: 3, reps: 15, load: 'elástico leve' },
        { name: 'No Money Drill', sets: 3, reps: 12, load: 'corporal' }
      ]}]},
      { name: 'Fase 3 - Estabilidade e Integração', blocks: [{ type: 'estabilidade', exercises: [
        { name: 'Retração Escapular Consciente (Wall Slides)', sets: 3, reps: 12, load: 'corporal' },
        { name: 'Y-T-W Raises', sets: 3, reps: '10 de cada', load: 'leve' }
      ]}]},
      { name: 'Fase 4 - Fortalecimento', blocks: [{ type: 'fortalecimento', exercises: [
        { name: 'Face Pulls', sets: 4, reps: 15, load: 'progressivo' },
        { name: 'Remada Baixa com Pronação', sets: 4, reps: 12, load: 'progressivo' }
      ]}]},
      { name: 'Fase 5 - Alongamento Final', blocks: [{ type: 'alongamento', exercises: [
        { name: 'Alongamento Peitoral em Porta', sets: 3, reps: '40s', intensity: 'moderado' }
      ]}]}
    ]
  },

  PROTOCOLO_HIPERCIFOSE: {
    id: 'PROTOCOLO_HIPERCIFOSE',
    name: 'Protocolo Hipercifose Torácica - Bloqueio Estrutural',
    duration: '10-12 semanas',
    phases: [
      { name: 'Fase 1 - Liberação', blocks: [{ type: 'liberacao', exercises: [
        { name: 'Mobilização Torácica no Foam Roller', sets: 3, reps: '8-10 repetições', tool: 'foam roller' },
        { name: 'Liberação Latíssimo', sets: 2, reps: '60s por lado', tool: 'bola' }
      ]}]},
      { name: 'Fase 2 - Pré-Ativação', blocks: [{ type: 'ativacao', exercises: [
        { name: 'Prone Cobra', sets: 3, reps: 12, load: 'corporal' },
        { name: 'Wall Angels', sets: 3, reps: 10, load: 'corporal' }
      ]}]},
      { name: 'Fase 3 - Estabilidade', blocks: [{ type: 'estabilidade', exercises: [
        { name: 'Y-Raises em Prancha Inclinada', sets: 3, reps: 12, load: 'leve' }
      ]}]},
      { name: 'Fase 4 - Força', blocks: [{ type: 'fortalecimento', exercises: [
        { name: 'Zercher Carry', sets: 3, duration: '30-40s', load: 'moderado' },
        { name: 'Extensões Torácicas no Banco', sets: 4, reps: 15, load: 'progressivo' }
      ]}]},
      { name: 'Fase 5 - Alongamento', blocks: [{ type: 'alongamento', exercises: [
        { name: 'Prece Estendida', sets: 3, reps: '45s', intensity: 'moderado' },
        { name: 'Gato-Vaca', sets: 3, reps: 10, intensity: 'mobilidade' }
      ]}]}
    ]
  },

  PROTOCOLO_ANTEVERSAO: {
    id: 'PROTOCOLO_ANTEVERSAO',
    name: 'Protocolo Anteversão Pélvica - Sobrecarga Facetária',
    duration: '10-14 semanas',
    phases: [
      { name: 'Fase 1 - Liberação', blocks: [{ type: 'liberacao', exercises: [
        { name: 'Liberação Psoas (bola)', sets: 3, reps: '90s por lado', tool: 'bola' },
        { name: 'Liberação Quadrado Lombar', sets: 2, reps: '60s por lado', tool: 'bola' }
      ]}]},
      { name: 'Fase 2 - Pré-Ativação', blocks: [{ type: 'ativacao', exercises: [
        { name: 'Dead Bug', sets: 3, reps: '10 por lado', load: 'corporal' },
        { name: 'Posterior Pelvic Tilt Consciente', sets: 3, reps: 12, load: 'corporal' }
      ]}]},
      { name: 'Fase 3 - Estabilidade Core', blocks: [{ type: 'estabilidade', exercises: [
        { name: 'Respiração 360° (Diafragmática)', sets: 4, reps: '8 ciclos', position: 'decúbito' },
        { name: 'Prancha Anti-Extensão (RKC)', sets: 3, duration: '30-45s', load: 'corporal' }
      ]}]},
      { name: 'Fase 4 - Força', blocks: [{ type: 'fortalecimento', exercises: [
        { name: 'Hip Thrust', sets: 4, reps: 12, load: 'progressivo' },
        { name: 'Prancha com Protração Escapular', sets: 3, duration: '40s', load: 'corporal' }
      ]}]},
      { name: 'Fase 5 - Alongamento', blocks: [{ type: 'alongamento', exercises: [
        { name: 'Alongamento Flexores do Quadril (meio ajoelhado)', sets: 3, reps: '45s por lado', intensity: 'moderado' }
      ]}]}
    ]
  },

  PROTOCOLO_VALGO_CONDRO: {
    id: 'PROTOCOLO_VALGO_CONDRO',
    name: 'Protocolo Valgo Dinâmico - Síndrome Femoropatelar',
    duration: '12-16 semanas',
    phases: [
      { name: 'Fase 1 - Liberação', blocks: [{ type: 'liberacao', exercises: [
        { name: 'Liberação TFL', sets: 3, reps: '60s por lado', tool: 'foam roller' },
        { name: 'Liberação Adutores', sets: 2, reps: '60s por lado', tool: 'foam roller' }
      ]}]},
      { name: 'Fase 2 - Pré-Ativação', blocks: [{ type: 'ativacao', exercises: [
        { name: 'Clamshell (Glúteo Médio)', sets: 3, reps: 15, load: 'elástico leve' },
        { name: 'VMO Isométrico (Terminal Extension)', sets: 3, reps: '20s', load: 'corporal' }
      ]}]},
      { name: 'Fase 3 - Estabilidade', blocks: [{ type: 'estabilidade', exercises: [
        { name: 'RNT Squat (Reactive Neuromuscular Training)', sets: 3, reps: 10, load: 'elástico' },
        { name: 'Drill de Alinhamento do Joelho (espelho)', sets: 3, reps: 12, load: 'corporal' }
      ]}]},
      { name: 'Fase 4 - Força', blocks: [{ type: 'fortalecimento', exercises: [
        { name: 'Agachamento Búlgaro', sets: 4, reps: '10 por lado', load: 'progressivo' },
        { name: 'Passada Lateral com Resistência', sets: 3, reps: '12 por lado', load: 'halteres' }
      ]}]},
      { name: 'Fase 5 - Alongamento', blocks: [{ type: 'alongamento', exercises: [
        { name: 'Alongamento Glúteo (Figura 4)', sets: 3, reps: '40s por lado', intensity: 'moderado' }
      ]}]}
    ]
  },

  PROTOCOLO_CABECA_PROTUSA: {
    id: 'PROTOCOLO_CABECA_PROTUSA',
    name: 'Protocolo Cabeça Protusa - Síndrome Cruzada Superior Cervical',
    duration: '8-12 semanas',
    phases: [
      { name: 'Fase 1 - Liberação', blocks: [{ type: 'liberacao', exercises: [
        { name: 'Liberação Suboccipitais (bola de tênis)', sets: 3, reps: '60s', tool: 'bola' },
        { name: 'Liberação Trapézio Superior', sets: 2, reps: '45s por lado', tool: 'mãos' }
      ]}]},
      { name: 'Fase 2 - Pré-Ativação', blocks: [{ type: 'ativacao', exercises: [
        { name: 'Chin Tucks (Retrações Cervicais)', sets: 3, reps: 15, load: 'corporal' }
      ]}]},
      { name: 'Fase 3 - Estabilidade', blocks: [{ type: 'estabilidade', exercises: [
        { name: 'Alinhamento Cervical contra Parede', sets: 3, duration: '30s', load: 'corporal' }
      ]}]},
      { name: 'Fase 4 - Força', blocks: [{ type: 'fortalecimento', exercises: [
        { name: 'Farmer Walk (Postura)', sets: 3, duration: '40s', load: 'moderado' },
        { name: 'Face Pull Superior (Cervical)', sets: 4, reps: 15, load: 'progressivo' }
      ]}]},
      { name: 'Fase 5 - Alongamento', blocks: [{ type: 'alongamento', exercises: [
        { name: 'Alongamento ECOM', sets: 3, reps: '30s por lado', intensity: 'leve' },
        { name: 'Alongamento Peitoral em Porta', sets: 3, reps: '40s', intensity: 'moderado' }
      ]}]}
    ]
  },

  PROTOCOLO_PE_PRONADO: {
    id: 'PROTOCOLO_PE_PRONADO',
    name: 'Protocolo Pronação do Pé - Insuficiência do Arco Plantar',
    duration: '8-10 semanas',
    phases: [
      { name: 'Fase 1 - Liberação', blocks: [{ type: 'liberacao', exercises: [
        { name: 'Liberação Fáscia Plantar (bola)', sets: 3, reps: '90s por pé', tool: 'bola' },
        { name: 'Liberação Fibulares', sets: 2, reps: '60s por lado', tool: 'foam roller' }
      ]}]},
      { name: 'Fase 2 - Pré-Ativação', blocks: [{ type: 'ativacao', exercises: [
        { name: 'Short Foot (Ativação do Arco)', sets: 3, reps: '15 contrações', load: 'corporal' }
      ]}]},
      { name: 'Fase 3 - Estabilidade', blocks: [{ type: 'estabilidade', exercises: [
        { name: 'Elevação de Panturrilha com Bola entre Tornozelos', sets: 3, reps: 15, load: 'corporal' }
      ]}]},
      { name: 'Fase 4 - Força', blocks: [{ type: 'fortalecimento', exercises: [
        { name: 'Stiff Unipodal', sets: 3, reps: '10 por perna', load: 'progressivo' },
        { name: 'Panturrilha Sentado (Tibial Posterior)', sets: 4, reps: 15, load: 'progressivo' }
      ]}]},
      { name: 'Fase 5 - Alongamento', blocks: [{ type: 'alongamento', exercises: [
        { name: 'Alongamento Gastrocnêmio', sets: 3, reps: '40s por lado', intensity: 'moderado' }
      ]}]}
    ]
  },

  PROTOCOLO_LOMBALGIA: {
    id: 'PROTOCOLO_LOMBALGIA',
    name: 'Protocolo Lombalgia Crônica - LPA',
    duration: '10-14 semanas',
    phases: [
      { name: 'Fase 1 - Respiração e Liberação', blocks: [
        { type: 'respiracao', exercises: [
          { name: 'Respiração Diafragmática 360°', sets: 4, reps: '8 ciclos', position: 'decúbito dorsal' },
          { name: 'Respiração 90/90', sets: 3, reps: '10 ciclos', position: '90/90' }
        ]},
        { type: 'liberacao', exercises: [
          { name: 'Liberação Iliopsoas', sets: 2, reps: '90s/lado', tool: 'bola' },
          { name: 'Liberação QL', sets: 2, reps: '60s/lado', tool: 'foam roller' },
          { name: 'Liberação Paravertebrais', sets: 3, reps: '60s', tool: 'rolo' }
        ]}
      ]},
      { name: 'Fase 2 - Ativação Core (Semanas 4-8)', blocks: [{ type: 'ativacao', exercises: [
        { name: 'Dead Bug', sets: 3, reps: 12, tempo: 'controlado' },
        { name: 'Bird Dog', sets: 3, reps: '10/lado', tempo: 'pausado' },
        { name: 'Prancha Frontal', sets: 3, reps: '30-45s', progressão: 'tempo' },
        { name: 'Ponte Glúteo', sets: 4, reps: 15, load: 'elástico' }
      ]}]},
      { name: 'Fase 3 - Fortalecimento Integrado (Semanas 9-14)', blocks: [{ type: 'fortalecimento', exercises: [
        { name: 'Agachamento Goblet', sets: 4, reps: 12, load: 'progressivo' },
        { name: 'Levantamento Terra Romeno', sets: 3, reps: 10, load: 'moderado' },
        { name: 'Farmer Walk', sets: 3, duration: '30-45s', load: 'halteres' }
      ]}]}
    ]
  },

  PROTOCOLO_CRUZADA_SUP: {
    id: 'PROTOCOLO_CRUZADA_SUP',
    name: 'Protocolo Síndrome Cruzada Superior',
    duration: '8-12 semanas',
    phases: [
      { name: 'Fase 1 - Liberação Anterior (Semanas 1-3)', blocks: [
        { type: 'liberacao', exercises: [
          { name: 'Liberação Peitoral Menor', sets: 2, reps: '90s/lado', tool: 'bola' },
          { name: 'Liberação Peitoral Maior', sets: 2, reps: '60s/lado', tool: 'foam roller' },
          { name: 'Liberação Trapézio Superior', sets: 3, reps: '45s/lado', tool: 'mãos' }
        ]},
        { type: 'alongamento', exercises: [
          { name: 'Alongamento Peitoral Porta', sets: 3, reps: '30s/lado', angle: '90°' },
          { name: 'Alongamento Cervical Lateral', sets: 3, reps: '30s/lado', intensity: 'suave' }
        ]}
      ]},
      { name: 'Fase 2 - Ativação Posterior (Semanas 4-8)', blocks: [{ type: 'ativacao', exercises: [
        { name: 'Retração Escapular Isométrica', sets: 4, reps: '20s', position: 'parede' },
        { name: 'Y-T-W', sets: 3, reps: '10 cada', load: 'leve' },
        { name: 'Remada Baixa', sets: 4, reps: 12, load: 'moderado' },
        { name: 'Face Pull', sets: 3, reps: 15, load: 'elástico' }
      ]}]},
      { name: 'Fase 3 - Integração (Semanas 9-12)', blocks: [{ type: 'funcional', exercises: [
        { name: 'Chin Tuck Dinâmico', sets: 4, reps: 15, resistance: 'elástico' },
        { name: 'Superman Hold', sets: 3, reps: '30-45s', progressão: 'tempo' },
        { name: 'Prancha Escapular', sets: 3, reps: '30s', focus: 'protração-retração' }
      ]}]}
    ]
  },

  PROTOCOLO_VALGO: {
    id: 'PROTOCOLO_VALGO',
    name: 'Protocolo Valgo Dinâmico',
    duration: '6-10 semanas',
    phases: [
      { name: 'Fase 1 - Ativação Glúteo Médio (Semanas 1-3)', blocks: [{ type: 'ativacao', exercises: [
        { name: 'Clamshell', sets: 3, reps: 15, load: 'elástico leve' },
        { name: 'Abdução de Quadril Lateral', sets: 3, reps: '12/lado', load: 'elástico' },
        { name: 'Ponte com Abdução', sets: 3, reps: 12, load: 'elástico' }
      ]}]},
      { name: 'Fase 2 - Fortalecimento Funcional (Semanas 4-7)', blocks: [{ type: 'fortalecimento', exercises: [
        { name: 'Agachamento com Espelho', sets: 4, reps: 12, feedback: 'visual' },
        { name: 'Step-up Lateral Alto', sets: 3, reps: '10/lado', height: '30cm' },
        { name: 'Lateral Lunge', sets: 3, reps: '12/lado', load: 'progressivo' },
        { name: 'Monster Walk', sets: 3, reps: '15/lado', load: 'elástico forte' }
      ]}]},
      { name: 'Fase 3 - Controle Motor (Semanas 8-10)', blocks: [{ type: 'neuro_controle', exercises: [
        { name: 'Agachamento Unilateral', sets: 3, reps: '8/lado', surface: 'instável' },
        { name: 'Salto com Aterrissagem', sets: 4, reps: 10, focus: 'controle valgo' },
        { name: 'Corrida com Feedback', duration: '10-15min', mirrors: true }
      ]}]}
    ]
  },

  PROTOCOLO_ESCOLIOSE: {
    id: 'PROTOCOLO_ESCOLIOSE',
    name: 'Protocolo Escoliose (Suporte Conservador)',
    duration: '16+ semanas',
    note: 'Requer acompanhamento médico e fisioterápico especializado',
    phases: [
      { name: 'Fase 1 - Respiração Diferencial', blocks: [{ type: 'respiracao', exercises: [
        { name: 'Respiração Direcionada', sets: 5, reps: '8 ciclos', side: 'côncavo' },
        { name: 'Expansão Costal Unilateral', sets: 4, reps: '10 ciclos', tool: 'faixa' }
      ]}]},
      { name: 'Fase 2 - Alongamento Específico', blocks: [{ type: 'alongamento', exercises: [
        { name: 'Alongamento Lado Convexo', sets: 3, reps: '45s', intensity: 'sustentada' },
        { name: 'Rotação Torácica', sets: 3, reps: '10/lado', control: 'lento' }
      ]}]},
      { name: 'Fase 3 - Fortalecimento Assimétrico', blocks: [{ type: 'fortalecimento', exercises: [
        { name: 'Remada Unilateral (Lado Côncavo)', sets: 4, reps: 12, load: 'moderado' },
        { name: 'Prancha Lateral (Lado Convexo)', sets: 3, reps: '30-45s', progressão: 'tempo' }
      ]}]}
    ]
  },

  // ============================================
  // PROTOCOLOS DOS CASOS CLÍNICOS
  // ============================================

  // CASO MARÍLIA: LCA + Joanete
  PROTOCOLO_LCA_JOANETE: {
    id: 'PROTOCOLO_LCA_JOANETE',
    name: 'Protocolo LCA + Joanete — Ancoragem de Pé',
    duration: '16-20 semanas',
    note: 'Requer liberação médica ortopédica para início',
    phases: [
      { name: 'Fase 1 - Ancoragem do Pé (Semanas 1-4)', blocks: [{ type: 'ativacao', exercises: [
        { name: 'Short Foot (Ativação Arco Medial)', sets: 4, reps: '15 contrações', load: 'corporal' },
        { name: 'Toe Yoga (Separação Hallux)', sets: 3, reps: '10 por pé', load: 'corporal' },
        { name: 'Panturrilha Isométrica em Neutro', sets: 3, reps: '20s', load: 'corporal' }
      ]}]},
      { name: 'Fase 2 - Estabilidade Joelho (Semanas 5-10)', blocks: [{ type: 'estabilidade', exercises: [
        { name: 'Isometria Quadríceps 60°', sets: 4, reps: '15s', load: 'corporal' },
        { name: 'Step-Down Controlado (espelho)', sets: 3, reps: '8/lado', load: 'corporal' },
        { name: 'Ponte Unilateral', sets: 3, reps: 12, load: 'elástico' }
      ]}]},
      { name: 'Fase 3 - Integração (Semanas 11-16)', blocks: [{ type: 'fortalecimento', exercises: [
        { name: 'Agachamento com Controle de Valgo', sets: 4, reps: 10, load: 'progressivo' },
        { name: 'Lateral Step-Up', sets: 3, reps: '10/lado', load: 'moderado' },
        { name: 'Caminhar Descalço (propriocepção)', duration: '10min', surface: 'grama' }
      ]}]}
    ]
  },

  // CASO MARIA DE LOURDES: Idoso Frágil
  PROTOCOLO_IDOSO_FRAGIL: {
    id: 'PROTOCOLO_IDOSO_FRAGIL',
    name: 'Protocolo Idoso Frágil — Carga Axial ZERO',
    duration: 'Indefinido (gestão conservadora)',
    note: 'PROIBIDO: Extensão lombar, carga axial, impacto. Monitorar edema e dor.',
    contraindications: ['Carga axial', 'Extensão lombar', 'Impacto', 'Saltos', 'Agachamento profundo'],
    phases: [
      { name: 'Fase 1 - Drenagem + Mobilidade (Contínuo)', blocks: [{ type: 'mobilidade', exercises: [
        { name: 'Drenagem de Extremidades (bombeio tornozelo)', sets: 4, reps: '20 por pé', position: 'elevado' },
        { name: 'Mobilização Segmentar Suave', sets: 3, reps: 8, load: 'nenhuma' },
        { name: 'Respiração Diafragmática', sets: 4, reps: '8 ciclos', position: 'decúbito' }
      ]}]},
      { name: 'Fase 2 - Estabilização Mínima', blocks: [{ type: 'estabilidade', exercises: [
        { name: 'Bird Dog Modificado (apoio)', sets: 2, reps: '6/lado', load: 'nenhuma' },
        { name: 'Ponte Glúteo Parcial', sets: 3, reps: 8, load: 'corporal' },
        { name: 'Sentado para De Pé (com apoio)', sets: 3, reps: 5, load: 'cadeira' }
      ]}]},
      { name: 'Fase 3 - Funcionalidade Diária', blocks: [{ type: 'funcional', exercises: [
        { name: 'Caminhada Supervisionada', duration: '10-15min', intensity: 'leve' },
        { name: 'Equilíbrio com Suporte', sets: 3, reps: '15s', support: 'barra' }
      ]}]}
    ]
  },

  // CASO CLEITON: Interface Solo (Fator Cleiton)
  PROTOCOLO_INTERFACE_SOLO: {
    id: 'PROTOCOLO_INTERFACE_SOLO',
    name: 'Protocolo Interface Solo — Fator Cleiton',
    duration: '4-6 semanas (resposta rápida)',
    note: 'Stiffness > Alongamento Passivo. Remover alongamento relaxante pré-treino.',
    philosophy: 'STIFFNESS_FIRST',
    phases: [
      { name: 'Fase 1 - Correção de Interface', blocks: [{ type: 'correcao', exercises: [
        { name: 'Troca de Calçado: Base Rígida (sola fina/plana)', sets: 0, reps: 'permanente', load: 'N/A' },
        { name: 'Remoção de Alongamento Passivo Pré-Treino', sets: 0, reps: 'permanente', load: 'N/A' },
        { name: 'Short Foot Pré-Treino (substituir alongamento)', sets: 3, reps: 15, load: 'corporal' }
      ]}]},
      { name: 'Fase 2 - Stiffness Articular', blocks: [{ type: 'estabilidade', exercises: [
        { name: 'Isometria de Tornozelo (3 posições)', sets: 3, reps: '15s cada', load: 'corporal' },
        { name: 'Panturrilha Excêntrica Lenta', sets: 4, reps: 8, tempo: '4-0-2-0' },
        { name: 'Ativação Glúteo Pré-Leg Press', sets: 3, reps: 12, load: 'elástico' }
      ]}]},
      { name: 'Fase 3 - Retorno ao Exercício', blocks: [{ type: 'fortalecimento', exercises: [
        { name: 'Leg Press com Base Rígida', sets: 4, reps: 10, load: 'progressivo' },
        { name: 'Agachamento com Calçado Plano', sets: 4, reps: 10, load: 'progressivo' }
      ]}]}
    ]
  },

  // CASO ELISA: Descompressão Lateral
  PROTOCOLO_DESCOMPRESSAO_LATERAL: {
    id: 'PROTOCOLO_DESCOMPRESSAO_LATERAL',
    name: 'Protocolo Descompressão Lateral — Bursite Trocantérica',
    duration: '10-14 semanas',
    note: 'SEM impacto axial direto. Descompressão antes de qualquer carga.',
    contraindications: ['Impacto axial', 'Corrida', 'Saltos laterais'],
    phases: [
      { name: 'Fase 1 - Descompressão (Semanas 1-4)', blocks: [{ type: 'descompressao', exercises: [
        { name: 'Descompressão em Cadeia Fechada (suspensão lateral)', sets: 3, reps: '30s', load: 'gravidade' },
        { name: 'Tração Lateral Suave (faixa)', sets: 3, reps: '20s/lado', tool: 'faixa elástica' },
        { name: 'Mobilização Pélvica Supina', sets: 3, reps: 10, load: 'corporal' }
      ]}]},
      { name: 'Fase 2 - Controle Pélvico (Semanas 5-8)', blocks: [{ type: 'estabilidade', exercises: [
        { name: 'Clam com Controle Pélvico', sets: 3, reps: 15, load: 'elástico leve' },
        { name: 'Side-Lying Hip Abduction (sem dor)', sets: 3, reps: 12, load: 'corporal' },
        { name: 'Dead Bug com Neutro Pélvico', sets: 3, reps: '8/lado', load: 'corporal' }
      ]}]},
      { name: 'Fase 3 - Fortalecimento (Semanas 9-14)', blocks: [{ type: 'fortalecimento', exercises: [
        { name: 'Agachamento Parcial (sem impacto)', sets: 3, reps: 10, load: 'leve' },
        { name: 'Step-Up Frontal Controlado', sets: 3, reps: '8/lado', load: 'moderado' },
        { name: 'Caminhada com Resistência Lateral', sets: 3, reps: '15 passos/lado', load: 'elástico' }
      ]}]}
    ]
  },

  // SWAYBACK (diferenciado de PROTOCOLO_ANTEVERSAO)
  PROTOCOLO_SWAYBACK: {
    id: 'PROTOCOLO_SWAYBACK',
    name: 'Protocolo Swayback — Reposicionamento do Centro de Gravidade',
    duration: '10-14 semanas',
    note: 'NÃO confundir com hiperlordose. Aqui há RETROVERSÃO + retificação lombar.',
    phases: [
      { name: 'Fase 1 - Consciência Postural (Semanas 1-3)', blocks: [{ type: 'ativacao', exercises: [
        { name: 'Consciência do CG contra Parede', sets: 4, reps: '30s', load: 'corporal' },
        { name: 'Respiração 360° com Foco em Expansão Posterior', sets: 3, reps: '8 ciclos' },
        { name: 'Pélvic Clock (consciência pélvica)', sets: 3, reps: '10 cada direção' }
      ]}]},
      { name: 'Fase 2 - Core Profundo (Semanas 4-8)', blocks: [{ type: 'estabilidade', exercises: [
        { name: 'Dead Bug com Expiração Forçada', sets: 3, reps: '8/lado', load: 'corporal' },
        { name: 'Pallof Press Isométrico', sets: 3, reps: '15s', load: 'elástico' },
        { name: 'Half-Kneeling Chop', sets: 3, reps: '10/lado', load: 'elástico' }
      ]}]},
      { name: 'Fase 3 - Integração Funcional (Semanas 9-14)', blocks: [{ type: 'fortalecimento', exercises: [
        { name: 'Agachamento Goblet com Foco CG', sets: 4, reps: 10, load: 'progressivo' },
        { name: 'Hip Hinge com Barra', sets: 3, reps: 10, load: 'moderado' },
        { name: 'Farmer Walk com Postura Corrigida', sets: 3, duration: '40s', load: 'halteres' }
      ]}]}
    ]
  },

  PROTOCOLO_CONDRO: {
    id: 'PROTOCOLO_CONDRO',
    name: 'Protocolo Condromalácia Patelar',
    duration: '12-16 semanas',
    phases: [
      { name: 'Fase 1', blocks: [{ type: 'liberacao', exercises: [
        { name: 'Liberação TFL', sets: 3, reps: '60s/lado' },
        { name: 'Liberação Vasto Lateral', sets: 2, reps: '60s/lado' }
      ]}]},
      { name: 'Fase 2', blocks: [{ type: 'ativacao', exercises: [
        { name: 'VMO Isométrico', sets: 3, reps: '20s' },
        { name: 'Clamshell', sets: 3, reps: 15 }
      ]}]},
      { name: 'Fase 3', blocks: [{ type: 'fortalecimento', exercises: [
        { name: 'Step-Down Controlado', sets: 3, reps: '8/lado' },
        { name: 'Leg Press Parcial (15-60°)', sets: 4, reps: 12 }
      ]}]}
    ]
  },

  // COLAPSO LATERAL (whitepaper 9FIT)
  PROTOCOLO_COLAPSO_LATERAL: {
    id: 'PROTOCOLO_COLAPSO_LATERAL',
    name: 'Protocolo Colapso Lateral — Escoliose Funcional / Perna Curta',
    category: 'coluna',
    duration: '12-16 semanas',
    note: 'Se Teste do Calço não simetrizar (rigidez estrutural), encaminhar para avaliação ortopédica/palmilha antes de progredir carga axial.',
    contraindications: ['Carga axial progressiva antes do diagnóstico diferencial', 'Alongamento passivo unilateral do lado côncavo'],
    phases: [
      { name: 'Fase 1 - Diagnóstico Diferencial', blocks: [{ type: 'avaliacao', exercises: [
        { name: 'Teste do Calço (1-1.5cm sob o lado curto)', sets: 1, reps: 'reavaliar Triângulo de Tales e nivelamento pélvico' }
      ]}]},
      { name: 'Fase 2 - Descompressão e Consciência', blocks: [{ type: 'descompressao', exercises: [
        { name: 'Liberação de Quadrado Lombar (lado curto)', sets: 3, reps: '60s' },
        { name: 'Consciência Postural em Espelho', sets: 3, reps: '60s' }
      ]}]},
      { name: 'Fase 3 - Reativação Assimétrica', blocks: [{ type: 'ativacao', exercises: [
        { name: 'Subida no Banco (só do lado da queda pélvica)', sets: 3, reps: 10 },
        { name: 'Ativação de Glúteo Médio Unilateral', sets: 3, reps: 15 }
      ]}]},
      { name: 'Fase 4 - Reequilíbrio Rotacional', blocks: [{ type: 'mobilidade', exercises: [
        { name: 'Mobilidade Torácica em Rotação (lado bloqueado)', sets: 3, reps: 10 },
        { name: 'Remada Unilateral (lado côncavo)', sets: 4, reps: 12 }
      ]}]}
    ]
  }
};

export default {
  myofascialFoundations,
  evaluationFlags,
  biomechanicalArchetypes,
  diagnosticRules,
  interventionProtocols
};
