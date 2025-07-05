
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Ruler, Save, Calculator, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PosturalMeasurementsProps {
  clientData: any;
  onMeasurementsChange: (measurements: any) => void;
  measurements?: any;
}

interface AngleMeasurement {
  name: string;
  value: number;
  normalRange: [number, number];
  unit: string;
  description: string;
  category: 'sagital' | 'frontal' | 'transversal';
}

const PosturalMeasurements = ({ clientData, onMeasurementsChange, measurements = {} }: PosturalMeasurementsProps) => {
  const [currentMeasurements, setCurrentMeasurements] = useState<Record<string, number>>({
    // Plano Sagital
    cranioCervicalAngle: measurements.cranioCervicalAngle || 55,
    thoracicKyphosis: measurements.thoracicKyphosis || 30,
    lumbarLordosis: measurements.lumbarLordosis || 50,
    pelvicTilt: measurements.pelvicTilt || 12,
    
    // Plano Frontal
    shoulderImbalance: measurements.shoulderImbalance || 0,
    cobbAngle: measurements.cobbAngle || 0,
    pelvicImbalance: measurements.pelvicImbalance || 0,
    
    // Medições Lineares
    headForwardPosition: measurements.headForwardPosition || 0,
    shoulderProtraction: measurements.shoulderProtraction || 0,
    scapularDistance: measurements.scapularDistance || 8,
    
    // Membros Inferiores
    kneeValgusVarus: measurements.kneeValgusVarus || 0,
    ankleDorsiflexion: measurements.ankleDorsiflexion || 15,
    footArchHeight: measurements.footArchHeight || 2.5,
  });

  const [selectedView, setSelectedView] = useState<'sagital' | 'frontal' | 'transversal'>('sagital');

  const angleMeasurements: AngleMeasurement[] = [
    {
      name: 'cranioCervicalAngle',
      value: currentMeasurements.cranioCervicalAngle,
      normalRange: [50, 60],
      unit: '°',
      description: 'Ângulo Crânio-Cervical (CVA)',
      category: 'sagital'
    },
    {
      name: 'thoracicKyphosis',
      value: currentMeasurements.thoracicKyphosis,
      normalRange: [20, 40],
      unit: '°',
      description: 'Cifose Torácica (T1-T12)',
      category: 'sagital'
    },
    {
      name: 'lumbarLordosis',
      value: currentMeasurements.lumbarLordosis,
      normalRange: [40, 60],
      unit: '°',
      description: 'Lordose Lombar (L1-S1)',
      category: 'sagital'
    },
    {
      name: 'pelvicTilt',
      value: currentMeasurements.pelvicTilt,
      normalRange: [8, 15],
      unit: '°',
      description: 'Inclinação Pélvica Anterior',
      category: 'sagital'
    },
    {
      name: 'shoulderImbalance',
      value: currentMeasurements.shoulderImbalance,
      normalRange: [-5, 5],
      unit: 'mm',
      description: 'Desnível de Ombros',
      category: 'frontal'
    },
    {
      name: 'cobbAngle',
      value: currentMeasurements.cobbAngle,
      normalRange: [0, 10],
      unit: '°',
      description: 'Ângulo de Cobb (Escoliose)',
      category: 'frontal'
    },
    {
      name: 'pelvicImbalance',
      value: currentMeasurements.pelvicImbalance,
      normalRange: [-5, 5],
      unit: 'mm',
      description: 'Desnível Pélvico',
      category: 'frontal'
    }
  ];

  const getClassification = (value: number, normalRange: [number, number]) => {
    const [min, max] = normalRange;
    const deviation = Math.max(Math.abs(value - min), Math.abs(value - max));
    
    if (value >= min && value <= max) {
      return { level: 'Normal', color: 'bg-green-100 text-green-800', severity: 0 };
    } else if (deviation <= 10) {
      return { level: 'Leve', color: 'bg-yellow-100 text-yellow-800', severity: 1 };
    } else if (deviation <= 20) {
      return { level: 'Moderado', color: 'bg-orange-100 text-orange-800', severity: 2 };
    } else {
      return { level: 'Grave', color: 'bg-red-100 text-red-800', severity: 3 };
    }
  };

  const calculateSAARSScore = () => {
    let totalScore = 0;
    let maxScore = angleMeasurements.length * 3;
    
    angleMeasurements.forEach(measurement => {
      const classification = getClassification(measurement.value, measurement.normalRange);
      totalScore += (3 - classification.severity);
    });
    
    return Math.round((totalScore / maxScore) * 100);
  };

  const handleMeasurementChange = (name: string, value: number) => {
    const newMeasurements = { ...currentMeasurements, [name]: value };
    setCurrentMeasurements(newMeasurements);
    onMeasurementsChange(newMeasurements);
  };

  const saveMeasurements = () => {
    localStorage.setItem('posturalMeasurements', JSON.stringify(currentMeasurements));
    toast({
      title: "Medições salvas!",
      description: "Todas as medições foram salvas com sucesso.",
    });
  };

  useEffect(() => {
    const savedMeasurements = localStorage.getItem('posturalMeasurements');
    if (savedMeasurements) {
      const parsed = JSON.parse(savedMeasurements);
      setCurrentMeasurements(parsed);
      onMeasurementsChange(parsed);
    }
  }, []);

  const filteredMeasurements = angleMeasurements.filter(m => m.category === selectedView);
  const saarsScore = calculateSAARSScore();

  return (
    <div className="space-y-6">
      {/* Score SAARS */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Score SAARS Atual</h3>
              <p className="text-sm text-gray-600">Baseado nas medições quantitativas</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{saarsScore}</div>
              <div className="text-sm text-gray-500">/ 100 pontos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seletor de Vista */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-blue-600" />
            Medições Posturais Avançadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={selectedView === 'sagital' ? 'default' : 'outline'}
              onClick={() => setSelectedView('sagital')}
              size="sm"
            >
              Plano Sagital
            </Button>
            <Button
              variant={selectedView === 'frontal' ? 'default' : 'outline'}
              onClick={() => setSelectedView('frontal')}
              size="sm"
            >
              Plano Frontal
            </Button>
            <Button
              variant={selectedView === 'transversal' ? 'default' : 'outline'}
              onClick={() => setSelectedView('transversal')}
              size="sm"
            >
              Plano Transversal
            </Button>
          </div>

          <div className="space-y-6">
            {filteredMeasurements.map((measurement) => {
              const classification = getClassification(measurement.value, measurement.normalRange);
              return (
                <div key={measurement.name} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <Label className="text-base font-medium">{measurement.description}</Label>
                      <p className="text-sm text-gray-600">
                        Normal: {measurement.normalRange[0]} - {measurement.normalRange[1]}{measurement.unit}
                      </p>
                    </div>
                    <Badge className={classification.color}>
                      {classification.level}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Slider
                        value={[measurement.value]}
                        onValueChange={(value) => handleMeasurementChange(measurement.name, value[0])}
                        max={measurement.unit === '°' ? 90 : 50}
                        min={measurement.unit === '°' ? 0 : -30}
                        step={0.5}
                        className="mb-2"
                      />
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        value={measurement.value}
                        onChange={(e) => handleMeasurementChange(measurement.name, parseFloat(e.target.value) || 0)}
                        className="text-center"
                      />
                    </div>
                    <div className="text-sm text-gray-600 w-8">
                      {measurement.unit}
                    </div>
                  </div>
                  
                  <Separator />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Medições Lineares Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Medições Lineares Complementares</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Projeção Anterior da Cabeça (cm)</Label>
              <Input
                type="number"
                step="0.1"
                value={currentMeasurements.headForwardPosition}
                onChange={(e) => handleMeasurementChange('headForwardPosition', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Protração de Ombros (cm)</Label>
              <Input
                type="number"
                step="0.1"
                value={currentMeasurements.shoulderProtraction}
                onChange={(e) => handleMeasurementChange('shoulderProtraction', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Distância Escapular (cm)</Label>
              <Input
                type="number"
                step="0.1"
                value={currentMeasurements.scapularDistance}
                onChange={(e) => handleMeasurementChange('scapularDistance', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-between">
        <Button onClick={saveMeasurements} className="bg-green-600 hover:bg-green-700">
          <Save className="h-4 w-4 mr-2" />
          Salvar Medições
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calculator className="h-4 w-4 mr-2" />
            Recalcular Score
          </Button>
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Ver Progresso
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PosturalMeasurements;
