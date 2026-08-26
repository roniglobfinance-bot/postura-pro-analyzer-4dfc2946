import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, Play, Square, Loader2, ArrowRight, Clock, Info, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useActiveAssessment } from '@/contexts/ActiveAssessmentContext';
import { analyzeSessionReadiness, PeriodizerResult, SessionHistory } from '@/services/smartPeriodizer';
import { classifyTremor, TremorInput, TremorClassificationResult } from '@/services/tremorProtocol';

interface SessionTrackerProps {
  onNavigate?: (view: string) => void;
}

type SessionStatus = 'precheck' | 'executando' | 'finalizado' | 'watch' | 'fail';

const SessionTracker = ({ onNavigate }: SessionTrackerProps) => {
  const { active } = useActiveAssessment();
  const [status, setStatus] = useState<SessionStatus>('precheck');
  const [painToday, setPainToday] = useState([0]);
  const [sleptWell, setSleptWell] = useState(false);
  const [shoeOk, setShoeOk] = useState(false);
  const [tns, setTns] = useState([50]);
  const [notes, setNotes] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [planProtocols, setPlanProtocols] = useState<string[]>([]);
  const [periodizerResult, setPeriodizerResult] = useState<PeriodizerResult | null>(null);

  // === Protocolo de Tremor (item 5 do dossiê) ===
  const [showTremorCheck, setShowTremorCheck] = useState(false);
  const [tremorForm, setTremorForm] = useState<Partial<TremorInput>>({
    duringSet: true,
    intensity: 'leve',
    location: '',
    hasNumbnessOrTingling: false,
    ableToWalkNormallyAfter: true,
    recoveredWithin24h: undefined,
  });
  const [tremorResult, setTremorResult] = useState<TremorClassificationResult | null>(null);

  // Load active plan + periodizer check
  useEffect(() => {
    if (!active.studentId) return;
    const loadData = async () => {
      // Load active plan
      const { data } = await supabase
        .from('ppa_plan_links' as any).select('*, ppa_analysis_runs!inner(assessment_id)')
        .eq('student_id', active.studentId).eq('active', true).limit(1).single();
      if (data) {
        setActivePlan(data);
        const { data: decision } = await supabase
          .from('ppa_engine_decisions' as any).select('final_decision, macro_state')
          .eq('analysis_run_id', (data as any).analysis_run_id)
          .order('created_at', { ascending: false }).limit(1).single();
        if (decision) {
          const fd = (decision as any).final_decision;
          if (fd?.protocol) {
            const allSteps = [
              ...(fd.protocol.phase_1_release || []),
              ...(fd.protocol.phase_2_activation || []),
              ...(fd.protocol.phase_3_integration || []),
            ];
            setPlanProtocols(allSteps);
          }
        }
      }

      // Load recent sessions for Smart Periodizer
      const { data: logs } = await supabase
        .from('ppa_monitoring_logs' as any).select('*')
        .eq('student_id', active.studentId)
        .order('created_at', { ascending: false }).limit(10);
      
      if (logs) {
        const sessions: SessionHistory[] = (logs as any[]).map(l => ({
          session_id: l.session_id || l.id,
          created_at: l.created_at,
          integrity_result: l.integrity_result,
          tns: l.tns || 0,
          pain_delta: l.pain_delta || { pre: 0 },
        }));
        const result = analyzeSessionReadiness(sessions, painToday[0]);
        setPeriodizerResult(result);
      }
    };
    loadData();
  }, [active.studentId]);

  // Re-run periodizer when pain changes
  useEffect(() => {
    if (periodizerResult) {
      // Simple re-check - in production this would re-fetch
      setPeriodizerResult(prev => prev ? { ...prev, session_ready: painToday[0] < 7 } : null);
    }
  }, [painToday]);

  const handleStartSession = () => {
    if (painToday[0] >= 8) {
      toast({ title: '⚠️ PAIN_SPIKE_ABORT', description: 'Dor muito alta. Sessão bloqueada.', variant: 'destructive' });
      setStatus('fail');
      return;
    }
    if (periodizerResult && !periodizerResult.session_ready) {
      toast({ title: '⚠️ Smart Periodizer', description: 'Sessão não recomendada. Verifique alertas.', variant: 'destructive' });
      return;
    }
    if (!shoeOk) toast({ title: '⚠️ SHOE_INSTABILITY_CHECK', description: 'Calçado inadequado.' });
    setStatus('executando');
    toast({ title: 'Sessão iniciada' });
  };

  const addEvent = (event: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEvents(prev => [...prev, `${timestamp} — ${event}`]);
    if (event === 'Dor subiu' && painToday[0] >= 6) {
      setStatus('fail');
      handleFallbackShield();
    } else if (event === 'Tremor') {
      // Abre o check-in estruturado de tremor em vez de só marcar TNS alto
      setShowTremorCheck(true);
      setTremorResult(null);
    }
  };

  const runTremorClassification = () => {
    if (!tremorForm.location) {
      toast({ title: 'Informe onde ocorreu o tremor', variant: 'destructive' });
      return;
    }
    const input: TremorInput = {
      duringSet: tremorForm.duringSet ?? true,
      intensity: tremorForm.intensity ?? 'leve',
      location: tremorForm.location,
      hasNumbnessOrTingling: tremorForm.hasNumbnessOrTingling,
      ableToWalkNormallyAfter: tremorForm.ableToWalkNormallyAfter,
      recoveredWithin24h: tremorForm.recoveredWithin24h,
    };
    const classification = classifyTremor(input);
    setTremorResult(classification);
    setEvents(prev => [...prev, `${new Date().toLocaleTimeString()} — Tremor (${tremorForm.location}): ${classification.label}`]);

    if (classification.requires_medical_attention) {
      setStatus('fail');
      toast({ title: '🚨 ' + classification.label, description: classification.recommendation, variant: 'destructive' });
    } else if (classification.classification === 'possivel_choque_excessivo') {
      setStatus('watch');
      toast({ title: '⚠️ ' + classification.label, description: classification.recommendation });
    } else {
      toast({ title: '✅ ' + classification.label, description: classification.recommendation });
    }
  };

  const handleFallbackShield = async () => {
    toast({ title: '🛑 PAIN_SPIKE_ABORT', description: 'Fallback Shield ativado.', variant: 'destructive' });

    if (active.analysisRunId) {
      await supabase.from('ppa_engine_decisions' as any).insert({
        analysis_run_id: active.analysisRunId,
        macro_state: 'SHIELD',
        risk_level: 'alto',
        decided_by: 'auto-fallback',
        micro_states: ['PAIN_SPIKE_RISK', 'STABILITY_SHIELD'],
        final_decision: {
          reason: 'Pain spike during session execution',
          fallback: true,
          protocol: {
            phase_1_release: ['Descompressão Axial Suspensa (3x30s)', 'Cat-Cow Respirado (3x8)'],
            phase_2_activation: ['Diafragma 360 (3x10)'],
            phase_3_integration: [],
          },
        },
      });

      if (activePlan) {
        await supabase.from('ppa_plan_links' as any).update({ active: false }).eq('id', (activePlan as any).id);
      }
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const studentId = active.studentId || user.id;
      const integrityResult = status === 'fail' ? 'fail' : status === 'watch' ? 'watch' : 'pass';

      const { error } = await supabase.from('ppa_monitoring_logs' as any).insert({
        student_id: studentId,
        session_id: active.assessmentId || `manual_${Date.now()}`,
        integrity_result: integrityResult,
        tns: tns[0],
        pain_delta: { pre: painToday[0], events: events.filter(e => e.includes('Dor subiu')).length, final_tns: tns[0] },
        notes: `${notes}\n\nEventos:\n${events.join('\n')}`,
      });
      if (error) throw error;

      setStatus('finalizado');
      toast({ title: 'Sessão finalizada e salva' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sessão</h1>
          <p className="text-muted-foreground text-sm">
            Execução e integridade do treino.
            {active.studentName && <> — <strong>{active.studentName}</strong></>}
          </p>
        </div>
        <Badge variant={status === 'fail' ? 'destructive' : status === 'finalizado' ? 'default' : 'outline'}>{status}</Badge>
      </div>

      {/* Smart Periodizer Alerts */}
      {periodizerResult && status === 'precheck' && periodizerResult.alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" /> Smart Periodizer — Regra de 1 Hora
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {periodizerResult.alerts.map((a, i) => (
              <div key={i} className={`p-2 rounded-lg border text-xs ${
                a.severity === 'critical' ? 'border-red-300 bg-red-50 text-red-800' :
                a.severity === 'warning' ? 'border-yellow-300 bg-yellow-50 text-yellow-800' :
                'border-blue-200 bg-blue-50 text-blue-800'
              }`}>
                <p className="font-medium">{a.message}</p>
                <p className="mt-1 opacity-80">{a.recommendation}</p>
              </div>
            ))}
            <div className="flex gap-4 text-xs text-muted-foreground pt-1">
              <span>⏱ Duração: {periodizerResult.recommended_duration_minutes}min</span>
              <span>⏸ Micro-pausa: a cada {periodizerResult.micro_pause_interval_minutes}min</span>
              {periodizerResult.volume_adjustment_percent !== 0 && (
                <span className="text-destructive">📉 Volume: {periodizerResult.volume_adjustment_percent}%</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active plan protocols */}
      {planProtocols.length > 0 && status === 'precheck' && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Protocolo Ativo do Plano</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              {planProtocols.map((p, i) => <p key={i} className="text-xs text-muted-foreground">• {p}</p>)}
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'precheck' && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Checklist Pré-Sessão</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Dor hoje: {painToday[0]}/10</Label>
              <Slider value={painToday} onValueChange={setPainToday} max={10} step={1} className="mt-2" />
              {painToday[0] >= 7 && <p className="text-xs text-destructive mt-1">⚠️ Dor alta — sessão pode ser bloqueada</p>}
              {painToday[0] >= 3 && painToday[0] < 7 && <p className="text-xs text-yellow-600 mt-1">⚠️ Stop Sign: Dor {'>'} 3/10 — Modo SHIELD recomendado</p>}
            </div>
            <div className="flex items-center gap-2"><Checkbox checked={sleptWell} onCheckedChange={(v) => setSleptWell(!!v)} /><Label>Dormiu bem? (≥6h)</Label></div>
            <div className="flex items-center gap-2"><Checkbox checked={shoeOk} onCheckedChange={(v) => setShoeOk(!!v)} /><Label>Calçado adequado? (Fator Cleiton)</Label></div>
            {!sleptWell && <div className="p-2 rounded border border-yellow-200 bg-yellow-50 text-xs text-yellow-800">Sono insuficiente: reduza intensidade.</div>}
            <Button onClick={handleStartSession} disabled={periodizerResult ? !periodizerResult.session_ready : false}>
              <Play className="h-4 w-4 mr-2" /> Iniciar Sessão
            </Button>
          </CardContent>
        </Card>
      )}

      {(status === 'executando' || status === 'watch') && (
        <>
          {status === 'watch' && (
            <div className="p-3 rounded-lg border border-orange-300 bg-orange-50 text-orange-800 text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> MODO WATCH — Monitoramento elevado ativo
            </div>
          )}

          {/* Micro-pause reminder */}
          {periodizerResult && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                ⏸ Micro-pausa de mobilidade a cada {periodizerResult.micro_pause_interval_minutes}min (Cat-Cow, mobilidade torácica)
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader><CardTitle className="text-sm">Botões Rápidos</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="destructive" size="sm" onClick={() => addEvent('Dor subiu')}>🔴 Dor subiu</Button>
                <Button variant="outline" size="sm" onClick={() => addEvent('Tremor')}>🟡 Tremor</Button>
                <Button variant="outline" size="sm" onClick={() => addEvent('Instável')}>🟠 Instável</Button>
                <Button variant="outline" size="sm" onClick={() => addEvent('Técnica quebrou')}>🔵 Técnica quebrou</Button>
                <Button variant="outline" size="sm" onClick={() => addEvent('Ok')}>🟢 Ok</Button>
                <Button variant="outline" size="sm" onClick={() => addEvent('Compensação')}>⚪ Compensação</Button>
              </div>
            </CardContent>
          </Card>

          {/* PROTOCOLO DE TREMOR — check-in estruturado ao clicar em "Tremor" */}
          {showTremorCheck && (
            <Card className="border-yellow-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Check-in de Tremor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Onde ocorreu?</Label>
                  <input
                    className="w-full mt-1 px-3 py-2 text-sm border rounded-md bg-background"
                    placeholder="ex: perna esquerda, ombro..."
                    value={tremorForm.location || ''}
                    onChange={e => setTremorForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Intensidade</Label>
                  <Select value={tremorForm.intensity} onValueChange={(v: any) => setTremorForm(prev => ({ ...prev, intensity: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leve">Leve</SelectItem>
                      <SelectItem value="moderado">Moderado</SelectItem>
                      <SelectItem value="severo">Severo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={tremorForm.duringSet}
                    onCheckedChange={v => setTremorForm(prev => ({ ...prev, duringSet: !!v }))}
                  />
                  <Label className="text-sm font-normal">Aconteceu durante a série (não depois)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={tremorForm.hasNumbnessOrTingling}
                    onCheckedChange={v => setTremorForm(prev => ({ ...prev, hasNumbnessOrTingling: !!v }))}
                  />
                  <Label className="text-sm font-normal">Veio junto com formigamento ou dormência</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={tremorForm.ableToWalkNormallyAfter}
                    onCheckedChange={v => setTremorForm(prev => ({ ...prev, ableToWalkNormallyAfter: !!v }))}
                  />
                  <Label className="text-sm font-normal">Consegue andar/mover normalmente agora</Label>
                </div>

                <Button onClick={runTremorClassification} className="w-full" size="sm">
                  Classificar Tremor
                </Button>

                {tremorResult && (
                  <div className={`p-3 rounded-lg border ${
                    tremorResult.requires_medical_attention ? 'border-red-400 bg-red-50' :
                    tremorResult.classification === 'possivel_choque_excessivo' ? 'border-orange-300 bg-orange-50' :
                    'border-green-300 bg-green-50'
                  }`}>
                    <p className="text-sm font-bold">{tremorResult.label}</p>
                    <p className="text-xs mt-1">{tremorResult.explanation}</p>
                    <p className="text-xs mt-2 font-medium">→ {tremorResult.recommendation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card><CardContent className="p-4 space-y-3">
            <Label>TNS: {tns[0]}</Label>
            <Slider value={tns} onValueChange={setTns} max={100} step={1} />
            {tns[0] > 70 && <p className="text-xs text-destructive">⚠️ TNS alto — Tremor de fadiga vs fuga</p>}
          </CardContent></Card>
          {events.length > 0 && (
            <Card><CardHeader><CardTitle className="text-sm">Eventos ({events.length})</CardTitle></CardHeader>
              <CardContent><div className="space-y-1 max-h-40 overflow-y-auto">{events.map((e, i) => <p key={i} className="text-xs text-muted-foreground font-mono">{e}</p>)}</div></CardContent>
            </Card>
          )}
          <div><Label>Notas</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações..." /></div>
          <Button onClick={handleFinish} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Square className="h-4 w-4 mr-2" />}
            {saving ? 'Salvando...' : 'Finalizar Sessão'}
          </Button>
        </>
      )}

      {status === 'fail' && (
        <div className="p-4 rounded-lg border border-red-300 bg-red-50 space-y-3">
          <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-600" /><span className="font-medium text-red-800">Sessão interrompida — Fallback Shield</span></div>
          <div className="text-xs text-red-600 space-y-1">
            <p>• Descompressão Axial Suspensa (3x30s)</p>
            <p>• Cat-Cow Respirado (3x8)</p>
            <p>• Diafragma 360 (3x10)</p>
          </div>
          <Button variant="outline" onClick={() => { setStatus('precheck'); setEvents([]); setShowTremorCheck(false); }}>Nova Sessão</Button>
        </div>
      )}

      {status === 'finalizado' && (
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-green-300 bg-green-50 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <span className="text-sm text-green-800 font-medium">Sessão finalizada e salva.</span>
              <p className="text-xs text-green-700">TNS: {tns[0]} | Eventos: {events.length}</p>
            </div>
          </div>
          <Button onClick={() => onNavigate?.('progress-dashboard')}>
            <ArrowRight className="h-4 w-4 mr-2" /> Ver Evolução
          </Button>
        </div>
      )}
    </div>
  );
};

export default SessionTracker;
