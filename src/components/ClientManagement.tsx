
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Eye, Calendar, AlertTriangle } from 'lucide-react';

const ClientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const clients = [
    {
      id: 1,
      name: "Maria Silva",
      age: 34,
      lastAssessment: "2024-06-20",
      nextReeval: "2024-07-25",
      status: "Ativo",
      severity: "Moderado",
      mainIssue: "Hipercifose Torácica",
      phone: "(11) 99999-1234"
    },
    {
      id: 2,
      name: "João Santos",
      age: 28,
      lastAssessment: "2024-06-18",
      nextReeval: "2024-07-23",
      status: "Ativo",
      severity: "Leve",
      mainIssue: "Rotação Pélvica Anterior",
      phone: "(11) 99999-5678"
    },
    {
      id: 3,
      name: "Ana Costa",
      age: 42,
      lastAssessment: "2024-06-17",
      nextReeval: "2024-07-22",
      status: "Ativo",
      severity: "Grave",
      mainIssue: "Escoliose Lombar",
      phone: "(11) 99999-9012"
    },
    {
      id: 4,
      name: "Pedro Oliveira",
      age: 31,
      lastAssessment: "2024-06-15",
      nextReeval: "2024-07-20",
      status: "Inativo",
      severity: "Leve",
      mainIssue: "Pé Plano Bilateral",
      phone: "(11) 99999-3456"
    }
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.mainIssue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Grave':
        return 'bg-red-100 text-red-800';
      case 'Moderado':
        return 'bg-yellow-100 text-yellow-800';
      case 'Leve':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Clientes</h2>
          <p className="text-gray-600">Visualize e gerencie todos os seus clientes</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Clientes</span>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome ou condição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardTitle>
          <CardDescription>
            {filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''} encontrado{filteredClients.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <Badge className={getStatusColor(client.status)}>
                      {client.status}
                    </Badge>
                  </div>
                  <CardDescription>{client.age} anos • {client.phone}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Condição Principal:</span>
                    <Badge className={getSeverityColor(client.severity)}>
                      {client.severity}
                    </Badge>
                  </div>
                  
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{client.mainIssue}</p>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Última avaliação: {client.lastAssessment}</span>
                    </div>
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span>Próxima reavaliação: {client.nextReeval}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Perfil
                    </Button>
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <Calendar className="h-4 w-4 mr-1" />
                      Reavaliar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estatísticas Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Casos Ativos:</span>
              <span className="font-medium">18</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Casos Graves:</span>
              <span className="font-medium text-red-600">5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Reavaliações Pendentes:</span>
              <span className="font-medium text-yellow-600">12</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Condições Mais Comuns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Hipercifose</span>
              <span className="text-sm font-medium">8 casos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Rotação Pélvica</span>
              <span className="text-sm font-medium">6 casos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Escoliose</span>
              <span className="text-sm font-medium">4 casos</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximas Ações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-2 bg-yellow-50 rounded border-l-2 border-yellow-400">
              <p className="text-sm font-medium">3 reavaliações hoje</p>
            </div>
            <div className="p-2 bg-blue-50 rounded border-l-2 border-blue-400">
              <p className="text-sm font-medium">5 relatórios para revisar</p>
            </div>
            <div className="p-2 bg-green-50 rounded border-l-2 border-green-400">
              <p className="text-sm font-medium">2 casos melhoraram</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientManagement;
