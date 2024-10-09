import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/utils/supabase/database.types";

export function getBrowserSupabase() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
}
