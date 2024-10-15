import { getBrowserSupabase } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export function useAchievements(userId: string) {
    const [achievements, setAchievements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = getBrowserSupabase();

    useEffect(() => {
        async function fetchAchievements() {
            setLoading(true);
            const { data, error } = await supabase
                .from("user_achievement_progress")
                .select("*")
                .eq("user_id", userId);

            if (error) {
                console.error("Error fetching achievements:", error);
                setError(error.message);
            } else {
                setAchievements(data);
            }
            setLoading(false);
        }

        if (userId) {
            fetchAchievements();
        }
    }, [userId]);

    return { achievements, loading, error };
}
