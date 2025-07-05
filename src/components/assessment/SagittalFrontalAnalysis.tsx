
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, TrendingUp, AlertTriangle, CheckCircle, Target } from 'lucide-react';

interface SagittalFrontalAnalysisProps {
  measurements: any;
  clientData: any;
}

interface PlaneAnalysis {
  plane: 'sagittal' | 'frontal';
  score: number;
  deviations: {
    type: string;
    severity: 'Normal' | 'Leve' | 'Moderado' | 'Grave';
    value: number;
    description: string;
    recommendations: string[];
  }[];
  compensations: {
    primary: string;
    secondary: string[];
    impact: 'Leve' | 'Moderado' | 'Grave';
  }[];
}

const SagittalFrontalAnalysis = ({ measurements, clientData }: SagittalFrontalAnalysisProps) => {
  const [sagittalAnalysis, setSagittalAnalysis] = useState<PlaneAnalysis | null>(null);
  const [frontalAnalysis, setFrontalAnalysis] = useState<PlaneAnalysis | null>(null);
  const [overallScore, setOverallScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (measurements && (measurements.angular?.length > 0 || measurements.linear?.length > 0)) {
      performPlaneAnalysis();
    }
  }, [measurements]);

  const performPlaneAnalysis = async () => {
    setIsAnalyzing(true);

    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Análise do Plano Sagital
    const sagittal = analyzeSagittalPlane(measurements);
    setSagittalAnalysis(sagittal);

    // Análise do Plano Frontal
    const frontal = analyzeFrontalPlane(measurements);
    setFrontalAnalysis(frontal);

    // Score geral
    const overall = Math.round((sagittal.score + frontal.score) / 2);
    setOverallScore(overall);

    setIsAnalyzing(false);
  };

  const analyzeSagittalPlane = (measurements: any): PlaneAnalysis => {
    const deviations = [];
    const compensations = [];

    // Analisar cifose torácica
    const thoracicMeasurement = measurements.angular?.find((m: any) => m.type === 'thoracic');
    if (thoracicMeasurement) {
      deviations.push({
        type: 'Cifose Torácica',
        severity: thoracicMeasurement.classification,
        value: thoracicMeasurement.angle,
        description: `Curvatura torácica de ${thoracicMeasurement.angle.toFixed(1)}° (Normal: 20-40°)`,
        recommendations: [
          'Exercícios de extensão torácica',
          'Fortalecimento dos extensores torácicos',
          'Mobilização articular da coluna torácica'
        ]
      });

      if (thoracicMeasurement.angle > 40) {
        compensations.push({
          primary: 'Hipercifose torácica',
          secondary: ['Retificação cervical', 'Hiperlordose lombar compensatória'],
          impact: thoracicMeasurement.angle > 60 ? 'Grave' : 'Moderado'
        });
      }
    }

    // Analisar lordose lombar
    const lumbarMeasurement = measurements.angular?.find((m: any) => m.type === 'lumbar');
    if (lumbarMeasurement) {
      deviations.push({
        type: 'Lordose Lombar',
        severity: lumbarMeasurement.classification,
        value: lumbarMeasurement.angle,
        description: `Curvatura lombar de ${lumbarMeasurement.angle.toFixed(1)}° (Normal: 40-60°)`,
        recommendations: [
          'Fortalecimento do core',
          'Alongamento dos flexores do quadril',
          'Exercícios de estabilização pélvica'
        ]
      });

      if (lumbarMeasurement.angle > 60) {
        compensations.push({
          primary: 'Hiperlordose lombar',
          secondary: ['Anteversão pélvica', 'Tensão em isquiotibiais'],
          impact: lumbarMeasurement.angle > 80 ? 'Grave' : 'Moderado'
        });
      }
    }

    // Calcular score do plano sagital
    const avgDeviation = deviations.reduce((sum, dev) => {
      const severityScore = { 'Normal': 100, 'Leve': 80, 'Moderado': 60, 'Grave': 40 };
      return sum + severityScore[dev.severity];
    }, 0) / Math.max(deviations.length, 1);

    return {
      plane: 'sagittal',
      score: Math.round(avgDeviation),
      deviations,
      compensations
    };
  };

  const analyzeFrontalPlane = (measurements: any): PlaneAnalysis => {
    const deviations = [];
    const compensations = [];

    // Analisar escoliose
    const cobbMeasurement = measurements.angular?.find((m: any) => m.type === 'cobb');
    if (cobbMeasurement) {
      deviations.push({
        type: 'Escoliose',
        severity: cobbMeasurement.classification,
        value: cobbMeasurement.angle,
        description: `Ângulo de Cobb de ${cobbMeasurement.angle.toFixed(1)}° (Normal: <10°)`,
        recommendations: [
          'Exercícios de correção assimétrica',
          'Fortalecimento do lado convexo',
          'Alongamento do lado côncavo'
        ]
      });

      if (cobbMeasurement.angle > 10) {
        compensations.push({
          primary: 'Curvatura lateral da coluna',
          secondary: ['Rotação vertebral', 'Assimetria de ombros e quadris'],
          impact: cobbMeasurement.angle > 25 ? 'Grave' : 'Moderado'
        });
      }
    }

    // Analisar desnível de ombros
    const shoulderMeasurement = measurements.linear?.find((m: any) => m.type === 'shoulder-height');
    if (shoulderMeasurement) {
      deviations.push({
        type: 'Desnível de Ombros',
        severity: shoulderMeasurement.classification,
        value: shoulderMeasurement.distance,
        description: `Assimetria de ${shoulderMeasurement.distance.toFixed(1)}px entre os ombros`,
        recommendations: [
          'Exercícios unilaterais de fortalecimento',
          'Correção postural específica',
          'Alongamento do trapézio superior'
        ]
      });
    }

    // Analisar desnível de quadris
    const hipMeasurement = measurements.linear?.find((m: any) => m.type === 'hip-height');
    if (hipMeasurement) {
      deviations.push({
        type: 'Desnível de Quadris',
        severity: hipMeasurement.classification,
        value: hipMeasurement.distance,
        description: `Assimetria de ${hipMeasurement.distance.toFixed(1)}px entre os quadris`,
        recommendations: [
          'Avaliação de dismetria de membros',
          'Fortalecimento unilateral',
          'Correção da base de sustentação'
        ]
      });
    }

    // Calcular score do plano frontal
    const avgDeviation = deviations.reduce((sum, dev) => {
      const severityScore = { 'Normal': 100, 'Leve': 80, 'Moderado': 60, 'Grave': 40 };
      return sum + severityScore[dev.severity];
    }, 0) / Math.max(deviations.length, 1);

    return {
      plane: 'frontal',
      score: Math.round(avgDeviation),
      deviations,
      compensations
    };
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Normal': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Leve': return <Target className="h-4 w-4 text-yellow-500" />;
      case 'Moderado': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'Grave': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Normal': return 'bg-green-100 text-green-800';
      case 'Leve': return 'bg-yellow-100 text-yellow-800';
      case 'Moderado': return 'bg-orange-100 text-orange-800';
      case 'Grave': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="h-16 w-16 mx-auto text-blue-500 animate-pulse mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analisando Planos Posturais...</h3>
          <p className="text-gray-600 mb-4">Processando análise sagital e frontal</p>
          <Progress value={75} className="w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!sagittalAnalysis || !frontalAnalysis) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Análise dos Planos Posturais</h3>
          <p className="text-gray-600 mb-4">
            Realize medições angulares e lineares para gerar a análise dos planos sagital e frontal.
          </p>
          <Button onClick={performPlaneAnalysis} disabled={!measurements || (!measurements.angular?.length && !measurements.linear?.length)}>
            <Activity className="h-4 w-4 mr-2" />
            Iniciar Análise
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score Geral */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Score Postural Geral</h3>
              <p className="text-gray-600">Análise combinada dos planos sagital e frontal</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">{overallScore}</div>
              <div className="text-sm text-gray-500">de 100</div>
              <Progress value={overallScore} className="w-24 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análise por Planos */}
      <Tabs defaultValue="sagittal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sagittal">
            Plano Sagital ({sagittalAnalysis.score})
          </TabsTrigger>
          <TabsTrigger value="frontal">
            Plano Frontal ({frontalAnalysis.score})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sagittal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Análise do Plano Sagital</span>
                <Badge variant="outline">{sagittalAnalysis.score}/100</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Desvios Identificados */}
              <div>
                <h4 className="font-medium mb-3">Desvios Identificados</h4>
                <div className="space-y-3">
                  {sagittalAnalysis.deviations.map((deviation, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getSeverityIcon(deviation.severity)}
                          <span className="font-medium">{deviation.type}</span>
                        </div>
                        <Badge className={getSeverityColor(deviation.severity)}>
                          {deviation.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{deviation.description}</p>
                      <div>
                        <p className="text-sm font-medium mb-2">Recomendações:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {deviation.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compensações */}
              {sagittalAnalysis.compensations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Padrões de Compensação</h4>
                  <div className="space-y-3">
                    {sagittalAnalysis.compensations.map((comp, index) => (
                      <div key={index} className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{comp.primary}</span>
                          <Badge variant="outline">{comp.impact}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Compensações secundárias:</p>
                          <ul className="text-sm text-gray-600">
                            {comp.secondary.map((sec, idx) => (
                              <li key={idx}>• {sec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frontal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Análise do Plano Frontal</span>
                <Badge variant="outline">{frontalAnalysis.score}/100</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Desvios Identificados */}
              <div>
                <h4 className="font-medium mb-3">Desvios Identificados</h4>
                <div className="space-y-3">
                  {frontalAnalysis.deviations.map((deviation, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getSeverityIcon(deviation.severity)}
                          <span className="font-medium">{deviation.type}</span>
                        </div>
                        <Badge className={getSeverityColor(deviation.severity)}>
                          {deviation.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{deviation.description}</p>
                      <div>
                        <p className="text-sm font-medium mb-2">Recomendações:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {deviation.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compensações */}
              {frontalAnalysis.compensations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Padrões de Compensação</h4>
                  <div className="space-y-3">
                    {frontalAnalysis.compensations.map((comp, index) => (
                      <div key={index} className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{comp.primary}</span>
                          <Badge variant="outline">{comp.impact}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Compensações secundárias:</p>
                          <ul className="text-sm text-gray-600">
                            {comp.secondary.map((sec, idx) => (
                              <li key={idx}>• {sec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SagittalFrontalAnalysis;
