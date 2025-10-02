import { useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import localforage from 'localforage';
import { supabase } from '@/integrations/supabase/client';
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
  const [debouncedData] = useDebounce(data, debounceMs);

  const saveToLocal = useCallback(async (saveData: any) => {
    try {
      await localforage.setItem(`autosave_${key}`, {
        data: saveData,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Local save failed:', error);
    }
  }, [key]);

  const saveToDatabase = useCallback(async (saveData: any) => {
    try {
      await supabase
        .from('assessment_drafts')
        .upsert({
          evaluation_id: key,
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
  }, [key]);

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
      const { data: dbData } = await supabase
        .from('assessment_drafts')
        .select('draft_data, last_saved')
        .eq('evaluation_id', key)
        .single();

      if (dbData) {
        return dbData.draft_data;
      }

      // Fallback to local storage
      const localData = await localforage.getItem(`autosave_${key}`) as any;
      if (localData) {
        return localData.data;
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
    return null;
  }, [key]);

  const clearDraft = useCallback(async () => {
    try {
      // Clear from database
      await supabase
        .from('assessment_drafts')
        .delete()
        .eq('evaluation_id', key);

      // Clear from local storage
      await localforage.removeItem(`autosave_${key}`);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, [key]);

  return {
    loadDraft,
    clearDraft,
    saveNow: () => performSave(data)
  };
};
