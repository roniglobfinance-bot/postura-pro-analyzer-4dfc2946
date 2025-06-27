
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, AlertTriangle, CheckCircle, TrendingUp, Download, Share2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PosturalAnalysisProps {
  photos: Array<{
    id: string;
    view: string;
    imageUrl: string;
    measurements: any[];
  }>;
  clientData: {
    name: string;
    age: number;
    height: number;
    weight: number;
  };
}

const PosturalAnalysis = ({ photos, clientData }: PosturalAnalysisProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const runPosturalAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simular análise de IA
    const steps = [
      { step: 'Processando imagens...', progress: 20 },
      { step: 'Detectando pontos anatômicos...', progress: 40 },
      { step: 'Calculando ângulos e distâncias...', progress: 60 },
      { step: 'Comparando com padrões normais...', progress: 80 },
      { step: 'Gerando diagnóstico...', progress: 100 }
    ];

    for (const { step, progress } of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalysisProgress(progress);
      toast({
        title: step,
        description: `Progresso: ${progress}%`
      });
    }

    // Resultados simulados baseados nos dados
    const results = generateAnalysisResults();
    setAnalysisResults(results);
    setIsAnalyzing(false);

    toast({
      title: "Análise concluída!",
      description: "Resultados disponíveis para visualização.",
    });
  };

  const generateAnalysisResults = () => {
    const hasAnterior = photos.some(p => p.view === 'anterior');
    const hasPosterior = photos.some(p => p.view === 'posterior');
    const hasLateral = photos.some(p => p.view.includes('lateral'));

    return {
      overallScore: Math.floor(Math.random() * 30) + 70, // 70-100
      riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      findings: [
        {
          category: 'Alinhamento Sagital',
          severity: 'medium',
          description: 'Ligeira projeção anterior da cabeça',
          angle: '52°',
          normal: '45-55°',
          recommendation: 'Exercícios de fortalecimento cervical profundo'
        },
        {
          category: 'Curvatura Torácica',
          severity: 'low',
          description: 'Cifose torácica dentro da normalidade',
          angle: '32°',
          normal: '25-40°',
          recommendation: 'Manter mobilidade torácica'
        },
        {
          category: 'Alinhamento Pélvico',
          severity: hasLateral ? 'low' : 'medium',
          description: 'Leve anteriorização pélvica',
          angle: '15°',
          normal: '8-12°',
          recommendation: 'Fortalecimento do core e glúteos'
        }
      ],
      compensations: [
        'Elevação do ombro direito',
        'Rotação interna dos ombros',
        'Hiperextensão dos joelhos'
      ],
      exerciseRecommendations: [
        {
          name: 'Retração Cervical',
          sets: '3x15',
          description: 'Para correção da projeção anterior da cabeça'
        },
        {
          name: 'Prancha Frontal',
          sets: '3x30s',
          description: 'Fortalecimento do core'
        },
        {
          name: 'Alongamento de Peitorais',
          sets: '3x30s',
          description: 'Mobilidade da cintura escapular'
        }
      ]
    };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-700 bg-red-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'low': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-700';
      case 'medium': return 'text-yellow-700';
      case 'low': return 'text-green-700';
      default: return 'text-gray-700';
    }
  };

  if (!analysisResults) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-600" />
            Análise Postural com IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAnalyzing ? (
            <div className="space-y-4">
              <div className="text-center">
                <Brain className="h-16 w-16 mx-auto text-purple-500 animate-pulse mb-4" />
                <h3 className="text-lg font-semibold">Analisando postura com IA...</h3>
                <p className="text-gray-600">Processando {photos.length} imagens</p>
              </div>
              <Progress value={analysisProgress} className="w-full" />
              <p className="text-center text-sm text-gray-500">{analysisProgress}% concluído</p>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <Brain className="h-16 w-16 mx-auto text-purple-500" />
              <div>
                <h3 className="text-lg font-semibold">Análise Inteligente Disponível</h3>
                <p className="text-gray-600">
                  Nossa IA analisará automaticamente as imagens posturais e gerará 
                  um diagnóstico detalhado com recomendações personalizadas.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <p className="font-medium">Detecção Automática</p>
                  <p className="text-sm text-gray-600">Pontos anatômicos</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <p className="font-medium">Cálculos Precisos</p>
                  <p className="text-sm text-gray-600">Ângulos e distâncias</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Brain className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <p className="font-medium">Diagnóstico IA</p>
                  <p className="text-sm text-gray-600">Recomendações personalizadas</p>
                </div>
              </div>
              <Button 
                onClick={runPosturalAnalysis}
                className="bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                <Brain className="h-5 w-5 mr-2" />
                Iniciar Análise Inteligente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score Geral */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {analysisResults.overallScore}
              </div>
              <div className="text-sm text-gray-600">Score Postural</div>
              <Progress value={analysisResults.overallScore} className="mt-2" />
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${getRiskColor(analysisResults.riskLevel)}`}>
                {analysisResults.riskLevel === 'high' ? 'Alto' : 
                 analysisResults.riskLevel === 'medium' ? 'Médio' : 'Baixo'}
              </div>
              <div className="text-sm text-gray-600">Nível de Risco</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {analysisResults.findings.length}
              </div>
              <div className="text-sm text-gray-600">Achados Clínicos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados Detalhados */}
      <Tabs defaultValue="findings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="findings">Achados</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          <TabsTrigger value="exercises">Exercícios</TabsTrigger>
        </TabsList>

        <TabsContent value="findings" className="space-y-4">
          {analysisResults.findings.map((finding: any, index: number) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="font-semibold">{finding.category}</h4>
                      <Badge className={`ml-2 ${getSeverityColor(finding.severity)}`}>
                        {finding.severity === 'high' ? 'Alto' : 
                         finding.severity === 'medium' ? 'Médio' : 'Baixo'}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-2">{finding.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Medido:</span> {finding.angle}
                      </div>
                      <div>
                        <span className="font-medium">Normal:</span> {finding.normal}
                      </div>
                    </div>
                  </div>
                  {finding.severity === 'high' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compensações Identificadas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResults.compensations.map((comp: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                    {comp}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4">
          {analysisResults.exerciseRecommendations.map((exercise: any, index: number) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-900">{exercise.name}</h4>
                    <p className="text-gray-600 text-sm mb-2">{exercise.description}</p>
                    <Badge variant="outline">{exercise.sets}</Badge>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Ações */}
      <div className="flex space-x-4">
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Baixar Relatório
        </Button>
        <Button variant="outline">
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
      </div>
    </div>
  );
};

export default PosturalAnalysis;
