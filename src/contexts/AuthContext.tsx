'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database.types';
import { logger } from '@/lib/logger';

type Account = Tables<'accounts'>;
type Profile = Tables<'profiles'>;

interface UserWithAccount extends User {
  account?: Account;
  profile?: Profile;
}

interface AuthContextType {
  user: UserWithAccount | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, profile: { first_name: string; last_name: string; phone?: string }) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithAccount | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchUserAccountAndProfile = async (authUser: User): Promise<UserWithAccount> => {
    try {
      logger.info('Fetching user account and profile data', { userId: authUser.id, email: authUser.email || undefined });

      // Fetch account data
      logger.dbQuery('SELECT', 'accounts', `user_id=${authUser.id.substring(0, 8)}...`);
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (accountError) {
        logger.dbError('SELECT', 'accounts', accountError);
      } else {
        logger.dbSuccess('SELECT', 'accounts');
        if (accountData) {
          logger.info(`Account found - Role: ${accountData.role}, Status: ${accountData.status}`, { userId: authUser.id });
        }
      }

      // Fetch profile data
      logger.dbQuery('SELECT', 'profiles', `user_id=${authUser.id.substring(0, 8)}...`);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        logger.dbError('SELECT', 'profiles', profileError);
      } else {
        logger.dbSuccess('SELECT', 'profiles');
        if (profileData) {
          logger.info(`Profile loaded - Name: ${profileData.first_name} ${profileData.last_name}`, { userId: authUser.id });
        }
      }

      const enrichedUser = {
        ...authUser,
        account: accountData || undefined,
        profile: profileData || undefined,
      };

      logger.success('User data successfully loaded', {
        userId: authUser.id,
        email: authUser.email || undefined,
        data: { hasAccount: !!accountData, hasProfile: !!profileData }
      });

      return enrichedUser;
    } catch (error) {
      logger.error('Error fetching user data', error, { userId: authUser.id, email: authUser.email || undefined });
      return authUser;
    }
  };

  const refreshUserData = async () => {
    logger.info('Refreshing user data');
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession?.user) {
      const enrichedUser = await fetchUserAccountAndProfile(currentSession.user);
      setSession(currentSession);
      setUser(enrichedUser);
      logger.success('User data and session refreshed successfully', { userId: currentSession.user.id });
    } else {
      logger.warn('No authenticated session found during refresh');
    }
  };

  useEffect(() => {
    logger.separator();
    logger.info('Initializing Auth Provider');

    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      try {
        if (session) {
          logger.session('start', session.user.id);
          setSession(session);
          if (session?.user) {
            const enrichedUser = await fetchUserAccountAndProfile(session.user);
            setUser(enrichedUser);
            logger.success('User session initialized', { userId: session.user.id });
          }
        } else {
          logger.info('No active session found');
        }
      } catch (error) {
        logger.error('Error initializing session', error);
      } finally {
        setLoading(false);
        logger.debug('Auth loading state set to false');
      }
    });

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        logger.info(`Auth state changed: ${event}`, {
          userId: session?.user?.id,
          email: session?.user?.email || undefined
        });

        // Handle SIGNED_OUT event immediately
        if (event === 'SIGNED_OUT') {
          logger.signOutStep('SIGNED_OUT event detected - forcing immediate redirect', 'AuthContext');
          setSession(null);
          setUser(null);
          setLoading(false);

          // Force immediate redirect to signin page
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            // Only redirect if not already on signin page
            if (!currentPath.startsWith('/signin')) {
              logger.signOutStep('Redirecting to /signin via window.location', 'AuthContext');
              window.location.href = '/signin';
            }
          }
          return;
        }

        setSession(session);
        if (session?.user) {
          const enrichedUser = await fetchUserAccountAndProfile(session.user);
          setUser(enrichedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        logger.error('Error handling auth state change', error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      logger.debug('Cleaning up Auth Provider subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    logger.separator();
    logger.authAttempt(email, 'signin');

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.authError(email, error.message);
        logger.error('Sign in failed', error, { email });
        return { error };
      }

      logger.success('Authentication successful', { email, userId: data.user?.id });

      if (data.user) {
        // Update last_login_at in accounts table
        logger.dbQuery('UPDATE', 'accounts', 'Updating last_login_at timestamp');
        const { error: updateError } = await supabase
          .from('accounts')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', data.user.id);

        if (updateError) {
          logger.dbError('UPDATE', 'accounts', updateError);
        } else {
          logger.dbSuccess('UPDATE', 'accounts');
        }

        await refreshUserData();

        logger.success('Sign in complete', { email, userId: data.user.id });
        logger.separator();
      }

      return { error: null };
    } catch (error) {
      logger.authError(email, error);
      logger.separator();
      return { error: error as AuthError };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    profile: { first_name: string; last_name: string; phone?: string }
  ) => {
    logger.separator();
    logger.authAttempt(email, 'signup');
    logger.info(`Registration details - Name: ${profile.first_name} ${profile.last_name}`, { email });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        logger.authError(email, error.message);
        logger.error('Sign up failed', error, { email });
        logger.separator();
        return { error };
      }

      if (data.user) {
        logger.success('User created in Supabase Auth', { email, userId: data.user.id });

        // Create account record
        logger.dbQuery('INSERT', 'accounts', 'Creating account record');
        const { error: accountError } = await supabase.from('accounts').insert({
          id: data.user.id,
          email: data.user.email!,
          role: 'reservist',
          status: 'pending',
        });

        if (accountError) {
          logger.dbError('INSERT', 'accounts', accountError);
        } else {
          logger.dbSuccess('INSERT', 'accounts');
        }

        // Create profile record
        logger.dbQuery('INSERT', 'profiles', `Creating profile for ${profile.first_name} ${profile.last_name}`);
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
        });

        if (profileError) {
          logger.dbError('INSERT', 'profiles', profileError);
        } else {
          logger.dbSuccess('INSERT', 'profiles');
        }

        await refreshUserData();

        logger.success('Sign up complete - Account pending approval', { email, userId: data.user.id });
        logger.separator();
      }

      return { error: null };
    } catch (error) {
      logger.authError(email, error);
      logger.separator();
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    const userEmail = user?.email || 'unknown';
    const userId = user?.id;

    logger.separator();
    logger.authAttempt(userEmail, 'signout');
    logger.signOutStep('Step 1: Calling Supabase auth.signOut()', 'AuthContext');

    try {
      // Clear Supabase session
      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.signOutError('Supabase signOut returned error', error, 'AuthContext');
        throw error;
      }

      logger.signOutStep('Step 2: Supabase signOut successful', 'AuthContext');
      logger.signOutStep('Step 3: Clearing local React state', 'AuthContext');

      // Clear local state
      logger.session('end', userId);
      setUser(null);
      setSession(null);

      logger.signOutStep('Step 4: Clearing browser storage', 'AuthContext');

      // Clear any localStorage/sessionStorage related to auth
      if (typeof window !== 'undefined') {
        // Clear any potential cached auth data
        try {
          localStorage.removeItem('supabase.auth.token');
          sessionStorage.clear();
          logger.signOutStep('Step 5: Browser storage cleared', 'AuthContext');
        } catch (storageError) {
          logger.warn('Could not clear browser storage', { context: 'AuthContext' });
        }
      }

      logger.signOutSuccess('AuthContext');
    } catch (error) {
      logger.signOutError('Sign out failed in catch block', error, 'AuthContext');

      // Even if error occurs, clear local state to prevent stuck auth
      logger.warn('Force clearing local state despite error', { context: 'AuthContext' });
      setUser(null);
      setSession(null);

      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
