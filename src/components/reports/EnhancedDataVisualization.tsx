
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface PosturalData {
  measurement: string;
  value: number;
  normal: number;
  severity: 'normal' | 'leve' | 'moderado' | 'grave';
  improvement?: number;
}

interface EnhancedDataVisualizationProps {
  data: PosturalData[];
  clientName: string;
  evaluationDate: string;
}

const EnhancedDataVisualization = ({ data, clientName, evaluationDate }: EnhancedDataVisualizationProps) => {
  const COLORS = {
    normal: '#22c55e',
    leve: '#eab308',
    moderado: '#f97316',
    grave: '#ef4444'
  };

  const getSeverityColor = (severity: string) => COLORS[severity as keyof typeof COLORS] || '#6b7280';

  const getImprovementIcon = (improvement: number | undefined) => {
    if (!improvement) return null;
    if (improvement > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (improvement < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  // Prepare data for radar chart
  const radarData = data.map(item => ({
    measurement: item.measurement.substring(0, 15),
    score: Math.max(0, 100 - Math.abs(item.value - item.normal)),
    fullMeasurement: item.measurement
  }));

  // Prepare data for bar chart
  const barData = data.map(item => ({
    name: item.measurement.substring(0, 20),
    atual: item.value,
    normal: item.normal,
    desvio: Math.abs(item.value - item.normal)
  }));

  // Distribution of severity levels
  const severityCount = data.reduce((acc, item) => {
    acc[item.severity] = (acc[item.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(severityCount).map(([severity, count]) => ({
    name: severity.charAt(0).toUpperCase() + severity.slice(1),
    value: count,
    color: getSeverityColor(severity)
  }));

  // Calculate overall postural score
  const overallScore = Math.round(
    radarData.reduce((sum, item) => sum + item.score, 0) / radarData.length
  );

  const getScoreCategory = (score: number) => {
    if (score >= 85) return { label: 'Excelente', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 70) return { label: 'Bom', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 55) return { label: 'Regular', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Necessita Atenção', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const scoreCategory = getScoreCategory(overallScore);

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <Card className="print:shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Análise Postural Detalhada</CardTitle>
          <div className="text-sm text-gray-600">
            <p><strong>Cliente:</strong> {clientName}</p>
            <p><strong>Data da Avaliação:</strong> {new Date(evaluationDate).toLocaleDateString('pt-BR')}</p>
          </div>
        </CardHeader>
      </Card>

      {/* Overall Score */}
      <Card className="print:shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pontuação Geral da Postura</span>
            <Badge className={`${scoreCategory.bg} ${scoreCategory.color} text-lg px-4 py-2`}>
              {overallScore}/100
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={overallScore} className="h-3" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Classificação:</span>
              <Badge className={`${scoreCategory.bg} ${scoreCategory.color}`}>
                {scoreCategory.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Measurements Overview */}
      <Card className="print:shadow-none">
        <CardHeader>
          <CardTitle>Resumo das Medições</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{item.measurement}</h4>
                  {item.improvement !== undefined && getImprovementIcon(item.improvement)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{item.value}°</span>
                  <Badge 
                    style={{ 
                      backgroundColor: getSeverityColor(item.severity),
                      color: 'white'
                    }}
                  >
                    {item.severity}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Normal: {item.normal}° | Desvio: {Math.abs(item.value - item.normal)}°
                </div>
                {item.improvement !== undefined && (
                  <div className="text-xs mt-1">
                    <span className={item.improvement > 0 ? 'text-green-600' : 'text-red-600'}>
                      {item.improvement > 0 ? '+' : ''}{item.improvement}° desde última avaliação
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Radar Chart */}
      <Card className="print:shadow-none">
        <CardHeader>
          <CardTitle>Perfil Postural Multidimensional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="measurement" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10 }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart Comparison */}
      <Card className="print:shadow-none">
        <CardHeader>
          <CardTitle>Comparação com Valores Normais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 10 }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="normal" fill="#22c55e" name="Valor Normal" />
                <Bar dataKey="atual" fill="#3b82f6" name="Valor Atual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Severity Distribution */}
      <Card className="print:shadow-none">
        <CardHeader>
          <CardTitle>Distribuição por Severidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-64 w-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {Object.entries(severityCount).map(([severity, count]) => (
                <div key={severity} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: getSeverityColor(severity) }}
                  />
                  <span className="capitalize">{severity}:</span>
                  <Badge variant="secondary">{count} medições</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="print:shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
            Principais Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data
              .filter(item => item.severity !== 'normal')
              .sort((a, b) => {
                const severityOrder = { grave: 4, moderado: 3, leve: 2, normal: 1 };
                return severityOrder[b.severity] - severityOrder[a.severity];
              })
              .slice(0, 5)
              .map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="mt-1">
                    {item.severity === 'grave' ? (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.measurement}</h4>
                    <p className="text-sm text-gray-600">
                      Desvio de {Math.abs(item.value - item.normal)}° detectado. 
                      {item.severity === 'grave' && ' Requer atenção imediata.'}
                      {item.severity === 'moderado' && ' Recomenda-se intervenção.'}
                      {item.severity === 'leve' && ' Monitoramento recomendado.'}
                    </p>
                  </div>
                  <Badge 
                    style={{ 
                      backgroundColor: getSeverityColor(item.severity),
                      color: 'white'
                    }}
                  >
                    {item.severity}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDataVisualization;
