import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  Upload, 
  Check, 
  X, 
  AlertCircle,
  RefreshCw,
  User,
  ArrowRight
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PhotoSlot {
  id: 'front' | 'back' | 'rightProfile' | 'leftProfile';
  label: string;
  labelPt: string;
  imageUrl: string | null;
  status: 'empty' | 'uploading' | 'uploaded' | 'error';
  file: File | null;
}

interface SmartPhotoCollectorProps {
  onPhotosComplete: (photos: Record<string, string>) => void;
  onPhotoUpload?: (view: string, imageUrl: string) => void;
  clientHeight?: number;
}

const SmartPhotoCollector = ({ onPhotosComplete, onPhotoUpload, clientHeight }: SmartPhotoCollectorProps) => {
  const [photos, setPhotos] = useState<PhotoSlot[]>([
    { id: 'front', label: 'Front View', labelPt: 'Vista Frontal', imageUrl: null, status: 'empty', file: null },
    { id: 'back', label: 'Back View', labelPt: 'Vista Posterior', imageUrl: null, status: 'empty', file: null },
    { id: 'rightProfile', label: 'Right Profile', labelPt: 'Perfil Direito', imageUrl: null, status: 'empty', file: null },
    { id: 'leftProfile', label: 'Left Profile', labelPt: 'Perfil Esquerdo', imageUrl: null, status: 'empty', file: null },
  ]);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const completedCount = photos.filter(p => p.status === 'uploaded').length;
  const progress = (completedCount / 4) * 100;
  const allComplete = completedCount === 4;

  const compressImage = async (file: File, maxWidth = 1920, quality = 0.85): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = useCallback(async (slotId: string, file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione uma imagem (JPG, PNG, etc.)',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 20MB before compression)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 20MB',
        variant: 'destructive'
      });
      return;
    }

    // Update status to uploading
    setPhotos(prev => prev.map(p => 
      p.id === slotId ? { ...p, status: 'uploading' as const } : p
    ));

    try {
      // Compress the image
      const compressedFile = await compressImage(file);
      const imageUrl = URL.createObjectURL(compressedFile);

      // Update the photo slot
      setPhotos(prev => prev.map(p => 
        p.id === slotId ? { 
          ...p, 
          status: 'uploaded' as const, 
          imageUrl, 
          file: compressedFile 
        } : p
      ));

      // Notify parent
      if (onPhotoUpload) {
        onPhotoUpload(slotId, imageUrl);
      }

      toast({
        title: 'Foto carregada',
        description: `${photos.find(p => p.id === slotId)?.labelPt} capturada com sucesso`
      });
    } catch (error) {
      console.error('Error processing image:', error);
      setPhotos(prev => prev.map(p => 
        p.id === slotId ? { ...p, status: 'error' as const } : p
      ));
      toast({
        title: 'Erro',
        description: 'Falha ao processar a imagem',
        variant: 'destructive'
      });
    }
  }, [photos, onPhotoUpload]);

  const handleSlotClick = (slotId: string) => {
    setActiveSlot(slotId);
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeSlot) {
      handleFileSelect(activeSlot, file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (slotId: string) => {
    setPhotos(prev => prev.map(p => 
      p.id === slotId ? { 
        ...p, 
        status: 'empty' as const, 
        imageUrl: null, 
        file: null 
      } : p
    ));
  };

  const handleSubmitAll = async () => {
    if (!allComplete) return;

    setIsProcessing(true);
    
    try {
      const photoMap: Record<string, string> = {};
      photos.forEach(p => {
        if (p.imageUrl) {
          photoMap[p.id] = p.imageUrl;
        }
      });

      onPhotosComplete(photoMap);

      toast({
        title: 'Fotos enviadas!',
        description: 'Todas as 4 fotos foram processadas. Iniciando análise...'
      });
    } catch (error) {
      console.error('Error submitting photos:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao enviar as fotos',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getSilhouetteSVG = (viewId: string) => {
    // SVG silhouettes for each view
    switch (viewId) {
      case 'front':
        return (
          <svg viewBox="0 0 100 200" className="w-full h-full opacity-30">
            {/* Head */}
            <circle cx="50" cy="25" r="15" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4"/>
            {/* Neck */}
            <line x1="50" y1="40" x2="50" y2="50" stroke="currentColor" strokeWidth="1" strokeDasharray="4"/>
            {/* Shoulders */}
            <line x1="25" y1="55" x2="75" y2="55" stroke="currentColor" strokeWidth="1" strokeDasharray="4"/>
            {/* Torso */}
            <rect x="30" y="55" width="40" height="60" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4" rx="5"/>
            {/* Arms */}
            <line x1="25" y1="55" x2="15" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="4"/>
            <line x1="75" y1="55" x2="85" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="4"/>
            {/* Legs */}
            <line x1="40" y1="115" x2="35" y2="180" stroke="currentColor" strokeWidth="1" strokeDasharray="4"/>
            <line x1="60" y1="115" x2="65" y2="180" stroke="currentColor" strokeWidth="1" strokeDasharray="4"/>
            {/* Center line */}
            <line x1="50" y1="10" x2="50" y2="195" stroke="hsl(var(--primary))" strokeWidth="0.5" strokeDasharray="2"/>
          </svg>
        );
      case 'back':
        return (
          <svg viewBox="0 0 100 200" className="w-full h-full opacity-30">
            <circle cx="50" cy="25" r="15" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4"/>
            <line x1="50" y1="40" x2="50" y2="50" stroke="currentColor" strokeWidth="1" strokeDasharray="4"/>
            <line x1="25" y1="55" x2="75" y2="55" stroke="currentColor" strokeWidth="1" strokeDasharray="4"/>
            <rect x="30" y="55" width="40" height="60" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4" rx="5"/>
            {/* Spine */}
            <line x1="50" y1="50" x2="50" y2="115" stroke="hsl(var(--destructive))" strokeWidth="1" strokeDasharray="3"/>
            <line x1="25" y1="55" x2="15" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="4"/>
            <line x1="75" y1="55" x2="85" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="4"/>
            <line x1="40" y1="115" x2="35" y2="180" stroke="currentColor" strokeWidth="1" strokeDasharray="4"/>
            <line x1="60" y1="115" x2="65" y2="180" stroke="currentColor" strokeWidth="1" strokeDasharray="4"/>
            <line x1="50" y1="10" x2="50" y2="195" stroke="hsl(var(--primary))" strokeWidth="0.5" strokeDasharray="2"/>
          </svg>
        );
      case 'rightProfile':
      case 'leftProfile':
        return (
          <svg viewBox="0 0 100 200" className="w-full h-full opacity-30">
            {/* Head */}
            <ellipse cx="50" cy="25" rx="12" ry="15" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4"/>
            {/* Neck */}
            <line x1="50" y1="40" x2="50" y2="50" stroke="currentColor" strokeWidth="1" strokeDasharray="4"/>
            {/* Torso */}
            <ellipse cx="50" cy="85" rx="15" ry="35" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4"/>
            {/* Arm */}
            <line x1="50" y1="55" x2="45" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="4"/>
            {/* Legs */}
            <line x1="50" y1="120" x2="50" y2="180" stroke="currentColor" strokeWidth="1" strokeDasharray="4"/>
            {/* Plumb line */}
            <line x1="50" y1="10" x2="50" y2="195" stroke="hsl(var(--primary))" strokeWidth="0.5" strokeDasharray="2"/>
            {/* Ear-shoulder-hip alignment */}
            <circle cx="55" cy="25" r="2" fill="hsl(var(--primary))" opacity="0.5"/>
            <circle cx="50" cy="55" r="2" fill="hsl(var(--primary))" opacity="0.5"/>
            <circle cx="50" cy="85" r="2" fill="hsl(var(--primary))" opacity="0.5"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Coleta Inteligente de Fotos
        </CardTitle>
        <CardDescription>
          Capture as 4 fotos obrigatórias para análise postural completa. 
          Alinhe o corpo com as guias de silhueta para melhor precisão.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso da Captura</span>
            <span className="font-medium">{completedCount}/4 fotos</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="space-y-2">
              <div 
                className={`
                  relative aspect-[3/4] rounded-lg border-2 border-dashed cursor-pointer
                  transition-all duration-200 overflow-hidden
                  ${photo.status === 'empty' ? 'border-muted-foreground/30 hover:border-primary/50 bg-muted/20' : ''}
                  ${photo.status === 'uploading' ? 'border-primary/50 bg-primary/5' : ''}
                  ${photo.status === 'uploaded' ? 'border-green-500/50 bg-green-500/5' : ''}
                  ${photo.status === 'error' ? 'border-destructive/50 bg-destructive/5' : ''}
                `}
                onClick={() => photo.status !== 'uploading' && handleSlotClick(photo.id)}
              >
                {/* Silhouette Guide */}
                {photo.status === 'empty' && (
                  <div className="absolute inset-0 p-4 flex items-center justify-center text-muted-foreground">
                    {getSilhouetteSVG(photo.id)}
                  </div>
                )}

                {/* Uploaded Image */}
                {photo.imageUrl && (
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.labelPt}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {/* Status Overlay */}
                {photo.status === 'uploading' && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}

                {/* Remove Button */}
                {photo.status === 'uploaded' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto(photo.id);
                    }}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {/* Upload Icon */}
                {photo.status === 'empty' && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    <div className="bg-background/80 p-2 rounded-full">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  {photo.status === 'uploaded' && (
                    <Badge className="bg-green-500">
                      <Check className="h-3 w-3 mr-1" />
                      OK
                    </Badge>
                  )}
                  {photo.status === 'error' && (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Erro
                    </Badge>
                  )}
                </div>
              </div>

              {/* Label */}
              <p className="text-sm text-center font-medium">{photo.labelPt}</p>
            </div>
          ))}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
        />

        {/* Instructions */}
        <Alert>
          <User className="h-4 w-4" />
          <AlertDescription>
            <strong>Dicas para fotos perfeitas:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Posicione-se a 2-3 metros da câmera</li>
              <li>Use roupas justas ou underwear para melhor visualização</li>
              <li>Mantenha postura natural e relaxada</li>
              <li>Alinhe o corpo com a linha central da guia</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmitAll}
          disabled={!allComplete || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : allComplete ? (
            <>
              Iniciar Análise com IA
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          ) : (
            `Complete as ${4 - completedCount} fotos restantes`
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SmartPhotoCollector;
