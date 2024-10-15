import {
    badRequestResponse,
    internalErrorResponse,
    okResponse,
} from "@/utils/server/server.responses.utils";
import { getServerSupabase } from "@/utils/supabase/server";

export async function GET() {
    const supabase = getServerSupabase();
    const user = (await supabase.auth.getUser())?.data?.user;
    if (!user) {
        return badRequestResponse({ success: false, data: "Unauthorized" });
    }
    const { data, error } = await supabase
        .from("user_achievement")
        .select("achievement_id, achievement!inner(*)")
        .eq("user_id", user.id);
    if (error || !data) {
        return internalErrorResponse({ success: false, data: "Unable to load achievements" });
    }

    return okResponse({
        success: true,
        data: data.map((achievement) => ({
            id: achievement.achievement_id,
            name: achievement.achievement.achievement_name,
            desc: achievement.achievement.achievement_desc,
        })),
    });
}
