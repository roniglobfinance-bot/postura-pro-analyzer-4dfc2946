import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Move, RotateCcw } from 'lucide-react';

interface Point {
  id: string;
  x: number;
  y: number;
  label: string;
  color: string;
}

interface Angle {
  id: string;
  pointIds: [string, string, string];
  label: string;
  value: number;
}

interface DynamicAngleAnalysisProps {
  imageUrl: string;
}

const DynamicAngleAnalysis = ({ imageUrl }: DynamicAngleAnalysisProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [angles, setAngles] = useState<Angle[]>([]);
  const [draggingPoint, setDraggingPoint] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializePoints = () => {
    const defaultPoints: Point[] = [
      { id: 'p1', x: 0.5, y: 0.15, label: 'Cabeça', color: '#ff0000' },
      { id: 'p2', x: 0.5, y: 0.3, label: 'C7', color: '#00ff00' },
      { id: 'p3', x: 0.45, y: 0.3, label: 'Ombro E', color: '#0000ff' },
      { id: 'p4', x: 0.55, y: 0.3, label: 'Ombro D', color: '#0000ff' },
      { id: 'p5', x: 0.5, y: 0.5, label: 'T12', color: '#ffff00' },
      { id: 'p6', x: 0.45, y: 0.6, label: 'Quadril E', color: '#ff00ff' },
      { id: 'p7', x: 0.55, y: 0.6, label: 'Quadril D', color: '#ff00ff' },
      { id: 'p8', x: 0.45, y: 0.8, label: 'Joelho E', color: '#00ffff' },
      { id: 'p9', x: 0.55, y: 0.8, label: 'Joelho D', color: '#00ffff' },
    ];

    const defaultAngles: Angle[] = [
      { id: 'a1', pointIds: ['p1', 'p2', 'p5'], label: 'Ângulo Craniocervical', value: 0 },
      { id: 'a2', pointIds: ['p3', 'p2', 'p4'], label: 'Ângulo de Ombros', value: 0 },
      { id: 'a3', pointIds: ['p2', 'p5', 'p6'], label: 'Cifose Torácica', value: 0 },
      { id: 'a4', pointIds: ['p5', 'p6', 'p8'], label: 'Lordose Lombar', value: 0 },
    ];

    setPoints(defaultPoints);
    setAngles(defaultAngles);
    setIsInitialized(true);
  };

  useEffect(() => {
    if (isInitialized) {
      drawCanvas();
      updateAngles();
    }
  }, [points, isInitialized]);

  const calculateAngle = (p1: Point, p2: Point, p3: Point): number => {
    const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
    let angle = Math.abs((angle1 - angle2) * 180 / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return Math.round(angle);
  };

  const updateAngles = () => {
    const updatedAngles = angles.map(angle => {
      const [p1, p2, p3] = angle.pointIds.map(id => points.find(p => p.id === id)!);
      return {
        ...angle,
        value: calculateAngle(p1, p2, p3)
      };
    });
    setAngles(updatedAngles);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    // Desenhar imagem
    ctx.drawImage(image, 0, 0);

    // Desenhar linhas entre pontos de referência de ângulos
    angles.forEach(angle => {
      const [p1, p2, p3] = angle.pointIds.map(id => points.find(p => p.id === id)!);
      if (p1 && p2 && p3) {
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
        ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
        ctx.lineTo(p3.x * canvas.width, p3.y * canvas.height);
        ctx.stroke();

        // Desenhar arco do ângulo
        const radius = 40;
        const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
        const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
        
        ctx.beginPath();
        ctx.arc(
          p2.x * canvas.width,
          p2.y * canvas.height,
          radius,
          angle1,
          angle2,
          false
        );
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.9)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Desenhar valor do ângulo
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(
          `${angle.value}°`,
          p2.x * canvas.width + radius + 10,
          p2.y * canvas.height
        );
      }
    });

    // Desenhar pontos
    points.forEach(point => {
      const x = point.x * canvas.width;
      const y = point.y * canvas.height;

      // Círculo do ponto
      ctx.fillStyle = point.color;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fill();

      // Borda branca
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText(point.label, x + 12, y + 5);
      ctx.fillText(point.label, x + 12, y + 5);
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Encontrar ponto clicado
    const clickedPoint = points.find(p => {
      const dx = (p.x - x) * canvas.width;
      const dy = (p.y - y) * canvas.height;
      return Math.sqrt(dx * dx + dy * dy) < 15;
    });

    if (clickedPoint) {
      setDraggingPoint(clickedPoint.id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingPoint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    setPoints(points.map(p =>
      p.id === draggingPoint ? { ...p, x, y } : p
    ));
  };

  const handleMouseUp = () => {
    setDraggingPoint(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Move className="h-5 w-5" />
            Análise Dinâmica de Ângulos
          </span>
          <div className="flex gap-2">
            {!isInitialized ? (
              <Button onClick={initializePoints} size="sm">
                Inicializar Pontos
              </Button>
            ) : (
              <Button onClick={initializePoints} size="sm" variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative border rounded-lg overflow-hidden bg-black">
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Análise de ângulos"
            className="hidden"
            crossOrigin="anonymous"
            onLoad={drawCanvas}
          />
          <canvas
            ref={canvasRef}
            className="w-full h-auto cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        {isInitialized && (
          <div className="space-y-2">
            <h3 className="font-semibold">Ângulos Medidos:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {angles.map(angle => (
                <div
                  key={angle.id}
                  className="flex justify-between items-center p-3 bg-muted rounded-lg"
                >
                  <span className="text-sm font-medium">{angle.label}</span>
                  <span className="text-lg font-bold font-mono">{angle.value}°</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          💡 Arraste os pontos para ajustar as referências anatômicas e ver os ângulos atualizarem em tempo real.
        </p>
      </CardContent>
    </Card>
  );
};

export default DynamicAngleAnalysis;
