/**
 * SERVIÇO DE ANÁLISE DE SIMETRIA BILATERAL
 * Compara lados direito/esquerdo do corpo com visualização de desvios percentuais
 */

import { DetectedPose } from './poseDetectionService';

export interface SymmetryAnalysis {
  overallSymmetryScore: number; // 0-100, onde 100 = perfeitamente simétrico
  viewType: string;
  bilateral: {
    shoulders: {
      symmetryPercentage: number;
      deviation: number;
      deviationCm: number;
      side: 'left' | 'right' | 'balanced';
    };
    hips: {
      symmetryPercentage: number;
      deviation: number;
      deviationCm: number;
      side: 'left' | 'right' | 'balanced';
    };
    knees: {
      symmetryPercentage: number;
      deviation: number;
      deviationCm: number;
      side: 'left' | 'right' | 'balanced';
    };
    ankles: {
      symmetryPercentage: number;
      deviation: number;
      deviationCm: number;
      side: 'left' | 'right' | 'balanced';
    };
  };
  heatmapData: {
    region: string;
    asymmetryLevel: number; // 0-1, onde 0 = simétrico, 1 = muito assimétrico
    color: string; // Cor do mapa de calor
    x: number;
    y: number;
  }[];
  recommendations: string[];
}

/**
 * Analisa simetria bilateral de uma pose detectada
 */
export function analyzeSymmetry(
  pose: DetectedPose,
  viewType: 'anterior' | 'posterior' | 'lateralDireita' | 'lateralEsquerda',
  clientHeight?: number
): SymmetryAnalysis {
  
  const keypoints = pose.keypoints;
  
  // Calibração pixels -> cm
  let pixelToCm = 1;
  const nose = keypoints.find(k => k.name === 'Nariz');
  const ankleR = keypoints.find(k => k.name === 'Tornozelo D');
  if (clientHeight && nose && ankleR) {
    const heightInPixels = Math.abs(nose.y - ankleR.y);
    pixelToCm = clientHeight / heightInPixels;
  }
  
  // Apenas analisar simetria bilateral em vistas anterior/posterior
  if (viewType === 'lateralDireita' || viewType === 'lateralEsquerda') {
    return {
      overallSymmetryScore: 100,
      viewType,
      bilateral: {
        shoulders: { symmetryPercentage: 100, deviation: 0, deviationCm: 0, side: 'balanced' },
        hips: { symmetryPercentage: 100, deviation: 0, deviationCm: 0, side: 'balanced' },
        knees: { symmetryPercentage: 100, deviation: 0, deviationCm: 0, side: 'balanced' },
        ankles: { symmetryPercentage: 100, deviation: 0, deviationCm: 0, side: 'balanced' }
      },
      heatmapData: [],
      recommendations: ['Análise de simetria não aplicável em vistas laterais']
    };
  }
  
  // Pontos bilaterais
  const shoulderR = keypoints.find(k => k.name === 'Acrômio D');
  const shoulderL = keypoints.find(k => k.name === 'Acrômio E');
  const hipR = keypoints.find(k => k.name === 'EIAS D');
  const hipL = keypoints.find(k => k.name === 'EIAS E');
  const kneeR = keypoints.find(k => k.name === 'Joelho D');
  const kneeL = keypoints.find(k => k.name === 'Joelho E');
  const ankleRPoint = keypoints.find(k => k.name === 'Tornozelo D');
  const ankleL = keypoints.find(k => k.name === 'Tornozelo E');
  
  // Análise de ombros
  const shoulderAnalysis = analyzeBilateralPair(
    shoulderR, shoulderL, 'shoulders', pixelToCm
  );
  
  // Análise de quadril
  const hipAnalysis = analyzeBilateralPair(
    hipR, hipL, 'hips', pixelToCm
  );
  
  // Análise de joelhos
  const kneeAnalysis = analyzeBilateralPair(
    kneeR, kneeL, 'knees', pixelToCm
  );
  
  // Análise de tornozelos
  const ankleAnalysis = analyzeBilateralPair(
    ankleRPoint, ankleL, 'ankles', pixelToCm
  );
  
  // Calcular score geral de simetria
  const scores = [
    shoulderAnalysis.symmetryPercentage,
    hipAnalysis.symmetryPercentage,
    kneeAnalysis.symmetryPercentage,
    ankleAnalysis.symmetryPercentage
  ];
  const overallSymmetryScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  // Gerar dados de mapa de calor
  const heatmapData = generateHeatmapData(
    { shoulderR, shoulderL, hipR, hipL, kneeR, kneeL, ankleR: ankleRPoint, ankleL },
    { shoulderAnalysis, hipAnalysis, kneeAnalysis, ankleAnalysis }
  );
  
  // Gerar recomendações
  const recommendations = generateSymmetryRecommendations(
    { shoulderAnalysis, hipAnalysis, kneeAnalysis, ankleAnalysis }
  );
  
  return {
    overallSymmetryScore: Math.round(overallSymmetryScore),
    viewType,
    bilateral: {
      shoulders: shoulderAnalysis,
      hips: hipAnalysis,
      knees: kneeAnalysis,
      ankles: ankleAnalysis
    },
    heatmapData,
    recommendations
  };
}

/**
 * Analisa um par bilateral de pontos
 */
function analyzeBilateralPair(
  pointR: any,
  pointL: any,
  region: string,
  pixelToCm: number
): {
  symmetryPercentage: number;
  deviation: number;
  deviationCm: number;
  side: 'left' | 'right' | 'balanced';
} {
  if (!pointR || !pointL) {
    return {
      symmetryPercentage: 100,
      deviation: 0,
      deviationCm: 0,
      side: 'balanced'
    };
  }
  
  // Calcular desnível vertical (altura Y)
  const yDiff = Math.abs(pointR.y - pointL.y);
  const deviationCm = yDiff * pixelToCm;
  
  // Calcular simetria como porcentagem
  // Considerando que 2cm = 0% de simetria, 0cm = 100% de simetria
  const maxDeviation = 2.0; // cm
  const symmetryPercentage = Math.max(0, 100 - (deviationCm / maxDeviation) * 100);
  
  // Determinar lado mais alto
  const side = pointR.y < pointL.y ? 'right' : (pointR.y > pointL.y ? 'left' : 'balanced');
  
  return {
    symmetryPercentage: Math.round(symmetryPercentage),
    deviation: yDiff,
    deviationCm: parseFloat(deviationCm.toFixed(2)),
    side
  };
}

/**
 * Gera dados de mapa de calor para visualização
 */
function generateHeatmapData(
  points: any,
  analyses: any
): {
  region: string;
  asymmetryLevel: number;
  color: string;
  x: number;
  y: number;
}[] {
  const heatmap: any[] = [];
  
  // Ombro direito
  if (points.shoulderR) {
    const asymmetry = 1 - (analyses.shoulderAnalysis.symmetryPercentage / 100);
    heatmap.push({
      region: 'Ombro Direito',
      asymmetryLevel: asymmetry,
      color: getHeatmapColor(asymmetry),
      x: points.shoulderR.x,
      y: points.shoulderR.y
    });
  }
  
  // Ombro esquerdo
  if (points.shoulderL) {
    const asymmetry = 1 - (analyses.shoulderAnalysis.symmetryPercentage / 100);
    heatmap.push({
      region: 'Ombro Esquerdo',
      asymmetryLevel: asymmetry,
      color: getHeatmapColor(asymmetry),
      x: points.shoulderL.x,
      y: points.shoulderL.y
    });
  }
  
  // Quadril direito
  if (points.hipR) {
    const asymmetry = 1 - (analyses.hipAnalysis.symmetryPercentage / 100);
    heatmap.push({
      region: 'Quadril Direito',
      asymmetryLevel: asymmetry,
      color: getHeatmapColor(asymmetry),
      x: points.hipR.x,
      y: points.hipR.y
    });
  }
  
  // Quadril esquerdo
  if (points.hipL) {
    const asymmetry = 1 - (analyses.hipAnalysis.symmetryPercentage / 100);
    heatmap.push({
      region: 'Quadril Esquerdo',
      asymmetryLevel: asymmetry,
      color: getHeatmapColor(asymmetry),
      x: points.hipL.x,
      y: points.hipL.y
    });
  }
  
  // Joelho direito
  if (points.kneeR) {
    const asymmetry = 1 - (analyses.kneeAnalysis.symmetryPercentage / 100);
    heatmap.push({
      region: 'Joelho Direito',
      asymmetryLevel: asymmetry,
      color: getHeatmapColor(asymmetry),
      x: points.kneeR.x,
      y: points.kneeR.y
    });
  }
  
  // Joelho esquerdo
  if (points.kneeL) {
    const asymmetry = 1 - (analyses.kneeAnalysis.symmetryPercentage / 100);
    heatmap.push({
      region: 'Joelho Esquerdo',
      asymmetryLevel: asymmetry,
      color: getHeatmapColor(asymmetry),
      x: points.kneeL.x,
      y: points.kneeL.y
    });
  }
  
  return heatmap;
}

/**
 * Retorna cor do mapa de calor baseada no nível de assimetria
 */
function getHeatmapColor(asymmetryLevel: number): string {
  if (asymmetryLevel < 0.1) return '#22c55e'; // Verde - Simétrico
  if (asymmetryLevel < 0.3) return '#eab308'; // Amarelo - Leve assimetria
  if (asymmetryLevel < 0.5) return '#f97316'; // Laranja - Moderada assimetria
  return '#ef4444'; // Vermelho - Alta assimetria
}

/**
 * Gera recomendações baseadas na análise de simetria
 */
function generateSymmetryRecommendations(analyses: any): string[] {
  const recommendations: string[] = [];
  
  const { shoulderAnalysis, hipAnalysis, kneeAnalysis, ankleAnalysis } = analyses;
  
  // Ombros
  if (shoulderAnalysis.symmetryPercentage < 90) {
    const sideText = shoulderAnalysis.side === 'right' ? 'direito elevado' : 'esquerdo elevado';
    recommendations.push(
      `Assimetria de ombros detectada (${sideText}). Desnível de ${shoulderAnalysis.deviationCm}cm. Investigar Linha Lateral e padrão de elevação escapular.`
    );
  }
  
  // Quadril
  if (hipAnalysis.symmetryPercentage < 90) {
    const sideText = hipAnalysis.side === 'right' ? 'direito elevado' : 'esquerdo elevado';
    recommendations.push(
      `Desnível pélvico identificado (${sideText}). Desnível de ${hipAnalysis.deviationCm}cm. Avaliar fraqueza de glúteo médio contralateral e Trendelenburg.`
    );
  }
  
  // Joelhos
  if (kneeAnalysis.symmetryPercentage < 85) {
    recommendations.push(
      `Assimetria de joelhos detectada. Desnível de ${kneeAnalysis.deviationCm}cm. Investigar discrepância de membros ou compensação funcional.`
    );
  }
  
  // Tornozelos
  if (ankleAnalysis.symmetryPercentage < 85) {
    recommendations.push(
      `Assimetria de tornozelos identificada. Desnível de ${ankleAnalysis.deviationCm}cm. Avaliar arco plantar e pronação/supinação bilateral.`
    );
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Simetria bilateral dentro dos padrões de normalidade (>90% em todas as regiões).');
  }
  
  return recommendations;
}

/**
 * Compara simetria entre múltiplas vistas (anterior vs posterior)
 */
export function compareMultipleViews(
  anteriorAnalysis: SymmetryAnalysis,
  posteriorAnalysis: SymmetryAnalysis
): {
  consistency: number; // 0-100, consistência entre vistas
  discrepancies: string[];
} {
  const discrepancies: string[] = [];
  
  // Comparar ombros
  const shoulderDiff = Math.abs(
    anteriorAnalysis.bilateral.shoulders.deviationCm -
    posteriorAnalysis.bilateral.shoulders.deviationCm
  );
  
  if (shoulderDiff > 0.5) {
    discrepancies.push(
      `Discrepância de ombros entre vistas: ${shoulderDiff.toFixed(2)}cm. Possível rotação escapular.`
    );
  }
  
  // Comparar quadril
  const hipDiff = Math.abs(
    anteriorAnalysis.bilateral.hips.deviationCm -
    posteriorAnalysis.bilateral.hips.deviationCm
  );
  
  if (hipDiff > 0.5) {
    discrepancies.push(
      `Discrepância de quadril entre vistas: ${hipDiff.toFixed(2)}cm. Possível rotação pélvica.`
    );
  }
  
  // Calcular score de consistência
  const consistency = discrepancies.length === 0 ? 100 : Math.max(0, 100 - (discrepancies.length * 20));
  
  return {
    consistency,
    discrepancies
  };
}
