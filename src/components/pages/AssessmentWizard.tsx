import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Camera, CheckCircle, AlertTriangle, XCircle, ArrowRight, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AssessmentWizardProps {
  onNavigate?: (view: string) => void;
}

type WizardStep = 'student' | 'context' | 'pain' | 'checklist';

const REQUIRED_VIEWS = [
  { key: 'frente', label: 'Frente', icon: '🧍' },
  { key: 'costas', label: 'Costas', icon: '🧍‍♂️' },
  { key: 'lado_d', label: 'Perfil Direito', icon: '➡️' },
  { key: 'lado_e', label: 'Perfil Esquerdo', icon: '⬅️' },
];

const AssessmentWizard = ({ onNavigate }: AssessmentWizardProps) => {
  const [step, setStep] = useState<WizardStep>('student');
  const [studentId, setStudentId] = useState('');
  const [context, setContext] = useState({
    calcado: '',
    superficie: '',
    objetivo: '',
    ambiente: '',
  });
  const [pain, setPain] = useState({
    regiao: '',
    intensidade: [0],
    gatilhos: '',
  });
  const [status, setStatus] = useState<string>('novo');
  const [saving, setSaving] = useState(false);

  const handleCreateAssessment = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Erro', description: 'Usuário não autenticado', variant: 'destructive' });
        return;
      }

      const { error } = await supabase.from('ppa_assessments' as any).insert({
        student_id: studentId || user.id,
        teacher_id: user.id,
        context,
        pain: { ...pain, intensidade: pain.intensidade[0] },
        status: 'em_coleta',
      });

      if (error) throw error;
      toast({ title: 'Avaliação criada', description: 'Inicie a coleta de mídia.' });
      setStatus('em_coleta');
      onNavigate?.('media-collector');
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const steps: { key: WizardStep; label: string }[] = [
    { key: 'student', label: 'Aluno' },
    { key: 'context', label: 'Contexto' },
    { key: 'pain', label: 'Dor' },
    { key: 'checklist', label: 'Captura' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nova Avaliação</h1>
        <p className="text-muted-foreground text-sm">Preencha os dados para iniciar a avaliação postural.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                step === s.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i + 1}. {s.label}
            </button>
            {i < steps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Step: Student */}
      {step === 'student' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Selecionar Aluno</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>ID do Aluno (ou deixe vazio para usar próprio)</Label>
              <Input
                placeholder="UUID do aluno..."
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>
            <Button onClick={() => setStep('context')}>Próximo <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </CardContent>
        </Card>
      )}

      {/* Step: Context */}
      {step === 'context' && (
        <Card>
          <CardHeader>
            <CardTitle>Contexto da Avaliação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Calçado</Label>
                <Select value={context.calcado} onValueChange={(v) => setContext({ ...context, calcado: v })}>
                  <SelectTrigger><SelectValue placeholder="Tipo de calçado" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="descalco">Descalço</SelectItem>
                    <SelectItem value="tenis_neutro">Tênis Neutro</SelectItem>
                    <SelectItem value="tenis_corrida">Tênis de Corrida</SelectItem>
                    <SelectItem value="chinelo">Chinelo</SelectItem>
                    <SelectItem value="salto">Salto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Superfície</Label>
                <Select value={context.superficie} onValueChange={(v) => setContext({ ...context, superficie: v })}>
                  <SelectTrigger><SelectValue placeholder="Tipo de superfície" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plana_rigida">Plana Rígida</SelectItem>
                    <SelectItem value="tatame">Tatame</SelectItem>
                    <SelectItem value="grama">Grama</SelectItem>
                    <SelectItem value="areia">Areia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Objetivo</Label>
                <Input
                  placeholder="Ex: Corrigir hiperlordose"
                  value={context.objetivo}
                  onChange={(e) => setContext({ ...context, objetivo: e.target.value })}
                />
              </div>
              <div>
                <Label>Ambiente</Label>
                <Select value={context.ambiente} onValueChange={(v) => setContext({ ...context, ambiente: v })}>
                  <SelectTrigger><SelectValue placeholder="Ambiente" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academia">Academia</SelectItem>
                    <SelectItem value="consultorio">Consultório</SelectItem>
                    <SelectItem value="ar_livre">Ar Livre</SelectItem>
                    <SelectItem value="residencia">Residência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('student')}>Voltar</Button>
              <Button onClick={() => setStep('pain')}>Próximo <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Pain */}
      {step === 'pain' && (
        <Card>
          <CardHeader>
            <CardTitle>Mapeamento de Dor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Região da Dor</Label>
              <Select value={pain.regiao} onValueChange={(v) => setPain({ ...pain, regiao: v })}>
                <SelectTrigger><SelectValue placeholder="Região" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cervical">Cervical</SelectItem>
                  <SelectItem value="toracica">Torácica</SelectItem>
                  <SelectItem value="lombar">Lombar</SelectItem>
                  <SelectItem value="quadril">Quadril</SelectItem>
                  <SelectItem value="joelho">Joelho</SelectItem>
                  <SelectItem value="tornozelo">Tornozelo</SelectItem>
                  <SelectItem value="ombro">Ombro</SelectItem>
                  <SelectItem value="nenhuma">Nenhuma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Intensidade: {pain.intensidade[0]}/10</Label>
              <Slider
                value={pain.intensidade}
                onValueChange={(v) => setPain({ ...pain, intensidade: v })}
                max={10}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Gatilhos</Label>
              <Textarea
                placeholder="O que piora a dor? Ex: Sentar por muito tempo, correr..."
                value={pain.gatilhos}
                onChange={(e) => setPain({ ...pain, gatilhos: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('context')}>Voltar</Button>
              <Button onClick={() => setStep('checklist')}>Próximo <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Checklist */}
      {step === 'checklist' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5" /> Checklist de Captura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Views obrigatórias para a avaliação:</p>
            <div className="grid grid-cols-2 gap-3">
              {REQUIRED_VIEWS.map((view) => (
                <div key={view.key} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                  <span className="text-2xl">{view.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{view.label}</p>
                    <Badge variant="outline" className="text-xs">Pendente</Badge>
                  </div>
                </div>
              ))}
            </div>

            {context.ambiente === 'ar_livre' && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">⚠️ LOW_LIGHT: Ambiente externo pode ter variação de luz</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('pain')}>Voltar</Button>
              <Button onClick={handleCreateAssessment} disabled={saving}>
                {saving ? 'Criando...' : 'Criar Avaliação e Iniciar Coleta'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssessmentWizard;
