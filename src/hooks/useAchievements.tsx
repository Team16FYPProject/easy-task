import { useState, useEffect } from "react";
import { getBrowserSupabase } from "@/utils/supabase/client";

export function useAchievements(userId: unknown) {
    const [achievements, setAchievements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError(String(err));
                }
            } finally {
                setLoading(false);
            }
        }

        if (userId) {
            fetchAchievements();
        }
    }, [supabase, userId]);

    return { achievements, loading, error };
}
