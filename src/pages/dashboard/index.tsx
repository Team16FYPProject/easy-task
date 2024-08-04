import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/utils/supabase/client";
import { User } from "@supabase/auth-js";
import { useRouter } from "next/router";

export default function Dashboard() {
    const router = useRouter();

    const supabase = getBrowserSupabase();
    const [user, setUser] = useState<User>();

    useEffect(() => {
        (async () => {
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();
            if (error || !user) {
                await router.push("/login");
                return;
            }
            setUser(user);
        })();
    }, [user]);

    if (!user) {
        return <></>;
    }

    return (
        <div>
            Hello {user?.user_metadata?.first_name} ({user?.email})
        </div>
    );
}
