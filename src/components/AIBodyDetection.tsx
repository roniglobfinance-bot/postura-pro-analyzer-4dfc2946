import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Camera, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Loader2,
  Target
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BodyLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

interface PostureAnalysis {
  headForwardPosition: number;
  shoulderLevel: number;
  spinalAlignment: number;
  hipLevel: number;
  overallScore: number;
  recommendations: string[];
}

interface AIBodyDetectionProps {
  imageUrl?: string;
  onAnalysisComplete?: (analysis: PostureAnalysis) => void;
  autoAnalyze?: boolean;
}

const AIBodyDetection = ({ 
  imageUrl, 
  onAnalysisComplete, 
  autoAnalyze = false 
}: AIBodyDetectionProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [landmarks, setLandmarks] = useState<BodyLandmark[]>([]);
  const [analysis, setAnalysis] = useState<PostureAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Mock AI analysis - In production, this would use actual ML models
  const analyzePosture = useCallback(async (imageData: string) => {
    setIsAnalyzing(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress
      const progressSteps = [
        { step: 'Carregando modelo de IA...', progress: 20 },
        { step: 'Detectando pontos anatômicos...', progress: 40 },
        { step: 'Analisando alinhamento corporal...', progress: 60 },
        { step: 'Calculando métricas posturais...', progress: 80 },
        { step: 'Gerando recomendações...', progress: 100 }
      ];

      for (const { step, progress: stepProgress } of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setProgress(stepProgress);
        
        if (stepProgress === 40) {
          // Mock landmarks detection
          const mockLandmarks = generateMockLandmarks();
          setLandmarks(mockLandmarks);
          drawLandmarks(mockLandmarks);
        }
      }

      // Mock analysis results
      const mockAnalysis: PostureAnalysis = {
        headForwardPosition: Math.random() * 30 + 10, // 10-40mm
        shoulderLevel: Math.random() * 20 + 5, // 5-25mm difference
        spinalAlignment: Math.random() * 15 + 5, // 5-20° deviation
        hipLevel: Math.random() * 15 + 3, // 3-18mm difference
        overallScore: Math.random() * 30 + 70, // 70-100 score
        recommendations: generateRecommendations()
      };

      setAnalysis(mockAnalysis);
      onAnalysisComplete?.(mockAnalysis);

      toast({
        title: "Análise concluída",
        description: "A análise postural por IA foi concluída com sucesso."
      });

    } catch (err) {
      const errorMessage = 'Erro na análise de IA. Tente novamente.';
      setError(errorMessage);
      toast({
        title: "Erro na análise",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [onAnalysisComplete]);

  const generateMockLandmarks = (): BodyLandmark[] => {
    // Generate mock body landmarks (head, shoulders, hips, etc.)
    return [
      // Head/Neck
      { x: 0.5, y: 0.15, visibility: 0.9 }, // Head top
      { x: 0.5, y: 0.25, visibility: 0.85 }, // Neck
      
      // Shoulders
      { x: 0.4, y: 0.3, visibility: 0.9 }, // Left shoulder
      { x: 0.6, y: 0.32, visibility: 0.9 }, // Right shoulder
      
      // Spine points
      { x: 0.5, y: 0.4, visibility: 0.8 }, // Upper spine
      { x: 0.5, y: 0.55, visibility: 0.8 }, // Mid spine
      { x: 0.5, y: 0.7, visibility: 0.8 }, // Lower spine
      
      // Hips
      { x: 0.45, y: 0.75, visibility: 0.85 }, // Left hip
      { x: 0.55, y: 0.77, visibility: 0.85 }, // Right hip
    ];
  };

  const generateRecommendations = (): string[] => {
    const allRecommendations = [
      'Fortalecer músculos do core para melhor estabilidade',
      'Alongar músculos peitorais e flexores do quadril',
      'Praticar exercícios de consciência postural',
      'Ajustar altura do monitor/workstation',
      'Incluir pausas regulares durante o trabalho',
      'Fortalecer músculos das costas e glúteos',
      'Melhorar flexibilidade da coluna torácica',
      'Trabalhar simetria corporal com exercícios unilaterais'
    ];
    
    return allRecommendations
      .sort(() => Math.random() - 0.5)
      .slice(0, 3 + Math.floor(Math.random() * 3));
  };

  const drawLandmarks = (landmarkData: BodyLandmark[]) => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    // Draw image
    ctx.drawImage(image, 0, 0);

    // Draw landmarks
    landmarkData.forEach((landmark, index) => {
      const x = landmark.x * canvas.width;
      const y = landmark.y * canvas.height;
      const visibility = landmark.visibility || 1;

      // Draw landmark point
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(59, 130, 246, ${visibility})`;
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw landmark number
      ctx.fillStyle = 'white';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(index + 1), x, y + 4);
    });

    // Draw connecting lines for spine
    const spinePoints = landmarkData.slice(1, 7); // Neck to lower spine
    ctx.beginPath();
    spinePoints.forEach((point, index) => {
      const x = point.x * canvas.width;
      const y = point.y * canvas.height;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  useEffect(() => {
    if (imageUrl && autoAnalyze) {
      analyzePosture(imageUrl);
    }
  }, [imageUrl, autoAnalyze, analyzePosture]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excelente';
    if (score >= 70) return 'Bom';
    if (score >= 50) return 'Regular';
    return 'Necessita atenção';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-blue-600" />
            Análise de IA - Detecção Corporal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image Display */}
          {imageUrl && (
            <div className="relative">
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Análise corporal"
                className="w-full max-h-96 object-contain rounded-lg"
                onLoad={() => {
                  if (landmarks.length > 0) {
                    drawLandmarks(landmarks);
                  }
                }}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full object-contain"
                style={{ maxHeight: '384px' }}
              />
            </div>
          )}

          {/* Analysis Controls */}
          <div className="flex space-x-3">
            <Button
              onClick={() => imageUrl && analyzePosture(imageUrl)}
              disabled={!imageUrl || isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Target className="h-4 w-4 mr-2" />
              )}
              {isAnalyzing ? 'Analisando...' : 'Iniciar Análise de IA'}
            </Button>
          </div>

          {/* Progress */}
          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Processando análise... {progress}%
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Resultados da Análise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore.toFixed(1)}
              </div>
              <div className="text-lg text-muted-foreground">
                {getScoreLabel(analysis.overallScore)}
              </div>
              <Badge variant="outline" className="mt-2">
                Pontuação Geral
              </Badge>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Projeção da Cabeça</span>
                  <span className="text-sm font-medium">
                    {analysis.headForwardPosition.toFixed(1)}mm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Desnível dos Ombros</span>
                  <span className="text-sm font-medium">
                    {analysis.shoulderLevel.toFixed(1)}mm
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Alinhamento Espinhal</span>
                  <span className="text-sm font-medium">
                    {analysis.spinalAlignment.toFixed(1)}°
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Desnível do Quadril</span>
                  <span className="text-sm font-medium">
                    {analysis.hipLevel.toFixed(1)}mm
                  </span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Recomendações
              </h4>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <Badge variant="outline" className="mr-2 mt-0.5 text-xs">
                      {index + 1}
                    </Badge>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Landmark Info */}
            {landmarks.length > 0 && (
              <Alert>
                <Target className="h-4 w-4" />
                <AlertDescription>
                  {landmarks.length} pontos anatômicos detectados automaticamente.
                  Os pontos azuis indicam estruturas corporais identificadas pela IA.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIBodyDetection;