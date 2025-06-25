import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Calculator, FileText, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import PosturalAnalysisSection from './assessment/PosturalAnalysisSection';
import AutomaticDiagnosis from './assessment/AutomaticDiagnosis';

const PosturalAssessment = () => {
  const [assessmentData, setAssessmentData] = useState({
    // Dados básicos
    clientName: '',
    age: '',
    height: '',
    weight: '',
    date: new Date().toISOString().split('T')[0],
    
    // Medições angulares - Vista Sagital
    cranioCervicalAngle: 55,
    thoracicKyphosis: 30,
    lumbarLordosis: 50,
    pelvicTilt: 12,
    
    // Assimetrias - Vista Frontal
    shoulderImbalance: 0,
    cobbAngle: 0,
    pelvicImbalance: 0,
    
    // Vista Posterior
    scapularAbduction: 'normal',
    scapularElevation: 'symmetric',
    
    // Testes funcionais específicos
    thomasTest: 'negative',
    oberTest: 'negative',
    adamsTest: 'negative',
    beightonTest: 'negative',
    
    // Avaliação dinâmica
    squatPattern: 'normal',
    walkingPattern: 'normal',
    
    // Observações
    observations: '',
    complaints: ''
  });

  const handleDataChange = (field: string, value: any) => {
    setAssessmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveAssessment = () => {
    // Aqui salvaria no banco de dados
    console.log('Salvando avaliação:', assessmentData);
    toast({
      title: "Avaliação Salva!",
      description: "A avaliação postural SAARS foi salva com sucesso.",
    });
  };

  const handleGenerateReport = () => {
    // Aqui geraria o relatório completo
    toast({
      title: "Relatório Gerado!",
      description: "O relatório com diagnóstico e prescrições foi gerado.",
    });
  };

  const handleGeneratePrescription = () => {
    toast({
      title: "Protocolo Gerado!",
      description: "Protocolo de exercícios personalizado foi criado com base na avaliação.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Avaliação Postural SAARS</h2>
          <p className="text-gray-600">Sistema de Avaliação e Análise Rigorosa da Postura</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSaveAssessment} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
          <Button onClick={handleGenerateReport} className="bg-blue-600 hover:bg-blue-700">
            <FileText className="h-4 w-4 mr-2" />
            Gerar Relatório
          </Button>
        </div>
      </div>

      <Tabs defaultValue="client-data" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="client-data">Dados do Cliente</TabsTrigger>
          <TabsTrigger value="postural-analysis">Análise Postural</TabsTrigger>
          <TabsTrigger value="functional-tests">Testes Funcionais</TabsTrigger>
          <TabsTrigger value="diagnosis">Diagnóstico</TabsTrigger>
        </TabsList>

        <TabsContent value="client-data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Nome Completo</Label>
                <Input
                  id="clientName"
                  value={assessmentData.clientName}
                  onChange={(e) => handleDataChange('clientName', e.target.value)}
                  placeholder="Digite o nome completo"
                />
              </div>
              <div>
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  value={assessmentData.age}
                  onChange={(e) => handleDataChange('age', e.target.value)}
                  placeholder="Anos"
                />
              </div>
              <div>
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={assessmentData.height}
                  onChange={(e) => handleDataChange('height', e.target.value)}
                  placeholder="Ex: 170"
                />
              </div>
              <div>
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={assessmentData.weight}
                  onChange={(e) => handleDataChange('weight', e.target.value)}
                  placeholder="Ex: 70"
                />
              </div>
              <div>
                <Label htmlFor="date">Data da Avaliação</Label>
                <Input
                  id="date"
                  type="date"
                  value={assessmentData.date}
                  onChange={(e) => handleDataChange('date', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Queixas e Histórico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="complaints">Principais Queixas</Label>
                <Textarea
                  id="complaints"
                  value={assessmentData.complaints}
                  onChange={(e) => handleDataChange('complaints', e.target.value)}
                  placeholder="Descreva as principais queixas do cliente..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="postural-analysis" className="space-y-4">
          <PosturalAnalysisSection 
            data={assessmentData} 
            onChange={handleDataChange}
          />
        </TabsContent>

        <TabsContent value="functional-tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Avaliação Dinâmica</CardTitle>
              <CardDescription>Análise de movimentos funcionais</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-base font-medium">Padrão de Agachamento</Label>
                <Select value={assessmentData.squatPattern} onValueChange={(value) => handleDataChange('squatPattern', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Avalie o movimento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="knee-valgus">Valgo de Joelho</SelectItem>
                    <SelectItem value="forward-lean">Inclinação Anterior Excessiva</SelectItem>
                    <SelectItem value="heel-rise">Elevação dos Calcanhares</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-medium">Padrão de Marcha</Label>
                <Select value={assessmentData.walkingPattern} onValueChange={(value) => handleDataChange('walkingPattern', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Avalie a caminhada" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="trendelenburg">Sinal de Trendelenburg</SelectItem>
                    <SelectItem value="overpronation">Sobrepronação</SelectItem>
                    <SelectItem value="toe-out">Rotação Externa dos Pés</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Testes Específicos</CardTitle>
              <CardDescription>Testes funcionais padronizados</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-base font-medium">Teste de Thomas (Iliopsoas)</Label>
                <RadioGroup
                  value={assessmentData.thomasTest}
                  onValueChange={(value) => handleDataChange('thomasTest', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="negative" id="thomas-negative" />
                    <Label htmlFor="thomas-negative">Negativo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="positive-mild" id="thomas-mild" />
                    <Label htmlFor="thomas-mild">Positivo Leve</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="positive-severe" id="thomas-severe" />
                    <Label htmlFor="thomas-severe">Positivo Severo</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium">Teste de Ober (Banda Iliotibial)</Label>
                <RadioGroup
                  value={assessmentData.oberTest}
                  onValueChange={(value) => handleDataChange('oberTest', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="negative" id="ober-negative" />
                    <Label htmlFor="ober-negative">Negativo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="positive-mild" id="ober-mild" />
                    <Label htmlFor="ober-mild">Positivo Leve</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="positive-severe" id="ober-severe" />
                    <Label htmlFor="ober-severe">Positivo Severo</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnosis" className="space-y-4">
          <AutomaticDiagnosis 
            assessmentData={assessmentData}
            onGeneratePrescription={handleGeneratePrescription}
          />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Observações Adicionais</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Observações importantes, compensações notadas, limitações de mobilidade..."
            value={assessmentData.observations}
            onChange={(e) => handleDataChange('observations', e.target.value)}
            className="min-h-[120px]"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PosturalAssessment;
