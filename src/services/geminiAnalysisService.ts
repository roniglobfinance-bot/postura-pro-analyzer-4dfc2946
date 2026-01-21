import { supabase } from '@/integrations/supabase/client';

export interface GeminiAnalysisRequest {
  images: {
    front?: string;
    back?: string;
    rightProfile?: string;
    leftProfile?: string;
  };
  clientData?: {
    name?: string;
    age?: number;
    height?: number;
    weight?: number;
    complaints?: string;
    traumaHistory?: string;
  };
}

export interface GeminiAnalysisResponse {
  status: 'success' | 'error';
  macro_diagnosis: string;
  postural_archetype: 'Swayback' | 'FlatBack' | 'KyphoLordotic' | 'Normal';
  segments: {
    cervical: { finding: string; deviation_score: number; vector_angle?: number };
    shoulders: { finding: string; asymmetry_side?: 'L' | 'R'; drop_level?: 'low' | 'mid' | 'high' };
    pelvis: { finding: string; tilt?: number };
  };
  myofascial_lines: Array<{ line_name: string; status: 'tight' | 'weak'; impact: string }>;
  recovery_protocol: {
    phase_1_release: string[];
    phase_2_activation: string[];
    phase_3_integration: string[];
  };
  error?: string;
}

/**
 * Analyze posture using Gemini AI via edge function
 */
export async function analyzePostureWithGemini(
  request: GeminiAnalysisRequest
): Promise<GeminiAnalysisResponse> {
  try {
    console.log('Calling Gemini analysis with', Object.keys(request.images).length, 'images');

    const { data, error } = await supabase.functions.invoke('analyze-posture', {
      body: request,
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to analyze posture');
    }

    if (!data) {
      throw new Error('No data returned from analysis');
    }

    console.log('Gemini analysis complete:', data.status);
    return data as GeminiAnalysisResponse;

  } catch (error: any) {
    console.error('Error in Gemini analysis:', error);
    
    // Return a fallback response
    return {
      status: 'error',
      error: error.message || 'Unknown error',
      macro_diagnosis: 'Erro na análise com IA',
      postural_archetype: 'Normal',
      segments: {
        cervical: { finding: 'Análise não disponível', deviation_score: 0 },
        shoulders: { finding: 'Análise não disponível' },
        pelvis: { finding: 'Análise não disponível' }
      },
      myofascial_lines: [],
      recovery_protocol: {
        phase_1_release: [],
        phase_2_activation: [],
        phase_3_integration: []
      }
    };
  }
}

/**
 * Convert local image file to base64 data URL
 */
export async function imageToBase64(imageUrl: string): Promise<string> {
  try {
    // If already a data URL, return as-is
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }

    // If it's a blob URL, fetch and convert
    if (imageUrl.startsWith('blob:')) {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    // For regular URLs, just return (the edge function will handle it)
    return imageUrl;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}

/**
 * Prepare images for Gemini analysis
 */
export async function prepareImagesForAnalysis(
  images: Record<string, string>
): Promise<GeminiAnalysisRequest['images']> {
  const prepared: GeminiAnalysisRequest['images'] = {};

  const imageKeys = ['front', 'back', 'rightProfile', 'leftProfile'] as const;

  for (const key of imageKeys) {
    const imageUrl = images[key];
    if (imageUrl) {
      try {
        prepared[key] = await imageToBase64(imageUrl);
      } catch (error) {
        console.error(`Failed to prepare image ${key}:`, error);
      }
    }
  }

  return prepared;
}
