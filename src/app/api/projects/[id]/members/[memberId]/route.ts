import { getSession } from "@/utils/server/auth.server.utils";
import {
    internalErrorResponse,
    okResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";
import { MemberIdParams } from "@/app/api/projects/[id]/members/[memberId]/types";

export async function DELETE(request: Request, { params: { id, memberId } }: MemberIdParams) {
    const session = await getSession();
    if (!session) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }

    const { error } = await getServiceSupabase()
        .from("project_member")
        .delete()
        .eq("user_id", memberId)
        .eq("project_id", id);

    if (error) {
        console.error(error);
        return internalErrorResponse({ success: false, data: "Unable to remove that member" });
    }
    return okResponse({ success: true, data: "Successfully removed that member" });
}
