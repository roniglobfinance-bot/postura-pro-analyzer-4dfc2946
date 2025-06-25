
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface PosturalAnalysisProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

const PosturalAnalysisSection = ({ data, onChange }: PosturalAnalysisProps) => {
  const getAngleClassification = (angle: number, normalRange: [number, number]) => {
    if (angle >= normalRange[0] && angle <= normalRange[1]) return { level: 'Normal', color: 'bg-green-100 text-green-800' };
    if (angle < normalRange[0] - 5 || angle > normalRange[1] + 5) return { level: 'Leve', color: 'bg-yellow-100 text-yellow-800' };
    if (angle < normalRange[0] - 10 || angle > normalRange[1] + 10) return { level: 'Moderado', color: 'bg-orange-100 text-orange-800' };
    return { level: 'Grave', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="space-y-6">
      {/* Vista Sagital */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Sagital - Medições Angulares</CardTitle>
          <CardDescription>Ângulos críticos para análise postural lateral</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Ângulo Crânio-Cervical (Normal: 50-60°)</Label>
              <Badge className={getAngleClassification(data.cranioCervicalAngle || 55, [50, 60]).color}>
                {getAngleClassification(data.cranioCervicalAngle || 55, [50, 60]).level}
              </Badge>
            </div>
            <Slider
              value={[data.cranioCervicalAngle || 55]}
              onValueChange={(value) => onChange('cranioCervicalAngle', value[0])}
              max={90}
              min={20}
              step={1}
              className="mb-2"
            />
            <p className="text-sm text-gray-600">Atual: {data.cranioCervicalAngle || 55}°</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Cifose Torácica (Normal: 20-40°)</Label>
              <Badge className={getAngleClassification(data.thoracicKyphosis || 30, [20, 40]).color}>
                {getAngleClassification(data.thoracicKyphosis || 30, [20, 40]).level}
              </Badge>
            </div>
            <Slider
              value={[data.thoracicKyphosis || 30]}
              onValueChange={(value) => onChange('thoracicKyphosis', value[0])}
              max={80}
              min={0}
              step={1}
              className="mb-2"
            />
            <p className="text-sm text-gray-600">Atual: {data.thoracicKyphosis || 30}°</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Lordose Lombar (Normal: 40-60°)</Label>
              <Badge className={getAngleClassification(data.lumbarLordosis || 50, [40, 60]).color}>
                {getAngleClassification(data.lumbarLordosis || 50, [40, 60]).level}
              </Badge>
            </div>
            <Slider
              value={[data.lumbarLordosis || 50]}
              onValueChange={(value) => onChange('lumbarLordosis', value[0])}
              max={90}
              min={10}
              step={1}
              className="mb-2"
            />
            <p className="text-sm text-gray-600">Atual: {data.lumbarLordosis || 50}°</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Inclinação Pélvica (Normal: 8-15°)</Label>
              <Badge className={getAngleClassification(data.pelvicTilt || 12, [8, 15]).color}>
                {getAngleClassification(data.pelvicTilt || 12, [8, 15]).level}
              </Badge>
            </div>
            <Slider
              value={[data.pelvicTilt || 12]}
              onValueChange={(value) => onChange('pelvicTilt', value[0])}
              max={40}
              min={-10}
              step={1}
              className="mb-2"
            />
            <p className="text-sm text-gray-600">Atual: {data.pelvicTilt || 12}°</p>
          </div>
        </CardContent>
      </Card>

      {/* Vista Frontal */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Frontal - Análise de Simetria</CardTitle>
          <CardDescription>Desvios laterais e assimetrias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-3 block">Desnível de Ombros</Label>
            <Slider
              value={[data.shoulderImbalance || 0]}
              onValueChange={(value) => onChange('shoulderImbalance', value[0])}
              max={30}
              min={-30}
              step={1}
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Esquerdo elevado</span>
              <span>Atual: {data.shoulderImbalance || 0}mm</span>
              <span>Direito elevado</span>
            </div>
          </div>

          <div>
            <Label className="text-base font-medium mb-3 block">Escoliose - Ângulo de Cobb</Label>
            <Slider
              value={[data.cobbAngle || 0]}
              onValueChange={(value) => onChange('cobbAngle', value[0])}
              max={50}
              min={0}
              step={1}
              className="mb-2"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Atual: {data.cobbAngle || 0}°</span>
              <Badge className={
                (data.cobbAngle || 0) === 0 ? 'bg-green-100 text-green-800' :
                (data.cobbAngle || 0) < 10 ? 'bg-yellow-100 text-yellow-800' :
                (data.cobbAngle || 0) < 25 ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }>
                {(data.cobbAngle || 0) === 0 ? 'Normal' :
                 (data.cobbAngle || 0) < 10 ? 'Leve' :
                 (data.cobbAngle || 0) < 25 ? 'Moderada' : 'Grave'}
              </Badge>
            </div>
          </div>

          <div>
            <Label className="text-base font-medium mb-3 block">Desnível Pélvico</Label>
            <Slider
              value={[data.pelvicImbalance || 0]}
              onValueChange={(value) => onChange('pelvicImbalance', value[0])}
              max={20}
              min={-20}
              step={1}
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Esquerda elevada</span>
              <span>Atual: {data.pelvicImbalance || 0}mm</span>
              <span>Direita elevada</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista Posterior */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Posterior - Análise Escapular</CardTitle>
          <CardDescription>Posição e simetria das escápulas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium">Abdução Escapular</Label>
            <RadioGroup
              value={data.scapularAbduction}
              onValueChange={(value) => onChange('scapularAbduction', value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="scap-normal" />
                <Label htmlFor="scap-normal">Normal (&lt;3cm da coluna)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mild" id="scap-mild" />
                <Label htmlFor="scap-mild">Leve (3-5cm da coluna)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderate" id="scap-moderate" />
                <Label htmlFor="scap-moderate">Moderada (5-7cm da coluna)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="severe" id="scap-severe" />
                <Label htmlFor="scap-severe">Grave (&gt;7cm da coluna)</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-base font-medium">Elevação Escapular</Label>
            <RadioGroup
              value={data.scapularElevation}
              onValueChange={(value) => onChange('scapularElevation', value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="symmetric" id="elev-symmetric" />
                <Label htmlFor="elev-symmetric">Simétricas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="right-elevated" id="elev-right" />
                <Label htmlFor="elev-right">Direita Elevada</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="left-elevated" id="elev-left" />
                <Label htmlFor="elev-left">Esquerda Elevada</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PosturalAnalysisSection;
