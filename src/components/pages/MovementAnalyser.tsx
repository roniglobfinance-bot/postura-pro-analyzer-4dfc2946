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
import { extractVideoAnalysisData, type AngleTrajectoryPoint } from '@/services/videoFrameExtractionService';

interface MovementAnalyserProps { onNavigate?: (v: string) => void; studentId?: string; assessmentId?: string; }

export const MovementAnalyser = ({ studentId, assessmentId }: MovementAnalyserProps) => {
  const [exercise, setExercise] = useState('agachamento');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [frames, setFrames] = useState<string[]>([]);
  const [trajectory, setTrajectory] = useState<AngleTrajectoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideo = async (file: File) => {
    setResult(null);
    setFrames([]);
    setTrajectory([]);
    setVideoUrl(URL.createObjectURL(file));
  };

  const processVideo = async () => {
    const video = videoRef.current;
    if (!video) { toast.error('Faça upload de um vídeo primeiro'); return; }
    setLoading(true);
    try {
      const { frames_base64, angle_trajectory } = await extractVideoAnalysisData(video, 8);
      setFrames(frames_base64);
      setTrajectory(angle_trajectory);
      const detected = angle_trajectory.filter(f => f.pose_detected).length;
      if (!detected) toast.warning('Nenhuma pose detectada nos frames — verifique o enquadramento');
      else toast.success(`${frames_base64.length} frames extraídos · pose em ${detected}`);
    } catch (e: any) {
      toast.error(e.message || 'Falha ao extrair frames');
    } finally {
      setLoading(false);
    }
  };

  const analyse = async () => {
    if (!frames.length) { toast.error('Extraia os frames do vídeo primeiro'); return; }
    setAnalysing(true); setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-movement', {
        body: {
          exerciseType: exercise,
          frames_base64: frames,
          angle_trajectory: trajectory,
          assessmentId: assessmentId || null,
          studentContext: { studentId },
        },
      });
      if (error) throw error;
      if (data?.status !== 'success') throw new Error(data?.error || 'Erro');
      setResult(data.analysis);
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

          {videoUrl && (
            <video ref={videoRef} src={videoUrl} controls playsInline crossOrigin="anonymous" className="w-full max-h-64 rounded" />
          )}

          {videoUrl && (
            <Button variant="outline" onClick={processVideo} disabled={loading} className="w-full">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Extraindo frames e detectando pose...</> : 'Extrair frames + MediaPipe'}
            </Button>
          )}

          {frames.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {frames.length} frames-chave · pose detectada em {trajectory.filter(f => f.pose_detected).length}
            </p>
          )}

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
            {result.pattern_match && (
              <Badge variant="outline" className="bg-primary/10">Diagnóstico (motor de regras): {result.pattern_match}</Badge>
            )}
            {result.detected_flags?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {result.detected_flags.map((f: string) => (
                  <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                ))}
              </div>
            )}
            {result.affected_lines?.length > 0 && (
              <p className="text-xs text-muted-foreground">Linhas miofasciais: {result.affected_lines.join(', ')}</p>
            )}
            {result.mechanisms?.length > 0 && (
              <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                {result.mechanisms.map((m: string, i: number) => <li key={i}>{m}</li>)}
              </ul>
            )}
            {result.protocol_key && (
              <p className="text-xs">Protocolo indicado: <span className="font-medium">{result.protocol_key}</span></p>
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
