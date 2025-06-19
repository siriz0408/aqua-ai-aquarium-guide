
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface AutoSaveConfig {
  key: string;
  delay?: number;
  onSave: (data: any) => Promise<void>;
  enabled?: boolean;
}

export interface AutoSaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  error?: string;
}

export const useAutoSave = <T extends Record<string, any>>(
  data: T,
  config: AutoSaveConfig
) => {
  const { key, delay = 2000, onSave, enabled = true } = config;
  const { toast } = useToast();
  const [status, setStatus] = useState<AutoSaveStatus>({ status: 'idle' });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<T>();
  const isMountedRef = useRef(true);

  // Save to localStorage as backup
  const saveToLocalStorage = useCallback((dataToSave: T) => {
    try {
      localStorage.setItem(`autosave_${key}`, JSON.stringify({
        data: dataToSave,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [key]);

  // Load from localStorage
  const loadFromLocalStorage = useCallback((): T | null => {
    try {
      const saved = localStorage.getItem(`autosave_${key}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.data;
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    return null;
  }, [key]);

  // Clear localStorage backup
  const clearLocalStorage = useCallback(() => {
    try {
      localStorage.removeItem(`autosave_${key}`);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }, [key]);

  // Perform the actual save operation
  const performSave = useCallback(async (dataToSave: T) => {
    if (!isMountedRef.current) return;

    setStatus({ status: 'saving' });
    saveToLocalStorage(dataToSave);

    try {
      await onSave(dataToSave);
      if (isMountedRef.current) {
        setStatus({ status: 'saved', lastSaved: new Date() });
        clearLocalStorage();
        
        // Reset to idle after 3 seconds
        setTimeout(() => {
          if (isMountedRef.current) {
            setStatus(prev => ({ ...prev, status: 'idle' }));
          }
        }, 3000);
      }
    } catch (error) {
      if (isMountedRef.current) {
        const errorMessage = error instanceof Error ? error.message : 'Save failed';
        setStatus({ status: 'error', error: errorMessage });
        
        toast({
          title: "Auto-save failed",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Reset to idle after 5 seconds
        setTimeout(() => {
          if (isMountedRef.current) {
            setStatus(prev => ({ ...prev, status: 'idle' }));
          }
        }, 5000);
      }
    }
  }, [onSave, saveToLocalStorage, clearLocalStorage, toast]);

  // Check if data has actually changed
  const hasDataChanged = useCallback((newData: T, oldData: T | undefined): boolean => {
    if (!oldData) return true;
    return JSON.stringify(newData) !== JSON.stringify(oldData);
  }, []);

  // Debounced save effect
  useEffect(() => {
    if (!enabled) return;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only save if data has actually changed
    if (hasDataChanged(data, previousDataRef.current)) {
      timeoutRef.current = setTimeout(() => {
        performSave(data);
      }, delay);
    }

    // Update previous data reference
    previousDataRef.current = data;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, hasDataChanged, performSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Manual save function
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await performSave(data);
  }, [data, performSave]);

  return {
    status,
    saveNow,
    loadFromLocalStorage,
    clearLocalStorage,
  };
};
