
import React, { useState, useEffect, useCallback, memo } from 'react';
import { toast } from '@/hooks/use-toast';

// Image compression utility
export const compressImage = (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Falha ao comprimir imagem'));
            }
          },
          'image/jpeg',
          quality
        );
      } else {
        reject(new Error('Falha ao obter contexto do canvas'));
      }
    };

    img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
};

// Error boundary component
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log error to monitoring service
    if ((window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Ops! Algo deu errado
          </h2>
          <p className="text-gray-600 mb-4">
            Ocorreu um erro inesperado. Tente recarregar a página ou entre em contato com o suporte.
          </p>
          <div className="space-x-2">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Recarregar Página
            </button>
            <button 
              onClick={() => this.setState({ hasError: false })} 
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Tentar Novamente
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500">
                Detalhes do erro
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {this.state.error?.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading component with skeleton
export const LoadingSkeleton = memo(() => (
  <div className="space-y-4 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    <div className="h-32 bg-gray-200 rounded"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
  </div>
));

// Custom hooks for performance
export const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useErrorHandler = () => {
  const handleError = useCallback((error: Error, context?: string) => {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    
    toast({
      title: "Erro",
      description: error.message || "Ocorreu um erro inesperado",
      variant: "destructive",
    });

    // Log to monitoring service
    if ((window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }, []);

  return handleError;
};

// Performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 100) { // Log slow renders
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
      
      // Send to analytics
      if ((window as any).gtag) {
        (window as any).gtag('event', 'timing_complete', {
          name: componentName,
          value: Math.round(renderTime)
        });
      }
    };
  });
};

// Image optimization
export const OptimizedImage = memo(({ 
  src, 
  alt, 
  className,
  onLoad,
  onError
}: {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.(new Error('Falha ao carregar imagem'));
  }, [onError]);

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Erro ao carregar imagem</span>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`bg-gray-200 animate-pulse ${className}`} />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : 'block'}`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
    </>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Microinteractions
export const useHoverAnimation = () => {
  const [isHovered, setIsHovered] = useState(false);

  const hoverProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    className: `transition-all duration-200 ${isHovered ? 'transform scale-105 shadow-lg' : ''}`
  };

  return { isHovered, hoverProps };
};

export const useFocusAnimation = () => {
  const [isFocused, setIsFocused] = useState(false);

  const focusProps = {
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    className: `transition-all duration-200 ${isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`
  };

  return { isFocused, focusProps };
};

// Offline detection
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Conexão restaurada",
        description: "Você está online novamente.",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Sem conexão",
        description: "Você está offline. Algumas funcionalidades podem não funcionar.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export default {
  ErrorBoundary,
  LoadingSkeleton,
  OptimizedImage,
  compressImage,
  useDebounce,
  useErrorHandler,
  usePerformanceMonitor,
  useHoverAnimation,
  useFocusAnimation,
  useOnlineStatus
};
