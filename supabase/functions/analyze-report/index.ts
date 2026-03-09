import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { findings, metrics, clusters, clientData, context, pain } = await req.json();

    console.log('Received report analysis request');

    const systemPrompt = `Você é um especialista em biomecânica postural e análise clínica do sistema 9FIT PPA (Postura Pro Analyzer).

Sua tarefa é analisar os dados de uma avaliação postural completa e gerar um relatório final integrado com:
1. Diagnóstico macro consolidado
2. Classificação de risco por região
3. Correlação entre achados e linhas miofasciais
4. Recomendação de modo operacional (LOAD/SHIELD/MIXED)
5. Protocolo de recuperação personalizado em 3 fases
6. Alertas de segurança (guardrails)

Use nomenclatura técnica 9FIT: IEP (Índice de Estabilidade Podal), EA (Espaço Articular), PTS (Potência de Transferência Segmentar), TNS (Tremor Neuromuscular Sistêmico).`;

    const userPrompt = `Analise os seguintes dados da avaliação postural e gere o relatório final:

CONTEXTO DO PACIENTE:
${JSON.stringify(clientData || {}, null, 2)}

CONTEXTO DA AVALIAÇÃO:
- Calçado: ${context?.footwear || 'Não informado'}
- Superfície: ${context?.surface || 'Não informada'}
- Objetivo: ${context?.objective || 'Não informado'}
- Ambiente: ${context?.environment || 'Não informado'}

DOR REPORTADA:
- Região: ${pain?.region || 'Nenhuma'}
- Intensidade: ${pain?.intensity || 0}/10
- Gatilhos: ${pain?.triggers || 'Nenhum'}

ACHADOS (FINDINGS):
${JSON.stringify(findings || [], null, 2)}

MÉTRICAS:
${JSON.stringify(metrics || [], null, 2)}

CLUSTERS:
${JSON.stringify(clusters || [], null, 2)}

Gere o relatório final completo.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_postural_report',
              description: 'Gera um relatório final de análise postural estruturado',
              parameters: {
                type: 'object',
                properties: {
                  macro_diagnosis: {
                    type: 'string',
                    description: 'Diagnóstico macro consolidado do padrão postural'
                  },
                  postural_archetype: {
                    type: 'string',
                    enum: ['Swayback', 'FlatBack', 'KyphoLordotic', 'Normal', 'Mixed'],
                    description: 'Arquétipo postural dominante'
                  },
                  confidence_score: {
                    type: 'number',
                    description: 'Score de confiança geral da análise (0-1)'
                  },
                  risk_assessment: {
                    type: 'object',
                    properties: {
                      lumbar_risk: { type: 'number', description: 'Risco lombar 0-100' },
                      cervical_risk: { type: 'number', description: 'Risco cervical 0-100' },
                      base_risk: { type: 'number', description: 'Risco de base/podal 0-100' },
                      overall_score: { type: 'number', description: 'Score geral 0-100' }
                    },
                    required: ['lumbar_risk', 'cervical_risk', 'base_risk', 'overall_score'],
                    additionalProperties: false
                  },
                  hud_metrics: {
                    type: 'object',
                    properties: {
                      iep: { type: 'number', description: 'Índice de Estabilidade Podal 0-100' },
                      ea: { type: 'number', description: 'Espaço Articular 0-100' },
                      pts: { type: 'number', description: 'Potência Transferência Segmentar 0-100' },
                      tns: { type: 'number', description: 'Tremor Neuromuscular Sistêmico 0-100' }
                    },
                    required: ['iep', 'ea', 'pts', 'tns'],
                    additionalProperties: false
                  },
                  operational_mode: {
                    type: 'string',
                    enum: ['LOAD', 'SHIELD', 'MIXED'],
                    description: 'Modo operacional recomendado'
                  },
                  operational_justification: {
                    type: 'string',
                    description: 'Justificativa para o modo operacional escolhido'
                  },
                  tension_zones: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        x: { type: 'number', description: 'Posição X percentual 0-100' },
                        y: { type: 'number', description: 'Posição Y percentual 0-100' },
                        intensity: { type: 'number', description: 'Intensidade 0-100' },
                        myofascial_line: { type: 'string' }
                      },
                      required: ['name', 'x', 'y', 'intensity', 'myofascial_line'],
                      additionalProperties: false
                    }
                  },
                  findings_analysis: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        key: { type: 'string' },
                        direction: { type: 'string', enum: ['anterior', 'posterior', 'medial', 'lateral'] },
                        severity: { type: 'number', description: '0-3' },
                        confidence: { type: 'number', description: '0-1' },
                        clinical_note: { type: 'string' }
                      },
                      required: ['key', 'direction', 'severity', 'confidence', 'clinical_note'],
                      additionalProperties: false
                    }
                  },
                  guardrails: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        code: { type: 'string', enum: ['SHOE_INSTABILITY_CHECK', 'DECOMPRESSION_LOGIC', 'STABILITY_SHIELD', 'NEUROMUSCULAR_WAKEUP', 'PAIN_SPIKE_RISK'] },
                        triggered: { type: 'boolean' },
                        message: { type: 'string' }
                      },
                      required: ['code', 'triggered', 'message'],
                      additionalProperties: false
                    }
                  },
                  recovery_protocol: {
                    type: 'object',
                    properties: {
                      phase_1_release: {
                        type: 'array',
                        items: { type: 'string' }
                      },
                      phase_2_activation: {
                        type: 'array',
                        items: { type: 'string' }
                      },
                      phase_3_integration: {
                        type: 'array',
                        items: { type: 'string' }
                      }
                    },
                    required: ['phase_1_release', 'phase_2_activation', 'phase_3_integration'],
                    additionalProperties: false
                  },
                  clinical_summary: {
                    type: 'string',
                    description: 'Resumo clínico narrativo para o relatório final'
                  }
                },
                required: [
                  'macro_diagnosis', 'postural_archetype', 'confidence_score',
                  'risk_assessment', 'hud_metrics', 'operational_mode',
                  'operational_justification', 'tension_zones', 'findings_analysis',
                  'guardrails', 'recovery_protocol', 'clinical_summary'
                ],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_postural_report' } },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit excedido. Tente novamente em alguns segundos.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos em Settings → Workspace → Usage.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI response received');

    // Extract tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'generate_postural_report') {
      throw new Error('Unexpected AI response format');
    }

    const report = JSON.parse(toolCall.function.arguments);
    console.log('Report generated:', report.macro_diagnosis);

    return new Response(JSON.stringify({ status: 'success', report }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in analyze-report:', error);
    return new Response(
      JSON.stringify({ status: 'error', error: error.message || 'Erro desconhecido' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
