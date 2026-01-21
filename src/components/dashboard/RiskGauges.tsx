import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Shield, Activity } from 'lucide-react';

interface RiskGaugeProps {
  label: string;
  value: number; // 0-100
  color: string;
  icon: React.ReactNode;
}

const RiskGauge = ({ label, value, color, icon }: RiskGaugeProps) => {
  const data = [
    { name: 'value', value: value },
    { name: 'remaining', value: 100 - value }
  ];

  const getRiskLevel = (val: number) => {
    if (val <= 30) return { text: 'Baixo', className: 'text-green-600' };
    if (val <= 60) return { text: 'Moderado', className: 'text-yellow-600' };
    if (val <= 80) return { text: 'Alto', className: 'text-orange-600' };
    return { text: 'Crítico', className: 'text-red-600' };
  };

  const risk = getRiskLevel(value);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={35}
              outerRadius={50}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell fill={color} />
              <Cell fill="hsl(var(--muted))" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold">{value}</div>
          <div className={`text-xs font-medium ${risk.className}`}>{risk.text}</div>
        </div>

        {/* Icon at top */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 p-1.5 bg-background rounded-full shadow-sm">
          {icon}
        </div>
      </div>
      <p className="text-sm font-medium text-center mt-2">{label}</p>
    </div>
  );
};

interface RiskGaugesProps {
  lumbarRisk: number;
  cervicalRisk: number;
  baseRisk: number;
  overallScore?: number;
}

const RiskGauges = ({ lumbarRisk, cervicalRisk, baseRisk, overallScore }: RiskGaugesProps) => {
  const getOverallAssessment = () => {
    const avg = (lumbarRisk + cervicalRisk + baseRisk) / 3;
    if (avg <= 30) return { text: 'Postura Excelente', color: 'text-green-600', bg: 'bg-green-50' };
    if (avg <= 50) return { text: 'Postura Boa', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (avg <= 70) return { text: 'Atenção Necessária', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { text: 'Intervenção Urgente', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const assessment = getOverallAssessment();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Indicadores de Risco Postural
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Assessment */}
        <div className={`p-3 rounded-lg ${assessment.bg}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Avaliação Geral:</span>
            <span className={`font-bold ${assessment.color}`}>{assessment.text}</span>
          </div>
          {overallScore !== undefined && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Score SAARS</span>
                <span className="font-medium">{overallScore}/100</span>
              </div>
              <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                  style={{ width: `${overallScore}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Risk Gauges */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <RiskGauge
            label="Risco Lombar"
            value={lumbarRisk}
            color="hsl(var(--destructive))"
            icon={<AlertTriangle className="h-4 w-4 text-orange-500" />}
          />
          <RiskGauge
            label="Risco Cervical"
            value={cervicalRisk}
            color="hsl(210, 100%, 50%)"
            icon={<Activity className="h-4 w-4 text-blue-500" />}
          />
          <RiskGauge
            label="Risco de Base"
            value={baseRisk}
            color="hsl(280, 100%, 50%)"
            icon={<Shield className="h-4 w-4 text-purple-500" />}
          />
        </div>

        {/* Risk Legend */}
        <div className="flex justify-center gap-4 text-xs pt-2 border-t">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>0-30 Baixo</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>31-60 Moderado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span>61-80 Alto</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>81-100 Crítico</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskGauges;
