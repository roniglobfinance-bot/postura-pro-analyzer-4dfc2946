import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Gauge, Wind, HeartPulse, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useActiveAssessment } from '@/contexts/ActiveAssessmentContext';
import { useAuth } from '@/hooks/useAuth';
import { analyzeSprintReadiness, SprintAssessmentInput, SprintAnalysisResult } from '@/services/highPerformanceEngine';

interface Props { onNavigate?: (v: string) => void; }

const PHASE_COLORS: Record<number, string> = {
  1: 'bg-red-100 text-red-800 border-red-300',
  2: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  3: 'bg-green-100 text-green-800 border-green-300',
};

const HighPerformanceEngine = ({ onNavigate }: Props) => {
  const { active } = useActiveAssessment();
  const { user } = useAuth();

  const [input, setInput] = useState<SprintAssessmentInput>({
    forwardHeadPostureDetected: false,
    thoracicMobilityRestricted: false,
    peakSpeedKmh: 0,
    cardiovascularRecoveryOk: true,
    strideFrequencyHz: undefined,
  });
  const [result, setResult] = useState<SprintAnalysisResult | null>(null);
  const [saving, setSaving] = useState(false);

  const runAnalysis = () => {
    const analysis = analyzeSprintReadiness(input);
    setResult(analysis);
    if (!analysis.current_phase.cleared_to_progress) {
      toast.warning(`Bloqueado na Fase ${analysis.current_phase.phase}: ${analysis.current_phase.blocking_reason}`);
    } else {
      toast.success('Liberado para carga dinâmica e vetores de velocidade!');
    }
  };

  const saveAssessment = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const studentId = active.studentId || user?.id;
      if (!studentId) throw new Error('Nenhum aluno selecionado');

      const { error } = await supabase.from('ppa_sprint_assessments' as any).insert({
        student_id: studentId,
        assessment_id: active.assessmentId || null,
        forward_head_posture_detected: input.forwardHeadPostureDetected,
        thoracic_mobility_restricted: input.thoracicMobilityRestricted,
        peak_speed_kmh: input.peakSpeedKmh,
        cardiovascular_recovery_ok: input.cardiovascularRecoveryOk,
        stride_frequency_hz: input.strideFrequencyHz || null,
        result: result as any,
      });
      if (error) throw error;
      toast.success('Avaliação de performance salva!');
    } catch (e: any) {
      toast.error(e.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
          <Gauge className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alta Performance — Sprint e Potência</h1>
          <p className="text-muted-foreground text-sm">
            Calibragem de biomecânica de corrida (vetores de FHP e liberação torácica) para aceleração até 22 km/h+.
            {active.studentName && <> — <strong>{active.studentName}</strong></>}
          </p>
        </div>
      </div>

      <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50">
        <CardContent className="p-4 text-sm text-cyan-900">
          <strong>Regra de Ouro do Sistema:</strong> nenhuma carga dinâmica de alta velocidade é liberada antes de resolver
          bloqueios de FHP (Forward Head Posture) e mobilidade torácica (Fase 1) e confirmar recuperação cardiovascular
          adequada (Fase 2) — independente de quão rápido o atleta já seja.
        </CardContent>
      </Card>

      {/* Formulário de avaliação */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Checklist de Avaliação</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={input.forwardHeadPostureDetected}
                onCheckedChange={v => setInput(prev => ({ ...prev, forwardHeadPostureDetected: !!v }))}
              />
              <Label className="text-sm font-normal">Forward Head Posture (FHP) detectada</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={input.thoracicMobilityRestricted}
                onCheckedChange={v => setInput(prev => ({ ...prev, thoracicMobilityRestricted: !!v }))}
              />
              <Label className="text-sm font-normal">Mobilidade torácica restrita (rotação de tronco limitada)</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={input.cardiovascularRecoveryOk}
                onCheckedChange={v => setInput(prev => ({ ...prev, cardiovascularRecoveryOk: !!v }))}
              />
              <Label className="text-sm font-normal">Recuperação cardiovascular pós-pico dentro do esperado</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Pico de velocidade (km/h)</Label>
              <Input
                type="number"
                min={0}
                step={0.1}
                value={input.peakSpeedKmh || ''}
                onChange={e => setInput(prev => ({ ...prev, peakSpeedKmh: Number(e.target.value) || 0 }))}
                placeholder="ex: 24.5"
              />
            </div>
            <div>
              <Label className="text-xs">Cadência de passada (Hz) — opcional</Label>
              <Input
                type="number"
                min={0}
                step={0.1}
                value={input.strideFrequencyHz || ''}
                onChange={e => setInput(prev => ({ ...prev, strideFrequencyHz: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="ex: 4.2"
              />
            </div>
          </div>

          <Button onClick={runAnalysis} className="w-full">
            <Gauge className="h-4 w-4 mr-2" /> Analisar Prontidão para Sprint
          </Button>
        </CardContent>
      </Card>

      {/* Resultado */}
      {result && (
        <>
          <Card className={result.current_phase.cleared_to_progress ? 'border-green-300' : 'border-red-300'}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {result.current_phase.cleared_to_progress ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Lock className="h-4 w-4 text-red-600" />}
                  Fase {result.current_phase.phase}: {result.current_phase.phase_name}
                </span>
                <Badge className={PHASE_COLORS[result.current_phase.phase]}>
                  {result.speed_classification === 'alta_performance' ? 'ALTA PERFORMANCE (22+ km/h)' : result.speed_classification === 'intermediario' ? 'Intermediário' : 'Base'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{result.current_phase.focus}</p>

              {!result.current_phase.cleared_to_progress && result.current_phase.blocking_reason && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm font-medium text-red-800">🔒 Bloqueado: {result.current_phase.blocking_reason}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium mb-2">Exercícios desta fase:</p>
                <div className="space-y-1">
                  {result.current_phase.exercises.map((ex, i) => (
                    <div key={i} className="text-xs flex items-center gap-2 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> {ex}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {result.vector_corrections.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Wind className="h-4 w-4" /> Correções de Vetor</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.vector_corrections.map((v, i) => (
                  <div key={i} className="p-2 rounded border bg-muted/30 text-xs">{v}</div>
                ))}
              </CardContent>
            </Card>
          )}

          {result.cardiovascular_alert && (
            <Card className="border-orange-200">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><HeartPulse className="h-4 w-4 text-orange-600" /> Alerta Cardiovascular</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-orange-800">{result.cardiovascular_alert}</p></CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button onClick={saveAssessment} disabled={saving} variant="outline">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {saving ? 'Salvando...' : 'Salvar Avaliação'}
            </Button>
            {result.current_phase.cleared_to_progress && (
              <Button onClick={() => onNavigate?.('session-tracker')}>
                <ArrowRight className="h-4 w-4 mr-2" /> Ir para Sessão de Treino
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default HighPerformanceEngine;
