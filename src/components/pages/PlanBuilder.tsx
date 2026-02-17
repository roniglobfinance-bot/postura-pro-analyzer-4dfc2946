import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle, Lock, Shield, Zap, Brain } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type PlanMode = 'LOAD' | 'SHIELD' | 'MIXED';
type PlanStatus = 'sugestao' | 'override' | 'publicado' | 'travado';

const PlanBuilder = () => {
  const [mode, setMode] = useState<PlanMode>('MIXED');
  const [status, setStatus] = useState<PlanStatus>('sugestao');
  const [overrideJustification, setOverrideJustification] = useState('');
  const [showOverride, setShowOverride] = useState(false);

  // Demo guardrails
  const guardrails = [
    { key: 'SHOE_INSTABILITY_CHECK', active: false, message: 'Calçado amortecido detectado com carga axial' },
    { key: 'DECOMPRESSION_LOGIC', active: true, message: 'Cluster compressivo alto → descompressão obrigatória' },
    { key: 'STABILITY_SHIELD', active: false, message: 'Instabilidade alta detectada' },
    { key: 'NEUROMUSCULAR_WAKEUP', active: true, message: 'Déficit motor alto → wakeup obrigatório' },
  ];

  const mandatoryBlocks = [
    { name: 'Wakeup Neural', icon: Brain, protocols: ['Mobilização Neural MMII', 'Cat-Camel Segmentar', 'Diafragma 360'] },
    { name: 'Descompressão', icon: Zap, protocols: ['Descompressão Axial Suspensa', 'Cat-Cow Respirado'] },
    { name: 'Escudo de Estabilidade', icon: Shield, protocols: ['Dead Bug', 'Bird Dog', 'Pallof Press'] },
  ];

  const activeGuardrails = guardrails.filter(g => g.active);
  const isLocked = activeGuardrails.length > 0 && mode === 'LOAD';

  const handlePublish = () => {
    if (isLocked) {
      toast({ title: 'Bloqueado', description: 'Mude para SHIELD ou resolva guardrails.', variant: 'destructive' });
      return;
    }
    setStatus('publicado');
    toast({ title: 'Plano publicado', description: 'Plano vinculado ao aluno com sucesso.' });
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
        <p className="text-muted-foreground text-sm">Configure o modo de treino com guardrails de segurança.</p>
      </div>

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
        <Button onClick={handlePublish} disabled={isLocked}>
          {isLocked ? <Lock className="h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
          {isLocked ? 'Travado por Guardrail' : 'Publicar Plano'}
        </Button>
        {status === 'publicado' && (
          <Badge className="bg-green-100 text-green-800 self-center">✅ Publicado</Badge>
        )}
      </div>
    </div>
  );
};

export default PlanBuilder;
