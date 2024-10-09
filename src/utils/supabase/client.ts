import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/utils/supabase/database.types";

export function getBrowserSupabase() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321/",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "SUPABASE_ANON_KEY",
    );
}
