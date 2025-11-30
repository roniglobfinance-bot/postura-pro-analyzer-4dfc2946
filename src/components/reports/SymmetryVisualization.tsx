/**
 * VISUALIZAÇÃO DE SIMETRIA COM MAPA DE CALOR
 * Exibe análise de simetria bilateral com desvios percentuais
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Scale, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SymmetryAnalysis } from '@/services/symmetryAnalysisService';

interface SymmetryVisualizationProps {
  analysis: SymmetryAnalysis;
  imageUrl?: string;
}

export const SymmetryVisualization = ({ analysis, imageUrl }: SymmetryVisualizationProps) => {
  
  const getSymmetryColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };
  
  const getSymmetryLabel = (percentage: number): string => {
    if (percentage >= 90) return 'Excelente';
    if (percentage >= 75) return 'Bom';
    if (percentage >= 60) return 'Moderado';
    return 'Assimétrico';
  };
  
  const getSideIcon = (side: string) => {
    if (side === 'right') return <TrendingUp className="h-4 w-4 text-blue-500" />;
    if (side === 'left') return <TrendingDown className="h-4 w-4 text-purple-500" />;
    return <Minus className="h-4 w-4 text-green-500" />;
  };
  
  const renderBilateralAnalysis = (
    region: string,
    data: {
      symmetryPercentage: number;
      deviationCm: number;
      side: string;
    }
  ) => {
    const sideLabel = data.side === 'right' ? 'Direito elevado' : (data.side === 'left' ? 'Esquerdo elevado' : 'Equilibrado');
    
    return (
      <div className="space-y-2 p-4 bg-muted/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getSideIcon(data.side)}
            <span className="font-medium">{region}</span>
          </div>
          <Badge variant={data.symmetryPercentage >= 85 ? 'default' : 'destructive'}>
            {data.symmetryPercentage}%
          </Badge>
        </div>
        
        <Progress value={data.symmetryPercentage} className="h-2" />
        
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{getSymmetryLabel(data.symmetryPercentage)}</span>
          <span className={getSymmetryColor(data.symmetryPercentage)}>
            {data.deviationCm > 0 ? `±${data.deviationCm}cm` : 'Simétrico'}
          </span>
        </div>
        
        {data.deviationCm > 0.3 && (
          <p className="text-xs text-muted-foreground mt-1">
            {sideLabel}
          </p>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Análise de Simetria Bilateral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Score Geral */}
          <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
            <div className="text-4xl font-bold mb-2 text-primary">
              {analysis.overallSymmetryScore}%
            </div>
            <p className="text-sm text-muted-foreground">Score Geral de Simetria</p>
            <Badge className="mt-2" variant={analysis.overallSymmetryScore >= 85 ? 'default' : 'secondary'}>
              {getSymmetryLabel(analysis.overallSymmetryScore)}
            </Badge>
          </div>
          
          {/* Vista */}
          <Alert>
            <AlertDescription>
              Vista analisada: <strong>{analysis.viewType === 'anterior' ? 'ANTERIOR' : 'POSTERIOR'}</strong>
            </AlertDescription>
          </Alert>
          
          {/* Análise por Região */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">ANÁLISE POR REGIÃO</h3>
            
            {renderBilateralAnalysis('Ombros', analysis.bilateral.shoulders)}
            {renderBilateralAnalysis('Quadril', analysis.bilateral.hips)}
            {renderBilateralAnalysis('Joelhos', analysis.bilateral.knees)}
            {renderBilateralAnalysis('Tornozelos', analysis.bilateral.ankles)}
          </div>
          
          {/* Mapa de Calor */}
          {imageUrl && analysis.heatmapData.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">MAPA DE CALOR</h3>
              <div className="relative">
                <img 
                  src={imageUrl} 
                  alt="Foto com mapa de calor" 
                  className="w-full h-auto rounded-lg opacity-70"
                />
                <svg 
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ mixBlendMode: 'multiply' }}
                >
                  {analysis.heatmapData.map((point, idx) => (
                    <circle
                      key={idx}
                      cx={point.x}
                      cy={point.y}
                      r="30"
                      fill={point.color}
                      opacity="0.6"
                    />
                  ))}
                </svg>
              </div>
              
              {/* Legenda do mapa de calor */}
              <div className="flex items-center gap-4 text-xs justify-center mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Simétrico</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Leve</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>Moderado</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Alto</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Recomendações */}
          {analysis.recommendations.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">RECOMENDAÇÕES</h3>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, idx) => (
                  <Alert key={idx}>
                    <AlertDescription className="text-sm">{rec}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}
          
        </CardContent>
      </Card>
    </div>
  );
};
