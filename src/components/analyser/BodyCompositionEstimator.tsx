import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file); });

export const BodyCompositionEstimator = ({ studentId }: { studentId?: string }) => {
  const [front, setFront] = useState<string>(''); const [side, setSide] = useState<string>('');
  const [height, setHeight] = useState(''); const [weight, setWeight] = useState(''); const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false); const [result, setResult] = useState<any>(null);

  const analyse = async () => {
    if (!front || !side || !height || !weight) { toast.error('Fotos, altura e peso são obrigatórios'); return; }
    setLoading(true); setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-body-composition', {
        body: { frontPhotoBase64: front, sidePhotoBase64: side, heightCm: parseFloat(height), weightKg: parseFloat(weight), age: age ? parseInt(age) : undefined },
      });
      if (error) throw error;
      if (data?.status !== 'success') throw new Error(data?.error || 'Erro');
      setResult(data.composition);

      if (studentId) {
        await supabase.from('ppa_body_composition').insert({
          student_id: studentId,
          height_cm: parseFloat(height), weight_kg: parseFloat(weight),
          estimated_body_fat_pct: data.composition.estimated_body_fat_pct,
          estimated_lean_mass_kg: data.composition.estimated_lean_mass_kg,
          confidence: data.composition.confidence,
          notes: data.composition.notes,
        });
      }
      toast.success('Estimativa concluída');
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5" /> Estimativa de Composição Corporal</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div><Label>Altura (cm)</Label><Input type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
          <div><Label>Peso (kg)</Label><Input type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
          <div><Label>Idade</Label><Input type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Foto frente</Label>
            <Input type="file" accept="image/*" onChange={async e => { const f = e.target.files?.[0]; if (f) setFront(await fileToBase64(f)); }} />
            {front && <img src={front} className="mt-2 h-32 object-cover rounded" alt="Frente" />}
          </div>
          <div>
            <Label>Foto lateral</Label>
            <Input type="file" accept="image/*" onChange={async e => { const f = e.target.files?.[0]; if (f) setSide(await fileToBase64(f)); }} />
            {side && <img src={side} className="mt-2 h-32 object-cover rounded" alt="Lado" />}
          </div>
        </div>
        <Button onClick={analyse} disabled={loading} className="w-full">
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Estimando...</> : 'Estimar Composição'}
        </Button>
        {result && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-muted-foreground">% Gordura</p><p className="text-2xl font-bold">{result.estimated_body_fat_pct?.toFixed(1)}%</p></div>
              <div><p className="text-muted-foreground">Massa Magra</p><p className="text-2xl font-bold">{result.estimated_lean_mass_kg?.toFixed(1)}kg</p></div>
              <div><p className="text-muted-foreground">Somatótipo</p><p className="font-semibold capitalize">{result.somatotype}</p></div>
              <div><p className="text-muted-foreground">Confiança</p><p className="font-semibold">{(result.confidence * 100).toFixed(0)}%</p></div>
            </div>
            <p className="text-xs text-muted-foreground italic mt-2">{result.notes}</p>
            <p className="text-xs text-destructive">⚠️ Estimativa visual — não substitui DEXA ou bioimpedância.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BodyCompositionEstimator;
