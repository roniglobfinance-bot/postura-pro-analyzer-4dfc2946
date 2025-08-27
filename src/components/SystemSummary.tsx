import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Users, 
  FileText, 
  Camera, 
  Shield, 
  Database,
  User,
  Settings,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SystemStatus {
  component: string;
  status: 'complete' | 'partial' | 'missing';
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  icon: any;
}

const SystemSummary = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>('student');
  const [systemStats, setSystemStats] = useState<any>({});

  useEffect(() => {
    loadSystemStatus();
  }, [user]);

  const loadSystemStatus = async () => {
    if (user) {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setUserRole(profile.role);
      }

      // Get system statistics
      const { data: evaluations } = await supabase
        .from('evaluations')
        .select('*')
        .eq(profile?.role === 'teacher' ? 'teacher_id' : 'student_id', user.id);

      const { data: photos } = await supabase
        .from('photos')
        .select('*');

      const { data: students } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', user.id);

      setSystemStats({
        totalEvaluations: evaluations?.length || 0,
        totalPhotos: photos?.length || 0,
        totalStudents: students?.length || 0,
        userRole: profile?.role || 'student'
      });
    }
  };

  const systemComponents: SystemStatus[] = [
    {
      component: 'Autenticação e Segurança',
      status: 'complete',
      description: 'Sistema de autenticação Supabase implementado com RLS policies seguras',
      priority: 'critical',
      icon: Shield
    },
    {
      component: 'Dashboard por Roles',
      status: 'complete', 
      description: 'Dashboard diferenciado para professores e alunos com dados reais',
      priority: 'high',
      icon: Activity
    },
    {
      component: 'Sistema SAARS Completo',
      status: 'complete',
      description: 'Avaliação postural abrangente com 6 abas funcionais',
      priority: 'high',
      icon: FileText
    },
    {
      component: 'Upload de Fotos',
      status: 'complete',
      description: 'Sistema de upload real para Supabase Storage com organização por usuário',
      priority: 'high',
      icon: Camera
    },
    {
      component: 'Funções de Usuário',
      status: 'complete',
      description: 'Funções SQL seguras para gerenciar alunos, avaliações e dados',
      priority: 'medium',
      icon: User
    },
    {
      component: 'Banco de Dados Integrado',
      status: 'complete',
      description: 'Todas as tabelas conectadas com RLS policies e triggers',
      priority: 'critical',
      icon: Database
    },
    {
      component: 'Portal Professor/Aluno',
      status: 'complete',
      description: 'Sistema de relacionamento e gerenciamento funcional',
      priority: 'high',
      icon: Users
    },
    {
      component: 'Relatórios PDF',
      status: 'partial',
      description: 'Sistema básico implementado, precisa integração com dados reais',
      priority: 'medium',
      icon: FileText
    },
    {
      component: 'IA Diagnóstica',
      status: 'partial',
      description: 'Sistema simulado implementado, precisa integração com API real',
      priority: 'low',
      icon: Settings
    },
    {
      component: 'Notificações',
      status: 'missing',
      description: 'Sistema de notificações em tempo real não implementado',
      priority: 'low',
      icon: AlertTriangle
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'partial':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'missing':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800">Completo</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800">Parcial</Badge>;
      case 'missing':
        return <Badge className="bg-red-100 text-red-800">Ausente</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">Alto</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800">Médio</Badge>;
      case 'low':
        return <Badge variant="secondary">Baixo</Badge>;
      default:
        return <Badge variant="secondary">-</Badge>;
    }
  };

  const completedComponents = systemComponents.filter(c => c.status === 'complete').length;
  const partialComponents = systemComponents.filter(c => c.status === 'partial').length;
  const missingComponents = systemComponents.filter(c => c.status === 'missing').length;
  const completionPercentage = Math.round((completedComponents / systemComponents.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completude</p>
                <p className="text-2xl font-bold text-green-600">{completionPercentage}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Componentes</p>
                <p className="text-2xl font-bold">{completedComponents}/{systemComponents.length}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuário</p>
                <p className="text-lg font-medium capitalize">{userRole}</p>
              </div>
              <User className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avaliações</p>
                <p className="text-2xl font-bold">{systemStats.totalEvaluations}</p>
              </div>
              <FileText className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Executivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Prontuário do Sistema PosturaPro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">✅ Implementado</h4>
              <p className="text-sm text-green-700">{completedComponents} componentes funcionais</p>
              <ul className="text-xs text-green-600 mt-2 space-y-1">
                <li>• Autenticação segura</li>
                <li>• Dashboard funcional</li>
                <li>• Upload de fotos</li>
                <li>• Sistema SAARS</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Parcial</h4>
              <p className="text-sm text-yellow-700">{partialComponents} componentes em desenvolvimento</p>
              <ul className="text-xs text-yellow-600 mt-2 space-y-1">
                <li>• Relatórios PDF</li>
                <li>• IA diagnóstica</li>
              </ul>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">❌ Pendente</h4>
              <p className="text-sm text-red-700">{missingComponents} componentes não implementados</p>
              <ul className="text-xs text-red-600 mt-2 space-y-1">
                <li>• Notificações push</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">
              <strong>Status Geral:</strong> O sistema PosturaPro está {completionPercentage}% funcional com 
              as principais funcionalidades implementadas e testadas. A autenticação, dashboard, 
              avaliações e upload de fotos estão totalmente operacionais.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lista Detalhada de Componentes */}
      <Card>
        <CardHeader>
          <CardTitle>Componentes do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemComponents.map((component, index) => (
              <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <component.icon className="h-6 w-6 text-gray-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{component.component}</h4>
                    <p className="text-sm text-gray-600 mt-1">{component.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {getPriorityBadge(component.priority)}
                  {getStatusBadge(component.status)}
                  {getStatusIcon(component.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Próximos Passos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Passos Recomendados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Badge className="bg-orange-100 text-orange-800">Alta Prioridade</Badge>
              <span className="text-sm">Integrar relatórios PDF com dados reais do Supabase</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-800">Média Prioridade</Badge>
              <span className="text-sm">Implementar API de computer vision para IA diagnóstica</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Baixa Prioridade</Badge>
              <span className="text-sm">Adicionar sistema de notificações em tempo real</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSummary;