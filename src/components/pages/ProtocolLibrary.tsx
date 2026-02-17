import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Search, Plus, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProtocolStep {
  sequence: number;
  name: string;
  cue: string;
  sets: number;
  reps: number | string;
  tempo: string;
}

interface Protocol {
  id: string;
  protocol_key: string;
  category: string;
  steps: ProtocolStep[];
  contraindications: string[];
  version: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  decompression: 'Descompressão',
  stability: 'Estabilidade',
  wakeup: 'Wakeup Neural',
  strength_transition: 'Força / Transição',
};

const CATEGORY_COLORS: Record<string, string> = {
  decompression: 'bg-blue-100 text-blue-800 border-blue-300',
  stability: 'bg-green-100 text-green-800 border-green-300',
  wakeup: 'bg-purple-100 text-purple-800 border-purple-300',
  strength_transition: 'bg-orange-100 text-orange-800 border-orange-300',
};

const ProtocolLibrary = () => {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProtocols();
  }, []);

  const loadProtocols = async () => {
    try {
      const { data, error } = await supabase.from('ppa_protocols_library' as any).select('*').order('category');
      if (error) throw error;
      setProtocols((data as any[]) || []);
    } catch {
      // Fallback demo data
      setProtocols([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = protocols.filter(p => {
    const matchesSearch = !filter || p.protocol_key.includes(filter.toLowerCase()) || 
      (p.steps as any[])?.some((s: any) => s.name?.toLowerCase().includes(filter.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-6 w-6" /> Biblioteca de Protocolos
        </h1>
        <p className="text-muted-foreground text-sm">{protocols.length} protocolos disponíveis</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar protocolo..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            <SelectItem value="decompression">Descompressão</SelectItem>
            <SelectItem value="stability">Estabilidade</SelectItem>
            <SelectItem value="wakeup">Wakeup</SelectItem>
            <SelectItem value="strength_transition">Força</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Protocol cards */}
      {loading ? (
        <p className="text-center text-muted-foreground py-8">Carregando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Nenhum protocolo encontrado.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <Card key={p.id} className="cursor-pointer" onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={CATEGORY_COLORS[p.category] || ''}>
                      {CATEGORY_LABELS[p.category] || p.category}
                    </Badge>
                    <span className="font-medium text-sm">{p.protocol_key.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">v{p.version}</Badge>
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); }}>
                      <Plus className="h-3 w-3 mr-1" /> Plano
                    </Button>
                  </div>
                </div>

                {expandedId === p.id && (
                  <div className="mt-3 space-y-3 border-t pt-3">
                    <div className="space-y-2">
                      {(p.steps as ProtocolStep[]).map((step) => (
                        <div key={step.sequence} className="flex items-start gap-3 text-sm">
                          <span className="bg-muted rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                            {step.sequence}
                          </span>
                          <div>
                            <p className="font-medium">{step.name}</p>
                            <p className="text-xs text-muted-foreground">💬 {step.cue}</p>
                            <p className="text-xs text-muted-foreground">
                              {step.sets}x{step.reps} | Tempo: {step.tempo}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {p.contraindications?.length > 0 && (
                      <div className="p-2 rounded border border-red-200 bg-red-50">
                        <p className="text-xs font-medium text-red-800 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Contraindicações:
                        </p>
                        {(p.contraindications as string[]).map((c, i) => (
                          <p key={i} className="text-xs text-red-700 pl-4">• {c}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProtocolLibrary;
