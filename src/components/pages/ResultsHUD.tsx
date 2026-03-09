import { useState, useEffect } from 'react';
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
  Loader2,
  Shield,
  FileText,
  Save,
} from 'lucide-react';
import RiskGauges from '@/components/dashboard/RiskGauges';
import HeatmapOverlay from '@/components/dashboard/HeatmapOverlay';
import AnalyticCanvas from '@/components/dashboard/AnalyticCanvas';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useActiveAssessment } from '@/contexts/ActiveAssessmentContext';

type ResultStatus = 'idle' | 'processando' | 'pronto' | 'baixa_confianca' | 'conflitante' | 'precisa_midia';

interface AIReport {
  macro_diagnosis: string;
  postural_archetype: string;
  confidence_score: number;
  risk_assessment: {
    lumbar_risk: number;
    cervical_risk: number;
    base_risk: number;
    overall_score: number;
  };
  hud_metrics: {
    iep: number;
    ea: number;
    pts: number;
    tns: number;
  };
  operational_mode: 'LOAD' | 'SHIELD' | 'MIXED';
  operational_justification: string;
  tension_zones: Array<{
    name: string;
    x: number;
    y: number;
    intensity: number;
    myofascial_line: string;
  }>;
  findings_analysis: Array<{
    key: string;
    direction: string;
    severity: number;
    confidence: number;
    clinical_note: string;
  }>;
  guardrails: Array<{
    code: string;
    triggered: boolean;
    message: string;
  }>;
  recovery_protocol: {
    phase_1_release: string[];
    phase_2_activation: string[];
    phase_3_integration: string[];
  };
  clinical_summary: string;
}

interface SupabaseFindings {
  finding_key: string;
  direction: string | null;
  severity: number;
  confidence: number | null;
}

interface SupabaseMetric {
  key: string;
  value: number;
  unit: string | null;
  severity: number;
}

interface SupabaseCluster {
  cluster_types: any;
  score: number;
}

const ResultsHUD = () => {
  const { active, setAnalysisRunId, setStatus: setFlowStatus } = useActiveAssessment();
  const [status, setStatus] = useState<ResultStatus>('idle');
  const [activeTab, setActiveTab] = useState('overview');
  const [aiReport, setAiReport] = useState<AIReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('/placeholder.svg');

  // Real data from Supabase
  const [realFindings, setRealFindings] = useState<SupabaseFindings[]>([]);
  const [realMetrics, setRealMetrics] = useState<SupabaseMetric[]>([]);
  const [realClusters, setRealClusters] = useState<SupabaseCluster[]>([]);

  // Load real data when assessment is active
  useEffect(() => {
    if (!active.assessmentId) return;
    loadAssessmentData();
  }, [active.assessmentId, active.analysisRunId]);

  const loadAssessmentData = async () => {
    try {
      // Load first photo for canvas
      const { data: photos } = await supabase
        .from('ppa_media_assets' as any)
        .select('image_url, view')
        .eq('assessment_id', active.assessmentId)
        .limit(1);
      
      if (photos && (photos as any[]).length > 0) {
        setPhotoUrl((photos as any[])[0].image_url);
      }

      // If we have an analysis run, load its data
      if (active.analysisRunId) {
        const [findingsRes, metricsRes, clustersRes] = await Promise.all([
          supabase.from('ppa_findings' as any).select('*').eq('analysis_run_id', active.analysisRunId),
          supabase.from('ppa_metrics' as any).select('*').eq('analysis_run_id', active.analysisRunId),
          supabase.from('ppa_clusters' as any).select('*').eq('analysis_run_id', active.analysisRunId),
        ]);
        
        if (findingsRes.data) setRealFindings(findingsRes.data as any[]);
        if (metricsRes.data) setRealMetrics(metricsRes.data as any[]);
        if (clustersRes.data) setRealClusters(clustersRes.data as any[]);
      }
    } catch (err) {
      console.error('Error loading assessment data:', err);
    }
  };

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

  // Default demo data when no AI report and no real data
  const defaultFindings = [
    { finding_key: 'anteriorização_cervical', direction: 'anterior', severity: 2, confidence: 0.85 },
    { finding_key: 'rotacao_pelvica', direction: 'lateral', severity: 1, confidence: 0.72 },
    { finding_key: 'valgo_joelho_e', direction: 'medial', severity: 2, confidence: 0.91 },
    { finding_key: 'hiperlordose_lombar', direction: 'anterior', severity: 3, confidence: 0.88 },
  ];

  const defaultTensionZones = [
    { id: 'z1', name: 'Cervical Posterior', x: 50, y: 15, intensity: 78, myofascialLine: 'SBL' },
    { id: 'z2', name: 'Trapézio Superior', x: 35, y: 22, intensity: 65, myofascialLine: 'LL' },
    { id: 'z3', name: 'Lombar', x: 50, y: 55, intensity: 85, myofascialLine: 'SBL' },
    { id: 'z4', name: 'Quadril Anterior', x: 45, y: 60, intensity: 55, myofascialLine: 'SFL' },
    { id: 'z5', name: 'Joelho Medial E', x: 40, y: 78, intensity: 70, myofascialLine: 'DFL' },
  ];

  // Use real data > AI data > demo
  const findingsForDisplay = aiReport
    ? aiReport.findings_analysis.map(f => ({ key: f.key, direction: f.direction, severity: f.severity, confidence: f.confidence, clinical_note: f.clinical_note }))
    : realFindings.length > 0
    ? realFindings.map(f => ({ key: f.finding_key, direction: f.direction || 'anterior', severity: f.severity, confidence: f.confidence || 0, clinical_note: '' }))
    : defaultFindings.map(f => ({ key: f.finding_key, direction: f.direction, severity: f.severity, confidence: f.confidence, clinical_note: '' }));

  const risks = aiReport
    ? aiReport.risk_assessment
    : { lumbar_risk: 72, cervical_risk: 58, base_risk: 45, overall_score: 62 };

  const hudCards = [
    { key: 'IEP', label: 'Estabilidade Podal', value: aiReport?.hud_metrics.iep ?? 72, icon: Activity, color: 'text-blue-600' },
    { key: 'EA', label: 'Espaço Articular', value: aiReport?.hud_metrics.ea ?? 58, icon: Zap, color: 'text-purple-600' },
    { key: 'PTS', label: 'Transferência Potência', value: aiReport?.hud_metrics.pts ?? 65, icon: Brain, color: 'text-green-600' },
    { key: 'TNS', label: 'Tremor Neuromuscular', value: aiReport?.hud_metrics.tns ?? 30, icon: Activity, color: 'text-orange-600' },
  ];

  const tensionZones = aiReport
    ? aiReport.tension_zones.map((z, i) => ({ id: `z${i}`, name: z.name, x: z.x, y: z.y, intensity: z.intensity, myofascialLine: z.myofascial_line }))
    : defaultTensionZones;

  const motorStages = [
    { key: 'MAPPING_GPS', label: 'Mapeamento GPS', done: status === 'pronto' || aiReport !== null },
    { key: 'LOAD_OR_SHIELD', label: 'Load / Shield', done: aiReport !== null },
    { key: 'EXECUTION_INTEGRITY', label: 'Integridade Execução', done: false },
  ];

  const triggeredGuardrails = aiReport?.guardrails.filter(g => g.triggered) || [];

  const getSeverityColor = (s: number) => {
    if (s >= 3) return 'bg-red-100 text-red-800 border-red-300';
    if (s === 2) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const getModeColor = (mode: string) => {
    if (mode === 'LOAD') return 'bg-green-100 text-green-800';
    if (mode === 'SHIELD') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setStatus('processando');
    
    // Use real data if available, otherwise demo
    const findingsPayload = realFindings.length > 0
      ? realFindings.map(f => ({ key: f.finding_key, direction: f.direction, severity: f.severity, confidence: f.confidence }))
      : defaultFindings.map(f => ({ key: f.finding_key, direction: f.direction, severity: f.severity, confidence: f.confidence }));

    const metricsPayload = realMetrics.length > 0
      ? realMetrics.map(m => ({ key: m.key, value: m.value, unit: m.unit, severity: m.severity }))
      : [
          { key: 'cranio_cervical_angle', value: 48, unit: 'degrees', severity: 2 },
          { key: 'pelvic_tilt', value: 18, unit: 'degrees', severity: 1 },
          { key: 'shoulder_imbalance', value: 3.5, unit: 'cm', severity: 1 },
          { key: 'thoracic_kyphosis', value: 42, unit: 'degrees', severity: 2 },
        ];

    const clustersPayload = realClusters.length > 0
      ? realClusters.map(c => ({ cluster_types: c.cluster_types, score: c.score }))
      : [{ cluster_types: ['compressive_upper', 'instability_lower'], score: 68 }];

    try {
      const { data, error } = await supabase.functions.invoke('analyze-report', {
        body: {
          findings: findingsPayload,
          metrics: metricsPayload,
          clusters: clustersPayload,
          clientData: {
            name: active.studentName || 'Cliente',
            age: 35,
            height: 175,
            weight: 72,
          },
          context: {
            footwear: active.context.calcado || 'não_informado',
            surface: active.context.superficie || 'plano',
            objective: active.context.objetivo || 'correção_postural',
            environment: active.context.ambiente || 'indoor',
          },
          pain: {
            region: active.pain.regiao || 'não_informada',
            intensity: active.pain.intensidade || 0,
            triggers: active.pain.gatilhos || 'nenhum',
          },
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        toast.error('Erro ao analisar relatório. Tente novamente.');
        setStatus('idle');
        return;
      }

      if (data?.status === 'error') {
        toast.error(data.error || 'Erro na análise');
        setStatus('idle');
        return;
      }

      if (data?.report) {
        setAiReport(data.report);
        setStatus('pronto');
        
        if (data.report.confidence_score < 0.6) {
          setStatus('baixa_confianca');
          toast.warning('Confiança baixa. Revise os dados manualmente.');
        } else {
          toast.success('Análise concluída com sucesso!');
        }
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      if (err?.message?.includes('429')) {
        toast.error('Rate limit excedido. Aguarde alguns segundos.');
      } else if (err?.message?.includes('402')) {
        toast.error('Créditos insuficientes. Adicione créditos no workspace.');
      } else {
        toast.error('Erro inesperado na análise.');
      }
      setStatus('idle');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save AI report to Supabase
  const handleSaveReport = async () => {
    if (!aiReport || !active.assessmentId) return;
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      // Create analysis run
      const { data: runData, error: runError } = await supabase.from('ppa_analysis_runs' as any).insert({
        assessment_id: active.assessmentId,
        status: 'concluido',
        model_version: 'gemini-3-flash',
        confidence_final: aiReport.confidence_score,
        dominant_vector: {
          archetype: aiReport.postural_archetype,
          mode: aiReport.operational_mode,
        },
      }).select('id').single();

      if (runError) throw runError;
      const runId = (runData as any).id;
      setAnalysisRunId(runId);

      // Save findings
      if (aiReport.findings_analysis.length > 0) {
        const findingsInsert = aiReport.findings_analysis.map(f => ({
          analysis_run_id: runId,
          finding_key: f.key,
          direction: f.direction,
          severity: f.severity,
          confidence: f.confidence,
          chain: { clinical_note: f.clinical_note },
        }));
        await supabase.from('ppa_findings' as any).insert(findingsInsert);
      }

      // Save metrics (HUD)
      const metricsInsert = [
        { analysis_run_id: runId, key: 'iep', value: aiReport.hud_metrics.iep, unit: '%', severity: aiReport.hud_metrics.iep < 50 ? 2 : 1 },
        { analysis_run_id: runId, key: 'ea', value: aiReport.hud_metrics.ea, unit: '%', severity: aiReport.hud_metrics.ea < 50 ? 2 : 1 },
        { analysis_run_id: runId, key: 'pts', value: aiReport.hud_metrics.pts, unit: '%', severity: aiReport.hud_metrics.pts < 50 ? 2 : 1 },
        { analysis_run_id: runId, key: 'tns', value: aiReport.hud_metrics.tns, unit: '%', severity: aiReport.hud_metrics.tns > 50 ? 2 : 1 },
        { analysis_run_id: runId, key: 'lumbar_risk', value: aiReport.risk_assessment.lumbar_risk, unit: '%', severity: aiReport.risk_assessment.lumbar_risk > 60 ? 3 : 1 },
        { analysis_run_id: runId, key: 'cervical_risk', value: aiReport.risk_assessment.cervical_risk, unit: '%', severity: aiReport.risk_assessment.cervical_risk > 60 ? 3 : 1 },
        { analysis_run_id: runId, key: 'base_risk', value: aiReport.risk_assessment.base_risk, unit: '%', severity: aiReport.risk_assessment.base_risk > 60 ? 3 : 1 },
      ];
      await supabase.from('ppa_metrics' as any).insert(metricsInsert);

      // Save engine decision
      await supabase.from('ppa_engine_decisions' as any).insert({
        analysis_run_id: runId,
        macro_state: aiReport.operational_mode,
        risk_level: aiReport.risk_assessment.overall_score > 70 ? 'alto' : aiReport.risk_assessment.overall_score > 40 ? 'moderado' : 'baixo',
        decided_by: 'gemini-auto',
        micro_states: aiReport.guardrails.filter(g => g.triggered).map(g => g.code),
        final_decision: {
          mode: aiReport.operational_mode,
          justification: aiReport.operational_justification,
          protocol: aiReport.recovery_protocol,
          diagnosis: aiReport.macro_diagnosis,
          archetype: aiReport.postural_archetype,
          clinical_summary: aiReport.clinical_summary,
        },
      });

      // Update assessment status
      await supabase.from('ppa_assessments' as any)
        .update({ status: 'pronto' })
        .eq('id', active.assessmentId);

      setFlowStatus('pronto');
      toast.success('Relatório salvo no Supabase!');
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resultados</h1>
          <p className="text-muted-foreground text-sm">
            Scanner Matricial + HUD de Análise
            {active.studentName && <> — <strong>{active.studentName}</strong></>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {aiReport && (
            <Badge className={getModeColor(aiReport.operational_mode)}>
              <Shield className="h-3 w-3 mr-1" />
              {aiReport.operational_mode}
            </Badge>
          )}
          <Badge variant={status === 'pronto' ? 'default' : 'outline'}>
            {status === 'pronto' && <CheckCircle className="h-3 w-3 mr-1" />}
            {status === 'processando' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
            {status === 'idle' ? 'aguardando' : status}
          </Badge>
        </div>
      </div>

      {/* No assessment warning */}
      {!active.assessmentId && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Nenhuma avaliação ativa selecionada. Os dados abaixo são demonstrativos.
          </AlertDescription>
        </Alert>
      )}

      {/* AI Report Banner */}
      {aiReport && (
        <Alert>
          <Brain className="h-4 w-4" />
          <AlertDescription>
            <strong>Diagnóstico Gemini:</strong> {aiReport.macro_diagnosis}
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{aiReport.postural_archetype}</Badge>
              <span className="text-xs text-muted-foreground">
                Confiança: {Math.round(aiReport.confidence_score * 100)}%
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Guardrail Alerts */}
      {triggeredGuardrails.map((g, i) => (
        <Alert key={i} variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{g.code}:</strong> {g.message}
          </AlertDescription>
        </Alert>
      ))}

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

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <BarChart3 className="h-3 w-3 mr-1 hidden sm:inline" />Riscos
          </TabsTrigger>
          <TabsTrigger value="analysis" className="text-xs sm:text-sm">
            <Ruler className="h-3 w-3 mr-1 hidden sm:inline" />Análise
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="text-xs sm:text-sm">
            <Flame className="h-3 w-3 mr-1 hidden sm:inline" />Calor
          </TabsTrigger>
          <TabsTrigger value="findings" className="text-xs sm:text-sm">
            <AlertTriangle className="h-3 w-3 mr-1 hidden sm:inline" />Achados
          </TabsTrigger>
          <TabsTrigger value="protocol" className="text-xs sm:text-sm" disabled={!aiReport}>
            <FileText className="h-3 w-3 mr-1 hidden sm:inline" />Protocolo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <RiskGauges lumbarRisk={risks.lumbar_risk} cervicalRisk={risks.cervical_risk} baseRisk={risks.base_risk} overallScore={risks.overall_score} />
        </TabsContent>

        <TabsContent value="analysis">
          <AnalyticCanvas imageUrl={photoUrl} keypoints={demoKeypoints} />
        </TabsContent>

        <TabsContent value="heatmap">
          <HeatmapOverlay imageUrl={photoUrl} tensionZones={tensionZones} />
        </TabsContent>

        <TabsContent value="findings" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Achados ({findingsForDisplay.length})
                {realFindings.length > 0 && <Badge variant="outline" className="ml-2 text-xs">Dados reais</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {findingsForDisplay.map(f => (
                  <div key={f.key} className="p-3 rounded-lg border space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={getSeverityColor(f.severity)}>S{f.severity}</Badge>
                        <span className="text-sm font-medium">{f.key.replace(/_/g, ' ')}</span>
                        <Badge variant="outline" className="text-xs">{f.direction}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{Math.round(f.confidence * 100)}% conf.</span>
                    </div>
                    {f.clinical_note && (
                      <p className="text-xs text-muted-foreground pl-12">{f.clinical_note}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocol" className="space-y-4">
          {aiReport && (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Modo Operacional Recomendado</h3>
                      <p className="text-sm text-muted-foreground mt-1">{aiReport.operational_justification}</p>
                    </div>
                    <Badge className={`text-lg px-4 py-2 ${getModeColor(aiReport.operational_mode)}`}>
                      {aiReport.operational_mode}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Protocolo de Recuperação - 3 Fases</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <h4 className="font-medium text-red-800 mb-2">Fase 1: Liberação Miofascial</h4>
                    <ul className="space-y-1">
                      {aiReport.recovery_protocol.phase_1_release.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-red-600 shrink-0" />{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                    <h4 className="font-medium text-yellow-800 mb-2">Fase 2: Ativação Muscular</h4>
                    <ul className="space-y-1">
                      {aiReport.recovery_protocol.phase_2_activation.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-yellow-600 shrink-0" />{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">Fase 3: Integração Funcional</h4>
                    <ul className="space-y-1">
                      {aiReport.recovery_protocol.phase_3_integration.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Resumo Clínico</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{aiReport.clinical_summary}</p>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleAnalyze} disabled={isAnalyzing}>
          {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
          {isAnalyzing ? 'Analisando com Gemini...' : aiReport ? 'Reanalisar com IA' : 'Analisar com Gemini'}
        </Button>
        {aiReport && (
          <Button variant="outline" onClick={handleSaveReport} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {isSaving ? 'Salvando...' : 'Salvar Relatório'}
          </Button>
        )}
        <Button variant="outline" disabled={!aiReport}>
          <Eye className="h-4 w-4 mr-2" /> Revisar Manualmente
        </Button>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" /> Solicitar Nova Mídia
        </Button>
      </div>

      {/* Micro-state alerts */}
      {status === 'baixa_confianca' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>LOW_CONFIDENCE: Confiança abaixo do limite. Plano automático bloqueado.</AlertDescription>
        </Alert>
      )}
      {status === 'conflitante' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>CONFLICTING_FINDINGS: Achados conflitantes detectados. Revisão manual obrigatória.</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ResultsHUD;
