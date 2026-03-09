import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Eye, Calendar, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useActiveAssessment } from '@/contexts/ActiveAssessmentContext';

interface ClientManagementProps {
  onNavigate?: (view: string) => void;
}

interface StudentRecord {
  student_id: string;
  full_name: string;
  email: string;
  created_at: string;
}

interface AssessmentRecord {
  id: string;
  status: string;
  created_at: string;
  context: any;
  pain: any;
}

const ClientManagement = ({ onNavigate }: ClientManagementProps) => {
  const { setAssessment } = useActiveAssessment();
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [assessments, setAssessments] = useState<Record<string, AssessmentRecord[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [addEmail, setAddEmail] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('get_teacher_students', { teacher_id: user.id });
      if (error) throw error;
      setStudents((data as StudentRecord[]) || []);

      // Load assessments for all students
      if (data && data.length > 0) {
        const studentIds = (data as StudentRecord[]).map(s => s.student_id);
        const { data: assessData } = await supabase
          .from('ppa_assessments' as any)
          .select('id, status, created_at, context, pain, student_id')
          .in('student_id', studentIds)
          .order('created_at', { ascending: false });

        if (assessData) {
          const grouped: Record<string, AssessmentRecord[]> = {};
          (assessData as any[]).forEach(a => {
            if (!grouped[a.student_id]) grouped[a.student_id] = [];
            grouped[a.student_id].push(a);
          });
          setAssessments(grouped);
        }
      }
    } catch (err: any) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!addEmail.trim()) return;
    setAdding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { data, error } = await supabase.rpc('add_student_to_teacher', {
        teacher_id: user.id,
        student_email: addEmail.trim(),
      });
      if (error) throw error;

      const result = (data as any[])?.[0];
      if (result?.success) {
        toast({ title: 'Aluno adicionado', description: result.message });
        setAddEmail('');
        loadStudents();
      } else {
        toast({ title: 'Erro', description: result?.message || 'Erro ao adicionar', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  const handleStartAssessment = (studentId: string, studentName: string) => {
    setAssessment('', studentId, studentName);
    onNavigate?.('assessment-wizard');
  };

  const filteredStudents = students.filter(s =>
    (s.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pronto': return 'bg-green-100 text-green-800';
      case 'analisando': return 'bg-blue-100 text-blue-800';
      case 'em_coleta': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const totalAssessments = Object.values(assessments).flat().length;
  const activeAssessments = Object.values(assessments).flat().filter(a => a.status !== 'pronto').length;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Alunos</h2>
          <p className="text-muted-foreground text-sm">Gerencie alunos e histórico de avaliações</p>
        </div>
      </div>

      {/* Add student */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Email do aluno para vincular..."
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddStudent} disabled={adding || !addEmail.trim()}>
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
              Vincular
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{students.length}</p>
            <p className="text-xs text-muted-foreground">Alunos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{totalAssessments}</p>
            <p className="text-xs text-muted-foreground">Avaliações</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{activeAssessments}</p>
            <p className="text-xs text-muted-foreground">Em Andamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Student list */}
      {loading ? (
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Carregando alunos...
        </div>
      ) : filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>Nenhum aluno encontrado. Vincule um aluno usando o email acima.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((student) => {
            const studentAssessments = assessments[student.student_id] || [];
            const isExpanded = expandedStudent === student.student_id;
            const lastAssessment = studentAssessments[0];

            return (
              <Card key={student.student_id} className="overflow-hidden">
                <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpandedStudent(isExpanded ? null : student.student_id)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{student.full_name || student.email}</CardTitle>
                      <CardDescription className="text-xs">{student.email}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{studentAssessments.length} avaliações</Badge>
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); handleStartAssessment(student.student_id, student.full_name || student.email); }}>
                        <Plus className="h-3 w-3 mr-1" /> Nova Avaliação
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 space-y-2">
                    {studentAssessments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhuma avaliação registrada.</p>
                    ) : (
                      studentAssessments.map(a => (
                        <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(a.status)}>{a.status}</Badge>
                            <div>
                              <p className="text-sm font-medium">{new Date(a.created_at).toLocaleDateString('pt-BR')}</p>
                              <p className="text-xs text-muted-foreground">
                                {(a.context as any)?.objetivo || 'Sem objetivo definido'}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setAssessment(a.id, student.student_id, student.full_name || student.email);
                            onNavigate?.('results-hud');
                          }}>
                            <Eye className="h-4 w-4 mr-1" /> Ver
                          </Button>
                        </div>
                      ))
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
