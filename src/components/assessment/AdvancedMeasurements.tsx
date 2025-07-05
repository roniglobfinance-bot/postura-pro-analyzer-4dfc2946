
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Ruler, Triangle, Move, RotateCcw, Save, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MeasurementPoint {
  x: number;
  y: number;
  id: string;
  label: string;
}

interface AngularMeasurement {
  id: string;
  type: 'cobb' | 'pelvic-tilt' | 'cervical' | 'thoracic' | 'lumbar';
  points: MeasurementPoint[];
  angle: number;
  classification: 'Normal' | 'Leve' | 'Moderado' | 'Grave';
  description: string;
}

interface LinearMeasurement {
  id: string;
  type: 'shoulder-height' | 'hip-height' | 'trunk-deviation' | 'head-position';
  points: MeasurementPoint[];
  distance: number;
  unit: 'cm' | 'mm' | 'px';
  classification: 'Normal' | 'Leve' | 'Moderado' | 'Grave';
  description: string;
}

interface AdvancedMeasurementsProps {
  imageUrl: string;
  clientHeight: number;
  onMeasurementsChange: (measurements: any) => void;
  existingMeasurements?: any;
}

const AdvancedMeasurements = ({ 
  imageUrl, 
  clientHeight, 
  onMeasurementsChange,
  existingMeasurements = {}
}: AdvancedMeasurementsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'select' | 'angular' | 'linear' | 'annotate'>('select');
  const [angularMeasurements, setAngularMeasurements] = useState<AngularMeasurement[]>(existingMeasurements.angular || []);
  const [linearMeasurements, setLinearMeasurements] = useState<LinearMeasurement[]>(existingMeasurements.linear || []);
  const [tempPoints, setTempPoints] = useState<MeasurementPoint[]>([]);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [selectedMeasurementType, setSelectedMeasurementType] = useState<string>('cobb');

  useEffect(() => {
    if (!canvasRef.current || !imageUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Ajustar canvas para a imagem
      const scale = Math.min(800 / img.width, 600 / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Desenhar medições existentes
      if (showAnnotations) {
        drawMeasurements(ctx);
      }
    };
    img.src = imageUrl;
  }, [imageUrl, angularMeasurements, linearMeasurements, showAnnotations]);

  const drawMeasurements = (ctx: CanvasRenderingContext2D) => {
    // Desenhar medições angulares
    angularMeasurements.forEach(measurement => {
      ctx.strokeStyle = getColorByClassification(measurement.classification);
      ctx.lineWidth = 2;
      
      if (measurement.points.length >= 3) {
        // Desenhar linhas do ângulo
        ctx.beginPath();
        ctx.moveTo(measurement.points[0].x, measurement.points[0].y);
        ctx.lineTo(measurement.points[1].x, measurement.points[1].y);
        ctx.lineTo(measurement.points[2].x, measurement.points[2].y);
        ctx.stroke();
        
        // Desenhar pontos
        measurement.points.forEach(point => {
          ctx.fillStyle = getColorByClassification(measurement.classification);
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
          ctx.fill();
        });
        
        // Mostrar ângulo
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.fillText(
          `${measurement.angle.toFixed(1)}°`,
          measurement.points[1].x + 10,
          measurement.points[1].y - 10
        );
      }
    });

    // Desenhar medições lineares
    linearMeasurements.forEach(measurement => {
      ctx.strokeStyle = getColorByClassification(measurement.classification);
      ctx.lineWidth = 2;
      
      if (measurement.points.length >= 2) {
        // Desenhar linha
        ctx.beginPath();
        ctx.moveTo(measurement.points[0].x, measurement.points[0].y);
        ctx.lineTo(measurement.points[1].x, measurement.points[1].y);
        ctx.stroke();
        
        // Desenhar pontos
        measurement.points.forEach(point => {
          ctx.fillStyle = getColorByClassification(measurement.classification);
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
          ctx.fill();
        });
        
        // Mostrar distância
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        const midX = (measurement.points[0].x + measurement.points[1].x) / 2;
        const midY = (measurement.points[0].y + measurement.points[1].y) / 2;
        ctx.fillText(
          `${measurement.distance.toFixed(1)}${measurement.unit}`,
          midX + 10,
          midY - 10
        );
      }
    });
  };

  const getColorByClassification = (classification: string) => {
    switch (classification) {
      case 'Normal': return '#10B981';
      case 'Leve': return '#F59E0B';
      case 'Moderado': return '#EF4444';
      case 'Grave': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newPoint: MeasurementPoint = {
      x,
      y,
      id: `point-${Date.now()}`,
      label: `Point ${tempPoints.length + 1}`
    };

    if (currentTool === 'angular') {
      const newPoints = [...tempPoints, newPoint];
      setTempPoints(newPoints);
      
      if (newPoints.length === 3) {
        // Calcular ângulo
        const angle = calculateAngle(newPoints[0], newPoints[1], newPoints[2]);
        const classification = classifyAngularMeasurement(selectedMeasurementType, angle);
        
        const newMeasurement: AngularMeasurement = {
          id: `angular-${Date.now()}`,
          type: selectedMeasurementType as any,
          points: newPoints,
          angle,
          classification,
          description: getAngularDescription(selectedMeasurementType, angle, classification)
        };
        
        setAngularMeasurements(prev => [...prev, newMeasurement]);
        setTempPoints([]);
        
        toast({
          title: "Medição Angular Adicionada",
          description: `Ângulo: ${angle.toFixed(1)}° - ${classification}`
        });
      }
    } else if (currentTool === 'linear') {
      const newPoints = [...tempPoints, newPoint];
      setTempPoints(newPoints);
      
      if (newPoints.length === 2) {
        // Calcular distância
        const distance = calculateDistance(newPoints[0], newPoints[1]);
        const classification = classifyLinearMeasurement(selectedMeasurementType, distance);
        
        const newMeasurement: LinearMeasurement = {
          id: `linear-${Date.now()}`,
          type: selectedMeasurementType as any,
          points: newPoints,
          distance,
          unit: 'px',
          classification,
          description: getLinearDescription(selectedMeasurementType, distance, classification)
        };
        
        setLinearMeasurements(prev => [...prev, newMeasurement]);
        setTempPoints([]);
        
        toast({
          title: "Medição Linear Adicionada",
          description: `Distância: ${distance.toFixed(1)}px - ${classification}`
        });
      }
    }
  };

  const calculateAngle = (p1: MeasurementPoint, p2: MeasurementPoint, p3: MeasurementPoint) => {
    const a = Math.sqrt(Math.pow(p2.x - p3.x, 2) + Math.pow(p2.y - p3.y, 2));
    const b = Math.sqrt(Math.pow(p1.x - p3.x, 2) + Math.pow(p1.y - p3.y, 2));
    const c = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    
    const angle = Math.acos((a * a + c * c - b * b) / (2 * a * c));
    return (angle * 180) / Math.PI;
  };

  const calculateDistance = (p1: MeasurementPoint, p2: MeasurementPoint) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const classifyAngularMeasurement = (type: string, angle: number) => {
    switch (type) {
      case 'cobb':
        if (angle < 10) return 'Normal';
        if (angle < 25) return 'Leve';
        if (angle < 45) return 'Moderado';
        return 'Grave';
      case 'thoracic':
        if (angle >= 20 && angle <= 40) return 'Normal';
        if (angle < 20 || (angle > 40 && angle <= 50)) return 'Leve';
        if (angle > 50 && angle <= 60) return 'Moderado';
        return 'Grave';
      case 'lumbar':
        if (angle >= 40 && angle <= 60) return 'Normal';
        if (angle < 40 || (angle > 60 && angle <= 70)) return 'Leve';
        if (angle > 70 && angle <= 80) return 'Moderado';
        return 'Grave';
      default:
        return 'Normal';
    }
  };

  const classifyLinearMeasurement = (type: string, distance: number) => {
    switch (type) {
      case 'shoulder-height':
      case 'hip-height':
        if (distance < 5) return 'Normal';
        if (distance < 10) return 'Leve';
        if (distance < 20) return 'Moderado';
        return 'Grave';
      default:
        return 'Normal';
    }
  };

  const getAngularDescription = (type: string, angle: number, classification: string) => {
    const descriptions = {
      cobb: `Ângulo de Cobb: ${angle.toFixed(1)}° - Escoliose ${classification}`,
      thoracic: `Cifose Torácica: ${angle.toFixed(1)}° - ${classification}`,
      lumbar: `Lordose Lombar: ${angle.toFixed(1)}° - ${classification}`,
      pelvic: `Inclinação Pélvica: ${angle.toFixed(1)}° - ${classification}`,
      cervical: `Curvatura Cervical: ${angle.toFixed(1)}° - ${classification}`
    };
    return descriptions[type as keyof typeof descriptions] || `Ângulo: ${angle.toFixed(1)}°`;
  };

  const getLinearDescription = (type: string, distance: number, classification: string) => {
    const descriptions = {
      'shoulder-height': `Desnível de Ombros: ${distance.toFixed(1)}px - ${classification}`,
      'hip-height': `Desnível de Quadris: ${distance.toFixed(1)}px - ${classification}`,
      'trunk-deviation': `Desvio do Tronco: ${distance.toFixed(1)}px - ${classification}`,
      'head-position': `Posição da Cabeça: ${distance.toFixed(1)}px - ${classification}`
    };
    return descriptions[type as keyof typeof descriptions] || `Distância: ${distance.toFixed(1)}px`;
  };

  const clearMeasurements = () => {
    setAngularMeasurements([]);
    setLinearMeasurements([]);
    setTempPoints([]);
    toast({
      title: "Medições Limpas",
      description: "Todas as medições foram removidas."
    });
  };

  const saveMeasurements = () => {
    const measurements = {
      angular: angularMeasurements,
      linear: linearMeasurements,
      timestamp: new Date().toISOString()
    };
    
    onMeasurementsChange(measurements);
    
    toast({
      title: "Medições Salvas",
      description: "Todas as medições foram salvas com sucesso."
    });
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ferramentas de Medição Avançada</span>
            <div className="flex space-x-2">
              <Button
                variant={showAnnotations ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAnnotations(!showAnnotations)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showAnnotations ? 'Ocultar' : 'Mostrar'}
              </Button>
              <Button variant="outline" size="sm" onClick={clearMeasurements}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
              <Button size="sm" onClick={saveMeasurements}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTool} onValueChange={(value) => setCurrentTool(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="select">Selecionar</TabsTrigger>
              <TabsTrigger value="angular">Angular</TabsTrigger>
              <TabsTrigger value="linear">Linear</TabsTrigger>
              <TabsTrigger value="annotate">Anotar</TabsTrigger>
            </TabsList>

            <TabsContent value="angular" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Medição Angular</Label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={selectedMeasurementType}
                    onChange={(e) => setSelectedMeasurementType(e.target.value)}
                  >
                    <option value="cobb">Ângulo de Cobb (Escoliose)</option>
                    <option value="thoracic">Cifose Torácica</option>
                    <option value="lumbar">Lordose Lombar</option>
                    <option value="pelvic">Inclinação Pélvica</option>
                    <option value="cervical">Curvatura Cervical</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <p className="text-sm text-gray-600">
                    Clique em 3 pontos para formar o ângulo
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="linear" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Medição Linear</Label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={selectedMeasurementType}
                    onChange={(e) => setSelectedMeasurementType(e.target.value)}
                  >
                    <option value="shoulder-height">Desnível de Ombros</option>
                    <option value="hip-height">Desnível de Quadris</option>
                    <option value="trunk-deviation">Desvio do Tronco</option>
                    <option value="head-position">Posição da Cabeça</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <p className="text-sm text-gray-600">
                    Clique em 2 pontos para medir a distância
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card>
        <CardContent className="p-4">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="border cursor-crosshair max-w-full"
            style={{ maxHeight: '600px' }}
          />
        </CardContent>
      </Card>

      {/* Resultados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medições Angulares */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Triangle className="h-5 w-5 mr-2" />
              Medições Angulares ({angularMeasurements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {angularMeasurements.map((measurement) => (
                <div key={measurement.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{measurement.angle.toFixed(1)}°</span>
                    <Badge style={{ backgroundColor: getColorByClassification(measurement.classification), color: 'white' }}>
                      {measurement.classification}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{measurement.description}</p>
                </div>
              ))}
              {angularMeasurements.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma medição angular realizada
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Medições Lineares */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Ruler className="h-5 w-5 mr-2" />
              Medições Lineares ({linearMeasurements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {linearMeasurements.map((measurement) => (
                <div key={measurement.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{measurement.distance.toFixed(1)}{measurement.unit}</span>
                    <Badge style={{ backgroundColor: getColorByClassification(measurement.classification), color: 'white' }}>
                      {measurement.classification}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{measurement.description}</p>
                </div>
              ))}
              {linearMeasurements.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma medição linear realizada
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedMeasurements;
