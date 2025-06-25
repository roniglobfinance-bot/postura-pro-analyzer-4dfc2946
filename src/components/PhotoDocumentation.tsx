
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Upload, Save, Download, Ruler, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import PhotoCanvas from './PhotoCanvas';
import PhotoUpload from './PhotoUpload';
import MeasurementTools from './MeasurementTools';
import PhotoReports from './PhotoReports';

interface PhotoData {
  id: string;
  view: 'anterior' | 'posterior' | 'lateral-direita' | 'lateral-esquerda';
  imageUrl: string;
  measurements: any[];
  clientHeight: number;
  date: string;
}

const PhotoDocumentation = () => {
  const [clientName, setClientName] = useState('');
  const [clientHeight, setClientHeight] = useState<number>(170);
  const [activeView, setActiveView] = useState<'anterior' | 'posterior' | 'lateral-direita' | 'lateral-esquerda'>('anterior');
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoData | null>(null);
  const [showMeasurements, setShowMeasurements] = useState(false);

  const handlePhotoUpload = (imageUrl: string, view: string) => {
    const newPhoto: PhotoData = {
      id: `photo-${Date.now()}`,
      view: view as any,
      imageUrl,
      measurements: [],
      clientHeight,
      date: new Date().toISOString().split('T')[0]
    };
    
    setPhotos(prev => [...prev.filter(p => p.view !== view), newPhoto]);
    setSelectedPhoto(newPhoto);
    toast({
      title: "Foto carregada!",
      description: `Foto da vista ${view} foi adicionada com sucesso.`,
    });
  };

  const handleSaveMeasurements = (measurements: any[]) => {
    if (!selectedPhoto) return;
    
    const updatedPhoto = { ...selectedPhoto, measurements };
    setPhotos(prev => prev.map(p => p.id === selectedPhoto.id ? updatedPhoto : p));
    setSelectedPhoto(updatedPhoto);
    
    toast({
      title: "Medições salvas!",
      description: "As medições foram salvas com sucesso.",
    });
  };

  const handleGenerateReport = () => {
    if (photos.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos uma foto para gerar o relatório.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Relatório gerado!",
      description: "O relatório fotográfico foi gerado com sucesso.",
    });
  };

  const getCurrentPhoto = () => {
    return photos.find(p => p.view === activeView);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documentação Fotográfica</h2>
          <p className="text-gray-600">Análise postural com medições por linhas de referência</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleGenerateReport} className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Gerar Relatório
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clientName">Nome do Cliente</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nome completo"
            />
          </div>
          <div>
            <Label htmlFor="clientHeight">Altura (cm) - Para Calibração</Label>
            <Input
              id="clientHeight"
              type="number"
              value={clientHeight}
              onChange={(e) => setClientHeight(Number(e.target.value))}
              placeholder="170"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="anterior">Vista Anterior</TabsTrigger>
          <TabsTrigger value="posterior">Vista Posterior</TabsTrigger>
          <TabsTrigger value="lateral-direita">Lateral Direita</TabsTrigger>
          <TabsTrigger value="lateral-esquerda">Lateral Esquerda</TabsTrigger>
        </TabsList>

        {(['anterior', 'posterior', 'lateral-direita', 'lateral-esquerda'] as const).map((view) => (
          <TabsContent key={view} value={view} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Vista {view.charAt(0).toUpperCase() + view.slice(1).replace('-', ' ')}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMeasurements(!showMeasurements)}
                    >
                      <Ruler className="h-4 w-4 mr-2" />
                      {showMeasurements ? 'Ocultar' : 'Mostrar'} Medições
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  {getCurrentPhoto() ? 'Foto carregada - Use as ferramentas para fazer medições' : 'Faça upload de uma foto para esta vista'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!getCurrentPhoto() ? (
                  <PhotoUpload
                    onPhotoUpload={(imageUrl) => handlePhotoUpload(imageUrl, view)}
                    view={view}
                  />
                ) : (
                  <div className="space-y-4">
                    <PhotoCanvas
                      photo={getCurrentPhoto()!}
                      clientHeight={clientHeight}
                      onSaveMeasurements={handleSaveMeasurements}
                      showMeasurements={showMeasurements}
                    />
                    
                    {showMeasurements && (
                      <MeasurementTools
                        view={view}
                        measurements={getCurrentPhoto()?.measurements || []}
                        onMeasurementsChange={handleSaveMeasurements}
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {photos.length > 0 && (
        <PhotoReports
          photos={photos}
          clientName={clientName}
          clientHeight={clientHeight}
        />
      )}
    </div>
  );
};

export default PhotoDocumentation;
