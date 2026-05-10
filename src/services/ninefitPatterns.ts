// Detector dos 5 Padrões Clínicos 9FIT no client-side.
// Recebe findings/metrics/contexto e devolve padrões disparados com conduta.

export type NineFitPatternKey =
  | 'P1_PELVIC_4MM'
  | 'P2_PSOAS_BRAKE'
  | 'P3_POSTERIOR_CONFLICT'
  | 'P4_INTERFACE_FAILURE'
  | 'P5_NM_TRIAD';

export interface NineFitPattern {
  key: NineFitPatternKey;
  name: string;
  diagnosis: string;
  protocol: string;
  severity: 'low' | 'medium' | 'high';
  triggers: string[];
}

interface DetectInput {
  findings?: Array<{ key: string; severity?: number; direction?: string }>;
  metrics?: Array<{ key: string; value: number }>;
  context?: { footwear?: string; surface?: string };
  pain?: { region?: string; intensity?: number; triggers?: string };
  history?: { lumbar?: boolean; pain24hSpike?: boolean };
}

const has = (arr: any[] | undefined, predicate: (x: any) => boolean) =>
  Array.isArray(arr) && arr.some(predicate);

export function detectNineFitPatterns(input: DetectInput): NineFitPattern[] {
  const patterns: NineFitPattern[] = [];
  const { findings = [], metrics = [], context = {}, pain = {}, history = {} } = input;

  const pelvicImbalance = metrics.find(m => /pelvic_imbalance|pelvic_tilt/i.test(m.key))?.value ?? 0;
  const unilateralFootPain = /pé|joelho|hálux|tornozelo/i.test(pain.region || '') && (pain.intensity || 0) > 0;

  // P1 — Lei dos 0.4cm
  if (Math.abs(pelvicImbalance) >= 0.4 && unilateralFootPain) {
    patterns.push({
      key: 'P1_PELVIC_4MM',
      name: 'Lei dos 0.4cm — Cascata Ascendente',
      diagnosis: `Desnível pélvico de ${pelvicImbalance.toFixed(1)}cm sobrecarrega cadeia distal contralateral.`,
      protocol: 'Bloco A reforçado: Short Foot bilateral assimétrico + correção de empilhamento pélvico.',
      severity: Math.abs(pelvicImbalance) > 1 ? 'high' : 'medium',
      triggers: [`pelvic_imbalance=${pelvicImbalance.toFixed(1)}cm`, `pain_region=${pain.region}`],
    });
  }

  // P2 — Bloqueio Neural Marcha
  const gaitBlock = has(findings, f => /gait_block|marcha.bloco|short_step/i.test(f.key));
  if (gaitBlock && history.lumbar) {
    patterns.push({
      key: 'P2_PSOAS_BRAKE',
      name: 'Bloqueio Neural de Marcha (Efeito Psoas)',
      diagnosis: 'Psoas atua como freio neural protetivo em coluna instável.',
      protocol: 'Dissociação segmentar (anca move com lombar neutra blindada) + IAP/Bracing.',
      severity: 'medium',
      triggers: ['gait_block', 'lumbar_history'],
    });
  }

  // P3 — Conflito Posterior
  const lumbarPain = /lombar|coluna/i.test(pain.region || '') && (pain.intensity || 0) >= 2;
  const extensionIntol = has(findings, f => /extension_intolerance|baastrup|retrolistese|facet/i.test(f.key));
  if (lumbarPain && extensionIntol) {
    patterns.push({
      key: 'P3_POSTERIOR_CONFLICT',
      name: 'Conflito Posterior (Síndrome de Esmagamento)',
      diagnosis: 'Contato ósseo posterior por redução do espaço (Baastrup/retrolistese/artrose facetária).',
      protocol: 'VETO ABSOLUTO de extensão. Flexão tática + Bracing como macaco hidráulico.',
      severity: 'high',
      triggers: ['lumbar_pain', 'extension_intolerance'],
    });
  }

  // P4 — Falha de Interface
  const dynamicValgus = has(findings, f => /valgo_dinamico|dynamic_valgus|knee_valgus/i.test(f.key));
  const unstableFootwear = /tênis|tenis|amortecim|running|corrida/i.test(context.footwear || '');
  if (dynamicValgus && unstableFootwear) {
    patterns.push({
      key: 'P4_INTERFACE_FAILURE',
      name: 'Falha de Interface (Ilusão do Calçado)',
      diagnosis: 'Calçado de amortecimento instável força valgo dinâmico — ambiente externo, não fraqueza.',
      protocol: 'Trocar para solado rígido. Stiffness, NUNCA alongamento passivo pré-treino.',
      severity: 'medium',
      triggers: [`footwear=${context.footwear}`, 'dynamic_valgus'],
    });
  }

  // P5 — Tríade Neuro-Metabólica
  const nmEdema = has(findings, f => /nm_edema|edema/i.test(f.key));
  const nmTingling = has(findings, f => /nm_tingling|formig|parestes/i.test(f.key));
  if ((nmEdema || nmTingling) && history.pain24hSpike) {
    patterns.push({
      key: 'P5_NM_TRIAD',
      name: 'Tríade Neuro-Metabólica',
      diagnosis: 'Nervo sob dupla pressão: estenose óssea + edema fluídico. Inflamação sistêmica amplifica dor.',
      protocol: 'SHIELD obrigatório + drenagem postural + protocolo desinflamação 48h. Treino dinâmico CONTRAINDICADO.',
      severity: 'high',
      triggers: ['nm_signals', 'pain_spike_24h'],
    });
  }

  return patterns;
}
