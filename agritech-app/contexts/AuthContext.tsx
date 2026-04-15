'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    profile: any | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ user?: User | null, profile?: any, error: any }>;
    signUp: (email: string, password: string, metadata: any) => Promise<{ error: any }>;
    signOut: (global?: boolean) => Promise<void>;
    updateProfile: (data: any) => Promise<{ error: any }>;
    deleteAccount: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signOut: async () => { },
    updateProfile: async () => ({ error: null }),
    deleteAccount: async () => ({ error: null }),
});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchProfile = useCallback(async (userId: string) => {
        try {
            // Check 'users' table (KRUSHIT standard)
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // Silently return, use user_metadata as fallback in UI
                return;
            }
            setProfile(data);
        } catch (err) {
            // Never throw from a background data fetch
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        async function getSession() {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user.id);
                }
                setLoading(false);
            }
        }

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    const signIn = useCallback(async (email: string, password: string) => {

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            
            if (error) {
                console.error("Supabase Login Error:", error.message, error.status);
                return { user: null, profile: null, error };
            }

            console.log("Supabase Login Success for:", data.user?.email);
            // Re-fetch to wait for profile
            const { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).single();
            return { user: data.user, profile, error: null };
        } catch (err: any) {
            console.error("Authentication Service Exception:", err);
            return { user: null, profile: null, error: { message: 'Authentication Service Unavailable or CORS block' } };
        }
    }, [fetchProfile]);

    const signUp = useCallback(async (email: string, password: string, metadata: any) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                },
            });

            if (error) {
                console.error("Supabase SignUp Error:", error.message);
                return { error };
            }

            // Fallback: If trigger is missing, manually insert into 'users' table
            if (data.user) {
                const { error: profileError } = await supabase.from('users').insert({
                    id: data.user.id,
                    email: data.user.email,
                    full_name: metadata.full_name || 'New Farmer',
                    language: metadata.language || 'en',
                    role: 'farmer'
                });
                if (profileError) {
                    console.warn("Manual profile insert failed (might already exist or RLS block):", profileError.message);
                }
            }

            return { error: null };
        } catch (err: any) {
            console.error("SignUp Exception:", err);
            return { error: { message: 'Registration failed. Check network.' } };
        }
    }, []);

    const signOut = useCallback(async (global: boolean = false) => {
        await supabase.auth.signOut({ scope: global ? 'global' : 'local' });
        setUser(null);
        setProfile(null);
        setSession(null);
        localStorage.removeItem('i18nextLng'); // Clear lang preference on logout? (Optional)
        router.push('/');
    }, [router, user]);

    const updateProfile = useCallback(async (data: any) => {
        if (!user) return { error: { message: 'No user authenticated' } };

        // Optimistic Update: Update local state immediately
        const updatedMetadata = { ...user.user_metadata, ...data };
        const optimisicUser = { ...user, user_metadata: updatedMetadata } as any;
        setUser(optimisicUser);
        setProfile((prev: any) => ({ ...prev, ...data })); // Also update profile state optimistically

        if (session) {
            setSession({ ...session, user: optimisicUser });
        }



        try {
            // 1. Update Auth Metadata
            const { data: { user: updatedUser }, error: authError } = await supabase.auth.updateUser({
                data,
            });

            if (authError) throw authError;

            // 2. Update 'users' table in public schema
            const { error: dbError } = await supabase
                .from('users')
                .update({
                    full_name: data.full_name,
                    phone: data.phone,
                    region: data.region,
                    language: data.language,
                    notifications: data.notifications // Assuming JSONB or similar
                })
                .eq('id', user.id);

            // Re-fetch to be exact, but dbError is fine to catch
            if (!dbError) {
                await fetchProfile(user.id);
            }

            if (updatedUser) {
                setUser(updatedUser);
            }
            return { data: updatedUser, error: null };
        } catch (err: any) {
            console.error("Update profile exception:", err);
            return { error: err };
        }
    }, [user, session, fetchProfile]);

    const deleteAccount = useCallback(async () => {
        if (!user) return { error: { message: 'No user authenticated' } };



        try {
            // Self-deletion for authenticated users (depends on RLS/Postgres policies usually)
            // or just clearing the profile and signing out.
            // supabase.auth.admin.deleteUser matches the requirement but isn't available to client.
            // We'll mark as deleted or delete from public.users and sign out.
            const { error } = await supabase.from('users').delete().eq('id', user.id);
            if (error) throw error;

            await signOut();
            return { error: null };
        } catch (err: any) {
            console.error("Delete account exception:", err);
            return { error: err };
        }
    }, [user, signOut]);

    // Memoize the value object to prevent unnecessary re-renders
    const value = useMemo(() => ({
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        deleteAccount,
    }), [user, profile, session, loading, signIn, signUp, signOut, updateProfile, deleteAccount]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
