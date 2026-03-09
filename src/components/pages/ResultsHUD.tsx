import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle,
  Eye,
  RefreshCw,
  Zap,
  Flame,
  Ruler,
  BarChart3,
} from 'lucide-react';
import RiskGauges from '@/components/dashboard/RiskGauges';
import HeatmapOverlay from '@/components/dashboard/HeatmapOverlay';
import AnalyticCanvas from '@/components/dashboard/AnalyticCanvas';

type ResultStatus = 'processando' | 'pronto' | 'baixa_confianca' | 'conflitante' | 'precisa_midia';

const ResultsHUD = () => {
  const [status] = useState<ResultStatus>('pronto');
  const [activeTab, setActiveTab] = useState('overview');

  // Demo image (placeholder)
  const demoImageUrl = '/placeholder.svg';

  // Demo keypoints
  const demoKeypoints = [
    { name: 'nose', x: 250, y: 60, confidence: 0.95 },
    { name: 'left_ear', x: 230, y: 55, confidence: 0.9 },
    { name: 'right_ear', x: 270, y: 57, confidence: 0.9 },
    { name: 'left_shoulder', x: 200, y: 130, confidence: 0.92 },
    { name: 'right_shoulder', x: 300, y: 125, confidence: 0.93 },
    { name: 'left_elbow', x: 170, y: 210, confidence: 0.88 },
    { name: 'right_elbow', x: 330, y: 205, confidence: 0.87 },
    { name: 'left_wrist', x: 160, y: 280, confidence: 0.82 },
    { name: 'right_wrist', x: 340, y: 275, confidence: 0.83 },
    { name: 'left_hip', x: 220, y: 300, confidence: 0.91 },
    { name: 'right_hip', x: 280, y: 295, confidence: 0.92 },
    { name: 'left_knee', x: 215, y: 420, confidence: 0.89 },
    { name: 'right_knee', x: 285, y: 415, confidence: 0.9 },
    { name: 'left_ankle', x: 210, y: 530, confidence: 0.85 },
    { name: 'right_ankle', x: 290, y: 525, confidence: 0.86 },
  ];

  // Demo tension zones for heatmap
  const demoTensionZones = [
    { id: 'z1', name: 'Cervical Posterior', x: 50, y: 15, intensity: 78, myofascialLine: 'SBL' },
    { id: 'z2', name: 'Trapézio Superior', x: 35, y: 22, intensity: 65, myofascialLine: 'LL' },
    { id: 'z3', name: 'Lombar', x: 50, y: 55, intensity: 85, myofascialLine: 'SBL' },
    { id: 'z4', name: 'Quadril Anterior', x: 45, y: 60, intensity: 55, myofascialLine: 'SFL' },
    { id: 'z5', name: 'Joelho Medial E', x: 40, y: 78, intensity: 70, myofascialLine: 'DFL' },
  ];

  // Demo risk values
  const risks = {
    lumbar: 72,
    cervical: 58,
    base: 45,
    overall: 62,
  };

  // HUD metric cards
  const hudCards = [
    { key: 'IEP', label: 'Estabilidade Podal', value: 72, icon: Activity, color: 'text-blue-600' },
    { key: 'EA', label: 'Espaço Articular', value: 58, icon: Zap, color: 'text-purple-600' },
    { key: 'PTS', label: 'Transferência Potência', value: 65, icon: Brain, color: 'text-green-600' },
    { key: 'TNS', label: 'Tremor Neuromuscular', value: 30, icon: Activity, color: 'text-orange-600' },
  ];

  const findings = [
    { key: 'anteriorização_cervical', direction: 'anterior', severity: 2, confidence: 0.85 },
    { key: 'rotacao_pelvica', direction: 'lateral', severity: 1, confidence: 0.72 },
    { key: 'valgo_joelho_e', direction: 'medial', severity: 2, confidence: 0.91 },
    { key: 'hiperlordose_lombar', direction: 'anterior', severity: 3, confidence: 0.88 },
  ];

  const motorStages = [
    { key: 'MAPPING_GPS', label: 'Mapeamento GPS', done: true },
    { key: 'LOAD_OR_SHIELD', label: 'Load / Shield', done: status === 'pronto' },
    { key: 'EXECUTION_INTEGRITY', label: 'Integridade Execução', done: false },
  ];

  const getSeverityColor = (s: number) => {
    if (s >= 3) return 'bg-red-100 text-red-800 border-red-300';
    if (s === 2) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resultados</h1>
          <p className="text-muted-foreground text-sm">Scanner Matricial + HUD de Análise</p>
        </div>
        <Badge variant={status === 'pronto' ? 'default' : 'outline'}>
          {status === 'pronto' && <CheckCircle className="h-3 w-3 mr-1" />}
          {status}
        </Badge>
      </div>

      {/* HUD Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {hudCards.map(card => {
          const Icon = card.icon;
          return (
            <Card key={card.key}>
              <CardContent className="p-4 text-center">
                <Icon className={`h-6 w-6 mx-auto mb-2 ${card.color}`} />
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <Progress value={card.value} className="mt-2 h-1.5" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Motor Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Linha do Tempo do Motor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {motorStages.map((stage, i) => (
              <div key={stage.key} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center gap-1 p-2 rounded text-xs flex-1 ${
                  stage.done ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-muted text-muted-foreground'
                }`}>
                  {stage.done ? <CheckCircle className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border-2" />}
                  {stage.label}
                </div>
                {i < motorStages.length - 1 && <span className="text-muted-foreground">→</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs: Overview / Análise Visual / Mapa de Calor / Achados */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <BarChart3 className="h-3 w-3 mr-1 hidden sm:inline" />
            Riscos
          </TabsTrigger>
          <TabsTrigger value="analysis" className="text-xs sm:text-sm">
            <Ruler className="h-3 w-3 mr-1 hidden sm:inline" />
            Análise
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="text-xs sm:text-sm">
            <Flame className="h-3 w-3 mr-1 hidden sm:inline" />
            Calor
          </TabsTrigger>
          <TabsTrigger value="findings" className="text-xs sm:text-sm">
            <AlertTriangle className="h-3 w-3 mr-1 hidden sm:inline" />
            Achados
          </TabsTrigger>
        </TabsList>

        {/* Tab: Risk Gauges */}
        <TabsContent value="overview" className="space-y-4">
          <RiskGauges
            lumbarRisk={risks.lumbar}
            cervicalRisk={risks.cervical}
            baseRisk={risks.base}
            overallScore={risks.overall}
          />
        </TabsContent>

        {/* Tab: Analytic Canvas */}
        <TabsContent value="analysis">
          <AnalyticCanvas
            imageUrl={demoImageUrl}
            keypoints={demoKeypoints}
          />
        </TabsContent>

        {/* Tab: Heatmap */}
        <TabsContent value="heatmap">
          <HeatmapOverlay
            imageUrl={demoImageUrl}
            tensionZones={demoTensionZones}
          />
        </TabsContent>

        {/* Tab: Findings */}
        <TabsContent value="findings" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Achados ({findings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {findings.map(f => (
                  <div key={f.key} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Badge className={getSeverityColor(f.severity)}>S{f.severity}</Badge>
                      <span className="text-sm font-medium">{f.key.replace(/_/g, ' ')}</span>
                      <Badge variant="outline" className="text-xs">{f.direction}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{Math.round(f.confidence * 100)}% conf.</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button><Brain className="h-4 w-4 mr-2" /> Gerar Plano Automático</Button>
        <Button variant="outline"><Eye className="h-4 w-4 mr-2" /> Revisar Manualmente</Button>
        <Button variant="outline"><RefreshCw className="h-4 w-4 mr-2" /> Solicitar Nova Mídia</Button>
      </div>

      {/* Micro-state alerts */}
      {status === 'baixa_confianca' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            LOW_CONFIDENCE: Confiança abaixo do limite. Plano automático bloqueado.
          </AlertDescription>
        </Alert>
      )}
      {status === 'conflitante' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            CONFLICTING_FINDINGS: Achados conflitantes detectados. Revisão manual obrigatória.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ResultsHUD;
