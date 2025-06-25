
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, TrendingUp, Download, User, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface Assessment {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  saarsScore: number;
  severity: string;
  findings: {
    headAlignment: string;
    shoulderSymmetry: string;
    spinalCurves: string[];
    pelvisAlignment: string;
    kneeAlignment: string;
    footArch: string;
  };
  functionalTests: {
    thomasTest: string;
    oberTest: string;
    adamsTest: string;
    beightonTest: string;
    squatPattern: string;
    walkingPattern: string;
  };
  prescription: string[];
}

const ProgressReports = () => {
  const [selectedClient, setSelectedClient] = useState('');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - em produção viria de uma API
  const mockAssessments: Assessment[] = [
    {
      id: '1',
      clientId: 'client-1',
      clientName: 'Maria Silva',
      date: '2024-01-15',
      saarsScore: 45,
      severity: 'Moderado',
      findings: {
        headAlignment: 'protrusion',
        shoulderSymmetry: 'right-elevated',
        spinalCurves: ['hyperkyphosis'],
        pelvisAlignment: 'anterior-tilt',
        kneeAlignment: 'valgus',
        footArch: 'collapsed'
      },
      functionalTests: {
        thomasTest: 'positive-mild',
        oberTest: 'negative',
        adamsTest: 'positive-severe',
        beightonTest: 'negative',
        squatPattern: 'knee-valgus',
        walkingPattern: 'overpronation'
      },
      prescription: [
        'Fortalecimento do core',
        'Alongamento de flexores do quadril',
        'Mobilidade torácica',
        'Correção da pisada'
      ]
    },
    {
      id: '2',
      clientId: 'client-1',
      clientName: 'Maria Silva',
      date: '2024-03-15',
      saarsScore: 62,
      severity: 'Leve',
      findings: {
        headAlignment: 'normal',
        shoulderSymmetry: 'symmetric',
        spinalCurves: ['hyperkyphosis'],
        pelvisAlignment: 'neutral',
        kneeAlignment: 'normal',
        footArch: 'normal'
      },
      functionalTests: {
        thomasTest: 'negative',
        oberTest: 'negative',
        adamsTest: 'positive-mild',
        beightonTest: 'negative',
        squatPattern: 'normal',
        walkingPattern: 'normal'
      },
      prescription: [
        'Manutenção do core',
        'Mobilidade torácica avançada'
      ]
    }
  ];

  useEffect(() => {
    setAssessments(mockAssessments);
  }, []);

  const clients = [...new Set(assessments.map(a => ({ id: a.clientId, name: a.clientName })))];
  const clientAssessments = selectedClient 
    ? assessments.filter(a => a.clientId === selectedClient)
    : assessments;

  const progressData = clientAssessments.map(assessment => ({
    date: new Date(assessment.date).toLocaleDateString('pt-BR'),
    score: assessment.saarsScore,
    severity: assessment.severity
  }));

  const generateProgressReport = async () => {
    if (!selectedClient) {
      toast({
        title: "Erro",
        description: "Selecione um cliente para gerar o relatório.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const pdf = new jsPDF();
      const clientData = clientAssessments[0];
      
      // Cabeçalho
      pdf.setFontSize(20);
      pdf.text('SAARS - Relatório de Progresso', 105, 20, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.text(`Cliente: ${clientData.clientName}`, 20, 40);
      pdf.text(`Período: ${clientAssessments[clientAssessments.length - 1].date} a ${clientAssessments[0].date}`, 20, 50);
      pdf.text(`Total de Avaliações: ${clientAssessments.length}`, 20, 60);
      
      let yPos = 80;
      
      // Evolução do Score SAARS
      pdf.setFontSize(16);
      pdf.text('Evolução do Score SAARS:', 20, yPos);
      yPos += 15;
      
      clientAssessments.forEach((assessment, index) => {
        pdf.setFontSize(12);
        pdf.text(`${assessment.date}: ${assessment.saarsScore} pontos (${assessment.severity})`, 25, yPos);
        yPos += 10;
      });
      
      yPos += 10;
      
      // Análise de Melhoria
      const firstScore = clientAssessments[clientAssessments.length - 1].saarsScore;
      const lastScore = clientAssessments[0].saarsScore;
      const improvement = lastScore - firstScore;
      
      pdf.setFontSize(14);
      pdf.text('Análise de Progresso:', 20, yPos);
      yPos += 15;
      
      pdf.setFontSize(12);
      if (improvement > 0) {
        pdf.text(`✓ Melhoria de ${improvement} pontos no Score SAARS`, 25, yPos);
        pdf.text(`✓ Evolução positiva da condição postural`, 25, yPos + 10);
      } else if (improvement < 0) {
        pdf.text(`⚠ Piora de ${Math.abs(improvement)} pontos no Score SAARS`, 25, yPos);
        pdf.text(`⚠ Necessária revisão do protocolo de tratamento`, 25, yPos + 10);
      } else {
        pdf.text(`→ Score mantido em ${lastScore} pontos`, 25, yPos);
        pdf.text(`→ Estabilização da condição postural`, 25, yPos + 10);
      }
      
      pdf.save(`Relatorio_Progresso_${clientData.clientName.replace(/\s+/g, '_')}.pdf`);
      
      toast({
        title: "Relatório gerado!",
        description: "O relatório de progresso foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Normal': return 'bg-green-100 text-green-800';
      case 'Leve': return 'bg-yellow-100 text-yellow-800';
      case 'Moderado': return 'bg-orange-100 text-orange-800';
      case 'Grave': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios de Progresso</h2>
          <p className="text-gray-600">Acompanhamento da evolução postural dos clientes</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={generateProgressReport}
            disabled={isLoading || !selectedClient}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            {isLoading ? 'Gerando...' : 'Gerar PDF'}
          </Button>
        </div>
      </div>

      {selectedClient && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="evolution">Evolução</TabsTrigger>
            <TabsTrigger value="detailed">Detalhado</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Score Atual</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{clientAssessments[0]?.saarsScore || 0}</div>
                  <Badge className={getSeverityColor(clientAssessments[0]?.severity || '')}>
                    {clientAssessments[0]?.severity || 'N/A'}
                  </Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avaliações</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{clientAssessments.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Última: {clientAssessments[0]?.date}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Melhoria</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {clientAssessments.length > 1 
                      ? `${clientAssessments[0].saarsScore - clientAssessments[clientAssessments.length - 1].saarsScore}` 
                      : '0'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">pontos de progresso</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="evolution" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Evolução do Score SAARS</CardTitle>
                <CardDescription>Progresso ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            <div className="space-y-4">
              {clientAssessments.map((assessment) => (
                <Card key={assessment.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Avaliação - {assessment.date}</CardTitle>
                      <Badge className={getSeverityColor(assessment.severity)}>
                        {assessment.severity} ({assessment.saarsScore} pontos)
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Principais Achados:</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Cabeça:</span> {assessment.findings.headAlignment}
                        </div>
                        <div>
                          <span className="font-medium">Ombros:</span> {assessment.findings.shoulderSymmetry}
                        </div>
                        <div>
                          <span className="font-medium">Pelve:</span> {assessment.findings.pelvisAlignment}
                        </div>
                        <div>
                          <span className="font-medium">Joelhos:</span> {assessment.findings.kneeAlignment}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Prescrições Ativas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {assessment.prescription.map((item, idx) => (
                          <Badge key={idx} variant="outline">{item}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ProgressReports;
