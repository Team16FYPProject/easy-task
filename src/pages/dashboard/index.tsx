import { useRouter } from "next/router";
import { useEffectAsync } from "@/hooks/useEffectAsync";
import { useUser } from "@/hooks/useUser";

export default function Dashboard() {
    const router = useRouter();
    const { loadingUser, user } = useUser();

    useEffectAsync(async () => {
        if (!loadingUser && !user) {
            await router.push("/login");
            return;
        }
    }, [loadingUser, user]);

    if (!user) {
        return <></>;
    }

    return (
        <div>
            Hello {user?.user_metadata?.first_name} ({user?.email})
        </div>
    );
}
