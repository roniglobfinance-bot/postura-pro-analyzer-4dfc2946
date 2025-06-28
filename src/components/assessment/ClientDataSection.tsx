
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User } from 'lucide-react';

interface ClientDataSectionProps {
  data: {
    clientName: string;
    age: string;
    height: string;
    weight: string;
    date: string;
    complaints: string;
  };
  onChange: (field: string, value: any) => void;
}

const ClientDataSection = ({ data, onChange }: ClientDataSectionProps) => {
  return (
    <div className="space-y-4">
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
              value={data.clientName}
              onChange={(e) => onChange('clientName', e.target.value)}
              placeholder="Digite o nome completo"
            />
          </div>
          <div>
            <Label htmlFor="age">Idade</Label>
            <Input
              id="age"
              type="number"
              value={data.age}
              onChange={(e) => onChange('age', e.target.value)}
              placeholder="Anos"
            />
          </div>
          <div>
            <Label htmlFor="height">Altura (cm)</Label>
            <Input
              id="height"
              type="number"
              value={data.height}
              onChange={(e) => onChange('height', e.target.value)}
              placeholder="Ex: 170"
            />
          </div>
          <div>
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={data.weight}
              onChange={(e) => onChange('weight', e.target.value)}
              placeholder="Ex: 70"
            />
          </div>
          <div>
            <Label htmlFor="date">Data da Avaliação</Label>
            <Input
              id="date"
              type="date"
              value={data.date}
              onChange={(e) => onChange('date', e.target.value)}
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
              value={data.complaints}
              onChange={(e) => onChange('complaints', e.target.value)}
              placeholder="Descreva as principais queixas do cliente..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDataSection;
