import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * De app gebruikt één gedeelde huishoudcode. Die gaat als header mee naar Supabase;
 * Row Level Security (kt_has_access) controleert hem op de server.
 * De client wordt pas gemaakt zodra er een code is (nooit tijdens de build).
 */
export function makeClient(code: string): SupabaseClient {
  // Beide waarden zijn publiek (de URL en de publishable key staan sowieso in de browser).
  // Omgevingsvariabelen op Vercel hebben voorrang als ze zijn ingesteld.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mkwwlvazskdtgpnmsblf.supabase.co";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_8WaNqF9Rnctz0xM3ElLlCg_W2PdodfH";
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { "x-household-code": code } },
  });
}
