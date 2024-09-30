import { useState, useEffect } from "react";
import { getBrowserSupabase } from "@/utils/supabase/client";

export function useAchievements(userId: unknown) {
    const [achievements, setAchievements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const supabase = getBrowserSupabase();

    useEffect(() => {
        async function fetchAchievements() {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from("user_achievement_progress")
                    .select("*")
                    .eq("user_id", userId);

                if (error) throw error;
                setAchievements(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (userId) {
            fetchAchievements();
        }
    }, [userId]);

    return { achievements, loading, error };
}
