import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Eye, EyeOff } from 'lucide-react';

interface XRayVisualizationProps {
  imageUrl: string;
}

const XRayVisualization = ({ imageUrl }: XRayVisualizationProps) => {
  const [xrayMode, setXrayMode] = useState(false);
  const [intensity, setIntensity] = useState([50]);
  const [contrast, setContrast] = useState([100]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (xrayMode) {
      applyXRayEffect();
    }
  }, [xrayMode, intensity, contrast]);

  const applyXRayEffect = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    // Desenhar imagem original
    ctx.drawImage(image, 0, 0);

    // Obter dados da imagem
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Aplicar efeito raio-X
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Converter para escala de cinza
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;

      // Inverter cores (efeito negativo)
      const inverted = 255 - gray;

      // Aplicar intensidade
      const intensityFactor = intensity[0] / 50;
      const final = inverted * intensityFactor;

      // Aplicar contraste
      const contrastFactor = contrast[0] / 100;
      const contrasted = ((final - 128) * contrastFactor) + 128;

      // Adicionar tom azulado característico de raio-X
      data[i] = Math.max(0, Math.min(255, contrasted * 0.8));     // R
      data[i + 1] = Math.max(0, Math.min(255, contrasted * 0.9)); // G
      data[i + 2] = Math.max(0, Math.min(255, contrasted));       // B
    }

    // Aplicar edge detection para destacar ossos
    const edgeData = detectEdges(imageData);
    
    // Combinar com efeito raio-X
    for (let i = 0; i < data.length; i += 4) {
      const edgeStrength = edgeData.data[i] / 255;
      data[i] = Math.min(255, data[i] + (edgeStrength * 100));
      data[i + 1] = Math.min(255, data[i + 1] + (edgeStrength * 100));
      data[i + 2] = Math.min(255, data[i + 2] + (edgeStrength * 120));
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const detectEdges = (imageData: ImageData): ImageData => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const edgeData = new ImageData(width, height);

    // Sobel operator
    const sobelX = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
    ];
    const sobelY = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1]
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const gray = data[idx];
            gx += gray * sobelX[ky + 1][kx + 1];
            gy += gray * sobelY[ky + 1][kx + 1];
          }
        }

        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const idx = (y * width + x) * 4;
        edgeData.data[idx] = magnitude;
        edgeData.data[idx + 1] = magnitude;
        edgeData.data[idx + 2] = magnitude;
        edgeData.data[idx + 3] = 255;
      }
    }

    return edgeData;
  };

  const toggleXRayMode = () => {
    const newMode = !xrayMode;
    setXrayMode(newMode);

    if (!newMode) {
      // Restaurar imagem original
      const canvas = canvasRef.current;
      const image = imageRef.current;
      if (canvas && image) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          ctx.drawImage(image, 0, 0);
        }
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {xrayMode ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
          Visualização Raio-X
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative border rounded-lg overflow-hidden bg-black">
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Visualização"
            className="hidden"
            crossOrigin="anonymous"
            onLoad={() => {
              const canvas = canvasRef.current;
              const image = imageRef.current;
              if (canvas && image) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  canvas.width = image.naturalWidth;
                  canvas.height = image.naturalHeight;
                  ctx.drawImage(image, 0, 0);
                }
              }
            }}
          />
          <canvas
            ref={canvasRef}
            className="w-full h-auto"
          />
        </div>

        <Button
          onClick={toggleXRayMode}
          variant={xrayMode ? "default" : "outline"}
          className="w-full"
        >
          {xrayMode ? (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Modo Raio-X Ativo
            </>
          ) : (
            <>
              <EyeOff className="mr-2 h-4 w-4" />
              Ativar Modo Raio-X
            </>
          )}
        </Button>

        {xrayMode && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Intensidade: {intensity[0]}%
              </label>
              <Slider
                value={intensity}
                onValueChange={setIntensity}
                min={0}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Contraste: {contrast[0]}%
              </label>
              <Slider
                value={contrast}
                onValueChange={setContrast}
                min={50}
                max={200}
                step={5}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default XRayVisualization;
