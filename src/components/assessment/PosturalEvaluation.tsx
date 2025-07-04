
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PosturalAssessmentData } from '../PosturalAssessment';

interface PosturalEvaluationProps {
  data: PosturalAssessmentData;
  onChange: (field: keyof PosturalAssessmentData, value: any) => void;
  onNext: () => void;
}

const PosturalEvaluation = ({ data, onChange, onNext }: PosturalEvaluationProps) => {
  const handleChange = (field: keyof PosturalAssessmentData, value: any) => {
    onChange(field, value);
  };

  const posturalDeviations = [
    { key: 'headForward', label: 'Cabeça anteriorizada', field: 'headForward' },
    { key: 'shouldersProtracted', label: 'Ombros protusos', field: 'shouldersProtracted' },
    { key: 'scapularWinging', label: 'Escápulas aladas', field: 'scapularWinging' },
    { key: 'thoracicKyphosis', label: 'Hipercifose torácica', field: 'thoracicKyphosis' },
    { key: 'lumbarLordosis', label: 'Hiperlordose lombar', field: 'lumbarLordosis' },
    { key: 'pelvicAnteversion', label: 'Pélvis anteversão', field: 'pelvicAnteversion' },
    { key: 'kneeValgusVarus', label: 'Joelhos valgos/varos', field: 'kneeValgusVarus' },
    { key: 'flatFeet', label: 'Pés planos/cavos', field: 'flatFeet' }
  ];

  const getDeviationColor = (value: number) => {
    if (value === 0) return 'text-green-600';
    if (value === 1) return 'text-yellow-600';
    if (value === 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getDeviationText = (value: number) => {
    switch (value) {
      case 0: return 'Normal';
      case 1: return 'Leve';
      case 2: return 'Moderado';
      case 3: return 'Severo';
      default: return 'Normal';
    }
  };

  return (
    <div className="space-y-6">
      {/* A. POSTURA ESTÁTICA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-600">A. POSTURA ESTÁTICA</CardTitle>
          <p className="text-sm text-gray-600">Avalie cada desvio postural de 0 (normal) a 3 (severo)</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {posturalDeviations.map((deviation) => (
            <div key={deviation.key} className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">{deviation.label}</Label>
                <span className={`text-sm font-bold ${getDeviationColor(data[deviation.field as keyof PosturalAssessmentData] as number)}`}>
                  {getDeviationText(data[deviation.field as keyof PosturalAssessmentData] as number)}
                </span>
              </div>
              <Slider
                value={[data[deviation.field as keyof PosturalAssessmentData] as number]}
                onValueChange={(value) => handleChange(deviation.field as keyof PosturalAssessmentData, value[0])}
                max={3}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Normal</span>
                <span>Leve</span>
                <span>Moderado</span>
                <span>Severo</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* B. TESTES FUNCIONAIS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-600">B. TESTES FUNCIONAIS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Teste de Adams (Escoliose)</Label>
              <Select 
                value={data.adamsTest} 
                onValueChange={(value) => handleChange('adamsTest', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Resultado do teste" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="negative">Negativo</SelectItem>
                  <SelectItem value="positive">Positivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Flexão anterior (Encurtamento isquiotibiais)</Label>
              <Select 
                value={data.anteriorFlexion} 
                onValueChange={(value) => handleChange('anteriorFlexion', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Resultado do teste" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="limited">Limitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Single-leg stance (Equilíbrio)</Label>
              <Select 
                value={data.singleLegStance} 
                onValueChange={(value) => handleChange('singleLegStance', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Resultado do teste" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Bom</SelectItem>
                  <SelectItem value="poor">Ruim</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Agachamento livre (Compensações)</Label>
              <Select 
                value={data.squatPattern} 
                onValueChange={(value) => handleChange('squatPattern', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Resultado do teste" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="compensated">Compensado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OBSERVAÇÕES */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-600">Observações Adicionais</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.observations}
            onChange={(e) => handleChange('observations', e.target.value)}
            placeholder="Observações sobre a avaliação postural..."
            rows={4}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Próximo: Protocolos de Tratamento
        </Button>
      </div>
    </div>
  );
};

export default PosturalEvaluation;
