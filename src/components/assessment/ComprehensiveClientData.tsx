
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ClientData } from '../PosturalAssessment';

interface ComprehensiveClientDataProps {
  data: ClientData;
  onChange: (field: keyof ClientData, value: any) => void;
  onNext: () => void;
}

const ComprehensiveClientData = ({ data, onChange, onNext }: ComprehensiveClientDataProps) => {
  const handleInputChange = (field: keyof ClientData, value: any) => {
    onChange(field, value);
  };

  const isFormValid = () => {
    return data.fullName && data.age > 0 && data.height > 0 && data.weight > 0;
  };

  return (
    <div className="space-y-6">
      {/* A. DADOS PESSOAIS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-600">A. DADOS PESSOAIS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Nome completo *</Label>
              <Input
                id="fullName"
                value={data.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Nome completo do cliente"
              />
            </div>
            <div>
              <Label htmlFor="age">Idade *</Label>
              <Input
                id="age"
                type="number"
                value={data.age || ''}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                placeholder="Idade"
              />
            </div>
            <div>
              <Label htmlFor="gender">Sexo</Label>
              <Select value={data.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="height">Altura (cm) *</Label>
              <Input
                id="height"
                type="number"
                value={data.height || ''}
                onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
                placeholder="Altura em centímetros"
              />
            </div>
            <div>
              <Label htmlFor="weight">Peso (kg) *</Label>
              <Input
                id="weight"
                type="number"
                value={data.weight || ''}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                placeholder="Peso em quilogramas"
              />
            </div>
            <div>
              <Label htmlFor="profession">Profissão</Label>
              <Input
                id="profession"
                value={data.profession}
                onChange={(e) => handleInputChange('profession', e.target.value)}
                placeholder="Profissão/Ocupação"
              />
            </div>
            <div>
              <Label htmlFor="dailyHoursSitting">Horas diárias sentado</Label>
              <Input
                id="dailyHoursSitting"
                type="number"
                value={data.dailyHoursSitting || ''}
                onChange={(e) => handleInputChange('dailyHoursSitting', parseInt(e.target.value) || 0)}
                placeholder="Horas por dia"
              />
            </div>
            <div>
              <Label htmlFor="dailyHoursStanding">Horas diárias em pé</Label>
              <Input
                id="dailyHoursStanding"
                type="number"
                value={data.dailyHoursStanding || ''}
                onChange={(e) => handleInputChange('dailyHoursStanding', parseInt(e.target.value) || 0)}
                placeholder="Horas por dia"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* B. HISTÓRICO MÉDICO */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-600">B. HISTÓRICO MÉDICO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="knownInjuries">Lesões conhecidas</Label>
            <Textarea
              id="knownInjuries"
              value={data.knownInjuries}
              onChange={(e) => handleInputChange('knownInjuries', e.target.value)}
              placeholder="Ex.: hérnia de disco, entorses recorrentes"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="previousSurgeries">Cirurgias prévias</Label>
            <Textarea
              id="previousSurgeries"
              value={data.previousSurgeries}
              onChange={(e) => handleInputChange('previousSurgeries', e.target.value)}
              placeholder="Descreva cirurgias anteriores"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="chronicDiseases">Doenças crônicas</Label>
            <Textarea
              id="chronicDiseases"
              value={data.chronicDiseases}
              onChange={(e) => handleInputChange('chronicDiseases', e.target.value)}
              placeholder="Ex.: diabetes, artrite, hipertensão"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="currentMedications">Medicações em uso</Label>
            <Textarea
              id="currentMedications"
              value={data.currentMedications}
              onChange={(e) => handleInputChange('currentMedications', e.target.value)}
              placeholder="Liste medicamentos atuais"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="allergies">Alergias</Label>
            <Textarea
              id="allergies"
              value={data.allergies}
              onChange={(e) => handleInputChange('allergies', e.target.value)}
              placeholder="Alergias conhecidas"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* C. HÁBITOS E ESTILO DE VIDA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-600">C. HÁBITOS E ESTILO DE VIDA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nível de atividade física</Label>
            <Select value={data.activityLevel} onValueChange={(value) => handleInputChange('activityLevel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentário</SelectItem>
                <SelectItem value="moderate">Moderado</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="athlete">Atleta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sportsActivity">Prática esportiva</Label>
              <Input
                id="sportsActivity"
                value={data.sportsActivity}
                onChange={(e) => handleInputChange('sportsActivity', e.target.value)}
                placeholder="Qual esporte?"
              />
            </div>
            <div>
              <Label htmlFor="sportsFrequency">Frequência</Label>
              <Input
                id="sportsFrequency"
                value={data.sportsFrequency}
                onChange={(e) => handleInputChange('sportsFrequency', e.target.value)}
                placeholder="Quantas vezes por semana?"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sleepHours">Horas de sono por noite</Label>
              <Input
                id="sleepHours"
                type="number"
                value={data.sleepHours || ''}
                onChange={(e) => handleInputChange('sleepHours', parseInt(e.target.value) || 8)}
                placeholder="Horas de sono"
              />
            </div>
            <div>
              <Label>Qualidade do sono</Label>
              <Select value={data.sleepQuality} onValueChange={(value) => handleInputChange('sleepQuality', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Qualidade do sono" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poor">Ruim</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="good">Boa</SelectItem>
                  <SelectItem value="excellent">Excelente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Alimentação</Label>
            <Select value={data.diet} onValueChange={(value) => handleInputChange('diet', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de alimentação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balanced">Balanceada</SelectItem>
                <SelectItem value="vegetarian">Vegetariana</SelectItem>
                <SelectItem value="processed">Rica em processados</SelectItem>
                <SelectItem value="other">Outra</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="smoking"
                checked={data.smoking}
                onCheckedChange={(checked) => handleInputChange('smoking', checked)}
              />
              <Label htmlFor="smoking">Tabagismo</Label>
            </div>
            <div>
              <Label>Consumo de álcool</Label>
              <Select value={data.alcohol} onValueChange={(value) => handleInputChange('alcohol', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Frequência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não bebo</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="frequent">Frequente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* D. QUEIXAS PRINCIPAIS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-600">D. QUEIXAS PRINCIPAIS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="painLocation">Local da dor</Label>
            <Input
              id="painLocation"
              value={data.painLocation}
              onChange={(e) => handleInputChange('painLocation', e.target.value)}
              placeholder="Onde sente dor?"
            />
          </div>
          <div>
            <Label>Intensidade da dor (0-10)</Label>
            <div className="px-2">
              <Slider
                value={[data.painIntensity]}
                onValueChange={(value) => handleInputChange('painIntensity', value[0])}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>0 - Sem dor</span>
                <span className="font-medium">{data.painIntensity}</span>
                <span>10 - Dor extrema</span>
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="painFrequency">Frequência da dor</Label>
            <Input
              id="painFrequency"
              value={data.painFrequency}
              onChange={(e) => handleInputChange('painFrequency', e.target.value)}
              placeholder="Com que frequência sente dor?"
            />
          </div>
          <div>
            <Label htmlFor="jointStiffness">Rigidez articular</Label>
            <Textarea
              id="jointStiffness"
              value={data.jointStiffness}
              onChange={(e) => handleInputChange('jointStiffness', e.target.value)}
              placeholder="Quais articulações sentem rígidas?"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="posturalFatigue">Fadiga postural</Label>
            <Textarea
              id="posturalFatigue"
              value={data.posturalFatigue}
              onChange={(e) => handleInputChange('posturalFatigue', e.target.value)}
              placeholder="Após quanto tempo sente fadiga?"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="functionalDifficulties">Dificuldades funcionais</Label>
            <Textarea
              id="functionalDifficulties"
              value={data.functionalDifficulties}
              onChange={(e) => handleInputChange('functionalDifficulties', e.target.value)}
              placeholder="Ex.: subir escadas, levantar peso"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* E. OBJETIVOS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-600">E. OBJETIVOS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="primaryGoal">Objetivo primário</Label>
            <Textarea
              id="primaryGoal"
              value={data.primaryGoal}
              onChange={(e) => handleInputChange('primaryGoal', e.target.value)}
              placeholder="Ex.: alívio de dor, melhora postural"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="secondaryGoal">Objetivo secundário</Label>
            <Textarea
              id="secondaryGoal"
              value={data.secondaryGoal}
              onChange={(e) => handleInputChange('secondaryGoal', e.target.value)}
              placeholder="Ex.: ganho de mobilidade, performance esportiva"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={onNext}
          disabled={!isFormValid()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Próximo: Avaliação Postural
        </Button>
      </div>
    </div>
  );
};

export default ComprehensiveClientData;
