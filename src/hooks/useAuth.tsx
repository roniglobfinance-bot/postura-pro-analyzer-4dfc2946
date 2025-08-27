import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AUTH_CONFIG, translateAuthError } from '@/utils/authConfig';

interface AuthContextType {
  // Estado de autenticação
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  
  // Funções de autenticação
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, fullName: string, role: 'teacher' | 'student') => Promise<AuthResult>;
  signOut: () => Promise<void>;
  
  // Utilitários
  isAuthenticated: boolean;
  userRole: string | null;
  refreshSession: () => Promise<void>;
}

interface AuthResult {
  success: boolean;
  error?: string;
  needsConfirmation?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Função para buscar o perfil do usuário
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.warn('Erro ao buscar perfil:', error);
        return null;
      }
      
      return profile;
    } catch (error) {
      console.warn('Erro ao buscar perfil:', error);
      return null;
    }
  }, []);

  // Função para atualizar estado do usuário
  const updateUserState = useCallback(async (newSession: Session | null) => {
    setSession(newSession);
    setUser(newSession?.user || null);
    
    if (newSession?.user) {
      const profile = await fetchUserProfile(newSession.user.id);
      setUserRole(profile?.role || 'student');
    } else {
      setUserRole(null);
    }
  }, [fetchUserProfile]);

  // Inicialização da autenticação
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔐 Inicializando sistema de autenticação...');
        
        // Obter sessão atual
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
        }
        
        if (mounted) {
          await updateUserState(currentSession);
          setLoading(false);
          setInitialized(true);
          
          console.log('🔐 Autenticação inicializada:', {
            hasSession: !!currentSession,
            userId: currentSession?.user?.id,
            email: currentSession?.user?.email
          });
        }
      } catch (error) {
        console.error('Erro na inicialização da auth:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Listener para mudanças de estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('🔐 Mudança de estado de auth:', event, newSession?.user?.email);
        
        if (mounted) {
          await updateUserState(newSession);
          
          if (event === 'SIGNED_OUT') {
            setLoading(false);
          }
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [updateUserState]);

  // Função de login
  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      
      if (error) {
        console.error('Erro de login:', error);
        return {
          success: false,
          error: translateAuthError(error)
        };
      }
      
      if (data.user) {
        console.log('✅ Login realizado com sucesso:', data.user.email);
        return { success: true };
      }
      
      return {
        success: false,
        error: 'Erro inesperado no login'
      };
      
    } catch (error) {
      console.error('Exceção no login:', error);
      return {
        success: false,
        error: 'Erro de conexão. Verifique sua internet.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Função de registro
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'teacher' | 'student'
  ): Promise<AuthResult> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${AUTH_CONFIG.redirectUrls.signUp}`,
          data: {
            full_name: fullName.trim(),
            role: role
          }
        }
      });
      
      if (error) {
        console.error('Erro de registro:', error);
        return {
          success: false,
          error: translateAuthError(error)
        };
      }
      
      if (data.user) {
        console.log('✅ Registro realizado:', data.user.email);
        
        // Se o usuário foi criado mas precisa confirmar email
        if (!data.session && data.user && !data.user.email_confirmed_at) {
          return {
            success: true,
            needsConfirmation: true
          };
        }
        
        return { success: true };
      }
      
      return {
        success: false,
        error: 'Erro inesperado no registro'
      };
      
    } catch (error) {
      console.error('Exceção no registro:', error);
      return {
        success: false,
        error: 'Erro de conexão. Verifique sua internet.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para renovar sessão
  const refreshSession = async (): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Erro ao renovar sessão:', error);
      } else {
        console.log('✅ Sessão renovada com sucesso');
      }
    } catch (error) {
      console.error('Erro ao renovar sessão:', error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    initialized,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
    userRole,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};