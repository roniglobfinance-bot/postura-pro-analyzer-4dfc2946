import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { NINEFIT_CLINICAL_SYSTEM_PROMPT } from "../_shared/clinical-knowledge.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY missing');
    const { exerciseType, frames, romData, studentContext } = await req.json();

    const userPrompt = `ANÁLISE DE MOVIMENTO
Exercício: ${exerciseType}
Frames analisados: ${frames?.length || 0}
ROM: ${JSON.stringify(romData || {})}
Contexto: ${JSON.stringify(studentContext || {})}

Trajetória de ângulos (amostra): ${JSON.stringify((frames || []).slice(0, 8))}

Identifique falhas de execução (valgo dinâmico, shift pélvico, perda de neutralidade lombar, butt wink, knee cave), ROM efetivo, e mapeie para padrão 9FIT se aplicável (especial atenção ao P4 — Falha de Interface).`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: NINEFIT_CLINICAL_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'analyze_movement',
            description: 'Analisa execução de movimento e identifica falhas',
            parameters: {
              type: 'object',
              properties: {
                detected_faults: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      fault: { type: 'string' },
                      severity: { type: 'number' },
                      phase: { type: 'string' },
                      correction: { type: 'string' },
                    },
                    required: ['fault', 'severity', 'phase', 'correction'],
                    additionalProperties: false,
                  },
                },
                rom_assessment: { type: 'string' },
                pattern_match: { type: 'string' },
                ai_summary: { type: 'string' },
                load_recommendation: { type: 'string', enum: ['LOAD', 'SHIELD', 'MIXED'] },
              },
              required: ['detected_faults', 'rom_assessment', 'pattern_match', 'ai_summary', 'load_recommendation'],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'analyze_movement' } },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: 'Rate limit' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (response.status === 402) return new Response(JSON.stringify({ error: 'Créditos insuficientes' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      throw new Error(`AI Gateway ${response.status}`);
    }
    const data = await response.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error('No tool call');
    return new Response(JSON.stringify({ status: 'success', analysis: JSON.parse(args) }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('analyze-movement error', e);
    return new Response(JSON.stringify({ status: 'error', error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
