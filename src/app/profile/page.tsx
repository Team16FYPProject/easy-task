"use client";

import { getBrowserSupabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffectAsync } from "@/hooks/useEffectAsync";

export default function Logout() {
    const router = useRouter();
    useEffectAsync(async () => {
        const supabase = getBrowserSupabase();
        await supabase.auth.signOut();
        await router.push("/login");
    }, []);
    return <p>Logging you out...</p>;
}
