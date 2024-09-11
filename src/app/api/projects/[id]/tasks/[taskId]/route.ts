import {
    internalErrorResponse,
    okResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
import { getServerSupabase, getServiceSupabase } from "@/utils/supabase/server";
import { TaskIdParams } from "./types";
import { getSession } from "@/utils/server/auth.server.utils";

export async function PATCH(request: Request, { params: { id, taskId } }: TaskIdParams) {
    const supabase = getServerSupabase();
    const { user } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }

    const { task_status } = await request.json();

    //proceed with the update
    const { error } = await getServiceSupabase()
        .from("task")
        .update({ task_status: task_status })
        .eq("task_id", taskId)
        .select();

    if (error) {
        console.error(`Error updating task ${taskId}:`, error);
        return internalErrorResponse({
            success: false,
            data: `Unable to update task status. Error: ${error.message}`,
        });
    }
    return okResponse({ success: true });
}
