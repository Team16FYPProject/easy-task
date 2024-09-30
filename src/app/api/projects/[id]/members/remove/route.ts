import { ProjectIdParams } from "@/app/api/projects/[id]/types";
import { getSession } from "@/utils/server/auth.server.utils";
import {
    badRequestResponse,
    internalErrorResponse,
    okResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";

export async function POST(request: Request, { params: { id } }: ProjectIdParams) {
    const session = await getSession();
    if (!session) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const { userId } = await request.json();
    if (!userId) {
        return badRequestResponse({ success: false, data: "UserId is a required field" });
    }

    const { error } = await getServiceSupabase()
        .from("project_member")
        .delete()
        .eq("user_id", userId)
        .eq("project_id", id);

    if (error) {
        console.error(error);
        return internalErrorResponse({ success: false, data: "Unable to remove that member" });
    }
    return okResponse({ success: true, data: "Successfully removed that member" });
}
