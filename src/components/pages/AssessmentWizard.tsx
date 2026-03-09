import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Camera, AlertTriangle, ArrowRight, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useActiveAssessment } from '@/contexts/ActiveAssessmentContext';

interface AssessmentWizardProps {
  onNavigate?: (view: string) => void;
}

type WizardStep = 'student' | 'context' | 'functional' | 'pain' | 'checklist';

interface StudentOption {
  student_id: string;
  full_name: string;
  email: string;
}

const REQUIRED_VIEWS = [
  { key: 'frente', label: 'Frente', icon: '🧍' },
  { key: 'costas', label: 'Costas', icon: '🧍‍♂️' },
  { key: 'lado_d', label: 'Perfil Direito', icon: '➡️' },
  { key: 'lado_e', label: 'Perfil Esquerdo', icon: '⬅️' },
];

const AssessmentWizard = ({ onNavigate }: AssessmentWizardProps) => {
  const { active, setAssessment, setStatus: setFlowStatus, setContext: setFlowContext, setPain: setFlowPain } = useActiveAssessment();
  const [step, setStep] = useState<WizardStep>('student');
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(active.studentId || '');
  const [context, setContext] = useState({
    calcado: '',
    superficie: '',
    objetivo: '',
    ambiente: '',
  });
  const [functional, setFunctional] = useState({
    esporte: '',
    carga_semanal: '',
    nivel_atividade: '',
    historico_lesoes: '',
    idade: '',
    peso: '',
    altura: '',
  });
  const [pain, setPain] = useState({
    regiao: '',
    intensidade: [0],
    gatilhos: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase.rpc('get_teacher_students', { teacher_id: user.id });
        if (error) throw error;
        setStudents((data as StudentOption[]) || []);
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoadingStudents(false);
      }
    };
    loadStudents();
  }, []);

  // Pre-select student if coming from ClientManagement
  useEffect(() => {
    if (active.studentId && !selectedStudentId) {
      setSelectedStudentId(active.studentId);
    }
  }, [active.studentId]);

  const selectedStudent = students.find(s => s.student_id === selectedStudentId);

  const handleCreateAssessment = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Erro', description: 'Usuário não autenticado', variant: 'destructive' });
        return;
      }

      const studentId = selectedStudentId || user.id;
      const painData = { ...pain, intensidade: pain.intensidade[0] };

      // Merge context + functional data
      const fullContext = {
        ...context,
        esporte: functional.esporte,
        carga_semanal: functional.carga_semanal,
        nivel_atividade: functional.nivel_atividade,
        historico_lesoes: functional.historico_lesoes,
        idade: functional.idade,
        peso: functional.peso,
        altura: functional.altura,
      };

      const { data, error } = await supabase.from('ppa_assessments' as any).insert({
        student_id: studentId,
        teacher_id: user.id,
        context: fullContext,
        pain: painData,
        status: 'em_coleta',
      }).select('id').single();

      if (error) throw error;

      const assessmentId = (data as any).id;
      const studentName = selectedStudent?.full_name || user.email || 'Próprio';

      setAssessment(assessmentId, studentId, studentName);
      setFlowStatus('em_coleta');
      setFlowContext(fullContext);
      setFlowPain({ regiao: pain.regiao, intensidade: pain.intensidade[0], gatilhos: pain.gatilhos });

      toast({ title: 'Avaliação criada', description: `Inicie a coleta de mídia.` });
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
    { key: 'functional', label: 'Funcional' },
    { key: 'pain', label: 'Dor' },
    { key: 'checklist', label: 'Captura' },
  ];

  const canProceedStudent = selectedStudentId !== '';

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nova Avaliação</h1>
        <p className="text-muted-foreground text-sm">Preencha os dados para iniciar a avaliação postural.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 flex-wrap">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-1">
            <button
              onClick={() => setStep(s.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                step === s.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
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
            {loadingStudents ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando alunos...
              </div>
            ) : students.length === 0 ? (
              <div className="p-4 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm">
                <AlertTriangle className="h-4 w-4 inline mr-2" />
                Nenhum aluno vinculado. Adicione alunos na tela de Alunos primeiro.
              </div>
            ) : (
              <div>
                <Label>Aluno</Label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger><SelectValue placeholder="Selecione um aluno..." /></SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.student_id} value={s.student_id}>
                        {s.full_name || s.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedStudent && (
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-sm font-medium">{selectedStudent.full_name}</p>
                <p className="text-xs text-muted-foreground">{selectedStudent.email}</p>
              </div>
            )}

            <Button onClick={() => setStep('context')} disabled={!canProceedStudent && students.length > 0}>
              Próximo <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step: Context */}
      {step === 'context' && (
        <Card>
          <CardHeader><CardTitle>Contexto da Avaliação</CardTitle></CardHeader>
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
                <Input placeholder="Ex: Corrigir hiperlordose" value={context.objetivo} onChange={(e) => setContext({ ...context, objetivo: e.target.value })} />
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
              <Button onClick={() => setStep('functional')}>Próximo <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Functional Questionnaire (NEW) */}
      {step === 'functional' && (
        <Card>
          <CardHeader><CardTitle>Questionário Funcional</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Esporte / Atividade Principal</Label>
                <Select value={functional.esporte} onValueChange={(v) => setFunctional({ ...functional, esporte: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corrida">Corrida</SelectItem>
                    <SelectItem value="musculacao">Musculação</SelectItem>
                    <SelectItem value="crossfit">CrossFit</SelectItem>
                    <SelectItem value="futebol">Futebol</SelectItem>
                    <SelectItem value="natacao">Natação</SelectItem>
                    <SelectItem value="pilates">Pilates</SelectItem>
                    <SelectItem value="yoga">Yoga</SelectItem>
                    <SelectItem value="sedentario">Sedentário</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Carga Semanal (horas)</Label>
                <Select value={functional.carga_semanal} onValueChange={(v) => setFunctional({ ...functional, carga_semanal: v })}>
                  <SelectTrigger><SelectValue placeholder="Horas/semana" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-2">0-2h (Baixa)</SelectItem>
                    <SelectItem value="3-5">3-5h (Moderada)</SelectItem>
                    <SelectItem value="6-10">6-10h (Alta)</SelectItem>
                    <SelectItem value="10+">10h+ (Muito Alta)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nível de Atividade</Label>
                <Select value={functional.nivel_atividade} onValueChange={(v) => setFunctional({ ...functional, nivel_atividade: v })}>
                  <SelectTrigger><SelectValue placeholder="Nível" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentario">Sedentário</SelectItem>
                    <SelectItem value="iniciante">Iniciante</SelectItem>
                    <SelectItem value="intermediario">Intermediário</SelectItem>
                    <SelectItem value="avancado">Avançado</SelectItem>
                    <SelectItem value="atleta">Atleta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Idade</Label>
                <Input type="number" placeholder="Ex: 34" value={functional.idade} onChange={(e) => setFunctional({ ...functional, idade: e.target.value })} />
              </div>
              <div>
                <Label>Peso (kg)</Label>
                <Input type="number" placeholder="Ex: 72" value={functional.peso} onChange={(e) => setFunctional({ ...functional, peso: e.target.value })} />
              </div>
              <div>
                <Label>Altura (cm)</Label>
                <Input type="number" placeholder="Ex: 175" value={functional.altura} onChange={(e) => setFunctional({ ...functional, altura: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Histórico de Lesões</Label>
              <Textarea
                placeholder="Descreva lesões anteriores, cirurgias, fraturas..."
                value={functional.historico_lesoes}
                onChange={(e) => setFunctional({ ...functional, historico_lesoes: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('context')}>Voltar</Button>
              <Button onClick={() => setStep('pain')}>Próximo <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Pain */}
      {step === 'pain' && (
        <Card>
          <CardHeader><CardTitle>Mapeamento de Dor</CardTitle></CardHeader>
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
              <Slider value={pain.intensidade} onValueChange={(v) => setPain({ ...pain, intensidade: v })} max={10} step={1} className="mt-2" />
            </div>
            <div>
              <Label>Gatilhos</Label>
              <Textarea placeholder="O que piora a dor?" value={pain.gatilhos} onChange={(e) => setPain({ ...pain, gatilhos: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('functional')}>Voltar</Button>
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
            {selectedStudent && (
              <div className="p-3 rounded-lg border bg-primary/5">
                <p className="text-sm"><strong>Aluno:</strong> {selectedStudent.full_name}</p>
                {functional.esporte && <p className="text-xs text-muted-foreground">Esporte: {functional.esporte} | Carga: {functional.carga_semanal}</p>}
              </div>
            )}

            <p className="text-sm text-muted-foreground">Views obrigatórias:</p>
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
            {context.calcado && context.calcado !== 'descalco' && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">⚠️ SHOE_INSTABILITY_CHECK: Calçado "{context.calcado}" pode afetar a análise</span>
              </div>
            )}
            {pain.intensidade[0] >= 7 && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-red-300 bg-red-50 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">🔴 PAIN_SPIKE_RISK: Dor alta ({pain.intensidade[0]}/10) — modo SHIELD recomendado</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('pain')}>Voltar</Button>
              <Button onClick={handleCreateAssessment} disabled={saving}>
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Criando...</> : 'Criar Avaliação e Iniciar Coleta'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssessmentWizard;
