
import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Line, Circle, Text, FabricImage } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Ruler, Minus, RotateCcw, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PhotoCanvasProps {
  photo: {
    id: string;
    imageUrl: string;
    measurements: any[];
  };
  clientHeight: number;
  onSaveMeasurements: (measurements: any[]) => void;
  showMeasurements: boolean;
}

const PhotoCanvas = ({ photo, clientHeight, onSaveMeasurements, showMeasurements }: PhotoCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [measurements, setMeasurements] = useState<any[]>(photo.measurements || []);
  const [calibrationPixelsPerCm, setCalibrationPixelsPerCm] = useState(1);

  useEffect(() => {
    if (!canvasRef.current || !photo.imageUrl) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      selection: true
    });

    // Load background image using Fabric.js v6 API
    FabricImage.fromURL(photo.imageUrl).then((img) => {
      const imgWidth = img.width || 800;
      const imgHeight = img.height || 600;
      
      // Calculate scale to fit in canvas
      const scale = Math.min(800 / imgWidth, 600 / imgHeight);
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;
      
      canvas.setDimensions({
        width: scaledWidth,
        height: scaledHeight
      });

      // Set as background image using v6 API
      img.scale(scale);
      canvas.backgroundImage = img;
      canvas.renderAll();

      // Auto calibration based on client height
      const estimatedPersonHeightInPixels = scaledHeight * 0.8;
      setCalibrationPixelsPerCm(estimatedPersonHeightInPixels / clientHeight);
    }).catch((error) => {
      console.error('Error loading image:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a imagem.",
        variant: "destructive"
      });
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [photo.imageUrl, clientHeight]);

  const addHorizontalLine = () => {
    if (!fabricCanvas) return;

    const line = new Line([100, 300, 300, 300], {
      stroke: '#ff0000',
      strokeWidth: 2,
      selectable: true,
      evented: true
    });

    const label = new Text('Linha Horizontal', {
      left: 100,
      top: 280,
      fontSize: 12,
      fill: '#ff0000',
      selectable: false
    });

    fabricCanvas.add(line);
    fabricCanvas.add(label);
    
    const measurement = {
      id: `horizontal-${Date.now()}`,
      type: 'horizontal',
      line: line,
      label: label
    };
    
    setMeasurements(prev => [...prev, measurement]);
  };

  const addVerticalLine = () => {
    if (!fabricCanvas) return;

    const line = new Line([400, 100, 400, 500], {
      stroke: '#00ff00',
      strokeWidth: 2,
      selectable: true,
      evented: true
    });

    const label = new Text('Linha Vertical', {
      left: 410,
      top: 300,
      fontSize: 12,
      fill: '#00ff00',
      selectable: false
    });

    fabricCanvas.add(line);
    fabricCanvas.add(label);
    
    const measurement = {
      id: `vertical-${Date.now()}`,
      type: 'vertical',
      line: line,
      label: label
    };
    
    setMeasurements(prev => [...prev, measurement]);
  };

  const addAngularLine = () => {
    if (!fabricCanvas) return;

    const line1 = new Line([200, 200, 300, 300], {
      stroke: '#0000ff',
      strokeWidth: 2,
      selectable: true,
      evented: true
    });

    const line2 = new Line([300, 300, 400, 200], {
      stroke: '#0000ff',
      strokeWidth: 2,
      selectable: true,
      evented: true
    });

    const point = new Circle({
      left: 295,
      top: 295,
      radius: 3,
      fill: '#0000ff',
      selectable: false
    });

    const label = new Text('Ângulo', {
      left: 310,
      top: 280,
      fontSize: 12,
      fill: '#0000ff',
      selectable: false
    });

    fabricCanvas.add(line1);
    fabricCanvas.add(line2);
    fabricCanvas.add(point);
    fabricCanvas.add(label);
    
    const measurement = {
      id: `angular-${Date.now()}`,
      type: 'angular',
      line1: line1,
      line2: line2,
      point: point,
      label: label
    };
    
    setMeasurements(prev => [...prev, measurement]);
  };

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    
    fabricCanvas.getObjects().forEach(obj => {
      if (obj !== fabricCanvas.backgroundImage) {
        fabricCanvas.remove(obj);
      }
    });
    
    setMeasurements([]);
    fabricCanvas.renderAll();
  };

  const saveMeasurements = () => {
    onSaveMeasurements(measurements);
  };

  if (!showMeasurements) {
    return (
      <div className="text-center p-8">
        <img 
          src={photo.imageUrl} 
          alt="Foto postural" 
          className="max-w-full h-auto mx-auto rounded-lg shadow-md"
          style={{ maxHeight: '600px' }}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={addHorizontalLine}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <Minus className="h-4 w-4 mr-2" />
              Linha Horizontal
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={addVerticalLine}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <Minus className="h-4 w-4 mr-2 rotate-90" />
              Linha Vertical
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={addAngularLine}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <Ruler className="h-4 w-4 mr-2" />
              Medição Angular
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCanvas}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpar
            </Button>
            <Button
              size="sm"
              onClick={saveMeasurements}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Medições
            </Button>
          </div>
          
          <div className="border rounded-lg overflow-hidden bg-white">
            <canvas ref={canvasRef} className="max-w-full" />
          </div>
          
          <div className="text-sm text-gray-600 text-center">
            <p>Clique e arraste para mover as linhas. Use as ferramentas acima para adicionar medições.</p>
            <p>Calibração: {calibrationPixelsPerCm.toFixed(2)} pixels/cm (baseado na altura informada)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoCanvas;
