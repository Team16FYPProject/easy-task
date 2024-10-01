import {
    internalErrorResponse,
    okResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";
import { TaskIdParams } from "./types";
import { getSession } from "@/utils/server/auth.server.utils";

export async function GET(_: Request, { params: { taskId } }: TaskIdParams) {
    const { user } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    // Get the information from the database.
    const { data, error } = await getServiceSupabase()
        .from("task")
        .select("*")
        .eq("task_id", taskId)
        .single();
    if (error) {
        return internalErrorResponse({ success: false, data: "Unable to get task data" });
    }
    return okResponse({ success: true, data: data });
}

export async function PATCH(request: Request, { params: { id, taskId } }: TaskIdParams) {
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
