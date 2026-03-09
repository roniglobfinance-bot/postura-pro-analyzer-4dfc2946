import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, TrendingUp, AlertTriangle, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useActiveAssessment } from '@/contexts/ActiveAssessmentContext';

interface MetricHistory {
  date: string;
  iep: number;
  ea: number;
  pts: number;
  tns: number;
}

interface MonitoringLog {
  id: string;
  created_at: string;
  integrity_result: string;
  tns: number;
  pain_delta: any;
  notes: string;
}

interface AssessmentSummary {
  id: string;
  status: string;
  created_at: string;
  context: any;
}

const ProgressDashboard = () => {
  const { active } = useActiveAssessment();
  const [loading, setLoading] = useState(true);
  const [metricHistory, setMetricHistory] = useState<MetricHistory[]>([]);
  const [monitoringLogs, setMonitoringLogs] = useState<MonitoringLog[]>([]);
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState(active.studentId || '');
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedStudentId) loadEvolutionData(selectedStudentId);
  }, [selectedStudentId]);

  const loadStudents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.rpc('get_teacher_students', { teacher_id: user.id });
    setStudents((data as any[]) || []);
    if (active.studentId) setSelectedStudentId(active.studentId);
    else if (data && (data as any[]).length > 0) setSelectedStudentId((data as any[])[0].student_id);
  };

  const loadEvolutionData = async (studentId: string) => {
    setLoading(true);
    try {
      // Load all assessments for student
      const { data: assessData } = await supabase
        .from('ppa_assessments' as any)
        .select('id, status, created_at, context')
        .eq('student_id', studentId)
        .order('created_at', { ascending: true });

      setAssessments((assessData as any[]) || []);

      // Load analysis runs and metrics for each assessment
      if (assessData && (assessData as any[]).length > 0) {
        const assessIds = (assessData as any[]).map(a => a.id);
        const { data: runs } = await supabase
          .from('ppa_analysis_runs' as any)
          .select('id, created_at, assessment_id')
          .in('assessment_id', assessIds)
          .eq('status', 'concluido')
          .order('created_at', { ascending: true });

        if (runs && (runs as any[]).length > 0) {
          const runIds = (runs as any[]).map(r => r.id);
          const { data: metrics } = await supabase
            .from('ppa_metrics' as any)
            .select('key, value, analysis_run_id')
            .in('analysis_run_id', runIds)
            .in('key', ['iep', 'ea', 'pts', 'tns']);

          // Group metrics by run
          const history: MetricHistory[] = (runs as any[]).map(run => {
            const runMetrics = (metrics as any[] || []).filter(m => m.analysis_run_id === run.id);
            const getValue = (key: string) => runMetrics.find(m => m.key === key)?.value || 0;
            return {
              date: new Date(run.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
              iep: getValue('iep'),
              ea: getValue('ea'),
              pts: getValue('pts'),
              tns: getValue('tns'),
            };
          });
          setMetricHistory(history);
        }
      }

      // Load monitoring logs
      const { data: logs } = await supabase
        .from('ppa_monitoring_logs' as any)
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(20);

      setMonitoringLogs((logs as MonitoringLog[]) || []);
    } catch (err) {
      console.error('Error loading evolution data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIntegrityColor = (result: string) => {
    if (result === 'pass') return 'bg-green-100 text-green-800';
    if (result === 'watch') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const selectedStudentName = students.find(s => s.student_id === selectedStudentId)?.full_name || 'Aluno';

  // Calculate trends
  const latestMetrics = metricHistory[metricHistory.length - 1];
  const previousMetrics = metricHistory.length > 1 ? metricHistory[metricHistory.length - 2] : null;
  const iepDelta = previousMetrics ? latestMetrics.iep - previousMetrics.iep : 0;
  const ptsDelta = previousMetrics ? latestMetrics.pts - previousMetrics.pts : 0;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Evolução</h1>
          <p className="text-muted-foreground text-sm">Histórico de métricas e progresso</p>
        </div>
        <div className="w-48">
          <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
            <SelectTrigger><SelectValue placeholder="Selecione aluno" /></SelectTrigger>
            <SelectContent>
              {students.map((s: any) => (
                <SelectItem key={s.student_id} value={s.student_id}>{s.full_name || s.email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Carregando dados...
        </div>
      ) : (
        <>
          {/* Trend cards */}
          {latestMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'IEP', value: latestMetrics.iep, delta: iepDelta, color: 'text-blue-600' },
                { label: 'EA', value: latestMetrics.ea, delta: previousMetrics ? latestMetrics.ea - previousMetrics.ea : 0, color: 'text-purple-600' },
                { label: 'PTS', value: latestMetrics.pts, delta: ptsDelta, color: 'text-green-600' },
                { label: 'TNS', value: latestMetrics.tns, delta: previousMetrics ? latestMetrics.tns - previousMetrics.tns : 0, color: 'text-orange-600', invertDelta: true },
              ].map(m => (
                <Card key={m.label}>
                  <CardContent className="p-4 text-center">
                    <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    {m.delta !== 0 && (
                      <Badge className={`mt-1 text-xs ${(m.invertDelta ? m.delta < 0 : m.delta > 0) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {m.delta > 0 ? '+' : ''}{m.delta}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Evolution Chart */}
          {metricHistory.length > 0 ? (
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Evolução Temporal</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metricHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="iep" stroke="#2563eb" strokeWidth={2} name="IEP" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="ea" stroke="#9333ea" strokeWidth={2} name="EA" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="pts" stroke="#16a34a" strokeWidth={2} name="PTS" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="tns" stroke="#ea580c" strokeWidth={2} name="TNS" strokeDasharray="5 5" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ) : (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              Nenhuma métrica registrada. Execute uma análise com Gemini e salve o relatório.
            </CardContent></Card>
          )}

          {/* Assessment History */}
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4" /> Avaliações ({assessments.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {assessments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma avaliação registrada.</p>
              ) : (
                assessments.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Badge className={a.status === 'pronto' ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}>{a.status}</Badge>
                      <span className="text-sm">{new Date(a.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{(a.context as any)?.objetivo || ''}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Monitoring Logs */}
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" /> Logs de Sessão ({monitoringLogs.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {monitoringLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum log de sessão registrado.</p>
              ) : (
                monitoringLogs.slice(0, 10).map(log => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Badge className={getIntegrityColor(log.integrity_result)}>{log.integrity_result}</Badge>
                      <span className="text-sm">{new Date(log.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">TNS: {log.tns}</span>
                      {(log.pain_delta as any)?.pre > 0 && (
                        <Badge variant="outline" className="text-xs">Dor: {(log.pain_delta as any).pre}/10</Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ProgressDashboard;
