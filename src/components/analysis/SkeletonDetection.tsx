import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Camera } from 'lucide-react';

interface BodyKeypoint {
  name: string;
  x: number;
  y: number;
  confidence: number;
}

interface SkeletonAnalysis {
  keypoints: BodyKeypoint[];
  posturalIssues: {
    issue: string;
    severity: 'low' | 'medium' | 'high';
    cause: string;
    angles: { [key: string]: number };
  }[];
}

interface SkeletonDetectionProps {
  imageUrl: string;
  onAnalysisComplete?: (analysis: SkeletonAnalysis) => void;
}

const SKELETON_CONNECTIONS = [
  ['nose', 'left_eye'], ['nose', 'right_eye'],
  ['left_eye', 'left_ear'], ['right_eye', 'right_ear'],
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'], ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'], ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'], ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'], ['right_knee', 'right_ankle']
];

const SkeletonDetection = ({ imageUrl, onAnalysisComplete }: SkeletonDetectionProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SkeletonAnalysis | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const detectSkeleton = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simular detecção de pontos-chave (em produção, usar modelo AI real)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockKeypoints: BodyKeypoint[] = [
        { name: 'nose', x: 0.5, y: 0.15, confidence: 0.95 },
        { name: 'left_eye', x: 0.48, y: 0.13, confidence: 0.92 },
        { name: 'right_eye', x: 0.52, y: 0.13, confidence: 0.93 },
        { name: 'left_ear', x: 0.46, y: 0.14, confidence: 0.88 },
        { name: 'right_ear', x: 0.54, y: 0.14, confidence: 0.89 },
        { name: 'left_shoulder', x: 0.42, y: 0.28, confidence: 0.94 },
        { name: 'right_shoulder', x: 0.58, y: 0.28, confidence: 0.95 },
        { name: 'left_elbow', x: 0.38, y: 0.42, confidence: 0.91 },
        { name: 'right_elbow', x: 0.62, y: 0.42, confidence: 0.92 },
        { name: 'left_wrist', x: 0.36, y: 0.56, confidence: 0.87 },
        { name: 'right_wrist', x: 0.64, y: 0.56, confidence: 0.88 },
        { name: 'left_hip', x: 0.44, y: 0.58, confidence: 0.93 },
        { name: 'right_hip', x: 0.56, y: 0.58, confidence: 0.94 },
        { name: 'left_knee', x: 0.43, y: 0.75, confidence: 0.90 },
        { name: 'right_knee', x: 0.57, y: 0.75, confidence: 0.91 },
        { name: 'left_ankle', x: 0.42, y: 0.92, confidence: 0.85 },
        { name: 'right_ankle', x: 0.58, y: 0.92, confidence: 0.86 }
      ];

      // Calcular ângulos e identificar problemas posturais
      const headAngle = calculateAngle(
        mockKeypoints.find(k => k.name === 'nose')!,
        mockKeypoints.find(k => k.name === 'left_shoulder')!,
        mockKeypoints.find(k => k.name === 'left_hip')!
      );

      const shoulderAngle = calculateShoulderAlignment(
        mockKeypoints.find(k => k.name === 'left_shoulder')!,
        mockKeypoints.find(k => k.name === 'right_shoulder')!
      );

      const spineAngle = calculateAngle(
        mockKeypoints.find(k => k.name === 'left_shoulder')!,
        mockKeypoints.find(k => k.name === 'left_hip')!,
        mockKeypoints.find(k => k.name === 'left_knee')!
      );

      const posturalIssues = [];

      if (headAngle < 50) {
        posturalIssues.push({
          issue: 'Projeção Anterior da Cabeça',
          severity: 'high' as const,
          cause: 'Fraqueza dos músculos cervicais profundos e encurtamento de trapézio superior',
          angles: { 'Ângulo Craniocervical': headAngle }
        });
      }

      if (Math.abs(shoulderAngle) > 5) {
        posturalIssues.push({
          issue: 'Assimetria de Ombros',
          severity: 'medium' as const,
          cause: 'Desequilíbrio muscular entre trapézios e elevadores da escápula',
          angles: { 'Desnível de Ombros': Math.abs(shoulderAngle) }
        });
      }

      if (spineAngle > 185 || spineAngle < 175) {
        posturalIssues.push({
          issue: 'Alteração da Curvatura Torácica',
          severity: spineAngle > 185 ? 'high' as const : 'medium' as const,
          cause: 'Fraqueza de eretores da espinha e encurtamento de cadeia anterior',
          angles: { 'Ângulo Torácico': spineAngle }
        });
      }

      const analysisResult: SkeletonAnalysis = {
        keypoints: mockKeypoints,
        posturalIssues
      };

      setAnalysis(analysisResult);
      drawSkeleton(mockKeypoints);
      onAnalysisComplete?.(analysisResult);

      toast({
        title: "Análise Concluída",
        description: `${posturalIssues.length} disfunções posturais identificadas`,
      });
    } catch (error) {
      console.error('Erro na análise:', error);
      toast({
        title: "Erro na Análise",
        description: "Não foi possível processar a imagem",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateAngle = (p1: BodyKeypoint, p2: BodyKeypoint, p3: BodyKeypoint): number => {
    const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
    let angle = Math.abs((angle1 - angle2) * 180 / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return Math.round(angle);
  };

  const calculateShoulderAlignment = (left: BodyKeypoint, right: BodyKeypoint): number => {
    return Math.round((right.y - left.y) * 100);
  };

  const drawSkeleton = (keypoints: BodyKeypoint[]) => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    // Desenhar imagem
    ctx.drawImage(image, 0, 0);

    // Desenhar conexões do esqueleto
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    
    SKELETON_CONNECTIONS.forEach(([start, end]) => {
      const startPoint = keypoints.find(k => k.name === start);
      const endPoint = keypoints.find(k => k.name === end);
      
      if (startPoint && endPoint && startPoint.confidence > 0.5 && endPoint.confidence > 0.5) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
        ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
        ctx.stroke();
      }
    });

    // Desenhar pontos-chave
    keypoints.forEach(point => {
      if (point.confidence > 0.5) {
        ctx.fillStyle = point.confidence > 0.8 ? '#00ff00' : '#ffff00';
        ctx.beginPath();
        ctx.arc(
          point.x * canvas.width,
          point.y * canvas.height,
          6,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Análise de Esqueleto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative border rounded-lg overflow-hidden bg-black">
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Análise postural"
              className="hidden"
              crossOrigin="anonymous"
            />
            <canvas
              ref={canvasRef}
              className="w-full h-auto"
            />
          </div>

          <Button
            onClick={detectSkeleton}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando Esqueleto...
              </>
            ) : (
              'Iniciar Análise de Esqueleto'
            )}
          </Button>

          {analysis && analysis.posturalIssues.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Agentes Causais Identificados:</h3>
              {analysis.posturalIssues.map((issue, idx) => (
                <Card key={idx} className={`border-l-4 ${
                  issue.severity === 'high' ? 'border-l-red-500' :
                  issue.severity === 'medium' ? 'border-l-yellow-500' :
                  'border-l-green-500'
                }`}>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{issue.issue}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          issue.severity === 'high' ? 'bg-red-100 text-red-800' :
                          issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {issue.severity === 'high' ? 'Alto' :
                           issue.severity === 'medium' ? 'Médio' : 'Baixo'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Causa:</strong> {issue.cause}
                      </p>
                      <div className="text-sm">
                        <strong>Ângulos:</strong>
                        {Object.entries(issue.angles).map(([key, value]) => (
                          <div key={key} className="ml-2">
                            • {key}: <span className="font-mono">{value}°</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SkeletonDetection;
