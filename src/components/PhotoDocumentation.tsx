import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Upload, Save, Download, Ruler, RotateCcw, Brain, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import PhotoCanvas from './PhotoCanvas';
import PhotoUpload from './PhotoUpload';
import MeasurementTools from './MeasurementTools';
import PhotoReports from './PhotoReports';
import PosturalAnalysis from './PosturalAnalysis';
import AdvancedMeasurements from './assessment/AdvancedMeasurements';
import SagittalFrontalAnalysis from './assessment/SagittalFrontalAnalysis';
import VisualCaptureGuides from './assessment/VisualCaptureGuides';
import ImageAnnotationTools from './canvas/ImageAnnotationTools';
import EnhancedDataVisualization from './reports/EnhancedDataVisualization';
import PatientEducationResources from './education/PatientEducationResources';
import AccessibilityEnhancements from './accessibility/AccessibilityEnhancements';

interface PhotoData {
  id: string;
  view: 'anterior' | 'posterior' | 'lateral-direita' | 'lateral-esquerda';
  imageUrl: string;
  measurements: any[];
  advancedMeasurements?: any;
  clientHeight: number;
  date: string;
}

const PhotoDocumentation = () => {
  const [clientName, setClientName] = useState('');
  const [clientAge, setClientAge] = useState<number>(25);
  const [clientHeight, setClientHeight] = useState<number>(170);
  const [clientWeight, setClientWeight] = useState<number>(70);
  const [activeView, setActiveView] = useState<'anterior' | 'posterior' | 'lateral-direita' | 'lateral-esquerda'>('anterior');
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoData | null>(null);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [activeTab, setActiveTab] = useState('photos');
  const [combinedMeasurements, setCombinedMeasurements] = useState<any>({});
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [patientConditions, setPatientConditions] = useState<string[]>([]);

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
    
    // Salvar no localStorage para persistência
    localStorage.setItem('posturalPhotos', JSON.stringify([...photos.filter(p => p.view !== view), newPhoto]));
    
    toast({
      title: "Foto carregada!",
      description: `Foto da vista ${view} foi adicionada com sucesso.`,
    });
  };

  const handlePhotoCapture = (imageUrl: string) => {
    handlePhotoUpload(imageUrl, activeView);
  };

  const handleSaveMeasurements = (measurements: any[]) => {
    if (!selectedPhoto) return;
    
    const updatedPhoto = { ...selectedPhoto, measurements };
    setPhotos(prev => prev.map(p => p.id === selectedPhoto.id ? updatedPhoto : p));
    setSelectedPhoto(updatedPhoto);
    
    // Salvar no localStorage
    localStorage.setItem('posturalPhotos', JSON.stringify(photos.map(p => p.id === selectedPhoto.id ? updatedPhoto : p)));
    
    toast({
      title: "Medições salvas!",
      description: "As medições foram salvas com sucesso.",
    });
  };

  const handleAdvancedMeasurementsChange = (measurements: any) => {
    if (!selectedPhoto) return;
    
    const updatedPhoto = { ...selectedPhoto, advancedMeasurements: measurements };
    setPhotos(prev => prev.map(p => p.id === selectedPhoto.id ? updatedPhoto : p));
    setSelectedPhoto(updatedPhoto);
    
    // Combinar todas as medições para análise
    const allMeasurements = {
      angular: [],
      linear: []
    };
    
    photos.forEach(photo => {
      if (photo.advancedMeasurements) {
        if (photo.advancedMeasurements.angular) {
          allMeasurements.angular.push(...photo.advancedMeasurements.angular);
        }
        if (photo.advancedMeasurements.linear) {
          allMeasurements.linear.push(...photo.advancedMeasurements.linear);
        }
      }
    });
    
    setCombinedMeasurements(allMeasurements);
    
    // Salvar no localStorage
    localStorage.setItem('posturalPhotos', JSON.stringify(photos.map(p => p.id === selectedPhoto.id ? updatedPhoto : p)));
    
    toast({
      title: "Medições avançadas salvas!",
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
    
    setActiveTab('reports');
    toast({
      title: "Relatório gerado!",
      description: "O relatório fotográfico foi gerado com sucesso.",
    });
  };

  const getCurrentPhoto = () => {
    return photos.find(p => p.view === activeView);
  };

  const getCompletionPercentage = () => {
    const totalViews = 4;
    const completedViews = photos.length;
    return Math.round((completedViews / totalViews) * 100);
  };

  // Carregar dados salvos ao montar o componente
  useEffect(() => {
    const savedPhotos = localStorage.getItem('posturalPhotos');
    const savedClientData = localStorage.getItem('clientData');
    
    if (savedPhotos) {
      const loadedPhotos = JSON.parse(savedPhotos);
      setPhotos(loadedPhotos);
      
      // Combinar medições existentes
      const allMeasurements = {
        angular: [],
        linear: []
      };
      
      loadedPhotos.forEach((photo: PhotoData) => {
        if (photo.advancedMeasurements) {
          if (photo.advancedMeasurements.angular) {
            allMeasurements.angular.push(...photo.advancedMeasurements.angular);
          }
          if (photo.advancedMeasurements.linear) {
            allMeasurements.linear.push(...photo.advancedMeasurements.linear);
          }
        }
      });
      
      setCombinedMeasurements(allMeasurements);
    }
    
    if (savedClientData) {
      const data = JSON.parse(savedClientData);
      setClientName(data.fullName || data.name || '');
      setClientAge(data.age || 25);
      setClientHeight(data.height || 170);
      setClientWeight(data.weight || 70);
    }
  }, []);

  // Salvar dados do cliente
  useEffect(() => {
    const clientData = {
      name: clientName,
      age: clientAge,
      height: clientHeight,
      weight: clientWeight
    };
    localStorage.setItem('clientData', JSON.stringify(clientData));
  }, [clientName, clientAge, clientHeight, clientWeight]);

  const handleAnnotationsChange = (newAnnotations: any[]) => {
    setAnnotations(newAnnotations);
    localStorage.setItem('photoAnnotations', JSON.stringify(newAnnotations));
  };

  const handleEducationProgress = (contentId: string, progress: number) => {
    console.log(`Education content ${contentId} progress: ${progress}%`);
  };

  // Generate sample data for enhanced visualizations
  const generateVisualizationData = () => {
    const measurements = combinedMeasurements;
    const sampleData = [
      { measurement: 'Ângulo de Cobb', value: 15, normal: 0, severity: 'moderado' as const, improvement: -2 },
      { measurement: 'Cifose Torácica', value: 45, normal: 35, severity: 'leve' as const, improvement: 3 },
      { measurement: 'Lordose Lombar', value: 60, normal: 45, severity: 'moderado' as const, improvement: -1 },
      { measurement: 'Inclinação Pélvica', value: 12, normal: 8, severity: 'leve' as const, improvement: 2 },
    ];

    // Add actual measurements if available
    if (measurements.angular && measurements.angular.length > 0) {
      measurements.angular.forEach((m: any) => {
        sampleData.push({
          measurement: m.name || 'Medição Angular',
          value: m.angle || 0,
          normal: m.reference || 0,
          severity: m.classification || 'normal' as const,
          improvement: Math.random() * 6 - 3 // Random improvement for demo
        });
      });
    }

    return sampleData;
  };

  return (
    <div className="space-y-6">
      {/* Accessibility Enhancements */}
      <AccessibilityEnhancements />

      {/* Skip to main content anchor */}
      <div id="main-content" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documentação Fotográfica</h2>
          <p className="text-gray-600">Análise postural com medições avançadas e guias visuais</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleGenerateReport} className="bg-blue-600 hover:bg-blue-700">
            <FileText className="h-4 w-4 mr-2" />
            Ver Relatórios
          </Button>
          <Button variant="outline" onClick={() => setActiveTab('analysis')}>
            <Brain className="h-4 w-4 mr-2" />
            Análise IA
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Progresso da Documentação</h3>
              <p className="text-sm text-gray-600">{photos.length} de 4 vistas capturadas</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{getCompletionPercentage()}%</div>
              <div className="text-sm text-gray-500">Completo</div>
            </div>
          </div>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <Label htmlFor="clientAge">Idade (anos)</Label>
            <Input
              id="clientAge"
              type="number"
              value={clientAge}
              onChange={(e) => setClientAge(Number(e.target.value))}
              placeholder="25"
            />
          </div>
          <div>
            <Label htmlFor="clientHeight">Altura (cm)</Label>
            <Input
              id="clientHeight"
              type="number"
              value={clientHeight}
              onChange={(e) => setClientHeight(Number(e.target.value))}
              placeholder="170"
            />
          </div>
          <div>
            <Label htmlFor="clientWeight">Peso (kg)</Label>
            <Input
              id="clientWeight"
              type="number"
              value={clientWeight}
              onChange={(e) => setClientWeight(Number(e.target.value))}
              placeholder="70"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="photos">Captura de Fotos</TabsTrigger>
          <TabsTrigger value="measurements">Medições Avançadas</TabsTrigger>
          <TabsTrigger value="analysis">Análise Planos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="education">Educação</TabsTrigger>
        </TabsList>

        <TabsContent value="photos" className="space-y-4">
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
                      {getCurrentPhoto() ? 'Foto carregada - Use as ferramentas para fazer medições' : 'Capture ou faça upload de uma foto para esta vista'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!getCurrentPhoto() ? (
                      <div className="space-y-4">
                        <VisualCaptureGuides 
                          onPhotoCapture={handlePhotoCapture}
                          currentView={view}
                        />
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">ou</span>
                          </div>
                        </div>
                        <PhotoUpload
                          onPhotoUpload={(imageUrl) => handlePhotoUpload(imageUrl, view)}
                          view={view}
                        />
                      </div>
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
        </TabsContent>

        <TabsContent value="measurements" className="space-y-4">
          {selectedPhoto || photos.length > 0 ? (
            <AdvancedMeasurements
              imageUrl={selectedPhoto?.imageUrl || photos[0]?.imageUrl || ''}
              clientHeight={clientHeight}
              onMeasurementsChange={handleAdvancedMeasurementsChange}
              existingMeasurements={selectedPhoto?.advancedMeasurements}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Ruler className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Nenhuma foto disponível
                </h3>
                <p className="text-gray-500">
                  Capture algumas fotos posturais para realizar medições avançadas.
                </p>
                <Button 
                  onClick={() => setActiveTab('photos')} 
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  Iniciar Captura
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <SagittalFrontalAnalysis
            measurements={combinedMeasurements}
            clientData={{
              name: clientName,
              age: clientAge,
              height: clientHeight,
              weight: clientWeight
            }}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {photos.length > 0 ? (
            <div className="space-y-6">
              {/* Enhanced Data Visualization */}
              <EnhancedDataVisualization
                data={generateVisualizationData()}
                clientName={clientName}
                evaluationDate={new Date().toISOString()}
              />

              {/* Image Annotations */}
              {selectedPhoto?.imageUrl && (
                <ImageAnnotationTools
                  imageUrl={selectedPhoto.imageUrl}
                  onAnnotationsChange={handleAnnotationsChange}
                  existingAnnotations={annotations}
                />
              )}

              {/* Original Photo Reports */}
              <PhotoReports
                photos={photos}
                clientName={clientName}
                clientHeight={clientHeight}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Camera className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Nenhuma foto disponível
                </h3>
                <p className="text-gray-500">
                  Capture algumas fotos posturais para gerar relatórios.
                </p>
                <Button 
                  onClick={() => setActiveTab('photos')} 
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  Iniciar Captura
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="education" className="space-y-4">
          <PatientEducationResources
            patientConditions={patientConditions}
            onProgressUpdate={handleEducationProgress}
          />
        </TabsContent>
      </Tabs>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print, nav, .tabs-list, button:not(.print-button) {
            display: none !important;
          }
          
          .print-content {
            display: block !important;
          }
          
          body {
            font-size: 12pt;
            line-height: 1.4;
            color: #000;
            background: #fff;
          }
          
          .card {
            border: 1px solid #000;
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          
          h1, h2, h3 {
            page-break-after: avoid;
          }
          
          table {
            border-collapse: collapse;
            width: 100%;
          }
          
          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default PhotoDocumentation;
