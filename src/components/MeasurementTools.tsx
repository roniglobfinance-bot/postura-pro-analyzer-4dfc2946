
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ruler, Triangle, Minus } from 'lucide-react';

interface MeasurementToolsProps {
  view: 'anterior' | 'posterior' | 'lateral-direita' | 'lateral-esquerda';
  measurements: any[];
  onMeasurementsChange: (measurements: any[]) => void;
}

const MeasurementTools = ({ view, measurements, onMeasurementsChange }: MeasurementToolsProps) => {
  const getRecommendedMeasurements = () => {
    switch (view) {
      case 'anterior':
        return [
          { name: 'Alinhamento dos Ombros', type: 'horizontal', description: 'Linha horizontal passando pelos ombros' },
          { name: 'Alinhamento Pélvico', type: 'horizontal', description: 'Linha horizontal passando pelas cristas ilíacas' },
          { name: 'Eixo Corporal Central', type: 'vertical', description: 'Linha vertical central do corpo' },
          { name: 'Ângulo Valgo/Varo Joelhos', type: 'angular', description: 'Ângulo de alinhamento dos joelhos' }
        ];
      case 'posterior':
        return [
          { name: 'Alinhamento dos Ombros', type: 'horizontal', description: 'Linha horizontal passando pelos ombros' },
          { name: 'Alinhamento Pélvico', type: 'horizontal', description: 'Linha horizontal passando pelas cristas ilíacas' },
          { name: 'Eixo da Coluna', type: 'vertical', description: 'Linha vertical da coluna vertebral' },
          { name: 'Escoliose - Curvas laterais', type: 'angular', description: 'Medição das curvas laterais da coluna' }
        ];
      case 'lateral-direita':
      case 'lateral-esquerda':
        return [
          { name: 'Linha de Gravidade', type: 'vertical', description: 'Linha vertical de referência' },
          { name: 'Ângulo Craniovertebral', type: 'angular', description: 'Ângulo entre cabeça e pescoço' },
          { name: 'Cifose Torácica', type: 'angular', description: 'Curvatura da coluna torácica' },
          { name: 'Lordose Lombar', type: 'angular', description: 'Curvatura da coluna lombar' },
          { name: 'Ângulo Pélvico', type: 'angular', description: 'Inclinação pélvica anterior/posterior' }
        ];
      default:
        return [];
    }
  };

  const getMeasurementIcon = (type: string) => {
    switch (type) {
      case 'horizontal':
        return <Minus className="h-4 w-4" />;
      case 'vertical':
        return <Minus className="h-4 w-4 rotate-90" />;
      case 'angular':
        return <Triangle className="h-4 w-4" />;
      default:
        return <Ruler className="h-4 w-4" />;
    }
  };

  const getMeasurementColor = (type: string) => {
    switch (type) {
      case 'horizontal':
        return 'bg-red-100 text-red-800';
      case 'vertical':
        return 'bg-green-100 text-green-800';
      case 'angular':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Medições Recomendadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getRecommendedMeasurements().map((measurement, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-full ${getMeasurementColor(measurement.type)}`}>
                  {getMeasurementIcon(measurement.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{measurement.name}</h4>
                  <p className="text-sm text-gray-600">{measurement.description}</p>
                  <Badge variant="outline" className="mt-1">
                    {measurement.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Medições Aplicadas</CardTitle>
        </CardHeader>
        <CardContent>
          {measurements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Ruler className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma medição aplicada ainda</p>
              <p className="text-sm">Use as ferramentas acima para adicionar medições</p>
            </div>
          ) : (
            <div className="space-y-3">
              {measurements.map((measurement, index) => (
                <div key={measurement.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getMeasurementColor(measurement.type)}`}>
                      {getMeasurementIcon(measurement.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {measurement.type === 'horizontal' ? 'Linha Horizontal' :
                         measurement.type === 'vertical' ? 'Linha Vertical' :
                         'Medição Angular'}
                      </p>
                      <p className="text-sm text-gray-600">ID: {measurement.id}</p>
                    </div>
                  </div>
                  <Badge variant="outline">Ativo</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MeasurementTools;
