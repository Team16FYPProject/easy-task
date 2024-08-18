import { okResponse, unauthorizedResponse } from "@/utils/server/server.responses.utils";
import { getSession } from "@/utils/server/auth.server.utils";
import { setProjectSettings } from "@/app/api/projects/utils";

export async function GET() {
    const { user, supabase } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }

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
        .in("project_id", memberData);
    return okResponse({ success: true, projects: projectData });
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session.user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const data = await request.formData();
    return setProjectSettings(null, data, session, true);
}
