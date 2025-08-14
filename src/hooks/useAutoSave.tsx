import { useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import localforage from 'localforage';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface AutoSaveOptions {
  key: string;
  data: any;
  onSave?: (data: any) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
}

export const useAutoSave = ({
  key,
  data,
  onSave,
  debounceMs = 2000,
  enabled = true
}: AutoSaveOptions) => {
  const { user } = useAuth();
  const [debouncedData] = useDebounce(data, debounceMs);

  const saveToLocal = useCallback(async (saveData: any) => {
    try {
      await localforage.setItem(`autosave_${key}`, {
        data: saveData,
        timestamp: Date.now(),
        userId: user?.id
      });
    } catch (error) {
      console.error('Local save failed:', error);
    }
  }, [key, user?.id]);

  const saveToDatabase = useCallback(async (saveData: any) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('assessment_drafts')
        .upsert({
          evaluation_id: key,
          user_id: user.id,
          draft_data: saveData,
          last_saved: new Date().toISOString()
        });
    } catch (error) {
      console.error('Database save failed:', error);
      toast({
        title: "Erro no salvamento automático",
        description: "Os dados foram salvos localmente como backup.",
        variant: "destructive"
      });
    }
  }, [key, user?.id]);

  const performSave = useCallback(async (saveData: any) => {
    if (!enabled || !saveData) return;

    // Save locally first (faster)
    await saveToLocal(saveData);
    
    // Then save to database
    await saveToDatabase(saveData);
    
    // Custom save function if provided
    if (onSave) {
      await onSave(saveData);
    }
  }, [enabled, saveToLocal, saveToDatabase, onSave]);

  // Auto-save when data changes
  useEffect(() => {
    if (debouncedData && enabled) {
      performSave(debouncedData);
    }
  }, [debouncedData, enabled, performSave]);

  const loadDraft = useCallback(async () => {
    try {
      // Try database first
      if (user?.id) {
        const { data: dbData } = await supabase
          .from('assessment_drafts')
          .select('draft_data, last_saved')
          .eq('evaluation_id', key)
          .eq('user_id', user.id)
          .single();

        if (dbData) {
          return dbData.draft_data;
        }
      }

      // Fallback to local storage
      const localData = await localforage.getItem(`autosave_${key}`) as any;
      if (localData && localData.userId === user?.id) {
        return localData.data;
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
    return null;
  }, [key, user?.id]);

  const clearDraft = useCallback(async () => {
    try {
      // Clear from database
      if (user?.id) {
        await supabase
          .from('assessment_drafts')
          .delete()
          .eq('evaluation_id', key)
          .eq('user_id', user.id);
      }

      // Clear from local storage
      await localforage.removeItem(`autosave_${key}`);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, [key, user?.id]);

  return {
    loadDraft,
    clearDraft,
    saveNow: () => performSave(data)
  };
};