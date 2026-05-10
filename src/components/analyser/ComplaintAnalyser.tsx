import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ComplaintAnalysisResult {
  extracted_region: string;
  pattern_type: string;
  pattern_match: string;
  red_flags: string[];
  ai_interpretation: string;
  recommended_next_step: string;
}

export const ComplaintAnalyser = ({ studentId, assessmentId }: { studentId?: string; assessmentId?: string }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComplaintAnalysisResult | null>(null);

  const analyse = async () => {
    if (text.trim().length < 10) { toast.error('Descreva a queixa com mais detalhe'); return; }
    setLoading(true); setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-complaint', {
        body: { complaintText: text, studentContext: { studentId } },
      });
      if (error) throw error;
      if (data?.status !== 'success') throw new Error(data?.error || 'Erro');
      setResult(data.analysis);

      if (studentId) {
        await supabase.from('ppa_complaint_analyses').insert({
          student_id: studentId,
          assessment_id: assessmentId,
          raw_text: text,
          extracted_region: data.analysis.extracted_region,
          pattern_type: data.analysis.pattern_type,
          pattern_match: data.analysis.pattern_match,
          red_flags: data.analysis.red_flags,
          ai_interpretation: data.analysis.ai_interpretation,
        });
      }
      toast.success('Análise concluída');
    } catch (e: any) {
      toast.error(e.message || 'Falha na análise');
    } finally { setLoading(false); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Analisador de Queixa Textual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea rows={6} value={text} onChange={e => setText(e.target.value)} placeholder="Descreva a dor, limitação, contexto, calçado usado, momento em que aparece..." />
        <Button onClick={analyse} disabled={loading} className="w-full">
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analisando...</> : 'Analisar com IA 9FIT'}
        </Button>

        {result && (
          <div className="space-y-3 mt-4 p-4 bg-muted rounded-lg">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Região: {result.extracted_region}</Badge>
              <Badge variant="secondary">Padrão: {result.pattern_type}</Badge>
              {result.pattern_match !== 'NONE' && <Badge className="bg-primary">{result.pattern_match}</Badge>}
            </div>
            {result.red_flags?.length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-destructive">Red Flags:</p>
                  <ul className="list-disc ml-4">{result.red_flags.map((f, i) => <li key={i}>{f}</li>)}</ul>
                </div>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold mb-1">Interpretação:</p>
              <p className="text-sm">{result.ai_interpretation}</p>
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">Próximo passo:</p>
              <p className="text-sm">{result.recommended_next_step}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComplaintAnalyser;
