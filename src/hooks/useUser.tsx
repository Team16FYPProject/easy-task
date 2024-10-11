import { useEffectAsync } from "@/hooks/useEffectAsync";
import { getBrowserSupabase } from "@/utils/supabase/client";
import { User } from "@supabase/auth-js";
import { useState } from "react";

export const useUser = () => {
    const [loadingUser, setLoadingUser] = useState<boolean>(true);
    const [user, setUser] = useState<User | null>(null);

    useEffectAsync(async () => {
        const supabase = getBrowserSupabase();
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();
        if (error || !user) {
            setUser(null);
        } else {
            setUser(user);
        }
        setLoadingUser(false);
    }, []);

    return { loadingUser, user };
};
