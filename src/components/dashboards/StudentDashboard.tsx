import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Activity, TrendingUp, Calendar, CheckCircle, AlertCircle, Loader2, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useActiveAssessment } from '@/contexts/ActiveAssessmentContext';

interface Props { onNavigate: (view: string) => void; }

const StudentDashboard = ({ onNavigate }: Props) => {
  const { setAssessment } = useActiveAssessment();
  const [loading, setLoading] = useState(true);
  const [lastAssessment, setLastAssessment] = useState<any>(null);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [pain, setPain] = useState([0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: assessData } = await supabase
        .from('ppa_assessments' as any)
        .select('id, status, created_at, context')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      if (assessData && (assessData as any[]).length > 0) setLastAssessment((assessData as any[])[0]);

      const { data: planData } = await supabase
        .from('ppa_plan_links' as any)
        .select('*')
        .eq('student_id', user.id)
        .eq('active', true)
        .limit(1);
      if (planData && (planData as any[]).length > 0) setActivePlan((planData as any[])[0]);

      const { data: logs } = await supabase
        .from('ppa_monitoring_logs' as any)
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentLogs((logs as any[]) || []);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('ppa_monitoring_logs' as any).insert({
        student_id: user.id,
        integrity_result: pain[0] > 6 ? 'fail' : pain[0] > 3 ? 'warn' : 'pass',
        tns: pain[0],
        pain_delta: { intensidade: pain[0] },
        notes: 'Check-in diário',
      });
      if (error) throw error;

      toast.success('Check-in registrado!');
      setPain([0]);
      load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Meu Painel</h1>
        <p className="text-muted-foreground text-sm">Sua avaliação, plano e progresso</p>
      </div>

      {/* Última avaliação */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Última Avaliação</CardTitle></CardHeader>
        <CardContent>
          {lastAssessment ? (
            <div className="flex items-center justify-between">
              <div>
                <Badge>{lastAssessment.status}</Badge>
                <p className="text-sm mt-2">{new Date(lastAssessment.created_at).toLocaleDateString('pt-BR')}</p>
                <p className="text-xs text-muted-foreground">{lastAssessment.context?.objetivo || 'Sem objetivo definido'}</p>
              </div>
              {lastAssessment.status === 'pronto' || lastAssessment.status === 'plano_gerado' ? (
                <Button size="sm" onClick={() => {
                  setAssessment(lastAssessment.id, '', '');
                  onNavigate('results-hud');
                }}>Ver Resultados</Button>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma avaliação ainda. Aguarde seu professor.</p>
          )}
        </CardContent>
      </Card>

      {/* Plano ativo */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" /> Plano Ativo</CardTitle></CardHeader>
        <CardContent>
          {activePlan ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span className="text-sm">Plano ativo desde {new Date(activePlan.created_at).toLocaleDateString('pt-BR')}</span></div>
              <Button variant="outline" size="sm" onClick={() => onNavigate('session-tracker')}>Iniciar Sessão</Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum plano ativo no momento.</p>
          )}
        </CardContent>
      </Card>

      {/* Check-in diário */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Heart className="h-4 w-4 text-red-500" /> Check-in de Dor</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm">Intensidade da dor hoje: <strong>{pain[0]}/10</strong></Label>
            <Slider value={pain} onValueChange={setPain} max={10} step={1} className="mt-2" />
          </div>
          <Button onClick={handleCheckIn} disabled={submitting} size="sm">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Registrar Check-in
          </Button>
          {pain[0] > 6 && (
            <div className="p-3 rounded-lg border border-red-300 bg-red-50 text-red-800 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <span>Dor alta detectada. Modo SHIELD será ativado. Procure seu professor.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico recente */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Histórico Recente</CardTitle></CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum check-in registrado ainda.</p>
          ) : (
            <div className="space-y-2">
              {recentLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-2 rounded border bg-muted/20 text-sm">
                  <span>{new Date(log.created_at).toLocaleDateString('pt-BR')}</span>
                  <Badge variant={log.integrity_result === 'fail' ? 'destructive' : log.integrity_result === 'warn' ? 'secondary' : 'default'}>
                    Dor: {log.tns}/10
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
