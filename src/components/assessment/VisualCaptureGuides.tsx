
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Grid3x3, Ruler, Target, Eye, Settings } from 'lucide-react';

interface VisualCaptureGuidesProps {
  onPhotoCapture: (imageUrl: string) => void;
  currentView: 'anterior' | 'posterior' | 'lateral-direita' | 'lateral-esquerda';
}

const VisualCaptureGuides = ({ onPhotoCapture, currentView }: VisualCaptureGuidesProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCamera, setIsCamera] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showSilhouette, setShowSilhouette] = useState(true);
  const [showReferenceLines, setShowReferenceLines] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setStream(mediaStream);
      setIsCamera(true);
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0);
    
    const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
    onPhotoCapture(imageUrl);
    stopCamera();
  };

  const drawOverlays = () => {
    if (!videoRef.current || !isCamera) return;
    
    const video = videoRef.current;
    const overlay = document.getElementById('camera-overlay') as HTMLCanvasElement;
    if (!overlay) return;
    
    const ctx = overlay.getContext('2d');
    if (!ctx) return;
    
    overlay.width = video.offsetWidth;
    overlay.height = video.offsetHeight;
    
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    
    // Grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      
      const gridSize = 50;
      for (let x = 0; x <= overlay.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, overlay.height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= overlay.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(overlay.width, y);
        ctx.stroke();
      }
    }
    
    // Linhas de referência
    if (showReferenceLines) {
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)';
      ctx.lineWidth = 2;
      
      // Linha vertical central
      ctx.beginPath();
      ctx.moveTo(overlay.width / 2, 0);
      ctx.lineTo(overlay.width / 2, overlay.height);
      ctx.stroke();
      
      // Linhas horizontais
      const horizontalLines = [0.25, 0.5, 0.75];
      horizontalLines.forEach(ratio => {
        const y = overlay.height * ratio;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(overlay.width, y);
        ctx.stroke();
      });
    }
    
    // Silhueta de referência
    if (showSilhouette) {
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      const centerX = overlay.width / 2;
      const bodyWidth = overlay.width * 0.2;
      const bodyHeight = overlay.height * 0.8;
      const startY = overlay.height * 0.1;
      
      // Desenhar silhueta básica baseada na vista
      drawSilhouetteForView(ctx, centerX, startY, bodyWidth, bodyHeight, currentView);
    }
  };

  const drawSilhouetteForView = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    startY: number,
    width: number,
    height: number,
    view: string
  ) => {
    switch (view) {
      case 'anterior':
      case 'posterior':
        // Cabeça
        ctx.beginPath();
        ctx.arc(centerX, startY + height * 0.1, width * 0.15, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Tronco
        ctx.beginPath();
        ctx.rect(centerX - width * 0.2, startY + height * 0.2, width * 0.4, height * 0.4);
        ctx.stroke();
        
        // Braços
        ctx.beginPath();
        ctx.moveTo(centerX - width * 0.2, startY + height * 0.25);
        ctx.lineTo(centerX - width * 0.35, startY + height * 0.5);
        ctx.moveTo(centerX + width * 0.2, startY + height * 0.25);
        ctx.lineTo(centerX + width * 0.35, startY + height * 0.5);
        ctx.stroke();
        
        // Pernas
        ctx.beginPath();
        ctx.moveTo(centerX - width * 0.1, startY + height * 0.6);
        ctx.lineTo(centerX - width * 0.1, startY + height * 0.9);
        ctx.moveTo(centerX + width * 0.1, startY + height * 0.6);
        ctx.lineTo(centerX + width * 0.1, startY + height * 0.9);
        ctx.stroke();
        break;
        
      case 'lateral-direita':
      case 'lateral-esquerda':
        // Perfil da cabeça
        ctx.beginPath();
        ctx.arc(centerX, startY + height * 0.1, width * 0.12, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Curvatura da coluna
        ctx.beginPath();
        ctx.moveTo(centerX, startY + height * 0.2);
        ctx.quadraticCurveTo(centerX + width * 0.05, startY + height * 0.35, centerX, startY + height * 0.5);
        ctx.quadraticCurveTo(centerX - width * 0.08, startY + height * 0.65, centerX, startY + height * 0.8);
        ctx.stroke();
        break;
    }
  };

  useEffect(() => {
    if (isCamera) {
      const interval = setInterval(drawOverlays, 100);
      return () => clearInterval(interval);
    }
  }, [isCamera, showGrid, showSilhouette, showReferenceLines, currentView]);

  const getInstructions = () => {
    const instructions = {
      anterior: {
        title: "Vista Anterior - Posicionamento",
        steps: [
          "Cliente de frente para a câmera",
          "Braços ao lado do corpo, relaxados",
          "Pés paralelos, afastados na largura do quadril",
          "Olhar direcionado para frente",
          "Roupas justas ou mínimas para visualização"
        ]
      },
      posterior: {
        title: "Vista Posterior - Posicionamento",
        steps: [
          "Cliente de costas para a câmera",
          "Braços ao lado do corpo, relaxados",
          "Pés paralelos, afastados na largura do quadril",
          "Cabeça alinhada naturalmente",
          "Visualização clara da coluna vertebral"
        ]
      },
      "lateral-direita": {
        title: "Vista Lateral Direita - Posicionamento",
        steps: [
          "Cliente de lado (lado direito voltado para câmera)",
          "Braços ao lado do corpo",
          "Postura natural e relaxada",
          "Visualização do perfil completo",
          "Alinhamento das curvaturas da coluna"
        ]
      },
      "lateral-esquerda": {
        title: "Vista Lateral Esquerda - Posicionamento",
        steps: [
          "Cliente de lado (lado esquerdo voltado para câmera)",
          "Braços ao lado do corpo",
          "Postura natural e relaxada",
          "Visualização do perfil completo",
          "Alinhamento das curvaturas da coluna"
        ]
      }
    };
    
    return instructions[currentView];
  };

  return (
    <div className="space-y-6">
      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            {getInstructions().title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {getInstructions().steps.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center justify-center mr-3 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Controles de Captura */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              Captura com Guias Visuais
            </span>
            <div className="flex space-x-2">
              <Button
                variant={isCamera ? "destructive" : "default"}
                onClick={isCamera ? stopCamera : startCamera}
              >
                <Camera className="h-4 w-4 mr-2" />
                {isCamera ? 'Parar Câmera' : 'Iniciar Câmera'}
              </Button>
              {isCamera && (
                <Button onClick={capturePhoto}>
                  <Camera className="h-4 w-4 mr-2" />
                  Capturar
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="camera" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera">Câmera</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="camera">
              <div className="relative">
                {isCamera ? (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-auto rounded-lg border"
                      style={{ maxHeight: '500px' }}
                    />
                    <canvas
                      id="camera-overlay"
                      className="absolute top-0 left-0 w-full h-full pointer-events-none"
                      style={{ maxHeight: '500px' }}
                    />
                  </>
                ) : (
                  <div className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                    <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Clique em "Iniciar Câmera" para começar a captura com guias visuais</p>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Grid3x3 className="h-4 w-4" />
                    <Label htmlFor="grid">Grade de Referência</Label>
                  </div>
                  <Switch
                    id="grid"
                    checked={showGrid}
                    onCheckedChange={setShowGrid}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Ruler className="h-4 w-4" />
                    <Label htmlFor="lines">Linhas de Referência</Label>
                  </div>
                  <Switch
                    id="lines"
                    checked={showReferenceLines}
                    onCheckedChange={setShowReferenceLines}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <Label htmlFor="silhouette">Silhueta de Referência</Label>
                  </div>
                  <Switch
                    id="silhouette"
                    checked={showSilhouette}
                    onCheckedChange={setShowSilhouette}
                  />
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Dicas para Melhor Captura:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use as linhas verdes para alinhar o corpo</li>
                  <li>• A silhueta amarela serve como guia de posicionamento</li>
                  <li>• Mantenha boa iluminação e fundo neutro</li>
                  <li>• Posicione a câmera na altura do peito do cliente</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisualCaptureGuides;
