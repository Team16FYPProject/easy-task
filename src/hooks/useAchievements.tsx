import { useState } from "react";
import { ApiResponse } from "@/utils/types";
import { AchievementsResponse } from "@/app/api/user/achievements/types";
import { useEffectAsync } from "@/hooks/useEffectAsync";

export function useAchievements(userId: string) {
    const [achievements, setAchievements] = useState<AchievementsResponse>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffectAsync(async () => {
        setLoading(true);
        const response = await fetch("/api/user/achievements");
        if (!response.ok) {
            setError("Unable to load achievements. Please refresh and try again");
            return;
        }
        const data: ApiResponse<AchievementsResponse> = await response.json();
        if (!data.success) {
            alert("Unable to load achievements. Please refresh and try again.");
            return;
        }
        setAchievements(data.data);
        setLoading(false);
    }, []);

    return { achievements, loading, error };
}
