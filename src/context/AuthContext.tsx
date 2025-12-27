import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Location } from '@/types';
import { API_BASE_URL, fetchConfig } from '@/api/config';
import { useToast } from '@/hooks/use-toast';

type AppRole = 'client' | 'staff' | 'admin';

interface UserProfile {
  id: string; // MongoDB _id
  userId: string; // Supabase ID
  name: string;
  email: string;
  phone?: string;
  role: AppRole;
  location?: Location;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string, phone?: string, role?: AppRole, location?: Location) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  demoLogin: (role: 'client' | 'staff-medical' | 'staff-bitbites') => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo credentials
const DEMO_CREDENTIALS = {
  client: { email: 'client@demo.com', password: 'demo123456' },
  'staff-medical': { email: 'staff-med@demo.com', password: 'demo123456' },
  'staff-bitbites': { email: 'staff-bit@demo.com', password: 'demo123456' },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user profile from MongoDB
  const fetchProfile = async (currentUser: User) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}`).catch(err => {
        console.error('Frontend Fetch Error:', err);
        return null;
      });

      if (response && response.ok) {
        const profileData = await response.json();
        return {
          id: profileData.id || profileData._id,
          userId: profileData.userId,
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          role: profileData.role as AppRole,
          location: profileData.location as Location | undefined,
        } as UserProfile;
      }

      // If 404 (User exists in Supabase but not in MongoDB), create it
      // OR if fetch failed (response is null), fallback to metadata temporarily
      if (!response || response.status === 404) {
        console.log('Profile not found in MongoDB or Backend Down, falling back to metadata...');

        if (!response) {
          toast({
            title: "Backend Connection Issue",
            description: "Could not connect to the backend. Using temporary profile data.",
            variant: "destructive",
          });
        }

        const metadata = currentUser.user_metadata;
        const newProfile = {
          userId: currentUser.id,
          email: currentUser.email || '',
          name: metadata.name || 'User',
          role: (metadata.role as AppRole) || 'client',
          phone: metadata.phone || undefined,
          location: metadata.location as Location | undefined,
        };

        // Try to create in Mongo if backend is reachable (i.e. it was a 404)
        if (response && response.status === 404) {
          const createResponse = await fetch(`${API_BASE_URL}/users`, {
            ...fetchConfig,
            method: 'POST',
            body: JSON.stringify(newProfile),
          }).catch(() => null);

          if (createResponse && createResponse.ok) {
            const createdProfile = await createResponse.json();
            return {
              id: createdProfile.id || createdProfile._id,
              userId: createdProfile.userId,
              name: createdProfile.name,
              email: createdProfile.email,
              phone: createdProfile.phone,
              role: createdProfile.role as AppRole,
              location: createdProfile.location as Location | undefined,
            } as UserProfile;
          }
        }

        // Final Fallback: Return a "TEMPORARY" profile constructed from metadata
        // This allows the user to browse/redirect even if backend is dead.
        return {
          id: 'temp-id',
          userId: newProfile.userId,
          name: newProfile.name,
          email: newProfile.email,
          phone: newProfile.phone,
          role: newProfile.role,
          location: newProfile.location,
        } as UserProfile;
      }

      return null;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      toast({
        title: "Profile Load Error",
        description: "An unexpected error occurred while loading your profile. Using temporary data.",
        variant: "destructive",
      });
      // Even in catch, try to fallback
      const metadata = currentUser.user_metadata;
      return {
        id: 'temp-id',
        userId: currentUser.id,
        name: metadata.name || 'User',
        email: currentUser.email || '',
        phone: metadata.phone,
        role: (metadata.role as AppRole) || 'client',
        location: metadata.location as Location | undefined,
      } as UserProfile;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer profile fetch to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user).then(setProfile);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user).then((p) => {
          setProfile(p);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createMongoProfile = async (userId: string, email: string, name: string, role: AppRole, phone?: string, location?: Location) => {
    try {
      await fetch(`${API_BASE_URL}/users`, {
        ...fetchConfig,
        method: 'POST',
        body: JSON.stringify({
          userId,
          email,
          name,
          role,
          phone,
          location
        })
      });
    } catch (e) {
      console.error("Failed to create Mongo Profile", e);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    phone?: string,
    role: AppRole = 'client',
    location?: Location
  ): Promise<{ error: Error | null }> => {
    const redirectUrl = `${window.location.origin}/`;

    // 1. Sign up in Supabase (Auth only)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
          phone, // We still keep metadata in Supabase for convenience/fallback
          role,
          location
        }
      },
    });

    if (error) return { error: new Error(error.message) };

    // 2. Create Profile in MongoDB
    if (data.user) {
      await createMongoProfile(data.user.id, email, name, role, phone, location);
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const demoLogin = async (role: 'client' | 'staff-medical' | 'staff-bitbites'): Promise<{ error: Error | null }> => {
    const credentials = DEMO_CREDENTIALS[role];

    // Try to sign in first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (!signInError) {
      return { error: null };
    }

    // If sign in failed (user doesn't exist), create the demo account
    if (signInError.message.includes('Invalid login credentials')) {
      const demoRole: AppRole = role === 'client' ? 'client' : 'staff';
      const demoLocation: Location | undefined = role === 'staff-medical' ? 'medical' : role === 'staff-bitbites' ? 'bitbites' : undefined;
      const demoName = role === 'client' ? 'Demo Customer' : role === 'staff-medical' ? 'Medical Staff' : 'Bit Bites Staff';

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: demoName,
            role: demoRole,
            location: demoLocation,
          },
        },
      });

      if (signUpError) {
        return { error: new Error(signUpError.message) };
      }

      // Create Profile in MongoDB
      if (data.user) {
        await createMongoProfile(data.user.id, credentials.email, demoName, demoRole, undefined, demoLocation);
      }

      // Auto-confirm is enabled, so try signing in again
      const { error: retryError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      return { error: retryError ? new Error(retryError.message) : null };
    }

    return { error: new Error(signInError.message) };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAuthenticated: !!user,
        isLoading,
        signUp,
        signIn,
        signOut,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
