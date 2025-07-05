
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Pencil, Type, ArrowRight, Circle, Square, Ruler, Trash2, Save, Undo } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Annotation {
  id: string;
  type: 'line' | 'arrow' | 'circle' | 'rectangle' | 'text' | 'angle';
  points: number[];
  text?: string;
  color: string;
  timestamp: string;
}

interface ImageAnnotationToolsProps {
  imageUrl: string;
  onAnnotationsChange: (annotations: Annotation[]) => void;
  existingAnnotations?: Annotation[];
}

const ImageAnnotationTools = ({ imageUrl, onAnnotationsChange, existingAnnotations = [] }: ImageAnnotationToolsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>(existingAnnotations);
  const [activeTool, setActiveTool] = useState<string>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Partial<Annotation> | null>(null);
  const [selectedColor, setSelectedColor] = useState('#ff0000');

  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

  useEffect(() => {
    loadImage();
  }, [imageUrl]);

  useEffect(() => {
    drawAnnotations();
  }, [annotations]);

  const loadImage = () => {
    if (!canvasRef.current || !imageUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = Math.min(img.width, 800);
      canvas.height = (img.height * canvas.width) / img.width;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawAnnotations();
    };
    img.src = imageUrl;
    imageRef.current = img;
  };

  const drawAnnotations = () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Redraw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

    // Draw annotations
    annotations.forEach(annotation => {
      ctx.strokeStyle = annotation.color;
      ctx.fillStyle = annotation.color;
      ctx.lineWidth = 2;

      switch (annotation.type) {
        case 'line':
          ctx.beginPath();
          ctx.moveTo(annotation.points[0], annotation.points[1]);
          ctx.lineTo(annotation.points[2], annotation.points[3]);
          ctx.stroke();
          break;

        case 'arrow':
          drawArrow(ctx, annotation.points[0], annotation.points[1], annotation.points[2], annotation.points[3]);
          break;

        case 'circle':
          const radius = Math.sqrt(
            Math.pow(annotation.points[2] - annotation.points[0], 2) +
            Math.pow(annotation.points[3] - annotation.points[1], 2)
          );
          ctx.beginPath();
          ctx.arc(annotation.points[0], annotation.points[1], radius, 0, 2 * Math.PI);
          ctx.stroke();
          break;

        case 'rectangle':
          const width = annotation.points[2] - annotation.points[0];
          const height = annotation.points[3] - annotation.points[1];
          ctx.strokeRect(annotation.points[0], annotation.points[1], width, height);
          break;

        case 'text':
          ctx.font = '16px Arial';
          ctx.fillText(annotation.text || '', annotation.points[0], annotation.points[1]);
          break;

        case 'angle':
          drawAngle(ctx, annotation.points);
          break;
      }
    });
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    const headlen = 10;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  const drawAngle = (ctx: CanvasRenderingContext2D, points: number[]) => {
    if (points.length < 6) return;

    const [x1, y1, x2, y2, x3, y3] = points;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.stroke();

    // Draw angle arc
    const angle1 = Math.atan2(y1 - y2, x1 - x2);
    const angle2 = Math.atan2(y3 - y2, x3 - x2);
    const radius = 30;

    ctx.beginPath();
    ctx.arc(x2, y2, radius, angle1, angle2);
    ctx.stroke();

    // Calculate and display angle
    const angleDegrees = Math.abs((angle2 - angle1) * 180 / Math.PI);
    ctx.font = '12px Arial';
    ctx.fillText(`${angleDegrees.toFixed(1)}°`, x2 + 35, y2 - 5);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'select') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCurrentAnnotation({
      id: `annotation-${Date.now()}`,
      type: activeTool as any,
      points: [x, y],
      color: selectedColor,
      timestamp: new Date().toISOString()
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !currentAnnotation) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const updatedAnnotation = {
      ...currentAnnotation,
      points: [...currentAnnotation.points!.slice(0, 2), x, y]
    };

    setCurrentAnnotation(updatedAnnotation);

    // Redraw with current annotation
    drawAnnotations();
    const ctx = canvas.getContext('2d');
    if (ctx && updatedAnnotation.points && updatedAnnotation.points.length >= 4) {
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = 2;
      
      switch (activeTool) {
        case 'line':
          ctx.beginPath();
          ctx.moveTo(updatedAnnotation.points[0], updatedAnnotation.points[1]);
          ctx.lineTo(updatedAnnotation.points[2], updatedAnnotation.points[3]);
          ctx.stroke();
          break;
        case 'rectangle':
          const width = updatedAnnotation.points[2] - updatedAnnotation.points[0];
          const height = updatedAnnotation.points[3] - updatedAnnotation.points[1];
          ctx.strokeRect(updatedAnnotation.points[0], updatedAnnotation.points[1], width, height);
          break;
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentAnnotation) return;

    if (currentAnnotation.points && currentAnnotation.points.length >= 4) {
      const newAnnotations = [...annotations, currentAnnotation as Annotation];
      setAnnotations(newAnnotations);
      onAnnotationsChange(newAnnotations);
      
      toast({
        title: "Anotação adicionada",
        description: "A anotação foi salva com sucesso.",
      });
    }

    setIsDrawing(false);
    setCurrentAnnotation(null);
  };

  const clearAnnotations = () => {
    setAnnotations([]);
    onAnnotationsChange([]);
    drawAnnotations();
    
    toast({
      title: "Anotações removidas",
      description: "Todas as anotações foram removidas.",
    });
  };

  const saveAnnotations = () => {
    localStorage.setItem('imageAnnotations', JSON.stringify(annotations));
    
    toast({
      title: "Anotações salvas",
      description: "As anotações foram salvas com sucesso.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Pencil className="h-5 w-5 mr-2" />
          Ferramentas de Anotação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tools */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTool === 'select' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool('select')}
          >
            Selecionar
          </Button>
          <Button
            variant={activeTool === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool('line')}
          >
            <Ruler className="h-4 w-4 mr-1" />
            Linha
          </Button>
          <Button
            variant={activeTool === 'arrow' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool('arrow')}
          >
            <ArrowRight className="h-4 w-4 mr-1" />
            Seta
          </Button>
          <Button
            variant={activeTool === 'circle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool('circle')}
          >
            <Circle className="h-4 w-4 mr-1" />
            Círculo
          </Button>
          <Button
            variant={activeTool === 'rectangle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool('rectangle')}
          >
            <Square className="h-4 w-4 mr-1" />
            Retângulo
          </Button>
          <Button
            variant={activeTool === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool('text')}
          >
            <Type className="h-4 w-4 mr-1" />
            Texto
          </Button>
          <Button
            variant={activeTool === 'angle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool('angle')}
          >
            Ângulo
          </Button>
        </div>

        {/* Colors */}
        <div className="flex gap-2">
          {colors.map(color => (
            <button
              key={color}
              className={`w-6 h-6 rounded border-2 ${selectedColor === color ? 'border-gray-800' : 'border-gray-300'}`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={saveAnnotations}>
            <Save className="h-4 w-4 mr-1" />
            Salvar
          </Button>
          <Button variant="outline" size="sm" onClick={clearAnnotations}>
            <Trash2 className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        </div>

        <Separator />

        {/* Canvas */}
        <div className="border rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="max-w-full cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
        </div>

        {/* Annotations List */}
        {annotations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Anotações ({annotations.length})</h4>
            <div className="flex flex-wrap gap-1">
              {annotations.map((annotation, index) => (
                <Badge key={annotation.id} variant="secondary">
                  {annotation.type} {index + 1}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageAnnotationTools;
