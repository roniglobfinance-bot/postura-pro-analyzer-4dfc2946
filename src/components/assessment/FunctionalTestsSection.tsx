
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FunctionalTestsSectionProps {
  data: {
    squatPattern: string;
    walkingPattern: string;
    thomasTest: string;
    oberTest: string;
  };
  onChange: (field: string, value: any) => void;
}

const FunctionalTestsSection = ({ data, onChange }: FunctionalTestsSectionProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Avaliação Dinâmica</CardTitle>
          <CardDescription>Análise de movimentos funcionais</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-base font-medium">Padrão de Agachamento</Label>
            <Select value={data.squatPattern} onValueChange={(value) => onChange('squatPattern', value)}>
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
            <Select value={data.walkingPattern} onValueChange={(value) => onChange('walkingPattern', value)}>
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
              value={data.thomasTest}
              onValueChange={(value) => onChange('thomasTest', value)}
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
              value={data.oberTest}
              onValueChange={(value) => onChange('oberTest', value)}
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
    </div>
  );
};

export default FunctionalTestsSection;
