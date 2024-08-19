import { cache } from "react";
import { getServerSupabase } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { User } from "@supabase/auth-js";
import { SupabaseClient } from "@supabase/supabase-js";

export interface Session {
    user: User;
    supabase: SupabaseClient;
}

export const getSession = cache(async (): Promise<Session> => {
    const supabase = getServerSupabase();
    const user = (await supabase.auth.getUser())?.data?.user;

    if (!user) {
        redirect("/login");
    }

    return { user, supabase };
});
