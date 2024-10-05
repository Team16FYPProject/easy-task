import { getSession } from "@/utils/server/auth.server.utils";
import {
    internalErrorResponse,
    okResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
import { setProjectSettings } from "@/app/api/projects/utils";
import { ProjectIdParams } from "@/app/api/projects/[id]/types";
import { getServiceSupabase } from "@/utils/supabase/server";

export async function GET(request: Request, { params: { id } }: ProjectIdParams) {
    const session = await getSession();
    if (!session.user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }

    const serviceSupabase = getServiceSupabase();
    const { data: projectData, error: projectError } = await serviceSupabase
        .from("project")
        .select("*")
        .eq("project_id", id)
        .single();
    if (projectError) {
        console.error(projectError);
        return internalErrorResponse({ success: false, data: "Unable to get project details." });
    }

    const { data: memberData, error: memberError } = await serviceSupabase
        .from("project_member")
        .select("profile!inner(*)")
        .eq("project_id", id);
    const members = (memberData ?? []).map((member) => ({ ...member.profile }));
    return okResponse({
        success: true,
        data: {
            project: projectData,
            members: members,
        },
    });
}

export async function PATCH(request: Request, { params: { id } }: ProjectIdParams) {
    const session = await getSession();
    if (!session.user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const data = await request.json();

    const { error } = await getServiceSupabase()
        .from("project")
        .update({
            project_name: data.name,
        })
        .eq("project_id", id);
    if (error) {
        console.error(error);
        return internalErrorResponse({
            success: false,
            data: "Unable to update project settings.",
        });
    }
    return okResponse({ success: true, data: "Project settings updated." });
}

export async function PUT(request: Request, { params: { id } }: ProjectIdParams) {
    const session = await getSession();
    if (!session.user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const data = await request.formData();
    return setProjectSettings(id, data, session, false);
}
