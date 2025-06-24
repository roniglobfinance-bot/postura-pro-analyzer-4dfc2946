
import { Plus, Users, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const stats = [
    {
      title: "Total de Clientes",
      value: "24",
      description: "3 novos este mês",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Avaliações Realizadas",
      value: "67",
      description: "8 esta semana",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Casos Graves",
      value: "5",
      description: "Requerem atenção especial",
      icon: AlertTriangle,
      color: "text-red-600"
    },
    {
      title: "Próximas Reavaliações",
      value: "12",
      description: "Nos próximos 7 dias",
      icon: Calendar,
      color: "text-purple-600"
    }
  ];

  const recentAssessments = [
    { name: "Maria Silva", date: "2024-06-20", severity: "Moderado", issue: "Hipercifose Torácica" },
    { name: "João Santos", date: "2024-06-18", severity: "Leve", issue: "Rotação Pélvica" },
    { name: "Ana Costa", date: "2024-06-17", severity: "Grave", issue: "Escoliose" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Visão geral das suas avaliações posturais</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Avaliação
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Avaliações Recentes</CardTitle>
            <CardDescription>Últimas avaliações realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAssessments.map((assessment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{assessment.name}</p>
                    <p className="text-sm text-gray-600">{assessment.issue}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      assessment.severity === 'Grave' ? 'bg-red-100 text-red-800' :
                      assessment.severity === 'Moderado' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {assessment.severity}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{assessment.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prescrições Ativas</CardTitle>
            <CardDescription>Treinos corretivos em andamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-medium text-blue-900">Fortalecimento do Core</h4>
                <p className="text-sm text-blue-700">Maria Silva - 3 semanas restantes</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <h4 className="font-medium text-green-900">Alongamento de Isquiotibiais</h4>
                <p className="text-sm text-green-700">João Santos - 2 semanas restantes</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-medium text-purple-900">Mobilidade Torácica</h4>
                <p className="text-sm text-purple-700">Ana Costa - 6 semanas restantes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
