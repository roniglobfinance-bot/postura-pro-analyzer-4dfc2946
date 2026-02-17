import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, AlertTriangle, Brain, CheckCircle, Eye, RefreshCw, Zap } from 'lucide-react';

type ResultStatus = 'processando' | 'pronto' | 'baixa_confianca' | 'conflitante' | 'precisa_midia';

const ResultsHUD = () => {
  const [status] = useState<ResultStatus>('pronto');

  // Demo data
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

      {/* HUD Cards */}
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
        <CardHeader><CardTitle className="text-sm">Linha do Tempo do Motor</CardTitle></CardHeader>
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

      {/* Findings */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Achados ({findings.length})</CardTitle></CardHeader>
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

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button><Brain className="h-4 w-4 mr-2" /> Gerar Plano Automático</Button>
        <Button variant="outline"><Eye className="h-4 w-4 mr-2" /> Revisar Manualmente</Button>
        <Button variant="outline"><RefreshCw className="h-4 w-4 mr-2" /> Solicitar Nova Mídia</Button>
      </div>

      {/* Micro-state alerts */}
      {status === 'baixa_confianca' && (
        <div className="p-3 rounded-lg border border-yellow-300 bg-yellow-50 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">LOW_CONFIDENCE: Confiança abaixo do limite. Plano automático bloqueado.</span>
        </div>
      )}
    </div>
  );
};

export default ResultsHUD;
