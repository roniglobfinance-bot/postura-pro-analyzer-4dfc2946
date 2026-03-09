import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle, Lock, Shield, Zap, Brain, Loader2, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useActiveAssessment } from '@/contexts/ActiveAssessmentContext';

interface PlanBuilderProps {
  onNavigate?: (view: string) => void;
}

type PlanMode = 'LOAD' | 'SHIELD' | 'MIXED';
type PlanStatus = 'sugestao' | 'override' | 'publicado' | 'travado';

const PlanBuilder = ({ onNavigate }: PlanBuilderProps) => {
  const { active, setStatus: setFlowStatus } = useActiveAssessment();
  const [mode, setMode] = useState<PlanMode>('MIXED');
  const [status, setStatus] = useState<PlanStatus>('sugestao');
  const [overrideJustification, setOverrideJustification] = useState('');
  const [showOverride, setShowOverride] = useState(false);
  const [saving, setSaving] = useState(false);
  const [engineDecision, setEngineDecision] = useState<any>(null);
  const [dbProtocols, setDbProtocols] = useState<any[]>([]);
  const [loadingProtocols, setLoadingProtocols] = useState(true);

  // Load engine decision
  useEffect(() => {
    if (!active.analysisRunId) return;
    const loadDecision = async () => {
      const { data } = await supabase
        .from('ppa_engine_decisions' as any).select('*')
        .eq('analysis_run_id', active.analysisRunId)
        .order('created_at', { ascending: false }).limit(1).single();
      if (data) {
        const d = data as any;
        setEngineDecision(d);
        if (['LOAD', 'SHIELD', 'MIXED'].includes(d.macro_state)) setMode(d.macro_state as PlanMode);
      }
    };
    loadDecision();
  }, [active.analysisRunId]);

  // Load protocols from ppa_protocols_library
  useEffect(() => {
    const loadProtocols = async () => {
      const { data } = await supabase.from('ppa_protocols_library' as any).select('*').order('category');
      setDbProtocols((data as any[]) || []);
      setLoadingProtocols(false);
    };
    loadProtocols();
  }, []);

  const guardrails = engineDecision?.micro_states
    ? [
        { key: 'SHOE_INSTABILITY_CHECK', active: (engineDecision.micro_states as string[]).includes('SHOE_INSTABILITY_CHECK'), message: 'Calçado amortecido com carga axial' },
        { key: 'DECOMPRESSION_LOGIC', active: (engineDecision.micro_states as string[]).includes('DECOMPRESSION_LOGIC'), message: 'Cluster compressivo → descompressão obrigatória' },
        { key: 'STABILITY_SHIELD', active: (engineDecision.micro_states as string[]).includes('STABILITY_SHIELD'), message: 'Instabilidade alta detectada' },
        { key: 'NEUROMUSCULAR_WAKEUP', active: (engineDecision.micro_states as string[]).includes('NEUROMUSCULAR_WAKEUP'), message: 'Déficit motor → wakeup obrigatório' },
        { key: 'PAIN_SPIKE_RISK', active: (engineDecision.micro_states as string[]).includes('PAIN_SPIKE_RISK'), message: 'Risco de pico de dor' },
      ]
    : [{ key: 'DECOMPRESSION_LOGIC', active: true, message: 'Cluster compressivo → descompressão obrigatória' }];

  const activeGuardrails = guardrails.filter(g => g.active);
  const isLocked = activeGuardrails.length > 0 && mode === 'LOAD';

  // Group DB protocols by category, filter by active guardrails
  const activeCategories = new Set(activeGuardrails.map(g => {
    if (g.key === 'DECOMPRESSION_LOGIC') return 'decompression';
    if (g.key === 'NEUROMUSCULAR_WAKEUP') return 'wakeup';
    if (g.key === 'STABILITY_SHIELD') return 'stability';
    return '';
  }).filter(Boolean));

  const relevantProtocols = dbProtocols.length > 0
    ? dbProtocols.filter(p => activeCategories.has((p as any).category) || activeCategories.size === 0)
    : [];

  // Fallback hardcoded blocks when DB is empty
  const fallbackBlocks = [
    { name: 'Wakeup Neural', icon: Brain, protocols: ['Mobilização Neural MMII', 'Cat-Camel Segmentar', 'Diafragma 360'] },
    { name: 'Descompressão', icon: Zap, protocols: ['Descompressão Axial Suspensa', 'Cat-Cow Respirado'] },
    { name: 'Escudo de Estabilidade', icon: Shield, protocols: ['Dead Bug', 'Bird Dog', 'Pallof Press'] },
  ];

  const handlePublish = async () => {
    if (isLocked) {
      toast({ title: 'Bloqueado', description: 'Mude para SHIELD ou resolva guardrails.', variant: 'destructive' });
      return;
    }
    if (!active.analysisRunId || !active.studentId) {
      setStatus('publicado');
      toast({ title: 'Plano publicado (demo)' });
      return;
    }

    setSaving(true);
    try {
      // Deactivate previous plans for this student
      await supabase.from('ppa_plan_links' as any)
        .update({ active: false })
        .eq('student_id', active.studentId)
        .eq('active', true);

      const { error } = await supabase.from('ppa_plan_links' as any).insert({
        analysis_run_id: active.analysisRunId,
        student_id: active.studentId,
        active: true,
      });
      if (error) throw error;

      setStatus('publicado');
      setFlowStatus('plano_gerado');
      toast({ title: 'Plano publicado', description: 'Plano vinculado ao aluno.' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleOverride = async () => {
    if (!overrideJustification.trim()) {
      toast({ title: 'Justificativa obrigatória', variant: 'destructive' });
      return;
    }

    // Persist override in ppa_engine_decisions
    if (active.analysisRunId) {
      await supabase.from('ppa_engine_decisions' as any).insert({
        analysis_run_id: active.analysisRunId,
        macro_state: mode,
        risk_level: engineDecision?.risk_level || 'moderado',
        decided_by: 'coach',
        micro_states: activeGuardrails.map(g => g.key),
        final_decision: {
          override: true,
          justification: overrideJustification,
          original_mode: engineDecision?.macro_state,
          overridden_to: mode,
        },
      });
    }

    setStatus('override');
    setShowOverride(false);
    toast({ title: 'Override aplicado e registrado' });
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
          <Button key={m} variant={mode === m ? 'default' : 'outline'} onClick={() => setMode(m)} className="flex-1">
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

      {/* Protocols from DB or fallback */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase">
          Blocos Obrigatórios {dbProtocols.length > 0 && <Badge variant="outline" className="ml-2 text-xs">Banco de dados</Badge>}
        </h3>
        {relevantProtocols.length > 0 ? (
          relevantProtocols.map((protocol: any) => (
            <Card key={protocol.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">{protocol.protocol_key}</span>
                  <Badge variant="outline" className="text-xs ml-auto">{protocol.category}</Badge>
                </div>
                <div className="space-y-1">
                  {(protocol.steps as any[])?.map((step: any, i: number) => (
                    <p key={i} className="text-xs text-muted-foreground pl-6">• {typeof step === 'string' ? step : step.name || JSON.stringify(step)}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          fallbackBlocks.map(block => {
            const Icon = block.icon;
            return (
              <Card key={block.name}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{block.name}</span>
                    <Badge variant="outline" className="text-xs ml-auto">Obrigatório</Badge>
                  </div>
                  <div className="space-y-1">{block.protocols.map(p => <p key={p} className="text-xs text-muted-foreground pl-6">• {p}</p>)}</div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Override */}
      {showOverride ? (
        <Card>
          <CardHeader><CardTitle className="text-sm">Override do Coach</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Justificativa (obrigatória para auditoria)</Label>
              <Textarea value={overrideJustification} onChange={(e) => setOverrideJustification(e.target.value)} placeholder="Motivo do override..." />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleOverride}>Aplicar Override</Button>
              <Button variant="outline" onClick={() => setShowOverride(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowOverride(true)}>⚙️ Override do Coach</Button>
      )}

      {/* Publish + Navigate */}
      <div className="flex gap-3">
        <Button onClick={handlePublish} disabled={isLocked || saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : isLocked ? <Lock className="h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
          {isLocked ? 'Travado por Guardrail' : saving ? 'Publicando...' : 'Publicar Plano'}
        </Button>
        {status === 'publicado' && (
          <>
            <Badge className="bg-green-100 text-green-800 self-center">✅ Publicado</Badge>
            <Button onClick={() => onNavigate?.('session-tracker')}>
              <ArrowRight className="h-4 w-4 mr-2" /> Ir para Sessão
            </Button>
          </>
        )}
        {status === 'override' && <Badge className="bg-yellow-100 text-yellow-800 self-center">⚠️ Override Ativo</Badge>}
      </div>
    </div>
  );
};

export default PlanBuilder;
