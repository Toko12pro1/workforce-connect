import { supabase } from "../supabaseClient.js";

async function withProfileMetadata(user) {
  if (!user?.id) return user;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("name, account_type")
      .eq("id", user.id)
      .single();
    if (!data) return user;
    return {
      ...user,
      user_metadata: {
        ...user.user_metadata,
        name: user.user_metadata?.name ?? data.name,
        account_type: user.user_metadata?.account_type ?? data.account_type
      }
    };
  } catch {
    return user;
  }
}

/**
 * Sign in with email + password.
 * @returns {{ user: object|null, error: Error|null }}
 */
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { user: null, error };
    return { user: await withProfileMetadata(data.user), error: null };
  } catch (error) {
    return { user: null, error };
  }
}

/**
 * Register a new account in Supabase.
 * @returns {{ user: object|null, error: Error|null }}
 */
export async function signUp(email, password, name) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) return { user: null, error };
    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          email,
          name
        });
      if (profileError) return { user: null, error: profileError };
    }
    return { user: await withProfileMetadata(data.user), error: null };
  } catch (error) {
    return { user: null, error };
  }
}

/**
 * Sign in to the Supabase demo account.
 * Configure VITE_DEMO_EMAIL and VITE_DEMO_PASSWORD for hosted deployments.
 * @returns {{ user: object|null, error: Error|null }}
 */
export async function signInDemo() {
  const email = import.meta.env.VITE_DEMO_EMAIL || "user@example.com";
  const password = import.meta.env.VITE_DEMO_PASSWORD || "demo1234";
  return signIn(email, password);
}

/**
 * Sign out from Supabase.
 */
export async function signOut() {
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
}

/**
 * Get the currently authenticated Supabase user.
 * @returns {Promise<object|null>}
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    return user ? withProfileMetadata(user) : null;
  } catch {
    return null;
  }
}
