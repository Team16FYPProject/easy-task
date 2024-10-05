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

    const serviceSupabase = getServiceSupabase();

    const { data: assigneeData, error: assigneeError } = await serviceSupabase
        .from("task_assignee")
        .select("task!inner(project_id, task_id)")
        .eq("task.project_id", id)
        .eq("user_id", memberId);

    if (assigneeError) {
        console.error(assigneeError);
        return internalErrorResponse({ success: false, data: "Unable to remove that member" });
    }

    const { error: deleteError } = await serviceSupabase
        .from("task_assignee")
        .delete()
        .in(
            "task_id",
            (assigneeData ?? []).map((assignee) => assignee.task!.task_id),
        );

    if (deleteError) {
        console.error(deleteError);
        return internalErrorResponse({
            success: false,
            data: "Unable to remove that member. Please try again.",
        });
    }

    const { error } = await serviceSupabase
        .from("project_member")
        .delete()
        .eq("user_id", memberId)
        .eq("project_id", id);

    if (error) {
        console.error(error);
        return internalErrorResponse({ success: false, data: "Unable to remove that member." });
    }
    return okResponse({ success: true, data: "Successfully removed that member" });
}
