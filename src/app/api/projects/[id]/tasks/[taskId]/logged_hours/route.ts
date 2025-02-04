import { getSession } from "@/utils/server/auth.server.utils";
import {
    internalErrorResponse,
    okResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";
import { TaskIdParams } from "../types";

/**
 * Modify the logged hours for a task
 *
 * @param request The HTTP request
 * @param id The project id
 * @param taskId The task id
 */
export async function PATCH(request: Request, { params: { id, taskId } }: TaskIdParams) {
    const { user } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }

    const { task_logged_hours } = await request.json();

    //proceed with the update
    const { error } = await getServiceSupabase()
        .from("task")
        .update({ task_time_spent: task_logged_hours })
        .eq("task_id", taskId)
        .select();

    if (error) {
        console.error(`Error updating task ${taskId}:`, error);
        return internalErrorResponse({
            success: false,
            data: `Unable to update task logged hours. Error: ${error.message}`,
        });
    }
    return okResponse({ success: true });
}
