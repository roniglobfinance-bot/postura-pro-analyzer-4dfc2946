import { detectPoseFromImage, calculateAngleFromKeypoints, type DetectedPose } from './poseDetectionService';

export interface FrameAngles {
  kneeAngleL: number | null;
  kneeAngleR: number | null;
  hipAngleL: number | null;
  hipAngleR: number | null;
  trunkAngle: number | null;
  kneeValgusL: number | null;
  kneeValgusR: number | null;
  pelvicTiltDiff: number | null;
}

export interface AngleTrajectoryPoint extends FrameAngles {
  frame_index: number;
  t: number;
  pose_detected: boolean;
}

export interface VideoAnalysisData {
  frames_base64: string[];
  angle_trajectory: AngleTrajectoryPoint[];
}

const kp = (pose: DetectedPose, name: string) => {
  const p = pose.keypoints.find((k) => k.name === name);
  return p && p.confidence > 0.4 ? p : null;
};

function computeAngles(pose: DetectedPose | null): FrameAngles {
  const empty: FrameAngles = {
    kneeAngleL: null, kneeAngleR: null, hipAngleL: null, hipAngleR: null,
    trunkAngle: null, kneeValgusL: null, kneeValgusR: null, pelvicTiltDiff: null,
  };
  if (!pose) return empty;

  const hipL = kp(pose, 'EIAS E');
  const hipR = kp(pose, 'EIAS D');
  const kneeL = kp(pose, 'Joelho E');
  const kneeR = kp(pose, 'Joelho D');
  const ankleL = kp(pose, 'Tornozelo E');
  const ankleR = kp(pose, 'Tornozelo D');
  const shoulderL = kp(pose, 'Acrômio E');
  const shoulderR = kp(pose, 'Acrômio D');

  const out: FrameAngles = { ...empty };

  if (hipL && kneeL && ankleL) out.kneeAngleL = calculateAngleFromKeypoints(hipL, kneeL, ankleL);
  if (hipR && kneeR && ankleR) out.kneeAngleR = calculateAngleFromKeypoints(hipR, kneeR, ankleR);
  if (shoulderL && hipL && kneeL) out.hipAngleL = calculateAngleFromKeypoints(shoulderL, hipL, kneeL);
  if (shoulderR && hipR && kneeR) out.hipAngleR = calculateAngleFromKeypoints(shoulderR, hipR, kneeR);

  // Inclinação do tronco em relação à vertical (0° = tronco ereto)
  if (shoulderL && shoulderR && hipL && hipR) {
    const sx = (shoulderL.x + shoulderR.x) / 2;
    const sy = (shoulderL.y + shoulderR.y) / 2;
    const hx = (hipL.x + hipR.x) / 2;
    const hy = (hipL.y + hipR.y) / 2;
    out.trunkAngle = Math.abs((Math.atan2(hx - sx, hy - sy) * 180) / Math.PI);
    out.pelvicTiltDiff = Math.abs(hipL.y - hipR.y) * 100;
  }

  // Valgo dinâmico: desvio medial do joelho em relação ao eixo quadril→tornozelo (% da largura)
  if (hipL && kneeL && ankleL) out.kneeValgusL = (kneeL.x - (hipL.x + ankleL.x) / 2) * 100;
  if (hipR && kneeR && ankleR) out.kneeValgusR = (kneeR.x - (hipR.x + ankleR.x) / 2) * 100;

  return out;
}

async function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => { cleanup(); resolve(); };
    const onError = () => { cleanup(); reject(new Error('Falha ao posicionar o vídeo')); };
    const cleanup = () => {
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
    };
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);
    video.currentTime = time;
  });
}

async function ensureMetadata(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= 2 && isFinite(video.duration) && video.duration > 0) return;
  await new Promise<void>((resolve, reject) => {
    const onLoaded = () => { cleanup(); resolve(); };
    const onError = () => { cleanup(); reject(new Error('Falha ao carregar o vídeo')); };
    const cleanup = () => {
      video.removeEventListener('loadeddata', onLoaded);
      video.removeEventListener('error', onError);
    };
    video.addEventListener('loadeddata', onLoaded);
    video.addEventListener('error', onError);
  });
}

/**
 * Extrai N frames-chave do vídeo (JPEG base64 sem prefixo data:) e calcula
 * a trajetória de ângulos via MediaPipe (poseDetectionService).
 */
export async function extractVideoAnalysisData(
  videoElement: HTMLVideoElement,
  frameCount = 8,
  maxWidth = 640,
): Promise<VideoAnalysisData> {
  await ensureMetadata(videoElement);

  const duration = isFinite(videoElement.duration) ? videoElement.duration : 0;
  const wasPaused = videoElement.paused;
  videoElement.pause();

  const vw = videoElement.videoWidth || 640;
  const vh = videoElement.videoHeight || 480;
  const scale = vw > maxWidth ? maxWidth / vw : 1;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(vw * scale);
  canvas.height = Math.round(vh * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponível');

  const frames_base64: string[] = [];
  const angle_trajectory: AngleTrajectoryPoint[] = [];

  for (let i = 0; i < frameCount; i++) {
    const t = duration > 0 ? (duration * (i + 0.5)) / frameCount : 0;
    try {
      await seekTo(videoElement, Math.min(t, Math.max(duration - 0.05, 0)));
    } catch {
      break;
    }
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
    frames_base64.push(dataUrl.split(',')[1]);

    let pose: DetectedPose | null = null;
    try {
      pose = await detectPoseFromImage(dataUrl);
    } catch (e) {
      console.warn('Pose não detectada no frame', i, e);
    }

    angle_trajectory.push({
      frame_index: i,
      t: Number(t.toFixed(2)),
      pose_detected: !!pose,
      ...computeAngles(pose),
    });
  }

  if (!wasPaused) videoElement.play().catch(() => undefined);

  return { frames_base64, angle_trajectory };
}
