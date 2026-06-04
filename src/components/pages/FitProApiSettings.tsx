import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Copy, KeyRound, Trash2, Loader2, BookOpen, Code2, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TokenRow {
  id: string;
  name: string;
  token_prefix: string;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fitpro-api`;

const FitProApiSettings = () => {
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [justCreated, setJustCreated] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('fitpro_integration_tokens')
        .select('id, name, token_prefix, last_used_at, revoked_at, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTokens((data as TokenRow[]) || []);
    } catch (err: any) {
      // Tabela pode ainda não existir até a migração rodar
      console.warn('Não foi possível carregar tokens:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateToken = () => {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return 'fpk_' + Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const sha256 = async (text: string) => {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const createToken = async () => {
    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const token = generateToken();
      const hash = await sha256(token);
      const prefix = token.slice(0, 12);
      const { error } = await (supabase as any).from('fitpro_integration_tokens').insert({
        teacher_id: user.id,
        name: newName || 'FitPro Integration',
        token_hash: hash,
        token_prefix: prefix,
      });
      if (error) throw error;
      setJustCreated(token);
      setNewName('');
      toast.success('Token criado. Copie agora — não será exibido novamente.');
      load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const revokeToken = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('fitpro_integration_tokens')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      toast.success('Token revogado');
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Zap className="h-7 w-7 text-primary" /> API FitPro · Postura Pro
        </h1>
        <p className="text-muted-foreground text-sm">
          SDK e endpoints para integrar o FitPro ao Postura Pro Analyser.
        </p>
      </div>

      <Tabs defaultValue="tokens" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tokens"><KeyRound className="h-4 w-4 mr-1" /> Tokens</TabsTrigger>
          <TabsTrigger value="docs"><BookOpen className="h-4 w-4 mr-1" /> Documentação</TabsTrigger>
          <TabsTrigger value="sdk"><Code2 className="h-4 w-4 mr-1" /> SDK TypeScript</TabsTrigger>
        </TabsList>

        {/* TOKENS */}
        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Criar novo token</CardTitle>
              <CardDescription>Cada token autoriza o FitPro a chamar a API em nome deste professor.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input placeholder="Nome do token (ex: FitPro Produção)" value={newName} onChange={(e) => setNewName(e.target.value)} />
                <Button onClick={createToken} disabled={creating}>
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Gerar
                </Button>
              </div>
              {justCreated && (
                <Alert>
                  <AlertDescription className="font-mono text-xs break-all flex items-center justify-between gap-2">
                    <span>{justCreated}</span>
                    <Button size="sm" variant="ghost" onClick={() => copy(justCreated)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Tokens ativos</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : tokens.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum token criado ainda.</p>
              ) : (
                <div className="space-y-2">
                  {tokens.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded border bg-muted/20">
                      <div>
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{t.token_prefix}…</p>
                        <p className="text-[10px] text-muted-foreground">
                          Criado {new Date(t.created_at).toLocaleString('pt-BR')}
                          {t.last_used_at && ` · Último uso ${new Date(t.last_used_at).toLocaleString('pt-BR')}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {t.revoked_at ? <Badge variant="destructive">Revogado</Badge> : <Badge>Ativo</Badge>}
                        {!t.revoked_at && (
                          <Button size="sm" variant="ghost" onClick={() => revokeToken(t.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOCS */}
        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Base URL</CardTitle>
            </CardHeader>
            <CardContent>
              <code className="block p-3 rounded bg-muted text-xs font-mono break-all">{FUNCTIONS_BASE}</code>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Autenticação</CardTitle>
              <CardDescription>Todas as requisições exigem o header abaixo.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-3 rounded bg-muted text-xs overflow-auto">
{`Authorization: Bearer SEU_TOKEN_FITPRO
Content-Type: application/json`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Endpoints</CardTitle></CardHeader>
            <CardContent>
              <pre className="p-3 rounded bg-muted text-xs overflow-auto">
{`# Painel professor — espelho do TeacherDashboard
GET  /teacher/dashboard
GET  /teacher/students
GET  /teacher/assessments?limit=20

# Visão do aluno — espelho do StudentDashboard
GET  /student/dashboard?student_id=<uuid>
GET  /student/report?student_id=<uuid>
GET  /student/prescriptions?student_id=<uuid>

# Análise instantânea via FitPro
POST /analysis/photo
Body: {
  "student_id": "<uuid>",
  "view": "anterior|posterior|sagittal_left|sagittal_right",
  "image_base64": "data:image/jpeg;base64,...",
  "context": { "altura_cm": 170, "peso_kg": 72, "objetivo": "..." }
}
Resposta: { metrics, findings, pattern_match, risk, recommendations }

POST /analysis/video
Body: {
  "student_id": "<uuid>",
  "exercise_type": "agachamento",
  "evaluation_intent": "valgo dinâmico e profundidade",
  "duration_sec": 5,                  // máximo 5s
  "frames_base64": ["data:image/jpeg;base64,..."]  // 6-10 frames
}
Resposta: { detected_faults[], rom_assessment, pattern_match, load_recommendation }

# Sincronizar prescrições do Postura Pro no módulo de treino do FitPro
POST /train/prescriptions/sync
Body: { "student_id": "<uuid>" }
Resposta: { protocols: [{ id, name, steps, contraindications }] }`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Mapeamento Postura Pro → FitPro</CardTitle></CardHeader>
            <CardContent>
              <pre className="p-3 rounded bg-muted text-xs overflow-auto">
{`TeacherDashboard         -> /teacher/dashboard         -> FitPro · Painel do Professor
ClientManagement         -> /teacher/students          -> FitPro · Alunos
ppa_assessments          -> /teacher/assessments       -> FitPro · Avaliações
StudentReportView        -> /student/report            -> FitPro · Análise Postural (aba aluno)
StudentRecommendations   -> /student/prescriptions     -> FitPro · Train (Alongamentos prescritos)
analyze-posture (edge)   -> POST /analysis/photo       -> FitPro · Análise instantânea de foto
analyze-movement (edge)  -> POST /analysis/video       -> FitPro · Análise de execução em vídeo`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SDK */}
        <TabsContent value="sdk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Instalação</CardTitle>
              <CardDescription>SDK em TypeScript — copie o arquivo para o seu projeto FitPro.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-3 rounded bg-muted text-xs overflow-auto max-h-[600px]">
{`// posturaPro.ts — SDK FitPro -> Postura Pro
export interface PosturaProConfig {
  baseUrl: string;   // ex: ${FUNCTIONS_BASE}
  token: string;     // token fpk_... gerado nesta tela
}

export interface PhotoAnalysisRequest {
  student_id: string;
  view: 'anterior' | 'posterior' | 'sagittal_left' | 'sagittal_right';
  image_base64: string;
  context?: { altura_cm?: number; peso_kg?: number; objetivo?: string };
}

export interface VideoAnalysisRequest {
  student_id: string;
  exercise_type: string;
  evaluation_intent: string;
  duration_sec: number;          // <= 5
  frames_base64: string[];       // 6-10 frames JPEG base64
}

export class PosturaProClient {
  constructor(private cfg: PosturaProConfig) {}

  private async req<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(this.cfg.baseUrl + path, {
      ...init,
      headers: {
        'Authorization': 'Bearer ' + this.cfg.token,
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    });
    if (!res.ok) throw new Error('PosturaPro API ' + res.status + ': ' + await res.text());
    return res.json();
  }

  teacherDashboard()           { return this.req('/teacher/dashboard'); }
  listStudents()               { return this.req('/teacher/students'); }
  listAssessments(limit = 20)  { return this.req('/teacher/assessments?limit=' + limit); }

  studentDashboard(id: string)     { return this.req('/student/dashboard?student_id=' + id); }
  studentReport(id: string)        { return this.req('/student/report?student_id=' + id); }
  studentPrescriptions(id: string) { return this.req('/student/prescriptions?student_id=' + id); }

  analyzePhoto(body: PhotoAnalysisRequest) {
    return this.req('/analysis/photo', { method: 'POST', body: JSON.stringify(body) });
  }

  analyzeVideo(body: VideoAnalysisRequest) {
    if (body.duration_sec > 5) throw new Error('Vídeo limitado a 5s');
    return this.req('/analysis/video', { method: 'POST', body: JSON.stringify(body) });
  }

  syncPrescriptionsToTrain(student_id: string) {
    return this.req('/train/prescriptions/sync', {
      method: 'POST', body: JSON.stringify({ student_id }),
    });
  }
}

// ---- Uso ----
// const pp = new PosturaProClient({ baseUrl: '...', token: 'fpk_...' });
// const dash = await pp.teacherDashboard();
// const photo = await pp.analyzePhoto({ student_id, view: 'anterior', image_base64 });
// const video = await pp.analyzeVideo({ student_id, exercise_type: 'agachamento',
//   evaluation_intent: 'valgo', duration_sec: 5, frames_base64: framesArr });
// const train = await pp.syncPrescriptionsToTrain(student_id);`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FitProApiSettings;
