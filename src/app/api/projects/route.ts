import { setProjectSettings } from "@/app/api/projects/utils";
import { getSession } from "@/utils/server/auth.server.utils";
import { okResponse, unauthorizedResponse } from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";
import { increaseAchievementProgress } from "@/utils/server/achievements.utils";

/**
 * Get all the user's projects
 */
export async function GET() {
    const { user } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }

    const supabase = getServiceSupabase();
    const { data: memberData, error: memberError } = await supabase
        .from("project_member")
        .select("project_id")
        .eq("user_id", user.id);

    if (memberError) {
        console.error(`Unable to fetch member data for user ${user.id}`, memberError);
        return okResponse({ success: true, projects: [] });
    }

    const { data: projectData, error: projectError } = await supabase
        .from("project")
        .select("*")
        .in(
            "project_id",
            memberData!.map((data) => data.project_id),
        );
    return okResponse({ success: true, projects: projectData });
}

/**
 * Create a new project
 */
export async function POST(request: Request) {
    const session = await getSession();
    if (!session.user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const data = await request.formData();
    // When a user creates a new project, increase their progress on the Team Player achievement.
    void increaseAchievementProgress(session.user.id, "Team Player", 1);
    return setProjectSettings(null, data, session, true);
}
