import { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Box, Loader2 } from 'lucide-react';

interface Myofascial3DVisualizationProps {
  imageUrl: string;
}

const Myofascial3DVisualization = ({ imageUrl }: Myofascial3DVisualizationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [is3DActive, setIs3DActive] = useState(false);

  const myofascialLines = [
    { name: 'Linha Lateral', color: '#FF6B6B', points: ['ombro', 'quadril', 'joelho', 'tornozelo'] },
    { name: 'Linha Frontal', color: '#4ECDC4', points: ['testa', 'esterno', 'púbis', 'pé'] },
    { name: 'Linha Posterior', color: '#95E1D3', points: ['occipital', 'sacro', 'calcâneo'] },
    { name: 'Linha Espiral', color: '#F38181', points: ['occipital', 'ombro-oposto', 'quadril-oposto', 'joelho', 'arco-pé'] },
    { name: 'Linha Profunda Frontal', color: '#AA96DA', points: ['língua', 'diafragma', 'psoas', 'pé'] },
    { name: 'Linha dos Braços', color: '#FCBAD3', points: ['pescoço', 'ombro', 'cotovelo', 'mão'] }
  ];

  const generate3DVisualization = () => {
    setIsLoading(true);
    setIs3DActive(true);

    // Simular processamento 3D
    setTimeout(() => {
      initializeThreeJS();
      setIsLoading(false);
    }, 1500);
  };

  const initializeThreeJS = () => {
    const container = containerRef.current;
    if (!container) return;

    // Criar HTML 3D (pseudo-3D usando CSS)
    container.innerHTML = `
      <div style="
        width: 100%;
        height: 500px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 8px;
        position: relative;
        overflow: hidden;
        perspective: 1000px;
      ">
        <div id="body-3d" style="
          width: 300px;
          height: 450px;
          margin: 25px auto;
          position: relative;
          transform-style: preserve-3d;
          animation: rotate3d 20s infinite linear;
        ">
          ${generateBodyModel()}
          ${generateMyofascialLines()}
        </div>
      </div>
      <style>
        @keyframes rotate3d {
          0% { transform: rotateY(0deg) rotateX(5deg); }
          100% { transform: rotateY(360deg) rotateX(5deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      </style>
    `;
  };

  const generateBodyModel = () => {
    return `
      <!-- Cabeça -->
      <div style="
        width: 60px;
        height: 80px;
        background: linear-gradient(180deg, #4a5568 0%, #2d3748 100%);
        border-radius: 30px 30px 20px 20px;
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      "></div>
      
      <!-- Pescoço -->
      <div style="
        width: 30px;
        height: 40px;
        background: #2d3748;
        position: absolute;
        top: 70px;
        left: 50%;
        transform: translateX(-50%);
      "></div>
      
      <!-- Tórax -->
      <div style="
        width: 120px;
        height: 150px;
        background: linear-gradient(180deg, #4a5568 0%, #2d3748 100%);
        border-radius: 60px 60px 20px 20px;
        position: absolute;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      "></div>
      
      <!-- Pelve -->
      <div style="
        width: 100px;
        height: 60px;
        background: #2d3748;
        border-radius: 20px;
        position: absolute;
        top: 240px;
        left: 50%;
        transform: translateX(-50%);
      "></div>
      
      <!-- Perna Esquerda -->
      <div style="
        width: 35px;
        height: 120px;
        background: linear-gradient(180deg, #2d3748 0%, #1a202c 100%);
        border-radius: 15px;
        position: absolute;
        top: 290px;
        left: 40%;
        transform: translateX(-50%);
      "></div>
      
      <!-- Perna Direita -->
      <div style="
        width: 35px;
        height: 120px;
        background: linear-gradient(180deg, #2d3748 0%, #1a202c 100%);
        border-radius: 15px;
        position: absolute;
        top: 290px;
        left: 60%;
        transform: translateX(-50%);
      "></div>
      
      <!-- Braço Esquerdo -->
      <div style="
        width: 25px;
        height: 100px;
        background: linear-gradient(180deg, #4a5568 0%, #2d3748 100%);
        border-radius: 12px;
        position: absolute;
        top: 120px;
        left: 10%;
        transform: rotate(15deg);
      "></div>
      
      <!-- Braço Direito -->
      <div style="
        width: 25px;
        height: 100px;
        background: linear-gradient(180deg, #4a5568 0%, #2d3748 100%);
        border-radius: 12px;
        position: absolute;
        top: 120px;
        right: 10%;
        transform: rotate(-15deg);
      "></div>
    `;
  };

  const generateMyofascialLines = () => {
    return myofascialLines.map((line, index) => `
      <svg style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        animation: pulse 3s infinite;
        animation-delay: ${index * 0.5}s;
      ">
        ${line.name === 'Linha Lateral' ? `
          <path d="M 220 130 Q 240 200, 230 280 T 220 400" 
            stroke="${line.color}" 
            stroke-width="3" 
            fill="none"
            stroke-dasharray="5,5"
          />
        ` : ''}
        ${line.name === 'Linha Frontal' ? `
          <path d="M 150 40 L 150 110 L 150 250 L 150 410" 
            stroke="${line.color}" 
            stroke-width="3" 
            fill="none"
            stroke-dasharray="5,5"
          />
        ` : ''}
        ${line.name === 'Linha Posterior' ? `
          <path d="M 150 50 Q 145 150, 150 250 T 150 400" 
            stroke="${line.color}" 
            stroke-width="3" 
            fill="none"
            stroke-dasharray="5,5"
          />
        ` : ''}
        ${line.name === 'Linha Espiral' ? `
          <path d="M 180 60 Q 100 140, 200 240 Q 250 300, 180 400" 
            stroke="${line.color}" 
            stroke-width="3" 
            fill="none"
            stroke-dasharray="5,5"
          />
        ` : ''}
        ${line.name === 'Linha Profunda Frontal' ? `
          <path d="M 150 70 L 150 180 Q 155 250, 150 400" 
            stroke="${line.color}" 
            stroke-width="4" 
            fill="none"
            opacity="0.8"
          />
        ` : ''}
        ${line.name === 'Linha dos Braços' ? `
          <path d="M 150 110 L 50 140 L 30 220" 
            stroke="${line.color}" 
            stroke-width="2" 
            fill="none"
            stroke-dasharray="3,3"
          />
          <path d="M 150 110 L 250 140 L 270 220" 
            stroke="${line.color}" 
            stroke-width="2" 
            fill="none"
            stroke-dasharray="3,3"
          />
        ` : ''}
      </svg>
    `).join('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Box className="h-5 w-5" />
          Linhas Miofasciais 3D
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!is3DActive ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <img
              src={imageUrl}
              alt="Preview"
              className="max-w-xs rounded-lg opacity-50"
            />
            <Button onClick={generate3DVisualization} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando Modelo 3D...
                </>
              ) : (
                'Gerar Visualização 3D'
              )}
            </Button>
          </div>
        ) : (
          <>
            <div ref={containerRef} className="w-full" />
            
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Linhas Miofasciais:</h3>
              <div className="grid grid-cols-2 gap-2">
                {myofascialLines.map(line => (
                  <div key={line.name} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: line.color }}
                    />
                    <span>{line.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              🔄 O modelo 3D está rotacionando automaticamente para visualização completa das cadeias miofasciais.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Myofascial3DVisualization;
