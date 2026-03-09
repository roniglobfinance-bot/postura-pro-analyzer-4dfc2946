import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle, Lock, Shield, Zap, Brain, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useActiveAssessment } from '@/contexts/ActiveAssessmentContext';

type PlanMode = 'LOAD' | 'SHIELD' | 'MIXED';
type PlanStatus = 'sugestao' | 'override' | 'publicado' | 'travado';

const PlanBuilder = () => {
  const { active } = useActiveAssessment();
  const [mode, setMode] = useState<PlanMode>('MIXED');
  const [status, setStatus] = useState<PlanStatus>('sugestao');
  const [overrideJustification, setOverrideJustification] = useState('');
  const [showOverride, setShowOverride] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load recommended mode from engine decision
  const [engineDecision, setEngineDecision] = useState<any>(null);

  useEffect(() => {
    if (!active.analysisRunId) return;
    const loadDecision = async () => {
      const { data } = await supabase
        .from('ppa_engine_decisions' as any)
        .select('*')
        .eq('analysis_run_id', active.analysisRunId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        const d = data as any;
        setEngineDecision(d);
        if (d.macro_state === 'LOAD' || d.macro_state === 'SHIELD' || d.macro_state === 'MIXED') {
          setMode(d.macro_state as PlanMode);
        }
      }
    };
    loadDecision();
  }, [active.analysisRunId]);

  // Build guardrails from engine decision
  const guardrails = engineDecision?.micro_states
    ? [
        { key: 'SHOE_INSTABILITY_CHECK', active: (engineDecision.micro_states as string[]).includes('SHOE_INSTABILITY_CHECK'), message: 'Calçado amortecido detectado com carga axial' },
        { key: 'DECOMPRESSION_LOGIC', active: (engineDecision.micro_states as string[]).includes('DECOMPRESSION_LOGIC'), message: 'Cluster compressivo alto → descompressão obrigatória' },
        { key: 'STABILITY_SHIELD', active: (engineDecision.micro_states as string[]).includes('STABILITY_SHIELD'), message: 'Instabilidade alta detectada' },
        { key: 'NEUROMUSCULAR_WAKEUP', active: (engineDecision.micro_states as string[]).includes('NEUROMUSCULAR_WAKEUP'), message: 'Déficit motor alto → wakeup obrigatório' },
        { key: 'PAIN_SPIKE_RISK', active: (engineDecision.micro_states as string[]).includes('PAIN_SPIKE_RISK'), message: 'Risco de pico de dor detectado' },
      ]
    : [
        { key: 'DECOMPRESSION_LOGIC', active: true, message: 'Cluster compressivo alto → descompressão obrigatória' },
        { key: 'NEUROMUSCULAR_WAKEUP', active: true, message: 'Déficit motor alto → wakeup obrigatório' },
      ];

  const mandatoryBlocks = [
    { name: 'Wakeup Neural', icon: Brain, protocols: ['Mobilização Neural MMII', 'Cat-Camel Segmentar', 'Diafragma 360'] },
    { name: 'Descompressão', icon: Zap, protocols: ['Descompressão Axial Suspensa', 'Cat-Cow Respirado'] },
    { name: 'Escudo de Estabilidade', icon: Shield, protocols: ['Dead Bug', 'Bird Dog', 'Pallof Press'] },
  ];

  const activeGuardrails = guardrails.filter(g => g.active);
  const isLocked = activeGuardrails.length > 0 && mode === 'LOAD';

  const handlePublish = async () => {
    if (isLocked) {
      toast({ title: 'Bloqueado', description: 'Mude para SHIELD ou resolva guardrails.', variant: 'destructive' });
      return;
    }

    if (!active.analysisRunId || !active.studentId) {
      setStatus('publicado');
      toast({ title: 'Plano publicado', description: 'Plano vinculado (modo demo).' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('ppa_plan_links' as any).insert({
        analysis_run_id: active.analysisRunId,
        student_id: active.studentId,
        active: true,
      });
      if (error) throw error;

      setStatus('publicado');
      toast({ title: 'Plano publicado', description: 'Plano vinculado ao aluno com sucesso.' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleOverride = () => {
    if (!overrideJustification.trim()) {
      toast({ title: 'Justificativa obrigatória', description: 'Informe o motivo do override.', variant: 'destructive' });
      return;
    }
    setStatus('override');
    setShowOverride(false);
    toast({ title: 'Override aplicado', description: 'Decisão registrada com justificativa.' });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Plano Load / Shield</h1>
        <p className="text-muted-foreground text-sm">
          Configure o modo de treino com guardrails de segurança.
          {active.studentName && <> — <strong>{active.studentName}</strong></>}
        </p>
      </div>

      {engineDecision && (
        <div className="p-3 rounded-lg border bg-primary/5">
          <p className="text-sm"><strong>Recomendação IA:</strong> Modo {engineDecision.macro_state} — Risco {engineDecision.risk_level}</p>
          {engineDecision.final_decision?.justification && (
            <p className="text-xs text-muted-foreground mt-1">{engineDecision.final_decision.justification}</p>
          )}
        </div>
      )}

      {/* Mode selector */}
      <div className="flex gap-2">
        {(['LOAD', 'SHIELD', 'MIXED'] as PlanMode[]).map(m => (
          <Button
            key={m}
            variant={mode === m ? 'default' : 'outline'}
            onClick={() => setMode(m)}
            className="flex-1"
          >
            {m === 'SHIELD' && <Shield className="h-4 w-4 mr-1" />}
            {m === 'LOAD' && <Zap className="h-4 w-4 mr-1" />}
            {m}
          </Button>
        ))}
      </div>

      {/* Guardrail alerts */}
      {activeGuardrails.length > 0 && (
        <div className="space-y-2">
          {activeGuardrails.map(g => (
            <div key={g.key} className="flex items-center gap-2 p-3 rounded-lg border border-yellow-300 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">{g.key}</p>
                <p className="text-xs text-yellow-700">{g.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mandatory blocks */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase">Blocos Obrigatórios</h3>
        {mandatoryBlocks.map(block => {
          const Icon = block.icon;
          return (
            <Card key={block.name}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">{block.name}</span>
                  <Badge variant="outline" className="text-xs ml-auto">Obrigatório</Badge>
                </div>
                <div className="space-y-1">
                  {block.protocols.map(p => (
                    <p key={p} className="text-xs text-muted-foreground pl-6">• {p}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Override */}
      {showOverride ? (
        <Card>
          <CardHeader><CardTitle className="text-sm">Override do Coach</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Justificativa (obrigatória)</Label>
              <Textarea
                value={overrideJustification}
                onChange={(e) => setOverrideJustification(e.target.value)}
                placeholder="Motivo do override..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleOverride}>Aplicar Override</Button>
              <Button variant="outline" onClick={() => setShowOverride(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowOverride(true)}>
          ⚙️ Override do Coach
        </Button>
      )}

      {/* Publish */}
      <div className="flex gap-3">
        <Button onClick={handlePublish} disabled={isLocked || saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> :
           isLocked ? <Lock className="h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
          {isLocked ? 'Travado por Guardrail' : saving ? 'Publicando...' : 'Publicar Plano'}
        </Button>
        {status === 'publicado' && (
          <Badge className="bg-green-100 text-green-800 self-center">✅ Publicado</Badge>
        )}
        {status === 'override' && (
          <Badge className="bg-yellow-100 text-yellow-800 self-center">⚠️ Override Ativo</Badge>
        )}
      </div>
    </div>
  );
};

export default PlanBuilder;
