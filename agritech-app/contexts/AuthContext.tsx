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
    signIn: (email: string, password: string) => Promise<{ error: any }>;
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
        // Skip DB fetch for all mock/demo users consistently
        if (userId.startsWith('mock-user-') || userId.startsWith('d3300000') || userId.startsWith('r4800000')) {
            return;
        }

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
        // DEMO MODE: Allow demo login without Supabase latency
        // Case insensitive for email ease of use
        const normalizedEmail = email.trim().toLowerCase();

        if (normalizedEmail.endsWith('@krushit.com')) {
            // In development/demo mode, we accept ANY @krushit.com account automatically
            const name = normalizedEmail.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
            const mockUser = {
                id: `mock-user-${normalizedEmail.split('@')[0]}`,
                email: normalizedEmail,
                user_metadata: {
                    full_name: name,
                    phone: '+91 99999 99999',
                    region: 'Maharashtra, India',
                    language: 'en',
                    notifications: { disease: true, weather: true, irrigation: true }
                },
                app_metadata: {},
                aud: 'authenticated',
                created_at: new Date().toISOString()
            } as unknown as User;

            // Immediate state update for perceived performance
            setUser(mockUser);
            setProfile({
                id: mockUser.id,
                email: mockUser.email,
                full_name: name,
                phone: '+91 99999 99999',
                region: 'Maharashtra, India',
                language: 'en',
                notifications: { disease: true, weather: true, irrigation: true }
            });
            setSession({ user: mockUser, access_token: 'demo-token-' + Date.now() } as unknown as Session);
            console.log("Mock Login Success for:", normalizedEmail);
            return { error: null };
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            
            if (error) {
                console.error("Supabase Login Error:", error.message, error.status);
                return { error };
            }

            console.log("Supabase Login Success for:", data.user?.email);
            return { error: null };
        } catch (err: any) {
            console.error("Authentication Service Exception:", err);
            return { error: { message: 'Authentication Service Unavailable or CORS block' } };
        }
    }, []);

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
                    language: metadata.language || 'en'
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

        // DEMO MODE: Bypass Supabase for any mock/demo account
        if (user.id.startsWith('mock-user-') || user.id.startsWith('d3300000') || user.id.startsWith('r4800000')) {
            return { data: optimisicUser, error: null };
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

        if (user.id.startsWith('mock-user-') || user.id.startsWith('d3300000') || user.id.startsWith('r4800000')) {
            await signOut();
            return { error: null };
        }

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
