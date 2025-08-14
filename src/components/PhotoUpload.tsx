
import { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, X, RotateCcw, Zap, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PhotoUploadProps {
  onPhotoUpload: (imageUrl: string) => void;
  view: string;
}

const PhotoUpload = ({ onPhotoUpload, view }: PhotoUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const validateImage = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Use apenas arquivos JPEG, PNG ou WebP.",
        variant: "destructive"
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter menos de 10MB.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const processImage = useCallback(async (file: File) => {
    if (!validateImage(file)) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Enhanced image processing with quality checks
      const progressSteps = [
        { step: 'Validando imagem...', progress: 20 },
        { step: 'Verificando qualidade...', progress: 40 },
        { step: 'Otimizando resolução...', progress: 60 },
        { step: 'Aplicando correções...', progress: 80 },
        { step: 'Finalizando...', progress: 100 }
      ];

      for (const { step, progress } of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setUploadProgress(progress);
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        
        // Validate image quality
        const qualityCheck = await validateImageQuality(imageUrl);
        if (!qualityCheck.isValid) {
          toast({
            title: "Qualidade da imagem",
            description: qualityCheck.message,
            variant: "destructive"
          });
          setIsUploading(false);
          setUploadProgress(0);
          return;
        }

        setPreview(imageUrl);
        
        setTimeout(() => {
          onPhotoUpload(imageUrl);
          setIsUploading(false);
          setUploadProgress(0);
          toast({
            title: "Foto carregada!",
            description: `Foto da vista ${view} foi processada com sucesso.`,
          });
        }, 500);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: "Erro no upload",
        description: "Não foi possível processar a imagem.",
        variant: "destructive"
      });
    }
  }, [onPhotoUpload, view]);

  const validateImageQuality = async (imageUrl: string): Promise<{ isValid: boolean; message: string }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve({ isValid: false, message: 'Erro ao processar imagem' });
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Check resolution
        if (img.width < 400 || img.height < 400) {
          resolve({ 
            isValid: false, 
            message: 'Resolução muito baixa. Use uma imagem com pelo menos 400x400 pixels.' 
          });
          return;
        }

        // Check brightness (mock)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let brightness = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        brightness = brightness / (data.length / 4);

        if (brightness < 50) {
          resolve({ 
            isValid: false, 
            message: 'Imagem muito escura. Melhore a iluminação.' 
          });
          return;
        }

        if (brightness > 200) {
          resolve({ 
            isValid: false, 
            message: 'Imagem muito clara. Reduza a exposição.' 
          });
          return;
        }

        resolve({ isValid: true, message: 'Qualidade adequada' });
      };
      
      img.onerror = () => {
        resolve({ isValid: false, message: 'Erro ao carregar imagem' });
      };
      
      img.src = imageUrl;
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processImage(files[0]);
    }
  }, [processImage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      toast({
        title: "Erro na câmera",
        description: "Não foi possível acessar a câmera.",
        variant: "destructive"
      });
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    if (context) {
      context.drawImage(video, 0, 0);
      const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPreview(imageUrl);
      onPhotoUpload(imageUrl);
      stopCamera();
      
      toast({
        title: "Foto capturada!",
        description: "Foto salva com sucesso.",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const clearPreview = () => {
    setPreview(null);
  };

  const getViewGuidelines = () => {
    const guidelines = {
      'anterior': {
        icon: '🧍‍♂️',
        title: 'Vista Anterior',
        tips: [
          'Cliente de frente para a câmera',
          'Braços ao lado do corpo',
          'Pés paralelos, afastados na largura do quadril',
          'Fundo neutro sem distrações'
        ]
      },
      'posterior': {
        icon: '🚶‍♂️',
        title: 'Vista Posterior',
        tips: [
          'Cliente de costas para a câmera',
          'Mesma posição dos pés da vista anterior',
          'Verificar alinhamento da coluna',
          'Observar simetria dos ombros'
        ]
      },
      'lateral-direita': {
        icon: '🔄',
        title: 'Vista Lateral Direita',
        tips: [
          'Cliente com lado direito voltado para câmera',
          'Braços relaxados ao lado do corpo',
          'Observar curvaturas da coluna',
          'Verificar projeção da cabeça'
        ]
      },
      'lateral-esquerda': {
        icon: '🔄',
        title: 'Vista Lateral Esquerda',
        tips: [
          'Cliente com lado esquerdo voltado para câmera',
          'Manter mesma postura da vista direita',
          'Comparar simetrias entre os lados',
          'Anotar diferenças posturais'
        ]
      }
    };

    return guidelines[view as keyof typeof guidelines] || guidelines['anterior'];
  };

  const viewGuide = getViewGuidelines();

  if (isCameraActive) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Capturar Foto - {viewGuide.title}</h3>
              <Button variant="outline" onClick={stopCamera}>
                <X className="h-4 w-4 mr-2" />
                Fechar Câmera
              </Button>
            </div>
            
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <div className="flex justify-center">
              <Button onClick={capturePhoto} size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Camera className="h-5 w-5 mr-2" />
                Capturar Foto
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">{viewGuide.icon}</span>
              <h3 className="font-semibold text-blue-900">{viewGuide.title}</h3>
              <Badge variant="outline" className="ml-auto">Orientações</Badge>
            </div>
            <ul className="text-sm text-blue-800 space-y-1">
              {viewGuide.tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-3 w-3 mr-2 mt-0.5 text-blue-600" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Upload Area */}
          {!preview ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
            >
              {isUploading ? (
                <div className="space-y-4">
                  <Zap className="h-12 w-12 mx-auto text-blue-500 animate-pulse" />
                  <div>
                    <p className="text-lg font-medium">Processando imagem...</p>
                    <Progress value={uploadProgress} className="mt-2" />
                    <p className="text-sm text-gray-500 mt-1">{uploadProgress}%</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Adicionar foto da {viewGuide.title}
                    </p>
                    <p className="text-gray-600">
                      Arraste uma imagem ou clique para selecionar
                    </p>
                  </div>
                  
                  <div className="flex justify-center space-x-3">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Escolher Arquivo
                    </Button>
                    <Button onClick={startCamera} variant="outline">
                      <Camera className="h-4 w-4 mr-2" />
                      Usar Câmera
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Formatos: JPEG, PNG, WebP • Máximo: 10MB
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Preview da Imagem</h4>
                <Button variant="outline" size="sm" onClick={clearPreview}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Trocar Foto
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
              <div className="flex items-center justify-center">
                <Badge className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Foto carregada com sucesso
                </Badge>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoUpload;
