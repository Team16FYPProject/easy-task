import {
    createdResponse,
    internalErrorResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
import { getServerSupabase } from "@/utils/supabase/server";
import { TaskIdParams } from "./types";
import { ProjectIdParams } from "../../types";

export async function PATCH(request: Request, { params: { id, taskId } }: TaskIdParams) {
    const supabase = getServerSupabase();
    const user = (await supabase.auth.getUser())?.data?.user;
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    // destructure task_status from response
    const { task_status } = await request.json();
    // Validate task_status
    if (!task_status || !["TODO", "DOING", "COMPLETE"].includes(task_status)) {
        return internalErrorResponse({
            success: false,
            data: "Invalid task status provided.",
        });
    }
    // update in the database
    const { error } = await supabase
        .from("task")
        .update({ task_status: task_status })
        .eq("task_id", taskId);

    // handle an error
    if (error) {
        console.error(`Error while updating task_status for task ${taskId}`, error);
        return internalErrorResponse({
            success: false,
            data: "Unable to update your task status details.",
        });
    }

    return createdResponse({ success: true, data: "Task updated successfully" });
}
