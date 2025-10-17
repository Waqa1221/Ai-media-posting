import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Database } from "./types";
import { cookies } from "next/headers";

interface CookieStore {
  get: (name: string) => { value: string } | undefined;
  set: (options: { name: string; value: string } & CookieOptions) => void;
}

// Updated createClient to be more flexible
export const createClient = (cookieStore?: CookieStore) => {
  // If no cookieStore provided, use the default from next/headers
  const effectiveCookieStore = cookieStore || cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return effectiveCookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            effectiveCookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            effectiveCookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};

// New simplified function for API routes (backward compatible)
export const createApiClient = () => {
  return createClient(); // Automatically uses cookies()
};

// Service role client for background operations (no cookies needed)
export const createServiceRoleClient = () => {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
