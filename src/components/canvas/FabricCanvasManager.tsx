
import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Line, Circle, Text, FabricImage } from 'fabric';
import { toast } from '@/hooks/use-toast';

interface FabricCanvasManagerProps {
  photo: {
    id: string;
    imageUrl: string;
    measurements: any[];
  };
  clientHeight: number;
  onMeasurementsChange: (measurements: any[]) => void;
}

const FabricCanvasManager = ({ photo, clientHeight, onMeasurementsChange }: FabricCanvasManagerProps) => {
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
    onMeasurementsChange(measurements);
  };

  return {
    canvasRef,
    calibrationPixelsPerCm,
    addHorizontalLine,
    addVerticalLine,
    addAngularLine,
    clearCanvas,
    saveMeasurements
  };
};

export default FabricCanvasManager;
