import { useEffect } from "react";
import { getBrowserSupabase } from "@/utils/supabase/client";
import { useRouter } from "next/router";

export default function Logout() {
    const router = useRouter();

    useEffect(() => {
        (async () => {
            const supabase = getBrowserSupabase();
            await supabase.auth.signOut();
            await router.push("/login");
        })();
    }, []);
    return <p>Logging you out...</p>;
}
