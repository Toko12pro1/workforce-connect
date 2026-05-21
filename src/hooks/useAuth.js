import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient.js";
import * as authService from "../services/authService.js";

const AuthContext = createContext(null);

/**
 * Provides auth state to the entire app.
 * Bridges Supabase auth.onAuthStateChange into React state.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety net — never stay stuck on spinner longer than 4 seconds
    const timeout = setTimeout(() => setLoading(false), 4000);

    // getSession() reads from localStorage — instant, no network round-trip
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => {
      clearTimeout(timeout);
      setUser(null);
      setLoading(false);
    });

    // Keep state in sync with Supabase auth events (signIn, signOut, tokenRefresh)
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,

      async signIn(email, password) {
        const result = await authService.signIn(email, password);
        if (result.user) setUser(result.user);
        return result;
      },

      async signUp(email, password, name) {
        const result = await authService.signUp(email, password, name);
        if (result.user) setUser(result.user);
        return result;
      },

      async signInDemo() {
        const result = await authService.signInDemo();
        setUser(result.user);
        return result;
      },

      async signOut() {
        await authService.signOut();
        setUser(null);
      }
    }),
    [user, loading]
  );

  return React.createElement(AuthContext.Provider, { value }, children);
}

/**
 * Access auth state and actions from any component inside AuthProvider.
 * Returns: { user, loading, signIn, signUp, signInDemo, signOut }
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
