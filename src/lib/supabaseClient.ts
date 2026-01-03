import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const rememberKey = "maafusion_remember_me";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

const storage = {
  getItem: (key: string) => {
    try {
      const remember = localStorage.getItem(rememberKey);
      if (remember === "false") {
        return sessionStorage.getItem(key);
      }
      if (remember === "true") {
        return localStorage.getItem(key);
      }
      return localStorage.getItem(key) ?? sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      const remember = localStorage.getItem(rememberKey);
      if (remember === "false") {
        sessionStorage.setItem(key, value);
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
        sessionStorage.removeItem(key);
      }
    } catch {
      // Ignore storage write errors (private mode, quota, etc.)
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {
      // Ignore storage remove errors
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage,
  },
});

export const setRememberPreference = (remember: boolean) => {
  try {
    localStorage.setItem(rememberKey, remember ? "true" : "false");
  } catch {
    // Ignore storage errors
  }
};
