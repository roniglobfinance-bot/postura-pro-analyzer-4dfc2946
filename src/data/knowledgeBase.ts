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
    PEP15: { name: 'Escoliose Estrutural', severity: 4, implies: ['LL', 'LE', 'LSP'] }
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
    TES05: { name: 'Rotação Cervical Limitada', severity: 2, implies: ['LBA', 'LE'] }
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
  }
];

// PARTE 4: PROTOCOLOS DE INTERVENÇÃO - Outputs de Correção
export const interventionProtocols = {
  PROTOCOLO_CONDRO: {
    id: 'PROTOCOLO_CONDRO',
    name: 'Protocolo Condromalácia Patelar',
    duration: '12-16 semanas',
    phases: [
      {
        name: 'Fase 1 - Liberação e Alívio (Semanas 1-4)',
        blocks: [
          {
            type: 'liberacao',
            exercises: [
              { name: 'Liberação Miofascial TFL', sets: 3, reps: '60s', tool: 'foam roller' },
              { name: 'Liberação Quadríceps', sets: 3, reps: '60s', tool: 'foam roller' },
              { name: 'Liberação Gastrocnêmio', sets: 2, reps: '45s', tool: 'bola' }
            ]
          },
          {
            type: 'alongamento',
            exercises: [
              { name: 'Alongamento TFL', sets: 3, reps: '30s', intensity: 'leve' },
              { name: 'Alongamento Quadríceps', sets: 3, reps: '30s', intensity: 'leve' }
            ]
          },
          {
            type: 'ativacao',
            exercises: [
              { name: 'Glúteo Médio Isométrico', sets: 3, reps: '20s', load: 'corporal' },
              { name: 'Clamshell', sets: 3, reps: 15, load: 'elástico leve' }
            ]
          }
        ]
      },
      {
        name: 'Fase 2 - Fortalecimento (Semanas 5-10)',
        blocks: [
          {
            type: 'fortalecimento',
            exercises: [
              { name: 'Agachamento com Feedback', sets: 4, reps: 12, load: 'progressivo' },
              { name: 'Step-up Lateral', sets: 3, reps: '10/lado', load: 'halteres' },
              { name: 'Monster Walk', sets: 3, reps: '12/lado', load: 'elástico médio' },
              { name: 'Ponte Unilateral', sets: 3, reps: '12/lado', load: 'progressivo' }
            ]
          }
        ]
      },
      {
        name: 'Fase 3 - Reorganização Funcional (Semanas 11-16)',
        blocks: [
          {
            type: 'funcional',
            exercises: [
              { name: 'Salto Vertical com Controle', sets: 4, reps: 10, load: 'corporal' },
              { name: 'Aterrissagem Unilateral', sets: 3, reps: '8/lado', load: 'progressivo' },
              { name: 'Corrida com Correção', duration: '15-20min', intensity: 'moderada' }
            ]
          }
        ]
      }
    ]
  },
  PROTOCOLO_LOMBALGIA: {
    id: 'PROTOCOLO_LOMBALGIA',
    name: 'Protocolo Lombalgia Crônica',
    duration: '10-14 semanas',
    phases: [
      {
        name: 'Fase 1 - Respiração e Liberação (Semanas 1-3)',
        blocks: [
          {
            type: 'respiracao',
            exercises: [
              { name: 'Respiração Diafragmática', sets: 4, reps: '8 ciclos', position: 'decúbito dorsal' },
              { name: 'Respiração 90/90', sets: 3, reps: '10 ciclos', position: '90/90' }
            ]
          },
          {
            type: 'liberacao',
            exercises: [
              { name: 'Liberação Iliopsoas', sets: 2, reps: '90s/lado', tool: 'bola' },
              { name: 'Liberação QL', sets: 2, reps: '60s/lado', tool: 'foam roller' },
              { name: 'Liberação Paravertebrais', sets: 3, reps: '60s', tool: 'rolo' }
            ]
          }
        ]
      },
      {
        name: 'Fase 2 - Ativação Core (Semanas 4-8)',
        blocks: [
          {
            type: 'ativacao',
            exercises: [
              { name: 'Dead Bug', sets: 3, reps: 12, tempo: 'controlado' },
              { name: 'Bird Dog', sets: 3, reps: '10/lado', tempo: 'pausado' },
              { name: 'Prancha Frontal', sets: 3, reps: '30-45s', progressão: 'tempo' },
              { name: 'Ponte Glúteo', sets: 4, reps: 15, load: 'elástico' }
            ]
          }
        ]
      },
      {
        name: 'Fase 3 - Fortalecimento Integrado (Semanas 9-14)',
        blocks: [
          {
            type: 'fortalecimento',
            exercises: [
              { name: 'Agachamento Goblet', sets: 4, reps: 12, load: 'progressivo' },
              { name: 'Levantamento Terra Romeno', sets: 3, reps: 10, load: 'moderado' },
              { name: 'Farmer Walk', sets: 3, duration: '30-45s', load: 'halteres' }
            ]
          }
        ]
      }
    ]
  },
  PROTOCOLO_CRUZADA_SUP: {
    id: 'PROTOCOLO_CRUZADA_SUP',
    name: 'Protocolo Síndrome Cruzada Superior',
    duration: '8-12 semanas',
    phases: [
      {
        name: 'Fase 1 - Liberação Anterior (Semanas 1-3)',
        blocks: [
          {
            type: 'liberacao',
            exercises: [
              { name: 'Liberação Peitoral Menor', sets: 2, reps: '90s/lado', tool: 'bola' },
              { name: 'Liberação Peitoral Maior', sets: 2, reps: '60s/lado', tool: 'foam roller' },
              { name: 'Liberação Trapézio Superior', sets: 3, reps: '45s/lado', tool: 'mãos' }
            ]
          },
          {
            type: 'alongamento',
            exercises: [
              { name: 'Alongamento Peitoral Porta', sets: 3, reps: '30s/lado', angle: '90°' },
              { name: 'Alongamento Cervical Lateral', sets: 3, reps: '30s/lado', intensity: 'suave' }
            ]
          }
        ]
      },
      {
        name: 'Fase 2 - Ativação Posterior (Semanas 4-8)',
        blocks: [
          {
            type: 'ativacao',
            exercises: [
              { name: 'Retração Escapular Isométrica', sets: 4, reps: '20s', position: 'parede' },
              { name: 'Y-T-W', sets: 3, reps: '10 cada', load: 'leve' },
              { name: 'Remada Baixa', sets: 4, reps: 12, load: 'moderado' },
              { name: 'Face Pull', sets: 3, reps: 15, load: 'elástico' }
            ]
          }
        ]
      },
      {
        name: 'Fase 3 - Integração (Semanas 9-12)',
        blocks: [
          {
            type: 'funcional',
            exercises: [
              { name: 'Chin Tuck Dinâmico', sets: 4, reps: 15, resistance: 'elástico' },
              { name: 'Superman Hold', sets: 3, reps: '30-45s', progressão: 'tempo' },
              { name: 'Prancha Escapular', sets: 3, reps: '30s', focus: 'protração-retração' }
            ]
          }
        ]
      }
    ]
  },
  PROTOCOLO_VALGO: {
    id: 'PROTOCOLO_VALGO',
    name: 'Protocolo Valgo Dinâmico',
    duration: '6-10 semanas',
    phases: [
      {
        name: 'Fase 1 - Ativação Glúteo Médio (Semanas 1-3)',
        blocks: [
          {
            type: 'ativacao',
            exercises: [
              { name: 'Clamshell', sets: 3, reps: 15, load: 'elástico leve' },
              { name: 'Abdução de Quadril Lateral', sets: 3, reps: '12/lado', load: 'elástico' },
              { name: 'Ponte com Abdução', sets: 3, reps: 12, load: 'elástico' }
            ]
          }
        ]
      },
      {
        name: 'Fase 2 - Fortalecimento Funcional (Semanas 4-7)',
        blocks: [
          {
            type: 'fortalecimento',
            exercises: [
              { name: 'Agachamento com Espelho', sets: 4, reps: 12, feedback: 'visual' },
              { name: 'Step-up Lateral Alto', sets: 3, reps: '10/lado', height: '30cm' },
              { name: 'Lateral Lunge', sets: 3, reps: '12/lado', load: 'progressivo' },
              { name: 'Monster Walk', sets: 3, reps: '15/lado', load: 'elástico forte' }
            ]
          }
        ]
      },
      {
        name: 'Fase 3 - Controle Motor (Semanas 8-10)',
        blocks: [
          {
            type: 'neuro_controle',
            exercises: [
              { name: 'Agachamento Unilateral', sets: 3, reps: '8/lado', surface: 'instável' },
              { name: 'Salto com Aterrissagem', sets: 4, reps: 10, focus: 'controle valgo' },
              { name: 'Corrida com Feedback', duration: '10-15min', mirrors: true }
            ]
          }
        ]
      }
    ]
  },
  PROTOCOLO_ESCOLIOSE: {
    id: 'PROTOCOLO_ESCOLIOSE',
    name: 'Protocolo Escoliose (Suporte Conservador)',
    duration: '16+ semanas',
    note: 'Requer acompanhamento médico e fisioterápico especializado',
    phases: [
      {
        name: 'Fase 1 - Respiração Diferencial',
        blocks: [
          {
            type: 'respiracao',
            exercises: [
              { name: 'Respiração Direcionada', sets: 5, reps: '8 ciclos', side: 'côncavo' },
              { name: 'Expansão Costal Unilateral', sets: 4, reps: '10 ciclos', tool: 'faixa' }
            ]
          }
        ]
      },
      {
        name: 'Fase 2 - Alongamento Específico',
        blocks: [
          {
            type: 'alongamento',
            exercises: [
              { name: 'Alongamento Lado Convexo', sets: 3, reps: '45s', intensity: 'sustentada' },
              { name: 'Rotação Torácica', sets: 3, reps: '10/lado', control: 'lento' }
            ]
          }
        ]
      },
      {
        name: 'Fase 3 - Fortalecimento Assimétrico',
        blocks: [
          {
            type: 'fortalecimento',
            exercises: [
              { name: 'Remada Unilateral (Lado Côncavo)', sets: 4, reps: 12, load: 'moderado' },
              { name: 'Prancha Lateral (Lado Convexo)', sets: 3, reps: '30-45s', progressão: 'tempo' }
            ]
          }
        ]
      }
    ]
  }
};

export default {
  myofascialFoundations,
  evaluationFlags,
  diagnosticRules,
  interventionProtocols
};
