import {
    createdResponse,
    internalErrorResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";
// import { TaskIdParams } from "./types";
import { ProjectIdParams } from "../../types";
import { TaskIdParams } from "./types";
import { getSession } from "@/utils/server/auth.server.utils";

export async function PATCH(request: Request, { params: { id, taskId } }: TaskIdParams) {
    console.log(`PATCH request received for project ${id}, task ${taskId}`);

    const supabase = getServiceSupabase();
    const { user } = await getSession();
    // const user = (await supabase.auth.getUser())?.data?.user;
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }

    const { task_status } = await request.json();
    console.log(`Attempting to update task status to: ${task_status}`);

    // Perform a select query first to check if the task exists
    const { data: existingTask, error: selectError } = await supabase
        .from("task")
        .select("*")
        .eq("task_id", taskId)
        .eq("project_id", id)
        .single();

    if (selectError) {
        console.error("Error checking for existing task:", selectError);
        return internalErrorResponse({
            success: false,
            data: `Error checking for existing task: ${selectError.message}`,
        });
    }

    if (!existingTask) {
        console.warn(`No task found with id ${taskId} in project ${id}`);
        return internalErrorResponse({
            success: false,
            data: "No matching task found to update.",
        });
    }

    console.log("Existing task found:", existingTask);

    // If we found the task, proceed with the update
    const { data, error } = await supabase
        .from("task")
        .update({ task_status: task_status })
        .eq("task_id", taskId)
        .eq("project_id", id)
        .select();

    if (error) {
        console.error(`Error updating task ${taskId}:`, error);
        return internalErrorResponse({
            success: false,
            data: `Unable to update task status. Error: ${error.message}`,
        });
    }

    if (data && data.length > 0) {
        console.log(`Task ${taskId} updated successfully:`, data[0]);
        return createdResponse({ success: true, data: data[0] });
    } else {
        console.warn(`No rows updated for task ${taskId}`);
        return internalErrorResponse({
            success: false,
            data: "Task found but not updated. This shouldn't happen.",
        });
    }
}
