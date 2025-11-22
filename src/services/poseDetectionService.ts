import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

export interface DetectedPose {
  keypoints: {
    name: string;
    x: number;
    y: number;
    z: number;
    confidence: number;
    visibility: number;
  }[];
  worldLandmarks?: {
    x: number;
    y: number;
    z: number;
  }[];
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Mapeamento dos 33 keypoints do MediaPipe Pose para pontos anatômicos clínicos
const MEDIAPIPE_KEYPOINT_MAPPING: Record<number, string> = {
  0: 'Nariz',
  1: 'Olho Interno E',
  2: 'Olho E',
  3: 'Olho Externo E',
  4: 'Olho Interno D',
  5: 'Olho D',
  6: 'Olho Externo D',
  7: 'Orelha E',
  8: 'Orelha D',
  9: 'Canto da Boca E',
  10: 'Canto da Boca D',
  11: 'Acrômio E',
  12: 'Acrômio D',
  13: 'Cotovelo E',
  14: 'Cotovelo D',
  15: 'Punho E',
  16: 'Punho D',
  17: 'Pinky E',
  18: 'Pinky D',
  19: 'Indicador E',
  20: 'Indicador D',
  21: 'Polegar E',
  22: 'Polegar D',
  23: 'EIAS E',
  24: 'EIAS D',
  25: 'Joelho E',
  26: 'Joelho D',
  27: 'Tornozelo E',
  28: 'Tornozelo D',
  29: 'Calcanhar E',
  30: 'Calcanhar D',
  31: 'Ponta do Pé E',
  32: 'Ponta do Pé D'
};

// Pontos anatômicos principais para análise postural
const CLINICAL_LANDMARKS = [0, 7, 8, 11, 12, 23, 24, 25, 26, 27, 28];

let poseLandmarker: PoseLandmarker | null = null;
let wasmInitialized = false;

export async function initializePoseDetection() {
  if (poseLandmarker) return poseLandmarker;
  
  try {
    if (!wasmInitialized) {
      console.log('Inicializando MediaPipe WASM...');
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      wasmInitialized = true;
      
      console.log('Criando PoseLandmarker...');
      poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task',
          delegate: 'GPU'
        },
        runningMode: 'IMAGE',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      
      console.log('MediaPipe Pose inicializado com sucesso!');
    }
    
    return poseLandmarker;
  } catch (error) {
    console.error('Erro ao inicializar MediaPipe:', error);
    throw error;
  }
}

export async function detectPoseFromImage(imageUrl: string): Promise<DetectedPose | null> {
  try {
    const detector = await initializePoseDetection();
    if (!detector) throw new Error('Detector não inicializado');
    
    // Criar imagem temporária
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          console.log('Detectando pose com MediaPipe...');
          
          // Detectar pose usando MediaPipe
          const results = detector.detect(img);
          
          if (!results.landmarks || results.landmarks.length === 0) {
            console.warn('Nenhuma pose detectada na imagem');
            resolve(null);
            return;
          }
          
          const landmarks = results.landmarks[0];
          const worldLandmarks = results.worldLandmarks?.[0];
          
          // Converter landmarks do MediaPipe para nosso formato
          const keypoints = landmarks.map((landmark: any, index: number) => ({
            name: MEDIAPIPE_KEYPOINT_MAPPING[index] || `Ponto ${index}`,
            x: landmark.x,
            y: landmark.y,
            z: landmark.z || 0,
            confidence: landmark.visibility || 0,
            visibility: landmark.visibility || 0
          }));
          
          // Calcular bounding box
          const xs = landmarks.map((l: any) => l.x);
          const ys = landmarks.map((l: any) => l.y);
          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minY = Math.min(...ys);
          const maxY = Math.max(...ys);
          
          const pose: DetectedPose = {
            keypoints,
            worldLandmarks: worldLandmarks?.map((wl: any) => ({
              x: wl.x,
              y: wl.y,
              z: wl.z
            })),
            box: {
              x: minX,
              y: minY,
              width: maxX - minX,
              height: maxY - minY
            }
          };
          
          console.log(`Pose detectada com ${keypoints.length} keypoints`);
          resolve(pose);
        } catch (error) {
          console.error('Erro ao processar detecção:', error);
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Falha ao carregar imagem'));
      img.src = imageUrl;
    });
  } catch (error) {
    console.error('Erro na detecção de pose:', error);
    return null;
  }
}

export function calculateAngleFromKeypoints(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
): number {
  const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - 
                  Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let angle = Math.abs(radians * 180 / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

export function detectPosturalDeviations(keypoints: DetectedPose['keypoints']): {
  deviation: string;
  severity: number;
  measurement: number;
  angle?: number;
}[] {
  const deviations: { deviation: string; severity: number; measurement: number; angle?: number }[] = [];
  
  // Encontrar pontos específicos usando nomes do MediaPipe
  const nose = keypoints.find(k => k.name === 'Nariz');
  const shoulderR = keypoints.find(k => k.name === 'Acrômio D');
  const shoulderL = keypoints.find(k => k.name === 'Acrômio E');
  const earR = keypoints.find(k => k.name === 'Orelha D');
  const earL = keypoints.find(k => k.name === 'Orelha E');
  const hipR = keypoints.find(k => k.name === 'EIAS D');
  const hipL = keypoints.find(k => k.name === 'EIAS E');
  const kneeR = keypoints.find(k => k.name === 'Joelho D');
  const kneeL = keypoints.find(k => k.name === 'Joelho E');
  const ankleR = keypoints.find(k => k.name === 'Tornozelo D');
  const ankleL = keypoints.find(k => k.name === 'Tornozelo E');
  
  // 1. DESNÍVEL DE OMBROS
  if (shoulderR && shoulderL && shoulderR.confidence > 0.5 && shoulderL.confidence > 0.5) {
    const shoulderDiff = Math.abs(shoulderR.y - shoulderL.y);
    if (shoulderDiff > 0.02) {
      const side = shoulderR.y < shoulderL.y ? 'D' : 'E';
      deviations.push({
        deviation: `Ombro Elevado ${side}`,
        severity: shoulderDiff > 0.05 ? 3 : shoulderDiff > 0.03 ? 2 : 1,
        measurement: shoulderDiff * 100
      });
    }
  }
  
  // 2. DESNÍVEL DE QUADRIL
  if (hipR && hipL && hipR.confidence > 0.5 && hipL.confidence > 0.5) {
    const hipDiff = Math.abs(hipR.y - hipL.y);
    if (hipDiff > 0.02) {
      const side = hipR.y < hipL.y ? 'D' : 'E';
      deviations.push({
        deviation: `Desnível de Quadril ${side}`,
        severity: hipDiff > 0.05 ? 3 : hipDiff > 0.03 ? 2 : 1,
        measurement: hipDiff * 100
      });
    }
  }
  
  // 3. ANTERIORIZAÇÃO DE CABEÇA (Forward Head Posture)
  if (earL && shoulderL && earL.confidence > 0.5 && shoulderL.confidence > 0.5) {
    const headForward = shoulderL.x - earL.x;
    if (headForward > 0.03) {
      deviations.push({
        deviation: 'Anteriorização de Cabeça',
        severity: headForward > 0.1 ? 3 : headForward > 0.06 ? 2 : 1,
        measurement: headForward * 100
      });
    }
  }
  
  // 4. PROTRUSÃO DE OMBROS
  if (shoulderR && shoulderL && shoulderR.confidence > 0.5 && shoulderL.confidence > 0.5) {
    const shoulderAvgX = (shoulderR.x + shoulderL.x) / 2;
    const hipAvgX = hipR && hipL ? (hipR.x + hipL.x) / 2 : shoulderAvgX;
    const shoulderProtrusion = shoulderAvgX - hipAvgX;
    
    if (shoulderProtrusion > 0.04) {
      deviations.push({
        deviation: 'Protrusão de Ombros',
        severity: shoulderProtrusion > 0.08 ? 3 : shoulderProtrusion > 0.06 ? 2 : 1,
        measurement: shoulderProtrusion * 100
      });
    }
  }
  
  // 5. GENU VALGO/VARO (análise de joelhos)
  if (hipR && kneeR && ankleR && hipR.confidence > 0.5 && kneeR.confidence > 0.5 && ankleR.confidence > 0.5) {
    const hipKneeAngle = Math.atan2(kneeR.y - hipR.y, kneeR.x - hipR.x);
    const kneeAnkleAngle = Math.atan2(ankleR.y - kneeR.y, ankleR.x - kneeR.x);
    const kneeAngle = Math.abs((kneeAnkleAngle - hipKneeAngle) * (180 / Math.PI));
    
    // Valgo: joelho para dentro (x do joelho > média de quadril e tornozelo)
    const hipAnkleMidX = (hipR.x + ankleR.x) / 2;
    const kneeDeviation = kneeR.x - hipAnkleMidX;
    
    if (Math.abs(kneeDeviation) > 0.03) {
      if (kneeDeviation > 0) {
        deviations.push({
          deviation: 'Genu Valgo D',
          severity: Math.abs(kneeDeviation) > 0.08 ? 3 : Math.abs(kneeDeviation) > 0.05 ? 2 : 1,
          measurement: Math.abs(kneeDeviation) * 100,
          angle: kneeAngle
        });
      } else {
        deviations.push({
          deviation: 'Genu Varo D',
          severity: Math.abs(kneeDeviation) > 0.08 ? 3 : Math.abs(kneeDeviation) > 0.05 ? 2 : 1,
          measurement: Math.abs(kneeDeviation) * 100,
          angle: kneeAngle
        });
      }
    }
  }
  
  // Repetir análise para lado esquerdo
  if (hipL && kneeL && ankleL && hipL.confidence > 0.5 && kneeL.confidence > 0.5 && ankleL.confidence > 0.5) {
    const hipAnkleMidX = (hipL.x + ankleL.x) / 2;
    const kneeDeviation = kneeL.x - hipAnkleMidX;
    
    if (Math.abs(kneeDeviation) > 0.03) {
      if (kneeDeviation < 0) {
        deviations.push({
          deviation: 'Genu Valgo E',
          severity: Math.abs(kneeDeviation) > 0.08 ? 3 : Math.abs(kneeDeviation) > 0.05 ? 2 : 1,
          measurement: Math.abs(kneeDeviation) * 100
        });
      } else {
        deviations.push({
          deviation: 'Genu Varo E',
          severity: Math.abs(kneeDeviation) > 0.08 ? 3 : Math.abs(kneeDeviation) > 0.05 ? 2 : 1,
          measurement: Math.abs(kneeDeviation) * 100
        });
      }
    }
  }
  
  // 6. HIPERCIFOSE TORÁCICA (estimativa pela posição relativa dos ombros e quadril)
  if (shoulderR && shoulderL && hipR && hipL) {
    const shoulderMidY = (shoulderR.y + shoulderL.y) / 2;
    const shoulderMidX = (shoulderR.x + shoulderL.x) / 2;
    const hipMidY = (hipR.y + hipL.y) / 2;
    const hipMidX = (hipR.x + hipL.x) / 2;
    
    // Se ombros estão muito atrás do quadril, pode indicar cifose
    const thoracicCurve = shoulderMidX - hipMidX;
    if (thoracicCurve < -0.04) {
      deviations.push({
        deviation: 'Hipercifose Torácica',
        severity: thoracicCurve < -0.08 ? 3 : thoracicCurve < -0.06 ? 2 : 1,
        measurement: Math.abs(thoracicCurve) * 100
      });
    }
  }
  
  // 7. HIPERLORDOSE LOMBAR (estimativa)
  if (hipR && hipL && shoulderR && shoulderL) {
    const hipMidX = (hipR.x + hipL.x) / 2;
    const shoulderMidX = (shoulderR.x + shoulderL.x) / 2;
    
    // Se quadril está muito à frente dos ombros, pode indicar lordose
    const lumbarCurve = hipMidX - shoulderMidX;
    if (lumbarCurve > 0.05) {
      deviations.push({
        deviation: 'Hiperlordose Lombar',
        severity: lumbarCurve > 0.1 ? 3 : lumbarCurve > 0.07 ? 2 : 1,
        measurement: lumbarCurve * 100
      });
    }
  }
  
  return deviations;
}

// Obter todos os 33 keypoints para visualização 3D
export function getAllKeypoints(pose: DetectedPose) {
  return pose.keypoints;
}

// Obter keypoints clínicos principais
export function getClinicalKeypoints(pose: DetectedPose) {
  return pose.keypoints.filter((_, index) => CLINICAL_LANDMARKS.includes(index));
}
