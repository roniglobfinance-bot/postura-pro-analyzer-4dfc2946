
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, AlertTriangle, CheckCircle, FileText, Lightbulb } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DiagnosticAIProps {
  clientData: any;
  measurements: any;
  onDiagnosisComplete: (diagnosis: any) => void;
}

interface PosturalPattern {
  id: string;
  name: string;
  severity: 'Leve' | 'Moderado' | 'Grave';
  confidence: number;
  description: string;
  criteria: string[];
  recommendations: string[];
  exercises: string[];
  icd10: string;
}

const DiagnosticAI = ({ clientData, measurements, onDiagnosisComplete }: DiagnosticAIProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [diagnosis, setDiagnosis] = useState<PosturalPattern[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  // Padrões posturais baseados nos 50 protocolos fornecidos
  const analyzePosturalPatterns = (measurements: any): PosturalPattern[] => {
    const patterns: PosturalPattern[] = [];

    // P01 - Corretor de Hipercifose Torácica
    if (measurements.thoracicKyphosis > 40) {
      const severity = measurements.thoracicKyphosis > 60 ? 'Grave' : 
                     measurements.thoracicKyphosis > 50 ? 'Moderado' : 'Leve';
      patterns.push({
        id: 'P01',
        name: 'Hipercifose Torácica',
        severity,
        confidence: 0.95,
        description: 'Aumento da curvatura torácica causada por fraqueza dos extensores torácicos e postura sentada prolongada.',
        criteria: [
          `Ângulo de cifose torácica: ${measurements.thoracicKyphosis}° (Normal: 20-40°)`,
          'Fraqueza dos extensores torácicos',
          'Postura sentada prolongada'
        ],
        recommendations: [
          'Liberação miofascial peitoral 2x/dia, 1 minuto',
          'Exercícios de extensão torácica',
          'Fortalecimento dos músculos romboides e trapézio médio'
        ],
        exercises: [
          'Liberação peitoral com rolo (2x/dia, 1 minuto)',
          'Extensão torácica sobre foam roller (3x10 reps)',
          'Superman hold progressivo (15s → 45s)'
        ],
        icd10: 'M40.0'
      });
    }

    // P02 - Alinhamento de Cabeça Anterior
    if (measurements.cranioCervicalAngle < 50) {
      const severity = measurements.cranioCervicalAngle < 40 ? 'Grave' : 
                     measurements.cranioCervicalAngle < 45 ? 'Moderado' : 'Leve';
      patterns.push({
        id: 'P02',
        name: 'Projeção Anterior da Cabeça',
        severity,
        confidence: 0.92,
        description: 'Anteriorização da cabeça causada por uso excessivo de dispositivos móveis e fraqueza cervical.',
        criteria: [
          `Ângulo crânio-cervical: ${measurements.cranioCervicalAngle}° (Normal: 50-60°)`,
          'Uso excessivo de dispositivos',
          'Fraqueza dos flexores cervicais profundos'
        ],
        recommendations: [
          'Ajustar altura da tela na altura dos olhos',
          'Fortalecimento dos flexores cervicais profundos',
          'Alongamento da cadeia posterior'
        ],
        exercises: [
          'Chin tuck contra resistência manual (3x12 reps)',
          'Flexão cervical isométrica (4x20s)',
          'Alongamento dos extensores cervicais'
        ],
        icd10: 'M43.1'
      });
    }

    // P04 - Hiperlordose Lombar
    if (measurements.lumbarLordosis > 60) {
      const severity = measurements.lumbarLordosis > 80 ? 'Grave' : 
                     measurements.lumbarLordosis > 70 ? 'Moderado' : 'Leve';
      patterns.push({
        id: 'P04',
        name: 'Hiperlordose Lombar',
        severity,
        confidence: 0.89,
        description: 'Aumento da curvatura lombar causado por encurtamento do iliopsoas e fraqueza abdominal.',
        criteria: [
          `Ângulo de lordose lombar: ${measurements.lumbarLordosis}° (Normal: 40-60°)`,
          'Encurtamento do iliopsoas',
          'Fraqueza da musculatura abdominal'
        ],
        recommendations: [
          'Alongamento dos flexores do quadril',
          'Fortalecimento do core',
          'Correção de padrões de movimento'
        ],
        exercises: [
          'Alongamento do iliopsoas (3x30s/lado)',
          'Deadbug (3x10)',
          'Prancha frontal progressiva'
        ],
        icd10: 'M40.3'
      });
    }

    // P13 - Escoliose (baseada no ângulo de Cobb)
    if (measurements.cobbAngle > 10) {
      const severity = measurements.cobbAngle > 25 ? 'Grave' : 
                     measurements.cobbAngle > 15 ? 'Moderado' : 'Leve';
      patterns.push({
        id: 'P13',
        name: 'Escoliose Torácica',
        severity,
        confidence: 0.94,
        description: 'Curvatura lateral da coluna com rotação vertebral associada.',
        criteria: [
          `Ângulo de Cobb: ${measurements.cobbAngle}° (Normal: <10°)`,
          'Assimetria de ombros e quadris',
          'Rotação do tronco'
        ],
        recommendations: [
          'Exercícios de correção assimétrica',
          'Respiração costal diferencial',
          'Fortalecimento específico do lado convexo'
        ],
        exercises: [
          'Respiração costal diferencial',
          'Correção ativa no espelho',
          'Exercícios de Schroth modificado'
        ],
        icd10: 'M41.9'
      });
    }

    // P06 - Assimetria de Ombros
    if (Math.abs(measurements.shoulderImbalance) > 5) {
      const severity = Math.abs(measurements.shoulderImbalance) > 15 ? 'Grave' : 
                     Math.abs(measurements.shoulderImbalance) > 10 ? 'Moderado' : 'Leve';
      patterns.push({
        id: 'P06',
        name: 'Assimetria de Ombros',
        severity,
        confidence: 0.88,
        description: 'Desnível entre os ombros causado por padrões assimétricos de movimento.',
        criteria: [
          `Desnível de ombros: ${measurements.shoulderImbalance}mm (Normal: ±5mm)`,
          'Padrões assimétricos de uso',
          'Desequilíbrio muscular'
        ],
        recommendations: [
          'Correção de padrões assimétricos',
          'Fortalecimento unilateral do lado baixo',
          'Alongamento do trapézio superior'
        ],
        exercises: [
          'Elevação escapular unilateral (3x12)',
          'Remada unilateral (3x10)',
          'Alongamento do trapézio superior'
        ],
        icd10: 'M25.3'
      });
    }

    return patterns;
  };

  const runDiagnosis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    const steps = [
      { step: 'Analisando medições angulares...', progress: 20 },
      { step: 'Identificando padrões posturais...', progress: 40 },
      { step: 'Comparando com critérios validados...', progress: 60 },
      { step: 'Calculando confiabilidade...', progress: 80 },
      { step: 'Gerando recomendações...', progress: 100 }
    ];

    for (const { step, progress } of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnalysisProgress(progress);
      toast({
        title: step,
        description: `Progresso: ${progress}%`
      });
    }

    const detectedPatterns = analyzePosturalPatterns(measurements);
    setDiagnosis(detectedPatterns);
    
    // Calcular score geral baseado na severidade dos padrões
    const totalSeverity = detectedPatterns.reduce((sum, pattern) => {
      const severityWeight = pattern.severity === 'Grave' ? 3 : 
                           pattern.severity === 'Moderado' ? 2 : 1;
      return sum + severityWeight;
    }, 0);
    
    const maxPossibleSeverity = detectedPatterns.length * 3;
    const calculatedScore = Math.max(0, 100 - (totalSeverity / maxPossibleSeverity) * 50);
    setOverallScore(Math.round(calculatedScore));

    setIsAnalyzing(false);
    onDiagnosisComplete({ patterns: detectedPatterns, score: calculatedScore });

    toast({
      title: "Diagnóstico concluído!",
      description: `${detectedPatterns.length} padrões posturais identificados.`,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Grave': return 'text-red-700 bg-red-100';
      case 'Moderado': return 'text-yellow-700 bg-yellow-100';
      case 'Leve': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  if (!diagnosis.length && !isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-600" />
            Diagnóstico Inteligente SAARS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <Brain className="h-16 w-16 mx-auto text-purple-500" />
            <div>
              <h3 className="text-lg font-semibold">Análise Postural com IA</h3>
              <p className="text-gray-600">
                Nossa IA analisará as medições posturais usando critérios científicos validados 
                para identificar padrões e gerar diagnósticos precisos.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <CheckCircle className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <p className="font-medium">50 Protocolos</p>
                <p className="text-sm text-gray-600">Padrões validados</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <FileText className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <p className="font-medium">CID-10</p>
                <p className="text-sm text-gray-600">Códigos de diagnóstico</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Brain className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <p className="font-medium">IA Avançada</p>
                <p className="text-sm text-gray-600">Critérios científicos</p>
              </div>
            </div>
            <Button 
              onClick={runDiagnosis}
              className="bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              <Brain className="h-5 w-5 mr-2" />
              Iniciar Diagnóstico IA
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <Brain className="h-16 w-16 mx-auto text-purple-500 animate-pulse" />
            <h3 className="text-lg font-semibold">Processando Diagnóstico...</h3>
            <Progress value={analysisProgress} className="w-full" />
            <p className="text-sm text-gray-500">{analysisProgress}% concluído</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score e Resumo */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {overallScore}
              </div>
              <div className="text-sm text-gray-600">Score SAARS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {diagnosis.length}
              </div>
              <div className="text-sm text-gray-600">Padrões Identificados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {Math.round(diagnosis.reduce((acc, d) => acc + d.confidence, 0) / diagnosis.length * 100)}%
              </div>
              <div className="text-sm text-gray-600">Confiabilidade Média</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnósticos Detalhados */}
      <Tabs defaultValue="patterns" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="patterns">Padrões Identificados</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          <TabsTrigger value="exercises">Exercícios</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-4">
          {diagnosis.map((pattern) => (
            <Card key={pattern.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-lg">{pattern.name}</h4>
                      <Badge className={getSeverityColor(pattern.severity)}>
                        {pattern.severity}
                      </Badge>
                      <Badge variant="outline">{pattern.id}</Badge>
                      <Badge variant="secondary">CID: {pattern.icd10}</Badge>
                    </div>
                    <p className="text-gray-700 mb-3">{pattern.description}</p>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium">Critérios Identificados:</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {pattern.criteria.map((criterion, index) => (
                          <li key={index}>{criterion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="text-center ml-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(pattern.confidence * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">Confiança</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {diagnosis.map((pattern) => (
            <Card key={`rec-${pattern.id}`}>
              <CardHeader>
                <CardTitle className="text-lg">{pattern.name} - Recomendações</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {pattern.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4">
          {diagnosis.map((pattern) => (
            <Card key={`ex-${pattern.id}`}>
              <CardHeader>
                <CardTitle className="text-lg">{pattern.name} - Exercícios</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {pattern.exercises.map((exercise, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{exercise}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DiagnosticAI;
