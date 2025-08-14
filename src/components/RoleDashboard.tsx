import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Clock, 
  Plus,
  Eye,
  Edit,
  GraduationCap,
  ChartBar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface RoleDashboardProps {
  userRole: 'teacher' | 'student';
}

const RoleDashboard = ({ userRole }: RoleDashboardProps) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, userRole]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      if (userRole === 'teacher') {
        await loadTeacherData();
      } else {
        await loadStudentData();
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({
        title: "Erro ao carregar dashboard",
        description: "Não foi possível carregar os dados.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTeacherData = async () => {
    // Load teacher's students
    const { data: studentsData } = await supabase
      .from('students')
      .select(`
        *,
        profiles!students_student_id_fkey(full_name, email)
      `)
      .eq('teacher_id', user?.id);

    setStudents(studentsData || []);

    // Load evaluations for teacher's students
    const { data: evaluationsData } = await supabase
      .from('evaluations')
      .select('*')
      .eq('teacher_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(10);

    setEvaluations(evaluationsData || []);

    // Calculate stats
    const totalStudents = studentsData?.length || 0;
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
    // Load student's evaluations
    const { data: evaluationsData } = await supabase
      .from('evaluations')
      .select('*')
      .eq('student_id', user?.id)
      .order('created_at', { ascending: false });

    setEvaluations(evaluationsData || []);

    // Calculate stats
    const totalEvaluations = evaluationsData?.length || 0;
    const completedEvaluations = evaluationsData?.filter(e => e.status === 'completed').length || 0;
    const lastEvaluation = evaluationsData?.[0];

    setStats({
      totalEvaluations,
      completedEvaluations,
      lastEvaluation: lastEvaluation?.created_at || null
    });
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
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Aluno
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <Card key={student.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{student.profiles?.full_name}</h4>
                      <Badge variant="outline">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        Aluno
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{student.profiles?.email}</p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button size="sm" variant="outline">
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
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Avaliação
              </Button>
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