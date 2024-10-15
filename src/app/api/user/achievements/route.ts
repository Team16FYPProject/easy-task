import {
    badRequestResponse,
    internalErrorResponse,
    okResponse,
} from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";
import { getSession } from "@/utils/server/auth.server.utils";

export async function GET() {
    const { user } = await getSession();
    if (!user) {
        return badRequestResponse({ success: false, data: "Unauthorized" });
    }

    const serviceSupabase = getServiceSupabase();
    const { data, error } = await serviceSupabase
        .from("user_achievement")
        .select("*, achievement!inner(*)")
        .eq("user_id", user.id);
    if (error) {
        return internalErrorResponse({ success: false, data: "Unable to load achievements" });
    }

    return okResponse({
        success: true,
        data: data.map((achievement) => ({
            id: achievement.achievement_id,
            name: achievement.achievement.achievement_name,
            desc: achievement.achievement.achievement_desc,
            icon: achievement.achievement.icon,
            progress: achievement.progress,
            max_progress: achievement.achievement.max_progress,
            completed: achievement.completed,
        })),
    });
}
