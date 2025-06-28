
import { Card, CardContent } from '@/components/ui/card';
import CanvasToolbar from './canvas/CanvasToolbar';
import CanvasInfo from './canvas/CanvasInfo';
import FabricCanvasManager from './canvas/FabricCanvasManager';
import SimpleImageViewer from './canvas/SimpleImageViewer';

interface PhotoCanvasProps {
  photo: {
    id: string;
    imageUrl: string;
    measurements: any[];
  };
  clientHeight: number;
  onSaveMeasurements: (measurements: any[]) => void;
  showMeasurements: boolean;
}

const PhotoCanvas = ({ photo, clientHeight, onSaveMeasurements, showMeasurements }: PhotoCanvasProps) => {
  const {
    canvasRef,
    calibrationPixelsPerCm,
    addHorizontalLine,
    addVerticalLine,
    addAngularLine,
    clearCanvas,
    saveMeasurements
  } = FabricCanvasManager({
    photo,
    clientHeight,
    onMeasurementsChange: onSaveMeasurements
  });

  if (!showMeasurements) {
    return <SimpleImageViewer imageUrl={photo.imageUrl} />;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <CanvasToolbar
            onAddHorizontalLine={addHorizontalLine}
            onAddVerticalLine={addVerticalLine}
            onAddAngularLine={addAngularLine}
            onClearCanvas={clearCanvas}
            onSaveMeasurements={saveMeasurements}
          />
          
          <div className="border rounded-lg overflow-hidden bg-white">
            <canvas ref={canvasRef} className="max-w-full" />
          </div>
          
          <CanvasInfo calibrationPixelsPerCm={calibrationPixelsPerCm} />
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoCanvas;
