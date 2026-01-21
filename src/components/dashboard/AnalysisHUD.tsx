import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  FileText, 
  ListChecks, 
  Download,
  Share2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import RiskGauges from './RiskGauges';
import HeatmapOverlay from './HeatmapOverlay';
import AnalyticCanvas from './AnalyticCanvas';

interface GeminiAnalysis {
  status: string;
  macro_diagnosis: string;
  postural_archetype: 'Swayback' | 'FlatBack' | 'KyphoLordotic' | 'Normal';
  segments: {
    cervical: { finding: string; deviation_score: number; vector_angle?: number };
    shoulders: { finding: string; asymmetry_side?: 'L' | 'R'; drop_level?: 'low' | 'mid' | 'high' };
    pelvis: { finding: string; tilt?: number };
  };
  myofascial_lines: Array<{ 
    line_name: string; 
    status: 'tight' | 'weak'; 
    impact: string 
  }>;
  recovery_protocol: {
    phase_1_release: string[];
    phase_2_activation: string[];
    phase_3_integration: string[];
  };
}

interface Keypoint {
  name: string;
  x: number;
  y: number;
  confidence?: number;
}

interface AnalysisHUDProps {
  imageUrl: string;
  keypoints: Keypoint[];
  analysis: GeminiAnalysis | null;
  clientName?: string;
  onExportPDF?: () => void;
  onShare?: () => void;
}

const AnalysisHUD = ({ 
  imageUrl, 
  keypoints, 
  analysis,
  clientName = 'Cliente',
  onExportPDF,
  onShare
}: AnalysisHUDProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate risks from analysis
  const calculateRisks = () => {
    if (!analysis) {
      return { lumbar: 0, cervical: 0, base: 0, overall: 50 };
    }

    const cervicalRisk = analysis.segments.cervical.deviation_score || 0;
    const lumbarRisk = analysis.segments.pelvis.tilt 
      ? Math.min(100, Math.abs(analysis.segments.pelvis.tilt - 12) * 5)
      : 30;
    const baseRisk = analysis.myofascial_lines
      .filter(l => l.status === 'tight')
      .length * 20;

    const overall = 100 - Math.round((cervicalRisk + lumbarRisk + baseRisk) / 3);

    return { 
      lumbar: Math.min(100, lumbarRisk), 
      cervical: Math.min(100, cervicalRisk), 
      base: Math.min(100, baseRisk),
      overall: Math.max(0, overall)
    };
  };

  // Generate tension zones from analysis
  const generateTensionZones = () => {
    if (!analysis) return [];

    const zones = [];
    
    // Map myofascial lines to body zones
    analysis.myofascial_lines.forEach((line, idx) => {
      const zoneMap: Record<string, { x: number; y: number }> = {
        'SBL': { x: 50, y: 60 }, // Superficial Back Line
        'SFL': { x: 50, y: 40 }, // Superficial Front Line
        'LL': { x: 25, y: 50 },  // Lateral Line
        'SPL': { x: 30, y: 35 }, // Spiral Line
        'DFL': { x: 50, y: 70 }, // Deep Front Line
        'LSP': { x: 50, y: 55 }, // Linha Superficial Posterior
        'LPA': { x: 50, y: 35 }, // Linha Profunda Anterior
      };

      const position = zoneMap[line.line_name] || { x: 50, y: 50 + idx * 10 };
      
      zones.push({
        id: `zone-${idx}`,
        name: line.line_name,
        x: position.x,
        y: position.y,
        intensity: line.status === 'tight' ? 75 : 40,
        myofascialLine: line.line_name
      });
    });

    return zones;
  };

  const risks = calculateRisks();
  const tensionZones = generateTensionZones();

  const getArchetypeInfo = (archetype: string) => {
    const info: Record<string, { color: string; description: string }> = {
      'Swayback': { 
        color: 'bg-orange-100 text-orange-800', 
        description: 'Pelve anteriorizada, hipercifose torácica' 
      },
      'FlatBack': { 
        color: 'bg-blue-100 text-blue-800', 
        description: 'Retificação das curvas fisiológicas' 
      },
      'KyphoLordotic': { 
        color: 'bg-purple-100 text-purple-800', 
        description: 'Hipercifose + Hiperlordose' 
      },
      'Normal': { 
        color: 'bg-green-100 text-green-800', 
        description: 'Alinhamento postural adequado' 
      },
    };
    return info[archetype] || { color: 'bg-gray-100 text-gray-800', description: 'Padrão não identificado' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Análise Postural - {clientName}
              </h2>
              <p className="text-sm text-muted-foreground">
                Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex gap-2">
              {onShare && (
                <Button variant="outline" size="sm" onClick={onShare}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Compartilhar
                </Button>
              )}
              {onExportPDF && (
                <Button size="sm" onClick={onExportPDF}>
                  <Download className="h-4 w-4 mr-1" />
                  Exportar PDF
                </Button>
              )}
            </div>
          </div>

          {/* Macro Diagnosis */}
          {analysis && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Diagnóstico Macro:</strong> {analysis.macro_diagnosis}
              </AlertDescription>
            </Alert>
          )}

          {/* Postural Archetype Badge */}
          {analysis && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm font-medium">Arquétipo Postural:</span>
              <Badge className={getArchetypeInfo(analysis.postural_archetype).color}>
                {analysis.postural_archetype}
              </Badge>
              <span className="text-sm text-muted-foreground">
                - {getArchetypeInfo(analysis.postural_archetype).description}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analysis">Análise Visual</TabsTrigger>
          <TabsTrigger value="heatmap">Mapa de Calor</TabsTrigger>
          <TabsTrigger value="protocol">Protocolo</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Risk Gauges */}
            <RiskGauges
              lumbarRisk={risks.lumbar}
              cervicalRisk={risks.cervical}
              baseRisk={risks.base}
              overallScore={risks.overall}
            />

            {/* Segment Findings */}
            {analysis && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Achados por Segmento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Cervical</span>
                      <Badge variant={analysis.segments.cervical.deviation_score > 60 ? 'destructive' : 'secondary'}>
                        {analysis.segments.cervical.deviation_score}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {analysis.segments.cervical.finding}
                    </p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Ombros</span>
                      {analysis.segments.shoulders.asymmetry_side && (
                        <Badge variant="outline">
                          Assimetria {analysis.segments.shoulders.asymmetry_side === 'L' ? 'Esquerda' : 'Direita'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {analysis.segments.shoulders.finding}
                    </p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Pelve</span>
                      {analysis.segments.pelvis.tilt && (
                        <Badge variant="outline">
                          Inclinação: {analysis.segments.pelvis.tilt}°
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {analysis.segments.pelvis.finding}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Myofascial Lines */}
          {analysis && analysis.myofascial_lines.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Linhas Miofasciais Afetadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analysis.myofascial_lines.map((line, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-lg border ${
                        line.status === 'tight' 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{line.line_name}</span>
                        <Badge variant={line.status === 'tight' ? 'destructive' : 'secondary'}>
                          {line.status === 'tight' ? 'Encurtada' : 'Fraca'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{line.impact}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis">
          <AnalyticCanvas
            imageUrl={imageUrl}
            keypoints={keypoints}
          />
        </TabsContent>

        <TabsContent value="heatmap">
          <HeatmapOverlay
            imageUrl={imageUrl}
            tensionZones={tensionZones}
          />
        </TabsContent>

        <TabsContent value="protocol" className="space-y-4">
          {analysis ? (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ListChecks className="h-5 w-5" />
                    Protocolo de Recuperação - 3 Fases
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Phase 1 */}
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <h4 className="font-medium text-red-800 mb-2">
                      Fase 1: Liberação Miofascial
                    </h4>
                    <ul className="space-y-1">
                      {analysis.recovery_protocol.phase_1_release.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-red-600" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Phase 2 */}
                  <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                    <h4 className="font-medium text-yellow-800 mb-2">
                      Fase 2: Ativação Muscular
                    </h4>
                    <ul className="space-y-1">
                      {analysis.recovery_protocol.phase_2_activation.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-yellow-600" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Phase 3 */}
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">
                      Fase 3: Integração Funcional
                    </h4>
                    <ul className="space-y-1">
                      {analysis.recovery_protocol.phase_3_integration.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Execute a análise com IA para gerar o protocolo de recuperação.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalysisHUD;
