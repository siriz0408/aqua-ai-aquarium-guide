
import { supabase } from '@/integrations/supabase/client';
import { AuthResponse } from '@/types/auth';

export const authService = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { data, error };
    } catch (error: any) {
      return { error };
    }
  },

  async signUp(email: string, password: string, fullName: string, requestAdminAccess: boolean = false): Promise<AuthResponse> {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            request_admin_access: requestAdminAccess
          }
        }
      });

      return { data, error };
    } catch (error: any) {
      return { error };
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getSession() {
    return await supabase.auth.getSession();
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
