import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bug, 
  RefreshCw, 
  Database, 
  User, 
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

const AuthDebug = () => {
  const { 
    user, 
    session, 
    loading, 
    initialized, 
    isAuthenticated, 
    userRole,
    refreshSession 
  } = useAuth();
  
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const runDiagnostics = async () => {
    setTesting(true);
    const results: any = {
      timestamp: new Date().toLocaleString(),
      tests: {}
    };

    try {
      // Test 1: Supabase Connection
      try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        results.tests.supabaseConnection = {
          status: error ? 'fail' : 'pass',
          message: error ? error.message : 'Conexão OK',
          data: data
        };
      } catch (error: any) {
        results.tests.supabaseConnection = {
          status: 'fail',
          message: error.message,
          data: null
        };
      }

      // Test 2: Session Status
      try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        results.tests.sessionStatus = {
          status: error ? 'fail' : 'pass',
          message: error ? error.message : 'Sessão verificada',
          data: {
            hasSession: !!sessionData.session,
            userId: sessionData.session?.user?.id,
            expiresAt: sessionData.session?.expires_at
          }
        };
      } catch (error: any) {
        results.tests.sessionStatus = {
          status: 'fail',
          message: error.message,
          data: null
        };
      }

      // Test 3: Profile Access
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          results.tests.profileAccess = {
            status: error ? 'fail' : 'pass',
            message: error ? error.message : 'Perfil acessível',
            data: data
          };
        } catch (error: any) {
          results.tests.profileAccess = {
            status: 'fail',
            message: error.message,
            data: null
          };
        }
      } else {
        results.tests.profileAccess = {
          status: 'skip',
          message: 'Usuário não logado',
          data: null
        };
      }

      // Test 4: RLS Policies
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('count');
          
        results.tests.rlsPolicies = {
          status: error ? 'fail' : 'pass',
          message: error ? `RLS bloqueando: ${error.message}` : 'RLS funcionando',
          data: { count: data?.length || 0 }
        };
      } catch (error: any) {
        results.tests.rlsPolicies = {
          status: 'fail',
          message: error.message,
          data: null
        };
      }

    } catch (error: any) {
      results.error = error.message;
    }

    setTestResults(results);
    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'skip':
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pass: 'default',
      fail: 'destructive',
      skip: 'secondary'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status.toUpperCase()}</Badge>;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Bug className="h-4 w-4" />
          Debug de Autenticação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado Atual */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Usuário:</span>
              <Badge variant={user ? 'default' : 'secondary'}>
                {user ? '✓' : '✗'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Sessão:</span>
              <Badge variant={session ? 'default' : 'secondary'}>
                {session ? '✓' : '✗'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Carregando:</span>
              <Badge variant={loading ? 'destructive' : 'default'}>
                {loading ? '✓' : '✗'}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Inicializado:</span>
              <Badge variant={initialized ? 'default' : 'secondary'}>
                {initialized ? '✓' : '✗'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Autenticado:</span>
              <Badge variant={isAuthenticated ? 'default' : 'secondary'}>
                {isAuthenticated ? '✓' : '✗'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Role:</span>
              <Badge variant="outline" className="text-xs">
                {userRole || 'N/A'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Dados do Usuário */}
        {user && (
          <div className="bg-gray-50 p-3 rounded text-xs">
            <strong>Dados do Usuário:</strong>
            <div className="mt-1 space-y-1">
              <div>ID: {user.id}</div>
              <div>Email: {user.email}</div>
              <div>Confirmado: {user.email_confirmed_at ? '✓' : '✗'}</div>
              <div>Criado: {new Date(user.created_at).toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Controles */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={refreshSession}
            disabled={loading}
            className="flex items-center gap-1 text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            Renovar Sessão
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={runDiagnostics}
            disabled={testing}
            className="flex items-center gap-1 text-xs"
          >
            <Database className="h-3 w-3" />
            {testing ? 'Testando...' : 'Diagnosticar'}
          </Button>
        </div>

        {/* Resultados dos Testes */}
        {testResults && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="font-medium text-sm">Resultados dos Testes</span>
              <Badge variant="outline" className="text-xs">
                {testResults.timestamp}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {Object.entries(testResults.tests).map(([testName, result]: [string, any]) => (
                <div key={testName} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{testName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{result.message}</span>
                    {getStatusBadge(result.status)}
                  </div>
                </div>
              ))}
            </div>
            
            {testResults.error && (
              <div className="bg-red-50 border border-red-200 p-2 rounded text-xs text-red-800">
                <strong>Erro geral:</strong> {testResults.error}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthDebug;