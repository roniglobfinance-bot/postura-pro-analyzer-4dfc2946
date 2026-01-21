import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame } from 'lucide-react';

interface TensionZone {
  id: string;
  name: string;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  intensity: number; // 0-100
  myofascialLine?: string;
}

interface HeatmapOverlayProps {
  imageUrl: string;
  tensionZones: TensionZone[];
  showLabels?: boolean;
  className?: string;
}

const HeatmapOverlay = ({ 
  imageUrl, 
  tensionZones, 
  showLabels = true,
  className = ''
}: HeatmapOverlayProps) => {
  const getHeatColor = (intensity: number) => {
    // Color gradient from blue (cold/healthy) to red (hot/tension)
    if (intensity <= 20) return 'rgba(59, 130, 246, 0.4)'; // Blue - healthy
    if (intensity <= 40) return 'rgba(34, 197, 94, 0.4)';  // Green - good
    if (intensity <= 60) return 'rgba(234, 179, 8, 0.5)';  // Yellow - attention
    if (intensity <= 80) return 'rgba(249, 115, 22, 0.6)'; // Orange - concern
    return 'rgba(239, 68, 68, 0.7)'; // Red - high tension
  };

  const getGradientStyle = (zone: TensionZone) => {
    const color = getHeatColor(zone.intensity);
    const size = 30 + (zone.intensity / 100) * 40; // 30-70px based on intensity
    
    return {
      position: 'absolute' as const,
      left: `${zone.x}%`,
      top: `${zone.y}%`,
      width: `${size}px`,
      height: `${size}px`,
      transform: 'translate(-50%, -50%)',
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      borderRadius: '50%',
      pointerEvents: 'none' as const,
    };
  };

  const sortedZones = useMemo(() => {
    return [...tensionZones].sort((a, b) => b.intensity - a.intensity);
  }, [tensionZones]);

  const highTensionZones = sortedZones.filter(z => z.intensity > 60);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Mapa de Tensão Miofascial
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image with Heatmap Overlay */}
        <div className="relative rounded-lg overflow-hidden bg-muted">
          <img 
            src={imageUrl} 
            alt="Análise postural"
            className="w-full h-auto"
          />
          
          {/* Heatmap Overlay */}
          <div className="absolute inset-0">
            {tensionZones.map((zone) => (
              <div 
                key={zone.id}
                style={getGradientStyle(zone)}
                title={`${zone.name}: ${zone.intensity}%`}
              />
            ))}
          </div>

          {/* Optional Labels */}
          {showLabels && tensionZones.map((zone) => (
            zone.intensity > 50 && (
              <div
                key={`label-${zone.id}`}
                className="absolute bg-background/90 px-1.5 py-0.5 rounded text-xs font-medium shadow-sm"
                style={{
                  left: `${zone.x}%`,
                  top: `${zone.y - 8}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                {zone.intensity}%
              </div>
            )
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
          <span className="text-xs text-muted-foreground">Nível de Tensão:</span>
          <div className="flex items-center gap-1">
            <div className="w-12 h-3 rounded" style={{
              background: 'linear-gradient(to right, rgba(59,130,246,0.6), rgba(34,197,94,0.6), rgba(234,179,8,0.6), rgba(249,115,22,0.6), rgba(239,68,68,0.6))'
            }} />
            <span className="text-xs ml-1">Baixo → Alto</span>
          </div>
        </div>

        {/* High Tension Zones List */}
        {highTensionZones.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Zonas de Alta Tensão:</h4>
            <div className="flex flex-wrap gap-2">
              {highTensionZones.map((zone) => (
                <Badge 
                  key={zone.id}
                  variant={zone.intensity > 80 ? 'destructive' : 'secondary'}
                  className="flex items-center gap-1"
                >
                  <span>{zone.name}</span>
                  <span className="text-xs opacity-75">({zone.intensity}%)</span>
                  {zone.myofascialLine && (
                    <span className="text-xs opacity-60">• {zone.myofascialLine}</span>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HeatmapOverlay;
