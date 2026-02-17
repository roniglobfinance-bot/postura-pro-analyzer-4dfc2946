import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Upload, CheckCircle, XCircle, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const MEDIA_STEPS = [
  { key: 'frente', label: 'Frente', side: 'NA' },
  { key: 'lado_d', label: 'Perfil Direito', side: 'D' },
  { key: 'costas', label: 'Costas', side: 'NA' },
  { key: 'lado_e', label: 'Perfil Esquerdo', side: 'E' },
];

type QAStatus = 'pending' | 'pass' | 'partial' | 'fail';

interface MediaItem {
  file?: File;
  preview?: string;
  qaStatus: QAStatus;
  qaChecks: { feetVisible: boolean; fullSpine: boolean; flatPlane: boolean };
}

const MediaCollector = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [media, setMedia] = useState<Record<string, MediaItem>>(
    Object.fromEntries(MEDIA_STEPS.map(s => [s.key, {
      qaStatus: 'pending',
      qaChecks: { feetVisible: false, fullSpine: false, flatPlane: false },
    }]))
  );

  const current = MEDIA_STEPS[currentStep];
  const currentMedia = media[current.key];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setMedia(prev => ({
      ...prev,
      [current.key]: { ...prev[current.key], file, preview },
    }));
  };

  const updateQACheck = (check: keyof MediaItem['qaChecks'], value: boolean) => {
    setMedia(prev => {
      const item = { ...prev[current.key] };
      item.qaChecks = { ...item.qaChecks, [check]: value };
      const checks = Object.values(item.qaChecks);
      const passed = checks.filter(Boolean).length;
      item.qaStatus = passed === 3 ? 'pass' : passed >= 2 ? 'partial' : item.file ? 'fail' : 'pending';
      return { ...prev, [current.key]: item };
    });
  };

  const getStatusBadge = (status: QAStatus) => {
    switch (status) {
      case 'pass': return <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="h-3 w-3 mr-1" /> Pass</Badge>;
      case 'partial': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300"><AlertTriangle className="h-3 w-3 mr-1" /> Partial</Badge>;
      case 'fail': return <Badge className="bg-red-100 text-red-800 border-red-300"><XCircle className="h-3 w-3 mr-1" /> Fail</Badge>;
      default: return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const allMinimumPassed = MEDIA_STEPS.every(s => media[s.key].qaStatus === 'pass' || media[s.key].qaStatus === 'partial');

  const handleAnalyze = () => {
    toast({ title: 'Análise iniciada', description: 'Processando imagens com IA...' });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Coleta de Mídia</h1>
        <p className="text-muted-foreground text-sm">Upload guiado das fotos obrigatórias com validação QA.</p>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2">
        {MEDIA_STEPS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setCurrentStep(i)}
            className={`flex-1 h-2 rounded-full transition-colors ${
              i === currentStep ? 'bg-primary' : media[s.key].qaStatus === 'pass' ? 'bg-green-500' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Status overview */}
      <div className="flex gap-2 flex-wrap">
        {MEDIA_STEPS.map((s, i) => (
          <button key={s.key} onClick={() => setCurrentStep(i)} className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">{s.label}:</span>
            {getStatusBadge(media[s.key].qaStatus)}
          </button>
        ))}
      </div>

      {/* Current upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{current.label}</span>
            {getStatusBadge(currentMedia.qaStatus)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentMedia.preview ? (
            <div className="relative">
              <img src={currentMedia.preview} alt={current.label} className="w-full max-h-80 object-contain rounded-lg border" />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setMedia(prev => ({
                  ...prev,
                  [current.key]: { ...prev[current.key], file: undefined, preview: undefined, qaStatus: 'pending' },
                }))}
              >
                Trocar foto
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Clique para enviar foto</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          )}

          {currentMedia.file && (
            <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
              <p className="text-sm font-medium">Validação QA:</p>
              {[
                { key: 'feetVisible' as const, label: 'Pés visíveis' },
                { key: 'fullSpine' as const, label: 'Coluna inteira visível' },
                { key: 'flatPlane' as const, label: 'Plano reto / sem inclinação' },
              ].map(check => (
                <div key={check.key} className="flex items-center gap-2">
                  <Checkbox
                    checked={currentMedia.qaChecks[check.key]}
                    onCheckedChange={(v) => updateQACheck(check.key, !!v)}
                  />
                  <Label className="text-sm">{check.label}</Label>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(prev => prev - 1)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Anterior
            </Button>
            {currentStep < MEDIA_STEPS.length - 1 ? (
              <Button onClick={() => setCurrentStep(prev => prev + 1)}>
                Próximo <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleAnalyze} disabled={!allMinimumPassed}>
                🔬 Analisar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaCollector;
