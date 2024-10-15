import { getServiceSupabase } from "@/utils/supabase/server";

type Achievement =
    | "Early Bird"
    | "Team Player"
    | "Deadline Crusher"
    | "Multitasker"
    | "Time Master"
    | "Time Wizard"
    | "Meeting Maven"
    | "Task Organizer";

export async function increaseAchievementProgress(
    userId: string,
    achievement: Achievement,
    amount: number,
) {
    const serviceSupabase = getServiceSupabase();
    // Get the achievement details from the database
    const { data: achievementData, error: achievementError } = await serviceSupabase
        .from("achievement")
        .select("*")
        .eq("achievement_name", achievement)
        .single();
    if (achievementError) {
        console.error(
            `Unable get achievement data: User Id: ${userId}; Name ${achievement}; Amount:${amount}`,
            achievementError,
        );
        return null;
    }
    const achievementId = achievementData.achievement_id;
    // Get the user's progress with the achievement
    const { data: userAchievement, error: userAchievementError } = await serviceSupabase
        .from("user_achievement")
        .select("*")
        .eq("achievement_id", achievementId)
        .maybeSingle();
    if (userAchievementError) {
        console.error(
            `Unable get user achievement data: User Id: ${userId}; Name ${achievement}; Amount:${amount}`,
            userAchievementError,
        );
        return null;
    }
    // If the user has already completed the achievement, don't do anything else.
    if (userAchievement?.completed === true) return;
    const currentProgress = userAchievement?.progress ?? 0;
    const upsertData: {
        achievement_id: string;
        completed?: boolean | undefined;
        completed_at?: string | null | undefined;
        progress?: number | undefined;
        user_id: string;
    } = {
        user_id: userId,
        achievement_id: achievementId,
        progress: currentProgress + amount,
    };

    if (currentProgress + amount >= achievementData.max_progress) {
        upsertData.progress = achievementData.max_progress;
        upsertData.completed = true;
        upsertData.completed_at = new Date().toISOString();
    }
    const { error } = await serviceSupabase
        .from("user_achievement")
        .upsert(upsertData, { onConflict: "user_id,achievement_id" });
    if (error) {
        console.error(
            `Unable upsert user achievement data: User Id: ${userId}; Name ${achievement}; Amount:${amount}`,
            error,
        );
    }
}

export async function completeAchievement(userId: string, achievement: Achievement) {
    await increaseAchievementProgress(userId, achievement, Number.MAX_SAFE_INTEGER);
}

export async function checkAndUpdateAchievementProgress(userId: string, achievement: Achievement) {
    const serviceSupabase = getServiceSupabase();
    // Get the achievement details from the database
    const { data: achievementData, error: achievementError } = await serviceSupabase
        .from("achievement")
        .select("*")
        .eq("achievement_name", achievement)
        .single();
    if (achievementError) {
        console.error(
            `Unable get achievement data: User Id: ${userId}; Name ${achievement}`,
            achievementError,
        );
        return null;
    }
    switch (achievement) {
        case "Team Player": {
            // Collaborate on X different projects
            const { data, error } = await serviceSupabase
                .from("project_member")
                .select("*")
                .eq("user_id", userId);
            if (error) {
                console.error(error);
                return;
            }
            // If the user is part of the required amount of projects, mark this achievement as completed
            if (data.length >= achievementData.max_progress) {
                await completeAchievement(userId, achievement);
            }
            break;
        }
        case "Multitasker": {
            // Have X tasks in progress simultaneously
            const { data, error } = await serviceSupabase
                .from("task_assignee")
                .select("task_id, task!inner(task_status)")
                .eq("task.task_status", "DOING");
            if (error) {
                console.error(error);
                return;
            }
            // If the user has the required amount of tasks currently marked as 'DOING', mark the achievement as completed
            if (data.length >= achievementData.max_progress) {
                await completeAchievement(userId, achievement);
            }
            break;
        }
        default:
            break;
    }
}
