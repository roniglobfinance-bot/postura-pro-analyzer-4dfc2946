import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Video, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MovementAnalyserProps { onNavigate?: (v: string) => void; studentId?: string; assessmentId?: string; }

export const MovementAnalyser = ({ studentId, assessmentId }: MovementAnalyserProps) => {
  const [exercise, setExercise] = useState('agachamento');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [frames, setFrames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideo = async (file: File) => {
    setVideoUrl(URL.createObjectURL(file));
    setLoading(true);
    // Frame sampling placeholder — produção usaria MediaPipe Pose
    const samples = Array.from({ length: 8 }, (_, i) => ({
      t: i * 0.5,
      kneeAngleL: 90 + Math.random() * 40, kneeAngleR: 90 + Math.random() * 40,
      hipAngle: 90 + Math.random() * 30, trunkAngle: 30 + Math.random() * 20,
    }));
    setFrames(samples);
    setLoading(false);
  };

  const analyse = async () => {
    if (!frames.length) { toast.error('Faça upload de um vídeo primeiro'); return; }
    setAnalysing(true); setResult(null);
    try {
      const romData = {
        kneeMin: Math.min(...frames.map(f => f.kneeAngleL)),
        kneeMax: Math.max(...frames.map(f => f.kneeAngleL)),
        hipMin: Math.min(...frames.map(f => f.hipAngle)),
        hipMax: Math.max(...frames.map(f => f.hipAngle)),
      };
      const { data, error } = await supabase.functions.invoke('analyze-movement', {
        body: { exerciseType: exercise, frames, romData, studentContext: { studentId } },
      });
      if (error) throw error;
      if (data?.status !== 'success') throw new Error(data?.error || 'Erro');
      setResult(data.analysis);

      if (assessmentId) {
        await supabase.from('ppa_movement_analyses').insert({
          assessment_id: assessmentId,
          exercise_type: exercise,
          keypoint_trajectory: frames,
          detected_faults: data.analysis.detected_faults,
          rom_data: romData,
          ai_summary: data.analysis.ai_summary,
        });
      }
      toast.success('Movimento analisado');
    } catch (e: any) { toast.error(e.message); } finally { setAnalysing(false); }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Video className="h-5 w-5" /> Movement Analyser — Análise de Execução</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Exercício</Label>
              <Select value={exercise} onValueChange={setExercise}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="agachamento">Agachamento</SelectItem>
                  <SelectItem value="hinge">Hip Hinge / RDL</SelectItem>
                  <SelectItem value="marcha">Marcha</SelectItem>
                  <SelectItem value="lunge">Avanço / Lunge</SelectItem>
                  <SelectItem value="overhead">Overhead Press</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Vídeo (5-15s)</Label>
              <Input type="file" accept="video/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleVideo(f); }} />
            </div>
          </div>

          {videoUrl && <video ref={videoRef} src={videoUrl} controls className="w-full max-h-64 rounded" />}
          {loading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Amostrando frames...</div>}

          <Button onClick={analyse} disabled={analysing || !frames.length} className="w-full">
            {analysing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analisando movimento...</> : 'Analisar com IA 9FIT'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resultado</span>
              <Badge className={result.load_recommendation === 'SHIELD' ? 'bg-destructive' : result.load_recommendation === 'LOAD' ? 'bg-green-600' : 'bg-yellow-600'}>
                {result.load_recommendation}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{result.ai_summary}</p>
            <div><p className="text-sm font-semibold">ROM:</p><p className="text-sm text-muted-foreground">{result.rom_assessment}</p></div>
            {result.pattern_match && result.pattern_match !== 'NONE' && (
              <Badge variant="outline" className="bg-primary/10">Padrão 9FIT: {result.pattern_match}</Badge>
            )}
            {result.detected_faults?.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Falhas detectadas:</p>
                {result.detected_faults.map((f: any, i: number) => (
                  <div key={i} className="p-2 border rounded text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-3 w-3 text-yellow-600" />
                      <span className="font-medium">{f.fault}</span>
                      <Badge variant="outline" className="text-xs">sev {f.severity}</Badge>
                      <Badge variant="outline" className="text-xs">{f.phase}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">→ {f.correction}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MovementAnalyser;
