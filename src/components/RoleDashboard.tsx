import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Clock, 
  Plus,
  Eye,
  Edit,
  GraduationCap,
  ChartBar,
  UserPlus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseFunctions } from '@/hooks/useSupabaseFunctions';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RoleDashboardProps {
  userRole: 'teacher' | 'student';
}

const RoleDashboard = ({ userRole }: RoleDashboardProps) => {
  const { user } = useAuth();
  const { 
    loading, 
    getTeacherStudents, 
    getStudentEvaluations, 
    addStudentToTeacher,
    createEvaluation 
  } = useSupabaseFunctions();
  
  const [stats, setStats] = useState<any>({});
  const [students, setStudents] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [isCreateEvalOpen, setIsCreateEvalOpen] = useState(false);
  const [evalTitle, setEvalTitle] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, userRole]);

  const loadDashboardData = async () => {
    try {
      if (userRole === 'teacher') {
        await loadTeacherData();
      } else {
        await loadStudentData();
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const loadTeacherData = async () => {
    if (!user) return;

    // Load teacher's students using new function
    const studentsData = await getTeacherStudents();
    setStudents(studentsData);

    // Load evaluations for teacher
    const { data: evaluationsData } = await supabase
      .from('evaluations')
      .select('*')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    setEvaluations(evaluationsData || []);

    // Calculate stats
    const totalStudents = studentsData.length;
    const totalEvaluations = evaluationsData?.length || 0;
    const completedEvaluations = evaluationsData?.filter(e => e.status === 'completed').length || 0;
    const pendingEvaluations = totalEvaluations - completedEvaluations;

    setStats({
      totalStudents,
      totalEvaluations,
      completedEvaluations,
      pendingEvaluations
    });
  };

  const loadStudentData = async () => {
    if (!user) return;

    // Load student's evaluations using new function
    const evaluationsData = await getStudentEvaluations();
    setEvaluations(evaluationsData);

    // Calculate stats
    const totalEvaluations = evaluationsData.length;
    const completedEvaluations = evaluationsData.filter(e => e.status === 'completed').length;
    const lastEvaluation = evaluationsData[0];

    setStats({
      totalEvaluations,
      completedEvaluations,
      lastEvaluation: lastEvaluation?.created_at || null
    });
  };

  const handleAddStudent = async () => {
    if (!user || !studentEmail) return;

    const result = await addStudentToTeacher(user.id, studentEmail);
    if (result.success) {
      setStudentEmail('');
      setIsAddStudentOpen(false);
      loadTeacherData(); // Reload data
    }
  };

  const handleCreateEvaluation = async () => {
    if (!evalTitle) return;

    const result = await createEvaluation(evalTitle, selectedStudentId || undefined);
    if (result.success) {
      setEvalTitle('');
      setSelectedStudentId('');
      setIsCreateEvalOpen(false);
      loadTeacherData(); // Reload data
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (userRole === 'teacher') {
    return (
      <div className="space-y-6">
        {/* Teacher Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alunos</p>
                  <p className="text-2xl font-bold">{stats.totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avaliações</p>
                  <p className="text-2xl font-bold">{stats.totalEvaluations}</p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                  <p className="text-2xl font-bold">{stats.completedEvaluations}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold">{stats.pendingEvaluations}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teacher Content */}
        <Tabs defaultValue="students" className="space-y-4">
          <TabsList>
            <TabsTrigger value="students">Alunos</TabsTrigger>
            <TabsTrigger value="evaluations">Avaliações</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Meus Alunos</h3>
              <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar Aluno
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Aluno</DialogTitle>
                    <DialogDescription>
                      Digite o email do aluno que deseja adicionar.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="studentEmail">Email do Aluno</Label>
                      <Input
                        id="studentEmail"
                        type="email"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="aluno@exemplo.com"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddStudentOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddStudent} disabled={loading || !studentEmail}>
                      {loading ? 'Adicionando...' : 'Adicionar'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <Card key={student.student_id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{student.full_name}</h4>
                      <Badge variant="outline">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        Aluno
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{student.email}</p>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <Eye className="h-3 w-3 mr-1" />
                Ver
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setSelectedStudentId(student.student_id);
                  setEvalTitle(`Avaliação de ${student.full_name} - ${new Date().toLocaleDateString('pt-BR')}`);
                  setIsCreateEvalOpen(true);
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Avaliar
              </Button>
            </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="evaluations" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Avaliações Recentes</h3>
              <Dialog open={isCreateEvalOpen} onOpenChange={setIsCreateEvalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Avaliação
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Avaliação</DialogTitle>
                    <DialogDescription>
                      Crie uma nova avaliação postural para um aluno.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="evalTitle">Título da Avaliação</Label>
                      <Input
                        id="evalTitle"
                        value={evalTitle}
                        onChange={(e) => setEvalTitle(e.target.value)}
                        placeholder="Ex: Avaliação Inicial - Janeiro 2024"
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentSelect">Aluno (Opcional)</Label>
                      <select
                        id="studentSelect"
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecionar aluno...</option>
                        {students.map((student) => (
                          <option key={student.student_id} value={student.student_id}>
                            {student.full_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateEvalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateEvaluation} disabled={loading || !evalTitle}>
                      {loading ? 'Criando...' : 'Criar Avaliação'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {evaluations.map((evaluation) => (
                <Card key={evaluation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{evaluation.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(evaluation.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={evaluation.status === 'completed' ? 'default' : 'secondary'}>
                          {evaluation.status === 'completed' ? 'Concluída' : 'Rascunho'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Student Dashboard
  return (
    <div className="space-y-6">
      {/* Student Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avaliações</p>
                <p className="text-2xl font-bold">{stats.totalEvaluations}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold">{stats.completedEvaluations}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Última Avaliação</p>
                <p className="text-sm font-medium">
                  {stats.lastEvaluation 
                    ? new Date(stats.lastEvaluation).toLocaleDateString('pt-BR')
                    : 'Nenhuma'
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Evaluations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ChartBar className="h-5 w-5 mr-2" />
            Minhas Avaliações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {evaluations.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma avaliação encontrada</p>
                <p className="text-sm text-muted-foreground">
                  Aguarde seu professor criar uma avaliação para você
                </p>
              </div>
            ) : (
              evaluations.map((evaluation) => (
                <Card key={evaluation.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{evaluation.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(evaluation.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={evaluation.status === 'completed' ? 'default' : 'secondary'}>
                          {evaluation.status === 'completed' ? 'Concluída' : 'Em andamento'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Visualizar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleDashboard;