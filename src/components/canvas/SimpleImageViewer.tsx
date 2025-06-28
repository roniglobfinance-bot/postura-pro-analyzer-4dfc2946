
interface SimpleImageViewerProps {
  imageUrl: string;
}

const SimpleImageViewer = ({ imageUrl }: SimpleImageViewerProps) => {
  return (
    <div className="text-center p-8">
      <img 
        src={imageUrl} 
        alt="Foto postural" 
        className="max-w-full h-auto mx-auto rounded-lg shadow-md"
        style={{ maxHeight: '600px' }}
      />
    </div>
  );
};

export default SimpleImageViewer;
