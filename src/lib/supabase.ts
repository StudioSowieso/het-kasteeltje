import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * De app gebruikt één gedeelde huishoudcode. Die gaat als header mee naar Supabase;
 * Row Level Security (kt_has_access) controleert hem op de server.
 * De client wordt pas gemaakt zodra er een code is (nooit tijdens de build).
 */
export function makeClient(code: string): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase-omgevingsvariabelen ontbreken.");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { "x-household-code": code } },
  });
}
