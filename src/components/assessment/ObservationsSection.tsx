
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface ObservationsSectionProps {
  observations: string;
  onChange: (value: string) => void;
}

const ObservationsSection = ({ observations, onChange }: ObservationsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Observações Adicionais</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Observações importantes, compensações notadas, limitações de mobilidade..."
          value={observations}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[120px]"
        />
      </CardContent>
    </Card>
  );
};

export default ObservationsSection;
