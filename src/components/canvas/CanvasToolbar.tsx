
import { Button } from '@/components/ui/button';
import { Ruler, Minus, RotateCcw, Save } from 'lucide-react';

interface CanvasToolbarProps {
  onAddHorizontalLine: () => void;
  onAddVerticalLine: () => void;
  onAddAngularLine: () => void;
  onClearCanvas: () => void;
  onSaveMeasurements: () => void;
}

const CanvasToolbar = ({
  onAddHorizontalLine,
  onAddVerticalLine,
  onAddAngularLine,
  onClearCanvas,
  onSaveMeasurements
}: CanvasToolbarProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Button
        variant="outline"
        size="sm"
        onClick={onAddHorizontalLine}
        className="text-red-600 border-red-600 hover:bg-red-50"
      >
        <Minus className="h-4 w-4 mr-2" />
        Linha Horizontal
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onAddVerticalLine}
        className="text-green-600 border-green-600 hover:bg-green-50"
      >
        <Minus className="h-4 w-4 mr-2 rotate-90" />
        Linha Vertical
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onAddAngularLine}
        className="text-blue-600 border-blue-600 hover:bg-blue-50"
      >
        <Ruler className="h-4 w-4 mr-2" />
        Medição Angular
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onClearCanvas}
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Limpar
      </Button>
      <Button
        size="sm"
        onClick={onSaveMeasurements}
        className="bg-green-600 hover:bg-green-700"
      >
        <Save className="h-4 w-4 mr-2" />
        Salvar Medições
      </Button>
    </div>
  );
};

export default CanvasToolbar;
