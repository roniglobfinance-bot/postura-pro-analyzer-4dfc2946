import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const useSupabaseFunctions = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Get user profile with role
  const getUserProfile = async (userId?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_user_profile', {
        user_id: userId || user?.id
      });
      
      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil do usuário",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is teacher
  const isTeacher = async (userId?: string) => {
    try {
      const { data, error } = await supabase.rpc('is_teacher', {
        user_id: userId || user?.id
      });
      
      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking teacher status:', error);
      return false;
    }
  };

  // Check if user is student
  const isStudent = async (userId?: string) => {
    try {
      const { data, error } = await supabase.rpc('is_student', {
        user_id: userId || user?.id
      });
      
      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking student status:', error);
      return false;
    }
  };

  // Get teacher's students
  const getTeacherStudents = async (teacherId?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_teacher_students', {
        teacher_id: teacherId || user?.id
      });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting teacher students:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alunos",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get student's evaluations
  const getStudentEvaluations = async (studentId?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_student_evaluations', {
        student_id: studentId || user?.id
      });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting student evaluations:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as avaliações",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Add student to teacher
  const addStudentToTeacher = async (teacherId: string, studentEmail: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('add_student_to_teacher', {
        teacher_id: teacherId,
        student_email: studentEmail
      });
      
      if (error) throw error;
      
      const result = data?.[0];
      if (result?.success) {
        toast({
          title: "Sucesso",
          description: result.message,
        });
        return { success: true, studentId: result.student_id };
      } else {
        toast({
          title: "Erro",
          description: result?.message || "Erro ao adicionar aluno",
          variant: "destructive"
        });
        return { success: false, message: result?.message };
      }
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o aluno",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Create new evaluation
  const createEvaluation = async (title: string, studentId?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('create_evaluation', {
        p_title: title,
        p_student_id: studentId
      });
      
      if (error) throw error;
      
      const result = data?.[0];
      if (result?.success) {
        toast({
          title: "Sucesso",
          description: result.message,
        });
        return { success: true, evaluationId: result.evaluation_id };
      } else {
        toast({
          title: "Erro",
          description: result?.message || "Erro ao criar avaliação",
          variant: "destructive"
        });
        return { success: false, message: result?.message };
      }
    } catch (error) {
      console.error('Error creating evaluation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a avaliação",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Update evaluation status
  const updateEvaluationStatus = async (evaluationId: string, status: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('update_evaluation_status', {
        evaluation_id: evaluationId,
        new_status: status
      });
      
      if (error) throw error;
      
      const result = data?.[0];
      if (result?.success) {
        toast({
          title: "Sucesso",
          description: result.message,
        });
        return { success: true };
      } else {
        toast({
          title: "Erro",
          description: result?.message || "Erro ao atualizar status",
          variant: "destructive"
        });
        return { success: false, message: result?.message };
      }
    } catch (error) {
      console.error('Error updating evaluation status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getUserProfile,
    isTeacher,
    isStudent,
    getTeacherStudents,
    getStudentEvaluations,
    addStudentToTeacher,
    createEvaluation,
    updateEvaluationStatus
  };
};