import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  studentId: string;
  analysisRunId?: string;
  initialReportHtml?: string;
  initialRecommendations?: any[];
}

export const PublishToStudent = ({ studentId, analysisRunId, initialReportHtml = '', initialRecommendations = [] }: Props) => {
  const [open, setOpen] = useState(false);
  const [html, setHtml] = useState(initialReportHtml);
  const [recsText, setRecsText] = useState(
    initialRecommendations.map((r: any) => typeof r === 'string' ? r : r.text || r.message || '').join('\n')
  );
  const [loading, setLoading] = useState(false);

  const publish = async () => {
    setLoading(true);
    try {
      const recs = recsText.split('\n').filter(Boolean).map(text => ({ category: 'geral', text }));
      // Desativa publicações antigas
      await supabase.from('ppa_plan_links').update({ active: false }).eq('student_id', studentId).eq('active', true);
      // Cria nova publicação
      const { error } = await supabase.from('ppa_plan_links').insert({
        student_id: studentId,
        analysis_run_id: analysisRunId,
        active: true,
        published_at: new Date().toISOString(),
        report_html: html,
        recommendations: recs,
      });
      if (error) throw error;
      toast.success('Relatório publicado para o aluno');
      setOpen(false);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Send className="h-4 w-4 mr-2" /> Publicar para o Aluno</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Publicar entrega</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Relatório (HTML)</Label>
            <Textarea rows={8} value={html} onChange={e => setHtml(e.target.value)} placeholder="<h2>Diagnóstico</h2><p>...</p>" />
          </div>
          <div>
            <Label>Recomendações (1 por linha)</Label>
            <Textarea rows={5} value={recsText} onChange={e => setRecsText(e.target.value)} placeholder="Trocar tênis de corrida por solado rígido nos treinos de carga.&#10;Evitar permanecer sentado mais de 60min." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={publish} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Publicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PublishToStudent;
