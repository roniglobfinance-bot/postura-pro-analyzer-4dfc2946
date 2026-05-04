import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Upload, Loader2, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useActiveAssessment } from '@/contexts/ActiveAssessmentContext';

interface Props { onNavigate: (view: string) => void; }

const VIEWS = [
  { key: 'frente', label: 'Frente', view: 'anterior', side: 'NA' },
  { key: 'costas', label: 'Costas', view: 'posterior', side: 'NA' },
  { key: 'lado_d', label: 'Lado D', view: 'lateral_d', side: 'D' },
  { key: 'lado_e', label: 'Lado E', view: 'lateral_e', side: 'E' },
];

const ExpressAnalysis = ({ onNavigate }: Props) => {
  const { setAssessment, setAnalysisRunId } = useActiveAssessment();
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState('');

  const handleFile = (key: string, file: File | null) => {
    if (!file) return;
    setFiles(prev => ({ ...prev, [key]: file }));
    setPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
  };

  const allReady = VIEWS.every(v => files[v.key]);

  const runExpress = async () => {
    if (!allReady) {
      toast.error('Envie as 4 fotos primeiro');
      return;
    }
    setRunning(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      // 1. Cria assessment auto
      setProgress('Criando avaliação...');
      const { data: assessData, error: assessErr } = await supabase
        .from('ppa_assessments' as any)
        .insert({
          student_id: user.id,
          teacher_id: user.id,
          context: { modo: 'express', objetivo: 'Análise rápida' },
          pain: { intensidade: 0, regiao: 'nenhuma' },
          status: 'em_coleta',
        }).select('id').single();
      if (assessErr) throw assessErr;
      const assessmentId = (assessData as any).id;

      // 2. Upload fotos
      setProgress('Enviando fotos...');
      for (const v of VIEWS) {
        const file = files[v.key]!;
        const ext = file.name.split('.').pop();
        const path = `${assessmentId}/${v.key}.${ext}`;
        const { error: upErr } = await supabase.storage.from('photos').upload(path, file, { upsert: true, contentType: file.type });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path);
        await supabase.from('ppa_media_assets' as any).insert({
          assessment_id: assessmentId,
          image_url: urlData.publicUrl,
          view: v.view,
          side: v.side,
          type: 'foto',
          qa_status: 'pass',
          capture_confidence: 0.9,
        });
      }

      // 3. Dispara análise IA
      setProgress('Analisando com IA...');
      await supabase.from('ppa_assessments' as any).update({ status: 'analisando' }).eq('id', assessmentId);

      const { data: runData, error: runErr } = await supabase.from('ppa_analysis_runs' as any)
        .insert({ assessment_id: assessmentId, model_version: 'gemini-3-flash-express', status: 'rascunho' })
        .select('id').single();
      if (runErr) throw runErr;
      const runId = (runData as any).id;

      // 4. Edge function
      const { data: report, error: fnErr } = await supabase.functions.invoke('analyze-report', {
        body: { assessment_id: assessmentId, analysis_run_id: runId, mode: 'express' },
      });
      if (fnErr) console.warn('analyze-report error:', fnErr);

      setAssessment(assessmentId, user.id, user.email || 'Eu');
      setAnalysisRunId(runId);

      toast.success('Análise concluída!');
      onNavigate('results-hud');
    } catch (err: any) {
      toast.error(err.message || 'Erro na análise express');
    } finally {
      setRunning(false);
      setProgress('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Análise Express</h1>
          <p className="text-muted-foreground text-sm">4 fotos → Diagnóstico + Plano em ~30s</p>
        </div>
      </div>

      <Card className="border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardContent className="p-4 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-orange-500" />
          <p className="text-sm text-orange-900">Modo express pula o questionário. Use para triagem rápida ou análises do dia-a-dia.</p>
        </CardContent>
      </Card>

      {/* Grid de upload */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {VIEWS.map(v => (
          <Card key={v.key} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                {v.label}
                {files[v.key] && <CheckCircle className="h-4 w-4 text-green-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {previews[v.key] ? (
                <img src={previews[v.key]} alt={v.label} className="w-full h-32 object-cover rounded border" />
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded cursor-pointer hover:bg-muted/50">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Enviar</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleFile(v.key, e.target.files?.[0] || null)} />
                </label>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={allReady ? 'default' : 'outline'}>
              {Object.keys(files).filter(k => files[k]).length}/4 fotos
            </Badge>
            {progress && <span className="text-xs text-muted-foreground">{progress}</span>}
          </div>
          <Button onClick={runExpress} disabled={!allReady || running} size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            {running ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analisando...</>
            ) : (
              <><Zap className="h-4 w-4 mr-2" /> Analisar Agora <ArrowRight className="h-4 w-4 ml-2" /></>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpressAnalysis;
