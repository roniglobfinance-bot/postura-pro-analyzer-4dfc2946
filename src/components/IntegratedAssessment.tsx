import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, Camera, Scan, Brain, FileText, 
  Upload, Save, Download, Loader2, Sparkles, AlertCircle 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAssessment } from '@/contexts/AssessmentContext';
import { toast } from '@/hooks/use-toast';
import Simetrografo from './analysis/Simetrografo';
import SkeletonDetection from './analysis/SkeletonDetection';
import DynamicAngleAnalysis from './analysis/DynamicAngleAnalysis';
import Myofascial3DVisualization from './analysis/Myofascial3DVisualization';
import FlagSelector from './diagnostic/FlagSelector';
import DiagnosticResults from './diagnostic/DiagnosticResults';
import ProtocolViewer from './diagnostic/ProtocolViewer';
import { generateDiagnosticReport } from '@/services/diagnosticEngine';
import { analyzePoseComplete, extractSkeletonForVisualization } from '@/services/mediaPipePoseService';

const IntegratedAssessment = () => {
  const { 
    data, 
    updateClientData, 
    updatePhoto, 
    addDiagnosticFlag,
    setDiagnosis,
    addAnatomicalPoints,
    addMeasurement
  } = useAssessment();
  
  const [activeTab, setActiveTab] = useState('client');
  const [selectedView, setSelectedView] = useState<'anterior' | 'posterior' | 'lateralDireita' | 'lateralEsquerda'>('anterior');
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResults, setAiAnalysisResults] = useState<Record<string, any>>({});

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        updatePhoto(selectedView, imageUrl);
        toast({
          title: "Foto carregada",
          description: `Vista ${selectedView} atualizada com sucesso`,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAIAnalysis = async () => {
    if (!data.photos || Object.keys(data.photos).length === 0) {
      toast({
        title: "Nenhuma foto disponível",
        description: "Capture fotos antes de executar a análise de IA",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    toast({
      title: "Iniciando Análise MediaPipe",
      description: "Processando imagens com detecção automática de 33 keypoints...",
    });

    try {
      let allFlags: any[] = [];
      let allMeasurements: any[] = [];
      
      // Processar cada foto com análise completa
      const photoViews = Object.entries(data.photos).filter(([_, url]) => url);
      
      for (const [viewType, imageUrl] of photoViews) {
        console.log(`Analisando foto: ${viewType}`);
        
        const analysisResult = await analyzePoseComplete(
          imageUrl,
          viewType as any,
          data.clientData.height
        );
        
        if (analysisResult.pose) {
          // 1. Adicionar pontos anatômicos detectados (33 keypoints)
          addAnatomicalPoints(viewType as any, analysisResult.pose.keypoints.map(kp => ({
            id: `mp-${Date.now()}-${Math.random()}`,
            name: kp.name,
            x: kp.x,
            y: kp.y,
            type: 'landmark' as const
          })));

          // 2. Armazenar flags detectados
          allFlags.push(...analysisResult.flags);
          
          // 3. Armazenar medições
          allMeasurements.push(...analysisResult.measurements);
          
          // 4. Extrair skeleton para visualização 3D
          const skeletonData = extractSkeletonForVisualization(analysisResult.pose);
          if (skeletonData) {
            setAiAnalysisResults(prev => ({
              ...prev,
              [viewType]: {
                skeleton: skeletonData,
                deviations: analysisResult.deviations,
                summary: analysisResult.clinicalSummary
              }
            }));
          }
        }
      }

      // 5. Adicionar todas as flags ao contexto (deduplicated)
      const uniqueFlags = Array.from(
        new Map(allFlags.map(f => [f.code, f])).values()
      );
      
      uniqueFlags.forEach(flag => addDiagnosticFlag(flag));
      
      // 6. Adicionar medições
      allMeasurements.forEach(m => addMeasurement(m));

      toast({
        title: "Análise MediaPipe Concluída!",
        description: `${uniqueFlags.length} flags detectados, ${allMeasurements.length} medições realizadas`,
      });
      
      console.log('Flags detectados:', uniqueFlags);
      console.log('Medições:', allMeasurements);
      
    } catch (error) {
      console.error('Erro na análise MediaPipe:', error);
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Não foi possível completar a análise de IA",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateDiagnosis = () => {
    // Combinar flags manuais com flags auto-detectados
    const autoDetectedFlags = data.diagnosticFlags
      .filter(f => f.source === 'auto-detected')
      .map(f => f.code);
    
    const allFlags = [...new Set([...selectedFlags, ...autoDetectedFlags])];
    
    if (allFlags.length === 0) {
      toast({
        title: 'Nenhum flag identificado',
        description: 'Realize análises de IA ou selecione flags manualmente',
        variant: 'destructive'
      });
      return;
    }

    // Adicionar flags manuais ao contexto
    selectedFlags.forEach(flag => {
      if (!data.diagnosticFlags.find(f => f.code === flag)) {
        addDiagnosticFlag({
          code: flag,
          name: flag,
          severity: 3,
          source: 'manual'
        });
      }
    });

    // Gerar diagnóstico com todos os flags
    const result = generateDiagnosticReport({ flags: allFlags });
    setDiagnosis(result);

    toast({
      title: 'Diagnóstico gerado',
      description: `${result.diagnoses.length} diagnóstico(s) baseado em ${allFlags.length} flags (${autoDetectedFlags.length} auto-detectados)`,
    });
    
    setActiveTab('diagnosis');
  };

  const currentPhoto = data.photos[selectedView];

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-6 w-6" />
            Avaliação Postural Integrada
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="client" className="gap-2">
            <User className="h-4 w-4" />
            Cliente
          </TabsTrigger>
          <TabsTrigger value="photos" className="gap-2">
            <Camera className="h-4 w-4" />
            Fotos
          </TabsTrigger>
          <TabsTrigger value="analysis" className="gap-2">
            <Scan className="h-4 w-4" />
            Análise IA
          </TabsTrigger>
          <TabsTrigger value="flags" className="gap-2">
            <FileText className="h-4 w-4" />
            Flags
          </TabsTrigger>
          <TabsTrigger value="diagnosis" className="gap-2">
            <Brain className="h-4 w-4" />
            Diagnóstico
          </TabsTrigger>
        </TabsList>

        {/* 1. DADOS DO CLIENTE */}
        <TabsContent value="client" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input
                    value={data.clientData.fullName}
                    onChange={(e) => updateClientData({ fullName: e.target.value })}
                    placeholder="Nome do cliente"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Idade</Label>
                  <Input
                    type="number"
                    value={data.clientData.age || ''}
                    onChange={(e) => updateClientData({ age: parseInt(e.target.value) })}
                    placeholder="Idade"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Altura (cm)</Label>
                  <Input
                    type="number"
                    value={data.clientData.height || ''}
                    onChange={(e) => updateClientData({ height: parseInt(e.target.value) })}
                    placeholder="Altura em cm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Peso (kg)</Label>
                  <Input
                    type="number"
                    value={data.clientData.weight || ''}
                    onChange={(e) => updateClientData({ weight: parseInt(e.target.value) })}
                    placeholder="Peso em kg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. CAPTURA E ANÁLISE DE FOTOS */}
        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Captura de Fotos com Simetrógrafo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seletor de Vista */}
              <div className="flex gap-2">
                {(['anterior', 'posterior', 'lateralDireita', 'lateralEsquerda'] as const).map((view) => (
                  <Button
                    key={view}
                    variant={selectedView === view ? 'default' : 'outline'}
                    onClick={() => setSelectedView(view)}
                    size="sm"
                  >
                    {view}
                  </Button>
                ))}
              </div>

              {/* Upload de Foto */}
              {!currentPhoto ? (
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <span className="text-lg font-medium">Fazer upload de foto</span>
                    <p className="text-sm text-muted-foreground mt-2">
                      Vista: {selectedView}
                    </p>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              ) : (
                <Simetrografo 
                  imageUrl={currentPhoto} 
                  view={selectedView}
                  clientHeight={data.clientData.height}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. ANÁLISES DE IA */}
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise Automática com MediaPipe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Detecta automaticamente 33 pontos anatômicos, calcula medições precisas, 
                identifica desvios posturais e gera flags de diagnóstico baseados em deep learning.
              </p>
              
              <Button
                onClick={handleRunAIAnalysis}
                disabled={isAnalyzing || !Object.keys(data.photos).some(k => data.photos[k as keyof typeof data.photos])}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analisando com MediaPipe...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Análise MediaPipe (33 Keypoints)
                  </>
                )}
              </Button>
              
              {data.diagnosticFlags.length > 0 && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{data.diagnosticFlags.length} flags</strong> detectados automaticamente pela IA.
                    Veja a aba "Flags" para revisar e "Diagnóstico" para processar.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Visualizações adicionais */}
          {currentPhoto && (
            <Tabs defaultValue="skeleton" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="skeleton">Esqueleto</TabsTrigger>
                <TabsTrigger value="angles">Ângulos</TabsTrigger>
                <TabsTrigger value="myofascial">3D Miofascial</TabsTrigger>
              </TabsList>

              <TabsContent value="skeleton" className="space-y-4">
                <SkeletonDetection
                  imageUrl={currentPhoto}
                  onAnalysisComplete={(analysis) => {
                    console.log('Análise de skeleton concluída:', analysis);
                  }}
                />
              </TabsContent>

              <TabsContent value="angles" className="space-y-4">
                <DynamicAngleAnalysis imageUrl={currentPhoto} />
              </TabsContent>

              <TabsContent value="myofascial" className="space-y-4">
                {aiAnalysisResults[selectedView]?.skeleton ? (
                  <Myofascial3DVisualization 
                    imageUrl={currentPhoto}
                    skeletonData={aiAnalysisResults[selectedView].skeleton}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      Execute a análise MediaPipe primeiro para visualizar linhas miofasciais em 3D
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </TabsContent>

        {/* 4. SELEÇÃO/CONFIRMAÇÃO DE FLAGS */}
        <TabsContent value="flags" className="space-y-4">
          {/* Flags Auto-Detectados */}
          {data.diagnosticFlags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Flags Auto-Detectados pela IA</span>
                  <Badge variant="secondary">
                    {data.diagnosticFlags.length} detectado(s)
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.diagnosticFlags.map((flag) => (
                    <Badge 
                      key={flag.code} 
                      variant="default"
                      className="gap-2"
                    >
                      {flag.code} - {flag.name}
                      {flag.confidence && (
                        <span className="text-xs opacity-75">
                          ({flag.confidence}%)
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <FlagSelector
            selectedFlags={selectedFlags}
            onFlagsChange={setSelectedFlags}
          />
          
          <div className="flex justify-end gap-2">
            <Badge variant="outline" className="py-2 px-4">
              Total: {selectedFlags.length + data.diagnosticFlags.length} flags
            </Badge>
            <Button
              onClick={handleGenerateDiagnosis}
              disabled={selectedFlags.length === 0 && data.diagnosticFlags.length === 0}
              size="lg"
            >
              <Brain className="h-4 w-4 mr-2" />
              Processar Diagnóstico
            </Button>
          </div>
        </TabsContent>

        {/* 5. DIAGNÓSTICO E PROTOCOLOS */}
        <TabsContent value="diagnosis" className="space-y-4">
          {data.diagnosis ? (
            <>
              <DiagnosticResults diagnoses={data.diagnosis.diagnoses} />
              
              {data.diagnosis.protocols.length > 0 && (
                <ProtocolViewer protocols={data.diagnosis.protocols} />
              )}
              
              {data.diagnosis.summary && (
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo Técnico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs font-mono bg-muted p-4 rounded-lg whitespace-pre-wrap">
                      {data.diagnosis.summary}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                Selecione flags e processe o diagnóstico para visualizar resultados
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegratedAssessment;
