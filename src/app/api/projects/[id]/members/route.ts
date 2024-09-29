import { ProjectIdParams } from "@/app/api/projects/[id]/types";
import { getSession } from "@/utils/server/auth.server.utils";
import {
    internalErrorResponse,
    okResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";

export async function GET(_: Request, { params: { id } }: ProjectIdParams) {
    const session = await getSession();
    if (!session) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }

    const supabase = getServiceSupabase();
    const { data: memberData, error: memberError } = await supabase
        .from("project_member")
        .select("user_id")
        .eq("project_id", id);

    if (memberError) {
        console.error(`Unable to fetch member data for team ${id}`, memberError);
        return okResponse({ success: true, users: [] });
    }

    const { data: userData, error: userError } = await supabase
        .from("profile")
        .select("*")
        .in(
            "user_id",
            memberData!.map((data) => data.user_id),
        );
    if (userError) {
        console.error(`Unable to fetch user data for team ${id}`, userError);
        return okResponse({ success: false, users: [] });
    }
    return okResponse({ success: true, users: userData });
}

export async function DELETE(request: Request, { params: { id } }: ProjectIdParams) {
    const session = await getSession();
    if (!session) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }

    const { error } = await getServiceSupabase()
        .from("project_member")
        .delete()
        .eq("user_id", session.user.id)
        .eq("project_id", id);

    if (error) {
        console.error(error);
        return internalErrorResponse({ success: false, data: "Unable to leave that team" });
    }
    return okResponse({ success: true, data: "Successfully left that team" });
}
