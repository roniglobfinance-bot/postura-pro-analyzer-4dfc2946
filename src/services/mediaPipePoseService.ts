import { DetectedPose, detectPoseFromImage, detectPosturalDeviations, getAllKeypoints, getClinicalKeypoints } from './poseDetectionService';
import { convertAnalysisToFlags, deduplicateFlags, enrichFlags, AnalysisResult } from './flagConversionService';
import { DiagnosticFlag } from '@/contexts/AssessmentContext';

/**
 * Serviço integrado para processamento completo de pose usando MediaPipe
 */

export interface PoseAnalysisResult {
  pose: DetectedPose | null;
  deviations: {
    deviation: string;
    severity: number;
    measurement: number;
    angle?: number;
  }[];
  flags: DiagnosticFlag[];
  measurements: {
    name: string;
    value: number;
    unit: string;
    deviation?: number;
  }[];
  clinicalSummary: string;
}

/**
 * Analisa pose completa de uma imagem e retorna todas as informações
 */
export async function analyzePoseComplete(
  imageUrl: string,
  viewType: 'anterior' | 'posterior' | 'lateralDireita' | 'lateralEsquerda',
  clientHeight?: number
): Promise<PoseAnalysisResult> {
  try {
    console.log(`Analisando pose completa - Vista: ${viewType}`);
    
    // 1. Detectar pose com MediaPipe
    const pose = await detectPoseFromImage(imageUrl);
    
    if (!pose) {
      return {
        pose: null,
        deviations: [],
        flags: [],
        measurements: [],
        clinicalSummary: 'Não foi possível detectar pose na imagem. Certifique-se de que há uma pessoa visível em posição neutra.'
      };
    }
    
    // 2. Detectar desvios posturais
    const deviations = detectPosturalDeviations(pose.keypoints);
    console.log(`Detectados ${deviations.length} desvios posturais`);
    
    // 3. Converter desvios em flags de diagnóstico
    const analysisResults: AnalysisResult = {
      type: 'deviation',
      findings: deviations.map(d => ({
        name: d.deviation,
        value: d.measurement,
        severity: d.severity,
        reference: viewType,
        angle: d.angle
      }))
    };
    
    let flags = convertAnalysisToFlags(analysisResults);
    flags = deduplicateFlags(flags);
    flags = enrichFlags(flags);
    
    console.log(`Gerados ${flags.length} flags de diagnóstico`);
    
    // 4. Calcular medições clínicas
    const measurements = calculateClinicalMeasurements(pose, viewType, clientHeight);
    
    // 5. Gerar resumo clínico
    const clinicalSummary = generateClinicalSummary(deviations, flags, measurements);
    
    return {
      pose,
      deviations,
      flags,
      measurements,
      clinicalSummary
    };
    
  } catch (error) {
    console.error('Erro na análise completa de pose:', error);
    return {
      pose: null,
      deviations: [],
      flags: [],
      measurements: [],
      clinicalSummary: `Erro na análise: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
}

/**
 * Calcula medições clínicas baseadas nos keypoints detectados
 */
function calculateClinicalMeasurements(
  pose: DetectedPose,
  viewType: string,
  clientHeight?: number
): {
  name: string;
  value: number;
  unit: string;
  deviation?: number;
}[] {
  const measurements: any[] = [];
  const keypoints = pose.keypoints;
  
  // Encontrar pontos relevantes
  const shoulderR = keypoints.find(k => k.name === 'Acrômio D');
  const shoulderL = keypoints.find(k => k.name === 'Acrômio E');
  const hipR = keypoints.find(k => k.name === 'EIAS D');
  const hipL = keypoints.find(k => k.name === 'EIAS E');
  const kneeR = keypoints.find(k => k.name === 'Joelho D');
  const kneeL = keypoints.find(k => k.name === 'Joelho E');
  const ankleR = keypoints.find(k => k.name === 'Tornozelo D');
  const ankleL = keypoints.find(k => k.name === 'Tornozelo E');
  const nose = keypoints.find(k => k.name === 'Nariz');
  const earR = keypoints.find(k => k.name === 'Orelha D');
  const earL = keypoints.find(k => k.name === 'Orelha E');
  
  // Calibração: pixels para cm
  let pixelToCm = 1;
  if (clientHeight && nose && ankleR) {
    const heightInPixels = Math.abs(nose.y - ankleR.y);
    pixelToCm = clientHeight / heightInPixels;
  }
  
  // MEDIÇÕES FRONTAIS/POSTERIORES
  if (viewType === 'anterior' || viewType === 'posterior') {
    // Distância interacromial
    if (shoulderR && shoulderL) {
      const dx = Math.abs(shoulderR.x - shoulderL.x);
      const dy = Math.abs(shoulderR.y - shoulderL.y);
      const distance = Math.sqrt(dx * dx + dy * dy) * pixelToCm;
      
      measurements.push({
        name: 'Distância Interacromial',
        value: parseFloat(distance.toFixed(1)),
        unit: 'cm'
      });
      
      // Desnível de ombros
      const shoulderDiff = Math.abs(shoulderR.y - shoulderL.y) * pixelToCm;
      if (shoulderDiff > 0.5) {
        measurements.push({
          name: 'Desnível de Ombros',
          value: parseFloat(shoulderDiff.toFixed(1)),
          unit: 'cm',
          deviation: shoulderDiff
        });
      }
    }
    
    // Distância entre EIAS
    if (hipR && hipL) {
      const dx = Math.abs(hipR.x - hipL.x);
      const dy = Math.abs(hipR.y - hipL.y);
      const distance = Math.sqrt(dx * dx + dy * dy) * pixelToCm;
      
      measurements.push({
        name: 'Distância entre EIAS',
        value: parseFloat(distance.toFixed(1)),
        unit: 'cm'
      });
      
      // Desnível de quadril
      const hipDiff = Math.abs(hipR.y - hipL.y) * pixelToCm;
      if (hipDiff > 0.5) {
        measurements.push({
          name: 'Desnível de Quadril',
          value: parseFloat(hipDiff.toFixed(1)),
          unit: 'cm',
          deviation: hipDiff
        });
      }
    }
    
    // Distância intercondilar (joelhos)
    if (kneeR && kneeL) {
      const distance = Math.abs(kneeR.x - kneeL.x) * pixelToCm;
      measurements.push({
        name: 'Distância Intercondilar',
        value: parseFloat(distance.toFixed(1)),
        unit: 'cm'
      });
    }
  }
  
  // MEDIÇÕES LATERAIS
  if (viewType === 'lateralDireita' || viewType === 'lateralEsquerda') {
    const ear = viewType === 'lateralDireita' ? earR : earL;
    const shoulder = viewType === 'lateralDireita' ? shoulderR : shoulderL;
    const hip = viewType === 'lateralDireita' ? hipR : hipL;
    const knee = viewType === 'lateralDireita' ? kneeR : kneeL;
    const ankle = viewType === 'lateralDireita' ? ankleR : ankleL;
    
    // Anteriorização de cabeça
    if (ear && shoulder) {
      const anteriorization = Math.abs(shoulder.x - ear.x) * pixelToCm;
      if (anteriorization > 1) {
        measurements.push({
          name: 'Anteriorização de Cabeça',
          value: parseFloat(anteriorization.toFixed(1)),
          unit: 'cm',
          deviation: anteriorization
        });
      }
    }
    
    // Ângulo craniocervical
    if (ear && shoulder && nose) {
      const angle = calculateAngle(
        { x: nose.x, y: nose.y },
        { x: ear.x, y: ear.y },
        { x: shoulder.x, y: shoulder.y }
      );
      
      measurements.push({
        name: 'Ângulo Craniocervical',
        value: parseFloat(angle.toFixed(1)),
        unit: '°',
        deviation: angle < 45 || angle > 55 ? Math.abs(angle - 50) : 0
      });
    }
    
    // Alinhamento vertical (prumo)
    if (ear && shoulder && hip && ankle) {
      const earX = ear.x;
      const shoulderX = shoulder.x;
      const hipX = hip.x;
      const ankleX = ankle.x;
      
      const avgDeviation = (
        Math.abs(earX - ankleX) +
        Math.abs(shoulderX - ankleX) +
        Math.abs(hipX - ankleX)
      ) / 3 * pixelToCm;
      
      if (avgDeviation > 1) {
        measurements.push({
          name: 'Desvio do Prumo Vertical',
          value: parseFloat(avgDeviation.toFixed(1)),
          unit: 'cm',
          deviation: avgDeviation
        });
      }
    }
  }
  
  return measurements;
}

function calculateAngle(p1: { x: number; y: number }, p2: { x: number; y: number }, p3: { x: number; y: number }): number {
  const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let angle = Math.abs(radians * 180 / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

/**
 * Gera resumo clínico dos achados
 */
function generateClinicalSummary(
  deviations: any[],
  flags: DiagnosticFlag[],
  measurements: any[]
): string {
  if (deviations.length === 0) {
    return 'Análise postural concluída. Nenhum desvio significativo detectado. Postura dentro dos padrões de normalidade.';
  }
  
  const severityCount = {
    leve: flags.filter(f => f.severity === 1).length,
    moderado: flags.filter(f => f.severity === 2).length,
    severo: flags.filter(f => f.severity === 3).length
  };
  
  let summary = `Análise postural concluída com ${deviations.length} desvio(s) detectado(s).\n\n`;
  
  if (severityCount.severo > 0) {
    summary += `⚠️ ATENÇÃO: ${severityCount.severo} desvio(s) severo(s) identificado(s).\n`;
  }
  if (severityCount.moderado > 0) {
    summary += `⚡ ${severityCount.moderado} desvio(s) moderado(s) identificado(s).\n`;
  }
  if (severityCount.leve > 0) {
    summary += `ℹ️ ${severityCount.leve} desvio(s) leve(s) identificado(s).\n`;
  }
  
  summary += `\n📊 Total de ${measurements.length} medição(ões) realizada(s).\n`;
  summary += `\n🎯 ${flags.length} flag(s) de diagnóstico gerado(s) automaticamente.\n`;
  summary += `\nRecomenda-se processar o diagnóstico completo para obter protocolo de correção específico.`;
  
  return summary;
}

/**
 * Extrai skeleton data para visualização 3D
 */
export function extractSkeletonForVisualization(pose: DetectedPose) {
  if (!pose || !pose.keypoints) return null;
  
  // Retornar todos os 33 keypoints com coordenadas 3D
  return {
    keypoints: pose.keypoints.map(kp => ({
      name: kp.name,
      position: {
        x: kp.x,
        y: kp.y,
        z: kp.z
      },
      confidence: kp.confidence
    })),
    worldLandmarks: pose.worldLandmarks || []
  };
}
