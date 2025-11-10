import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import SkeletonDetection from './analysis/SkeletonDetection';
import XRayVisualization from './analysis/XRayVisualization';
import DynamicAngleAnalysis from './analysis/DynamicAngleAnalysis';
import Myofascial3DVisualization from './analysis/Myofascial3DVisualization';

const AdvancedPosturalAnalysis = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [skeletonAnalysis, setSkeletonAnalysis] = useState<any>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <Card>
        <CardHeader>
          <CardTitle>Análise Postural Avançada com IA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!selectedImage ? (
              <div className="border-2 border-dashed rounded-lg p-12 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <span className="text-lg font-medium">Fazer upload de foto para análise</span>
                  <p className="text-sm text-muted-foreground mt-2">
                    Clique para selecionar uma imagem
                  </p>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            ) : (
              <Tabs defaultValue="skeleton" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="skeleton">Esqueleto</TabsTrigger>
                  <TabsTrigger value="xray">Raio-X</TabsTrigger>
                  <TabsTrigger value="angles">Ângulos</TabsTrigger>
                  <TabsTrigger value="myofascial">3D Miofascial</TabsTrigger>
                </TabsList>

                <TabsContent value="skeleton" className="space-y-4">
                  <SkeletonDetection
                    imageUrl={selectedImage}
                    onAnalysisComplete={setSkeletonAnalysis}
                  />
                </TabsContent>

                <TabsContent value="xray" className="space-y-4">
                  <XRayVisualization imageUrl={selectedImage} />
                </TabsContent>

                <TabsContent value="angles" className="space-y-4">
                  <DynamicAngleAnalysis imageUrl={selectedImage} />
                </TabsContent>

                <TabsContent value="myofascial" className="space-y-4">
                  <Myofascial3DVisualization imageUrl={selectedImage} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedPosturalAnalysis;
