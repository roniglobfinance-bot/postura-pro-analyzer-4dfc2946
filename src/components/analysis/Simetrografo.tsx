import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Grid3x3, Ruler, RotateCw, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { useAssessment, AnatomicalPoint } from '@/contexts/AssessmentContext';
import gridImage from '@/assets/simetrografo-grid.png';

interface SimetrografoProps {
  imageUrl: string;
  view: 'anterior' | 'posterior' | 'lateralDireita' | 'lateralEsquerda';
}

const Simetrografo = ({ imageUrl, view }: SimetrografoProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gridOpacity, setGridOpacity] = useState(0.5);
  const [plumbLineVisible, setPlumbLineVisible] = useState(true);
  const [plumbLineX, setPlumbLineX] = useState(50); // Porcentagem
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [anatomicalMarkers, setAnatomicalMarkers] = useState<AnatomicalPoint[]>([]);
  const [isMarking, setIsMarking] = useState(false);
  const [currentMarkerType, setCurrentMarkerType] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<any[]>([]);
  
  const { addAnatomicalPoints, addMeasurement } = useAssessment();

  // Pontos anatômicos padrão para marcar
  const defaultMarkers = {
    anterior: [
      'Topo da Cabeça', 'Acrômio D', 'Acrômio E', 'EIAS D', 'EIAS E',
      'Patela D', 'Patela E', 'Maléolo Lateral D', 'Maléolo Lateral E'
    ],
    posterior: [
      'Topo da Cabeça', 'Acrômio D', 'Acrômio E', 'EIPS D', 'EIPS E',
      'Prega Glútea D', 'Prega Glútea E', 'Calcâneo D', 'Calcâneo E'
    ],
    lateralDireita: [
      'Meato Auditivo', 'Acrômio', 'Trocânter Maior', 'Linha Articular Joelho', 'Maléolo Lateral'
    ],
    lateralEsquerda: [
      'Meato Auditivo', 'Acrômio', 'Trocânter Maior', 'Linha Articular Joelho', 'Maléolo Lateral'
    ]
  };

  useEffect(() => {
    drawCanvas();
  }, [imageUrl, gridOpacity, plumbLineVisible, plumbLineX, zoom, pan, anatomicalMarkers]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Aplicar transformações
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Desenhar imagem do paciente
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Desenhar grade simetrográfica
      if (gridOpacity > 0) {
        const gridImg = new Image();
        gridImg.src = gridImage;
        gridImg.onload = () => {
          ctx.globalAlpha = gridOpacity;
          ctx.drawImage(gridImg, 0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = 1;

          // Desenhar fio de prumo
          if (plumbLineVisible) {
            const x = (plumbLineX / 100) * canvas.width;
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Desenhar marcadores anatômicos
          anatomicalMarkers.forEach((marker) => {
            ctx.fillStyle = marker.type === 'landmark' ? '#ff0000' : '#00ff00';
            ctx.beginPath();
            ctx.arc(marker.x * canvas.width, marker.y * canvas.height, 6, 0, 2 * Math.PI);
            ctx.fill();
            
            // Label
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.font = '12px sans-serif';
            const textX = marker.x * canvas.width + 10;
            const textY = marker.y * canvas.height - 10;
            ctx.strokeText(marker.name, textX, textY);
            ctx.fillText(marker.name, textX, textY);
          });

          ctx.restore();
        };
      }
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMarking || !currentMarkerType) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const newMarker: AnatomicalPoint = {
      id: `marker-${Date.now()}`,
      name: currentMarkerType,
      x,
      y,
      type: 'landmark'
    };

    setAnatomicalMarkers(prev => [...prev, newMarker]);
    setIsMarking(false);
    setCurrentMarkerType(null);

    // Calcular medições automaticamente
    calculateMeasurements([...anatomicalMarkers, newMarker]);
  };

  const calculateMeasurements = (markers: AnatomicalPoint[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newMeasurements: any[] = [];

    // Exemplo: Distância entre ombros
    const acromioDireito = markers.find(m => m.name === 'Acrômio D');
    const acromioEsquerdo = markers.find(m => m.name === 'Acrômio E');

    if (acromioDireito && acromioEsquerdo) {
      const dx = (acromioDireito.x - acromioEsquerdo.x) * canvas.width;
      const dy = (acromioDireito.y - acromioEsquerdo.y) * canvas.height;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      newMeasurements.push({
        id: `meas-${Date.now()}`,
        name: 'Distância Interacromial',
        value: distance,
        unit: 'px',
        reference: view,
        deviation: 0
      });

      // Calcular desníveis
      const desnivel = Math.abs(acromioDireito.y - acromioEsquerdo.y) * canvas.height;
      if (desnivel > 10) {
        newMeasurements.push({
          id: `meas-${Date.now()}-1`,
          name: 'Desnível de Ombros',
          value: desnivel,
          unit: 'px',
          reference: view,
          deviation: desnivel
        });
      }
    }

    setMeasurements(newMeasurements);
    
    // Salvar no contexto global
    newMeasurements.forEach(m => addMeasurement(m));
  };

  const handleSave = () => {
    addAnatomicalPoints(view, anatomicalMarkers);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3x3 className="h-5 w-5" />
          Simetrógrafo Virtual - {view}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Opacidade da Grade</Label>
            <Slider
              value={[gridOpacity * 100]}
              onValueChange={(v) => setGridOpacity(v[0] / 100)}
              max={100}
              step={1}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Posição Fio de Prumo</Label>
            <Slider
              value={[plumbLineX]}
              onValueChange={(v) => setPlumbLineX(v[0])}
              max={100}
              step={1}
              disabled={!plumbLineVisible}
            />
          </div>

          <div className="space-y-2">
            <Label>Zoom</Label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ações</Label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={plumbLineVisible ? "default" : "outline"}
                onClick={() => setPlumbLineVisible(!plumbLineVisible)}
              >
                <Ruler className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSave}
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="relative border rounded-lg overflow-hidden bg-muted">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full cursor-crosshair"
            onClick={handleCanvasClick}
          />
        </div>

        {/* Marcadores Anatômicos */}
        <div className="space-y-2">
          <Label>Marcar Pontos Anatômicos</Label>
          <div className="flex flex-wrap gap-2">
            {defaultMarkers[view]?.map((marker) => (
              <Button
                key={marker}
                size="sm"
                variant={currentMarkerType === marker ? "default" : "outline"}
                onClick={() => {
                  setIsMarking(true);
                  setCurrentMarkerType(marker);
                }}
              >
                {marker}
              </Button>
            ))}
          </div>
        </div>

        {/* Medições Calculadas */}
        {measurements.length > 0 && (
          <div className="space-y-2">
            <Label>Medições Automáticas</Label>
            <div className="space-y-2">
              {measurements.map((meas) => (
                <div key={meas.id} className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm font-medium">{meas.name}</span>
                  <Badge variant={meas.deviation > 0 ? "destructive" : "secondary"}>
                    {meas.value.toFixed(1)} {meas.unit}
                    {meas.deviation > 0 && ` (⚠ ${meas.deviation.toFixed(1)})`}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Marcadores */}
        {anatomicalMarkers.length > 0 && (
          <div className="space-y-2">
            <Label>Pontos Marcados ({anatomicalMarkers.length})</Label>
            <div className="flex flex-wrap gap-2">
              {anatomicalMarkers.map((marker) => (
                <Badge key={marker.id} variant="outline">
                  {marker.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Simetrografo;
