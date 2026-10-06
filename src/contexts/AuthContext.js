import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const { data: { session }, } = await supabase.auth.getSession();
                if (session?.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();
                    if (profile) {
                        setUser({
                            id: profile.id,
                            email: profile.email,
                            firstName: profile.first_name,
                            lastName: profile.last_name,
                            createdAt: profile.created_at,
                            updatedAt: profile.updated_at,
                        });
                    }
                }
            }
            catch (err) {
                console.error('Auth initialization error:', err);
            }
            finally {
                setLoading(false);
            }
        };
        initializeAuth();
        const { data: { subscription }, } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                if (profile) {
                    setUser({
                        id: profile.id,
                        email: profile.email,
                        firstName: profile.first_name,
                        lastName: profile.last_name,
                        createdAt: profile.created_at,
                        updatedAt: profile.updated_at,
                    });
                }
            }
            else {
                setUser(null);
            }
        });
        return () => subscription.unsubscribe();
    }, []);
    const signUp = async (email, password, firstName, lastName) => {
        setError(null);
        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });
            if (signUpError)
                throw signUpError;
            if (data.user) {
                const { error: profileError } = await supabase.from('profiles').insert([
                    {
                        id: data.user.id,
                        email,
                        first_name: firstName,
                        last_name: lastName,
                    },
                ]);
                if (profileError)
                    throw profileError;
            }
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Registration failed';
            setError(message);
            throw err;
        }
    };
    const signIn = async (email, password) => {
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error)
                throw error;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed';
            setError(message);
            throw err;
        }
    };
    const signOut = async () => {
        setError(null);
        try {
            const { error } = await supabase.auth.signOut();
            if (error)
                throw error;
            setUser(null);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Logout failed';
            setError(message);
            throw err;
        }
    };
    const resetPassword = async (email) => {
        setError(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error)
                throw error;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Password reset failed';
            setError(message);
            throw err;
        }
    };
    const updatePassword = async (token, password) => {
        setError(null);
        try {
            const { error } = await supabase.auth.updateUser({
                password,
            });
            if (error)
                throw error;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Password update failed';
            setError(message);
            throw err;
        }
    };
    return (_jsx(AuthContext.Provider, { value: {
            user,
            loading,
            error,
            signUp,
            signIn,
            signOut,
            resetPassword,
            updatePassword,
        }, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
