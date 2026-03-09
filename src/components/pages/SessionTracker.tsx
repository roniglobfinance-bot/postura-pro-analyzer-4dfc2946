import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, CheckCircle, Play, Square, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useActiveAssessment } from '@/contexts/ActiveAssessmentContext';

type SessionStatus = 'precheck' | 'executando' | 'finalizado' | 'watch' | 'fail';

const SessionTracker = () => {
  const { active } = useActiveAssessment();
  const [status, setStatus] = useState<SessionStatus>('precheck');
  const [painToday, setPainToday] = useState([0]);
  const [sleptWell, setSleptWell] = useState(false);
  const [shoeOk, setShoeOk] = useState(false);
  const [tns, setTns] = useState([50]);
  const [notes, setNotes] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const handleStartSession = () => {
    if (painToday[0] >= 8) {
      toast({ title: '⚠️ PAIN_SPIKE_ABORT', description: 'Dor muito alta. Sessão bloqueada.', variant: 'destructive' });
      setStatus('fail');
      return;
    }
    if (!shoeOk) {
      toast({ title: '⚠️ SHOE_INSTABILITY_CHECK', description: 'Calçado inadequado. Confirme antes de prosseguir.' });
    }
    setStatus('executando');
    toast({ title: 'Sessão iniciada', description: 'Registre eventos durante a execução.' });
  };

  const addEvent = (event: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEvents(prev => [...prev, `${timestamp} — ${event}`]);
    
    if (event === 'Dor subiu' && painToday[0] >= 6) {
      setStatus('fail');
      toast({ title: '🛑 PAIN_SPIKE_ABORT', description: 'Dor elevada. Fallback para Shield + Wakeup + Descompressão.', variant: 'destructive' });
    } else if (event === 'Tremor' && tns[0] > 70) {
      setStatus('watch');
      toast({ title: '⚠️ TREMOR_ESCAPE_RISK', description: 'TNS alto + tremor detectados. Monitoramento elevado.', variant: 'destructive' });
    } else if (event === 'Instável' && !shoeOk) {
      toast({ title: '⚠️ SHOE_INSTABILITY_CHECK', description: 'Instabilidade com calçado inadequado.' });
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const studentId = active.studentId || user.id;
      const integrityResult = status === 'fail' ? 'fail' : status === 'watch' ? 'watch' : 'pass';

      const painDelta = {
        pre: painToday[0],
        events: events.filter(e => e.includes('Dor subiu')).length,
        final_tns: tns[0],
      };

      const { error } = await supabase.from('ppa_monitoring_logs' as any).insert({
        student_id: studentId,
        session_id: active.assessmentId || `manual_${Date.now()}`,
        integrity_result: integrityResult,
        tns: tns[0],
        pain_delta: painDelta,
        notes: `${notes}\n\nEventos:\n${events.join('\n')}`,
      });

      if (error) throw error;

      setStatus('finalizado');
      toast({ title: 'Sessão finalizada', description: 'Log de monitoramento salvo no Supabase.' });
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
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
        <Badge variant={status === 'fail' ? 'destructive' : status === 'finalizado' ? 'default' : 'outline'}>
          {status}
        </Badge>
      </div>

      {/* Precheck */}
      {status === 'precheck' && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Checklist Pré-Sessão</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Dor hoje: {painToday[0]}/10</Label>
              <Slider value={painToday} onValueChange={setPainToday} max={10} step={1} className="mt-2" />
              {painToday[0] >= 7 && (
                <p className="text-xs text-destructive mt-1">⚠️ Dor alta — sessão pode ser bloqueada</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={sleptWell} onCheckedChange={(v) => setSleptWell(!!v)} />
              <Label>Dormiu bem? (≥6h)</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={shoeOk} onCheckedChange={(v) => setShoeOk(!!v)} />
              <Label>Calçado adequado para o treino?</Label>
            </div>

            {!sleptWell && (
              <div className="p-2 rounded border border-yellow-200 bg-yellow-50 text-xs text-yellow-800">
                Sono insuficiente: considere reduzir intensidade.
              </div>
            )}

            <Button onClick={handleStartSession}>
              <Play className="h-4 w-4 mr-2" /> Iniciar Sessão
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Executing */}
      {(status === 'executando' || status === 'watch') && (
        <>
          {status === 'watch' && (
            <div className="p-3 rounded-lg border border-orange-300 bg-orange-50 text-orange-800 text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> MODO WATCH — Monitoramento elevado ativo
            </div>
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

          <Card>
            <CardContent className="p-4 space-y-3">
              <Label>TNS (Tremor Neuromuscular): {tns[0]}</Label>
              <Slider value={tns} onValueChange={setTns} max={100} step={1} />
              {tns[0] > 70 && (
                <p className="text-xs text-destructive">⚠️ TNS alto — risco de fadiga neuromuscular</p>
              )}
            </CardContent>
          </Card>

          {events.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Eventos ({events.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {events.map((e, i) => (
                    <p key={i} className="text-xs text-muted-foreground font-mono">{e}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <Label>Notas</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações da sessão..." />
          </div>

          <Button onClick={handleFinish} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Square className="h-4 w-4 mr-2" />}
            {saving ? 'Salvando...' : 'Finalizar Sessão'}
          </Button>
        </>
      )}

      {/* Fail */}
      {status === 'fail' && (
        <div className="p-4 rounded-lg border border-red-300 bg-red-50 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-800">Sessão interrompida — Fallback Shield</span>
          </div>
          <p className="text-sm text-red-700">
            O treino foi automaticamente substituído por protocolo <strong>Shield + Wakeup Neural + Descompressão</strong>.
          </p>
          <div className="text-xs text-red-600 space-y-1">
            <p>• Descompressão Axial Suspensa (3x30s)</p>
            <p>• Cat-Cow Respirado (3x8)</p>
            <p>• Diafragma 360 (3x10)</p>
          </div>
          <Button variant="outline" onClick={() => { setStatus('precheck'); setEvents([]); }}>Nova Sessão</Button>
        </div>
      )}

      {/* Finished */}
      {status === 'finalizado' && (
        <div className="p-4 rounded-lg border border-green-300 bg-green-50 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <span className="text-sm text-green-800 font-medium">Sessão finalizada e salva.</span>
            <p className="text-xs text-green-700">
              Integridade: {events.filter(e => e.includes('Dor subiu')).length === 0 ? 'PASS ✓' : 'WATCH ⚠️'} |
              TNS final: {tns[0]} |
              Eventos: {events.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionTracker;
