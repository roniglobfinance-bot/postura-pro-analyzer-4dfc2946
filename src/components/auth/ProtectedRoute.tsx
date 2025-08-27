import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'teacher' | 'student';
}

const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, loading, initialized, isAuthenticated, userRole } = useAuth();
  const location = useLocation();
  const [showTimeout, setShowTimeout] = useState(false);

  // Debug logs
  useEffect(() => {
    console.log('🛡️ ProtectedRoute status:', {
      user: user?.email,
      loading,
      initialized,
      isAuthenticated,
      userRole,
      requireRole,
      path: location.pathname
    });
  }, [user, loading, initialized, isAuthenticated, userRole, requireRole, location.pathname]);

  // Timeout para evitar loading infinito
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading && !initialized) {
        console.warn('🛡️ ProtectedRoute: Loading timeout reached');
        setShowTimeout(true);
      }
    }, 10000); // 10 segundos

    return () => clearTimeout(timer);
  }, [loading, initialized]);

  // Loading state com timeout
  if (loading && !initialized && !showTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Carregando PosturaPro...</p>
          <p className="text-sm text-gray-500 mt-2">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Timeout warning
  if (showTimeout && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="text-center max-w-md">
          <div className="text-yellow-600 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Tempo limite de carregamento</h2>
          <p className="text-gray-600 mb-4">
            A verificação de autenticação está demorando mais que o esperado.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (initialized && !isAuthenticated) {
    console.log('🛡️ User not authenticated, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // Role check
  if (requireRole && userRole && userRole !== requireRole) {
    console.log(`🛡️ User role ${userRole} doesn't match required role ${requireRole}`);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar esta página.
            Esta página requer perfil de {requireRole === 'teacher' ? 'professor' : 'aluno'}.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Success - render protected content
  console.log('🛡️ Access granted, rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;