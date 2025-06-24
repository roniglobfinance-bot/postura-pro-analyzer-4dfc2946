
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Save, Calculator, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PosturalAssessment = () => {
  const [assessmentData, setAssessmentData] = useState({
    clientName: '',
    age: '',
    date: '',
    headAlignment: '',
    shoulderSymmetry: '',
    spinalCurves: '',
    pelvisAlignment: '',
    kneeAlignment: '',
    footArch: '',
    squatPattern: '',
    walkingPattern: '',
    thomasTest: '',
    oberTest: '',
    adamsTest: '',
    beightonTest: '',
    observations: ''
  });

  const handleSaveAssessment = () => {
    toast({
      title: "Avaliação Salva!",
      description: "A avaliação postural foi salva com sucesso.",
    });
  };

  const handleGenerateReport = () => {
    toast({
      title: "Relatório Gerado!",
      description: "O relatório com prescrições foi gerado automaticamente.",
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2 text-blue-600" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input
                id="clientName"
                value={assessmentData.clientName}
                onChange={(e) => setAssessmentData({...assessmentData, clientName: e.target.value})}
                placeholder="Digite o nome completo"
              />
            </div>
            <div>
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                value={assessmentData.age}
                onChange={(e) => setAssessmentData({...assessmentData, age: e.target.value})}
                placeholder="Anos"
              />
            </div>
            <div>
              <Label htmlFor="date">Data da Avaliação</Label>
              <Input
                id="date"
                type="date"
                value={assessmentData.date}
                onChange={(e) => setAssessmentData({...assessmentData, date: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Análise Postural Estática</CardTitle>
            <CardDescription>Avaliação visual nas três perspectivas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium">Alinhamento da Cabeça</Label>
              <RadioGroup
                value={assessmentData.headAlignment}
                onValueChange={(value) => setAssessmentData({...assessmentData, headAlignment: value})}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="head-normal" />
                  <Label htmlFor="head-normal">Normal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="protrusion" id="head-protrusion" />
                  <Label htmlFor="head-protrusion">Protrusão Anterior</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lateral" id="head-lateral" />
                  <Label htmlFor="head-lateral">Inclinação Lateral</Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div>
              <Label className="text-base font-medium">Simetria dos Ombros</Label>
              <Select value={assessmentData.shoulderSymmetry} onValueChange={(value) => setAssessmentData({...assessmentData, shoulderSymmetry: value})}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione a condição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="symmetric">Simétricos</SelectItem>
                  <SelectItem value="right-elevated">Ombro Direito Elevado</SelectItem>
                  <SelectItem value="left-elevated">Ombro Esquerdo Elevado</SelectItem>
                  <SelectItem value="internal-rotation">Rotação Interna</SelectItem>
                  <SelectItem value="external-rotation">Rotação Externa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-medium">Curvas da Coluna Vertebral</Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="hyperkyphosis" />
                  <Label htmlFor="hyperkyphosis">Hipercifose Torácica</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="hyperlordosis" />
                  <Label htmlFor="hyperlordosis">Hiperlordose Lombar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="scoliosis" />
                  <Label htmlFor="scoliosis">Escoliose</Label>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-base font-medium">Alinhamento Pélvico</Label>
              <RadioGroup
                value={assessmentData.pelvisAlignment}
                onValueChange={(value) => setAssessmentData({...assessmentData, pelvisAlignment: value})}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="neutral" id="pelvis-neutral" />
                  <Label htmlFor="pelvis-neutral">Neutro</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="anterior-tilt" id="pelvis-anterior" />
                  <Label htmlFor="pelvis-anterior">Inclinação Anterior</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="posterior-tilt" id="pelvis-posterior" />
                  <Label htmlFor="pelvis-posterior">Inclinação Posterior</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Avaliação Dinâmica</CardTitle>
          <CardDescription>Análise de movimentos funcionais</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-base font-medium">Padrão de Agachamento</Label>
            <Select value={assessmentData.squatPattern} onValueChange={(value) => setAssessmentData({...assessmentData, squatPattern: value})}>
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
            <Select value={assessmentData.walkingPattern} onValueChange={(value) => setAssessmentData({...assessmentData, walkingPattern: value})}>
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
              onValueChange={(value) => setAssessmentData({...assessmentData, thomasTest: value})}
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
              onValueChange={(value) => setAssessmentData({...assessmentData, oberTest: value})}
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

      <Card>
        <CardHeader>
          <CardTitle>Observações Adicionais</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Descreva observações importantes, compensações notadas, limitações de mobilidade ou outros achados relevantes..."
            value={assessmentData.observations}
            onChange={(e) => setAssessmentData({...assessmentData, observations: e.target.value})}
            className="min-h-[120px]"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PosturalAssessment;
