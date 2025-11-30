/**
 * SERVIÇO DE VALIDAÇÃO DE VISTA DE FOTO
 * Identifica automaticamente qual vista a foto representa e valida se está correta
 */

import { DetectedPose } from './poseDetectionService';

export interface ViewValidation {
  detectedView: 'anterior' | 'posterior' | 'lateralDireita' | 'lateralEsquerda' | 'unknown';
  confidence: number; // 0-100
  isCorrect: boolean;
  expectedView: string;
  errorMessage?: string;
  recommendations: string[];
}

/**
 * Valida se a foto está na vista correta
 */
export function validatePhotoView(
  pose: DetectedPose,
  expectedView: 'anterior' | 'posterior' | 'lateralDireita' | 'lateralEsquerda'
): ViewValidation {
  
  const detectedView = detectViewFromPose(pose);
  const isCorrect = detectedView === expectedView;
  
  const validation: ViewValidation = {
    detectedView,
    confidence: calculateViewConfidence(pose, detectedView),
    isCorrect,
    expectedView,
    recommendations: []
  };
  
  if (!isCorrect) {
    validation.errorMessage = `Foto esperada: ${getViewLabel(expectedView)}, mas detectada: ${getViewLabel(detectedView)}`;
    validation.recommendations = generateViewRecommendations(expectedView, detectedView);
  } else {
    validation.recommendations = ['Foto na vista correta. Prossiga com a análise.'];
  }
  
  return validation;
}

/**
 * Detecta automaticamente qual vista a foto representa baseado na pose
 */
function detectViewFromPose(
  pose: DetectedPose
): 'anterior' | 'posterior' | 'lateralDireita' | 'lateralEsquerda' | 'unknown' {
  
  const keypoints = pose.keypoints;
  
  // Pontos de referência
  const nose = keypoints.find(k => k.name === 'Nariz');
  const leftEye = keypoints.find(k => k.name === 'Olho E');
  const rightEye = keypoints.find(k => k.name === 'Olho D');
  const leftEar = keypoints.find(k => k.name === 'Orelha E');
  const rightEar = keypoints.find(k => k.name === 'Orelha D');
  const leftShoulder = keypoints.find(k => k.name === 'Acrômio E');
  const rightShoulder = keypoints.find(k => k.name === 'Acrômio D');
  const leftHip = keypoints.find(k => k.name === 'EIAS E');
  const rightHip = keypoints.find(k => k.name === 'EIAS D');
  
  // Contar visibilidade de pontos faciais vs corporais
  const facePointsVisible = [nose, leftEye, rightEye].filter(p => p && p.confidence > 0.5).length;
  const earPointsVisible = [leftEar, rightEar].filter(p => p && p.confidence > 0.5).length;
  const shouldersVisible = [leftShoulder, rightShoulder].filter(p => p && p.confidence > 0.5).length;
  
  // VISTA ANTERIOR: Nariz + ambos os olhos visíveis, orelhas menos visíveis
  if (facePointsVisible >= 2 && earPointsVisible < 2 && shouldersVisible === 2) {
    // Verificar se ombros estão simetricamente distribuídos (não lateral)
    if (leftShoulder && rightShoulder) {
      const shoulderDiff = Math.abs(leftShoulder.x - rightShoulder.x);
      if (shoulderDiff > 50) { // Ombros separados = vista frontal
        return 'anterior';
      }
    }
  }
  
  // VISTA POSTERIOR: Orelhas mais visíveis que face, ombros visíveis
  if (earPointsVisible >= 1 && facePointsVisible < 2 && shouldersVisible === 2) {
    return 'posterior';
  }
  
  // VISTA LATERAL: Um ombro predominante, profundidade Z diferente
  if (leftShoulder && rightShoulder) {
    const zDiff = Math.abs(leftShoulder.z - rightShoulder.z);
    
    // Se há diferença significativa de profundidade, é lateral
    if (zDiff > 0.1) {
      // Determinar qual lado está mais visível
      if (leftShoulder.confidence > rightShoulder.confidence) {
        return 'lateralEsquerda';
      } else {
        return 'lateralDireita';
      }
    }
  }
  
  // Heurística adicional: apenas um olho/orelha visível = lateral
  if ((leftEye && leftEye.confidence > 0.5 && (!rightEye || rightEye.confidence < 0.3)) ||
      (leftEar && leftEar.confidence > 0.5 && (!rightEar || rightEar.confidence < 0.3))) {
    return 'lateralEsquerda';
  }
  
  if ((rightEye && rightEye.confidence > 0.5 && (!leftEye || leftEye.confidence < 0.3)) ||
      (rightEar && rightEar.confidence > 0.5 && (!leftEar || leftEar.confidence < 0.3))) {
    return 'lateralDireita';
  }
  
  return 'unknown';
}

/**
 * Calcula confiança da detecção de vista
 */
function calculateViewConfidence(
  pose: DetectedPose,
  detectedView: string
): number {
  
  const keypoints = pose.keypoints;
  const relevantPoints = keypoints.filter(kp => kp.confidence > 0.5);
  
  // Confiança baseada em:
  // 1. Número de pontos detectados com alta confiança
  // 2. Consistência da geometria com a vista detectada
  
  const pointsRatio = relevantPoints.length / 33; // 33 keypoints do MediaPipe
  const baseConfidence = pointsRatio * 100;
  
  // Ajustar confiança baseado na vista
  let adjustedConfidence = baseConfidence;
  
  if (detectedView === 'unknown') {
    adjustedConfidence = 0;
  } else {
    // Bonus de confiança se geometria é consistente
    adjustedConfidence = Math.min(100, baseConfidence + 20);
  }
  
  return Math.round(adjustedConfidence);
}

/**
 * Gera recomendações para corrigir vista incorreta
 */
function generateViewRecommendations(
  expectedView: string,
  detectedView: string
): string[] {
  const recommendations: string[] = [];
  
  if (detectedView === 'unknown') {
    recommendations.push('⚠️ Não foi possível identificar a vista da foto.');
    recommendations.push('Certifique-se de que a pessoa está visível e em posição neutra.');
    recommendations.push('Capture novamente a foto na vista correta.');
    return recommendations;
  }
  
  recommendations.push(`❌ ERRO: Foto esperada na vista ${getViewLabel(expectedView)}, mas detectada como ${getViewLabel(detectedView)}.`);
  
  if (expectedView === 'anterior' && detectedView === 'posterior') {
    recommendations.push('🔄 A pessoa está de costas. Vire-a de frente para a câmera.');
  } else if (expectedView === 'posterior' && detectedView === 'anterior') {
    recommendations.push('🔄 A pessoa está de frente. Vire-a de costas para a câmera.');
  } else if (expectedView === 'anterior' && (detectedView === 'lateralDireita' || detectedView === 'lateralEsquerda')) {
    recommendations.push('🔄 A pessoa está de lado. Posicione-a de frente para a câmera.');
  } else if (expectedView === 'posterior' && (detectedView === 'lateralDireita' || detectedView === 'lateralEsquerda')) {
    recommendations.push('🔄 A pessoa está de lado. Posicione-a de costas para a câmera.');
  } else if ((expectedView === 'lateralDireita' || expectedView === 'lateralEsquerda') && detectedView === 'anterior') {
    recommendations.push('🔄 A pessoa está de frente. Vire-a de lado (perfil).');
  } else if ((expectedView === 'lateralDireita' || expectedView === 'lateralEsquerda') && detectedView === 'posterior') {
    recommendations.push('🔄 A pessoa está de costas. Vire-a de lado (perfil).');
  }
  
  recommendations.push('📸 Capture novamente a foto na posição correta antes de prosseguir com a análise.');
  
  return recommendations;
}

/**
 * Retorna label traduzido da vista
 */
function getViewLabel(view: string): string {
  const labels: Record<string, string> = {
    anterior: 'ANTERIOR (Frente)',
    posterior: 'POSTERIOR (Costas)',
    lateralDireita: 'LATERAL DIREITA (Perfil Direito)',
    lateralEsquerda: 'LATERAL ESQUERDA (Perfil Esquerdo)',
    unknown: 'DESCONHECIDA'
  };
  
  return labels[view] || view;
}

/**
 * Valida múltiplas fotos de uma vez
 */
export function validateMultipleViews(
  poses: Map<string, DetectedPose>
): {
  allCorrect: boolean;
  validations: Map<string, ViewValidation>;
  summary: string;
} {
  const validations = new Map<string, ViewValidation>();
  let allCorrect = true;
  
  poses.forEach((pose, viewType) => {
    const validation = validatePhotoView(
      pose,
      viewType as 'anterior' | 'posterior' | 'lateralDireita' | 'lateralEsquerda'
    );
    
    validations.set(viewType, validation);
    
    if (!validation.isCorrect) {
      allCorrect = false;
    }
  });
  
  const incorrectCount = Array.from(validations.values()).filter(v => !v.isCorrect).length;
  
  const summary = allCorrect
    ? '✅ Todas as fotos estão nas vistas corretas.'
    : `⚠️ ${incorrectCount} foto(s) em vista incorreta. Revise e capture novamente.`;
  
  return {
    allCorrect,
    validations,
    summary
  };
}
