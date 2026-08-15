// ============================================
// PONTE CENTRAL: foto -> pose real (MediaPipe) -> achados/flags -> banco
// Usado por MediaCollector (fluxo normal) e ExpressAnalysis (fluxo rápido).
// Sem isso, ppa_findings/ppa_metrics nunca eram populados e o botão
// "Analisar com Gemini" no ResultsHUD ficava bloqueado pra sempre.
// ============================================

import { detectPoseFromImage, detectPosturalDeviations } from './poseDetectionService';
import { convertAnalysisToFlags, deduplicateFlags, enrichFlags } from './flagConversionService';

export interface PoseAnalysisFinding {
  key: string;
  direction: string;
  severity: number;
  confidence: number;
}

export interface PoseAnalysisMetric {
  key: string;
  value: number;
  unit: string | null;
  severity: number;
}

export interface PhotoInput {
  imageUrl: string;
  view: string; // 'anterior' | 'posterior' | 'lateral_d' | 'lateral_e'
}

export interface PoseAnalysisResult {
  findings: PoseAnalysisFinding[];
  metrics: PoseAnalysisMetric[];
  posesDetected: number;
  photosAnalyzed: number;
  warnings: string[];
}

function directionFromView(view: string): string {
  if (view.includes('lateral')) return 'lateral';
  if (view === 'posterior') return 'posterior';
  return 'anterior';
}

/**
 * Roda o MediaPipe Pose real em cada foto, extrai desvios posturais geométricos
 * e converte em flags clínicas padronizadas (PEP/DYN/etc), prontas para gravar
 * em ppa_findings e ppa_metrics.
 */
export async function runPoseAnalysisOnPhotos(photos: PhotoInput[]): Promise<PoseAnalysisResult> {
  const allFindings: PoseAnalysisFinding[] = [];
  const allMetrics: PoseAnalysisMetric[] = [];
  const warnings: string[] = [];
  let posesDetected = 0;

  for (const photo of photos) {
    try {
      const pose = await detectPoseFromImage(photo.imageUrl);
      if (!pose) {
        warnings.push(`Nenhuma pose detectada em ${photo.view}`);
        continue;
      }
      posesDetected++;

      // Salva keypoints com confiança suficiente como métricas (usados no AnalyticCanvas)
      pose.keypoints.forEach(kp => {
        if (kp.confidence < 0.5) return;
        allMetrics.push({
          key: `keypoint_${kp.name}_${photo.view}`,
          value: kp.x,
          unit: String(kp.y),
          severity: 1,
        });
      });

      const deviations = detectPosturalDeviations(pose.keypoints);
      const analysisFindings = deviations.map(d => ({
        name: d.deviation,
        value: d.measurement,
        severity: d.severity,
        angle: d.angle,
      }));

      const flags = enrichFlags(
        deduplicateFlags(convertAnalysisToFlags({ type: 'pose', findings: analysisFindings }))
      );

      flags.forEach(f => {
        allFindings.push({
          key: f.code,
          direction: directionFromView(photo.view),
          severity: f.severity,
          confidence: (f.confidence || 75) / 100,
        });
      });
    } catch (err) {
      console.error(`Erro na análise de pose (${photo.view}):`, err);
      warnings.push(`Falha ao processar ${photo.view}: ${(err as Error).message}`);
    }
  }

  // Dedup por flag, mantém a maior severidade encontrada entre as vistas
  const dedupedMap = new Map<string, PoseAnalysisFinding>();
  allFindings.forEach(f => {
    const existing = dedupedMap.get(f.key);
    if (!existing || f.severity > existing.severity) dedupedMap.set(f.key, f);
  });

  return {
    findings: Array.from(dedupedMap.values()),
    metrics: allMetrics,
    posesDetected,
    photosAnalyzed: photos.length,
    warnings,
  };
}

export default { runPoseAnalysisOnPhotos };
