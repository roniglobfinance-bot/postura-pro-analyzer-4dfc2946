import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Ruler, Crosshair, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface Keypoint {
  name: string;
  x: number;
  y: number;
  confidence?: number;
}

interface AnalyticCanvasProps {
  imageUrl: string;
  keypoints: Keypoint[];
  showPlumbLine?: boolean;
  showJointMarkers?: boolean;
  showAngles?: boolean;
}

const AnalyticCanvas = ({ 
  imageUrl, 
  keypoints,
  showPlumbLine: initialShowPlumbLine = true,
  showJointMarkers: initialShowJointMarkers = true,
  showAngles: initialShowAngles = true
}: AnalyticCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [showPlumbLine, setShowPlumbLine] = useState(initialShowPlumbLine);
  const [showJointMarkers, setShowJointMarkers] = useState(initialShowJointMarkers);
  const [showAngles, setShowAngles] = useState(initialShowAngles);
  const [plumbLineX, setPlumbLineX] = useState(50); // percentage
  const [zoom, setZoom] = useState(1);
  const [angles, setAngles] = useState<{ name: string; value: number; points: string[] }[]>([]);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setImage(img);
    img.src = imageUrl;
  }, [imageUrl]);

  // Calculate angles from keypoints
  useEffect(() => {
    if (keypoints.length < 3) return;

    const findKeypoint = (name: string) => keypoints.find(kp => 
      kp.name.toLowerCase().includes(name.toLowerCase())
    );

    const calculateAngle = (p1: Keypoint, p2: Keypoint, p3: Keypoint) => {
      const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
      const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
      const dot = v1.x * v2.x + v1.y * v2.y;
      const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
      const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
      const angleRad = Math.acos(dot / (mag1 * mag2));
      return Math.round((angleRad * 180) / Math.PI);
    };

    const newAngles: { name: string; value: number; points: string[] }[] = [];

    // Head tilt angle
    const nose = findKeypoint('nose');
    const leftEar = findKeypoint('left_ear');
    const rightEar = findKeypoint('right_ear');
    if (nose && leftEar && rightEar) {
      const midEar = { name: 'mid_ear', x: (leftEar.x + rightEar.x) / 2, y: (leftEar.y + rightEar.y) / 2 };
      const vertical = { name: 'vertical', x: midEar.x, y: midEar.y - 50 };
      newAngles.push({
        name: 'Inclinação Cabeça',
        value: Math.abs(90 - calculateAngle(nose, midEar, vertical)),
        points: ['nose', 'mid_ear', 'vertical']
      });
    }

    // Shoulder alignment
    const leftShoulder = findKeypoint('left_shoulder');
    const rightShoulder = findKeypoint('right_shoulder');
    if (leftShoulder && rightShoulder) {
      const horizontalRef = { name: 'ref', x: rightShoulder.x + 50, y: rightShoulder.y };
      newAngles.push({
        name: 'Desnível Ombros',
        value: Math.abs(calculateAngle(leftShoulder, rightShoulder, horizontalRef)),
        points: ['left_shoulder', 'right_shoulder']
      });
    }

    // Hip alignment
    const leftHip = findKeypoint('left_hip');
    const rightHip = findKeypoint('right_hip');
    if (leftHip && rightHip) {
      const horizontalRef = { name: 'ref', x: rightHip.x + 50, y: rightHip.y };
      newAngles.push({
        name: 'Desnível Pelve',
        value: Math.abs(calculateAngle(leftHip, rightHip, horizontalRef)),
        points: ['left_hip', 'right_hip']
      });
    }

    // Knee angle (left)
    const leftKnee = findKeypoint('left_knee');
    const leftAnkle = findKeypoint('left_ankle');
    if (leftHip && leftKnee && leftAnkle) {
      newAngles.push({
        name: 'Ângulo Joelho E',
        value: calculateAngle(leftHip, leftKnee, leftAnkle),
        points: ['left_hip', 'left_knee', 'left_ankle']
      });
    }

    setAngles(newAngles);
  }, [keypoints]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !image) return;

    const container = containerRef.current;
    if (!container) return;

    // Set canvas size
    const containerWidth = container.clientWidth;
    const aspectRatio = image.height / image.width;
    canvas.width = containerWidth;
    canvas.height = containerWidth * aspectRatio;

    // Clear and draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.drawImage(image, 0, 0, canvas.width / zoom, canvas.height / zoom);
    ctx.restore();

    const scaleX = canvas.width / image.width;
    const scaleY = canvas.height / image.height;

    // Draw PlumbLine (vertical reference line)
    if (showPlumbLine) {
      const plumbX = (plumbLineX / 100) * canvas.width;
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)'; // Cyan
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.moveTo(plumbX, 0);
      ctx.lineTo(plumbX, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = 'rgba(0, 255, 255, 1)';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Linha de Prumo', plumbX + 5, 20);
    }

    // Draw Joint Markers
    if (showJointMarkers && keypoints.length > 0) {
      // Define marker colors by body region
      const getMarkerColor = (name: string) => {
        if (name.includes('shoulder') || name.includes('elbow') || name.includes('wrist')) {
          return 'rgba(255, 0, 255, 0.9)'; // Magenta - upper body
        }
        if (name.includes('hip') || name.includes('knee') || name.includes('ankle')) {
          return 'rgba(255, 165, 0, 0.9)'; // Orange - lower body
        }
        if (name.includes('ear') || name.includes('eye') || name.includes('nose')) {
          return 'rgba(0, 255, 0, 0.9)'; // Green - head
        }
        return 'rgba(255, 255, 0, 0.9)'; // Yellow - other
      };

      // Draw connections
      const connections = [
        ['left_shoulder', 'right_shoulder'],
        ['left_shoulder', 'left_elbow'],
        ['left_elbow', 'left_wrist'],
        ['right_shoulder', 'right_elbow'],
        ['right_elbow', 'right_wrist'],
        ['left_shoulder', 'left_hip'],
        ['right_shoulder', 'right_hip'],
        ['left_hip', 'right_hip'],
        ['left_hip', 'left_knee'],
        ['left_knee', 'left_ankle'],
        ['right_hip', 'right_knee'],
        ['right_knee', 'right_ankle'],
      ];

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;

      connections.forEach(([start, end]) => {
        const p1 = keypoints.find(kp => kp.name === start);
        const p2 = keypoints.find(kp => kp.name === end);
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x * scaleX, p1.y * scaleY);
          ctx.lineTo(p2.x * scaleX, p2.y * scaleY);
          ctx.stroke();
        }
      });

      // Draw keypoints
      keypoints.forEach((kp) => {
        const x = kp.x * scaleX;
        const y = kp.y * scaleY;
        const color = getMarkerColor(kp.name);

        // Outer circle
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Inner circle
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
      });
    }

    // Draw Angle Indicators
    if (showAngles && angles.length > 0) {
      angles.forEach((angle, index) => {
        // Find the center point for the angle display
        const relevantPoints = keypoints.filter(kp => 
          angle.points.some(p => kp.name.includes(p.replace('_', '')))
        );
        
        if (relevantPoints.length > 0) {
          const avgX = relevantPoints.reduce((sum, p) => sum + p.x, 0) / relevantPoints.length;
          const avgY = relevantPoints.reduce((sum, p) => sum + p.y, 0) / relevantPoints.length;
          
          const x = avgX * scaleX;
          const y = avgY * scaleY;

          // Draw angle arc (simplified)
          const getAngleColor = (value: number) => {
            if (value <= 5) return 'rgba(34, 197, 94, 0.9)'; // Green
            if (value <= 10) return 'rgba(234, 179, 8, 0.9)'; // Yellow
            return 'rgba(239, 68, 68, 0.9)'; // Red
          };

          // Draw angle box
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(x - 40, y - 25 + index * 30, 80, 20);
          ctx.fillStyle = getAngleColor(angle.value);
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${angle.name}: ${angle.value}°`, x, y - 10 + index * 30);
        }
      });
    }

  }, [image, keypoints, showPlumbLine, showJointMarkers, showAngles, plumbLineX, zoom, angles]);

  const resetView = () => {
    setZoom(1);
    setPlumbLineX(50);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Ruler className="h-5 w-5" />
          Analytic View - Overlays Vetoriais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Switch 
              id="plumb" 
              checked={showPlumbLine}
              onCheckedChange={setShowPlumbLine}
            />
            <Label htmlFor="plumb" className="text-sm">Linha de Prumo</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="joints" 
              checked={showJointMarkers}
              onCheckedChange={setShowJointMarkers}
            />
            <Label htmlFor="joints" className="text-sm">Marcadores</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="angles" 
              checked={showAngles}
              onCheckedChange={setShowAngles}
            />
            <Label htmlFor="angles" className="text-sm">Ângulos</Label>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={resetView}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Plumb Line Slider */}
        {showPlumbLine && (
          <div className="flex items-center gap-3">
            <Crosshair className="h-4 w-4 text-cyan-500" />
            <span className="text-sm min-w-[100px]">Posição Prumo:</span>
            <Slider
              value={[plumbLineX]}
              onValueChange={([value]) => setPlumbLineX(value)}
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-sm w-10 text-right">{plumbLineX}%</span>
          </div>
        )}

        {/* Canvas Container */}
        <div 
          ref={containerRef}
          className="relative rounded-lg overflow-hidden bg-muted border"
        >
          <canvas ref={canvasRef} className="w-full h-auto" />
        </div>

        {/* Angles Summary */}
        {showAngles && angles.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {angles.map((angle) => (
              <div 
                key={angle.name}
                className={`p-2 rounded text-center text-sm ${
                  angle.value <= 5 ? 'bg-green-100 text-green-800' :
                  angle.value <= 10 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}
              >
                <div className="font-medium">{angle.name}</div>
                <div className="text-lg font-bold">{angle.value}°</div>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs border-t pt-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-cyan-400" />
            <span>Linha de Prumo</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-fuchsia-500" />
            <span>Membros Superiores</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Membros Inferiores</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Cabeça</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticCanvas;
