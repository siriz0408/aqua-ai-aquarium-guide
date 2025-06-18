
import { useSubscriptionSync } from './useSubscriptionSync';
import { useUserAccessRefresh } from './useUserAccessRefresh';

export const useManualSync = () => {
  const { syncUserSubscription, isLoading: syncLoading } = useSubscriptionSync();
  const { refreshUserAccess, isLoading: refreshLoading } = useUserAccessRefresh();

  return {
    syncUserSubscription,
    refreshUserAccess,
    isLoading: syncLoading || refreshLoading
  };
};

// Re-export the types for convenience
export type { ManualSyncResult } from './types/manualSyncTypes';
