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

export async function PATCH(request: Request, { params: { taskId } }: TaskIdParams) {
    const { user } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const data = await request.json();
    // Update the task in the database and return the newly updated task
    const { data: updateData, error: updateError } = await getServiceSupabase()
        .from("task")
        .update({
            task_name: data.name ?? undefined,
            task_desc: data.desc ?? undefined,
            task_time_spent: data.time_spent ?? undefined,
            task_parent_id: data.parent_id ?? undefined,
            task_status: data.status ?? undefined,
            task_priority: data.priority ?? undefined,
            task_location: data.location ?? undefined,
            task_is_meeting: data.is_meeting ?? undefined,
        })
        .eq("task_id", taskId)
        .select("*")
        .single();
    if (updateError) {
        console.error(updateError);
        return internalErrorResponse({ success: false, data: "Unable to update the task" });
    }
    return okResponse({ success: true, data: updateData });
}
