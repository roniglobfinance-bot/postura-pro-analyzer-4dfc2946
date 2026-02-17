import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, CheckCircle, Play, Square, Activity } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type SessionStatus = 'precheck' | 'executando' | 'finalizado' | 'watch' | 'fail';

const SessionTracker = () => {
  const [status, setStatus] = useState<SessionStatus>('precheck');
  const [painToday, setPainToday] = useState([0]);
  const [sleptWell, setSleptWell] = useState(false);
  const [shoeOk, setShoeOk] = useState(false);
  const [tns, setTns] = useState([50]);
  const [notes, setNotes] = useState('');
  const [events, setEvents] = useState<string[]>([]);

  const handleStartSession = () => {
    if (painToday[0] >= 8) {
      toast({ title: '⚠️ PAIN_SPIKE_ABORT', description: 'Dor muito alta. Sessão bloqueada.', variant: 'destructive' });
      setStatus('fail');
      return;
    }
    setStatus('executando');
    toast({ title: 'Sessão iniciada', description: 'Registre eventos durante a execução.' });
  };

  const addEvent = (event: string) => {
    setEvents(prev => [...prev, `${new Date().toLocaleTimeString()} — ${event}`]);
    
    if (event === 'Dor subiu' && painToday[0] >= 6) {
      setStatus('fail');
      toast({ title: '🛑 PAIN_SPIKE_ABORT', description: 'Dor elevada. Fallback para Shield.', variant: 'destructive' });
    } else if (event === 'Tremor' && events.includes('Instável')) {
      setStatus('watch');
      toast({ title: '⚠️ TREMOR_ESCAPE_RISK', description: 'Tremor + instabilidade detectados.', variant: 'destructive' });
    }
  };

  const handleFinish = () => {
    setStatus('finalizado');
    toast({ title: 'Sessão finalizada', description: 'Log de monitoramento registrado.' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sessão</h1>
          <p className="text-muted-foreground text-sm">Execução e integridade do treino.</p>
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
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={sleptWell} onCheckedChange={(v) => setSleptWell(!!v)} />
              <Label>Dormiu bem?</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={shoeOk} onCheckedChange={(v) => setShoeOk(!!v)} />
              <Label>Calçado adequado?</Label>
            </div>
            <Button onClick={handleStartSession}>
              <Play className="h-4 w-4 mr-2" /> Iniciar Sessão
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Executing */}
      {(status === 'executando' || status === 'watch') && (
        <>
          <Card>
            <CardHeader><CardTitle className="text-sm">Botões Rápidos</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="destructive" size="sm" onClick={() => addEvent('Dor subiu')}>🔴 Dor subiu</Button>
                <Button variant="outline" size="sm" onClick={() => addEvent('Tremor')}>🟡 Tremor</Button>
                <Button variant="outline" size="sm" onClick={() => addEvent('Instável')}>🟠 Instável</Button>
                <Button variant="outline" size="sm" onClick={() => addEvent('Ok')}>🟢 Ok</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <Label>TNS (Tremor Neuromuscular): {tns[0]}</Label>
              <Slider value={tns} onValueChange={setTns} max={100} step={1} />
            </CardContent>
          </Card>

          {events.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Eventos ({events.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {events.map((e, i) => (
                    <p key={i} className="text-xs text-muted-foreground">{e}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <Label>Notas</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações da sessão..." />
          </div>

          <Button onClick={handleFinish}><Square className="h-4 w-4 mr-2" /> Finalizar Sessão</Button>
        </>
      )}

      {/* Fail */}
      {status === 'fail' && (
        <div className="p-4 rounded-lg border border-red-300 bg-red-50 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-800">Sessão interrompida — Fallback Shield</span>
          </div>
          <p className="text-sm text-red-700">O treino do dia foi automaticamente substituído por protocolo Shield + wakeup + descompressão.</p>
          <Button variant="outline" onClick={() => setStatus('precheck')}>Nova Sessão</Button>
        </div>
      )}

      {/* Finished */}
      {status === 'finalizado' && (
        <div className="p-4 rounded-lg border border-green-300 bg-green-50 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm text-green-800">Sessão finalizada. Log de monitoramento registrado.</span>
        </div>
      )}
    </div>
  );
};

export default SessionTracker;
