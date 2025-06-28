
interface CanvasInfoProps {
  calibrationPixelsPerCm: number;
}

const CanvasInfo = ({ calibrationPixelsPerCm }: CanvasInfoProps) => {
  return (
    <div className="text-sm text-gray-600 text-center">
      <p>Clique e arraste para mover as linhas. Use as ferramentas acima para adicionar medições.</p>
      <p>Calibração: {calibrationPixelsPerCm.toFixed(2)} pixels/cm (baseado na altura informada)</p>
    </div>
  );
};

export default CanvasInfo;
